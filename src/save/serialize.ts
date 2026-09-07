import type { GameState, MetaProfile } from '@engine';
import { createMetaProfile, META_VERSION } from '@engine';
import { dbDelete, dbGet, dbKeys, dbSet, STORE_META, STORE_SAVES } from './db';
import {
  AUTOSAVE_SLOT,
  CURRENT_VERSION,
  DEFAULT_SETTINGS,
  MAGIC,
  buildPreview,
  checksumOf,
  slotKey,
  type MetaFile,
  type SaveFile,
  type Settings,
  type SlotSummary,
} from './schema';
import { migrateState, UnmigratableSaveError, validateState } from './migrations';

/**
 * Save and load.
 *
 * The contract from ARCHITECTURE §8: never destroy a save that cannot be read. Every load
 * failure returns a `SlotSummary` carrying the raw payload and a human-readable problem, so
 * the save browser can still offer an export.
 */

export function buildSaveFile(state: GameState, slot: number, label: string): SaveFile {
  const payload = {
    magic: MAGIC,
    version: CURRENT_VERSION,
    savedAt: Date.now(),
    slot,
    label,
    preview: buildPreview(state),
    state,
  };
  return { ...payload, checksum: checksumOf(payload.state) } as SaveFile;
}

export async function writeSlot(
  state: GameState,
  slot: number,
  label: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const file = buildSaveFile(state, slot, label);
    const ok = await dbSet(STORE_SAVES, slotKey(slot), file);
    return ok ? { ok } : { ok: false, error: 'Storage refused the write. Is the disk full?' };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export interface LoadResult {
  ok: boolean;
  state?: GameState;
  file?: SaveFile;
  problem?: string;
  raw?: unknown;
  migratedFrom?: number;
}

export async function readSlot(slot: number): Promise<LoadResult | null> {
  const raw = await dbGet<unknown>(STORE_SAVES, slotKey(slot));
  if (!raw) return null;
  return parseSaveFile(raw);
}

export function parseSaveFile(raw: unknown): LoadResult {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, problem: 'The file is empty or not a save.', raw };
  }
  const file = raw as Partial<SaveFile>;
  if (file.magic !== MAGIC) {
    return { ok: false, problem: 'This is not a LAST LIGHT save file.', raw };
  }
  const version = typeof file.version === 'number' ? file.version : 1;

  try {
    const migrated = migrateState(file.state, version);
    const validity = validateState(migrated);
    if (!validity.ok) {
      return { ok: false, problem: `The save is damaged: ${validity.reason}`, raw };
    }
    // A checksum mismatch is a warning rather than a refusal: a hand-edited save that
    // still validates structurally is the player's business.
    const result: LoadResult = {
      ok: true,
      state: migrated,
      file: raw as SaveFile,
      ...(version !== CURRENT_VERSION ? { migratedFrom: version } : {}),
    };
    if (file.checksum && file.checksum !== checksumOf(file.state)) {
      result.problem = 'Checksum mismatch — this file has been modified since it was saved.';
    }
    return result;
  } catch (error) {
    if (error instanceof UnmigratableSaveError) {
      return { ok: false, problem: error.message, raw };
    }
    return {
      ok: false,
      problem: error instanceof Error ? error.message : 'The save could not be read.',
      raw,
    };
  }
}

export async function listSlots(): Promise<SlotSummary[]> {
  const keys = await dbKeys(STORE_SAVES);
  const out: SlotSummary[] = [];
  for (const key of keys) {
    const match = /^slot-(\d+)$/.exec(key);
    if (!match) continue;
    const slot = Number(match[1]);
    const raw = await dbGet<unknown>(STORE_SAVES, key);
    if (!raw) continue;
    const parsed = parseSaveFile(raw);
    const file = raw as Partial<SaveFile>;
    out.push({
      slot,
      label: file.label ?? `Slot ${slot}`,
      savedAt: file.savedAt ?? 0,
      version: file.version ?? 0,
      preview:
        file.preview ??
        {
          day: 0,
          survivors: 0,
          survivorNames: [],
          scenarioId: 'unknown',
          difficultyId: 'unknown',
          seed: '',
          ending: null,
        },
      ...(parsed.ok ? {} : { problem: parsed.problem ?? 'Unreadable.', raw }),
    });
  }
  return out.sort((a, b) => a.slot - b.slot);
}

export async function deleteSlot(slot: number): Promise<boolean> {
  return dbDelete(STORE_SAVES, slotKey(slot));
}

export async function autosave(state: GameState): Promise<void> {
  await writeSlot(state, AUTOSAVE_SLOT, `Day ${state.day}`);
}

/* --------------------------------------------------------------- meta/profile */

const META_KEY = 'profile';

export async function readMeta(): Promise<{ profile: MetaProfile; settings: Settings }> {
  const raw = await dbGet<MetaFile>(STORE_META, META_KEY);
  if (!raw || raw.magic !== MAGIC) {
    return { profile: createMetaProfile(), settings: { ...DEFAULT_SETTINGS } };
  }
  const profile: MetaProfile = { ...createMetaProfile(), ...raw.profile, version: META_VERSION };
  const settings: Settings = { ...DEFAULT_SETTINGS, ...raw.settings };
  return { profile, settings };
}

export async function writeMeta(profile: MetaProfile, settings: Settings): Promise<boolean> {
  const file: MetaFile = { magic: MAGIC, version: META_VERSION, profile, settings };
  return dbSet(STORE_META, META_KEY, file);
}

/* -------------------------------------------------------------- export/import */

/** Wrap a save as a base64 text blob suitable for a downloaded `.lastlight` file. */
export function exportSave(file: SaveFile | unknown): string {
  const json = JSON.stringify(file, null, 0);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `LASTLIGHT1:${btoa(binary)}`;
}

export function importSave(text: string): LoadResult {
  const trimmed = text.trim();
  try {
    let json: string;
    if (trimmed.startsWith('LASTLIGHT1:')) {
      const binary = atob(trimmed.slice('LASTLIGHT1:'.length));
      const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
      json = new TextDecoder().decode(bytes);
    } else if (trimmed.startsWith('{')) {
      // Accept raw JSON too — a player who opened the file in an editor should not be stuck.
      json = trimmed;
    } else {
      return { ok: false, problem: 'That does not look like a LAST LIGHT export.' };
    }
    return parseSaveFile(JSON.parse(json));
  } catch (error) {
    return {
      ok: false,
      problem: error instanceof Error ? `Could not decode the file: ${error.message}` : 'Could not decode the file.',
    };
  }
}

export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
