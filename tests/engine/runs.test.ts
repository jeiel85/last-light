import { describe, expect, it } from 'vitest';
import { DIFFICULTIES, Research, SCENARIOS, advanceDay } from '@engine';
import { newState, placeFacility, testRng } from '../helpers';
import { planDay, type AgentConfig } from '../../src/engine/sim/agent';
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

/**
 * The headless agent is the balance instrument. A defect here does not break the game — it
 * silently produces wrong numbers about the game, which is worse, because those numbers get
 * believed and content gets retuned against them.
 */
describe('the agent as an instrument', () => {
  /**
   * Input : a vault short of power whose reactor upgrade is out of reach.
   * Output: the agent still spends on something.
   * Why   : `manageBase` used to return unconditionally whenever power was short and the
   *         reactor upgrade unaffordable, banking components for it. That is an absorbing
   *         state — the reactor's level-3 upgrade costs 62 components against a mean peak
   *         of ~66 for a whole run — so the agent stopped building, stopped upgrading, and
   *         never reached the level-2 laboratory that gates tier-3 research. The batch
   *         report then blamed the research tree. Banking only inside a reachable window
   *         keeps the original intent without the deadlock.
   */
  function powerShortState(components: number) {
    const state = newState();
    // A real day, so `lastReport` is the one the agent actually reads.
    advanceDay(state);
    const reactor = state.facilities.find((f) => f.defId === 'reactor');
    expect(reactor, 'the starting vault should have a reactor').toBeDefined();
    reactor!.level = 2;
    reactor!.status = 'operational';
    state.resources.components = components;
    // Force the shortage the rule keys on, rather than waiting for one to arise.
    state.lastReport!.power.capacity.total = 1;
    state.lastReport!.power.demand.total = 99;
    return state;
  }

  it('banks for the reactor only while the upgrade is within reach', () => {
    // Level-2 reactor → the next upgrade costs 62 components.
    const nearly = powerShortState(50); // shortfall 12 — close enough to save for
    planDay(nearly, { strategy: 'balanced', risk: 0.5 }, testRng('bank'));
    expect(nearly.resources.components, 'a reachable upgrade is worth banking for').toBe(50);
  });

  it('does not stall forever banking for a reactor upgrade it cannot reach', () => {
    const far = powerShortState(30); // shortfall 32 — a wait that never ends
    const before = {
      components: far.resources.components,
      facilities: far.facilities.length,
      upgrading: far.facilities.filter((f) => f.upgradingTo).length,
    };
    planDay(far, { strategy: 'balanced', risk: 0.5 }, testRng('stall'));
    const acted =
      far.resources.components !== before.components ||
      far.facilities.length !== before.facilities ||
      far.facilities.filter((f) => f.upgradingTo).length !== before.upgrading;
    expect(acted, 'the agent should spend rather than wait on an upgrade out of reach').toBe(true);
  });
});

/**
 * The instrument has to sample where the work happens.
 *
 * Research advances at stage 5 of the day pipeline; fatigue, conditions, refusals, facility
 * decay and event effects all land at stages 6 to 12. Numbers read after the day is over
 * describe a different day than the one research was paid for.
 */
describe('the research sample is taken where research runs', () => {
  it('reports the insight the day actually spent', () => {
    const state = newState();
    placeFacility(state, 'laboratory', 1);
    // An expensive node, so one day cannot finish it and reset the progress counter.
    Research.startResearch(state, 'agr_deep_root');
    if (!state.research.active) {
      // Gated in a fresh vault; any startable node serves, the invariant is the same.
      const startable = Research.allResearch(state).find((r) => r.ok);
      expect(startable, 'no research node can be started in a fresh vault').toBeDefined();
      Research.startResearch(state, startable!.node.id);
    }
    const before = state.research.active!.progress;
    const result = advanceDay(state);
    // Unfinished, so progress advanced by exactly the rate the research step used.
    if (state.research.active) {
      expect(state.research.active.progress - before).toBeCloseTo(result.research.insight, 6);
    }
    expect(result.research.labOperational).toBe(true);
    expect(result.research.labLevel).toBe(1);
  });

  it('never reports a facility as built without having seen it buildable', () => {
    /*
     * `canBuild` refuses a unique facility that already exists, so a sample taken after the
     * day sees "already built" and never records the one moment it was available. Sampling
     * before the agent spends is what keeps this invariant true.
     *
     * The vault opens with facilities already standing — the reactor among them. Those were
     * never built and were never buildable, so they are not what this invariant is about.
     */
    const startingFacilities = new Set(newState().facilities.map((f) => f.defId));
    for (const result of batch(8, { seedPrefix: 'BUILDABLE' })) {
      const built = result.facilitiesUsed.filter((id) => !startingFacilities.has(id));
      expect(built.length, 'a 60-day run should build something').toBeGreaterThan(0);
      for (const id of built) {
        expect(result.facilitiesBuildable, `${id} was built in ${result.seed} but never sampled as buildable`).toContain(id);
      }
    }
  }, 60000);
});

/**
 * The batch report has to explain itself.
 *
 * `unreachable-tier` used to end with "look for the gate before the cost", which left the
 * reader to instrument the run by hand to find out whether the tier was priced out,
 * unstaffed, or behind a facility level nobody reached. Those have different fixes.
 */
describe('the balance report explains an unreachable tier', () => {
  it('records the insight economy alongside the node counts', () => {
    const report = analyse(batch(12, { seedPrefix: 'ECONOMY' }));
    const economy = report.insightEconomy;
    expect(economy.treeCost).toBeGreaterThan(0);
    expect(economy.meanInsightPerRun).toBeGreaterThan(0);
    expect(economy.labBuiltRate).toBeGreaterThanOrEqual(0);
    expect(economy.labBuiltRate).toBeLessThanOrEqual(1);
    expect(economy.labStaffedRate).toBeGreaterThanOrEqual(0);
    expect(economy.labStaffedRate).toBeLessThanOrEqual(1);
  }, 60000);

  it('names a cause when a whole tier goes uncompleted', () => {
    const report = analyse(batch(12, { seedPrefix: 'ECONOMY' }));
    const warning = report.warnings.find((w) => w.code === 'unreachable-tier');
    // Not every batch strands a tier; when one does, the message must say why.
    if (warning) {
      expect(warning.message).toMatch(/The gate: .+\./);
      expect(warning.message).not.toMatch(/look for the gate/);
    }
  }, 60000);
});
