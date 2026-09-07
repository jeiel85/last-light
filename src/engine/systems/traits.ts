import type {
  ConditionId,
  FacilityId,
  SkillId,
  Survivor,
  TraitEffect,
  TraitId,
} from '../model/types';
import { TRAIT_BY_ID } from '../data/traits';

/**
 * Trait resolution.
 *
 * Traits declare their effects as data; this module is the only place that reads them.
 * Every query returns a plain number (a multiplier, a delta, or a probability) so callers
 * can fold it into a `BreakdownBuilder` with a label the player can read.
 */

function effectsOf(survivor: Survivor): TraitEffect[] {
  const out: TraitEffect[] = [];
  for (const id of survivor.traits) {
    const def = TRAIT_BY_ID[id];
    if (def) out.push(...def.effects);
  }
  return out;
}

/** Named contributions, so the UI can show *which* trait caused a modifier. */
export interface TraitContribution {
  traitId: TraitId;
  traitName: string;
  value: number;
}

function contributions(
  survivor: Survivor,
  predicate: (effect: TraitEffect) => number | null,
): TraitContribution[] {
  const out: TraitContribution[] = [];
  for (const id of survivor.traits) {
    const def = TRAIT_BY_ID[id];
    if (!def) continue;
    for (const effect of def.effects) {
      const value = predicate(effect);
      if (value !== null) out.push({ traitId: id, traitName: def.name, value });
    }
  }
  return out;
}

/* -------------------------------------------------------------------- work */

export function workMultiplierContributions(
  survivor: Survivor,
  facilityId: FacilityId | undefined,
  skill: SkillId | undefined,
): TraitContribution[] {
  return contributions(survivor, (e) => {
    if (e.kind !== 'workMultiplier') return null;
    if (e.facility && e.facility !== facilityId) return null;
    if (e.skill && e.skill !== skill) return null;
    return e.factor;
  });
}

export function shiftContributions(
  survivor: Survivor,
  shift: 'day' | 'night',
): TraitContribution[] {
  return contributions(survivor, (e) =>
    e.kind === 'shiftBonus' && e.shift === shift ? e.factor : null,
  );
}

/* ------------------------------------------------------------------- needs */

export function needRateFactor(
  survivor: Survivor,
  need: 'hunger' | 'fatigue' | 'morale' | 'health',
): number {
  let factor = 1;
  for (const e of effectsOf(survivor)) {
    if (e.kind === 'needRate' && e.need === need) factor *= e.factor;
  }
  return factor;
}

export function restQualityFactor(survivor: Survivor): number {
  let factor = 1;
  for (const e of effectsOf(survivor)) if (e.kind === 'restQuality') factor *= e.factor;
  return factor;
}

export function foodToleranceFactor(survivor: Survivor): number {
  let factor = 1;
  for (const e of effectsOf(survivor)) if (e.kind === 'foodTolerance') factor *= e.factor;
  return factor;
}

export function stressPerDay(survivor: Survivor): number {
  let total = 0;
  for (const e of effectsOf(survivor)) if (e.kind === 'stressPerDay') total += e.amount;
  return total;
}

/* ------------------------------------------------------------------ morale */

/** Morale aura contributed to *others* in the given radius. */
export function moraleAura(survivor: Survivor, radius: 'facility' | 'base'): number {
  let total = 0;
  for (const e of effectsOf(survivor)) {
    if (e.kind === 'moraleAura' && e.radius === radius) total += e.amount;
  }
  return total;
}

export function hopeOnDeathDelta(survivor: Survivor): number {
  let total = 0;
  for (const e of effectsOf(survivor)) if (e.kind === 'hopeOnDeath') total += e.delta;
  return total;
}

/** Facilities the survivor psychologically requires, with the daily penalty if absent. */
export function facilityRequirements(
  survivor: Survivor,
): { facility: FacilityId; moralePerDay: number }[] {
  const out: { facility: FacilityId; moralePerDay: number }[] = [];
  for (const e of effectsOf(survivor)) {
    if (e.kind === 'requiresFacility') out.push({ facility: e.facility, moralePerDay: e.moralePerDay });
  }
  return out;
}

/* ---------------------------------------------------------------- medicine */

export function injuryChanceFactor(survivor: Survivor): number {
  let factor = 1;
  for (const e of effectsOf(survivor)) if (e.kind === 'injuryChance') factor *= e.factor;
  return factor;
}

export function injurySeverityFactor(survivor: Survivor): number {
  let factor = 1;
  for (const e of effectsOf(survivor)) if (e.kind === 'injurySeverity') factor *= e.factor;
  return factor;
}

export function illnessChanceFactor(survivor: Survivor): number {
  let factor = 1;
  for (const e of effectsOf(survivor)) if (e.kind === 'illnessChance') factor *= e.factor;
  return factor;
}

export function treatmentQualityFactor(survivor: Survivor): number {
  let factor = 1;
  for (const e of effectsOf(survivor)) if (e.kind === 'treatmentQuality') factor *= e.factor;
  return factor;
}

export function treatmentCostDelta(survivor: Survivor): number {
  let delta = 0;
  for (const e of effectsOf(survivor)) if (e.kind === 'treatmentCost') delta += e.delta;
  return delta;
}

export function isImmuneTo(survivor: Survivor, conditionId: ConditionId): boolean {
  for (const e of effectsOf(survivor)) {
    if (e.kind === 'immunity' && e.condition === conditionId) return true;
  }
  return false;
}

/* -------------------------------------------------------------- expedition */

export function scavengeYieldFactor(survivor: Survivor): number {
  let factor = 1;
  for (const e of effectsOf(survivor)) if (e.kind === 'scavengeYield') factor *= e.factor;
  return factor;
}

export function combatPowerDelta(survivor: Survivor): number {
  let delta = 0;
  for (const e of effectsOf(survivor)) if (e.kind === 'combatPower') delta += e.delta;
  return delta;
}

export function retreatChanceDelta(survivor: Survivor): number {
  let delta = 0;
  for (const e of effectsOf(survivor)) if (e.kind === 'retreatChance') delta += e.delta;
  return delta;
}

export function packCapacityDelta(survivor: Survivor): number {
  let delta = 0;
  for (const e of effectsOf(survivor)) if (e.kind === 'packCapacity') delta += e.delta;
  return delta;
}

export function expeditionSpeedFactor(survivor: Survivor): number {
  let factor = 1;
  for (const e of effectsOf(survivor)) if (e.kind === 'expeditionSpeed') factor *= e.factor;
  return factor;
}

export function guardianChance(survivor: Survivor): number {
  let best = 0;
  for (const e of effectsOf(survivor)) if (e.kind === 'guardian') best = Math.max(best, e.chance);
  return best;
}

/* ------------------------------------------------------------------ crafting */

export function craftFreeChance(survivor: Survivor): number {
  let chance = 0;
  for (const e of effectsOf(survivor)) {
    if (e.kind === 'craftCostChance') chance = 1 - (1 - chance) * (1 - e.chance);
  }
  return chance;
}

export function researchRateFactor(survivor: Survivor): number {
  let factor = 1;
  for (const e of effectsOf(survivor)) if (e.kind === 'researchRate') factor *= e.factor;
  return factor;
}

/* ------------------------------------------------------------- relationships */

export function relationshipDriftFactor(
  survivor: Survivor,
  direction: 'positive' | 'negative',
): number {
  let factor = 1;
  for (const e of effectsOf(survivor)) {
    if (e.kind === 'relationshipDrift' && e.direction === direction) factor *= e.factor;
  }
  return factor;
}

/* -------------------------------------------------------------------- events */

export function eventWeightFactor(survivors: readonly Survivor[], tags: readonly string[]): number {
  let factor = 1;
  for (const survivor of survivors) {
    if (!survivor.alive) continue;
    for (const e of effectsOf(survivor)) {
      if (e.kind === 'eventWeight' && tags.includes(e.tag)) factor *= e.factor;
    }
  }
  return factor;
}

export function hasTrait(survivor: Survivor, traitId: TraitId): boolean {
  return survivor.traits.includes(traitId);
}
