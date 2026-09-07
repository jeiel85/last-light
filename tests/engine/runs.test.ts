import { describe, expect, it } from 'vitest';
import { DIFFICULTIES, SCENARIOS } from '@engine';
import type { AgentConfig } from '../../src/engine/sim/agent';
import { analyse } from '../../src/engine/sim/report';
import { runSimulation, type SimulationOptions, type SimulationResult } from '../../src/engine/sim/run';

const STRATEGIES: AgentConfig['strategy'][] = ['balanced', 'industry', 'science', 'defence'];

/** Run `count` seeded games, one per seed, and collect the results. */
function batch(count: number, options: SimulationOptions & { seedPrefix?: string } = {}): SimulationResult[] {
  const { seedPrefix = 'CI', ...rest } = options;
  const out: SimulationResult[] = [];
  for (let i = 0; i < count; i += 1) {
    out.push(runSimulation({ maxDays: 60, ...rest, seed: `${seedPrefix}-${i}` }));
  }
  return out;
}

function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)] ?? 0;
}

/**
 * Full-run integration.
 *
 * The headless agent drives the same reducers the UI does, so a crash here is a crash a
 * player would have hit. These are the slowest tests in the suite and the ones most worth
 * having: they exercise every system against every other one, for hundreds of days.
 */
describe('headless runs', () => {
  it('completes 200 seeded runs without throwing', () => {
    const results = batch(200, { seedPrefix: 'BULK' });
    const failed = results.filter((r) => r.error);
    if (failed.length > 0) {
      throw new Error(`${failed.length} runs errored, first: ${failed[0]!.seed} — ${failed[0]!.error}`);
    }
    expect(results).toHaveLength(200);
    expect(results.every((r) => r.days > 0)).toBe(true);
  }, 180000);

  it('is deterministic: the same seed produces the same run', () => {
    const a = batch(8, { seedPrefix: 'DET' });
    const b = batch(8, { seedPrefix: 'DET' });
    expect(a.map((r) => `${r.seed}:${r.days}:${r.endingId}:${r.survivorsLost}`)).toEqual(
      b.map((r) => `${r.seed}:${r.days}:${r.endingId}:${r.survivorsLost}`),
    );
  }, 60000);

  it('different seeds produce genuinely different runs', () => {
    const results = batch(30, { seedPrefix: 'VARY' });
    const signatures = new Set(results.map((r) => `${r.days}:${r.endingId}:${r.eventsSeen}`));
    expect(signatures.size).toBeGreaterThan(5);
  }, 90000);

  it('every scenario is survivable past the first week', () => {
    for (const scenario of SCENARIOS) {
      const results = batch(10, {
        maxDays: 30,
        seedPrefix: `SC-${scenario.id}`,
        scenarioId: scenario.id,
        unlocks: SCENARIOS.map((s) => s.requiresUnlock).filter(Boolean) as string[],
      });
      expect(results.filter((r) => r.error)).toHaveLength(0);
      expect(median(results.map((r) => r.days))).toBeGreaterThan(7);
    }
  }, 180000);

  it('every difficulty is playable, and the hardest is not the easiest', () => {
    const survival = new Map<string, number>();
    for (const difficulty of DIFFICULTIES) {
      const results = batch(10, { maxDays: 50, seedPrefix: 'DIFF', difficultyId: difficulty.id });
      expect(results.filter((r) => r.error)).toHaveLength(0);
      survival.set(difficulty.id, results.reduce((a, r) => a + r.days, 0) / results.length);
    }
    const ordered = [...DIFFICULTIES].sort((a, b) => a.rank - b.rank);
    expect(survival.get(ordered[ordered.length - 1]!.id)!).toBeLessThanOrEqual(
      survival.get(ordered[0]!.id)! + 2,
    );
  }, 180000);

  it('every agent strategy can play a full run', () => {
    for (const strategy of STRATEGIES) {
      const results = batch(4, { maxDays: 40, seedPrefix: `ST-${strategy}`, agent: { risk: 0.5, strategy } });
      expect(results.filter((r) => r.error)).toHaveLength(0);
      expect(results.every((r) => r.days > 0)).toBe(true);
    }
  }, 120000);

  it('losing is possible and so is lasting the full run', () => {
    const results = batch(60, { seedPrefix: 'OUTCOME' });
    expect(results.some((r) => r.endingId !== null)).toBe(true);
    expect(results.some((r) => r.days >= 40)).toBe(true);
  }, 180000);

  it('holds its invariants across a long run', () => {
    const results = batch(40, { maxDays: 50, seedPrefix: 'INVARIANT' });
    for (const run of results) {
      expect(run.days).toBeGreaterThan(0);
      expect(run.survivorsAlive).toBeGreaterThanOrEqual(0);
      expect(run.survivorsAlive).toBeLessThanOrEqual(run.peakSurvivors);
      for (const [resource, value] of Object.entries(run.finalResources)) {
        expect(Number.isFinite(value), `${resource} is not finite`).toBe(true);
        expect(value).toBeGreaterThanOrEqual(0);
      }
    }
  }, 120000);

  it('produces a balance report that names its own problems', () => {
    const results = batch(40, { maxDays: 55, seedPrefix: 'REPORT' });
    const report = analyse(results);
    expect(report.runs).toBe(40);
    expect(report.medianDays).toBeGreaterThan(0);
    expect(report.survivalCurve.length).toBeGreaterThan(0);
    for (const warning of report.warnings) {
      expect(warning.code.length).toBeGreaterThan(0);
      expect(warning.message.length).toBeGreaterThan(0);
    }
  }, 120000);

  it('finds no resource running away to infinity', () => {
    const report = analyse(batch(40, { maxDays: 60, seedPrefix: 'RUNAWAY' }));
    expect(report.resourceRunaway).toEqual([]);
  }, 120000);
});
