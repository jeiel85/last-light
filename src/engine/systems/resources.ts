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
        b.base(`Water Reclaimer L${reclaimer.level}`, perLevel);
        const power = staffPower(state, reclaimer);
        if (power <= 0) {
          b.mul('Unstaffed', 0.7, 'The reclaimer runs, but nobody is watching the pressure.',
            'Assign an engineer to the Water Reclaimer.');
        } else {
          b.mul('Crew efficiency', clamp(0.55 + power * 0.5, 0.55, 1.5));
        }
        b.mul('Facility condition', clamp(0.5 + reclaimer.condition / 200, 0.5, 1));
      } else if (reclaimer.brownedOut) {
        const perLevel = [0, 8, 12, 17][reclaimer.level] ?? 0;
        b.base(`Water Reclaimer L${reclaimer.level}`, perLevel);
        b.mul(
          'Browned out',
          BALANCE.efficiency.brownoutFactor,
          'Running on the standby cell only.',
          'Raise its power priority, or add generation capacity.',
        );
      } else {
        b.base('Water Reclaimer (offline)', 0);
        b.note('The reclaimer is broken.', undefined, 'Repair it in the Base panel.');
      }
    } else {
      b.base('Aquifer seep (hand-drawn)', 2.6);
      b.note('Without a reclaimer you can only carry buckets.', undefined, 'Build the Water Reclaimer.');
    }
    if (state.weather.id === 'rain') b.add('Rain catchment', 2.2);
    if (state.research.completed.includes('sur_condensers')) b.add('Atmospheric condensers', 1.8);
    out.water = b.build({ min: 0, round: 2 });
  }

  /* ---- food */
  {
    const b = new BreakdownBuilder();
    const hydro = findFacility(state, 'hydroponics');
    if (hydro && hydro.status !== 'building') {
      if (isOperational(hydro)) {
        const perLevel = [0, 7, 12, 18][hydro.level] ?? 0;
        b.base(`Hydroponics L${hydro.level}`, perLevel);
        const power = staffPower(state, hydro);
        b.mul('Crew efficiency', clamp(0.45 + power * 0.55, 0.45, 1.7));
        b.mul('Facility condition', clamp(0.5 + hydro.condition / 200, 0.5, 1));
        const scenarioYield = (state.flags['mod:hydroponicsYield'] as number | undefined) ?? 1;
        if (scenarioYield !== 1) b.mul('Scenario', scenarioYield);
        if (state.research.completed.includes('agr_hydroponics')) b.mul('Nutrient film', 1.35);
        if (state.research.completed.includes('agr_deep_root')) b.mul('Deep Root cultivar', 1.3);
      } else if (hydro.brownedOut) {
        const perLevel = [0, 7, 12, 18][hydro.level] ?? 0;
        b.base(`Hydroponics L${hydro.level}`, perLevel);
        b.mul(
          'Browned out',
          BALANCE.efficiency.brownoutFactor,
          'The grow lamps are dark for most of the day.',
          'Raise its power priority or add generation capacity.',
        );
      } else {
        b.base('Hydroponics (offline)', 0);
        b.note('The trays have failed.', undefined, 'Repair it in the Base panel.');
      }
    }
    if (state.research.completed.includes('agr_mycology')) {
      const cellars = operationalLevel(state, 'storage');
      if (cellars > 0) b.add('Mushroom cellar', 1.4 + cellars * 0.4);
    }
    out.food = b.build({ min: 0, round: 2 });
  }

  /* ---- components (workshop sorting and machine shop refining) */
  {
    const b = new BreakdownBuilder();
    const workshop = findFacility(state, 'workshop');
    if (workshop && workshop.status === 'operational') {
      const perLevel = [0, 1.2, 2.1, 3.1][workshop.level] ?? 0;
      b.base(`Workshop L${workshop.level} scrap sorting`, perLevel);
      const power = staffPower(state, workshop);
      b.mul('Crew efficiency', clamp(0.35 + power * 0.5, 0.35, 1.6));
      if (workshop.brownedOut) b.mul('Browned out', BALANCE.efficiency.brownoutFactor);
    }
    const shop = findFacility(state, 'machine_shop');
    if (shop && isOperational(shop)) {
      const perLevel = [0, 1.5, 3, 4.5][shop.level] ?? 0;
      const power = staffPower(state, shop);
      b.base(`Machine Shop L${shop.level} refining`, perLevel);
      b.mul('Crew efficiency', clamp(0.4 + power * 0.6, 0.4, 1.6));
    }
    if (state.research.completed.includes('eng_salvage_protocol')) b.add('Salvage protocol', 0.8);
    out.components = b.build({ min: 0, round: 2 });
  }

  /* ---- medicine (laboratory synthesis) */
  {
    const b = new BreakdownBuilder();
    if (state.research.completed.includes('med_synthesis')) {
      const lab = findFacility(state, 'laboratory');
      if (lab && isOperational(lab)) {
        b.base('Antibiotic synthesis', 0.5 + lab.level * 0.35);
        b.mul('Crew efficiency', clamp(0.45 + staffPower(state, lab) * 0.55, 0.45, 1.6));
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
        b.base('Biodiesel rendering', 0.6 + shop.level * 0.3);
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
      b.base('Crew mood', pull, `Average morale ${Math.round(avgMorale)} vs hope ${Math.round(state.resources.hope)}.`);
    }
    const galley = findFacility(state, 'galley');
    if (galley && isOperational(galley) && galley.level >= 2) {
      b.add('Hot meals', galley.level === 3 ? 1.4 : 0.8);
    }
    if (weather.moraleDelta !== 0) b.add(`Weather: ${weather.name}`, weather.moraleDelta * 0.35);
    const bunks = operationalLevel(state, 'bunks');
    if (bunks >= 2) b.add('Comfortable quarters', bunks === 3 ? 1.0 : 0.5);
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
    b.base(`Rations for ${atBase.length}`, base, `${BALANCE.needs.foodPerSurvivor} per person per day.`);

    const away = living.length - atBase.length;
    if (away > 0) b.note(`${away} away on expedition`, 'They eat from their packs, not the stores.');

    const galley = findFacility(state, 'galley');
    if (galley && isOperational(galley)) {
      const efficiency = [0, 0.22, 0.36, 0.5][galley.level] ?? 0;
      const staffed = staffPower(state, galley) > 0;
      const applied = staffed ? efficiency : efficiency * 0.7;
      b.mul(`Galley L${galley.level}`, 1 - applied, staffed ? undefined : 'Unstaffed galleys stretch food less.',
        staffed ? undefined : 'Assign a cook to the Galley.');
    }

    for (const survivor of atBase) {
      if (survivor.conditions.some((c) => c.id === 'malnutrition')) {
        b.add(`${survivor.name} — recovering`, 0.4);
      }
    }

    if (weather.foodConsumption !== 1) b.mul(`Weather: ${weather.name}`, weather.foodConsumption);
    const scenario = (state.flags['mod:foodConsumption'] as number | undefined) ?? 1;
    if (scenario !== 1) b.mul('Scenario', scenario);
    if (difficultyConsumption !== 1) b.mul('Difficulty', difficultyConsumption);

    // Spoilage is charged as consumption so the player sees it in one place.
    const spoil = spoilageRate(state);
    if (spoil > 0 && state.resources.food > 0) {
      const lost = state.resources.food * spoil;
      b.add(
        'Spoilage',
        lost,
        `${Math.round(spoil * 100)}% of stored food is lost each day.`,
        state.research.completed.includes('sur_cold_cellar')
          ? undefined
          : 'Build Storage, staff the Galley, or research Cold Cellar.',
      );
    }
    out.food = b.build({ min: 0, round: 2 });
  }

  /* ---- water */
  {
    const b = new BreakdownBuilder();
    b.base(
      `Drinking water for ${atBase.length}`,
      atBase.length * BALANCE.needs.waterPerSurvivor,
      `${BALANCE.needs.waterPerSurvivor} litres per person per day.`,
    );
    const hydro = findFacility(state, 'hydroponics');
    if (hydro && isOperational(hydro)) {
      const trayDraw =
        ([0, 2, 3, 4][hydro.level] ?? 0) *
        (state.research.completed.includes('agr_hydroponics') ? 0.5 : 1);
      b.add(`Hydroponics L${hydro.level}`, trayDraw, 'Trays draw from the same tank.');
    }
    const infirmary = findFacility(state, 'infirmary');
    const patients = state.survivors.filter((s) => s.alive && s.conditions.length > 0).length;
    if (infirmary && isOperational(infirmary) && patients > 0) {
      b.add('Infirmary use', Math.min(patients, 4) * 0.35);
    }
    if (weather.waterConsumption !== 1) b.mul(`Weather: ${weather.name}`, weather.waterConsumption);
    const scenario = (state.flags['mod:waterConsumption'] as number | undefined) ?? 1;
    if (scenario !== 1) b.mul('Scenario', scenario);
    if (difficultyConsumption !== 1) b.mul('Difficulty', difficultyConsumption);
    if (state.research.completed.includes('sur_greywater')) {
      b.mul('Greywater recycling', 0.78);
    }
    out.water = b.build({ min: 0, round: 2 });
  }

  /* ---- fuel (reactor burn) */
  {
    const b = new BreakdownBuilder();
    const reactor = findFacility(state, 'reactor');
    if (reactor && reactor.status !== 'building' && state.resources.fuel > 0) {
      const burn = BALANCE.power.reactorFuel[reactor.level] ?? 0;
      b.base(`Reactor L${reactor.level}`, burn);
      if (weather.fuelConsumption !== 1) b.mul(`Weather: ${weather.name}`, weather.fuelConsumption);
      const scenario = (state.flags['mod:fuelConsumption'] as number | undefined) ?? 1;
      if (scenario !== 1) b.mul('Scenario', scenario);
      if (state.research.completed.includes('eng_efficient_burn')) b.mul('Efficient burn cycle', 0.75);
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
      if (cost > 0) b.base('Treatment', cost, `Treating ${Math.min(patients.length, capacity)} patients.`);
    }
    out.medicine = b.build({ min: 0, round: 2 });
  }

  /* ---- hope drain */
  {
    const b = new BreakdownBuilder();
    const drain = (state.flags['mod:hopeDrain'] as number | undefined) ?? 1;
    const dead = state.stats.survivorsLost;
    if (dead > 0) b.base('Weight of the dead', Math.min(3, dead * 0.35));
    if (state.resources.food <= 0) b.add('Empty larder', 4);
    if (state.resources.water <= 0) b.add('No water', 6);
    const brownouts = state.facilities.filter((f) => f.brownedOut).length;
    if (brownouts > 0) b.add('Dark corridors', Math.min(4, brownouts * BALANCE.power.brownoutHope));
    if (drain !== 1 && b.value !== 0) b.mul('Difficulty', drain);
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
