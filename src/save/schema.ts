import type { GameState, MetaProfile } from '@engine';
import { SAVE_VERSION } from '@engine';
import { DEFAULT_LOCALE, type LocaleId } from '@i18n';

/**
 * The save file envelope.
 *
 * The envelope is versioned separately from the state so a corrupt or future-versioned
 * file can be identified, preserved, and exported without ever being parsed as a
 * `GameState`. Nothing in this module ever deletes a save it cannot read.
 */

export const MAGIC = 'LASTLIGHT';
export const CURRENT_VERSION = SAVE_VERSION;

export const AUTOSAVE_SLOT = 0;
export const SLOT_COUNT = 6;

export interface SavePreview {
  day: number;
  survivors: number;
  survivorNames: string[];
  scenarioId: string;
  difficultyId: string;
  seed: string;
  ending: string | null;
}

export interface SaveFile {
  magic: typeof MAGIC;
  version: number;
  savedAt: number;
  slot: number;
  label: string;
  preview: SavePreview;
  state: GameState;
  checksum: string;
}

export interface SlotSummary {
  slot: number;
  label: string;
  savedAt: number;
  preview: SavePreview;
  version: number;
  /** Set when the file exists but cannot be loaded. */
  problem?: string;
  /** Raw payload, kept so a broken save can still be exported. */
  raw?: unknown;
}

export interface MetaFile {
  magic: typeof MAGIC;
  version: number;
  profile: MetaProfile;
  settings: Settings;
}

export interface Settings {
  /** The interface language. Anything untranslated falls back to English. */
  locale: LocaleId;
  motion: 'full' | 'reduced';
  contrast: 'normal' | 'high';
  textScale: 'small' | 'normal' | 'large' | 'xlarge';
  sound: boolean;
  soundVolume: number;
  guidance: boolean;
  confirmEndDay: boolean;
  /** Show numeric detail on gauges rather than bars alone. */
  numericMode: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  locale: DEFAULT_LOCALE,
  motion: 'full',
  contrast: 'normal',
  textScale: 'normal',
  sound: false,
  soundVolume: 0.6,
  guidance: true,
  confirmEndDay: false,
  numericMode: false,
};

/**
 * A deliberately cheap checksum. It exists to detect truncation and casual tampering of
 * exported files, not to be cryptographically meaningful — the game is local-first and
 * there is nothing to defend against.
 */
export function checksumOf(value: unknown): string {
  const json = JSON.stringify(value);
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < json.length; i += 1) {
    const c = json.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 + c, 0x85ebca6b) >>> 0;
  }
  return `${h1.toString(36)}-${h2.toString(36)}-${json.length.toString(36)}`;
}

export function buildPreview(state: GameState): SavePreview {
  const living = state.survivors.filter((s) => s.alive);
  return {
    day: state.day,
    survivors: living.length,
    survivorNames: living.slice(0, 5).map((s) => s.name),
    scenarioId: state.scenarioId,
    difficultyId: state.difficultyId,
    seed: state.seed,
    ending: state.ending?.endingId ?? null,
  };
}

export function slotKey(slot: number): string {
  return `slot-${slot}`;
}
