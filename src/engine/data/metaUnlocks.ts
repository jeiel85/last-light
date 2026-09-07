import type { MetaUnlockDef } from '../model/types';

/**
 * Legacy unlocks.
 *
 * Anti-grind rule from GAME_DESIGN §16: nothing here is a raw power increase to the base
 * run. Unlocks add *options* — scenarios, traits in the generation pool, starting kits that
 * trade one advantage for another, and run modifiers that mostly make the game harder.
 * The full tree costs 320 Legacy, which is roughly 8–12 runs.
 */

export const META_UNLOCKS: readonly MetaUnlockDef[] = [
  /* ------------------------------------------------------------- scenarios */
  {
    id: 'scenario_black_winter',
    name: 'Scenario: Black Winter',
    description: 'A hard winter over a dead grid. Everything burns faster.',
    cost: 20,
    category: 'scenario',
  },
  {
    id: 'scenario_silent_city',
    name: 'Scenario: Silent City',
    description: 'No radio for ten days. No forecasts, no contacts, no warning.',
    cost: 30,
    category: 'scenario',
  },
  {
    id: 'scenario_last_convoy',
    name: 'Scenario: The Last Convoy',
    description: 'Eight survivors, three days of food, and a deadline on day 25.',
    cost: 45,
    requires: ['scenario_black_winter'],
    category: 'scenario',
  },
  {
    id: 'scenario_skeleton_crew',
    name: 'Scenario: Skeleton Crew',
    description: 'Two people, a fully built vault, and an impossible rota.',
    cost: 45,
    requires: ['scenario_silent_city'],
    category: 'scenario',
  },
  {
    id: 'scenario_meridian_key',
    name: 'Scenario: The Meridian Key',
    description: 'Start with the Deep Archive open — and something aware that you are reading.',
    cost: 70,
    requires: ['scenario_last_convoy', 'scenario_skeleton_crew'],
    category: 'scenario',
  },

  /* ---------------------------------------------------------------- traits */
  {
    id: 'trait_radio_ear',
    name: 'Trait: Radio Ear',
    description: 'Adds survivors who hear structure in static to the generation pool.',
    cost: 15,
    category: 'trait',
  },
  {
    id: 'trait_survivalist',
    name: 'Trait: Survivalist',
    description: 'Adds survivors who were prepared for exactly this.',
    cost: 18,
    category: 'trait',
  },
  {
    id: 'trait_forager',
    name: 'Trait: Forager',
    description: 'Adds survivors who know which of it is edible.',
    cost: 18,
    requires: ['trait_survivalist'],
    category: 'trait',
  },
  {
    id: 'trait_field_surgeon',
    name: 'Trait: Field Surgeon',
    description: 'Adds survivors who have cut people open on a floor before.',
    cost: 28,
    requires: ['trait_radio_ear'],
    category: 'trait',
  },
  {
    id: 'trait_quiet_touched',
    name: 'Trait: Quiet-Touched',
    description: 'Adds survivors who were outside when it happened, and dream in a frequency.',
    cost: 34,
    requires: ['trait_field_surgeon', 'trait_forager'],
    category: 'trait',
  },

  /* ------------------------------------------------------------------ kits */
  {
    id: 'kit_tools',
    name: 'Starting Kit: Tools',
    description: 'Begin with a multitool, bolt cutters, and 10 extra components.',
    cost: 16,
    category: 'kit',
    kitItems: [
      { itemId: 'multitool', count: 1 },
      { itemId: 'bolt_cutters', count: 1 },
    ],
    kitResources: { components: 10 },
  },
  {
    id: 'kit_medicine',
    name: 'Starting Kit: Medicine',
    description: 'Begin with a first aid kit, antibiotics, and 6 extra medicine.',
    cost: 16,
    category: 'kit',
    kitItems: [
      { itemId: 'first_aid_kit', count: 1 },
      { itemId: 'antibiotics', count: 1 },
    ],
    kitResources: { medicine: 6 },
  },
  {
    id: 'kit_arms',
    name: 'Starting Kit: Arms',
    description: 'Begin with a machete, a padded vest, and 12 extra ammunition.',
    cost: 20,
    requires: ['kit_tools'],
    category: 'kit',
    kitItems: [
      { itemId: 'machete', count: 1 },
      { itemId: 'padded_vest', count: 1 },
    ],
    kitResources: { ammo: 12 },
  },
  {
    id: 'kit_seeds',
    name: 'Starting Kit: Seeds',
    description: 'Begin with two seed trays and the Hydroponics research already done.',
    cost: 30,
    requires: ['kit_medicine'],
    category: 'kit',
    kitItems: [{ itemId: 'seed_tray', count: 2 }],
  },

  /* ------------------------------------------------------------- modifiers */
  {
    id: 'mod_ironman',
    name: 'Modifier: Ironman',
    description: 'One save slot, overwritten every day. No reloading a bad decision. +40% Legacy.',
    cost: 24,
    category: 'modifier',
  },
  {
    id: 'mod_rich_region',
    name: 'Modifier: Rich Region',
    description: 'The map generates with 30% more loot and 2 extra sites. −25% Legacy.',
    cost: 18,
    category: 'modifier',
  },
  {
    id: 'mod_long_winter',
    name: 'Modifier: Long Winter',
    description: 'Cold weather is twice as likely all run, in any scenario. +30% Legacy.',
    cost: 22,
    requires: ['mod_rich_region'],
    category: 'modifier',
  },

  /* --------------------------------------------------------------- archive */
  {
    id: 'archive_theories',
    name: 'Archive: Theory Board',
    description:
      'The archive begins grouping fragments by theory and showing how much of each you have assembled.',
    cost: 25,
    category: 'archive',
  },
  {
    id: 'archive_carryover',
    name: 'Archive: Continuity',
    description:
      'Lore found in previous runs stays readable in the archive, and archive research starts 15% cheaper.',
    cost: 40,
    requires: ['archive_theories'],
    category: 'archive',
  },
];

export const UNLOCK_BY_ID: Record<string, MetaUnlockDef> = Object.fromEntries(
  META_UNLOCKS.map((u) => [u.id, u]),
);

export const TOTAL_UNLOCK_COST = META_UNLOCKS.reduce((acc, u) => acc + u.cost, 0);
