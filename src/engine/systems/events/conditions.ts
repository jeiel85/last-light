import type { EventCondition, GameState, Survivor } from '../../model/types';
import { DIFFICULTIES } from '../../data/difficulties';
import { findFacility, isOperational } from '../facilities';
import { itemCount } from '../inventory';
import { bucketOf, pairsInBucket } from '../relationships';
import { computeCaps } from '../resources';
import { livingSurvivors } from '../survivors';

/**
 * Condition evaluation for the event engine.
 *
 * Conditions form a small discriminated-union tree. Everything an event might want to ask
 * about the world has an atom here, so events remain pure data and adding one never
 * requires touching the UI.
 */

export interface ConditionContext {
  state: GameState;
  /** Deterministic value in [0,1) used only by the `chance` atom. */
  roll: number;
  actor?: Survivor;
}

export function evaluateCondition(condition: EventCondition | undefined, ctx: ConditionContext): boolean {
  if (!condition) return true;
  const { state } = ctx;

  switch (condition.kind) {
    case 'all':
      return condition.of.every((c) => evaluateCondition(c, ctx));
    case 'any':
      return condition.of.some((c) => evaluateCondition(c, ctx));
    case 'not':
      return !evaluateCondition(condition.of, ctx);

    case 'day': {
      if (condition.min !== undefined && state.day < condition.min) return false;
      if (condition.max !== undefined && state.day > condition.max) return false;
      return true;
    }

    case 'resource': {
      const value = state.resources[condition.resource];
      if (condition.min !== undefined && value < condition.min) return false;
      if (condition.max !== undefined && value > condition.max) return false;
      return true;
    }

    case 'resourceRatio': {
      const caps = state.resourceCaps ?? computeCaps(state);
      const cap = caps[condition.resource] || 1;
      const ratio = state.resources[condition.resource] / cap;
      if (condition.minRatio !== undefined && ratio < condition.minRatio) return false;
      if (condition.maxRatio !== undefined && ratio > condition.maxRatio) return false;
      return true;
    }

    case 'survivorCount': {
      const count = livingSurvivors(state).length;
      if (condition.min !== undefined && count < condition.min) return false;
      if (condition.max !== undefined && count > condition.max) return false;
      return true;
    }

    case 'facility': {
      const facility = findFacility(state, condition.facilityId);
      if (condition.absent) return !facility;
      if (!facility) return false;
      if (facility.status === 'building') return false;
      if (condition.minLevel !== undefined && facility.level < condition.minLevel) return false;
      if (condition.operational && !isOperational(facility)) return false;
      return true;
    }

    case 'skill':
      return livingSurvivors(state).some((s) => s.skills[condition.skill] >= condition.min);

    case 'trait': {
      const present = livingSurvivors(state).some((s) => s.traits.includes(condition.traitId));
      return condition.present === false ? !present : present;
    }

    case 'condition':
      return livingSurvivors(state).some((s) =>
        s.conditions.some(
          (c) => c.id === condition.conditionId && c.severity >= (condition.min ?? 1),
        ),
      );

    case 'relationship': {
      const pairs = pairsInBucket(state, condition.bucket, 'atLeast');
      if (condition.bucket === 'hatred' || condition.bucket === 'resentment' || condition.bucket === 'rivalry') {
        // For negative buckets, "at least" reads as "at most" on the scale.
        const negative = livingSurvivors(state).flatMap((a, i, all) =>
          all.slice(i + 1).map((b) => {
            const key = a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
            return bucketOf(state.relationships[key] ?? 0);
          }),
        );
        const order = ['hatred', 'resentment', 'rivalry', 'acquaintance', 'trust', 'friendship', 'devotion'];
        const target = order.indexOf(condition.bucket);
        const count = negative.filter((b) => order.indexOf(b) <= target).length;
        return count >= (condition.min ?? 1);
      }
      return pairs.length >= (condition.min ?? 1);
    }

    case 'flag': {
      const value = state.flags[condition.flag];
      if (condition.equals !== undefined) return value === condition.equals;
      if (condition.atLeast !== undefined) return typeof value === 'number' && value >= condition.atLeast;
      return Boolean(value);
    }

    case 'research':
      return state.research.completed.includes(condition.researchId);

    case 'item':
      return itemCount(state, condition.itemId) >= (condition.min ?? 1);

    case 'location': {
      const matches = state.world.locations.filter((l) => {
        if (condition.archetypeId && l.archetypeId !== condition.archetypeId) return false;
        if (condition.state && l.state !== condition.state) return false;
        return true;
      });
      return matches.length >= (condition.min ?? 1);
    }

    case 'weather':
      return state.weather.id === condition.weatherId;

    case 'difficulty': {
      const rank = DIFFICULTIES.find((d) => d.id === state.difficultyId)?.rank ?? 1;
      return condition.atLeast === undefined || rank >= condition.atLeast;
    }

    case 'scenario':
      return state.scenarioId === condition.scenarioId;

    case 'eventSeen': {
      const seen = state.events.seenCounts[condition.eventId] ?? 0;
      return seen >= (condition.times ?? 1);
    }

    case 'morale': {
      const living = livingSurvivors(state);
      if (living.length === 0) return false;
      const avg = living.reduce((acc, s) => acc + s.morale, 0) / living.length;
      if (condition.min !== undefined && avg < condition.min) return false;
      if (condition.max !== undefined && avg > condition.max) return false;
      return true;
    }

    case 'chance':
      return ctx.roll < condition.p;
  }
}

/* ------------------------------------------------------- condition constructors */

export const all = (...of: EventCondition[]): EventCondition => ({ kind: 'all', of });
export const any = (...of: EventCondition[]): EventCondition => ({ kind: 'any', of });
export const not = (of: EventCondition): EventCondition => ({ kind: 'not', of });
export const dayAtLeast = (min: number): EventCondition => ({ kind: 'day', min });
export const dayBetween = (min: number, max: number): EventCondition => ({ kind: 'day', min, max });
export const resourceBelow = (resource: EventCondition extends { resource: infer R } ? R : never, max: number): EventCondition =>
  ({ kind: 'resource', resource: resource as never, max });
export const flag = (name: string): EventCondition => ({ kind: 'flag', flag: name });
export const noFlag = (name: string): EventCondition => not({ kind: 'flag', flag: name });
export const research = (researchId: string): EventCondition => ({ kind: 'research', researchId });
export const facility = (
  facilityId: string,
  opts: { minLevel?: number; operational?: boolean; absent?: boolean } = {},
): EventCondition => ({ kind: 'facility', facilityId, ...opts });
export const survivorsAtLeast = (min: number): EventCondition => ({ kind: 'survivorCount', min });
export const survivorsAtMost = (max: number): EventCondition => ({ kind: 'survivorCount', max });
export const skillAtLeast = (skill: string, min: number): EventCondition =>
  ({ kind: 'skill', skill: skill as never, min });
export const hasTrait = (traitId: string): EventCondition => ({ kind: 'trait', traitId });
