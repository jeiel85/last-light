/**
 * Deterministic, serialisable random number generation.
 *
 * The generator is xoshiro128** seeded through a SplitMix64-style expansion of a string
 * seed. Its entire state is four uint32 values, which means it round-trips through JSON
 * and can live inside the save file — reloading a save resumes the exact same stream.
 *
 * `Math.random` must never appear anywhere under `src/engine`; a test enforces this.
 */

export interface RngState {
  a: number;
  b: number;
  c: number;
  d: number;
}

export interface Rng {
  /** Mutable state reference. Copy it with `snapshot()` if you need a stable value. */
  readonly state: RngState;
  /** Uniform float in [0, 1). */
  next(): number;
  /** Uniform integer in [min, max] inclusive. */
  int(min: number, max: number): number;
  /** Uniform float in [min, max). */
  float(min: number, max: number): number;
  /** True with probability p (clamped to [0,1]). */
  chance(p: number): boolean;
  /** Uniform element. Throws on an empty array. */
  pick<T>(items: readonly T[]): T;
  /** Up to `n` distinct elements, order randomised. */
  sample<T>(items: readonly T[], n: number): T[];
  /** Weighted pick. Entries with weight <= 0 are ignored. */
  weighted<T>(entries: readonly WeightedEntry<T>[]): T;
  /** Fisher–Yates copy. */
  shuffle<T>(items: readonly T[]): T[];
  /** Sum of `count` dice with `sides` faces. */
  dice(count: number, sides: number): number;
  /** Approximately normal value via the mean of four uniforms, clamped to ±3 sd. */
  normal(mean: number, sd: number): number;
  /**
   * An independent generator derived from this one's *current* state and a label.
   * Forked streams do not consume the parent's stream, so adding rolls in one
   * subsystem cannot change the output of another.
   */
  fork(label: string): Rng;
  snapshot(): RngState;
  restore(state: RngState): void;
}

export interface WeightedEntry<T> {
  value: T;
  weight: number;
}

const UINT32 = 0x100000000;

function rotl(x: number, k: number): number {
  return ((x << k) | (x >>> (32 - k))) >>> 0;
}

/** SplitMix32 — used only to expand a seed into generator state. */
function splitmix32(seed: number): () => number {
  let z = seed >>> 0;
  return () => {
    z = (z + 0x9e3779b9) >>> 0;
    let t = z;
    t = Math.imul(t ^ (t >>> 16), 0x21f0aaad) >>> 0;
    t = Math.imul(t ^ (t >>> 15), 0x735a2d97) >>> 0;
    return (t ^ (t >>> 15)) >>> 0;
  };
}

/** FNV-1a over UTF-16 code units. Stable across platforms. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function stateFromSeed(seed: string): RngState {
  const mix = splitmix32(hashString(seed) || 0x9e3779b9);
  const state: RngState = { a: mix(), b: mix(), c: mix(), d: mix() };
  // xoshiro requires a non-zero state.
  if ((state.a | state.b | state.c | state.d) === 0) state.a = 0x1a2b3c4d;
  return state;
}

function makeRng(state: RngState): Rng {
  const raw = (): number => {
    const result = (Math.imul(rotl(Math.imul(state.b, 5) >>> 0, 7), 9) >>> 0) >>> 0;
    const t = (state.b << 9) >>> 0;
    state.c = (state.c ^ state.a) >>> 0;
    state.d = (state.d ^ state.b) >>> 0;
    state.b = (state.b ^ state.c) >>> 0;
    state.a = (state.a ^ state.d) >>> 0;
    state.c = (state.c ^ t) >>> 0;
    state.d = rotl(state.d, 11);
    return result;
  };

  const rng: Rng = {
    state,
    next: () => raw() / UINT32,
    int: (min, max) => {
      if (max < min) [min, max] = [max, min];
      const span = max - min + 1;
      return min + Math.floor((raw() / UINT32) * span);
    },
    float: (min, max) => min + (raw() / UINT32) * (max - min),
    chance: (p) => raw() / UINT32 < Math.min(1, Math.max(0, p)),
    pick: <T,>(items: readonly T[]): T => {
      if (items.length === 0) throw new Error('rng.pick: empty array');
      return items[Math.floor((raw() / UINT32) * items.length)]!;
    },
    sample: <T,>(items: readonly T[], n: number): T[] => rng.shuffle(items).slice(0, Math.max(0, n)),
    weighted: <T,>(entries: readonly WeightedEntry<T>[]): T => {
      let total = 0;
      for (const entry of entries) if (entry.weight > 0) total += entry.weight;
      if (total <= 0) {
        const fallback = entries[0];
        if (!fallback) throw new Error('rng.weighted: no entries');
        return fallback.value;
      }
      let roll = (raw() / UINT32) * total;
      for (const entry of entries) {
        if (entry.weight <= 0) continue;
        roll -= entry.weight;
        if (roll <= 0) return entry.value;
      }
      return entries[entries.length - 1]!.value;
    },
    shuffle: <T,>(items: readonly T[]): T[] => {
      const copy = items.slice();
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor((raw() / UINT32) * (i + 1));
        const tmp = copy[i]!;
        copy[i] = copy[j]!;
        copy[j] = tmp;
      }
      return copy;
    },
    dice: (count, sides) => {
      let sum = 0;
      for (let i = 0; i < count; i += 1) sum += 1 + Math.floor((raw() / UINT32) * sides);
      return sum;
    },
    normal: (mean, sd) => {
      const u = (raw() / UINT32 + raw() / UINT32 + raw() / UINT32 + raw() / UINT32) / 4;
      // mean of 4 uniforms has sd = 1/(2*sqrt(12)) ≈ 0.1443
      const z = (u - 0.5) / 0.1443;
      return mean + Math.max(-3, Math.min(3, z)) * sd;
    },
    fork: (label: string) => {
      const h = hashString(label);
      return makeRng({
        a: (state.a ^ h) >>> 0 || 0x2545f491,
        b: (state.b ^ Math.imul(h, 0x85ebca6b)) >>> 0 || 0x9e3779b9,
        c: (state.c ^ Math.imul(h, 0xc2b2ae35)) >>> 0 || 0x27d4eb2f,
        d: (state.d ^ Math.imul(h, 0x27d4eb2f)) >>> 0 || 0x165667b1,
      });
    },
    snapshot: () => ({ a: state.a, b: state.b, c: state.c, d: state.d }),
    restore: (next) => {
      state.a = next.a >>> 0;
      state.b = next.b >>> 0;
      state.c = next.c >>> 0;
      state.d = next.d >>> 0;
    },
  };

  return rng;
}

export function createRng(seed: string): Rng {
  return makeRng(stateFromSeed(seed));
}

export function rngFromState(state: RngState): Rng {
  return makeRng({ a: state.a >>> 0, b: state.b >>> 0, c: state.c >>> 0, d: state.d >>> 0 });
}

const SEED_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** A human-readable seed such as `MERIDIAN-K3XQ`. Uses the supplied entropy source. */
export function generateSeed(entropy: () => number = () => Math.random()): string {
  let out = '';
  for (let i = 0; i < 8; i += 1) {
    if (i === 4) out += '-';
    out += SEED_ALPHABET[Math.floor(entropy() * SEED_ALPHABET.length) % SEED_ALPHABET.length];
  }
  return out;
}

/** Normalise arbitrary user input into a canonical seed string. */
export function normaliseSeed(input: string): string {
  const cleaned = input.trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
  return cleaned.length > 0 ? cleaned.slice(0, 24) : 'MERIDIAN';
}
