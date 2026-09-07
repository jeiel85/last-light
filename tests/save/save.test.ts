import { describe, expect, it } from 'vitest';
import { advanceDay, SAVE_VERSION } from '@engine';
import { CURRENT_VERSION, MAGIC, buildPreview, checksumOf } from '@save/schema';
import { UnmigratableSaveError, migrateState, migrations, validateState } from '@save/migrations';
import { buildSaveFile, exportSave, importSave, parseSaveFile } from '@save/serialize';
import { newState, snapshot, stockUp } from '../helpers';

describe('save files', () => {
  it('wraps a state with the envelope the loader expects', () => {
    const state = newState();
    const file = buildSaveFile(state, 2, 'Day 1');
    expect(file.magic).toBe(MAGIC);
    expect(file.version).toBe(CURRENT_VERSION);
    expect(file.slot).toBe(2);
    expect(file.label).toBe('Day 1');
    expect(file.checksum).toBe(checksumOf(state));
    expect(file.preview.survivors).toBe(state.survivors.filter((s) => s.alive).length);
  });

  it('round-trips a played state without loss', () => {
    const state = stockUp(newState());
    advanceDay(state);
    state.events.pending = [];
    const before = snapshot(state);

    const parsed = parseSaveFile(buildSaveFile(state, 0, 'test'));
    expect(parsed.ok).toBe(true);
    expect(parsed.state).toEqual(before);
  });

  it('round-trips through the export text format', () => {
    const state = stockUp(newState());
    const text = exportSave(buildSaveFile(state, 0, 'export'));
    expect(text.startsWith('LASTLIGHT1:')).toBe(true);
    const imported = importSave(text);
    expect(imported.ok).toBe(true);
    expect(imported.state!.seed).toBe(state.seed);
  });

  it('accepts raw JSON too, for a player who opened the file in an editor', () => {
    const state = newState();
    const json = JSON.stringify(buildSaveFile(state, 0, 'raw'));
    expect(importSave(json).ok).toBe(true);
  });

  it('rejects text that is not a save at all, without throwing', () => {
    expect(importSave('hello').ok).toBe(false);
    expect(importSave('LASTLIGHT1:not-base64!!').ok).toBe(false);
    expect(parseSaveFile(null).ok).toBe(false);
    expect(parseSaveFile({ magic: 'SOMETHINGELSE' }).problem).toMatch(/not a LAST LIGHT/i);
  });

  it('flags a tampered file as modified but still lets the player load it', () => {
    const state = newState();
    const file = buildSaveFile(state, 0, 'tampered');
    file.state.day = 99;
    const parsed = parseSaveFile(file);
    expect(parsed.ok).toBe(true);
    expect(parsed.problem).toMatch(/modified/i);
  });

  it('refuses a structurally damaged save and keeps the raw payload for export', () => {
    const file = buildSaveFile(newState(), 0, 'broken') as unknown as Record<string, unknown>;
    (file.state as Record<string, unknown>).survivors = 'not an array';
    const parsed = parseSaveFile(file);
    expect(parsed.ok).toBe(false);
    expect(parsed.problem).toMatch(/damaged/i);
    expect(parsed.raw).toBe(file);
  });

  it('refuses a save from a newer build, and explains what to do', () => {
    const file = buildSaveFile(newState(), 0, 'future') as unknown as Record<string, unknown>;
    file.version = CURRENT_VERSION + 5;
    const parsed = parseSaveFile(file);
    expect(parsed.ok).toBe(false);
    expect(parsed.problem).toMatch(/newer version/i);
    expect(parsed.raw).toBeDefined();
  });

  it('builds a preview that is enough to choose a slot from', () => {
    const state = stockUp(newState());
    state.day = 12;
    const preview = buildPreview(state);
    expect(preview.day).toBe(12);
    expect(preview.scenarioId).toBe(state.scenarioId);
    expect(preview.difficultyId).toBe(state.difficultyId);
    expect(preview.survivorNames.length).toBeGreaterThan(0);
    expect(preview.ending).toBeNull();
  });

  it('checksums differ when the state differs', () => {
    const a = newState();
    const b = newState();
    expect(checksumOf(a)).toBe(checksumOf(b));
    b.day = 7;
    expect(checksumOf(a)).not.toBe(checksumOf(b));
  });
});

describe('migrations', () => {
  it('the chain reaches the current version from every supported version', () => {
    for (let version = 1; version < CURRENT_VERSION; version += 1) {
      expect(migrations[version]).toBeDefined();
    }
    expect(CURRENT_VERSION).toBe(SAVE_VERSION);
  });

  it('a current-version state passes through unchanged', () => {
    const state = newState();
    expect(migrateState(snapshot(state), CURRENT_VERSION)).toEqual(state);
  });

  it('v1 saves gain the expedition fields they were missing', () => {
    const state = snapshot(newState()) as unknown as Record<string, unknown>;
    state.version = 1;
    state.expeditions = [{ id: 'e1', locationId: 'loc_0_0', members: [] }];
    delete state.activeExpeditionId;
    const migrated = migrateState(state, 1);
    expect(migrated.version).toBe(CURRENT_VERSION);
    expect(migrated.activeExpeditionId).toBeNull();
    expect(migrated.expeditions[0]!.resolved).toBe(true);
    expect(migrated.expeditions[0]!.loreFound).toEqual([]);
  });

  it('v2 saves gain guidance and the per-event counter', () => {
    const state = snapshot(newState()) as unknown as Record<string, unknown>;
    state.version = 2;
    state.events = { history: [], cooldowns: {}, scheduled: [], pending: [] };
    delete state.guidance;
    const migrated = migrateState(state, 2);
    expect(migrated.events.seenCounts).toEqual({});
    expect(migrated.guidance.enabled).toBe(true);
    expect(migrated.version).toBe(CURRENT_VERSION);
  });

  it('a migrated save still validates and still loads', () => {
    const state = snapshot(newState()) as unknown as Record<string, unknown>;
    state.version = 1;
    const migrated = migrateState(state, 1);
    expect(validateState(migrated)).toEqual({ ok: true });
  });

  it('throws rather than guessing when there is no path', () => {
    expect(() => migrateState({}, CURRENT_VERSION + 1)).toThrow(UnmigratableSaveError);
    expect(() => migrateState(null, 1)).toThrow(UnmigratableSaveError);
  });

  it('validation names what is wrong', () => {
    expect(validateState(null).ok).toBe(false);
    const partial = { seed: 'x', day: 1 };
    const result = validateState(partial);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/survivors/);
  });

  it('an empty crew is only valid once the run has actually ended', () => {
    const state = snapshot(newState()) as unknown as Record<string, unknown>;
    state.survivors = [];
    expect(validateState(state).ok).toBe(false);
    state.ending = { endingId: 'silence', day: 4, summary: '', epilogue: '', legacyAwarded: 0, survivorNames: [], memorial: [] };
    expect(validateState(state).ok).toBe(true);
  });
});
