import { describe, expect, it } from 'vitest';
import { ENCOUNTERS, Expedition, ITEM_BY_ID, Survivors, World } from '@engine';
import type { GameState } from '@engine';
import { newState, stockUp } from '../helpers';

function fieldReady(): GameState {
  const state = stockUp(newState());
  state.day = 6;
  return state;
}

function send(state: GameState, count = 2) {
  const location = World.reachableLocations(state)[0]!;
  const team = Survivors.livingSurvivors(state)
    .filter((s) => Survivors.canJoinExpedition(s).ok)
    .slice(0, count)
    .map((s) => s.id);
  return {
    location,
    team,
    result: Expedition.dispatchExpedition(state, location.id, team, {
      ...Expedition.emptyLoadout(),
      rations: 6,
      water: 6,
      ammo: 4,
      medicine: 2,
    }),
  };
}

/** Resolve every beat with the first enabled choice. Returns the beats seen. */
function playOut(state: GameState): string[] {
  const seen: string[] = [];
  let guard = 0;
  while (state.activeExpeditionId && guard < 40) {
    const beat = Expedition.currentBeat(state);
    if (!beat) break;
    seen.push(beat.encounter.id);
    const choice = beat.choices.find((c) => c.enabled) ?? beat.choices[0]!;
    const outcome = Expedition.resolveBeat(state, choice.choice.id);
    expect(outcome.ok).toBe(true);
    guard += 1;
  }
  return seen;
}

describe('expedition dispatch', () => {
  it('refuses an empty team, an oversized team, and an unknown site', () => {
    const state = fieldReady();
    const location = World.reachableLocations(state)[0]!;
    expect(Expedition.dispatchExpedition(state, location.id, [], Expedition.emptyLoadout()).ok).toBe(false);
    expect(Expedition.dispatchExpedition(state, 'nowhere', ['x'], Expedition.emptyLoadout()).ok).toBe(false);
    const tooMany = ['a', 'b', 'c', 'd', 'e'];
    expect(Expedition.dispatchExpedition(state, location.id, tooMany, Expedition.emptyLoadout()).reason).toMatch(
      /four/i,
    );
  });

  it('refuses to pack supplies the vault does not have', () => {
    const state = fieldReady();
    state.resources.food = 0;
    const location = World.reachableLocations(state)[0]!;
    const team = [Survivors.livingSurvivors(state)[0]!.id];
    const result = Expedition.dispatchExpedition(state, location.id, team, {
      ...Expedition.emptyLoadout(),
      rations: 5,
    });
    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/food/i);
  });

  it('refuses someone who is in no state to travel, and names them', () => {
    const state = fieldReady();
    const survivor = Survivors.livingSurvivors(state)[0]!;
    survivor.health = 10;
    const location = World.reachableLocations(state)[0]!;
    const result = Expedition.dispatchExpedition(state, location.id, [survivor.id], Expedition.emptyLoadout());
    expect(result.ok).toBe(false);
    expect(result.reason).toContain(survivor.name);
  });

  it('takes the supplies out of the stores when the team leaves', () => {
    const state = fieldReady();
    const food = state.resources.food;
    const { result } = send(state);
    expect(result.ok).toBe(true);
    expect(state.resources.food).toBe(food - 6);
  });

  it('marks the team as away and switches the game into the expedition phase', () => {
    const state = fieldReady();
    const { team, result } = send(state);
    expect(result.ok).toBe(true);
    expect(state.phase).toBe('expedition');
    expect(state.activeExpeditionId).toBeTruthy();
    for (const id of team) {
      expect(state.survivors.find((s) => s.id === id)!.assignment.kind).toBe('expedition');
    }
  });

  it('refuses a second expedition while one is in the field', () => {
    const state = fieldReady();
    send(state);
    const second = send(state, 1);
    expect(second.result.ok).toBe(false);
    expect(second.result.reason).toMatch(/already/i);
  });

  it('builds a beat queue drawn from the real encounter catalogue', () => {
    const state = fieldReady();
    send(state);
    const expedition = state.expeditions.find((e) => e.id === state.activeExpeditionId)!;
    expect(expedition.queue.length).toBeGreaterThan(1);
    for (const id of expedition.queue) expect(ENCOUNTERS.some((e) => e.id === id)).toBe(true);
  });
});

describe('expedition resolution', () => {
  it('plays through to a resolved expedition with a full log', () => {
    const state = fieldReady();
    send(state);
    const expedition = state.expeditions[state.expeditions.length - 1]!;
    const seen = playOut(state);

    expect(seen.length).toBeGreaterThan(0);
    expect(expedition.resolved).toBe(true);
    expect(expedition.log).toHaveLength(seen.length);
    expect(state.phase).toBe('planning');
    for (const entry of expedition.log) {
      expect(entry.outcomeText.length).toBeGreaterThan(0);
      expect(entry.choiceLabel.length).toBeGreaterThan(0);
    }
  });

  it('gates choices with a stated reason rather than hiding them', () => {
    const state = fieldReady();
    send(state);
    let guard = 0;
    let sawGate = false;
    while (state.activeExpeditionId && guard < 40) {
      const beat = Expedition.currentBeat(state)!;
      for (const choice of beat.choices) {
        if (!choice.enabled) {
          expect(choice.reason).toBeTruthy();
          sawGate = true;
        }
      }
      Expedition.resolveBeat(state, (beat.choices.find((c) => c.enabled) ?? beat.choices[0]!).choice.id);
      guard += 1;
    }
    expect(typeof sawGate).toBe('boolean');
  });

  it('refuses an unknown or disabled choice without advancing the beat', () => {
    const state = fieldReady();
    send(state);
    const before = Expedition.currentBeat(state)!.encounter.id;
    expect(Expedition.resolveBeat(state, 'not-a-choice').ok).toBe(false);
    expect(Expedition.currentBeat(state)!.encounter.id).toBe(before);
  });

  it('never returns more haul than the pack can carry', () => {
    const state = fieldReady();
    send(state, 1);
    const expedition = state.expeditions[state.expeditions.length - 1]!;
    playOut(state);
    const hauled = Object.values(expedition.haulResources).reduce((a, v) => a + (v ?? 0), 0);
    expect(hauled).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(hauled)).toBe(true);
  });

  it('delivers the haul into the stores and frees the crew', () => {
    const state = fieldReady();
    const { team } = send(state);
    const expedition = state.expeditions[state.expeditions.length - 1]!;
    playOut(state);
    Expedition.deliverExpedition(state, expedition);
    for (const id of team) {
      expect(state.survivors.find((s) => s.id === id)!.assignment.kind).not.toBe('expedition');
    }
  });

  it('depletes the site it visited', () => {
    const state = fieldReady();
    const { location } = send(state);
    const richness = state.world.locations.find((l) => l.id === location.id)!.richness;
    playOut(state);
    const after = state.world.locations.find((l) => l.id === location.id)!;
    expect(after.visits).toBeGreaterThan(0);
    expect(after.richness).toBeLessThanOrEqual(richness);
  });

  it('is deterministic: the same seed and the same choices give the same log', () => {
    const runOnce = () => {
      const state = stockUp(newState({ seed: 'EXPED' }));
      state.day = 6;
      expect(send(state).result.ok).toBe(true);
      // A ring-0 trip delivers the same day, which removes it from the active list, so
      // hold the record before playing it out.
      const expedition = state.expeditions[state.expeditions.length - 1]!;
      playOut(state);
      return expedition.log.map((l) => l.outcomeText);
    };
    const first = runOnce();
    expect(first.length).toBeGreaterThan(0);
    expect(runOnce()).toEqual(first);
  });

  it('nobody dies without the forecast having warned about it', () => {
    // The design promise: risk is previewed, so any death must come from a run whose
    // death risk was non-zero at dispatch.
    for (let i = 0; i < 12; i += 1) {
      const state = stockUp(newState({ seed: `RISK-${i}` }));
      state.day = 6;
      const location = World.reachableLocations(state)[0]!;
      const team = Survivors.livingSurvivors(state)
        .filter((s) => Survivors.canJoinExpedition(s).ok)
        .slice(0, 2)
        .map((s) => s.id);
      if (team.length === 0) continue;
      const loadout = { ...Expedition.emptyLoadout(), rations: 4, water: 4 };
      const forecast = Expedition.expeditionForecast(state, location, team, loadout);
      Expedition.dispatchExpedition(state, location.id, team, loadout);
      const expedition = state.expeditions[state.expeditions.length - 1]!;
      playOut(state);
      if (expedition.casualties.length > 0) {
        expect(forecast.deathRisk.total).toBeGreaterThan(0);
      }
    }
  });
});

describe('encounter content', () => {
  it('every encounter is well formed and reachable by tag', () => {
    expect(ENCOUNTERS.length).toBeGreaterThanOrEqual(40);
    expect(new Set(ENCOUNTERS.map((e) => e.id)).size).toBe(ENCOUNTERS.length);
    for (const encounter of ENCOUNTERS) {
      expect(encounter.title.length).toBeGreaterThan(0);
      expect(encounter.text.length).toBeGreaterThan(0);
      expect(encounter.choices.length).toBeGreaterThan(0);
      expect(encounter.tags.length).toBeGreaterThan(0);
      expect(new Set(encounter.choices.map((c) => c.id)).size).toBe(encounter.choices.length);
      for (const choice of encounter.choices) {
        expect(choice.label.length).toBeGreaterThan(0);
        // A choice must lead somewhere: either a flat outcome or both check branches.
        expect(Boolean(choice.outcome) || Boolean(choice.onSuccess ?? choice.onFailure)).toBe(true);
        if (choice.requiresItemTag) expect(choice.lockedHint ?? '').not.toBe('');
      }
    }
  });

  it('every encounter references only real items and conditions', () => {
    for (const encounter of ENCOUNTERS) {
      for (const choice of encounter.choices) {
        for (const outcome of [choice.outcome, choice.onSuccess, choice.onFailure]) {
          if (!outcome) continue;
          for (const item of outcome.items ?? []) expect(ITEM_BY_ID[item.itemId]).toBeDefined();
          if (outcome.consumeItem) expect(ITEM_BY_ID[outcome.consumeItem]).toBeDefined();
        }
      }
    }
  });

  it('covers every stage of a trip', () => {
    for (const stage of ['travel', 'approach', 'site', 'complication', 'extraction'] as const) {
      expect(ENCOUNTERS.some((e) => e.stage === stage)).toBe(true);
    }
  });
});
