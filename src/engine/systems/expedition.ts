import type {
  ActiveExpedition,
  EncounterChoice,
  EncounterDef,
  EncounterId,
  EncounterOutcome,
  EncounterStage,
  ExpeditionForecast,
  ExpeditionLoadout,
  GameState,
  InventoryEntry,
  LocationInstance,
  ResourceId,
  Survivor,
  SurvivorId,
} from '../model/types';
import type { Rng } from '../core/rng';
import { rngFromState } from '../core/rng';
import { BreakdownBuilder } from '../core/breakdown';
import { clamp } from '../core/math';
import { BALANCE } from '../data/balance';
import { ENCOUNTERS, ENCOUNTER_BY_ID } from '../data/encounters';
import { ARCHETYPE_BY_ID } from '../data/locations';
import { EXPEDITION_INJURIES, CONDITION_BY_ID } from '../data/conditions';
import { ITEM_BY_ID } from '../data/items';
import { WEATHER } from '../data/weather';
import { addHistory, applyCondition, canJoinExpedition, fullName } from './survivors';
import { archetypeOf, depleteLocation, expectedHaul, rollLoot, travelDaysFor, revealLocations, scoutLocation } from './world';
import { computeTeamPower, resolveCombat } from './combat';
import { adjustRelationship, findInterposer } from './relationships';
import { grantResource } from './resources';
import { addItem, removeItem, hasItemWithTag } from './inventory';
import * as T from './traits';

/**
 * Expeditions.
 *
 * A dispatch resolves as an interactive sequence of encounter beats. The player sees a
 * forecast first (combat power, injury risk, death risk, expected haul, and every warning
 * the engine can raise), then makes a choice at each beat. Loot is banked into the
 * expedition and delivered when the team walks back through the door `travelDays` later,
 * which is what makes packing rations a real decision.
 */

/* ------------------------------------------------------------------- capacity */

export function packCapacity(state: GameState, members: readonly Survivor[]): number {
  let capacity = BALANCE.expedition.basePackCapacity + members.length * BALANCE.expedition.perMemberCapacity;
  for (const survivor of members) capacity += T.packCapacityDelta(survivor);
  if (state.research.completed.includes('exp_load_bearing')) capacity += 3;
  const access = state.facilities.find((f) => f.defId === 'surface_access');
  if (access && access.level >= 2 && access.status === 'operational') capacity += 4;
  return Math.round(capacity);
}

export function loadoutWeight(loadout: ExpeditionLoadout): number {
  let weight = 0;
  for (const entry of loadout.items) {
    weight += (ITEM_BY_ID[entry.itemId]?.weight ?? 1) * entry.count;
  }
  weight += loadout.rations * 1 + loadout.water * 1 + loadout.ammo * 0.15 + loadout.medicine * 0.4;
  return Math.round(weight * 10) / 10;
}

export function loadoutCapacityBonus(loadout: ExpeditionLoadout): number {
  let bonus = 0;
  for (const entry of loadout.items) {
    bonus += (ITEM_BY_ID[entry.itemId]?.capacityBonus ?? 0) * entry.count;
  }
  return bonus;
}

export function emptyLoadout(): ExpeditionLoadout {
  return { items: [], rations: 0, water: 0, ammo: 0, medicine: 0 };
}

/* ------------------------------------------------------------------- forecast */

export function expeditionForecast(
  state: GameState,
  location: LocationInstance,
  memberIds: readonly SurvivorId[],
  loadout: ExpeditionLoadout,
): ExpeditionForecast {
  const members = memberIds
    .map((id) => state.survivors.find((s) => s.id === id))
    .filter((s): s is Survivor => Boolean(s));
  const weather = WEATHER[state.weather.id];
  const travelDays = travelDaysFor(state, location);
  const daysInField = travelDays + 1;

  const combatPower = computeTeamPower({
    members,
    pack: loadout.items,
    ammo: loadout.ammo,
    danger: location.danger,
    threatScale: 1,
    preparation: 0,
    enemy: 'a hostile group',
  });

  const carry = new BreakdownBuilder();
  carry.base(`Base capacity`, BALANCE.expedition.basePackCapacity);
  carry.add(`${members.length} carriers`, members.length * BALANCE.expedition.perMemberCapacity);
  for (const survivor of members) {
    const delta = T.packCapacityDelta(survivor);
    if (delta) carry.add(`${survivor.name} (Quartermaster)`, delta);
  }
  const gearBonus = loadoutCapacityBonus(loadout);
  if (gearBonus) carry.add('Carrying gear', gearBonus);
  if (state.research.completed.includes('exp_load_bearing')) carry.add('Load Bearing research', 3);
  const carryResult = carry.build({ min: 0, round: 0 });

  const injury = new BreakdownBuilder();
  const beats = BALANCE.expedition.beatsByRing[location.ring] ?? 4;
  const base = BALANCE.expedition.injuryBase + (location.danger - 5) * BALANCE.expedition.dangerInjuryScale;
  injury.base('Site danger', clamp(base, 0.02, 0.6) * beats * 0.55,
    `Danger ${Math.round(location.danger)} across roughly ${beats} situations.`);
  injury.mul(`Weather: ${weather.name}`, weather.expeditionDanger);
  const difficultyInjury = (state.flags['mod:injuryChance'] as number | undefined) ?? 1;
  if (difficultyInjury !== 1) injury.mul('Difficulty', difficultyInjury);

  let traitFactor = 1;
  for (const survivor of members) traitFactor *= T.injuryChanceFactor(survivor);
  if (Math.abs(traitFactor - 1) > 0.01) injury.mul('Crew traits', traitFactor);

  const warnings: string[] = [];
  for (const survivor of members) {
    if (survivor.fatigue > BALANCE.needs.fatigueInjuryThreshold) {
      const extra = (survivor.fatigue - BALANCE.needs.fatigueInjuryThreshold) * BALANCE.expedition.fatigueRiskScale;
      injury.add(`${survivor.name} is exhausted`, extra, `Fatigue ${Math.round(survivor.fatigue)}.`,
        'Give them a rest day before dispatching.');
      warnings.push(`${survivor.name} is exhausted (fatigue ${Math.round(survivor.fatigue)}).`);
    }
    if (survivor.health < 55) {
      warnings.push(`${survivor.name} is hurt (health ${Math.round(survivor.health)}) and could die out there.`);
    }
    const blocking = survivor.conditions.find(
      (c) => CONDITION_BY_ID[c.id]?.blocksExpedition && c.severity > 25,
    );
    if (blocking) warnings.push(`${survivor.name} cannot travel: ${CONDITION_BY_ID[blocking.id]?.name}.`);
  }
  if (combatPower.total < location.danger * 2.4) {
    warnings.push('Your combat power is low for this site. Expect to lose a fight if one starts.');
  }

  const armed = loadout.items.some((e) => (ITEM_BY_ID[e.itemId]?.power ?? 0) > 0);
  if (!armed) warnings.push('Nobody is carrying a weapon.');

  const injuryResult = injury.build({ min: 0.01, max: 0.95, round: 3 });

  const death = new BreakdownBuilder();
  death.base('Base lethality', injuryResult.total * BALANCE.expedition.lethalFraction);
  const woundedMembers = members.filter((s) => s.health <= BALANCE.expedition.deathHealthCeiling);
  if (woundedMembers.length > 0) {
    death.mul(
      `${woundedMembers.length} already wounded`,
      1 + woundedMembers.length * 0.55,
      'Wounded survivors are the ones who do not come back.',
      'Treat them in the Infirmary first.',
    );
  } else {
    death.note('Nobody is badly hurt', 'A healthy survivor cannot die from a single bad roll.');
  }
  const medics = members.filter((s) => s.skills.medicine >= 4);
  if (medics.length > 0) death.mul('Medic on the team', 0.7);
  if (loadout.medicine > 0 || loadout.items.some((e) => ITEM_BY_ID[e.itemId]?.tags.includes('medical'))) {
    death.mul('Medical supplies packed', 0.78);
  }
  const deathResult = death.build({ min: 0, max: 0.75, round: 3 });

  const rationsNeeded = Math.max(
    0,
    members.length * daysInField * BALANCE.expedition.rationsPerMemberPerDay -
      (state.research.completed.includes('exp_cache_network') ? members.length : 0),
  );
  const waterNeeded = members.length * daysInField * BALANCE.expedition.waterPerMemberPerDay;

  if (loadout.rations < rationsNeeded) {
    warnings.push(`Short ${Math.ceil(rationsNeeded - loadout.rations)} rations for ${daysInField} days in the field.`);
  }
  if (loadout.water < waterNeeded) {
    warnings.push(`Short ${Math.ceil(waterNeeded - loadout.water)} water for ${daysInField} days in the field.`);
  }
  const weight = loadoutWeight(loadout);
  if (weight > carryResult.total) {
    warnings.push(`Pack is overloaded by ${Math.round(weight - carryResult.total)}. The team will move slowly.`);
  }

  const archetype = archetypeOf(location);
  return {
    combatPower,
    carryCapacity: carryResult,
    injuryRisk: injuryResult,
    deathRisk: deathResult,
    rationsNeeded,
    waterNeeded,
    expectedHaul: expectedHaul(archetype, location, beats * 2).map((h) => ({
      resource: h.resource as ResourceId,
      min: h.min,
      max: h.max,
    })),
    warnings,
    travelDays,
  };
}

/* ------------------------------------------------------------------- dispatch */

export interface DispatchResult {
  ok: boolean;
  reason?: string;
  expeditionId?: string;
}

export function dispatchExpedition(
  state: GameState,
  locationId: string,
  memberIds: readonly SurvivorId[],
  loadout: ExpeditionLoadout,
): DispatchResult {
  const location = state.world.locations.find((l) => l.id === locationId);
  if (!location) return { ok: false, reason: 'Unknown location' };
  if (memberIds.length === 0) return { ok: false, reason: 'Select at least one survivor' };
  if (memberIds.length > 4) return { ok: false, reason: 'At most four survivors per expedition' };
  if (state.expeditions.some((e) => !e.resolved)) {
    return { ok: false, reason: 'An expedition is already in the field' };
  }

  const members: Survivor[] = [];
  for (const id of memberIds) {
    const survivor = state.survivors.find((s) => s.id === id);
    if (!survivor) return { ok: false, reason: 'Unknown survivor' };
    const check = canJoinExpedition(survivor);
    if (!check.ok) return { ok: false, reason: `${survivor.name}: ${check.reason}` };
    members.push(survivor);
  }

  // Verify and remove everything being taken.
  for (const entry of loadout.items) {
    const held = state.inventory.find((i) => i.itemId === entry.itemId)?.count ?? 0;
    if (held < entry.count) return { ok: false, reason: `Not enough ${ITEM_BY_ID[entry.itemId]?.name ?? entry.itemId}` };
  }
  if (state.resources.food < loadout.rations) return { ok: false, reason: 'Not enough food to pack' };
  if (state.resources.water < loadout.water) return { ok: false, reason: 'Not enough water to pack' };
  if (state.resources.ammo < loadout.ammo) return { ok: false, reason: 'Not enough ammunition' };
  if (state.resources.medicine < loadout.medicine) return { ok: false, reason: 'Not enough medicine' };

  for (const entry of loadout.items) removeItem(state, entry.itemId, entry.count);
  state.resources.food -= loadout.rations;
  state.resources.water -= loadout.water;
  state.resources.ammo -= loadout.ammo;
  state.resources.medicine -= loadout.medicine;

  const travelDays = travelDaysFor(state, location);
  state.idCounter += 1;
  const id = `exp${state.idCounter}`;

  const rng = rngFromState(state.rng).fork(`expedition:${state.day}:${id}`);
  const queue = buildBeatQueue(rng, state, location);

  const expedition: ActiveExpedition = {
    id,
    locationId,
    members: memberIds.slice(),
    loadout,
    departedDay: state.day,
    returnDay: state.day + Math.max(travelDays, 0) + (travelDays === 0 ? 0 : 0),
    haulResources: {},
    haulItems: [],
    log: [],
    queue,
    resolved: false,
    casualties: [],
    loreFound: [],
    preparation: 0,
    aborted: false,
  };

  for (const survivor of members) {
    survivor.assignment = { kind: 'expedition', expeditionId: id };
    for (const facility of state.facilities) {
      const index = facility.staff.indexOf(survivor.id);
      if (index >= 0) facility.staff.splice(index, 1);
    }
  }

  state.expeditions.push(expedition);
  state.activeExpeditionId = id;
  state.phase = 'expedition';
  return { ok: true, expeditionId: id };
}

/* -------------------------------------------------------------- beat selection */

const STAGE_ORDER: EncounterStage[] = ['travel', 'approach', 'site', 'complication', 'extraction'];

function buildBeatQueue(rng: Rng, state: GameState, location: LocationInstance): EncounterId[] {
  const archetype = archetypeOf(location);
  const siteBeats = BALANCE.expedition.beatsByRing[location.ring] ?? 4;
  const queue: EncounterId[] = [];
  const used = new Set<EncounterId>();

  const pickFor = (stage: EncounterStage): EncounterId | null => {
    const candidates = ENCOUNTERS.filter((e) => {
      if (e.stage !== stage) return false;
      if (used.has(e.id)) return false;
      if (e.rings && !e.rings.includes(location.ring)) return false;
      if (e.minDanger !== undefined && location.danger < e.minDanger) return false;
      if (e.maxDanger !== undefined && location.danger > e.maxDanger) return false;
      if (e.requiresFlag && !state.flags[e.requiresFlag]) return false;
      if (e.forbidsFlag && state.flags[e.forbidsFlag]) return false;
      if (e.once && state.flags[`encounter:${e.id}`]) return false;
      return e.tags.includes('any') || e.tags.some((t) => archetype.encounterTags.includes(t));
    });
    if (candidates.length === 0) return null;
    const pick = rng.weighted(candidates.map((e) => ({ value: e, weight: e.weight })));
    used.add(pick.id);
    return pick.id;
  };

  for (const stage of STAGE_ORDER) {
    if (stage === 'site') {
      const count = clamp(Math.round(siteBeats / 2), 1, 3);
      for (let i = 0; i < count; i += 1) {
        const beat = pickFor('site');
        if (beat) queue.push(beat);
      }
    } else if (stage === 'complication') {
      // Complications are not guaranteed; a quiet run is a real outcome.
      if (rng.chance(clamp(0.4 + location.danger * 0.06, 0.3, 0.92))) {
        const beat = pickFor('complication');
        if (beat) queue.push(beat);
      }
    } else {
      const beat = pickFor(stage);
      if (beat) queue.push(beat);
    }
  }
  return queue;
}

/* ------------------------------------------------------------------ resolution */

export interface BeatPresentation {
  encounter: EncounterDef;
  index: number;
  total: number;
  choices: { choice: EncounterChoice; enabled: boolean; reason?: string }[];
}

export function currentBeat(state: GameState): BeatPresentation | null {
  const expedition = state.expeditions.find((e) => e.id === state.activeExpeditionId);
  if (!expedition || expedition.resolved) return null;
  const encounterId = expedition.queue[0];
  if (!encounterId) return null;
  const encounter = ENCOUNTER_BY_ID[encounterId];
  if (!encounter) return null;

  const members = expedition.members
    .map((id) => state.survivors.find((s) => s.id === id))
    .filter((s): s is Survivor => Boolean(s));

  const choices = encounter.choices.map((choice) => {
    const gate = choiceAvailability(state, expedition, members, choice);
    return { choice, enabled: gate.ok, ...(gate.reason ? { reason: gate.reason } : {}) };
  });

  return {
    encounter,
    index: expedition.log.length,
    total: expedition.log.length + expedition.queue.length,
    choices,
  };
}

function choiceAvailability(
  state: GameState,
  expedition: ActiveExpedition,
  members: readonly Survivor[],
  choice: EncounterChoice,
): { ok: boolean; reason?: string } {
  if (choice.requiresItemTag && !hasItemWithTag(expedition.loadout.items, choice.requiresItemTag)) {
    return { ok: false, reason: choice.lockedHint ?? 'You did not pack the right gear.' };
  }
  if (choice.requiresSkill) {
    const best = Math.max(0, ...members.map((m) => m.skills[choice.requiresSkill!.skill]));
    if (best < choice.requiresSkill.min) {
      return { ok: false, reason: choice.lockedHint ?? 'Nobody on the team is skilled enough.' };
    }
  }
  if (choice.requiresTrait && !members.some((m) => m.traits.includes(choice.requiresTrait!))) {
    return { ok: false, reason: choice.lockedHint ?? 'Nobody on the team has the right instincts.' };
  }
  if (choice.requiresAmmo && expedition.loadout.ammo < choice.requiresAmmo) {
    return { ok: false, reason: choice.lockedHint ?? 'Not enough ammunition.' };
  }
  if (choice.requiresResearch && !state.research.completed.includes(choice.requiresResearch)) {
    return { ok: false, reason: choice.lockedHint ?? 'Requires research you have not completed.' };
  }
  return { ok: true };
}

export interface BeatResolution {
  ok: boolean;
  reason?: string;
  finished: boolean;
}

export function resolveBeat(state: GameState, choiceId: string): BeatResolution {
  const expedition = state.expeditions.find((e) => e.id === state.activeExpeditionId);
  if (!expedition || expedition.resolved) return { ok: false, reason: 'No expedition in progress', finished: true };
  const presentation = currentBeat(state);
  if (!presentation) return { ok: false, reason: 'No beat to resolve', finished: true };

  const entry = presentation.choices.find((c) => c.choice.id === choiceId);
  if (!entry) return { ok: false, reason: 'Unknown choice', finished: false };
  if (!entry.enabled) return { ok: false, reason: entry.reason ?? 'Unavailable', finished: false };

  const choice = entry.choice;
  const rng = rngFromState(state.rng);
  const members = expedition.members
    .map((id) => state.survivors.find((s) => s.id === id))
    .filter((s): s is Survivor => Boolean(s) && s!.alive);

  let outcome: EncounterOutcome | undefined;

  let rollInfo:
    | { skill: NonNullable<EncounterChoice['check']>['skill']; value: number; target: number; success: boolean; actor: string }
    | undefined;

  if (choice.check) {
    const actor = pickActor(rng, members, choice.check);
    if (!actor) {
      outcome = choice.onFailure ?? choice.outcome;
    } else {
      const skillValue = actor.skills[choice.check.skill];
      const equipmentBonus = equipmentSkillBonus(expedition.loadout.items, choice.check.skill);
      const conditionPenalty = actor.health < 50 ? 1 : 0;
      const total = skillValue + equipmentBonus - conditionPenalty + rng.int(1, 6);
      const success = total >= choice.check.target + 3;
      rollInfo = {
        skill: choice.check.skill,
        value: total,
        target: choice.check.target + 3,
        success,
        actor: actor.name,
      };
      outcome = success ? choice.onSuccess : choice.onFailure;
      if (!outcome) outcome = choice.outcome;
    }
  } else {
    outcome = choice.outcome ?? choice.onSuccess;
  }

  if (!outcome) outcome = { text: 'Nothing comes of it.', tone: 'neutral' };

  const summary = applyOutcome(state, expedition, rng, outcome, members);

  expedition.log.push({
    encounterId: presentation.encounter.id,
    title: presentation.encounter.title,
    text: presentation.encounter.text,
    choiceId: choice.id,
    choiceLabel: choice.label,
    outcomeText: [outcome.text, ...summary].join(' '),
    tone: outcome.tone,
    ...(rollInfo ? { roll: rollInfo } : {}),
  });

  if (presentation.encounter.once) state.flags[`encounter:${presentation.encounter.id}`] = true;
  expedition.queue.shift();

  if (outcome.abort) {
    expedition.aborted = true;
    expedition.queue = [];
  }

  const aliveMembers = expedition.members.filter((id) => {
    const survivor = state.survivors.find((s) => s.id === id);
    return survivor?.alive;
  });
  if (aliveMembers.length === 0) expedition.queue = [];

  state.rng = rng.snapshot();

  if (expedition.queue.length === 0) {
    finishExpedition(state, expedition);
    return { ok: true, finished: true };
  }
  return { ok: true, finished: false };
}

function pickActor(
  rng: Rng,
  members: readonly Survivor[],
  check: NonNullable<EncounterChoice['check']>,
): Survivor | undefined {
  if (members.length === 0) return undefined;
  if (check.actor === 'best') {
    return members.reduce((best, s) => (s.skills[check.skill] > best.skills[check.skill] ? s : best));
  }
  if (check.actor === 'weakest') {
    return members.reduce((worst, s) => (s.skills[check.skill] < worst.skills[check.skill] ? s : worst));
  }
  return rng.pick(members);
}

function equipmentSkillBonus(items: readonly InventoryEntry[], skill: string): number {
  let bonus = 0;
  for (const entry of items) {
    const def = ITEM_BY_ID[entry.itemId];
    const value = def?.skillBonus?.[skill as keyof NonNullable<typeof def.skillBonus>];
    if (value) bonus = Math.max(bonus, value);
  }
  return bonus;
}

function applyOutcome(
  state: GameState,
  expedition: ActiveExpedition,
  rng: Rng,
  outcome: EncounterOutcome,
  members: Survivor[],
): string[] {
  const notes: string[] = [];
  const location = state.world.locations.find((l) => l.id === expedition.locationId);
  const weather = WEATHER[state.weather.id];

  if (outcome.preparation) expedition.preparation += outcome.preparation;

  /* --- combat */
  if (outcome.combat && members.length > 0) {
    const result = resolveCombat(rng, {
      members,
      pack: expedition.loadout.items,
      ammo: expedition.loadout.ammo,
      danger: location?.danger ?? 4,
      threatScale: outcome.combat.threatScale,
      preparation: expedition.preparation,
      enemy: outcome.combat.enemy,
    });
    expedition.loadout.ammo = Math.max(0, expedition.loadout.ammo - result.ammoSpent);
    notes.push(result.text);
    if (result.outcome === 'rout' || result.outcome === 'clean') state.stats.fightsWon += 1;
    else state.stats.fightsLost += 1;

    for (const wound of result.wounded) {
      const survivor = state.survivors.find((s) => s.id === wound.survivorId);
      if (!survivor) continue;
      inflictInjury(state, rng, survivor, wound.severity);
      state.flags['expedition.someone_wounded'] = true;
    }
    for (const victimId of result.mortal) {
      const victim = state.survivors.find((s) => s.id === victimId);
      if (!victim || !victim.alive) continue;
      const interposer = findInterposer(state, victim, members, rng.next());
      if (interposer) {
        inflictInjury(state, rng, interposer, 1.2);
        notes.push(`${interposer.name} put themselves between ${victim.name} and it.`);
        adjustRelationship(state, victim.id, interposer.id, 22);
      } else if (canSurviveFatal(state, expedition)) {
        // A surgical kit is used first; a blood bag is the fallback.
        if (!removeItem(state, 'surgical_kit', 1)) removeItem(state, 'blood_bag', 1);
        victim.health = Math.max(12, victim.health);
        applyCondition(victim, 'bleeding', 60, state.day);
        notes.push(`${victim.name} should not have survived that. The surgical kit is gone.`);
      } else {
        killSurvivor(state, victim, `killed by ${outcome.combat.enemy}`);
        expedition.casualties.push(victim.id);
        notes.push(`${fullName(victim)} did not come back.`);
      }
    }
  }

  /* --- injuries */
  if (outcome.injury && members.length > 0) {
    const difficulty = (state.flags['mod:injuryChance'] as number | undefined) ?? 1;
    let chance = outcome.injury.chance * weather.expeditionDanger * difficulty;
    chance *= clamp(1 - expedition.preparation * 0.03, 0.5, 1.4);
    const target =
      outcome.injury.target === 'weakest'
        ? members.reduce((w, s) => (s.health < w.health ? s : w))
        : rng.pick(members);
    if (rng.chance(clamp(chance * T.injuryChanceFactor(target), 0, 0.98))) {
      const applied = inflictInjury(state, rng, target, outcome.injury.severityScale ?? 1);
      if (applied) {
        notes.push(`${target.name} is hurt: ${applied}.`);
        state.flags['expedition.someone_wounded'] = true;
      }
    }
  }

  /* --- illness */
  if (outcome.illness && members.length > 0) {
    const difficulty = (state.flags['mod:illnessChance'] as number | undefined) ?? 1;
    for (const survivor of members) {
      const chance = outcome.illness.chance * difficulty * T.illnessChanceFactor(survivor);
      if (rng.chance(clamp(chance, 0, 0.9))) {
        if (applyCondition(survivor, outcome.illness.conditionId, rng.int(25, 45), state.day)) {
          notes.push(`${survivor.name} has come down with ${CONDITION_BY_ID[outcome.illness.conditionId]?.name ?? 'something'}.`);
        }
      }
    }
  }

  /* --- loot */
  if (outcome.lootDraws && location) {
    const archetype = archetypeOf(location);
    let yieldFactor = weather.scavengeYield;
    for (const survivor of members) yieldFactor *= T.scavengeYieldFactor(survivor);
    const bestScavenge = Math.max(0, ...members.map((m) => m.skills.scavenging));
    yieldFactor *= clamp(0.7 + bestScavenge * 0.06, 0.7, 1.35);
    yieldFactor *= outcome.lootFactor ?? 1;
    const loot = rollLoot(rng, archetype, location, yieldFactor, outcome.lootDraws);
    for (const [resource, amount] of Object.entries(loot.resources)) {
      if (!amount) continue;
      expedition.haulResources[resource as ResourceId] =
        (expedition.haulResources[resource as ResourceId] ?? 0) + amount;
    }
    for (const item of loot.items) {
      const existing = expedition.haulItems.find((i) => i.itemId === item.itemId);
      if (existing) existing.count += item.count;
      else expedition.haulItems.push({ ...item });
    }
    const summary = describeLoot(loot.resources, loot.items);
    if (summary) notes.push(`Recovered ${summary}.`);
  } else if (outcome.lootFactor && outcome.lootFactor < 0) {
    // Negative loot factor without draws means losing part of the accumulated haul.
    const keep = clamp(1 + outcome.lootFactor, 0, 1);
    for (const key of Object.keys(expedition.haulResources) as ResourceId[]) {
      expedition.haulResources[key] = Math.round((expedition.haulResources[key] ?? 0) * keep * 10) / 10;
    }
    if (keep === 0) expedition.haulItems = [];
    notes.push(keep === 0 ? 'The haul is gone.' : 'Part of the haul is gone.');
  }

  /* --- explicit resources and items */
  if (outcome.resources) {
    for (const [resource, amount] of Object.entries(outcome.resources) as [ResourceId, number][]) {
      if (amount >= 0) {
        expedition.haulResources[resource] = (expedition.haulResources[resource] ?? 0) + amount;
      } else if (resource === 'food') {
        expedition.loadout.rations = Math.max(0, expedition.loadout.rations + amount);
      } else if (resource === 'water') {
        expedition.loadout.water = Math.max(0, expedition.loadout.water + amount);
      } else if (resource === 'hope') {
        grantResource(state, 'hope', amount);
      } else {
        // Spend from the haul first, then from base stores.
        const fromHaul = Math.min(expedition.haulResources[resource] ?? 0, -amount);
        expedition.haulResources[resource] = (expedition.haulResources[resource] ?? 0) - fromHaul;
        const remainder = -amount - fromHaul;
        if (remainder > 0) state.resources[resource] = Math.max(0, state.resources[resource] - remainder);
      }
    }
  }
  if (outcome.items) {
    for (const item of outcome.items) {
      const existing = expedition.haulItems.find((i) => i.itemId === item.itemId);
      if (existing) existing.count += item.count;
      else expedition.haulItems.push({ ...item });
    }
  }
  if (outcome.consumeItem) {
    const entry = expedition.loadout.items.find((i) => i.itemId === outcome.consumeItem);
    if (entry) {
      entry.count -= 1;
      if (entry.count <= 0) {
        expedition.loadout.items = expedition.loadout.items.filter((i) => i.count > 0);
      }
    }
  }
  if (outcome.ammo) {
    expedition.loadout.ammo = Math.max(0, expedition.loadout.ammo + outcome.ammo);
  }

  /* --- crew state */
  if (outcome.fatigue) {
    for (const survivor of members) survivor.fatigue = clamp(survivor.fatigue + outcome.fatigue, 0, 100);
  }
  if (outcome.morale) {
    for (const survivor of members) survivor.morale = clamp(survivor.morale + outcome.morale, 0, 100);
  }
  if (outcome.relationship && members.length > 1) {
    for (let i = 0; i < members.length; i += 1) {
      for (let j = i + 1; j < members.length; j += 1) {
        adjustRelationship(state, members[i]!.id, members[j]!.id, outcome.relationship);
      }
    }
  }

  /* --- world and narrative */
  if (outcome.lore) {
    for (const loreId of outcome.lore) {
      if (!state.lore.includes(loreId)) {
        state.lore.push(loreId);
        expedition.loreFound.push(loreId);
        state.stats.loreFound += 1;
      }
    }
  }
  if (outcome.flag) state.flags[outcome.flag] = true;
  if (outcome.reveal) {
    const revealed = revealLocations(state, rng, outcome.reveal);
    if (revealed.length > 0) notes.push(`Learned of ${revealed.map((l) => l.name).join(' and ')}.`);
  }
  if (outcome.survey && location) scoutLocation(state, location.id);
  if (outcome.locationState && location) location.state = outcome.locationState;
  if (outcome.insight) state.research.insight += outcome.insight;

  return notes;
}

function describeLoot(
  resources: Partial<Record<string, number>>,
  items: { itemId: string; count: number }[],
): string {
  const parts: string[] = [];
  for (const [resource, amount] of Object.entries(resources)) {
    if (!amount || amount < 0.5) continue;
    parts.push(`${Math.round(amount)} ${resource}`);
  }
  for (const item of items) {
    parts.push(`${item.count}× ${ITEM_BY_ID[item.itemId]?.name ?? item.itemId}`);
  }
  return parts.join(', ');
}

function inflictInjury(state: GameState, rng: Rng, survivor: Survivor, scale: number): string | null {
  const entry = rng.weighted(EXPEDITION_INJURIES.map((i) => ({ value: i, weight: i.weight })));
  const [min, max] = entry.severity;
  const severity = clamp(rng.int(min, max) * scale, 5, 100);
  const applied = applyCondition(survivor, entry.id, severity, state.day);
  survivor.health = clamp(survivor.health - severity * 0.18, 1, 100);
  return applied ? CONDITION_BY_ID[entry.id]?.name ?? entry.id : CONDITION_BY_ID[entry.id]?.name ?? null;
}

function canSurviveFatal(state: GameState, expedition: ActiveExpedition): boolean {
  if (!state.research.completed.includes('med_field_surgery')) return false;
  const hasKit =
    expedition.loadout.items.some((i) => i.itemId === 'surgical_kit' || i.itemId === 'blood_bag') ||
    state.inventory.some((i) => (i.itemId === 'surgical_kit' || i.itemId === 'blood_bag') && i.count > 0);
  return hasKit;
}

export function killSurvivor(state: GameState, survivor: Survivor, cause: string): void {
  if (!survivor.alive) return;
  survivor.alive = false;
  survivor.deathDay = state.day;
  survivor.deathCause = cause;
  survivor.assignment = { kind: 'idle' };
  state.stats.survivorsLost += 1;
  addHistory(survivor, state.day, `Died: ${cause}.`, 'bad');
  // Set here rather than at each call site: this is the only death path, and several
  // aftermath events wait on it. Setting it in the day pipeline alone meant that anyone
  // killed on an expedition or by an event left the grief events locked for the whole run.
  state.flags['run.someone_died'] = true;

  for (const facility of state.facilities) {
    const index = facility.staff.indexOf(survivor.id);
    if (index >= 0) facility.staff.splice(index, 1);
  }

  let hopeLoss = 6 + T.hopeOnDeathDelta(survivor) * -1;
  hopeLoss = clamp(hopeLoss, 4, 20);
  state.resources.hope = clamp(state.resources.hope - hopeLoss, 0, 100);

  for (const other of state.survivors) {
    if (!other.alive || other.id === survivor.id) continue;
    const bond = state.relationships[
      other.id < survivor.id ? `${other.id}|${survivor.id}` : `${survivor.id}|${other.id}`
    ] ?? 0;
    if (bond >= 60) {
      other.grievingDays = BALANCE.relationships.grievingDays;
      other.morale = clamp(other.morale - BALANCE.relationships.grievingMoralePenalty, 0, 100);
      applyCondition(other, 'grieving', 70, state.day);
      addHistory(other, state.day, `Lost ${survivor.name}.`, 'bad');
    } else {
      other.morale = clamp(other.morale - 6, 0, 100);
    }
  }

  state.log.push({
    id: `log${state.idCounter++}`,
    day: state.day,
    tone: 'bad',
    text: `${fullName(survivor)} died — ${cause}.`,
    channel: 'Memorial',
  });
}

/* ------------------------------------------------------------------- return */

/**
 * Some sites carry an authored scene that fires the first time a team actually works them.
 *
 * This is the spine of the narrative: the Meridian hatch, the transmission tower, the data
 * centre console, and the signal source are all reached this way. They queue as pending
 * events, so the player answers them on the same evening the team gets home rather than
 * having them buried in an expedition log.
 */
function queueSiteEvents(state: GameState, location: LocationInstance): string[] {
  const archetype = ARCHETYPE_BY_ID[location.archetypeId];
  const notes: string[] = [];

  for (const eventId of archetype?.siteEvents ?? []) {
    // Once per site, and never twice in one evening.
    if ((state.events.seenCounts[eventId] ?? 0) > 0) continue;
    if (state.events.pending.some((p) => p.eventId === eventId)) continue;

    state.events.pending.push({ eventId, scheduled: true });
    if (state.phase === 'planning') state.phase = 'events';
    notes.push('There is something at this site that needs a decision.');
  }
  return notes;
}

function finishExpedition(state: GameState, expedition: ActiveExpedition): void {
  expedition.resolved = true;
  state.activeExpeditionId = null;
  const location = state.world.locations.find((l) => l.id === expedition.locationId);
  if (location && !expedition.aborted) {
    depleteLocation(state, location);
    state.stats.locationsExplored += 1;
  } else if (location) {
    location.knowledge = Math.max(location.knowledge, 2);
    if (location.state === 'rumoured' || location.state === 'unknown') location.state = 'scouted';
  }

  const travelDays = location ? travelDaysFor(state, location) : 0;
  expedition.returnDay = state.day + travelDays;

  if (expedition.aborted) state.stats.expeditionsAborted += 1;
  else state.stats.expeditionsCompleted += 1;

  state.phase = 'planning';

  if (travelDays === 0) deliverExpedition(state, expedition);
}

/** Whether a completed expedition earned the site's authored scene. */
function reachedTheSite(expedition: ActiveExpedition): boolean {
  // Aborting on the approach does not count; the team has to have worked the place.
  return !expedition.aborted && expedition.log.some((beat) => beat.encounterId.startsWith('site.'));
}

/** Called by the day pipeline when the team's return day arrives. */
export function deliverExpedition(state: GameState, expedition: ActiveExpedition): string[] {
  const notes: string[] = [];
  if (expedition.members.length === 0) return notes;

  const site = state.world.locations.find((l) => l.id === expedition.locationId);
  if (site && reachedTheSite(expedition)) notes.push(...queueSiteEvents(state, site));

  for (const [resource, amount] of Object.entries(expedition.haulResources) as [ResourceId, number][]) {
    if (!amount || amount <= 0) continue;
    const gained = grantResource(state, resource, amount);
    if (gained < amount - 0.5) {
      notes.push(`Storage is full — ${Math.round(amount - gained)} ${resource} had to be left in the stairwell.`);
    }
  }
  for (const item of expedition.haulItems) addItem(state, item.itemId, item.count);

  // Unused pack contents come home.
  state.resources.food += expedition.loadout.rations;
  state.resources.water += expedition.loadout.water;
  state.resources.ammo += expedition.loadout.ammo;
  state.resources.medicine += expedition.loadout.medicine;
  for (const entry of expedition.loadout.items) addItem(state, entry.itemId, entry.count);

  for (const id of expedition.members) {
    const survivor = state.survivors.find((s) => s.id === id);
    if (!survivor || !survivor.alive) continue;
    survivor.assignment = { kind: 'idle' };
    survivor.expeditionsCompleted += 1;
    survivor.fatigue = clamp(survivor.fatigue + BALANCE.needs.fatigueFromExpedition, 0, 100);
    addHistory(
      survivor,
      state.day,
      expedition.aborted ? 'Came back early from an expedition.' : 'Returned from an expedition.',
      expedition.aborted ? 'neutral' : 'good',
    );
  }

  const haulSummary = describeLoot(expedition.haulResources, expedition.haulItems);
  notes.push(
    haulSummary
      ? `The team is back with ${haulSummary}.`
      : 'The team is back with nothing to show for it.',
  );

  state.expeditions = state.expeditions.filter((e) => e.id !== expedition.id);
  return notes;
}

export function activeExpedition(state: GameState): ActiveExpedition | undefined {
  return state.expeditions.find((e) => e.id === state.activeExpeditionId);
}
