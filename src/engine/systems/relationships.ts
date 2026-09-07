import type { GameState, RelationshipBucket, Survivor, SurvivorId } from '../model/types';
import { BALANCE } from '../data/balance';
import { clamp, pairKey } from '../core/math';
import { personalityOf } from './survivors';
import * as T from './traits';

/**
 * Relationships exist to generate stories, not to be optimised. The mechanical surface is
 * deliberately small — a work modifier, an interpose chance, a fight chance, and a set of
 * event gates — while the *narrative* surface is large.
 */

export function getRelationship(state: GameState, a: SurvivorId, b: SurvivorId): number {
  if (a === b) return 0;
  return state.relationships[pairKey(a, b)] ?? 0;
}

export function bucketOf(value: number): RelationshipBucket {
  let bucket: RelationshipBucket = 'acquaintance';
  for (const band of BALANCE.relationships.buckets) {
    if (value >= band.min) bucket = band.bucket;
    else break;
  }
  return bucket;
}

export function bucketLabel(bucket: RelationshipBucket): string {
  switch (bucket) {
    case 'hatred':
      return 'Hatred';
    case 'resentment':
      return 'Resentment';
    case 'rivalry':
      return 'Rivalry';
    case 'acquaintance':
      return 'Acquaintance';
    case 'trust':
      return 'Trust';
    case 'friendship':
      return 'Friendship';
    case 'devotion':
      return 'Devotion';
  }
}

/**
 * Adjust a pair's standing. Trait and personality modifiers scale the delta, so a
 * Grudge-Keeper genuinely spirals while a Peacemaker genuinely defuses.
 */
export function adjustRelationship(
  state: GameState,
  aId: SurvivorId,
  bId: SurvivorId,
  delta: number,
): number {
  if (aId === bId || delta === 0) return 0;
  const a = state.survivors.find((s) => s.id === aId);
  const b = state.survivors.find((s) => s.id === bId);
  if (!a || !b) return 0;

  const direction = delta >= 0 ? 'positive' : 'negative';
  let scaled = delta;
  for (const survivor of [a, b]) {
    scaled *= T.relationshipDriftFactor(survivor, direction);
    const personality = personalityOf(survivor);
    scaled *= direction === 'positive' ? personality.warmth : personality.friction;
  }
  // Personality/trait stacking can get extreme; keep a single interaction bounded.
  scaled = clamp(scaled, -28, 28);

  const key = pairKey(aId, bId);
  const before = state.relationships[key] ?? 0;
  const after = clamp(before + scaled, -100, 100);
  state.relationships[key] = after;
  return after - before;
}

export function relationshipsOf(
  state: GameState,
  id: SurvivorId,
): { other: Survivor; value: number; bucket: RelationshipBucket }[] {
  const out: { other: Survivor; value: number; bucket: RelationshipBucket }[] = [];
  for (const other of state.survivors) {
    if (other.id === id || !other.alive) continue;
    const value = getRelationship(state, id, other.id);
    out.push({ other, value, bucket: bucketOf(value) });
  }
  return out.sort((x, y) => y.value - x.value);
}

/** Pairs at or beyond a bucket, used by event conditions and emergent checks. */
export function pairsInBucket(
  state: GameState,
  bucket: RelationshipBucket,
  direction: 'atLeast' | 'atMost' = 'atLeast',
): { a: Survivor; b: Survivor; value: number }[] {
  const order: RelationshipBucket[] = [
    'hatred',
    'resentment',
    'rivalry',
    'acquaintance',
    'trust',
    'friendship',
    'devotion',
  ];
  const target = order.indexOf(bucket);
  const out: { a: Survivor; b: Survivor; value: number }[] = [];
  const living = state.survivors.filter((s) => s.alive);
  for (let i = 0; i < living.length; i += 1) {
    for (let j = i + 1; j < living.length; j += 1) {
      const a = living[i]!;
      const b = living[j]!;
      const value = getRelationship(state, a.id, b.id);
      const index = order.indexOf(bucketOf(value));
      const match = direction === 'atLeast' ? index >= target : index <= target;
      if (match) out.push({ a, b, value });
    }
  }
  return out;
}

/**
 * Daily drift. Survivors who work, sleep, or travel together move toward each other;
 * everyone else slowly reverts to indifference.
 */
export function driftRelationships(state: GameState): void {
  const living = state.survivors.filter((s) => s.alive);
  const touched = new Set<string>();
  const r = BALANCE.relationships;

  const bond = (a: Survivor, b: Survivor, amount: number): void => {
    touched.add(pairKey(a.id, b.id));
    // Two people who already dislike each other do not bond by proximity alone.
    const current = getRelationship(state, a.id, b.id);
    const effective = current < -30 ? amount * 0.3 : amount;
    adjustRelationship(state, a.id, b.id, effective);
  };

  // Shared facility.
  for (const facility of state.facilities) {
    if (facility.staff.length < 2) continue;
    const staff = facility.staff
      .map((id) => living.find((s) => s.id === id))
      .filter((s): s is Survivor => Boolean(s));
    for (let i = 0; i < staff.length; i += 1) {
      for (let j = i + 1; j < staff.length; j += 1) {
        bond(staff[i]!, staff[j]!, r.coworkerDrift);
      }
    }
  }

  // Shared expedition.
  for (const expedition of state.expeditions) {
    const members = expedition.members
      .map((id) => living.find((s) => s.id === id))
      .filter((s): s is Survivor => Boolean(s));
    for (let i = 0; i < members.length; i += 1) {
      for (let j = i + 1; j < members.length; j += 1) {
        bond(members[i]!, members[j]!, r.expeditionDrift);
      }
    }
  }

  // Everyone shares the bunks, so there is always a faint positive pull.
  for (let i = 0; i < living.length; i += 1) {
    for (let j = i + 1; j < living.length; j += 1) {
      const a = living[i]!;
      const b = living[j]!;
      const key = pairKey(a.id, b.id);
      if (touched.has(key)) continue;
      const current = state.relationships[key] ?? 0;
      // Low-morale crews grate on each other instead of bonding.
      const moraleAvg = (a.morale + b.morale) / 2;
      if (moraleAvg < 35) {
        adjustRelationship(state, a.id, b.id, -r.bunkDrift * 0.8);
      } else if (Math.abs(current) < 5) {
        adjustRelationship(state, a.id, b.id, r.bunkDrift);
      } else {
        // Decay toward zero.
        const decay = Math.sign(current) * -Math.min(r.decayRate, Math.abs(current));
        state.relationships[key] = clamp(current + decay, -100, 100);
      }
    }
  }
}

/**
 * When one member of a devoted pair would die, the other may take the wound instead.
 * Returns the interposing survivor, if any.
 */
export function findInterposer(
  state: GameState,
  victim: Survivor,
  candidates: readonly Survivor[],
  roll: number,
): Survivor | undefined {
  let best: Survivor | undefined;
  let bestChance = 0;
  for (const candidate of candidates) {
    if (candidate.id === victim.id || !candidate.alive) continue;
    if (candidate.health < 45) continue;
    const value = getRelationship(state, victim.id, candidate.id);
    const bucket = bucketOf(value);
    let chance = T.guardianChance(candidate);
    if (bucket === 'devotion') chance = Math.max(chance, BALANCE.relationships.devotionInterposeChance);
    else if (bucket === 'friendship') chance = Math.max(chance, 0.22);
    if (chance > bestChance) {
      bestChance = chance;
      best = candidate;
    }
  }
  return best && roll < bestChance ? best : undefined;
}

/** Work penalty applied when survivors who hate each other share a facility. */
export function hasHostilePair(
  state: GameState,
  staff: readonly SurvivorId[],
): { a: SurvivorId; b: SurvivorId } | null {
  for (let i = 0; i < staff.length; i += 1) {
    for (let j = i + 1; j < staff.length; j += 1) {
      const value = getRelationship(state, staff[i]!, staff[j]!);
      if (bucketOf(value) === 'hatred') return { a: staff[i]!, b: staff[j]! };
    }
  }
  return null;
}
