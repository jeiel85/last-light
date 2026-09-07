import { describe, expect, it } from 'vitest';
import { ENCOUNTERS, EVENTS, presentEvent } from '@engine';
import type { GameState } from '@engine';
import { newState, stockUp } from '../helpers';

/**
 * No event may ever leave the player with nothing to click.
 *
 * An event modal cannot be dismissed — that is deliberate, because the decision *is* the
 * game — so an event whose every choice is gated is not a bad event, it is a soft-lock:
 * the run cannot continue and the only way out is to reload and lose the day.
 */

/** The most hostile state the player can realistically be in: nothing left at all. */
function destitute(): GameState {
  const state = newState({ seed: 'SOFTLOCK' });
  for (const key of Object.keys(state.resources) as (keyof GameState['resources'])[]) {
    state.resources[key] = 0;
  }
  state.inventory = [];
  for (const survivor of state.survivors) {
    survivor.health = 20;
    survivor.morale = 5;
    survivor.fatigue = 95;
    survivor.hunger = 95;
    for (const skill of Object.keys(survivor.skills) as (keyof typeof survivor.skills)[]) {
      survivor.skills[skill] = 0;
    }
    survivor.traits = [];
  }
  return state;
}

function firstEnabled(state: GameState, eventId: string): { ok: boolean; reasons: string[] } {
  state.events.pending = [{ eventId }];
  const presentation = presentEvent(state);
  if (!presentation) return { ok: false, reasons: ['event could not be presented'] };
  const enabled = presentation.choices.filter((c) => c.enabled);
  return {
    ok: enabled.length > 0,
    reasons: presentation.choices.map((c) => `${c.choice.id}: ${c.reason ?? 'enabled'}`),
  };
}

describe('every event stays answerable', () => {
  it('offers at least one choice to a crew that has everything', () => {
    const stocked = stockUp(newState({ seed: 'RICH' }));
    const stuck: string[] = [];
    for (const event of EVENTS) {
      if (!firstEnabled(stocked, event.id).ok) stuck.push(event.id);
    }
    expect(stuck).toEqual([]);
  });

  it('offers at least one choice to a crew that has nothing', () => {
    const broke = destitute();
    const stuck: string[] = [];
    for (const event of EVENTS) {
      const result = firstEnabled(broke, event.id);
      if (!result.ok) stuck.push(`${event.id} — ${result.reasons.join(' | ')}`);
    }
    expect(stuck, 'these events would trap a destitute player in an undismissable modal').toEqual([]);
  });

  it('offers at least one choice when a single survivor is left alive', () => {
    const state = destitute();
    for (const survivor of state.survivors.slice(1)) {
      survivor.alive = false;
      survivor.deathDay = 1;
      survivor.deathCause = 'test';
    }
    const stuck: string[] = [];
    for (const event of EVENTS) {
      if (!firstEnabled(state, event.id).ok) stuck.push(event.id);
    }
    expect(stuck).toEqual([]);
  });

  it('every event declares a choice that is never gated at all', () => {
    // The structural guarantee behind the three checks above: an event author has to leave
    // one way out that costs nothing and requires nothing.
    const missing = EVENTS.filter(
      (event) => !event.choices.some((choice) => !choice.requires && !choice.cost),
    ).map((event) => event.id);
    expect(missing, 'every event needs one unconditional choice').toEqual([]);
  });
});

describe('every expedition beat stays answerable', () => {
  it('declares a choice that needs no gear, no skill, no trait, and no research', () => {
    // A beat is presented in the same undismissable modal as an event. A team that packed
    // nothing and knows nothing still has to be able to get home.
    const trapped = ENCOUNTERS.filter(
      (encounter) =>
        !encounter.choices.some(
          (choice) =>
            !choice.requiresItemTag &&
            !choice.requiresSkill &&
            !choice.requiresTrait &&
            !choice.requiresResearch &&
            !choice.requiresAmmo,
        ),
    ).map((encounter) => encounter.id);
    expect(trapped, 'these beats would trap an under-equipped team').toEqual([]);
  });
});
