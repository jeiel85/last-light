import { t } from '../../i18n';
import { ENDING_BY_ID } from './endings';
import {
  conditionName,
  endingSummary,
  resourceName,
  weatherDescription,
  weatherName,
} from '../../i18n/content';
import type {
  DayReport,
  GameState,
  LogEntry,
  LogTone,
  Survivor,
  WeatherId,
} from '../model/types';
import { RESOURCE_IDS } from '../model/types';
import { rngFromState, type Rng } from '../core/rng';
import { clamp } from '../core/math';
import { BALANCE } from '../data/balance';
import { CONDITION_BY_ID } from '../data/conditions';
import { RESOURCES } from '../data/resources';
import { SCENARIO_BY_ID } from '../data/scenarios';
import { WEATHER, WEATHER_LIST } from '../data/weather';
import {
  allocatePower,
  overcrowding,
  applyConstructionLabour,
  decayFacilities,
  findFacility,
  isOperational,
  operationalLevel,
  staffOf,
  totalLabourPool,
} from './facilities';
import { resolveResources } from './resources';
import { progressCrafting } from './crafting';
import { insightRate, progressResearch } from './research';
import { driftRelationships, hasHostilePair, getRelationship } from './relationships';
import {
  addHistory,
  applyCondition,
  fullName,
  isIncapacitated,
  livingSurvivors,
  removeCondition,
} from './survivors';
import { deliverExpedition, killSurvivor } from './expedition';
import { dropUnknownEvents, selectEvents, tickEventCooldowns } from './events/select';
import { regenerateWorld } from './world';
import { detectEnding, buildEndingResult, updateEndingProgress } from './endings';
import * as T from './traits';

/**
 * The day pipeline.
 *
 * `advanceDay` is the only function that moves time forward. It is deterministic given the
 * state and its RNG, which is what lets the headless simulator and the UI exercise exactly
 * the same code path. Events are *queued* rather than resolved here: the caller presents
 * them and calls `resolveEvent`, which is why the AI agent and a human player go through
 * the same event code.
 */

export interface AdvanceResult {
  report: DayReport;
  /** Events waiting for the player. The day is not "over" until these are resolved. */
  pendingEvents: number;
  ended: boolean;
  /**
   * What the research step actually saw, sampled at the moment it ran.
   *
   * Research advances at stage 5, but fatigue, conditions, refusals, facility decay and
   * event effects all land afterwards, at stages 6 to 12. A caller that reads the insight
   * rate or the laboratory's staffing once the day is over is reading a different day: a
   * scientist who produced insight and then walked off the post counts as unstaffed, and an
   * event recruit counts the other way. The balance report drew its `unreachable-tier`
   * diagnosis from exactly those numbers, so it has to be told the ones that were used.
   */
  research: ResearchDaySample;
}

export interface ResearchDaySample {
  /** Insight generated this day, at the rate `progressResearch` spent. */
  insight: number;
  labOperational: boolean;
  labStaffed: boolean;
  /** 0 when there is no laboratory. */
  labLevel: number;
}

function log(state: GameState, tone: LogTone, text: string, channel?: string): void {
  state.idCounter += 1;
  const entry: LogEntry = {
    id: `log${state.idCounter}`,
    day: state.day,
    tone,
    text,
    ...(channel ? { channel } : {}),
  };
  state.log.push(entry);
  if (state.log.length > 400) state.log.splice(0, state.log.length - 400);
}

export function advanceDay(state: GameState): AdvanceResult {
  const rng = rngFromState(state.rng);
  const notes: string[] = [];
  const survivorNotes: DayReport['survivorNotes'] = [];
  const deaths: DayReport['deaths'] = [];

  state.day += 1;

  /* 1 — returning expeditions */
  for (const expedition of state.expeditions.slice()) {
    if (expedition.resolved && expedition.returnDay <= state.day) {
      for (const line of deliverExpedition(state, expedition)) {
        notes.push(line);
        log(state, 'good', line, t('engine.channel.expedition'));
      }
    }
  }

  /* 2 — weather */
  rollWeather(state, rng);

  /* 3 — power allocation */
  const power = allocatePower(state);
  if (power.brownedOut.length > 0) {
    state.stats.brownoutDays += 1;
    log(
      state,
      'warn',
      power.brownedOut.length === 1
        ? t('engine.powerShortOne', { amount: Math.round(power.deficit) })
        : t('engine.powerShort', {
            amount: Math.round(power.deficit),
            count: power.brownedOut.length,
          }),
      t('engine.channel.power'),
    );
  }

  /* 4 — production and consumption */
  const resolution = resolveResources(state);
  /*
   * A shortage escalates rather than repeating. Logging the identical line every night
   * turned the most serious thing in the game into wallpaper the player scrolled past.
   */
  for (const id of RESOURCE_IDS) {
    const key = `shortfall:${id}`;
    if (!resolution.shortfalls.includes(id)) {
      delete state.flags[key];
      continue;
    }
    const run = Number(state.flags[key] ?? 0) + 1;
    state.flags[key] = run;
    const name = resourceName(RESOURCES[id]).toLowerCase();
    const stores = t('engine.channel.stores');
    if (run === 1) log(state, 'bad', t('engine.ranOut', { name }), stores);
    else if (run === 2) log(state, 'bad', t('engine.ranOutSecond', { name }), stores);
    else if (run === 3) log(state, 'bad', t('engine.ranOutThird', { name }), stores);
    else if (run % 3 === 0) log(state, 'bad', t('engine.ranOutMany', { name, days: run }), stores);
  }

  /* 5 — construction, crafting, research */
  const labour = totalLabourPool(state);
  for (const note of applyConstructionLabour(state, labour)) {
    notes.push(note);
    log(state, 'good', note, t('engine.channel.works'));
  }
  for (const note of progressCrafting(state)) {
    notes.push(note);
    log(state, 'good', note, t('engine.channel.workshop'));
  }
  /*
   * Sampled here, immediately before the research step, not after the day. See
   * `ResearchDaySample`. `insightRate` is pure, so this reads exactly the value
   * `progressResearch` is about to use.
   */
  const lab = findFacility(state, 'laboratory');
  const labOperational = Boolean(lab && lab.status === 'operational');
  const research: ResearchDaySample = {
    insight: insightRate(state).total,
    labOperational,
    labStaffed: labOperational && staffOf(state, lab!).length > 0,
    labLevel: lab?.level ?? 0,
  };

  for (const note of progressResearch(state, rng)) {
    notes.push(note);
    log(state, 'good', note, t('engine.channel.research'));
  }

  /* 6 — survivor needs */
  applySurvivorNeeds(state, rng, resolution.shortfalls, survivorNotes);

  /* 7 — conditions and treatment */
  progressConditions(state, rng, survivorNotes, deaths);

  /* 8 — relationships */
  driftRelationships(state);
  resolveHostilities(state, rng, survivorNotes);

  /* 9 — facilities */
  const decay = decayFacilities(state, rng);
  for (const note of decay.notes) {
    notes.push(note);
    log(state, 'bad', note, t('engine.channel.maintenance'));
  }

  /* 10 — world drift */
  regenerateWorld(state);
  tickEventCooldowns(state);

  /* 11 — events queued for the player */
  const selection = selectEvents(state, rng);
  state.events.pending = selection.pending;
  // A save written by a build that had events this one does not would otherwise queue ids
  // that can never be presented, and the player would be stuck on a day that never ends.
  dropUnknownEvents(state);

  /* 12 — ending progress and detection */
  const powerSurplus = power.capacity.total - power.demand.total;
  updateEndingProgress(state, resolution.net.food, resolution.net.water, powerSurplus);
  applyDeadlineWarning(state);

  state.stats.daysSurvived = state.day;
  state.stats.peakSurvivors = Math.max(state.stats.peakSurvivors, livingSurvivors(state).length);

  const report: DayReport = {
    day: state.day,
    power,
    production: resolution.production,
    consumption: resolution.consumption,
    net: resolution.net,
    survivorNotes,
    facilityNotes: notes,
    deaths,
    weather: state.weather.id,
  };
  state.lastReport = report;

  const endingId = detectEnding(state);
  if (endingId) {
    state.ending = buildEndingResult(state, endingId);
    state.phase = 'ended';
    state.events.pending = [];
    log(
      state,
      'system',
      t('engine.runEnded', { summary: endingSummaryFor(state.ending.endingId, state.ending.summary) }),
      t('engine.channel.ending'),
    );
    state.rng = rng.snapshot();
    return { report, pendingEvents: 0, ended: true, research };
  }

  state.phase = state.events.pending.length > 0 ? 'events' : 'planning';
  state.rng = rng.snapshot();
  return { report, pendingEvents: state.events.pending.length, ended: false, research };
}

/* ------------------------------------------------------------------ weather */

function rollWeather(state: GameState, rng: Rng): void {
  const weatherRng = rng.fork(`weather:${state.day}`);
  const scenario = SCENARIO_BY_ID[state.scenarioId];
  const scenarioWeights = scenario?.modifiers.weatherWeights ?? {};
  const longWinter = state.modifiers.includes('mod_long_winter');

  const entries = WEATHER_LIST.map((w) => {
    let weight = scenarioWeights[w.id] ?? w.weight;
    // Weather is sticky: the same conditions tend to persist for two or three days.
    if (w.id === state.weather.id) weight *= state.weather.streak < 3 ? 2.2 : 0.6;
    if (longWinter && (w.id === 'cold_snap' || w.id === 'storm')) weight *= 2;
    return { value: w.id as WeatherId, weight };
  });

  const next = weatherRng.weighted(entries);
  const streak = next === state.weather.id ? state.weather.streak + 1 : 1;

  // A working radio room forecasts tomorrow, unless the scenario has taken that away.
  const canForecast =
    operationalLevel(state, 'radio_room') >= 1 && !state.flags['scenario.no_forecast'];
  const forecast = canForecast
    ? weatherRng.weighted(entries.map((e) => ({ ...e, weight: e.value === next ? e.weight * 1.5 : e.weight })))
    : null;

  state.weather = { id: next, streak, forecast };
  if (streak === 1) {
    log(
      state,
      'info',
      t('engine.day.weather', {
        name: weatherName(WEATHER[next]),
        description: weatherDescription(WEATHER[next]),
      }),
      t('engine.channel.weather'),
    );
  }
}

/* -------------------------------------------------------------------- needs */

function applySurvivorNeeds(
  state: GameState,
  rng: Rng,
  shortfalls: readonly string[],
  notes: DayReport['survivorNotes'],
): void {
  const foodShort = shortfalls.includes('food');
  const waterShort = shortfalls.includes('water');
  const bunks = operationalLevel(state, 'bunks');
  const galley = findFacility(state, 'galley');
  const halfRations = Boolean(state.flags['order:halfRations']);
  const crowding = overcrowding(state);
  const crowdRestFactor = crowding > 0 ? clamp(1 - crowding * 0.12, 0.45, 1) : 1;

  // Morale auras are computed once so a single Optimist lifts the whole room.
  const baseAura = livingSurvivors(state).reduce((acc, s) => acc + T.moraleAura(s, 'base'), 0);

  for (const survivor of state.survivors) {
    if (!survivor.alive) continue;

    /* hunger */
    const hungerRate = BALANCE.needs.hungerPerDay * T.needRateFactor(survivor, 'hunger');
    if (foodShort) {
      survivor.hunger = clamp(survivor.hunger + hungerRate, 0, 100);
    } else {
      const recovery = BALANCE.needs.hungerRecoveryPerMeal * (halfRations ? 0.55 : 1);
      survivor.hunger = clamp(survivor.hunger - recovery + hungerRate * 0.35, 0, 100);
    }

    /* fatigue */
    const assignment = survivor.assignment.kind;
    let fatigueDelta: number;
    if (assignment === 'rest') {
      const restQuality = T.restQualityFactor(survivor);
      const bunkBonus = BALANCE.needs.fatigueRecoveryBunks[bunks] ?? 0;
      fatigueDelta = -(BALANCE.needs.fatigueRecoveryResting + bunkBonus) * restQuality * crowdRestFactor;
    } else if (assignment === 'facility') {
      fatigueDelta = BALANCE.needs.fatigueFromWork * T.needRateFactor(survivor, 'fatigue');
    } else if (assignment === 'expedition') {
      fatigueDelta = 0; // applied on return
    } else {
      fatigueDelta = BALANCE.needs.fatigueFromIdle * T.needRateFactor(survivor, 'fatigue');
    }
    survivor.fatigue = clamp(survivor.fatigue + fatigueDelta, 0, 100);

    /* health */
    let healthDelta = 0;
    if (survivor.hunger > BALANCE.needs.hungerHealthThreshold) {
      healthDelta -= BALANCE.needs.hungerHealthPenalty;
      if (rng.chance(0.35)) applyCondition(survivor, 'malnutrition', 30, state.day);
    }
    if (waterShort) healthDelta -= BALANCE.needs.thirstHealthPenalty;
    if (healthDelta === 0 && survivor.hunger < 50) {
      const regen =
        BALANCE.needs.healthRegenPerDay * T.needRateFactor(survivor, 'health') +
        (assignment === 'rest' ? 2.5 : 0);
      healthDelta += regen;
    }
    survivor.health = clamp(survivor.health + healthDelta, 0, 100);

    /* morale */
    let moraleDelta = 0;
    const targetMorale = clamp(state.resources.hope, 0, 100);
    moraleDelta += (targetMorale - survivor.morale) * BALANCE.needs.moraleDriftRate;
    if (survivor.hunger > BALANCE.needs.hungerMoraleThreshold) {
      moraleDelta -= BALANCE.needs.hungerMoralePenalty;
    }
    if (waterShort) moraleDelta -= 5;
    if (galley && isOperational(galley) && galley.level >= 2 && !foodShort) moraleDelta += 1.5;
    if (bunks >= 2) moraleDelta += bunks === 3 ? 3 : 1;
    moraleDelta += WEATHER[state.weather.id].moraleDelta * 0.4;
    moraleDelta += baseAura;
    if (crowding > 0) moraleDelta -= 1.1 * crowding;

    // Facility-local auras.
    if (survivor.assignment.kind === 'facility' && survivor.assignment.facilityId) {
      const facility = state.facilities.find((f) => f.id === survivor.assignment.facilityId);
      if (facility) {
        for (const other of staffOf(state, facility)) {
          if (other.id === survivor.id) continue;
          moraleDelta += T.moraleAura(other, 'facility');
        }
      }
      if (facility?.brownedOut) moraleDelta -= BALANCE.power.brownoutMorale * 0.4;
    }

    for (const requirement of T.facilityRequirements(survivor)) {
      if (operationalLevel(state, requirement.facility) === 0) moraleDelta += requirement.moralePerDay;
    }

    moraleDelta *= moraleDelta > 0 ? T.needRateFactor(survivor, 'morale') : 1;
    survivor.morale = clamp(survivor.morale + moraleDelta, 0, 100);

    /* stress and grief */
    survivor.stress = clamp(survivor.stress + T.stressPerDay(survivor) - (assignment === 'rest' ? 3 : 0), 0, 100);
    if (survivor.grievingDays > 0) {
      survivor.grievingDays -= 1;
      if (survivor.grievingDays === 0) {
        removeCondition(survivor, 'grieving');
        const trait = survivor.morale > 45 ? 'hardened' : 'broken';
        if (!survivor.traits.includes(trait) && !survivor.traits.includes('hardened') && !survivor.traits.includes('broken')) {
          survivor.traits.push(trait);
          addHistory(
            survivor,
            state.day,
            trait === 'hardened' ? t('engine.history.harder') : t('engine.history.diminished'),
            trait === 'hardened' ? 'neutral' : 'bad',
          );
        }
      }
    }

    if (survivor.stress >= 90 && rng.chance(0.3)) {
      applyCondition(survivor, 'breakdown', 60, state.day);
      survivor.stress = 40;
      notes.push({ survivorId: survivor.id, text: t('engine.day.breakdown', { name: survivor.name }), tone: 'bad' });
    }

    /* notes */
    if (survivor.hunger > 75) {
      notes.push({ survivorId: survivor.id, text: t('engine.day.starving', { name: survivor.name }), tone: 'bad' });
    } else if (survivor.fatigue > 85) {
      notes.push({ survivorId: survivor.id, text: t('engine.day.exhausted', { name: survivor.name }), tone: 'bad' });
    } else if (survivor.morale < 25) {
      notes.push({ survivorId: survivor.id, text: t('engine.day.givingUp', { name: survivor.name }), tone: 'bad' });
    }
  }

  if (foodShort) state.stats.starvationDays += 1;
}

/* --------------------------------------------------------------- conditions */

function progressConditions(
  state: GameState,
  rng: Rng,
  notes: DayReport['survivorNotes'],
  deaths: DayReport['deaths'],
): void {
  const infirmary = findFacility(state, 'infirmary');
  const infirmaryWorking = infirmary ? isOperational(infirmary) : false;
  const medics = infirmary ? staffOf(state, infirmary) : [];
  const capacity = infirmaryWorking
    ? (infirmary!.level >= 3 ? 6 : infirmary!.level === 2 ? 4 : 3) + (medics.length > 0 ? 1 : 0)
    : 0;
  const treatmentSpeed = infirmaryWorking ? [0, 1, 1.4, 1.8][infirmary!.level] ?? 1 : 0;
  const medicQuality = medics.reduce((acc, m) => acc * T.treatmentQualityFactor(m), 1);
  const bestMedicSkill = medics.length > 0 ? Math.max(...medics.map((m) => m.skills.medicine)) : 0;

  // Patients are treated worst-first, up to the infirmary's capacity.
  const patients = state.survivors
    .filter((s) => s.alive && s.conditions.length > 0)
    .sort((a, b) => worstSeverity(b) - worstSeverity(a));
  const treated = new Set(patients.slice(0, capacity).map((p) => p.id));

  for (const survivor of state.survivors) {
    if (!survivor.alive) continue;
    const isTreated = treated.has(survivor.id) && state.resources.medicine > 0;

    for (const condition of survivor.conditions.slice()) {
      const def = CONDITION_BY_ID[condition.id];
      if (!def) {
        survivor.conditions = survivor.conditions.filter((c) => c !== condition);
        continue;
      }
      condition.age += 1;
      condition.treated = isTreated;

      if (isTreated && def.treatPerDay > 0) {
        const rate =
          def.treatPerDay *
          treatmentSpeed *
          medicQuality *
          clamp(0.6 + bestMedicSkill * 0.08, 0.6, 1.5);
        condition.severity = clamp(condition.severity - rate, 0, 100);
        if (def.medicineCost > 0) {
          state.resources.medicine = Math.max(0, state.resources.medicine - def.medicineCost * 0.5);
        }
      } else {
        condition.severity = clamp(condition.severity + def.progressPerDay, 0, 100);
      }

      const severityFraction = condition.severity / 100;
      survivor.health = clamp(survivor.health - def.healthDrainAtFull * severityFraction, 0, 100);
      survivor.morale = clamp(survivor.morale + def.moralePerDay * severityFraction, 0, 100);

      if (condition.severity <= 2) {
        survivor.conditions = survivor.conditions.filter((c) => c !== condition);
        state.stats.injuriesTreated += 1;
        notes.push({
          survivorId: survivor.id,
          text: t('engine.day.recovered', {
            name: survivor.name,
            condition: conditionName(def).toLowerCase(),
          }),
          tone: 'good',
        });
        continue;
      }

      if (def.escalatesTo && condition.severity >= (def.lethalAt ?? 100) && rng.chance(0.4)) {
        survivor.conditions = survivor.conditions.filter((c) => c !== condition);
        applyCondition(survivor, def.escalatesTo, 45, state.day);
        notes.push({
          survivorId: survivor.id,
          text: t('engine.day.escalated', {
            name: survivor.name,
            from: conditionName(def).toLowerCase(),
            to: conditionLabel(def.escalatesTo).toLowerCase(),
          }),
          tone: 'bad',
        });
      }

      // Contagion. At most one new case per source per day, so an outbreak spreads
      // through a crew rather than infecting everybody at once.
      if (def.contagious && !isTreated && condition.severity > 25) {
        const exposed = state.survivors.filter(
          (o) => o.alive && o.id !== survivor.id && o.assignment.kind !== 'expedition' &&
            !o.conditions.some((c) => c.id === condition.id),
        );
        const target = exposed.length > 0 ? rng.pick(exposed) : null;
        for (const other of target ? [target] : []) {
          const chance =
            def.contagious *
            T.illnessChanceFactor(other) *
            (infirmaryWorking ? (infirmary!.level >= 2 ? 0.2 : 0.55) : 1) *
            ((state.flags['mod:illnessChance'] as number | undefined) ?? 1);
          if (rng.chance(chance)) {
            if (applyCondition(other, condition.id, 25, state.day)) {
              notes.push({ survivorId: other.id, text: t('engine.day.caughtIt', { name: other.name }), tone: 'bad' });
            }
          }
        }
      }
    }

    if (survivor.health <= 0) {
      const cause = describeDeath(survivor);
      killSurvivor(state, survivor, cause);
      deaths.push({ survivorId: survivor.id, name: fullName(survivor), cause });
    }
  }

  // Water-borne illness from an unfiltered supply.
  const reclaimerLevel = operationalLevel(state, 'water_reclaimer');
  if (reclaimerLevel < 3 && state.resources.water > 0) {
    const risk =
      (reclaimerLevel === 0 ? 0.05 : reclaimerLevel === 1 ? 0.02 : 0.006) *
      ((state.flags['mod:illnessChance'] as number | undefined) ?? 1);
    for (const survivor of livingSurvivors(state)) {
      if (survivor.assignment.kind === 'expedition') continue;
      if (rng.chance(risk * T.illnessChanceFactor(survivor))) {
        if (applyCondition(survivor, 'dysentery', 25, state.day)) {
          notes.push({ survivorId: survivor.id, text: t('engine.day.illFromWater', { name: survivor.name }), tone: 'bad' });
        }
      }
    }
  }
}

function worstSeverity(survivor: Survivor): number {
  return survivor.conditions.reduce((acc, c) => Math.max(acc, c.severity), 0);
}

function describeDeath(survivor: Survivor): string {
  const worst = survivor.conditions.slice().sort((a, b) => b.severity - a.severity)[0];
  if (worst) return t('engine.death.ofCondition', { condition: conditionLabel(worst.id).toLowerCase() });
  if (survivor.hunger > 90) return t('engine.death.starved');
  return t('engine.death.exposure');
}

/** A condition's translated name, or its id when the definition has gone. */
function conditionLabel(id: string): string {
  const def = CONDITION_BY_ID[id];
  return def ? conditionName(def) : id;
}

/** The ending's summary, preferring the definition so it follows the current language. */
function endingSummaryFor(id: string, stored: string): string {
  const def = ENDING_BY_ID[id];
  return def ? endingSummary(def) : stored;
}

/* ----------------------------------------------------------- hostilities */

function resolveHostilities(state: GameState, rng: Rng, notes: DayReport['survivorNotes']): void {
  for (const facility of state.facilities) {
    if (facility.staff.length < 2) continue;
    const hostile = hasHostilePair(state, facility.staff);
    if (!hostile) continue;
    if (!rng.chance(BALANCE.relationships.hatredFightChance)) continue;
    const victim = state.survivors.find((s) => s.id === (rng.chance(0.5) ? hostile.a : hostile.b));
    if (!victim) continue;
    applyCondition(victim, 'laceration', rng.int(20, 40), state.day);
    victim.morale = clamp(victim.morale - 10, 0, 100);
    state.resources.hope = clamp(state.resources.hope - 3, 0, 100);
    notes.push({ survivorId: victim.id, text: t('engine.day.hurtInFight', { name: victim.name }), tone: 'bad' });
    log(state, 'bad', t('engine.day.fightBrokeOut', { name: victim.name }), t('engine.channel.crew'));
  }

  // Refusal: very low morale survivors stop working.
  for (const survivor of livingSurvivors(state)) {
    if (survivor.assignment.kind !== 'facility') continue;
    if (survivor.morale >= BALANCE.needs.moraleRefusalBelow) continue;
    if (!rng.chance(0.4)) continue;
    survivor.assignment = { kind: 'idle' };
    for (const facility of state.facilities) {
      const index = facility.staff.indexOf(survivor.id);
      if (index >= 0) facility.staff.splice(index, 1);
    }
    notes.push({ survivorId: survivor.id, text: t('engine.day.refused', { name: survivor.name }), tone: 'bad' });
  }

  // Incapacitated survivors are removed from posts.
  for (const survivor of livingSurvivors(state)) {
    if (survivor.assignment.kind === 'facility' && isIncapacitated(survivor)) {
      survivor.assignment = { kind: 'rest' };
      for (const facility of state.facilities) {
        const index = facility.staff.indexOf(survivor.id);
        if (index >= 0) facility.staff.splice(index, 1);
      }
    }
  }
}

/* ------------------------------------------------------------------ deadline */

function applyDeadlineWarning(state: GameState): void {
  const scenario = SCENARIO_BY_ID[state.scenarioId];
  if (!scenario?.deadlineDay) return;
  const remaining = scenario.deadlineDay - state.day;
  if (remaining === 10 || remaining === 5 || remaining === 3 || remaining === 1) {
    log(
      state,
      'warn',
      remaining === 1
        ? t('engine.day.deadlineOne')
        : t('engine.day.deadlineMany', { days: remaining }),
      t('engine.channel.deadline'),
    );
  }
}

/* ----------------------------------------------------------------- helpers */

/** Convenience used by the UI to preview the crew's mood before ending the day. */
export function crewSummary(state: GameState): {
  avgMorale: number;
  avgHealth: number;
  worst: Survivor | null;
  workingCount: number;
  restingCount: number;
  idleCount: number;
} {
  const living = livingSurvivors(state);
  if (living.length === 0) {
    return { avgMorale: 0, avgHealth: 0, worst: null, workingCount: 0, restingCount: 0, idleCount: 0 };
  }
  const avgMorale = living.reduce((a, s) => a + s.morale, 0) / living.length;
  const avgHealth = living.reduce((a, s) => a + s.health, 0) / living.length;
  const worst = living.reduce((w, s) => (s.health + s.morale < w.health + w.morale ? s : w));
  return {
    avgMorale,
    avgHealth,
    worst,
    workingCount: living.filter((s) => s.assignment.kind === 'facility').length,
    restingCount: living.filter((s) => s.assignment.kind === 'rest').length,
    idleCount: living.filter((s) => s.assignment.kind === 'idle').length,
  };
}

/** Relationship-aware helper used by the crew panel. */
export function closestBond(state: GameState, survivor: Survivor): { other: Survivor; value: number } | null {
  let best: { other: Survivor; value: number } | null = null;
  for (const other of livingSurvivors(state)) {
    if (other.id === survivor.id) continue;
    const value = getRelationship(state, survivor.id, other.id);
    if (!best || Math.abs(value) > Math.abs(best.value)) best = { other, value };
  }
  return best;
}

export { RESOURCE_IDS };
