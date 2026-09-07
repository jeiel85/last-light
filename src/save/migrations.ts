import type { GameState } from '@engine';
import { CURRENT_VERSION } from './schema';

/**
 * The migration chain.
 *
 * `migrations[n]` transforms a state at version `n` into a state at version `n + 1`.
 * Loading runs every step from the file's version up to `CURRENT_VERSION`. A save that
 * cannot be migrated is never destroyed — `migrateState` throws and the caller preserves
 * the original payload so the player can still export it.
 */

export type Migration = (state: Record<string, unknown>) => Record<string, unknown>;

export const migrations: Record<number, Migration> = {
  /* v1 → v2: expeditions gained an explicit resolution flag and a lore list. */
  1: (state) => {
    const expeditions = Array.isArray(state.expeditions) ? state.expeditions : [];
    return {
      ...state,
      expeditions: expeditions.map((raw) => {
        const e = raw as Record<string, unknown>;
        return {
          ...e,
          resolved: e.resolved ?? true,
          loreFound: e.loreFound ?? [],
          casualties: e.casualties ?? [],
          preparation: e.preparation ?? 0,
          aborted: e.aborted ?? false,
        };
      }),
      activeExpeditionId: state.activeExpeditionId ?? null,
      version: 2,
    };
  },

  /* v2 → v3: guidance state and the per-event seen counter were added. */
  2: (state) => {
    const events = (state.events ?? {}) as Record<string, unknown>;
    return {
      ...state,
      events: {
        history: events.history ?? [],
        cooldowns: events.cooldowns ?? {},
        scheduled: events.scheduled ?? [],
        pending: events.pending ?? [],
        seenCounts: events.seenCounts ?? {},
      },
      guidance: state.guidance ?? { enabled: true, seen: [] },
      lastReport: state.lastReport ?? null,
      idCounter: state.idCounter ?? 1000,
      version: 3,
    };
  },
};

export class UnmigratableSaveError extends Error {
  constructor(
    public readonly fileVersion: number,
    message: string,
  ) {
    super(message);
    this.name = 'UnmigratableSaveError';
  }
}

export function migrateState(raw: unknown, fromVersion: number): GameState {
  if (!raw || typeof raw !== 'object') {
    throw new UnmigratableSaveError(fromVersion, 'The save file does not contain a game state.');
  }
  if (fromVersion > CURRENT_VERSION) {
    throw new UnmigratableSaveError(
      fromVersion,
      `This save was written by a newer version of LAST LIGHT (save v${fromVersion}, this build reads v${CURRENT_VERSION}). Update the game, or export the file and keep it safe.`,
    );
  }

  let state = { ...(raw as Record<string, unknown>) };
  let version = fromVersion;

  while (version < CURRENT_VERSION) {
    const migration = migrations[version];
    if (!migration) {
      throw new UnmigratableSaveError(
        fromVersion,
        `No migration exists from save version ${version} to ${version + 1}.`,
      );
    }
    state = migration(state);
    version += 1;
  }

  state.version = CURRENT_VERSION;
  return state as unknown as GameState;
}

/**
 * Structural validation after migration. This catches files that are the right version but
 * the wrong shape — a truncated download, or something a player edited by hand.
 */
export function validateState(state: unknown): { ok: true } | { ok: false; reason: string } {
  if (!state || typeof state !== 'object') return { ok: false, reason: 'Not an object.' };
  const s = state as Partial<GameState>;
  const required: [string, boolean][] = [
    ['seed', typeof s.seed === 'string'],
    ['day', typeof s.day === 'number' && Number.isFinite(s.day)],
    ['rng', Boolean(s.rng) && typeof s.rng === 'object'],
    ['resources', Boolean(s.resources) && typeof s.resources === 'object'],
    ['survivors', Array.isArray(s.survivors)],
    ['facilities', Array.isArray(s.facilities)],
    ['slots', Array.isArray(s.slots)],
    ['world', Boolean(s.world) && Array.isArray(s.world?.locations)],
    ['events', Boolean(s.events) && Array.isArray(s.events?.pending)],
    ['flags', Boolean(s.flags) && typeof s.flags === 'object'],
    ['stats', Boolean(s.stats) && typeof s.stats === 'object'],
  ];
  const missing = required.filter(([, ok]) => !ok).map(([name]) => name);
  if (missing.length > 0) {
    return { ok: false, reason: `Missing or malformed: ${missing.join(', ')}.` };
  }
  if (s.survivors!.length === 0 && !s.ending) {
    return { ok: false, reason: 'The save contains no survivors and no ending.' };
  }
  return { ok: true };
}
