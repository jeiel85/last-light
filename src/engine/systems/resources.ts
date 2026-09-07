import { t } from '../../i18n';
import { facilityName as facilityLabel, weatherName } from '../../i18n/content';
import { FACILITY_BY_ID } from '../data/facilities';
import type {
  GameState,
  ResourceId,
  ResourceMap,
  Survivor,
} from '../model/types';
import { RESOURCE_IDS } from '../model/types';
import { BreakdownBuilder, type Breakdown } from '../core/breakdown';
import { clamp, roundResource } from '../core/math';
import { BALANCE } from '../data/balance';
import { STORED_RESOURCES } from '../data/resources';
import { WEATHER } from '../data/weather';
import { findFacility, isOperational, operationalLevel, staffPower } from './facilities';
import { livingSurvivors } from './survivors';
import * as T from './traits';

/**
 * Daily resource resolution.
 *
 * Every figure here is produced through a `BreakdownBuilder`, which is what powers the
 * "why is food −7?" popover. The rule of thumb: if a number appears on the dashboard, the
 * function that produced it returns a `Breakdown`, never a bare number.
 */

export type ResourceBreakdowns = Record<ResourceId, Breakdown>;

function emptyBreakdowns(): ResourceBreakdowns {
  const out = {} as ResourceBreakdowns;
  for (const id of RESOURCE_IDS) out[id] = { total: 0, terms: [] };
  return out;
}

/* --------------------------------------------------------------------- caps */

export function computeCaps(state: GameState): ResourceMap {
  const caps = { ...BALANCE.resources.baseCaps } as ResourceMap;
  const storage = findFacility(state, 'storage');
  if (storage && storage.status !== 'building') {
    const bonus = BALANCE.resources.storageCapBonus[storage.level] ?? 0;
    for (const id of STORED_RESOURCES) caps[id] += bonus;
  }
  caps.hope = 100;
  caps.power = Math.max(caps.power, 200);
  return caps;
}

/** `Weather: Cold snap`, translated. */
function weatherTerm(weather: { id: string; name: string }): string {
  return t('engine.weatherTerm', { name: weatherName(weather as never) });
}

/** `Water Reclaimer (offline)`. */
function offlineTerm(defId: string): string {
  const def = FACILITY_BY_ID[defId];
  return t('engine.facilityOffline', { name: def ? facilityLabel(def) : defId });
}

/** A term that names a facility and its level inside a longer phrase. */
function namedTerm(key: 'engine.res.scrapSorting' | 'engine.res.refining', defId: string, level: number): string {
  const def = FACILITY_BY_ID[defId];
  return t(key, { name: def ? facilityLabel(def) : defId, level });
}

/** `Water Reclaimer L2` — the facility's translated name plus its level. */
function facilityTerm(defId: string, level: number): string {
  const def = FACILITY_BY_ID[defId];
  return t('engine.facilityLevel', { name: def ? facilityLabel(def) : defId, level });
}

/* --------------------------------------------------------------- production */

export function computeProduction(state: GameState): ResourceBreakdowns {
  const out = emptyBreakdowns();
  const weather = WEATHER[state.weather.id];

  /* ---- water */
  {
    const b = new BreakdownBuilder();
    const reclaimer = findFacility(state, 'water_reclaimer');
    if (reclaimer && reclaimer.status !== 'building') {
      if (isOperational(reclaimer)) {
        const perLevel = [0, 8, 12, 17][reclaimer.level] ?? 0;
        b.base(facilityTerm('water_reclaimer', reclaimer.level), perLevel);
        const power = staffPower(state, reclaimer);
        if (power <= 0) {
          b.mul(
            t('engine.unstaffed'),
            0.7,
            t('engine.res.reclaimerUnstaffed'),
            t('engine.res.reclaimerUnstaffedFix'),
          );
        } else {
          b.mul(t('engine.crewEfficiency'), clamp(0.55 + power * 0.5, 0.55, 1.5));
        }
        b.mul(t('engine.facilityCondition'), clamp(0.5 + reclaimer.condition / 200, 0.5, 1));
      } else if (reclaimer.brownedOut) {
        const perLevel = [0, 8, 12, 17][reclaimer.level] ?? 0;
        b.base(facilityTerm('water_reclaimer', reclaimer.level), perLevel);
        b.mul(
          t('engine.brownedOut'),
          BALANCE.efficiency.brownoutFactor,
          t('engine.res.reclaimerBrownout'),
          t('engine.res.brownoutFix'),
        );
      } else {
        b.base(offlineTerm('water_reclaimer'), 0);
        b.note(t('engine.res.reclaimerBroken'), undefined, t('engine.repairFix'));
      }
    } else {
      b.base(t('engine.res.seep'), 2.6);
      b.note(t('engine.res.seepNote'), undefined, t('engine.res.seepFix'));
    }
    if (state.weather.id === 'rain') b.add(t('engine.res.rain'), 2.2);
    if (state.research.completed.includes('sur_condensers')) b.add(t('engine.res.condensers'), 1.8);
    out.water = b.build({ min: 0, round: 2 });
  }

  /* ---- food */
  {
    const b = new BreakdownBuilder();
    const hydro = findFacility(state, 'hydroponics');
    if (hydro && hydro.status !== 'building') {
      if (isOperational(hydro)) {
        const perLevel = [0, 7, 12, 18][hydro.level] ?? 0;
        b.base(facilityTerm('hydroponics', hydro.level), perLevel);
        const power = staffPower(state, hydro);
        b.mul(t('engine.crewEfficiency'), clamp(0.45 + power * 0.55, 0.45, 1.7));
        b.mul(t('engine.facilityCondition'), clamp(0.5 + hydro.condition / 200, 0.5, 1));
        const scenarioYield = (state.flags['mod:hydroponicsYield'] as number | undefined) ?? 1;
        if (scenarioYield !== 1) b.mul(t('engine.scenarioTerm'), scenarioYield);
        if (state.research.completed.includes('agr_hydroponics')) b.mul(t('engine.res.nutrientFilm'), 1.35);
        if (state.research.completed.includes('agr_deep_root')) b.mul(t('engine.res.deepRoot'), 1.3);
      } else if (hydro.brownedOut) {
        const perLevel = [0, 7, 12, 18][hydro.level] ?? 0;
        b.base(facilityTerm('hydroponics', hydro.level), perLevel);
        b.mul(
          t('engine.brownedOut'),
          BALANCE.efficiency.brownoutFactor,
          t('engine.res.hydroBrownout'),
          t('engine.res.brownoutFix'),
        );
      } else {
        b.base(offlineTerm('hydroponics'), 0);
        b.note(t('engine.res.traysFailed'), undefined, t('engine.repairFix'));
      }
    }
    if (state.research.completed.includes('agr_mycology')) {
      const cellars = operationalLevel(state, 'storage');
      if (cellars > 0) b.add(t('engine.res.mushroomCellar'), 1.4 + cellars * 0.4);
    }
    out.food = b.build({ min: 0, round: 2 });
  }

  /* ---- components (workshop sorting and machine shop refining) */
  {
    const b = new BreakdownBuilder();
    const workshop = findFacility(state, 'workshop');
    if (workshop && workshop.status === 'operational') {
      const perLevel = [0, 1.2, 2.1, 3.1][workshop.level] ?? 0;
      b.base(namedTerm('engine.res.scrapSorting', 'workshop', workshop.level), perLevel);
      const power = staffPower(state, workshop);
      b.mul(t('engine.crewEfficiency'), clamp(0.35 + power * 0.5, 0.35, 1.6));
      if (workshop.brownedOut) b.mul(t('engine.brownedOut'), BALANCE.efficiency.brownoutFactor);
    }
    const shop = findFacility(state, 'machine_shop');
    if (shop && isOperational(shop)) {
      const perLevel = [0, 1.5, 3, 4.5][shop.level] ?? 0;
      const power = staffPower(state, shop);
      b.base(namedTerm('engine.res.refining', 'machine_shop', shop.level), perLevel);
      b.mul(t('engine.crewEfficiency'), clamp(0.4 + power * 0.6, 0.4, 1.6));
    }
    if (state.research.completed.includes('eng_salvage_protocol')) b.add(t('engine.res.salvageProtocol'), 0.8);
    out.components = b.build({ min: 0, round: 2 });
  }

  /* ---- medicine (laboratory synthesis) */
  {
    const b = new BreakdownBuilder();
    if (state.research.completed.includes('med_synthesis')) {
      const lab = findFacility(state, 'laboratory');
      if (lab && isOperational(lab)) {
        b.base(t('engine.res.antibiotics'), 0.5 + lab.level * 0.35);
        b.mul(t('engine.crewEfficiency'), clamp(0.45 + staffPower(state, lab) * 0.55, 0.45, 1.6));
      }
    }
    out.medicine = b.build({ min: 0, round: 2 });
  }

  /* ---- fuel (rendering) */
  {
    const b = new BreakdownBuilder();
    if (state.research.completed.includes('eng_biodiesel')) {
      const shop = findFacility(state, 'machine_shop');
      if (shop && isOperational(shop)) {
        b.base(t('engine.res.biodiesel'), 0.6 + shop.level * 0.3);
      }
    }
    out.fuel = b.build({ min: 0, round: 2 });
  }

  /* ---- hope (from conditions of life, not a facility) */
  {
    const b = new BreakdownBuilder();
    const living = livingSurvivors(state);
    if (living.length > 0) {
      const avgMorale = living.reduce((acc, s) => acc + s.morale, 0) / living.length;
      const pull = (avgMorale - state.resources.hope) * BALANCE.resources.hopeDriftRate;
      b.base(
        t('engine.res.crewMood'),
        pull,
        t('engine.res.crewMoodNote', {
          morale: Math.round(avgMorale),
          hope: Math.round(state.resources.hope),
        }),
      );
    }
    const galley = findFacility(state, 'galley');
    if (galley && isOperational(galley) && galley.level >= 2) {
      b.add(t('engine.res.hotMeals'), galley.level === 3 ? 1.4 : 0.8);
    }
    if (weather.moraleDelta !== 0) b.add(weatherTerm(weather), weather.moraleDelta * 0.35);
    const bunks = operationalLevel(state, 'bunks');
    if (bunks >= 2) b.add(t('engine.res.quarters'), bunks === 3 ? 1.0 : 0.5);
    out.hope = b.build({ round: 2 });
  }

  return out;
}

/* -------------------------------------------------------------- consumption */

export function computeConsumption(state: GameState): ResourceBreakdowns {
  const out = emptyBreakdowns();
  const weather = WEATHER[state.weather.id];
  const living = livingSurvivors(state);
  const atBase = living.filter((s) => s.assignment.kind !== 'expedition');
  const difficultyConsumption = (state.flags['mod:consumption'] as number | undefined) ?? 1;

  /* ---- food */
  {
    const b = new BreakdownBuilder();
    let base = 0;
    for (const survivor of atBase) base += BALANCE.needs.foodPerSurvivor * T.foodToleranceFactor(survivor);
    b.base(
      t('engine.res.rationsFor', { count: atBase.length }),
      base,
      t('engine.res.rationsNote', { amount: BALANCE.needs.foodPerSurvivor }),
    );

    const away = living.length - atBase.length;
    if (away > 0) b.note(t('engine.res.away', { count: away }), t('engine.res.awayNote'));

    const galley = findFacility(state, 'galley');
    if (galley && isOperational(galley)) {
      const efficiency = [0, 0.22, 0.36, 0.5][galley.level] ?? 0;
      const staffed = staffPower(state, galley) > 0;
      const applied = staffed ? efficiency : efficiency * 0.7;
      b.mul(
        facilityTerm('galley', galley.level),
        1 - applied,
        staffed ? undefined : t('engine.res.galleyUnstaffed'),
        staffed ? undefined : t('engine.res.galleyUnstaffedFix'),
      );
    }

    for (const survivor of atBase) {
      if (survivor.conditions.some((c) => c.id === 'malnutrition')) {
        b.add(t('engine.res.recovering', { name: survivor.name }), 0.4);
      }
    }

    if (weather.foodConsumption !== 1) b.mul(weatherTerm(weather), weather.foodConsumption);
    const scenario = (state.flags['mod:foodConsumption'] as number | undefined) ?? 1;
    if (scenario !== 1) b.mul(t('engine.scenarioTerm'), scenario);
    if (difficultyConsumption !== 1) b.mul(t('engine.difficultyTerm'), difficultyConsumption);

    // Spoilage is charged as consumption so the player sees it in one place.
    const spoil = spoilageRate(state);
    if (spoil > 0 && state.resources.food > 0) {
      const lost = state.resources.food * spoil;
      b.add(
        t('engine.res.spoilage'),
        lost,
        t('engine.res.spoilageNote', { percent: Math.round(spoil * 100) }),
        state.research.completed.includes('sur_cold_cellar')
          ? undefined
          : t('engine.res.spoilageFix'),
      );
    }
    out.food = b.build({ min: 0, round: 2 });
  }

  /* ---- water */
  {
    const b = new BreakdownBuilder();
    b.base(
      t('engine.res.drinkingFor', { count: atBase.length }),
      atBase.length * BALANCE.needs.waterPerSurvivor,
      t('engine.res.drinkingNote', { amount: BALANCE.needs.waterPerSurvivor }),
    );
    const hydro = findFacility(state, 'hydroponics');
    if (hydro && isOperational(hydro)) {
      const trayDraw =
        ([0, 2, 3, 4][hydro.level] ?? 0) *
        (state.research.completed.includes('agr_hydroponics') ? 0.5 : 1);
      b.add(facilityTerm('hydroponics', hydro.level), trayDraw, t('engine.res.trayDraw'));
    }
    const infirmary = findFacility(state, 'infirmary');
    const patients = state.survivors.filter((s) => s.alive && s.conditions.length > 0).length;
    if (infirmary && isOperational(infirmary) && patients > 0) {
      b.add(t('engine.res.infirmaryUse'), Math.min(patients, 4) * 0.35);
    }
    if (weather.waterConsumption !== 1) b.mul(weatherTerm(weather), weather.waterConsumption);
    const scenario = (state.flags['mod:waterConsumption'] as number | undefined) ?? 1;
    if (scenario !== 1) b.mul(t('engine.scenarioTerm'), scenario);
    if (difficultyConsumption !== 1) b.mul(t('engine.difficultyTerm'), difficultyConsumption);
    if (state.research.completed.includes('sur_greywater')) {
      b.mul(t('engine.res.greywater'), 0.78);
    }
    out.water = b.build({ min: 0, round: 2 });
  }

  /* ---- fuel (reactor burn) */
  {
    const b = new BreakdownBuilder();
    const reactor = findFacility(state, 'reactor');
    if (reactor && reactor.status !== 'building' && state.resources.fuel > 0) {
      const burn = BALANCE.power.reactorFuel[reactor.level] ?? 0;
      b.base(facilityTerm('reactor', reactor.level), burn);
      if (weather.fuelConsumption !== 1) b.mul(weatherTerm(weather), weather.fuelConsumption);
      const scenario = (state.flags['mod:fuelConsumption'] as number | undefined) ?? 1;
      if (scenario !== 1) b.mul(t('engine.scenarioTerm'), scenario);
      if (state.research.completed.includes('eng_efficient_burn')) b.mul(t('engine.res.efficientBurn'), 0.75);
    }
    out.fuel = b.build({ min: 0, round: 2 });
  }

  /* ---- medicine (treatment) */
  {
    const b = new BreakdownBuilder();
    const infirmary = findFacility(state, 'infirmary');
    if (infirmary && isOperational(infirmary)) {
      const medics = infirmary.staff
        .map((id) => state.survivors.find((s) => s.id === id))
        .filter((s): s is Survivor => Boolean(s));
      let cost = 0;
      const patients = state.survivors.filter((s) => s.alive && s.conditions.length > 0);
      const capacity = infirmary.level >= 3 ? 4 : infirmary.level === 2 ? 3 : 2;
      for (const patient of patients.slice(0, capacity)) {
        for (const condition of patient.conditions) {
          const def = conditionCost(condition.id);
          if (def <= 0) continue;
          const discount = medics.reduce((acc, m) => acc + T.treatmentCostDelta(m), 0);
          cost += Math.max(1, def + discount);
        }
      }
      if (cost > 0) {
        b.base(
          t('engine.res.treatment'),
          cost,
          t('engine.res.treatmentNote', { count: Math.min(patients.length, capacity) }),
        );
      }
    }
    out.medicine = b.build({ min: 0, round: 2 });
  }

  /* ---- hope drain */
  {
    const b = new BreakdownBuilder();
    const drain = (state.flags['mod:hopeDrain'] as number | undefined) ?? 1;
    const dead = state.stats.survivorsLost;
    if (dead > 0) b.base(t('engine.res.deadWeight'), Math.min(3, dead * 0.35));
    if (state.resources.food <= 0) b.add(t('engine.res.emptyLarder'), 4);
    if (state.resources.water <= 0) b.add(t('engine.res.noWater'), 6);
    const brownouts = state.facilities.filter((f) => f.brownedOut).length;
    if (brownouts > 0) b.add(t('engine.res.darkCorridors'), Math.min(4, brownouts * BALANCE.power.brownoutHope));
    if (drain !== 1 && b.value !== 0) b.mul(t('engine.difficultyTerm'), drain);
    out.hope = b.build({ min: 0, round: 2 });
  }

  return out;
}

function conditionCost(id: string): number {
  // Imported lazily to avoid a cycle with data/conditions in tests.
  switch (id) {
    case 'sepsis':
      return 4;
    case 'gunshot':
      return 3;
    case 'infection':
    case 'pneumonia':
    case 'burn':
    case 'crush_injury':
      return 2;
    case 'sprain':
    case 'grieving':
    case 'breakdown':
    case 'exposure':
    case 'malnutrition':
      return 0;
    default:
      return 1;
  }
}

export function spoilageRate(state: GameState): number {
  if (state.research.completed.includes('sur_cold_cellar')) return BALANCE.resources.spoilageWithColdCellar;
  let rate: number = BALANCE.resources.spoilageRate;
  const galley = findFacility(state, 'galley');
  if (galley && isOperational(galley)) rate = BALANCE.resources.spoilageWithGalley;
  if (state.research.completed.includes('sur_preserving')) rate *= 0.5;
  const storage = operationalLevel(state, 'storage');
  const reduction = [0, 0.2, 0.4, 0.65][storage] ?? 0;
  return rate * (1 - reduction);
}

/* ------------------------------------------------------------------- apply */

export interface ResourceResolution {
  production: ResourceBreakdowns;
  consumption: ResourceBreakdowns;
  net: ResourceMap;
  shortfalls: ResourceId[];
}

/**
 * Apply one day of production and consumption. Returns the net change per resource and
 * the list of resources that could not be fully paid, which drives starvation/thirst.
 */
export function resolveResources(state: GameState): ResourceResolution {
  const production = computeProduction(state);
  const consumption = computeConsumption(state);
  const caps = computeCaps(state);
  state.resourceCaps = caps;

  const net = {} as ResourceMap;
  const shortfalls: ResourceId[] = [];

  for (const id of RESOURCE_IDS) {
    if (id === 'power') {
      net.power = 0;
      continue;
    }
    const gain = production[id].total;
    const cost = consumption[id].total;
    const before = state.resources[id];
    let after = before + gain - cost;
    if (after < 0) {
      shortfalls.push(id);
      after = 0;
    }
    const cap = caps[id];
    if (after > cap) after = cap;
    state.resources[id] = roundResource(after);
    net[id] = roundResource(state.resources[id] - before);
    if (gain > 0) state.stats.resourcesGathered += gain;
  }
  state.stats.totalFoodConsumed += consumption.food.total;

  state.resources.hope = clamp(state.resources.hope, 0, 100);
  return { production, consumption, net, shortfalls };
}

export function grantResource(state: GameState, id: ResourceId, amount: number): number {
  const caps = state.resourceCaps ?? computeCaps(state);
  const before = state.resources[id];
  const cap = id === 'hope' ? 100 : caps[id];
  state.resources[id] = roundResource(clamp(before + amount, 0, cap));
  return state.resources[id] - before;
}

export function spendResource(state: GameState, id: ResourceId, amount: number): boolean {
  if (state.resources[id] < amount) return false;
  state.resources[id] = roundResource(state.resources[id] - amount);
  return true;
}
