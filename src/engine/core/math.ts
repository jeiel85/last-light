/** Small numeric helpers shared across the simulation. Pure and dependency-free. */

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t);
}

/** Map `value` from [inMin, inMax] onto [outMin, outMax], clamped at both ends. */
export function remap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  if (inMax === inMin) return outMin;
  return lerp(outMin, outMax, (value - inMin) / (inMax - inMin));
}

export function round(value: number, places = 0): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/** Round toward the nearest integer but keep small fractions visible as ±1 pressure. */
export function roundResource(value: number): number {
  return Math.round(value * 100) / 100;
}

export function sum(values: readonly number[]): number {
  let total = 0;
  for (const v of values) total += v;
  return total;
}

export function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : sum(values) / values.length;
}

export interface Band<T> {
  /** Inclusive lower bound. */
  min: number;
  value: T;
}

/** Pick the band whose `min` is the greatest value <= `value`. Bands must be ascending. */
export function bandLookup<T>(value: number, bands: readonly Band<T>[], fallback: T): T {
  let result = fallback;
  for (const band of bands) {
    if (value >= band.min) result = band.value;
    else break;
  }
  return result;
}

export function percent(value: number, places = 0): string {
  return `${round(value * 100, places)}%`;
}

export function signed(value: number, places = 0): string {
  const v = round(value, places);
  return v > 0 ? `+${v}` : `${v}`;
}

/** Stable pair key for relationship storage: always the lexicographically smaller id first. */
export function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/** Deterministic 32-bit hash used for stable visual seeds derived from ids. */
export function stableHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
