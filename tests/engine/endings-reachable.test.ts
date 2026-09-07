import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BALANCE, ENDINGS, Resources, SCENARIO_BY_ID, detectEnding } from '@engine';
import type { GameState } from '@engine';
import { newState, placeFacility, stockUp } from '../helpers';

/**
 * Every ending has to be reachable from a state the game can actually produce.
 *
 * The balance simulator plays a competent-but-not-optimal policy, and there are endings it
 * has never reached — which tells us something about that policy, not necessarily about the
 * game. These tests answer the narrower and more important question: given a state a player
 * could arrive at, does the ending actually fire? An ending whose condition can never be
 * met is content nobody will ever see, and it looks like a bug when they go looking.
 */

/** A healthy run: nothing is ending on its own. */
function viable(): GameState {
  const state = stockUp(newState({ seed: 'ENDINGS' }));
  state.day = 30;
  return state;
}

describe('every ending can fire', () => {
  it('covers the whole roster, so a new ending cannot be added untested', () => {
    const covered = new Set([
      'silence',
      'vault_fails',
      'scattered',
      'deadline_missed',
      'exodus',
      'deep_root',
      'the_thaw',
      'signal',
      'meridian',
      'last_light',
    ]);
    expect(new Set(ENDINGS.map((e) => e.id))).toEqual(covered);
  });

  it('silence — nobody is left', () => {
    const state = viable();
    for (const survivor of state.survivors) {
      survivor.alive = false;
      survivor.deathDay = state.day;
      survivor.deathCause = 'test';
    }
    expect(detectEnding(state)).toBe('silence');
  });

  it('vault_fails — the critical systems stay down', () => {
    const state = viable();
    state.flags['critical:streak'] = BALANCE.endings.criticalFailureDays;
    expect(detectEnding(state)).toBe('vault_fails');
  });

  it('scattered — the crew walks out', () => {
    const state = viable();
    state.flags['mutiny.departed'] = true;
    for (const survivor of state.survivors.slice(1)) survivor.alive = false;
    expect(detectEnding(state)).toBe('scattered');
  });

  it('deadline_missed — a scenario deadline passes', () => {
    const scenario = Object.values(SCENARIO_BY_ID).find((s) => s.deadlineDay);
    expect(scenario, 'at least one scenario should set a deadline').toBeDefined();
    const state = stockUp(newState({ scenarioId: scenario!.id, unlocks: [scenario!.requiresUnlock ?? ''] }));
    state.day = scenario!.deadlineDay! + 1;
    expect(detectEnding(state)).toBe('deadline_missed');
  });

  it('deep_root — sustained self-sufficiency', () => {
    const state = viable();
    state.flags['deeproot:streak'] = BALANCE.endings.deepRootDays;
    expect(detectEnding(state)).toBe('deep_root');
  });

  it('the_thaw — the winter is survived without solving anything', () => {
    const state = viable();
    state.day = BALANCE.endings.horizonDay;
    expect(detectEnding(state)).toBe('the_thaw');
  });

  it('exodus — the convoy is built and fuelled inside what a run affords', () => {
    const state = viable();
    state.flags['convoy.started'] = true;
    placeFacility(state, 'machine_shop', 2);
    placeFacility(state, 'surface_access', 2);
    state.resourceCaps.fuel = 200;
    state.resourceCaps.components = 250;
    state.resources.fuel = BALANCE.endings.convoyFuel;
    state.resources.components = BALANCE.endings.convoyComponents;
    expect(detectEnding(state)).toBe('exodus');
  });

  it('signal — the array is built and the crew commits', () => {
    const state = viable();
    state.research.completed.push('com_directional_array');
    state.flags['listeners.committed'] = true;
    expect(detectEnding(state)).toBe('signal');
  });

  it('meridian — the second door is open and understood', () => {
    const state = viable();
    state.flags['meridian.opened'] = true;
    state.flags['meridian.knows'] = true;
    expect(detectEnding(state)).toBe('meridian');
  });

  it('last_light — both threads resolved in one run', () => {
    const state = viable();
    state.flags['meridian.knows'] = true;
    state.flags['listeners.understood'] = true;
    state.flags['meridian.progress'] = 9;
    expect(detectEnding(state)).toBe('last_light');
  });
});

describe('the exodus requirement fits inside a run', () => {
  it('asks for a stock a vault can actually hold', () => {
    // The convoy needs 60 fuel and 45 components held at once, on top of two facilities at
    // level 2. If that exceeded what a vault can store, the ending would be decoration.
    const state = stockUp(newState());
    placeFacility(state, 'storage', 3);
    const caps = Resources.computeCaps(state);
    expect(BALANCE.endings.convoyFuel).toBeLessThanOrEqual(caps.fuel);
    expect(BALANCE.endings.convoyComponents).toBeLessThanOrEqual(caps.components);
  });
});

describe('the simulator classifies outcomes the way the endings define them', () => {
  it('never restates the taxonomy, so a new ending cannot be miscounted', () => {
    // A hand-written switch with `default: 'victory'` once counted the baseline survival
    // ending as a win, which reported 88% victories in a run where 6% actually won.
    const source = readFileSync(join(process.cwd(), 'src', 'engine', 'sim', 'run.ts'), 'utf8');
    expect(source).toContain('ENDING_BY_ID[id]?.kind');
    expect(source).not.toMatch(/case 'silence':/);
  });

  it('separates enduring from winning in the report', () => {
    const victories = ENDINGS.filter((e) => e.kind === 'victory' || e.kind === 'transcendent');
    const endured = ENDINGS.filter((e) => e.kind === 'survival');
    expect(victories.length).toBeGreaterThan(0);
    expect(endured.length).toBeGreaterThan(0);
  });
});
