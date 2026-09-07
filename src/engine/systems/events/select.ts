import type {
  EventChoice,
  EventDef,
  EventId,
  GameState,
  PendingEvent,
  Survivor,
} from '../../model/types';
import type { Rng } from '../../core/rng';
import { bandLookup, clamp } from '../../core/math';
import { BALANCE } from '../../data/balance';
import { EVENTS, EVENT_BY_ID } from '../../data/events';
import { livingSurvivors, bestAtSkill } from '../survivors';
import { bunkCapacity } from '../facilities';
import { eventWeightFactor } from '../traits';
import { evaluateCondition } from './conditions';
import { applyEffects, canPayCost, payChoiceCost, type EffectContext } from './effects';

/**
 * Event selection and resolution.
 *
 * Selection is deterministic given the state and a forked RNG substream, which is what
 * makes save-scumming within a day pointless: reloading and re-ending the same day produces
 * the same events. Scheduled events bypass weighting entirely so that chains stay coherent
 * no matter what else is competing for a slot.
 */

export function eventsPerDay(state: GameState): number {
  return bandLookup(
    state.day,
    BALANCE.events.countByDay.map((b) => ({ min: b.min, value: b.count })),
    1,
  );
}

function pressureFactor(state: GameState, event: EventDef): number {
  if (!event.pressure) return 1;
  const caps = state.resourceCaps;
  switch (event.pressure.kind) {
    case 'lowFood':
      return state.resources.food < 8 ? event.pressure.factor : 1;
    case 'lowWater':
      return state.resources.water < 8 ? event.pressure.factor : 1;
    case 'lowPower':
      return state.facilities.some((f) => f.brownedOut) ? event.pressure.factor : 1;
    case 'lowHope':
      return state.resources.hope < 30 ? event.pressure.factor : 1;
    case 'wounded':
      return livingSurvivors(state).some((s) => s.conditions.length > 0) ? event.pressure.factor : 1;
    case 'crowded':
      return livingSurvivors(state).length >= 6 && (caps?.food ?? 60) < 100 ? event.pressure.factor : 1;
  }
}

export interface SelectionResult {
  pending: PendingEvent[];
  /** Ids that fired from the schedule, for the log. */
  scheduled: EventId[];
}

export function selectEvents(state: GameState, rng: Rng): SelectionResult {
  const selection = rng.fork(`events:${state.day}`);
  const pending: PendingEvent[] = [];
  const scheduledIds: EventId[] = [];
  const living = livingSurvivors(state);
  if (living.length === 0) return { pending, scheduled: scheduledIds };

  /* 1. Scheduled events fire unconditionally. */
  const due = state.events.scheduled.filter((s) => s.day <= state.day);
  state.events.scheduled = state.events.scheduled.filter((s) => s.day > state.day);
  for (const entry of due) {
    if (!EVENT_BY_ID[entry.eventId]) continue;
    pending.push({
      eventId: entry.eventId,
      scheduled: true,
      ...(entry.actorId ? { actorId: entry.actorId } : {}),
    });
    scheduledIds.push(entry.eventId);
  }

  /* 2. Weighted selection for the remaining slots. */
  const slots = Math.max(0, eventsPerDay(state) - pending.length);
  const usedTags = new Set<string>();

  for (let slot = 0; slot < slots; slot += 1) {
    // A quiet evening is a legitimate outcome; without it every day feels scripted.
    if (slot > 0 && selection.chance(BALANCE.events.quietChance)) break;

    const candidates: { value: EventDef; weight: number }[] = [];
    for (const event of EVENTS) {
      if (event.scheduledOnly) continue;
      if (event.phase !== 'dusk' && event.phase !== 'any') continue;
      if (pending.some((p) => p.eventId === event.id)) continue;
      if (event.once && (state.events.seenCounts[event.id] ?? 0) > 0) continue;
      const cooldownUntil = state.events.cooldowns[event.id] ?? 0;
      if (cooldownUntil > state.day) continue;
      if (event.tags.some((t) => usedTags.has(t))) continue;

      const roll = selection.next();
      if (!evaluateCondition(event.requires, { state, roll })) continue;

      let weight = event.weight;
      weight *= pressureFactor(state, event);
      weight *= eventWeightFactor(living, event.tags);
      if (event.tags.includes('stranger')) {
        weight *= (state.flags['mod:recruitFrequency'] as number | undefined) ?? 1;
        // Once there is nowhere to put anybody, strangers stop being an opportunity.
        const spare = bunkCapacity(state) - living.length;
        const foodDays = state.resources.food / Math.max(1, living.length);
        weight *= spare <= 0 ? 0.15 : clamp(0.5 + spare * 0.35, 0.5, 1.6);
        weight *= clamp(foodDays / 6, 0.2, 1.3);
      }
      // Slightly favour events the player has not seen, for variety across a run.
      const seen = state.events.seenCounts[event.id] ?? 0;
      weight *= 1 / (1 + seen * 0.55);
      if (weight <= 0) continue;
      candidates.push({ value: event, weight });
    }

    if (candidates.length === 0) break;
    const picked = selection.weighted(candidates);
    const actor = pickActor(selection, state, picked);
    pending.push({ eventId: picked.id, ...(actor ? { actorId: actor.id } : {}) });
    for (const tag of picked.tags) usedTags.add(tag);
  }

  return { pending, scheduled: scheduledIds };
}

function pickActor(rng: Rng, state: GameState, event: EventDef): Survivor | undefined {
  const living = livingSurvivors(state);
  if (living.length === 0) return undefined;
  // Bind an actor that plausibly fits the event: prefer someone with a matching trait,
  // then someone with the relevant skill, then anyone.
  const traitCondition = findTraitId(event);
  if (traitCondition) {
    const matches = living.filter((s) => s.traits.includes(traitCondition));
    if (matches.length > 0) return rng.pick(matches);
  }
  const skill = findSkillId(event);
  if (skill) {
    const best = bestAtSkill(living, skill);
    if (best) return best;
  }
  return rng.pick(living);
}

function findTraitId(event: EventDef): string | undefined {
  const walk = (cond: unknown): string | undefined => {
    if (!cond || typeof cond !== 'object') return undefined;
    const c = cond as { kind?: string; traitId?: string; of?: unknown };
    if (c.kind === 'trait' && c.traitId) return c.traitId;
    if (Array.isArray(c.of)) {
      for (const child of c.of) {
        const found = walk(child);
        if (found) return found;
      }
    } else if (c.of) return walk(c.of);
    return undefined;
  };
  return walk(event.requires);
}

function findSkillId(event: EventDef): Parameters<typeof bestAtSkill>[1] | undefined {
  for (const choice of event.choices) {
    if (choice.check) return choice.check.skill;
  }
  return undefined;
}

/* ---------------------------------------------------------------- presentation */

export interface ChoicePresentation {
  choice: EventChoice;
  enabled: boolean;
  reason?: string;
  /** Displayed success chance when the choice has a check, else null. */
  successChance: number | null;
  checkActor?: string;
}

export interface EventPresentation {
  event: EventDef;
  actor?: Survivor;
  choices: ChoicePresentation[];
  remaining: number;
}

/**
 * Describe the event at the head of the queue.
 *
 * Pure: the UI calls this during render, against a frozen Immer draft, so it must not touch
 * the state. An id that no longer resolves — a save from a build that had an event this one
 * does not — is skipped over here and dropped from the queue by `dropUnknownEvents`, which
 * the day pipeline and `resolveEvent` both run.
 */
export function presentEvent(state: GameState): EventPresentation | null {
  const pending = state.events.pending.find((entry) => EVENT_BY_ID[entry.eventId]);
  if (!pending) return null;
  const event = EVENT_BY_ID[pending.eventId]!;
  const actor = pending.actorId
    ? state.survivors.find((s) => s.id === pending.actorId && s.alive)
    : undefined;

  const choices = event.choices.map<ChoicePresentation>((choice) => {
    const conditionOk = evaluateCondition(choice.requires, { state, roll: 0.5, ...(actor ? { actor } : {}) });
    const costCheck = canPayCost(state, choice.cost);
    const enabled = conditionOk && costCheck.ok;
    let successChance: number | null = null;
    let checkActor: string | undefined;
    if (choice.check) {
      const performer = resolveCheckActor(state, choice, actor);
      if (performer) {
        checkActor = performer.name;
        successChance = estimateSuccess(performer, choice);
      }
    }
    return {
      choice,
      enabled,
      ...(enabled ? {} : { reason: conditionOk ? costCheck.reason : 'Not available to this crew' }),
      successChance,
      ...(checkActor ? { checkActor } : {}),
    };
  });

  return {
    event,
    ...(actor ? { actor } : {}),
    choices,
    remaining: state.events.pending.filter((entry) => EVENT_BY_ID[entry.eventId]).length,
  };
}

/**
 * Drop queued events this build no longer defines. Called by the writers rather than by the
 * reader, so presentation stays pure.
 */
export function dropUnknownEvents(state: GameState): number {
  const before = state.events.pending.length;
  state.events.pending = state.events.pending.filter((entry) => Boolean(EVENT_BY_ID[entry.eventId]));
  return before - state.events.pending.length;
}

function resolveCheckActor(
  state: GameState,
  choice: EventChoice,
  actor: Survivor | undefined,
): Survivor | undefined {
  if (!choice.check) return undefined;
  const living = livingSurvivors(state);
  if (living.length === 0) return undefined;
  if (choice.check.actor === 'actor' && actor) return actor;
  if (choice.check.actor === 'best') return bestAtSkill(living, choice.check.skill) ?? living[0];
  return actor ?? living[0];
}

/** Probability that a 1d10 + skill roll beats the target. Shown to the player. */
export function estimateSuccess(survivor: Survivor, choice: EventChoice): number {
  if (!choice.check) return 1;
  let bonus = survivor.skills[choice.check.skill];
  for (const entry of choice.check.traitBonus ?? []) {
    if (survivor.traits.includes(entry.traitId)) bonus += entry.amount;
  }
  const need = choice.check.target - bonus;
  // 1d10: P(roll >= need)
  const successes = clamp(10 - (need - 1), 0, 10);
  return Math.round((successes / 10) * 100) / 100;
}

/* ------------------------------------------------------------------ resolution */

export interface EventResolution {
  ok: boolean;
  reason?: string;
  success?: boolean;
  resultText: string;
  notes: string[];
  rollDetail?: { actor: string; skill: string; roll: number; total: number; target: number };
  hasMore: boolean;
}

export function resolveEvent(
  state: GameState,
  choiceId: string,
  rng: Rng,
  unlocks: readonly string[] = [],
): EventResolution {
  // Resolution is a write, so this is where the queue gets tidied: after this the head of
  // the queue is the event `presentEvent` described, and `shift` below removes the right one.
  dropUnknownEvents(state);

  const presentation = presentEvent(state);
  if (!presentation) return { ok: false, reason: 'No event pending', resultText: '', notes: [], hasMore: false };

  const entry = presentation.choices.find((c) => c.choice.id === choiceId);
  if (!entry) return { ok: false, reason: 'Unknown choice', resultText: '', notes: [], hasMore: true };
  if (!entry.enabled) {
    return { ok: false, reason: entry.reason ?? 'Unavailable', resultText: '', notes: [], hasMore: true };
  }

  const choice = entry.choice;
  const event = presentation.event;
  const actor = presentation.actor;
  const ctx: EffectContext = { state, rng, unlocks, ...(actor ? { actor } : {}) };

  const notes = payChoiceCost(state, choice.cost);

  let success: boolean | undefined;
  let rollDetail: EventResolution['rollDetail'];
  let resultText = choice.resultText ?? '';

  if (choice.check) {
    const performer = resolveCheckActor(state, choice, actor);
    const die = rng.int(1, 10);
    let bonus = performer ? performer.skills[choice.check.skill] : 0;
    for (const bonusEntry of choice.check.traitBonus ?? []) {
      if (performer?.traits.includes(bonusEntry.traitId)) bonus += bonusEntry.amount;
    }
    const total = die + bonus;
    success = total >= choice.check.target;
    rollDetail = {
      actor: performer?.name ?? 'Nobody',
      skill: choice.check.skill,
      roll: die,
      total,
      target: choice.check.target,
    };
    notes.push(...applyEffects(choice.effects, ctx));
    notes.push(...applyEffects(success ? choice.onSuccess : choice.onFailure, ctx));
    resultText = (success ? choice.successText : choice.failureText) ?? resultText;
  } else {
    notes.push(...applyEffects(choice.effects, ctx));
    notes.push(...applyEffects(choice.onSuccess, ctx));
  }

  state.events.pending.shift();
  state.events.seenCounts[event.id] = (state.events.seenCounts[event.id] ?? 0) + 1;
  state.events.cooldowns[event.id] = state.day + (event.cooldown || BALANCE.events.defaultCooldown);
  state.stats.eventsEncountered += 1;
  if (event.choices.length >= 3 && event.tags.includes('moral')) state.stats.hardChoicesMade += 1;

  state.events.history.push({
    eventId: event.id,
    day: state.day,
    choiceId,
    ...(success !== undefined ? { success } : {}),
    summary: `${event.title} — ${choice.label}`,
  });
  if (state.events.history.length > 200) state.events.history.shift();

  state.log.push({
    id: `log${(state.idCounter += 1)}`,
    day: state.day,
    tone: choice.tone === 'good' ? 'good' : choice.tone === 'bad' ? 'bad' : 'info',
    text: `${event.title}: ${choice.label}.`,
    channel: 'Events',
  });

  return {
    ok: true,
    ...(success !== undefined ? { success } : {}),
    resultText: resultText || 'It is done.',
    notes: notes.filter(Boolean),
    ...(rollDetail ? { rollDetail } : {}),
    hasMore: state.events.pending.length > 0,
  };
}

/** Reduce cooldowns at the start of each day (they are absolute days, so nothing to do). */
export function tickEventCooldowns(state: GameState): void {
  for (const [id, until] of Object.entries(state.events.cooldowns)) {
    if (until <= state.day - 60) delete state.events.cooldowns[id];
  }
}
