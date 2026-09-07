/**
 * The public engine API.
 *
 * Everything the UI, the tests, and the headless simulator need lives here. Nothing under
 * `src/engine` imports React, touches the DOM, or calls `Math.random`.
 */

/* ---- core */
export * from './core/rng';
export * from './core/math';
export * from './core/breakdown';

/* ---- model */
export * from './model/types';
export {
  createInitialState,
  createMetaProfile,
  emptyStats,
  scratchRng,
  SAVE_VERSION,
  META_VERSION,
  type NewRunOptions,
} from './model/state';

/* ---- data */
export { BALANCE } from './data/balance';
export { RESOURCES, RESOURCE_LIST, STORED_RESOURCES, emptyResourceMap } from './data/resources';
export { TRAITS, TRAIT_BY_ID, BASE_TRAIT_POOL, traitName } from './data/traits';
export { CONDITIONS, CONDITION_BY_ID } from './data/conditions';
export { WEATHER, WEATHER_LIST } from './data/weather';
export { FACILITIES, FACILITY_BY_ID, facilityName } from './data/facilities';
export { ITEMS, ITEM_BY_ID, ITEMS_BY_CATEGORY, itemName } from './data/items';
export { RECIPES, RECIPE_BY_ID } from './data/recipes';
export {
  RESEARCH,
  RESEARCH_BY_ID,
  RESEARCH_BRANCHES,
  BRANCH_LABEL,
  BRANCH_COLOUR,
} from './data/research';
export { LOCATION_ARCHETYPES, ARCHETYPE_BY_ID } from './data/locations';
export { ENCOUNTERS, ENCOUNTER_BY_ID, ENEMIES, ENEMY_BY_ID } from './data/encounters';
export { EVENTS, EVENT_BY_ID, EVENT_COUNT } from './data/events';
export { LORE, LORE_BY_ID, THEORY_LABEL, THEORY_SUMMARY } from './data/lore';
export { SCENARIOS, SCENARIO_BY_ID, DEFAULT_SCENARIO } from './data/scenarios';
export { DIFFICULTIES, DIFFICULTY_BY_ID, DEFAULT_DIFFICULTY } from './data/difficulties';
export { META_UNLOCKS, UNLOCK_BY_ID, TOTAL_UNLOCK_COST } from './data/metaUnlocks';
export { BACKGROUNDS, BACKGROUND_BY_ID, type BackgroundDef } from './data/backgrounds';
export { PERSONALITIES, PERSONALITY_BY_ID, type PersonalityDef } from './data/personalities';

/* ---- systems */
export * as Facilities from './systems/facilities';
export * as Resources from './systems/resources';
export * as Survivors from './systems/survivors';
export * as Relationships from './systems/relationships';
export * as Traits from './systems/traits';
export * as Crafting from './systems/crafting';
export * as Research from './systems/research';
export * as World from './systems/world';
export * as Expedition from './systems/expedition';
export * as Combat from './systems/combat';
export * as Inventory from './systems/inventory';
export * as Meta from './systems/meta';

export { advanceDay, crewSummary, closestBond, type AdvanceResult } from './systems/dayCycle';
export {
  selectEvents,
  presentEvent,
  dropUnknownEvents,
  resolveEvent,
  estimateSuccess,
  eventsPerDay,
  type EventPresentation,
  type ChoicePresentation,
  type EventResolution,
} from './systems/events/select';
export { evaluateCondition } from './systems/events/conditions';
export { applyEffect, applyEffects, canPayCost } from './systems/events/effects';
export {
  ENDINGS,
  ENDING_BY_ID,
  detectEnding,
  buildEndingResult,
  computeLegacy,
  updateEndingProgress,
} from './systems/endings';
