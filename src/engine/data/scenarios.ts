import type { ScenarioDef } from '../model/types';

/**
 * Starting scenarios.
 *
 * Each one is a different opening *problem* rather than a different set of numbers: Black
 * Winter is about consumption, Silent City removes an information channel, The Last Convoy
 * is a deadline, and Skeleton Crew is a labour puzzle with everything already built.
 */

export const SCENARIOS: readonly ScenarioDef[] = [
  {
    id: 'cold_start',
    name: 'Cold Start',
    tagline: 'Four strangers, six days of food, and a door that locks.',
    description:
      'The standard opening. You reached Vault Meridian in the second week, the reactor stub is still turning, and there is enough in the racking to think for a few days. Everything is available and nothing is provided.',
    survivorCount: 4,
    startingResources: { food: 18, water: 20, medicine: 6, components: 22, fuel: 14, ammo: 8, hope: 62 },
    startingItems: [
      { itemId: 'pry_bar', count: 1 },
      { itemId: 'bandage', count: 3 },
      { itemId: 'lantern', count: 1 },
    ],
    startingFacilities: [
      { facilityId: 'reactor', level: 1 },
      { facilityId: 'bunks', level: 1 },
    ],
    modifiers: {},
    difficultyHint: 'standard',
  },
  {
    id: 'black_winter',
    name: 'Black Winter',
    tagline: 'The cold arrived before you did.',
    description:
      'A hard winter over an already-dead grid. Everything burns faster: fuel, food, and people. Hydroponics yields half of what it should under lamps this cold, and the weather will not give you a clear week.',
    survivorCount: 4,
    startingResources: { food: 22, water: 22, medicine: 7, components: 26, fuel: 24, ammo: 8, hope: 60 },
    startingItems: [
      { itemId: 'pry_bar', count: 1 },
      { itemId: 'bandage', count: 3 },
      { itemId: 'tarpaulin', count: 2 },
    ],
    startingFacilities: [
      { facilityId: 'reactor', level: 1 },
      { facilityId: 'bunks', level: 1 },
      { facilityId: 'galley', level: 1 },
    ],
    modifiers: {
      foodConsumption: 1.45,
      fuelConsumption: 1.6,
      hydroponicsYield: 0.5,
      weatherWeights: { cold_snap: 34, storm: 18, clear: 8, heat: 0, rain: 8 },
    },
    difficultyHint: 'hard',
  },
  {
    id: 'silent_city',
    name: 'Silent City',
    tagline: 'The radio room burned. Nobody is going to tell you anything.',
    description:
      'A fire on the second night took the comms deck. No weather forecasts, no trade contacts, no distant discovery, and no early warning of anything — for ten days, and then only if you rebuild it. Whatever is transmitting out there starts by assuming you are hostile.',
    survivorCount: 5,
    startingResources: { food: 20, water: 22, medicine: 5, components: 30, fuel: 12, ammo: 12, hope: 58 },
    startingItems: [
      { itemId: 'pry_bar', count: 1 },
      { itemId: 'machete', count: 1 },
      { itemId: 'bandage', count: 2 },
    ],
    startingFacilities: [
      { facilityId: 'reactor', level: 1 },
      { facilityId: 'bunks', level: 1 },
      { facilityId: 'workshop', level: 1 },
    ],
    bannedFacilities: [{ facilityId: 'radio_room', days: 10 }],
    modifiers: { eventSeverity: 1, recruitFrequency: 0.7 },
    flags: { 'listeners.hostile': true, 'scenario.no_forecast': true },
    difficultyHint: 'hard',
  },
  {
    id: 'last_convoy',
    name: 'The Last Convoy',
    tagline: 'Eight people. Three days of food. Twenty-five days to get out.',
    description:
      'A column heading north-east broke up two streets away and what is left of it came down your stair. Eight mouths, almost nothing to put in them, and word that the road closes for good on day twenty-five. Build the convoy or be here when it does.',
    survivorCount: 8,
    startingResources: { food: 10, water: 16, medicine: 8, components: 34, fuel: 20, ammo: 16, hope: 55 },
    startingItems: [
      { itemId: 'pry_bar', count: 2 },
      { itemId: 'bandage', count: 4 },
      { itemId: 'pack_frame', count: 1 },
      { itemId: 'service_pistol', count: 1 },
    ],
    startingFacilities: [
      { facilityId: 'reactor', level: 1 },
      { facilityId: 'bunks', level: 2 },
      { facilityId: 'workshop', level: 1 },
    ],
    modifiers: { foodConsumption: 1.0, lootRichness: 1.15 },
    deadlineDay: 25,
    deadlineText: 'The road north-east closes on day 25.',
    flags: { 'scenario.deadline': 25 },
    difficultyHint: 'brutal',
  },
  {
    id: 'skeleton_crew',
    name: 'Skeleton Crew',
    tagline: 'Two people and a fully built vault they cannot possibly staff.',
    description:
      'Whoever was here before did the work and did not survive it. Every core facility stands at level one and there are two of you to run all of them. This is a scheduling problem with a body count.',
    survivorCount: 2,
    startingResources: { food: 34, water: 36, medicine: 12, components: 30, fuel: 22, ammo: 10, hope: 50 },
    startingItems: [
      { itemId: 'multitool', count: 1 },
      { itemId: 'first_aid_kit', count: 2 },
      { itemId: 'lantern', count: 1 },
      { itemId: 'machete', count: 1 },
    ],
    startingFacilities: [
      { facilityId: 'reactor', level: 1 },
      { facilityId: 'bunks', level: 1 },
      { facilityId: 'water_reclaimer', level: 1 },
      { facilityId: 'galley', level: 1 },
      { facilityId: 'workshop', level: 1 },
      { facilityId: 'infirmary', level: 1 },
    ],
    modifiers: { recruitFrequency: 1.6 },
    difficultyHint: 'hard',
  },
  {
    id: 'meridian_key',
    name: 'The Meridian Key',
    tagline: 'You already know what this place was. So do they.',
    description:
      'You arrived with a brass-and-ceramic token and a partial understanding of what Facility Twelve was built for. The Deep Archive is open from day one — and something at the other end of the programme is aware that somebody is reading.',
    survivorCount: 4,
    startingResources: { food: 16, water: 18, medicine: 6, components: 24, fuel: 16, ammo: 10, hope: 58 },
    startingItems: [
      { itemId: 'meridian_key', count: 1 },
      { itemId: 'data_slate', count: 1 },
      { itemId: 'pry_bar', count: 1 },
      { itemId: 'bandage', count: 2 },
    ],
    startingFacilities: [
      { facilityId: 'reactor', level: 1 },
      { facilityId: 'bunks', level: 1 },
      { facilityId: 'deep_archive', level: 1 },
    ],
    modifiers: { eventSeverity: 1, lootRichness: 0.95 },
    flags: { 'meridian.suspicious': true, 'meridian.progress': 3, 'meridian.watched': true },
    requiresUnlock: 'scenario_meridian_key',
    difficultyHint: 'hard',
  },
];

export const SCENARIO_BY_ID: Record<string, ScenarioDef> = Object.fromEntries(
  SCENARIOS.map((s) => [s.id, s]),
);

export const DEFAULT_SCENARIO = 'cold_start';
