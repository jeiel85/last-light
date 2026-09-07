import type {
  GameState,
  MetaProfile,
  ModifierId,
  ResourceId,
  RunStats,
  ScenarioId,
} from './types';
import { createRng, normaliseSeed, type Rng } from '../core/rng';
import { clamp } from '../core/math';
import { BALANCE } from '../data/balance';
import { baseResourceCaps, emptyResourceMap } from '../data/resources';
import { DIFFICULTY_BY_ID, DEFAULT_DIFFICULTY } from '../data/difficulties';
import { SCENARIO_BY_ID, DEFAULT_SCENARIO } from '../data/scenarios';
import { UNLOCK_BY_ID } from '../data/metaUnlocks';
import { FACILITY_BY_ID } from '../data/facilities';
import { createSlots } from '../systems/facilities';
import { generateSurvivor } from '../systems/survivors';
import { generateWorld } from '../systems/world';
import { pairKey } from '../core/math';

export const SAVE_VERSION = 3;

export interface NewRunOptions {
  seed?: string;
  scenarioId?: ScenarioId;
  difficultyId?: string;
  modifiers?: ModifierId[];
  /** Unlocks owned by the player, used for traits, kits, and scenario gating. */
  unlocks?: readonly string[];
  /** Disable the contextual guidance layer. */
  guidance?: boolean;
  /** Wall-clock timestamp; injectable for deterministic tests. */
  now?: number;
}

export function emptyStats(): RunStats {
  return {
    daysSurvived: 0,
    survivorsLost: 0,
    survivorsRecruited: 0,
    locationsExplored: 0,
    expeditionsCompleted: 0,
    expeditionsAborted: 0,
    resourcesGathered: 0,
    eventsEncountered: 0,
    hardChoicesMade: 0,
    injuriesTreated: 0,
    illnessesCured: 0,
    facilitiesBuilt: 0,
    facilitiesUpgraded: 0,
    itemsCrafted: 0,
    researchCompleted: 0,
    loreFound: 0,
    fightsWon: 0,
    fightsLost: 0,
    peakSurvivors: 0,
    totalFoodConsumed: 0,
    brownoutDays: 0,
    starvationDays: 0,
  };
}

export function createInitialState(options: NewRunOptions = {}): GameState {
  const seed = normaliseSeed(options.seed ?? 'MERIDIAN');
  const scenarioId = options.scenarioId ?? DEFAULT_SCENARIO;
  const difficultyId = options.difficultyId ?? DEFAULT_DIFFICULTY;
  const scenario = SCENARIO_BY_ID[scenarioId] ?? SCENARIO_BY_ID[DEFAULT_SCENARIO]!;
  const difficulty = DIFFICULTY_BY_ID[difficultyId] ?? DIFFICULTY_BY_ID[DEFAULT_DIFFICULTY]!;
  const modifiers = options.modifiers ?? [];
  const unlocks = options.unlocks ?? [];

  const rng = createRng(seed);

  const state: GameState = {
    version: SAVE_VERSION,
    seed,
    rng: rng.snapshot(),
    day: 1,
    phase: 'planning',
    scenarioId: scenario.id,
    difficultyId: difficulty.id,
    modifiers: modifiers.slice(),
    weather: { id: 'overcast', streak: 1, forecast: null },
    resources: emptyResourceMap(),
    resourceCaps: baseResourceCaps(),
    survivors: [],
    relationships: {},
    facilities: [],
    slots: createSlots(),
    inventory: [],
    craftQueue: [],
    research: { completed: [], active: null, insight: 0 },
    world: { locations: [], unlockedRing: 0 },
    expeditions: [],
    activeExpeditionId: null,
    events: { history: [], cooldowns: {}, scheduled: [], pending: [], seenCounts: {} },
    flags: {},
    lore: [],
    stats: emptyStats(),
    log: [],
    lastReport: null,
    ending: null,
    guidance: { enabled: options.guidance ?? true, seen: [] },
    startedAt: options.now ?? 0,
    idCounter: 0,
  };

  /* ---- difficulty and scenario modifiers stored as flags so every system reads one place */
  state.flags['mod:consumption'] = difficulty.consumption;
  state.flags['mod:injuryChance'] = difficulty.injuryChance;
  state.flags['mod:illnessChance'] = difficulty.illnessChance;
  state.flags['mod:facilityDecay'] = difficulty.facilityDecay;
  state.flags['mod:hopeDrain'] = difficulty.hopeDrain;
  state.flags['mod:researchCost'] = difficulty.researchCost;
  state.flags['mod:recruitFrequency'] = difficulty.recruitFrequency;
  state.flags['mod:eventSeverity'] = difficulty.eventSeverity;
  state.flags['mod:deathThreshold'] = difficulty.deathThreshold;

  if (scenario.modifiers.foodConsumption) state.flags['mod:foodConsumption'] = scenario.modifiers.foodConsumption;
  if (scenario.modifiers.waterConsumption) state.flags['mod:waterConsumption'] = scenario.modifiers.waterConsumption;
  if (scenario.modifiers.fuelConsumption) state.flags['mod:fuelConsumption'] = scenario.modifiers.fuelConsumption;
  if (scenario.modifiers.hydroponicsYield) state.flags['mod:hydroponicsYield'] = scenario.modifiers.hydroponicsYield;
  for (const [key, value] of Object.entries(scenario.flags ?? {})) state.flags[key] = value;

  for (const banned of scenario.bannedFacilities ?? []) {
    state.flags[`banned:${banned.facilityId}`] = 1 + banned.days;
  }

  /* ---- resources */
  const storeMultiplier = difficulty.startingStores;
  for (const [key, amount] of Object.entries(scenario.startingResources) as [ResourceId, number][]) {
    state.resources[key] = key === 'hope' ? amount : Math.round(amount * storeMultiplier);
  }
  state.resources.hope = scenario.startingResources.hope ?? BALANCE.resources.startingHope;

  /* ---- kits from meta unlocks */
  for (const unlockId of unlocks) {
    const unlock = UNLOCK_BY_ID[unlockId];
    if (!unlock || unlock.category !== 'kit') continue;
    for (const entry of unlock.kitItems ?? []) addStartingItem(state, entry.itemId, entry.count);
    for (const [key, amount] of Object.entries(unlock.kitResources ?? {}) as [ResourceId, number][]) {
      state.resources[key] += amount;
    }
    if (unlockId === 'kit_seeds' && !state.research.completed.includes('agr_hydroponics')) {
      state.research.completed.push('agr_hydroponics');
    }
  }

  /* ---- items */
  for (const entry of scenario.startingItems) addStartingItem(state, entry.itemId, entry.count);

  /* ---- facilities */
  for (const spec of scenario.startingFacilities) {
    const def = FACILITY_BY_ID[spec.facilityId];
    if (!def) continue;
    const slot = state.slots.find(
      (s) => !s.sealed && def.decks.includes(s.deck) && !state.facilities.some((f) => f.slotId === s.id),
    );
    if (!slot) continue;
    state.idCounter += 1;
    state.facilities.push({
      id: `f${state.idCounter}`,
      defId: def.id,
      slotId: slot.id,
      level: clamp(spec.level, 1, 3),
      condition: 88,
      status: 'operational',
      progress: 0,
      progressRequired: 0,
      staff: [],
      priority: 50,
      brownedOut: false,
      builtDay: 1,
    });
  }
  // The reactor is always the highest priority; the water reclaimer next.
  for (const facility of state.facilities) {
    if (facility.defId === 'water_reclaimer') facility.priority = 100;
    if (facility.defId === 'infirmary') facility.priority = 90;
    if (facility.defId === 'galley') facility.priority = 80;
    if (facility.defId === 'bunks') facility.priority = 60;
    if (facility.defId === 'workshop') facility.priority = 50;
  }

  /* ---- survivors */
  const survivorRng = rng.fork('survivors');
  // The opening crew is guaranteed a spread of competence, so day one is never unplayable.
  const guaranteed = ['mechanic', 'physician', 'scavenger', 'chef', 'soldier', 'teacher', 'electrician', 'farmer'];
  for (let i = 0; i < scenario.survivorCount; i += 1) {
    state.idCounter += 1;
    const backgroundId = i < 3 ? guaranteed[i] : undefined;
    const survivor = generateSurvivor(survivorRng, {
      day: 1,
      idSeq: state.idCounter,
      unlocks,
      ...(backgroundId ? { backgroundId } : {}),
      ...(i < 2 ? { minPrimary: 5 } : {}),
    });
    state.survivors.push(survivor);
  }
  state.stats.peakSurvivors = state.survivors.length;

  /* ---- opening relationships: people who arrived together already know each other a little */
  for (let i = 0; i < state.survivors.length; i += 1) {
    for (let j = i + 1; j < state.survivors.length; j += 1) {
      const value = survivorRng.int(-8, 22);
      state.relationships[pairKey(state.survivors[i]!.id, state.survivors[j]!.id)] = value;
    }
  }

  /* ---- world */
  let richness = difficulty.lootRichness * (scenario.modifiers.lootRichness ?? 1);
  if (modifiers.includes('mod_rich_region')) richness *= 1.3;
  state.world.locations = generateWorld(rng, richness);
  if (modifiers.includes('mod_rich_region')) {
    // Two extra sites are revealed at the start rather than generated, so the seed's map
    // shape stays comparable between modifier and non-modifier runs.
    for (const location of state.world.locations.filter((l) => l.ring <= 1).slice(0, 2)) {
      location.state = 'scouted';
      location.knowledge = 3;
    }
  }

  /* ---- opening log */
  state.log.push({
    id: 'log0',
    day: 1,
    tone: 'system',
    text: `Vault Meridian, day 1. ${state.survivors.length} survivors. ${Math.round(state.resources.food)} food, ${Math.round(state.resources.water)} water.`,
    channel: 'System',
  });
  state.log.push({
    id: 'log1',
    day: 1,
    tone: 'lore',
    text: 'The reactor stub is turning. The air scrubbers are running, mostly. Above you, a city is going cold.',
    channel: 'System',
  });

  state.rng = rng.snapshot();
  return state;
}

function addStartingItem(state: GameState, itemId: string, count: number): void {
  const entry = state.inventory.find((i) => i.itemId === itemId);
  if (entry) entry.count += count;
  else state.inventory.push({ itemId, count });
}

/* ------------------------------------------------------------------ profile */

export const META_VERSION = 1;

export function createMetaProfile(): MetaProfile {
  return {
    version: META_VERSION,
    legacy: 0,
    legacySpent: 0,
    unlocks: [],
    loreArchive: [],
    runsStarted: 0,
    runsCompleted: 0,
    bestDays: 0,
    endingsSeen: [],
    hasPlayed: false,
  };
}

/** Fresh RNG for one-off rolls in the UI layer that must not disturb the run stream. */
export function scratchRng(state: GameState, label: string): Rng {
  return createRng(`${state.seed}:${state.day}:${label}`);
}
