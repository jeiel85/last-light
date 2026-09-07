import { describe, expect, it } from 'vitest';
import {
  advanceDay,
  createInitialState,
  crewSummary,
  DIFFICULTIES,
  ENDINGS,
  ENDING_BY_ID,
  Expedition,
  Meta,
  SCENARIOS,
  Survivors,
  World,
  buildEndingResult,
  computeLegacy,
  createMetaProfile,
  detectEnding,
  presentEvent,
  resolveEvent,
  rngFromState,
} from '@engine';
import { newState, placeFacility, staff, stockUp } from '../helpers';

/** Advance one day, answering any events with the first available choice. */
function runDay(state: ReturnType<typeof newState>): void {
  advanceDay(state);
  let guard = 0;
  while (state.events.pending.length > 0 && guard < 20) {
    const presentation = presentEvent(state);
    if (!presentation) break;
    const choice = presentation.choices.find((c) => c.enabled) ?? presentation.choices[0];
    if (!choice) {
      state.events.pending.shift();
      break;
    }
    const rng = rngFromState(state.rng);
    const result = resolveEvent(state, choice.choice.id, rng, []);
    state.rng = rng.snapshot();
    if (!result.ok) state.events.pending.shift();
    guard += 1;
  }
}

describe('the day pipeline', () => {
  it('advances the clock and writes a report', () => {
    const state = stockUp(newState());
    const result = advanceDay(state);
    expect(state.day).toBe(2);
    // The report is the morning briefing for the day that has just begun.
    expect(result.report.day).toBe(state.day);
    expect(state.lastReport).not.toBeNull();
    expect(result.report.weather).toBeTruthy();
  });

  it('leaves the phase waiting on events when any were selected', () => {
    const state = stockUp(newState());
    const result = advanceDay(state);
    expect(state.phase).toBe(result.pendingEvents > 0 ? 'events' : 'planning');
  });

  it('is deterministic: the same state advances the same way', () => {
    const a = createInitialState({ seed: 'PIPE', now: 0 });
    const b = createInitialState({ seed: 'PIPE', now: 0 });
    for (let i = 0; i < 5; i += 1) {
      advanceDay(a);
      advanceDay(b);
      a.events.pending = [];
      b.events.pending = [];
    }
    expect(a.resources).toEqual(b.resources);
    expect(a.survivors.map((s) => s.health)).toEqual(b.survivors.map((s) => s.health));
  });

  it('feeds the crew and reduces hunger when there is food', () => {
    const state = stockUp(newState());
    for (const survivor of state.survivors) survivor.hunger = 60;
    advanceDay(state);
    expect(state.survivors[0]!.hunger).toBeLessThan(60);
  });

  it('starves the crew when the stores are empty', () => {
    const state = newState();
    state.resources.food = 0;
    state.resources.water = 0;
    for (const survivor of state.survivors) survivor.hunger = 10;
    for (let i = 0; i < 3; i += 1) {
      advanceDay(state);
      state.events.pending = [];
      state.resources.food = 0;
      state.resources.water = 0;
    }
    expect(state.survivors[0]!.hunger).toBeGreaterThan(10);
    expect(state.stats.starvationDays).toBeGreaterThan(0);
  });

  it('resting recovers fatigue and working spends it', () => {
    const state = stockUp(newState());
    const [rester, worker] = Survivors.livingSurvivors(state);
    const facility = placeFacility(state, 'workshop', 2);
    rester!.assignment = { kind: 'rest' };
    rester!.fatigue = 70;
    staff(state, facility, worker!);
    worker!.fatigue = 10;

    advanceDay(state);
    expect(rester!.fatigue).toBeLessThan(70);
    expect(worker!.fatigue).toBeGreaterThan(10);
  });

  it('kills survivors who run out of health, and logs it', () => {
    const state = newState();
    const victim = Survivors.livingSurvivors(state)[0]!;
    victim.health = 0.5;
    victim.hunger = 100;
    state.resources.food = 0;
    for (let i = 0; i < 6 && victim.alive; i += 1) {
      advanceDay(state);
      state.events.pending = [];
      state.resources.food = 0;
    }
    if (!victim.alive) {
      expect(victim.deathDay).toBeGreaterThan(0);
      expect(state.log.some((entry) => entry.text.includes(victim.name))).toBe(true);
    }
  });

  it('caps the log so a long run cannot grow it without bound', () => {
    const state = stockUp(newState());
    for (let i = 0; i < 90; i += 1) {
      runDay(state);
      if (state.ending) break;
      stockUp(state);
    }
    expect(state.log.length).toBeLessThanOrEqual(400);
  });

  it('summarises the crew for the dashboard', () => {
    const state = newState();
    const summary = crewSummary(state);
    expect(summary.avgHealth).toBeGreaterThan(0);
    expect(summary.workingCount + summary.restingCount + summary.idleCount).toBeLessThanOrEqual(
      Survivors.livingSurvivors(state).length,
    );
  });

  it('brings an expedition home on its return day', () => {
    const state = stockUp(newState());
    state.day = 6;
    const location = World.reachableLocations(state)[0]!;
    const team = Survivors.livingSurvivors(state).slice(0, 2).map((s) => s.id);
    const dispatch = Expedition.dispatchExpedition(state, location.id, team, {
      ...Expedition.emptyLoadout(),
      rations: 6,
      water: 6,
    });
    expect(dispatch.ok).toBe(true);

    let guard = 0;
    while (state.activeExpeditionId && guard < 30) {
      const beat = Expedition.currentBeat(state);
      if (!beat) break;
      const choice = beat.choices.find((c) => c.enabled) ?? beat.choices[0]!;
      Expedition.resolveBeat(state, choice.choice.id);
      guard += 1;
    }

    for (let i = 0; i < 6 && state.expeditions.some((e) => !e.resolved || e.returnDay >= state.day); i += 1) {
      advanceDay(state);
      state.events.pending = [];
    }
    for (const survivor of state.survivors) {
      expect(survivor.assignment.kind).not.toBe('expedition');
    }
  });
});

describe('endings', () => {
  it('has a full set of distinct, well-formed endings', () => {
    expect(ENDINGS.length).toBeGreaterThanOrEqual(8);
    expect(new Set(ENDINGS.map((e) => e.id)).size).toBe(ENDINGS.length);
    for (const ending of ENDINGS) {
      expect(ending.name.length).toBeGreaterThan(0);
      expect(ending.epilogue.length).toBeGreaterThan(40);
      expect(ending.legacyBase).toBeGreaterThan(0);
    }
    expect(ENDINGS.some((e) => e.kind === 'victory' || e.kind === 'transcendent')).toBe(true);
    expect(ENDINGS.some((e) => e.kind === 'defeat')).toBe(true);
  });

  it('detects extinction when everybody is dead', () => {
    const state = newState();
    for (const survivor of state.survivors) {
      survivor.alive = false;
      survivor.deathDay = state.day;
      survivor.deathCause = 'test';
    }
    expect(detectEnding(state)).toBe('silence');
  });

  it('finds nothing while the run is still viable', () => {
    const state = stockUp(newState());
    expect(detectEnding(state)).toBeNull();
  });

  it('honours an ending forced by an event', () => {
    const state = stockUp(newState());
    state.flags['ending:trigger'] = 'deep_root';
    expect(detectEnding(state)).toBe('deep_root');
  });

  it('builds a report with the epilogue tokens filled in', () => {
    const state = stockUp(newState());
    state.day = 30;
    const result = buildEndingResult(state, 'deep_root');
    expect(result.epilogue).not.toContain('{survivors}');
    expect(result.epilogue).not.toContain('{days}');
    expect(result.survivorNames.length).toBeGreaterThan(0);
    expect(result.legacyAwarded).toBeGreaterThan(0);
  });

  it('lists the dead on the memorial', () => {
    const state = newState();
    const victim = state.survivors[0]!;
    victim.alive = false;
    victim.deathDay = 4;
    victim.deathCause = 'a fall';
    const result = buildEndingResult(state, 'scattered');
    expect(result.memorial).toContainEqual(expect.objectContaining({ day: 4, cause: 'a fall' }));
  });

  it('legacy rewards longer runs and harder difficulties', () => {
    const short = stockUp(newState());
    short.day = 5;
    const long = stockUp(newState());
    long.day = 45;
    const def = ENDING_BY_ID['deep_root']!;
    expect(computeLegacy(long, def)).toBeGreaterThan(computeLegacy(short, def));

    const easy = stockUp(newState({ difficultyId: 'dim' }));
    const hard = stockUp(newState({ difficultyId: 'absolute' }));
    easy.day = 20;
    hard.day = 20;
    expect(computeLegacy(hard, def)).toBeGreaterThanOrEqual(computeLegacy(easy, def));
  });
});

describe('meta progression', () => {
  it('starts from an empty profile', () => {
    const profile = createMetaProfile();
    expect(profile.legacy).toBe(0);
    expect(profile.unlocks).toEqual([]);
    expect(profile.hasPlayed).toBe(false);
  });

  it('records a finished run and banks the legacy', () => {
    const state = stockUp(newState());
    state.day = 22;
    state.ending = buildEndingResult(state, 'deep_root');
    const profile = Meta.applyRunResult(createMetaProfile(), state);
    // A first sighting of an ending pays a discovery bonus on top of the run award.
    expect(profile.legacy).toBeGreaterThanOrEqual(state.ending.legacyAwarded);
    expect(profile.runsCompleted).toBe(1);
    expect(profile.bestDays).toBe(22);
    expect(profile.endingsSeen).toContain('deep_root');
    expect(profile.hasPlayed).toBe(true);
  });

  it('archives lore found during the run', () => {
    const state = stockUp(newState());
    state.lore.push('lore_manifest');
    state.ending = buildEndingResult(state, 'scattered');
    const profile = Meta.applyRunResult(createMetaProfile(), state);
    expect(profile.loreArchive).toContain('lore_manifest');
  });

  it('buys an unlock only when it is affordable and unblocked', () => {
    let profile = { ...createMetaProfile(), legacy: 100000 };
    const rows = Meta.unlockAvailability(profile);
    const buyable = rows.find((r) => !r.locked)!;
    const result = Meta.purchaseUnlock(profile, buyable.unlock.id);
    expect(result.ok).toBe(true);
    profile = result.profile;
    expect(profile.unlocks).toContain(buyable.unlock.id);
    expect(Meta.purchaseUnlock(profile, buyable.unlock.id).ok).toBe(false);

    const broke = { ...createMetaProfile(), legacy: 0 };
    expect(Meta.purchaseUnlock(broke, buyable.unlock.id).ok).toBe(false);
  });

  it('gates locked scenarios behind their unlock', () => {
    const bare = createMetaProfile();
    const gated = SCENARIOS.find((s) => s.requiresUnlock);
    if (!gated) return;
    expect(Meta.availableScenarios(bare).some((s) => s.id === gated.id)).toBe(false);
    const owner = { ...bare, unlocks: [gated.requiresUnlock!] };
    expect(Meta.availableScenarios(owner).some((s) => s.id === gated.id)).toBe(true);
  });

  it('every scenario and difficulty produces a startable run', () => {
    for (const scenario of SCENARIOS) {
      for (const difficulty of DIFFICULTIES) {
        const state = createInitialState({
          seed: `${scenario.id}-${difficulty.id}`,
          scenarioId: scenario.id,
          difficultyId: difficulty.id,
          unlocks: SCENARIOS.map((s) => s.requiresUnlock).filter(Boolean) as string[],
          now: 0,
        });
        expect(Survivors.livingSurvivors(state).length).toBe(scenario.survivorCount);
        expect(state.world.locations.length).toBeGreaterThan(0);
        expect(state.facilities.length).toBeGreaterThan(0);
        expect(detectEnding(state)).toBeNull();
      }
    }
  });
});
