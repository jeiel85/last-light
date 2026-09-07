import { describe, expect, it } from 'vitest';
import { createRng, generateSeed, hashString, normaliseSeed, rngFromState, stateFromSeed } from '@engine';

/**
 * Determinism is the load-bearing property of the whole simulation: the balance
 * simulator, the save format, and "same seed, same run" all rest on it.
 */
describe('rng', () => {
  it('produces the same stream for the same seed', () => {
    const a = createRng('MERIDIAN-K3XQ');
    const b = createRng('MERIDIAN-K3XQ');
    const left = Array.from({ length: 200 }, () => a.next());
    const right = Array.from({ length: 200 }, () => b.next());
    expect(left).toEqual(right);
  });

  it('produces different streams for different seeds', () => {
    const a = Array.from({ length: 50 }, createRng('SEED-ONE').next);
    const b = Array.from({ length: 50 }, createRng('SEED-TWO').next);
    expect(a).not.toEqual(b);
  });

  it('stays inside [0, 1)', () => {
    const rng = createRng('bounds');
    for (let i = 0; i < 5000; i += 1) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('respects int bounds inclusively', () => {
    const rng = createRng('ints');
    const seen = new Set<number>();
    for (let i = 0; i < 3000; i += 1) {
      const value = rng.int(1, 6);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(6);
      seen.add(value);
    }
    expect(seen.size).toBe(6);
  });

  it('round-trips through snapshot and restore', () => {
    const rng = createRng('snapshot');
    for (let i = 0; i < 17; i += 1) rng.next();
    const saved = rng.snapshot();
    const expected = Array.from({ length: 20 }, () => rng.next());

    const resumed = rngFromState(saved);
    expect(Array.from({ length: 20 }, () => resumed.next())).toEqual(expected);
  });

  it('snapshots are values, not references into the live state', () => {
    const rng = createRng('detach');
    const saved = rng.snapshot();
    rng.next();
    expect(saved).not.toEqual(rng.snapshot());
  });

  it('forks independently of how much the parent has consumed', () => {
    // The point of fork(): adding rolls in one subsystem must not move another's stream.
    const parent = createRng('fork-parent');
    const beforeState = parent.snapshot();
    const worldA = parent.fork('worldgen');
    const drawsA = Array.from({ length: 30 }, () => worldA.next());

    const twin = rngFromState(beforeState);
    const worldB = twin.fork('worldgen');
    expect(Array.from({ length: 30 }, () => worldB.next())).toEqual(drawsA);
  });

  it('different fork labels give different streams', () => {
    const rng = createRng('labels');
    const a = Array.from({ length: 30 }, () => rng.fork('worldgen').next());
    const b = Array.from({ length: 30 }, () => rng.fork('survivors').next());
    expect(a).not.toEqual(b);
  });

  it('forking does not consume the parent stream', () => {
    const rng = createRng('no-consume');
    const before = rng.snapshot();
    rng.fork('a');
    rng.fork('b');
    expect(rng.snapshot()).toEqual(before);
  });

  it('weights entries proportionally', () => {
    const rng = createRng('weighted');
    const counts = { common: 0, rare: 0 };
    for (let i = 0; i < 4000; i += 1) {
      counts[rng.weighted([
        { value: 'common' as const, weight: 9 },
        { value: 'rare' as const, weight: 1 },
      ])] += 1;
    }
    expect(counts.rare).toBeGreaterThan(200);
    expect(counts.rare).toBeLessThan(650);
  });

  it('ignores non-positive weights', () => {
    const rng = createRng('zero-weights');
    for (let i = 0; i < 200; i += 1) {
      expect(
        rng.weighted([
          { value: 'never', weight: 0 },
          { value: 'always', weight: 5 },
        ]),
      ).toBe('always');
    }
  });

  it('shuffle keeps every element and does not mutate the input', () => {
    const rng = createRng('shuffle');
    const source = [1, 2, 3, 4, 5, 6, 7, 8];
    const shuffled = rng.shuffle(source);
    expect(shuffled).toHaveLength(source.length);
    expect([...shuffled].sort((a, b) => a - b)).toEqual(source);
    expect(source).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('sample returns distinct elements, capped at the pool size', () => {
    const rng = createRng('sample');
    const pool = ['a', 'b', 'c'];
    const four = rng.sample(pool, 4);
    expect(four).toHaveLength(3);
    expect(new Set(four).size).toBe(3);
  });

  it('normal stays within three standard deviations', () => {
    const rng = createRng('normal');
    for (let i = 0; i < 2000; i += 1) {
      const value = rng.normal(10, 2);
      expect(value).toBeGreaterThanOrEqual(4);
      expect(value).toBeLessThanOrEqual(16);
    }
  });

  it('hashes strings stably', () => {
    expect(hashString('meridian')).toBe(hashString('meridian'));
    expect(hashString('meridian')).not.toBe(hashString('meridiaN'));
  });

  it('derives distinct state from distinct seeds', () => {
    expect(stateFromSeed('one')).not.toEqual(stateFromSeed('two'));
  });

  it('generates seeds from an injectable entropy source', () => {
    let i = 0;
    const seed = generateSeed(() => ((i += 1) % 32) / 32);
    expect(seed).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });

  it('normalises user-supplied seeds', () => {
    expect(normaliseSeed('  meridian k3xq ')).toBe('MERIDIANK3XQ');
    expect(normaliseSeed('!!!')).toBe('MERIDIAN');
    expect(normaliseSeed('a'.repeat(80))).toHaveLength(24);
  });
});
