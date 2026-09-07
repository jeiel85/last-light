import { describe, expect, it } from 'vitest';
import {
  average,
  bandLookup,
  BreakdownBuilder,
  clamp,
  clamp01,
  emptyBreakdown,
  formatTerm,
  lerp,
  mergeBreakdowns,
  pairKey,
  percent,
  remap,
  round,
  roundResource,
  signed,
  stableHash,
  sum,
} from '@engine';

describe('math helpers', () => {
  it('clamps at both ends', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
    expect(clamp01(2)).toBe(1);
    expect(clamp01(-2)).toBe(0);
  });

  it('lerps with a clamped parameter', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
    expect(lerp(0, 10, 2)).toBe(10);
    expect(lerp(0, 10, -1)).toBe(0);
  });

  it('remaps ranges and clamps outside them', () => {
    expect(remap(5, 0, 10, 0, 100)).toBe(50);
    expect(remap(-5, 0, 10, 0, 100)).toBe(0);
    expect(remap(50, 0, 10, 0, 100)).toBe(100);
  });

  it('remap survives a degenerate input range', () => {
    expect(remap(7, 3, 3, 1, 9)).toBe(1);
  });

  it('rounds to a requested precision', () => {
    expect(round(1.2345, 2)).toBe(1.23);
    expect(round(1.5)).toBe(2);
    expect(roundResource(1.23456)).toBe(1.23);
  });

  it('sums and averages, including the empty case', () => {
    expect(sum([1, 2, 3])).toBe(6);
    expect(average([2, 4])).toBe(3);
    expect(average([])).toBe(0);
    expect(sum([])).toBe(0);
  });

  it('looks up ascending bands', () => {
    const bands = [
      { min: 0, value: 'low' },
      { min: 40, value: 'mid' },
      { min: 80, value: 'high' },
    ];
    expect(bandLookup(-5, bands, 'none')).toBe('none');
    expect(bandLookup(0, bands, 'none')).toBe('low');
    expect(bandLookup(79, bands, 'none')).toBe('mid');
    expect(bandLookup(80, bands, 'none')).toBe('high');
  });

  it('formats percentages and signed numbers', () => {
    expect(percent(0.256, 1)).toBe('25.6%');
    expect(signed(3)).toBe('+3');
    expect(signed(-3)).toBe('-3');
    expect(signed(0)).toBe('0');
  });

  it('builds a stable, order-independent pair key', () => {
    expect(pairKey('b', 'a')).toBe('a|b');
    expect(pairKey('a', 'b')).toBe(pairKey('b', 'a'));
  });

  it('hashes stably and without collisions on near-identical inputs', () => {
    expect(stableHash('s1')).toBe(stableHash('s1'));
    expect(stableHash('s1')).not.toBe(stableHash('s2'));
  });
});

describe('breakdown', () => {
  it('sums additive terms', () => {
    const b = new BreakdownBuilder('Base', 10);
    b.add('Bonus', 5);
    b.add('Penalty', -3);
    const result = b.build();
    expect(result.total).toBe(12);
    expect(result.terms).toHaveLength(3);
  });

  it('applies multipliers after the additive terms', () => {
    const b = new BreakdownBuilder('Base', 10);
    b.add('Bonus', 10);
    b.mul('Half', 0.5);
    expect(b.build().total).toBe(10);
  });

  it('classifies terms by sign and kind', () => {
    const terms = new BreakdownBuilder('Base', 1).add('Up', 2).add('Down', -2).mul('Scale', 2).build().terms;
    expect(terms.map((t) => t.kind)).toEqual(['base', 'bonus', 'penalty', 'multiplier']);
  });

  it('drops no-op terms so the popover stays readable', () => {
    const result = new BreakdownBuilder('Base', 4).add('Nothing', 0).mul('Identity', 1).build();
    expect(result.terms).toHaveLength(1);
  });

  it('keeps notes visible without changing the total', () => {
    const result = new BreakdownBuilder('Base', 4).note('Unstaffed', 'Nobody is here.').build();
    expect(result.total).toBe(4);
    expect(result.terms).toHaveLength(2);
    expect(result.terms[1]!.kind).toBe('info');
  });

  it('carries detail and fix hints through to the term', () => {
    const term = new BreakdownBuilder().add('Spoilage', -2, 'No cold storage.', 'Build Cold Storage.').build()
      .terms[0]!;
    expect(term.detail).toBe('No cold storage.');
    expect(term.fixHint).toBe('Build Cold Storage.');
  });

  it('honours min, max, and rounding', () => {
    expect(new BreakdownBuilder('Base', -5).build({ min: 0 }).total).toBe(0);
    expect(new BreakdownBuilder('Base', 500).build({ max: 100 }).total).toBe(100);
    expect(new BreakdownBuilder('Base', 1.239).build({ round: 1 }).total).toBe(1.2);
  });

  it('exposes the running value before build', () => {
    const b = new BreakdownBuilder('Base', 8).mul('Double', 2);
    expect(b.value).toBe(16);
  });

  it('returns an independent term array from build', () => {
    const b = new BreakdownBuilder('Base', 1);
    const first = b.build();
    b.add('Later', 5);
    expect(first.terms).toHaveLength(1);
  });

  it('merges breakdowns by summing totals and concatenating terms', () => {
    const a = new BreakdownBuilder('A', 3).build();
    const c = new BreakdownBuilder('C', 4).add('Extra', 1).build();
    const merged = mergeBreakdowns('Total', [a, c]);
    expect(merged.total).toBe(8);
    expect(merged.terms).toHaveLength(3);
  });

  it('has a usable empty value', () => {
    expect(emptyBreakdown().total).toBe(0);
    expect(emptyBreakdown(7).terms).toEqual([]);
  });

  it('formats terms for display', () => {
    const terms = new BreakdownBuilder('Base', 2).add('Up', 3).mul('Scale', 1.5).build().terms;
    expect(terms.map(formatTerm).every((s) => s.length > 0)).toBe(true);
  });
});
