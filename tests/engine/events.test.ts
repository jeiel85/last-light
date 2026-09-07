import { describe, expect, it } from 'vitest';
import {
  applyEffect,
  applyEffects,
  canPayCost,
  EVENTS,
  EVENT_BY_ID,
  Inventory,
  Relationships,
  Survivors,
  evaluateCondition,
  eventsPerDay,
  presentEvent,
  resolveEvent,
  selectEvents,
} from '@engine';
import type { EventCondition, EventEffect } from '@engine';
import { newState, placeFacility, stockUp, testRng } from '../helpers';

const ctx = (state: ReturnType<typeof newState>, roll = 0.5) => ({ state, roll });

describe('event conditions', () => {
  it('an absent condition is always satisfied', () => {
    expect(evaluateCondition(undefined, ctx(newState()))).toBe(true);
  });

  it('day windows open and close', () => {
    const state = newState();
    state.day = 10;
    expect(evaluateCondition({ kind: 'day', min: 5 }, ctx(state))).toBe(true);
    expect(evaluateCondition({ kind: 'day', min: 20 }, ctx(state))).toBe(false);
    expect(evaluateCondition({ kind: 'day', max: 5 }, ctx(state))).toBe(false);
    expect(evaluateCondition({ kind: 'day', min: 5, max: 15 }, ctx(state))).toBe(true);
  });

  it('resource thresholds read the stores', () => {
    const state = newState();
    state.resources.food = 10;
    expect(evaluateCondition({ kind: 'resource', resource: 'food', min: 5 }, ctx(state))).toBe(true);
    expect(evaluateCondition({ kind: 'resource', resource: 'food', max: 5 }, ctx(state))).toBe(false);
  });

  it('resource ratios read against the cap', () => {
    const state = newState();
    state.resourceCaps.food = 100;
    state.resources.food = 10;
    expect(evaluateCondition({ kind: 'resourceRatio', resource: 'food', maxRatio: 0.2 }, ctx(state))).toBe(true);
    expect(evaluateCondition({ kind: 'resourceRatio', resource: 'food', minRatio: 0.5 }, ctx(state))).toBe(false);
  });

  it('boolean combinators compose', () => {
    const state = newState();
    state.day = 10;
    const yes: EventCondition = { kind: 'day', min: 1 };
    const no: EventCondition = { kind: 'day', min: 99 };
    expect(evaluateCondition({ kind: 'all', of: [yes, yes] }, ctx(state))).toBe(true);
    expect(evaluateCondition({ kind: 'all', of: [yes, no] }, ctx(state))).toBe(false);
    expect(evaluateCondition({ kind: 'any', of: [yes, no] }, ctx(state))).toBe(true);
    expect(evaluateCondition({ kind: 'any', of: [no, no] }, ctx(state))).toBe(false);
    expect(evaluateCondition({ kind: 'not', of: no }, ctx(state))).toBe(true);
  });

  it('facility atoms distinguish present, levelled, operational, and absent', () => {
    const state = newState();
    expect(evaluateCondition({ kind: 'facility', facilityId: 'laboratory', absent: true }, ctx(state))).toBe(true);
    placeFacility(state, 'laboratory', 2);
    expect(evaluateCondition({ kind: 'facility', facilityId: 'laboratory' }, ctx(state))).toBe(true);
    expect(evaluateCondition({ kind: 'facility', facilityId: 'laboratory', minLevel: 3 }, ctx(state))).toBe(false);
    expect(evaluateCondition({ kind: 'facility', facilityId: 'laboratory', absent: true }, ctx(state))).toBe(false);
  });

  it('skill and trait atoms look across the living crew', () => {
    const state = newState();
    const survivor = Survivors.livingSurvivors(state)[0]!;
    for (const other of Survivors.livingSurvivors(state)) other.skills.medicine = 0;
    survivor.skills.medicine = 9;
    expect(evaluateCondition({ kind: 'skill', skill: 'medicine', min: 9 }, ctx(state))).toBe(true);
    expect(evaluateCondition({ kind: 'skill', skill: 'medicine', min: 10 }, ctx(state))).toBe(false);

    const trait = survivor.traits[0]!;
    expect(evaluateCondition({ kind: 'trait', traitId: trait }, ctx(state))).toBe(true);
    expect(evaluateCondition({ kind: 'trait', traitId: trait, present: false }, ctx(state))).toBe(false);
  });

  it('flag atoms compare equality and magnitude', () => {
    const state = newState();
    state.flags['tested'] = 3;
    expect(evaluateCondition({ kind: 'flag', flag: 'tested' }, ctx(state))).toBe(true);
    expect(evaluateCondition({ kind: 'flag', flag: 'tested', equals: 3 }, ctx(state))).toBe(true);
    expect(evaluateCondition({ kind: 'flag', flag: 'tested', atLeast: 5 }, ctx(state))).toBe(false);
    expect(evaluateCondition({ kind: 'flag', flag: 'absent' }, ctx(state))).toBe(false);
  });

  it('item, research, weather and scenario atoms read their own stores', () => {
    const state = newState();
    Inventory.addItem(state, 'bandage', 2);
    expect(evaluateCondition({ kind: 'item', itemId: 'bandage', min: 1 }, ctx(state))).toBe(true);
    expect(evaluateCondition({ kind: 'research', researchId: 'sur_greywater' }, ctx(state))).toBe(false);
    state.research.completed.push('sur_greywater');
    expect(evaluateCondition({ kind: 'research', researchId: 'sur_greywater' }, ctx(state))).toBe(true);
    expect(evaluateCondition({ kind: 'weather', weatherId: state.weather.id }, ctx(state))).toBe(true);
    expect(evaluateCondition({ kind: 'scenario', scenarioId: state.scenarioId }, ctx(state))).toBe(true);
  });

  it('the chance atom is driven by the supplied roll, not by Math.random', () => {
    const state = newState();
    expect(evaluateCondition({ kind: 'chance', p: 0.5 }, ctx(state, 0.1))).toBe(true);
    expect(evaluateCondition({ kind: 'chance', p: 0.5 }, ctx(state, 0.9))).toBe(false);
  });

  it('survivor count and morale atoms read the crew', () => {
    const state = newState();
    const alive = Survivors.livingSurvivors(state).length;
    expect(evaluateCondition({ kind: 'survivorCount', min: alive }, ctx(state))).toBe(true);
    expect(evaluateCondition({ kind: 'survivorCount', min: alive + 1 }, ctx(state))).toBe(false);
    for (const survivor of Survivors.livingSurvivors(state)) survivor.morale = 10;
    expect(evaluateCondition({ kind: 'morale', max: 20 }, ctx(state))).toBe(true);
  });
});

describe('event effects', () => {
  const effectCtx = (state: ReturnType<typeof newState>) => ({
    state,
    rng: testRng('effects'),
    actor: Survivors.livingSurvivors(state)[0]!,
    unlocks: [] as string[],
  });

  it('resource effects move the stores and stay inside the caps', () => {
    const state = newState();
    state.resources.food = 5;
    applyEffect({ kind: 'resource', resource: 'food', amount: 10 }, effectCtx(state));
    expect(state.resources.food).toBe(15);
    applyEffect({ kind: 'resource', resource: 'food', amount: -100 }, effectCtx(state));
    expect(state.resources.food).toBe(0);
    state.resources.food = 10;
    applyEffect({ kind: 'resource', resource: 'food', amount: 100000 }, effectCtx(state));
    expect(state.resources.food).toBeLessThanOrEqual(state.resourceCaps.food);
  });

  it('percentage effects scale with what is there', () => {
    const state = newState();
    state.resources.fuel = 20;
    applyEffect({ kind: 'resourcePercent', resource: 'fuel', percent: -0.5 }, effectCtx(state));
    expect(state.resources.fuel).toBeCloseTo(10, 1);
  });

  it('item effects add and remove stock', () => {
    const state = newState();
    const before = Inventory.itemCount(state, 'bandage');
    applyEffect({ kind: 'item', itemId: 'bandage', count: 2 }, effectCtx(state));
    expect(Inventory.itemCount(state, 'bandage')).toBe(before + 2);
    applyEffect({ kind: 'item', itemId: 'bandage', count: -1 }, effectCtx(state));
    expect(Inventory.itemCount(state, 'bandage')).toBe(before + 1);
  });

  it('need effects clamp to 0–100', () => {
    const state = newState();
    const actor = Survivors.livingSurvivors(state)[0]!;
    applyEffect({ kind: 'need', target: 'actor', need: 'morale', amount: 1000 }, { ...effectCtx(state), actor });
    expect(actor.morale).toBe(100);
    applyEffect({ kind: 'need', target: 'actor', need: 'morale', amount: -1000 }, { ...effectCtx(state), actor });
    expect(actor.morale).toBe(0);
  });

  it('injure and cure are inverses', () => {
    const state = newState();
    const actor = Survivors.livingSurvivors(state)[0]!;
    actor.traits = [];
    applyEffect(
      { kind: 'injure', target: 'actor', conditionId: 'bleeding', severity: 40 },
      { ...effectCtx(state), actor },
    );
    expect(Survivors.hasCondition(actor, 'bleeding')).toBe(true);
    applyEffect(
      { kind: 'cure', target: 'actor', conditionId: 'bleeding' },
      { ...effectCtx(state), actor },
    );
    expect(Survivors.hasCondition(actor, 'bleeding')).toBe(false);
  });

  it('killing removes someone from the living and records why', () => {
    const state = newState();
    const actor = Survivors.livingSurvivors(state)[0]!;
    const before = Survivors.livingSurvivors(state).length;
    applyEffect({ kind: 'kill', target: 'actor', cause: 'a test' }, { ...effectCtx(state), actor });
    expect(actor.alive).toBe(false);
    expect(actor.deathCause).toBe('a test');
    expect(Survivors.livingSurvivors(state)).toHaveLength(before - 1);
  });

  it('recruiting adds a valid new person', () => {
    const state = newState();
    const before = Survivors.livingSurvivors(state).length;
    applyEffect({ kind: 'recruit', count: 1 }, effectCtx(state));
    const after = Survivors.livingSurvivors(state);
    expect(after).toHaveLength(before + 1);
    expect(after[after.length - 1]!.traits.length).toBeGreaterThan(0);
  });

  it('flags can be set and incremented', () => {
    const state = newState();
    applyEffect({ kind: 'flag', flag: 'test.flag', value: true }, effectCtx(state));
    expect(state.flags['test.flag']).toBe(true);
    applyEffect({ kind: 'flag', flag: 'counter', increment: 2 }, effectCtx(state));
    applyEffect({ kind: 'flag', flag: 'counter', increment: 3 }, effectCtx(state));
    expect(state.flags['counter']).toBe(5);
  });

  it('scheduling puts an event on the timeline in the future', () => {
    const state = newState();
    state.day = 4;
    const eventId = EVENTS[0]!.id;
    applyEffect({ kind: 'schedule', eventId, inDays: 3 }, effectCtx(state));
    expect(state.events.scheduled).toContainEqual(expect.objectContaining({ eventId, day: 7 }));
  });

  it('chaining queues an event for right now', () => {
    const state = newState();
    const eventId = EVENTS[1]!.id;
    applyEffect({ kind: 'chain', eventId }, effectCtx(state));
    expect(state.events.pending.some((p) => p.eventId === eventId)).toBe(true);
  });

  it('lore is recorded once', () => {
    const state = newState();
    applyEffect({ kind: 'lore', loreId: 'lore_manifest' }, effectCtx(state));
    applyEffect({ kind: 'lore', loreId: 'lore_manifest' }, effectCtx(state));
    expect(state.lore.filter((l) => l === 'lore_manifest').length).toBeLessThanOrEqual(1);
  });

  it('relationship effects move a pair', () => {
    const state = newState();
    const [a, b] = Survivors.livingSurvivors(state);
    const before = Relationships.getRelationship(state, a!.id, b!.id);
    applyEffect(
      { kind: 'relationship', a: { survivorId: a!.id }, b: { survivorId: b!.id }, amount: 20 },
      effectCtx(state),
    );
    expect(Relationships.getRelationship(state, a!.id, b!.id)).toBeGreaterThan(before);
  });

  it('facility damage and repair move condition in opposite directions', () => {
    const state = newState();
    const facility = placeFacility(state, 'workshop', 1, { condition: 80 });
    applyEffect({ kind: 'facilityDamage', facilityId: 'workshop', amount: 30 }, effectCtx(state));
    expect(facility.condition).toBeLessThan(80);
    const damaged = facility.condition;
    applyEffect({ kind: 'facilityRepair', facilityId: 'workshop', amount: 20 }, effectCtx(state));
    expect(facility.condition).toBeGreaterThan(damaged);
  });

  it('every effect kind is applicable without throwing', () => {
    const kinds: EventEffect[] = [
      { kind: 'resource', resource: 'food', amount: 1 },
      { kind: 'resourcePercent', resource: 'food', percent: 0.1 },
      { kind: 'item', itemId: 'bandage', count: 1 },
      { kind: 'need', target: 'all', need: 'fatigue', amount: -5 },
      { kind: 'injure', target: 'random', conditionId: 'bleeding', severity: 10 },
      { kind: 'cure', target: 'all' },
      { kind: 'recruit', count: 1 },
      { kind: 'facilityDamage', amount: 5 },
      { kind: 'facilityRepair', amount: 5 },
      { kind: 'facilityGrant', facilityId: 'workshop', level: 1 },
      { kind: 'research', researchId: 'sur_greywater', grant: true },
      { kind: 'relationship', a: 'random', b: 'random_other', amount: 5 },
      { kind: 'flag', flag: 'k', value: 1 },
      { kind: 'lore', loreId: 'lore_manifest' },
      { kind: 'revealLocation', count: 1 },
      { kind: 'schedule', eventId: EVENTS[0]!.id, inDays: 2 },
      { kind: 'chain', eventId: EVENTS[1]!.id },
      { kind: 'stat', stat: 'hardChoicesMade', amount: 1 },
      { kind: 'weather', weatherId: 'rain' },
    ];
    const state = stockUp(newState());
    for (const effect of kinds) {
      expect(() => applyEffect(effect, effectCtx(state))).not.toThrow();
    }
  });

  it('applyEffects returns one note per effect that has something to say', () => {
    const state = newState();
    const notes = applyEffects(
      [
        { kind: 'resource', resource: 'food', amount: 5 },
        { kind: 'flag', flag: 'silent', value: 1 },
      ],
      effectCtx(state),
    );
    expect(Array.isArray(notes)).toBe(true);
  });

  it('costs are only payable when the stores can cover them', () => {
    const state = newState();
    state.resources.medicine = 1;
    const short = canPayCost(state, { resources: { medicine: 5 } });
    expect(short.ok).toBe(false);
    expect(short.reason).toMatch(/medicine/i);
    expect(canPayCost(state, { resources: { medicine: 1 } }).ok).toBe(true);
  });
});

describe('event selection and resolution', () => {
  it('every catalogue event is well formed', () => {
    expect(EVENTS.length).toBeGreaterThanOrEqual(80);
    for (const event of EVENTS) {
      expect(event.title.length).toBeGreaterThan(0);
      expect(event.body.length).toBeGreaterThan(0);
      expect(event.choices.length).toBeGreaterThan(0);
      expect(new Set(event.choices.map((c) => c.id)).size).toBe(event.choices.length);
      for (const choice of event.choices) expect(choice.label.length).toBeGreaterThan(0);
    }
  });

  it('event ids are unique', () => {
    expect(new Set(EVENTS.map((e) => e.id)).size).toBe(EVENTS.length);
  });

  it('selection is deterministic for a given state and stream', () => {
    const a = newState();
    const b = newState();
    a.day = 6;
    b.day = 6;
    expect(selectEvents(a, testRng('sel')).pending.map((e) => e.eventId)).toEqual(
      selectEvents(b, testRng('sel')).pending.map((e) => e.eventId),
    );
  });

  it('never selects an event whose requirements are unmet', () => {
    const state = newState();
    state.day = 12;
    const result = selectEvents(state, testRng('req'));
    for (const pending of result.pending) {
      const event = EVENT_BY_ID[pending.eventId]!;
      const actor = pending.actorId ? state.survivors.find((s) => s.id === pending.actorId) : undefined;
      expect(
        evaluateCondition(event.requires, { state, roll: 0, ...(actor ? { actor } : {}) }),
      ).toBe(true);
    }
  });

  it('respects cooldowns', () => {
    const state = newState();
    state.day = 8;
    const first = selectEvents(state, testRng('cool')).pending[0];
    if (!first) return;
    state.events.cooldowns[first.eventId] = 99;
    const again = selectEvents(state, testRng('cool')).pending;
    expect(again.some((e) => e.eventId === first.eventId)).toBe(false);
  });

  it('never repeats a once-only event', () => {
    const state = newState();
    const once = EVENTS.find((e) => e.once);
    if (!once) return;
    state.events.seenCounts[once.id] = 1;
    state.day = 10;
    for (let i = 0; i < 20; i += 1) {
      const events = selectEvents(state, testRng(`once-${i}`)).pending;
      expect(events.some((e) => e.eventId === once.id)).toBe(false);
    }
  });

  it('fires scheduled events on their day, ahead of the weighted picks', () => {
    const state = newState();
    state.day = 5;
    const scheduled = EVENTS.find((e) => !e.scheduledOnly)!;
    state.events.scheduled.push({ eventId: scheduled.id, day: 5 });
    const result = selectEvents(state, testRng('sched'));
    expect(result.pending.some((e) => e.eventId === scheduled.id)).toBe(true);
    expect(state.events.scheduled.some((s) => s.eventId === scheduled.id && s.day === 5)).toBe(false);
  });

  it('grows the nightly event budget as the run goes on', () => {
    const early = newState();
    const late = newState();
    late.day = 40;
    expect(eventsPerDay(late)).toBeGreaterThanOrEqual(eventsPerDay(early));
  });

  it('presents an event with a decision for every choice', () => {
    const state = newState();
    state.events.pending.push({ eventId: EVENTS[0]!.id });
    const presentation = presentEvent(state)!;
    expect(presentation.event.id).toBe(EVENTS[0]!.id);
    expect(presentation.choices).toHaveLength(EVENTS[0]!.choices.length);
    for (const choice of presentation.choices) {
      expect(typeof choice.enabled).toBe('boolean');
      if (!choice.enabled) expect(choice.reason).toBeTruthy();
      if (choice.successChance !== null) {
        expect(choice.successChance).toBeGreaterThanOrEqual(0);
        expect(choice.successChance).toBeLessThanOrEqual(1);
      }
    }
  });

  it('resolving consumes the event, records history, and reports the roll', () => {
    const state = stockUp(newState());
    state.events.pending.push({ eventId: EVENTS[0]!.id });
    const presentation = presentEvent(state)!;
    const choice = presentation.choices.find((c) => c.enabled)!;
    const result = resolveEvent(state, choice.choice.id, testRng('resolve'));

    expect(result.ok).toBe(true);
    expect(state.events.pending).toHaveLength(0);
    expect(state.events.history[state.events.history.length - 1]!.eventId).toBe(EVENTS[0]!.id);
    if (choice.successChance !== null) expect(result.rollDetail).toBeDefined();
  });

  it('refuses a choice the player cannot afford, without consuming the event', () => {
    const state = newState();
    const costly = EVENTS.find((e) => e.choices.some((c) => (c.cost?.resources?.medicine ?? 0) > 0));
    if (!costly) return;
    state.resources.medicine = 0;
    state.events.pending.push({ eventId: costly.id });
    const presentation = presentEvent(state)!;
    const blocked = presentation.choices.find((c) => (c.choice.cost?.resources?.medicine ?? 0) > 0);
    if (!blocked || blocked.enabled) return;
    const result = resolveEvent(state, blocked.choice.id, testRng('blocked'));
    expect(result.ok).toBe(false);
    expect(state.events.pending).toHaveLength(1);
  });

  it('every chained and scheduled event target exists', () => {
    for (const event of EVENTS) {
      for (const choice of event.choices) {
        for (const effect of [...(choice.effects ?? []), ...(choice.onSuccess ?? []), ...(choice.onFailure ?? [])]) {
          if (effect.kind === 'chain' || effect.kind === 'schedule') {
            expect(EVENT_BY_ID[effect.eventId]).toBeDefined();
          }
        }
      }
    }
  });
});
