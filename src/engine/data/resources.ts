import type { ResourceDef, ResourceId, ResourceMap } from '../model/types';
import { RESOURCE_IDS } from '../model/types';
import { BALANCE } from './balance';

export const RESOURCES: Record<ResourceId, ResourceDef> = {
  water: {
    id: 'water',
    name: 'Water',
    summary: 'Clean drinking water. The reclaimer pulls it from the aquifer seep, but only while it has power.',
    failure: 'Dehydration kills faster than hunger. Health falls sharply within a day of running dry.',
    kind: 'stock',
    baseCap: BALANCE.resources.baseCaps.water,
    unit: 'L',
    colour: '#5aa9d6',
    order: 0,
  },
  food: {
    id: 'food',
    name: 'Food',
    summary: 'Rations, tins, and whatever hydroponics yields. Spoils without cold storage.',
    failure: 'Hunger climbs, morale collapses, and then health follows.',
    kind: 'stock',
    baseCap: BALANCE.resources.baseCaps.food,
    unit: 'kg',
    colour: '#c8a24a',
    order: 1,
  },
  power: {
    id: 'power',
    name: 'Power',
    summary: 'Generated each day by the reactor stub and drawn by facilities. Surplus is lost unless you have batteries.',
    failure: 'Facilities brown out in priority order. A dark vault loses hope quickly.',
    kind: 'flow',
    baseCap: BALANCE.resources.baseCaps.power,
    unit: 'kW',
    colour: '#e0c65a',
    order: 2,
  },
  medicine: {
    id: 'medicine',
    name: 'Medicine',
    summary: 'Antiseptics, antibiotics, and dressings. Spent treating injuries and illness.',
    failure: 'Wounds fester. An untreated infection is usually fatal within a week.',
    kind: 'stock',
    baseCap: BALANCE.resources.baseCaps.medicine,
    colour: '#d97f8c',
    order: 3,
  },
  components: {
    id: 'components',
    name: 'Components',
    summary: 'Salvaged wire, plate, motors, and fixings. The currency of everything you build.',
    failure: 'The vault stops growing and starts decaying faster than you can patch it.',
    kind: 'stock',
    baseCap: BALANCE.resources.baseCaps.components,
    colour: '#9aa6ac',
    order: 4,
  },
  fuel: {
    id: 'fuel',
    name: 'Fuel',
    summary: 'Diesel and refined hydrocarbons. Burned by the reactor stub and by anything that moves.',
    failure: 'No fuel means no power, and no chance of driving out.',
    kind: 'stock',
    baseCap: BALANCE.resources.baseCaps.fuel,
    unit: 'L',
    colour: '#c07a3e',
    order: 5,
  },
  ammo: {
    id: 'ammo',
    name: 'Ammunition',
    summary: 'Mixed calibre. Firearms are only worth their weight while this lasts.',
    failure: 'Expeditions fall back on blades and luck.',
    kind: 'stock',
    baseCap: BALANCE.resources.baseCaps.ammo,
    colour: '#b08c6a',
    order: 6,
  },
  hope: {
    id: 'hope',
    name: 'Hope',
    summary: 'What the vault collectively believes about tomorrow. Spent by hard choices, restored by kept promises.',
    failure: 'At zero, people stop taking orders. Then they stop staying.',
    kind: 'meter',
    baseCap: 100,
    unit: '%',
    colour: '#5fd0a0',
    order: 7,
  },
};

export const RESOURCE_LIST: ResourceDef[] = RESOURCE_IDS.map((id) => RESOURCES[id]).sort(
  (a, b) => a.order - b.order,
);

export function emptyResourceMap(fill = 0): ResourceMap {
  return {
    food: fill,
    water: fill,
    power: fill,
    medicine: fill,
    components: fill,
    fuel: fill,
    ammo: fill,
    hope: fill,
  };
}

export function baseResourceCaps(): ResourceMap {
  return { ...BALANCE.resources.baseCaps };
}

/** Resources that are physically stored and therefore subject to storage caps. */
export const STORED_RESOURCES: readonly ResourceId[] = [
  'food',
  'water',
  'medicine',
  'components',
  'fuel',
  'ammo',
] as const;
