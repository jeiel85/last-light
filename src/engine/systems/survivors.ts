import { t } from '../../i18n';
import {
  conditionName,
  facilityName as facilityLabel,
  skillName,
} from '../../i18n/content';
import type {
  ConditionId,
  FacilityDef,
  FacilityInstance,
  GameState,
  SkillId,
  SkillMap,
  Survivor,
  SurvivorId,
  TraitDef,
  TraitId,
} from '../model/types';
import { SKILL_IDS } from '../model/types';
import type { Rng } from '../core/rng';
import { BreakdownBuilder, type Breakdown } from '../core/breakdown';
import { clamp, remap, stableHash } from '../core/math';
import { BALANCE } from '../data/balance';
import { BACKGROUNDS, BACKGROUND_BY_ID, type BackgroundDef } from '../data/backgrounds';
import { PERSONALITIES, PERSONALITY_BY_ID } from '../data/personalities';
import { GIVEN_NAMES_A, GIVEN_NAMES_B, GIVEN_NAMES_N, SURNAMES } from '../data/names';
import { BASE_TRAIT_POOL, TRAITS, TRAIT_BY_ID } from '../data/traits';
import { CONDITION_BY_ID } from '../data/conditions';
import * as T from './traits';

/* ------------------------------------------------------------------ generation */

export interface GenerateOptions {
  day: number;
  /** Unlock ids owned by the player, gating extra traits into the pool. */
  unlocks?: readonly string[];
  /** Force a background, e.g. for scenario-guaranteed roles. */
  backgroundId?: string;
  /** Bias generation toward a skill. */
  skillHint?: SkillId;
  traitHint?: TraitId;
  /** Skill floor applied to the primary skill; used by scenario starts. */
  minPrimary?: number;
  /**
   * Monotonic sequence number used to mint a unique id. Callers pass `state.idCounter`
   * so that ids stay deterministic for a given seed even across many runs in one process.
   */
  idSeq: number;
}

function emptySkills(): SkillMap {
  return {
    medicine: 0,
    engineering: 0,
    combat: 0,
    scavenging: 0,
    cooking: 0,
    science: 0,
    botany: 0,
    negotiation: 0,
  };
}

function pickBackground(rng: Rng, options: GenerateOptions): BackgroundDef {
  if (options.backgroundId && BACKGROUND_BY_ID[options.backgroundId]) {
    return BACKGROUND_BY_ID[options.backgroundId]!;
  }
  const entries = BACKGROUNDS.map((b) => ({
    value: b,
    weight:
      b.weight *
      (options.skillHint && (b.primary === options.skillHint || b.secondary === options.skillHint)
        ? 6
        : 1),
  }));
  return rng.weighted(entries);
}

function pickTraits(rng: Rng, background: BackgroundDef, options: GenerateOptions): TraitId[] {
  const unlocks = options.unlocks ?? [];
  const pool: TraitDef[] = TRAITS.filter(
    (t) => !t.requiresUnlock || unlocks.includes(t.requiresUnlock),
  );
  const chosen: TraitId[] = [];
  let budget = BALANCE.survivorGen.traitBudget;

  const canTake = (t: TraitDef): boolean => {
    if (chosen.includes(t.id)) return false;
    if (t.conflicts?.some((c) => chosen.includes(c))) return false;
    for (const id of chosen) {
      const other = TRAIT_BY_ID[id];
      if (other?.conflicts?.includes(t.id)) return false;
    }
    return true;
  };

  if (options.traitHint && TRAIT_BY_ID[options.traitHint]) {
    const hinted = TRAIT_BY_ID[options.traitHint]!;
    if (!hinted.requiresUnlock || unlocks.includes(hinted.requiresUnlock)) {
      chosen.push(hinted.id);
      budget -= hinted.cost;
    }
  }

  // Affinity trait first: this is what makes a Mechanic feel like a mechanic.
  const affinity = pool.filter((t) => background.traitAffinity.includes(t.id) && canTake(t));
  if (affinity.length > 0 && rng.chance(0.75)) {
    const pick = rng.pick(affinity);
    chosen.push(pick.id);
    budget -= pick.cost;
  }

  const target = rng.int(BALANCE.survivorGen.minTraits, BALANCE.survivorGen.maxTraits);
  let guard = 0;
  while (chosen.length < target && guard < 60) {
    guard += 1;
    // When over budget, only flaws are affordable; when under, prefer positives.
    const wantFlaw = budget <= 0;
    const candidates = pool.filter(
      (t) => canTake(t) && (wantFlaw ? t.cost < 0 : t.cost >= 0) && t.cost <= budget + 3,
    );
    if (candidates.length === 0) break;
    const weights = candidates.map((t) => ({
      value: t,
      weight: background.traitAffinity.includes(t.id) ? 4 : 1,
    }));
    const pick = rng.weighted(weights);
    chosen.push(pick.id);
    budget -= pick.cost;
  }

  if (chosen.length < BALANCE.survivorGen.minTraits) {
    const filler = pool.filter(canTake);
    while (chosen.length < BALANCE.survivorGen.minTraits && filler.length > 0) {
      const pick = rng.pick(filler);
      if (canTake(pick)) chosen.push(pick.id);
      else break;
    }
  }

  return chosen;
}

function rollSkills(
  rng: Rng,
  background: BackgroundDef,
  traits: readonly TraitId[],
  age: number,
  minPrimary: number | undefined,
): SkillMap {
  const skills = emptySkills();
  const [oMin, oMax] = BALANCE.survivorGen.otherSkillRange;
  for (const id of SKILL_IDS) skills[id] = rng.int(oMin, oMax);

  const [pMin, pMax] = BALANCE.survivorGen.primarySkillRange;
  const [sMin, sMax] = BALANCE.survivorGen.secondarySkillRange;
  skills[background.primary] = Math.max(skills[background.primary], rng.int(pMin, pMax));
  skills[background.secondary] = Math.max(skills[background.secondary], rng.int(sMin, sMax));

  // Experience curve: older survivors are a little better at their trade, worse at combat.
  const experience = clamp(Math.round((age - 30) / 14), -1, 2);
  skills[background.primary] = clamp(skills[background.primary] + experience, 0, 10);
  if (age > 55) skills.combat = clamp(skills.combat - 1, 0, 10);
  if (age < 22) skills.combat = clamp(skills.combat + 1, 0, 10);

  for (const traitId of traits) {
    const mods = TRAIT_BY_ID[traitId]?.skillMods;
    if (!mods) continue;
    for (const [skill, delta] of Object.entries(mods) as [SkillId, number][]) {
      skills[skill] = clamp(skills[skill] + delta, 0, 10);
    }
  }

  if (minPrimary !== undefined) {
    skills[background.primary] = Math.max(skills[background.primary], minPrimary);
  }

  return skills;
}

export function generateSurvivor(rng: Rng, options: GenerateOptions): Survivor {
  const background = pickBackground(rng, options);
  const [ageMin, ageMax] = BALANCE.survivorGen.ageRange;
  const age = Math.round(rng.normal((ageMin + ageMax) / 2, 11));
  const clampedAge = clamp(age, ageMin, ageMax);

  const pronounRoll = rng.next();
  const pronouns = pronounRoll < 0.45 ? 'she/her' : pronounRoll < 0.9 ? 'he/him' : 'they/them';
  const pool =
    pronouns === 'she/her'
      ? GIVEN_NAMES_A
      : pronouns === 'he/him'
        ? GIVEN_NAMES_B
        : GIVEN_NAMES_N;
  const name = rng.pick(pool);
  const surname = rng.pick(SURNAMES);

  const traits = pickTraits(rng, background, options);
  const skills = rollSkills(rng, background, traits, clampedAge, options.minPrimary);
  const personality = rng.pick(PERSONALITIES);

  const [hMin, hMax] = BALANCE.survivorGen.startingHealth;
  const [mMin, mMax] = BALANCE.survivorGen.startingMorale;

  const id = `s${options.day}_${options.idSeq}_${rng.int(1000, 9999)}`;

  const survivor: Survivor = {
    id,
    name,
    surname,
    age: clampedAge,
    pronouns,
    occupation: background.occupation,
    backgroundId: background.id,
    personalityId: personality.id,
    portraitSeed: stableHash(`${id}:${name}:${surname}`),
    traits,
    skills,
    health: rng.int(hMin, hMax),
    hunger: rng.int(8, 26),
    fatigue: rng.int(6, 24),
    morale: rng.int(mMin, mMax),
    conditions: [],
    equipment: {},
    assignment: { kind: 'idle' },
    history: [{ day: options.day, text: t('engine.history.arrived'), tone: 'neutral' }],
    joinedDay: options.day,
    alive: true,
    stress: 0,
    grievingDays: 0,
    expeditionsCompleted: 0,
  };

  if (traits.includes('exhausted')) survivor.fatigue = clamp(survivor.fatigue + 26, 0, 100);
  if (traits.includes('burned_out')) survivor.morale = clamp(survivor.morale - 12, 0, 100);
  if (traits.includes('dust_lung')) survivor.health = clamp(survivor.health - 8, 1, 100);

  return survivor;
}

/* --------------------------------------------------------------------- queries */

export function fullName(survivor: Survivor): string {
  return `${survivor.name} ${survivor.surname}`;
}

export function livingSurvivors(state: GameState): Survivor[] {
  return state.survivors.filter((s) => s.alive);
}

export function survivorById(state: GameState, id: SurvivorId): Survivor | undefined {
  return state.survivors.find((s) => s.id === id);
}

export function personalityOf(survivor: Survivor) {
  return PERSONALITY_BY_ID[survivor.personalityId] ?? PERSONALITIES[0]!;
}

export function backgroundOf(survivor: Survivor): BackgroundDef {
  return BACKGROUND_BY_ID[survivor.backgroundId] ?? BACKGROUNDS[0]!;
}

/** Total work penalty from active conditions, as a multiplier in [0.4, 1]. */
export function conditionWorkFactor(survivor: Survivor): number {
  let penalty = 0;
  for (const condition of survivor.conditions) {
    const def = CONDITION_BY_ID[condition.id];
    if (!def) continue;
    penalty += def.workPenaltyAtFull * (condition.severity / 100);
  }
  return clamp(1 - Math.min(penalty, BALANCE.efficiency.conditionPenaltyCap), 0.4, 1);
}

export function isIncapacitated(survivor: Survivor): boolean {
  if (!survivor.alive) return true;
  if (survivor.health < BALANCE.needs.incapacitatedBelow) return true;
  return survivor.conditions.some((c) => {
    const def = CONDITION_BY_ID[c.id];
    return def?.workPenaltyAtFull === 1 && c.severity > 55;
  });
}

/** The worst untreated condition's name, or a generic label when there is none to name. */
function worstConditionLabel(id: string | undefined): string {
  const def = id ? CONDITION_BY_ID[id] : undefined;
  return def ? conditionName(def) : t('engine.eff.injured');
}

export function canJoinExpedition(survivor: Survivor): { ok: boolean; reason?: string } {
  if (!survivor.alive) return { ok: false, reason: t('engine.join.deceased') };
  if (survivor.health < 40) return { ok: false, reason: t('engine.join.hurt') };
  if (survivor.fatigue > 88) return { ok: false, reason: t('engine.join.exhausted') };
  for (const condition of survivor.conditions) {
    const def = CONDITION_BY_ID[condition.id];
    if (def?.blocksExpedition && condition.severity > 25) {
      return {
        ok: false,
        reason: t('engine.join.condition', {
          name: conditionName(def),
          severity: Math.round(condition.severity),
        }),
      };
    }
  }
  return { ok: true };
}

export function hasCondition(survivor: Survivor, id: ConditionId): boolean {
  return survivor.conditions.some((c) => c.id === id);
}

/* ------------------------------------------------------------------ efficiency */

export interface EfficiencyContext {
  facility?: FacilityInstance;
  facilityDef?: FacilityDef;
  /** Other survivors assigned to the same facility. */
  coworkers?: readonly Survivor[];
  relationships?: Record<string, number>;
  brownedOut?: boolean;
  shift?: 'day' | 'night';
}

/**
 * Work efficiency as a multiplier around 1.0, with every contributing term labelled.
 * This is the single formula the design brief promises to expose in the job tooltip.
 */
export function workEfficiency(
  survivor: Survivor,
  skill: SkillId | undefined,
  ctx: EfficiencyContext = {},
): Breakdown {
  const b = new BreakdownBuilder(t('engine.base'), 1);
  const e = BALANCE.efficiency;

  if (skill) {
    const level = survivor.skills[skill];
    const factor = remap(level, 0, 10, e.skillMin, e.skillMax);
    b.mul(
      t('engine.eff.skill', { skill: skillName(skill, skillLabel(skill)), level }),
      factor,
      t('engine.eff.skillNote', { min: e.skillMin, max: e.skillMax }),
    );
  }

  const healthFactor = remap(survivor.health, 20, 100, e.healthMin, e.healthMax);
  b.mul(
    t('engine.eff.health', { value: Math.round(survivor.health) }),
    healthFactor,
    healthFactor < 0.85 ? t('engine.eff.healthNote') : undefined,
    healthFactor < 0.7 ? t('engine.eff.healthFix') : undefined,
  );

  const fatigueFactor =
    survivor.fatigue <= BALANCE.needs.fatigueWorkThreshold
      ? remap(survivor.fatigue, 0, BALANCE.needs.fatigueWorkThreshold, e.fatigueMax, 1.0)
      : remap(survivor.fatigue, BALANCE.needs.fatigueWorkThreshold, 100, 1.0, e.fatigueMin);
  b.mul(
    t('engine.eff.fatigue', { value: Math.round(survivor.fatigue) }),
    fatigueFactor,
    undefined,
    fatigueFactor < 0.85 ? t('engine.eff.fatigueFix') : undefined,
  );

  const moraleFactor = remap(survivor.morale, 0, 100, e.moraleMin, e.moraleMax);
  b.mul(t('engine.eff.morale', { value: Math.round(survivor.morale) }), moraleFactor);

  const conditionFactor = conditionWorkFactor(survivor);
  if (conditionFactor < 1) {
    const worst = survivor.conditions
      .slice()
      .sort((x, y) => y.severity - x.severity)[0];
    b.mul(
      worstConditionLabel(worst?.id),
      conditionFactor,
      t('engine.eff.conditionNote'),
      t('engine.eff.conditionFix'),
    );
  }

  if (ctx.facility && ctx.facilityDef) {
    const levelFactor = e.facilityLevel[ctx.facility.level - 1] ?? 1;
    b.mul(
      t('engine.facilityLevel', {
        name: facilityLabel(ctx.facilityDef),
        level: ctx.facility.level,
      }),
      levelFactor,
    );
    if (ctx.facility.condition < 70) {
      const conditionMul = remap(ctx.facility.condition, 0, 70, 0.55, 1);
      b.mul(
        t('engine.eff.wear'),
        conditionMul,
        t('engine.conditionPct', { value: Math.round(ctx.facility.condition) }),
        t('engine.eff.wearFix'),
      );
    }
  }

  for (const contribution of T.workMultiplierContributions(
    survivor,
    ctx.facilityDef?.id,
    skill,
  )) {
    b.mul(contribution.traitName, contribution.value);
  }

  if (ctx.shift) {
    for (const contribution of T.shiftContributions(survivor, ctx.shift)) {
      b.mul(
        t('engine.eff.shiftTrait', {
          trait: contribution.traitName,
          shift: t(`engine.eff.shift.${ctx.shift}`),
        }),
        contribution.value,
      );
    }
  }

  if (ctx.brownedOut) {
    b.mul(
      t('engine.brownedOut'),
      e.brownoutFactor,
      t('engine.eff.brownoutNote'),
      t('engine.eff.brownoutFix'),
    );
  }

  if (ctx.coworkers && ctx.relationships && ctx.coworkers.length > 0) {
    const relFactor = coworkerFactor(survivor, ctx.coworkers, ctx.relationships);
    if (Math.abs(relFactor - 1) > 0.005) {
      b.mul(
        relFactor >= 1 ? t('engine.eff.teamGood') : t('engine.eff.teamBad'),
        relFactor,
        relFactor < 1 ? t('engine.eff.teamNote') : undefined,
        relFactor < 1 ? t('engine.eff.teamFix') : undefined,
      );
    }
  }

  if (survivor.grievingDays > 0) {
    b.mul(
      t('engine.eff.grieving'),
      0.8,
      t('engine.eff.grievingNote', { days: survivor.grievingDays }),
    );
  }

  return b.build({ min: 0.05, round: 3 });
}

function coworkerFactor(
  survivor: Survivor,
  coworkers: readonly Survivor[],
  relationships: Record<string, number>,
): number {
  const others = coworkers.filter((c) => c.id !== survivor.id);
  if (others.length === 0) return 1;
  let total = 0;
  for (const other of others) {
    const key = survivor.id < other.id ? `${survivor.id}|${other.id}` : `${other.id}|${survivor.id}`;
    total += relationships[key] ?? 0;
  }
  const avg = total / others.length;
  return remap(avg, -100, 100, BALANCE.efficiency.relationshipMin, BALANCE.efficiency.relationshipMax);
}

export function skillLabel(skill: SkillId): string {
  switch (skill) {
    case 'medicine':
      return 'Medicine';
    case 'engineering':
      return 'Engineering';
    case 'combat':
      return 'Combat';
    case 'scavenging':
      return 'Scavenging';
    case 'cooking':
      return 'Cooking';
    case 'science':
      return 'Science';
    case 'botany':
      return 'Botany';
    case 'negotiation':
      return 'Negotiation';
  }
}

/** The best living survivor for a skill, ignoring the incapacitated. */
export function bestAtSkill(
  survivors: readonly Survivor[],
  skill: SkillId,
): Survivor | undefined {
  let best: Survivor | undefined;
  let bestScore = -1;
  for (const survivor of survivors) {
    if (!survivor.alive || isIncapacitated(survivor)) continue;
    const score = survivor.skills[skill] + survivor.health / 200;
    if (score > bestScore) {
      bestScore = score;
      best = survivor;
    }
  }
  return best;
}

export function addHistory(
  survivor: Survivor,
  day: number,
  text: string,
  tone: 'good' | 'bad' | 'neutral' = 'neutral',
): void {
  survivor.history.push({ day, text, tone });
  if (survivor.history.length > 60) survivor.history.splice(0, survivor.history.length - 60);
}

/** Apply a condition, merging with an existing instance of the same kind. */
export function applyCondition(
  survivor: Survivor,
  conditionId: ConditionId,
  severity: number,
  day: number,
): boolean {
  if (T.isImmuneTo(survivor, conditionId)) return false;
  const def = CONDITION_BY_ID[conditionId];
  if (!def) return false;
  const scaled =
    def.kind === 'injury' ? severity * T.injurySeverityFactor(survivor) : severity;
  const existing = survivor.conditions.find((c) => c.id === conditionId);
  if (existing) {
    existing.severity = clamp(existing.severity + scaled * 0.6, 0, 100);
    existing.treated = false;
    return false;
  }
  survivor.conditions.push({
    id: conditionId,
    age: 0,
    severity: clamp(scaled, 1, 100),
    treated: false,
    acquiredDay: day,
  });
  addHistory(survivor, day, t('engine.history.suffered', { condition: conditionName(def).toLowerCase() }), 'bad');
  return true;
}

export function removeCondition(survivor: Survivor, conditionId: ConditionId): boolean {
  const index = survivor.conditions.findIndex((c) => c.id === conditionId);
  if (index < 0) return false;
  survivor.conditions.splice(index, 1);
  return true;
}

/** Trait pool available for display in the encyclopedia. */
export const ALL_TRAITS = BASE_TRAIT_POOL;
