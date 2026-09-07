/**
 * The complete domain model for LAST LIGHT.
 *
 * `GameState` is a plain, JSON-serialisable object: no class instances, no Map/Set, no
 * functions, no Date objects. That constraint is what lets the whole simulation round-trip
 * through IndexedDB and be replayed deterministically from a seed.
 */

import type { RngState } from '../core/rng';
import type { Breakdown } from '../core/breakdown';

/* ------------------------------------------------------------------ identifiers */

export type SurvivorId = string;
export type FacilityId = string;
export type SlotId = string;
export type ItemId = string;
export type RecipeId = string;
export type ResearchId = string;
export type LocationId = string;
export type LocationArchetypeId = string;
export type EventId = string;
export type TraitId = string;
export type ConditionId = string;
export type LoreId = string;
export type ScenarioId = string;
export type DifficultyId = string;
export type ModifierId = string;
export type EncounterId = string;
export type UnlockId = string;

/* -------------------------------------------------------------------- resources */

export type ResourceId =
  | 'food'
  | 'water'
  | 'power'
  | 'medicine'
  | 'components'
  | 'fuel'
  | 'ammo'
  | 'hope';

export const RESOURCE_IDS: readonly ResourceId[] = [
  'food',
  'water',
  'power',
  'medicine',
  'components',
  'fuel',
  'ammo',
  'hope',
] as const;

export interface ResourceDef {
  id: ResourceId;
  name: string;
  /** One-line explanation shown in the encyclopedia and on hover. */
  summary: string;
  /** What happens when it runs out. */
  failure: string;
  /** `stock` accumulates; `flow` is produced and drawn each day; `meter` is 0–100. */
  kind: 'stock' | 'flow' | 'meter';
  baseCap: number;
  /** Display unit suffix, e.g. "kW". */
  unit?: string;
  colour: string;
  /** Ordering in the status rail. */
  order: number;
}

export type ResourceMap = Record<ResourceId, number>;

/* --------------------------------------------------------------------- survivor */

export type SkillId =
  | 'medicine'
  | 'engineering'
  | 'combat'
  | 'scavenging'
  | 'cooking'
  | 'science'
  | 'botany'
  | 'negotiation';

export const SKILL_IDS: readonly SkillId[] = [
  'medicine',
  'engineering',
  'combat',
  'scavenging',
  'cooking',
  'science',
  'botany',
  'negotiation',
] as const;

export type SkillMap = Record<SkillId, number>;

export type Pronouns = 'she/her' | 'he/him' | 'they/them';

export interface SurvivorCondition {
  id: ConditionId;
  /** Days since it was acquired. */
  age: number;
  /** 0–100. Rises when untreated, falls with care. */
  severity: number;
  treated: boolean;
  /** Day it was acquired, for the history panel. */
  acquiredDay: number;
}

export type EquipmentSlot = 'weapon' | 'tool' | 'armour' | 'utility';

export type Equipment = Partial<Record<EquipmentSlot, ItemId>>;

export type AssignmentKind = 'idle' | 'rest' | 'facility' | 'expedition' | 'recovering';

export interface Assignment {
  kind: AssignmentKind;
  /** Present when kind is 'facility'. */
  facilityId?: FacilityId;
  /** Present when kind is 'expedition'. */
  expeditionId?: string;
}

export interface SurvivorHistoryEntry {
  day: number;
  text: string;
  tone: 'good' | 'bad' | 'neutral';
}

export interface Survivor {
  id: SurvivorId;
  name: string;
  surname: string;
  age: number;
  pronouns: Pronouns;
  /** Free-text occupation label, e.g. "Paramedic". */
  occupation: string;
  /** Background archetype id used for generation and event gating. */
  backgroundId: string;
  personalityId: string;
  /** Deterministic seed for the procedural portrait. */
  portraitSeed: number;
  traits: TraitId[];
  skills: SkillMap;
  health: number;
  hunger: number;
  fatigue: number;
  morale: number;
  conditions: SurvivorCondition[];
  equipment: Equipment;
  assignment: Assignment;
  history: SurvivorHistoryEntry[];
  /** Day they joined the vault. */
  joinedDay: number;
  alive: boolean;
  /** Set when they die, for the memorial. */
  deathDay?: number;
  deathCause?: string;
  /** Accumulated stress from traits like Insomniac; feeds breakdown events. */
  stress: number;
  /** Days spent grieving a lost friend. */
  grievingDays: number;
  /** Number of expeditions completed — used by veterans' events. */
  expeditionsCompleted: number;
}

/* ------------------------------------------------------------------------ trait */

export type TraitCategory = 'physical' | 'mental' | 'social' | 'skill' | 'flaw';

export interface TraitDef {
  id: TraitId;
  name: string;
  description: string;
  category: TraitCategory;
  /** Positive traits cost generation budget; negatives refund it. */
  cost: number;
  /** Traits that cannot coexist with this one. */
  conflicts?: TraitId[];
  /** If set, the trait is only generated when the unlock is owned. */
  requiresUnlock?: UnlockId;
  /** Flat skill adjustments applied at generation. */
  skillMods?: Partial<SkillMap>;
  /** Declarative modifiers consumed by the trait hook registry. */
  effects: TraitEffect[];
}

export type TraitEffect =
  | { kind: 'workMultiplier'; facility?: FacilityId; skill?: SkillId; factor: number }
  | { kind: 'needRate'; need: 'hunger' | 'fatigue' | 'morale' | 'health'; factor: number }
  | { kind: 'moraleAura'; radius: 'facility' | 'base'; amount: number }
  | { kind: 'restQuality'; factor: number }
  | { kind: 'injuryChance'; factor: number }
  | { kind: 'injurySeverity'; factor: number }
  | { kind: 'illnessChance'; factor: number }
  | { kind: 'treatmentQuality'; factor: number }
  | { kind: 'treatmentCost'; delta: number }
  | { kind: 'scavengeYield'; factor: number }
  | { kind: 'combatPower'; delta: number }
  | { kind: 'retreatChance'; delta: number }
  | { kind: 'craftCostChance'; chance: number }
  | { kind: 'packCapacity'; delta: number }
  | { kind: 'relationshipDrift'; direction: 'positive' | 'negative'; factor: number }
  | { kind: 'stressPerDay'; amount: number }
  | { kind: 'hopeOnDeath'; delta: number }
  | { kind: 'researchRate'; factor: number }
  | { kind: 'expeditionSpeed'; factor: number }
  | { kind: 'foodTolerance'; factor: number }
  | { kind: 'shiftBonus'; shift: 'day' | 'night'; factor: number }
  | { kind: 'requiresFacility'; facility: FacilityId; moralePerDay: number }
  | { kind: 'eventWeight'; tag: string; factor: number }
  | { kind: 'guardian'; chance: number }
  | { kind: 'immunity'; condition: ConditionId };

/* ------------------------------------------------------------------- conditions */

export interface ConditionDef {
  id: ConditionId;
  name: string;
  description: string;
  kind: 'injury' | 'illness' | 'state';
  /** Severity added per day when untreated. Negative values heal on their own. */
  progressPerDay: number;
  /** Severity removed per day when treated in a working infirmary. */
  treatPerDay: number;
  /** Medicine consumed per treatment day. */
  medicineCost: number;
  /** Health lost per day, scaled by severity/100. */
  healthDrainAtFull: number;
  /** Multiplicative work penalty at full severity. */
  workPenaltyAtFull: number;
  moralePerDay: number;
  /** Severity at or above which the condition can kill. */
  lethalAt?: number;
  /** Conditions this can turn into if it worsens past `lethalAt`. */
  escalatesTo?: ConditionId;
  /** Blocks expedition assignment. */
  blocksExpedition?: boolean;
  contagious?: number;
}

/* ------------------------------------------------------------------- facilities */

export interface FacilityLevelDef {
  buildCost: Partial<ResourceMap>;
  /** Labour units required to complete construction. */
  labour: number;
  powerDraw: number;
  staffSlots: number;
  /** Level-specific production description shown in the UI. */
  summary: string;
}

export type FacilityRole =
  | 'power'
  | 'water'
  | 'food'
  | 'medical'
  | 'industry'
  | 'rest'
  | 'storage'
  | 'comms'
  | 'science'
  | 'defence'
  | 'access'
  | 'archive';

export interface FacilityDef {
  id: FacilityId;
  name: string;
  role: FacilityRole;
  description: string;
  /** Which deck it may be built on. */
  decks: number[];
  levels: [FacilityLevelDef, FacilityLevelDef, FacilityLevelDef];
  /** Primary skill used by staff. */
  skill: SkillId;
  /** Research required before it can be built. */
  requiresResearch?: ResearchId;
  /** Condition lost per day of operation. */
  decayPerDay: number;
  /** Only one may exist. */
  unique: boolean;
  /** Icon key resolved by the UI's generated icon set. */
  icon: string;
}

export type FacilityStatus = 'building' | 'operational' | 'damaged' | 'offline';

export interface FacilityInstance {
  id: string;
  defId: FacilityId;
  slotId: SlotId;
  level: number;
  condition: number;
  status: FacilityStatus;
  /** Labour accumulated toward the current build/upgrade. */
  progress: number;
  /** Labour required to finish the current build/upgrade. */
  progressRequired: number;
  /** Set while an upgrade is in flight; the facility keeps working at its old level. */
  upgradingTo?: number;
  staff: SurvivorId[];
  /** Player-set brownout priority; higher survives longer. */
  priority: number;
  /** True when the facility was browned out on the previous day. */
  brownedOut: boolean;
  builtDay: number;
}

export interface BuildSlot {
  id: SlotId;
  deck: number;
  index: number;
  /** Sealed slots must be cleared before use. */
  sealed: boolean;
  /** Components required to clear the slot. */
  clearCost: number;
  clearLabour: number;
  clearProgress: number;
}

/* ------------------------------------------------------------------------ items */

export type ItemCategory =
  | 'tool'
  | 'weapon'
  | 'protection'
  | 'medical'
  | 'exploration'
  | 'utility';

export interface ItemDef {
  id: ItemId;
  name: string;
  category: ItemCategory;
  description: string;
  /** Pack weight for expedition load-outs. */
  weight: number;
  /** Equipment slot this item occupies, if equippable. */
  slot?: EquipmentSlot;
  /** Combat contribution when equipped or packed. */
  power?: number;
  /** Ranged weapons spend ammo per fight. */
  ammoPerFight?: number;
  /** Damage mitigation for the wearer. */
  armour?: number;
  /** Skill bonus while equipped. */
  skillBonus?: Partial<SkillMap>;
  /** Consumed on use during expeditions/events. */
  consumable?: boolean;
  /** Effect when consumed. */
  use?: ItemUse;
  /** Carry capacity granted. */
  capacityBonus?: number;
  /** Tags used by encounter choice requirements, e.g. 'cutting', 'light'. */
  tags: string[];
  /** Base scrap value when salvaged, in components. */
  salvage: number;
  icon: string;
}

export type ItemUse =
  | { kind: 'heal'; amount: number }
  | { kind: 'cure'; conditions: ConditionId[]; chance: number }
  | { kind: 'restoreFatigue'; amount: number }
  | { kind: 'restoreMorale'; amount: number }
  | { kind: 'resource'; resource: ResourceId; amount: number }
  | { kind: 'stabilise'; amount: number };

export interface InventoryEntry {
  itemId: ItemId;
  count: number;
}

/* --------------------------------------------------------------------- crafting */

export interface RecipeDef {
  id: RecipeId;
  itemId: ItemId;
  /** How many of the item a single completed job yields. */
  yield: number;
  cost: Partial<ResourceMap>;
  /** Other items consumed. */
  itemCost?: InventoryEntry[];
  labour: number;
  facility: FacilityId;
  minLevel: number;
  requiresResearch?: ResearchId;
  category: ItemCategory;
}

export interface CraftJob {
  id: string;
  recipeId: RecipeId;
  progress: number;
  required: number;
  startedDay: number;
}

/* --------------------------------------------------------------------- research */

export type ResearchBranch =
  | 'survival'
  | 'engineering'
  | 'medicine'
  | 'exploration'
  | 'agriculture'
  | 'communications'
  | 'defence';

export interface ResearchDef {
  id: ResearchId;
  name: string;
  branch: ResearchBranch;
  description: string;
  /** What this actually enables, in player-facing terms. */
  effectText: string;
  cost: number;
  requires: ResearchId[];
  /** Tier controls layout depth in the tree view. */
  tier: number;
  unlocks: ResearchUnlock[];
  /** Additional gate beyond prerequisites, e.g. a discovered location. */
  requiresFlag?: string;
}

export type ResearchUnlock =
  | { kind: 'recipe'; recipeId: RecipeId }
  | { kind: 'facility'; facilityId: FacilityId }
  | { kind: 'passive'; id: string; detail: string }
  | { kind: 'action'; id: string; detail: string }
  | { kind: 'ending'; endingId: string }
  | { kind: 'ring'; ring: number };

export interface ActiveResearch {
  id: ResearchId;
  progress: number;
  required: number;
  startedDay: number;
}

/* ------------------------------------------------------------------------ world */

export type LocationState =
  | 'unknown'
  | 'rumoured'
  | 'scouted'
  | 'explored'
  | 'depleted'
  | 'collapsed'
  | 'claimed';

export interface LootEntry {
  resource?: ResourceId;
  itemId?: ItemId;
  min: number;
  max: number;
  weight: number;
}

export interface LocationArchetype {
  id: LocationArchetypeId;
  name: string;
  /** Alternative names used when generating instances. */
  nameForms: string[];
  description: string;
  baseDanger: number;
  /** Ring this archetype may appear in. */
  rings: number[];
  loot: LootEntry[];
  /** Richness multiplier — how much total loot the site holds. */
  richness: number;
  /** Encounter tags that bias which beats appear here. */
  encounterTags: string[];
  /** Events that can only fire while exploring this archetype. */
  siteEvents?: EventId[];
  /** Lore entries this site can yield. */
  lore?: LoreId[];
  /** At most this many instances per run. */
  maxInstances: number;
  icon: string;
}

export interface LocationInstance {
  id: LocationId;
  archetypeId: LocationArchetypeId;
  name: string;
  ring: number;
  /** Position on the radial map, in radians and normalised radius. */
  angle: number;
  radius: number;
  distanceKm: number;
  travelDays: number;
  danger: number;
  state: LocationState;
  /** 0–1; drops as the site is looted. */
  richness: number;
  visits: number;
  /** Progressive knowledge: 0 nothing, 1 archetype, 2 danger, 3 loot, 4 occupancy. */
  knowledge: number;
  /** Set when an event or expedition permanently changes the site. */
  note?: string;
  lastVisitDay?: number;
  /** Site-specific flags, e.g. a door the team could not open. */
  flags: string[];
}

/* ------------------------------------------------------------------ expeditions */

export interface ExpeditionLoadout {
  items: InventoryEntry[];
  rations: number;
  water: number;
  ammo: number;
  medicine: number;
}

export interface ExpeditionBeatRecord {
  encounterId: EncounterId;
  title: string;
  text: string;
  choiceId: string;
  choiceLabel: string;
  outcomeText: string;
  tone: 'good' | 'bad' | 'neutral';
  roll?: { skill: SkillId; value: number; target: number; success: boolean; actor: string };
}

export interface ActiveExpedition {
  id: string;
  locationId: LocationId;
  members: SurvivorId[];
  loadout: ExpeditionLoadout;
  departedDay: number;
  returnDay: number;
  /** Loot accumulated during resolution, delivered on return. */
  haulResources: Partial<ResourceMap>;
  haulItems: InventoryEntry[];
  /** Beats already resolved. */
  log: ExpeditionBeatRecord[];
  /** Remaining beat queue for the interactive resolution. */
  queue: EncounterId[];
  /** Set once every beat has resolved. */
  resolved: boolean;
  /** Members who died during the expedition. */
  casualties: SurvivorId[];
  loreFound: LoreId[];
  /** Accumulated preparation modifier from earlier beats. */
  preparation: number;
  /** Whether the team aborted early. */
  aborted: boolean;
}

export interface ExpeditionForecast {
  combatPower: Breakdown;
  carryCapacity: Breakdown;
  injuryRisk: Breakdown;
  deathRisk: Breakdown;
  rationsNeeded: number;
  waterNeeded: number;
  expectedHaul: { resource: ResourceId; min: number; max: number }[];
  warnings: string[];
  travelDays: number;
}

/* ---------------------------------------------------------------------- weather */

export type WeatherId =
  | 'clear'
  | 'overcast'
  | 'rain'
  | 'storm'
  | 'ash_fall'
  | 'cold_snap'
  | 'fog'
  | 'heat';

export interface WeatherDef {
  id: WeatherId;
  name: string;
  description: string;
  /** Multipliers applied for the day. */
  expeditionDanger: number;
  scavengeYield: number;
  foodConsumption: number;
  waterConsumption: number;
  fuelConsumption: number;
  moraleDelta: number;
  /** Weight in the daily roll; modified by scenario. */
  weight: number;
  colour: string;
}

export interface WeatherState {
  id: WeatherId;
  /** Days this weather has persisted. */
  streak: number;
  /** Tomorrow's forecast, revealed by the Radio Room. */
  forecast: WeatherId | null;
}

/* ----------------------------------------------------------------------- events */

export type EventPhase = 'dawn' | 'dusk' | 'expedition' | 'any';

export type EventCondition =
  | { kind: 'all'; of: EventCondition[] }
  | { kind: 'any'; of: EventCondition[] }
  | { kind: 'not'; of: EventCondition }
  | { kind: 'day'; min?: number; max?: number }
  | { kind: 'resource'; resource: ResourceId; min?: number; max?: number }
  | { kind: 'resourceRatio'; resource: ResourceId; maxRatio?: number; minRatio?: number }
  | { kind: 'survivorCount'; min?: number; max?: number }
  | { kind: 'facility'; facilityId: FacilityId; minLevel?: number; operational?: boolean; absent?: boolean }
  | { kind: 'skill'; skill: SkillId; min: number }
  | { kind: 'trait'; traitId: TraitId; present?: boolean }
  | { kind: 'condition'; conditionId: ConditionId; min?: number }
  | { kind: 'relationship'; bucket: RelationshipBucket; min?: number }
  | { kind: 'flag'; flag: string; equals?: string | number | boolean; atLeast?: number }
  | { kind: 'research'; researchId: ResearchId }
  | { kind: 'item'; itemId: ItemId; min?: number }
  | { kind: 'location'; archetypeId?: LocationArchetypeId; state?: LocationState; min?: number }
  | { kind: 'weather'; weatherId: WeatherId }
  | { kind: 'difficulty'; atLeast?: number }
  | { kind: 'scenario'; scenarioId: ScenarioId }
  | { kind: 'eventSeen'; eventId: EventId; times?: number }
  | { kind: 'morale'; max?: number; min?: number }
  | { kind: 'chance'; p: number };

export type EventEffect =
  | { kind: 'resource'; resource: ResourceId; amount: number; detail?: string }
  | { kind: 'resourcePercent'; resource: ResourceId; percent: number }
  | { kind: 'item'; itemId: ItemId; count: number }
  | { kind: 'need'; target: EffectTarget; need: 'health' | 'hunger' | 'fatigue' | 'morale'; amount: number }
  | { kind: 'injure'; target: EffectTarget; conditionId: ConditionId; severity: number }
  | { kind: 'cure'; target: EffectTarget; conditionId?: ConditionId }
  | { kind: 'kill'; target: EffectTarget; cause: string }
  | { kind: 'recruit'; count?: number; traitHint?: TraitId; skillHint?: SkillId }
  | { kind: 'trait'; target: EffectTarget; traitId: TraitId; remove?: boolean }
  | { kind: 'facilityDamage'; facilityId?: FacilityId; amount: number }
  | { kind: 'facilityRepair'; facilityId?: FacilityId; amount: number }
  | { kind: 'facilityGrant'; facilityId: FacilityId; level?: number }
  | { kind: 'research'; researchId: ResearchId; grant?: boolean; insight?: number }
  | { kind: 'relationship'; a: EffectTarget; b: EffectTarget; amount: number }
  | { kind: 'flag'; flag: string; value?: string | number | boolean; increment?: number }
  | { kind: 'lore'; loreId: LoreId }
  | { kind: 'revealLocation'; archetypeId?: LocationArchetypeId; ring?: number; count?: number }
  | { kind: 'locationState'; locationId?: LocationId; state: LocationState }
  | { kind: 'schedule'; eventId: EventId; inDays: number }
  | { kind: 'chain'; eventId: EventId }
  | { kind: 'stat'; stat: keyof RunStats; amount: number }
  | { kind: 'weather'; weatherId: WeatherId }
  | { kind: 'ending'; endingId: string };

export type EffectTarget =
  | 'actor'
  | 'all'
  | 'random'
  | 'weakest'
  | 'strongest'
  | 'lowestMorale'
  | 'random_other'
  | { survivorId: SurvivorId };

export interface EventCheck {
  skill: SkillId;
  target: number;
  /** Which survivor rolls: the best available, a random one, or the event actor. */
  actor: 'best' | 'random' | 'actor';
  /** Traits that add to the roll. */
  traitBonus?: { traitId: TraitId; amount: number }[];
}

export interface EventChoice {
  id: string;
  label: string;
  /** Short player-facing explanation of what this option risks or costs. */
  hint?: string;
  requires?: EventCondition;
  /** Resource or item cost paid on selection; the choice is disabled if unaffordable. */
  cost?: { resources?: Partial<ResourceMap>; items?: InventoryEntry[] };
  check?: EventCheck;
  effects?: EventEffect[];
  onSuccess?: EventEffect[];
  onFailure?: EventEffect[];
  /** Text shown after resolution. */
  resultText?: string;
  successText?: string;
  failureText?: string;
  tone?: 'good' | 'bad' | 'neutral';
}

export interface EventDef {
  id: EventId;
  title: string;
  body: string;
  /** Categorisation used for weighting, cooldown grouping, and the archive. */
  tags: string[];
  phase: EventPhase;
  weight: number;
  /** Days before the event may fire again. */
  cooldown: number;
  once?: boolean;
  requires?: EventCondition;
  choices: EventChoice[];
  /** Events fired only by `schedule`/`chain`, never by weighted selection. */
  scheduledOnly?: boolean;
  /** Weight multiplier applied when the state matches a pressure signal. */
  pressure?: { kind: 'lowFood' | 'lowWater' | 'lowPower' | 'lowHope' | 'wounded' | 'crowded'; factor: number };
  /** Optional flavour attribution, e.g. "Radio Room". */
  source?: string;
}

export interface PendingEvent {
  eventId: EventId;
  /** Survivor bound as the 'actor' target. */
  actorId?: SurvivorId;
  /** Set for events fired by a schedule so the UI can label them. */
  scheduled?: boolean;
}

export interface ScheduledEvent {
  eventId: EventId;
  day: number;
  actorId?: SurvivorId;
}

export interface EventRecord {
  eventId: EventId;
  day: number;
  choiceId: string;
  success?: boolean;
  summary: string;
}

/* ---------------------------------------------------------------- relationships */

export type RelationshipBucket =
  | 'hatred'
  | 'resentment'
  | 'rivalry'
  | 'acquaintance'
  | 'trust'
  | 'friendship'
  | 'devotion';

/* ----------------------------------------------------------------------- scenarios */

export interface ScenarioDef {
  id: ScenarioId;
  name: string;
  tagline: string;
  description: string;
  /** Survivor count at start. */
  survivorCount: number;
  startingResources: Partial<ResourceMap>;
  startingItems: InventoryEntry[];
  startingFacilities: { facilityId: FacilityId; level: number }[];
  /** Facilities that cannot be built for `days` days. */
  bannedFacilities?: { facilityId: FacilityId; days: number }[];
  /** Multiplicative modifiers layered on top of difficulty. */
  modifiers: Partial<ScenarioModifiers>;
  /** Flags set at run start. */
  flags?: Record<string, number | boolean | string>;
  requiresUnlock?: UnlockId;
  /** Hard deadline day; reaching it without evacuating ends the run. */
  deadlineDay?: number;
  deadlineText?: string;
  difficultyHint: 'gentle' | 'standard' | 'hard' | 'brutal';
}

export interface ScenarioModifiers {
  foodConsumption: number;
  waterConsumption: number;
  fuelConsumption: number;
  hydroponicsYield: number;
  lootRichness: number;
  eventSeverity: number;
  recruitFrequency: number;
  weatherWeights: Partial<Record<WeatherId, number>>;
}

/* --------------------------------------------------------------------- difficulty */

export interface DifficultyDef {
  id: DifficultyId;
  name: string;
  description: string;
  /** Ordinal used by `difficulty.atLeast` event conditions. */
  rank: number;
  startingStores: number;
  lootRichness: number;
  consumption: number;
  eventSeverity: number;
  injuryChance: number;
  deathThreshold: 'forgiving' | 'normal' | 'harsh';
  facilityDecay: number;
  illnessChance: number;
  hopeDrain: number;
  researchCost: number;
  recruitFrequency: number;
  /** Legacy multiplier awarded at end of run. */
  legacyMultiplier: number;
}

/* ------------------------------------------------------------------------- lore */

export interface LoreDef {
  id: LoreId;
  title: string;
  /** Which theory this fragment supports. */
  theory: 'cascade' | 'meridian' | 'bloom' | 'listeners' | 'none';
  /** Where it can be found, for the archive's "source" line. */
  source: string;
  body: string;
  /** Ordering within the archive. */
  order: number;
}

/* ------------------------------------------------------------------- statistics */

export interface RunStats {
  daysSurvived: number;
  survivorsLost: number;
  survivorsRecruited: number;
  locationsExplored: number;
  expeditionsCompleted: number;
  expeditionsAborted: number;
  resourcesGathered: number;
  eventsEncountered: number;
  hardChoicesMade: number;
  injuriesTreated: number;
  illnessesCured: number;
  facilitiesBuilt: number;
  facilitiesUpgraded: number;
  itemsCrafted: number;
  researchCompleted: number;
  loreFound: number;
  fightsWon: number;
  fightsLost: number;
  peakSurvivors: number;
  totalFoodConsumed: number;
  brownoutDays: number;
  starvationDays: number;
}

/* --------------------------------------------------------------------- endings */

export interface EndingDef {
  id: string;
  name: string;
  kind: 'defeat' | 'survival' | 'victory' | 'transcendent';
  summary: string;
  /** Longer epilogue text; may include `{survivors}` and `{days}` tokens. */
  epilogue: string;
  legacyBase: number;
  colour: string;
}

export interface EndingResult {
  endingId: string;
  day: number;
  summary: string;
  epilogue: string;
  legacyAwarded: number;
  survivorNames: string[];
  memorial: { name: string; day: number; cause: string }[];
}

/* -------------------------------------------------------------------- meta/save */

export interface MetaProfile {
  version: number;
  legacy: number;
  legacySpent: number;
  unlocks: UnlockId[];
  loreArchive: LoreId[];
  runsStarted: number;
  runsCompleted: number;
  bestDays: number;
  endingsSeen: string[];
  /** Set once the player has finished a run; used to offer "skip guidance". */
  hasPlayed: boolean;
}

export interface MetaUnlockDef {
  id: UnlockId;
  name: string;
  description: string;
  cost: number;
  requires?: UnlockId[];
  category: 'scenario' | 'trait' | 'kit' | 'modifier' | 'archive';
  /** For kits: the items granted at run start. */
  kitItems?: InventoryEntry[];
  kitResources?: Partial<ResourceMap>;
}

/* ------------------------------------------------------------------------- logs */

export type LogTone = 'info' | 'good' | 'bad' | 'warn' | 'lore' | 'system';

export interface LogEntry {
  id: string;
  day: number;
  tone: LogTone;
  text: string;
  /** Optional grouping label, e.g. "Night", "Expedition". */
  channel?: string;
}

/* ------------------------------------------------------------------ game state */

export type Phase = 'planning' | 'events' | 'expedition' | 'report' | 'ended';

export interface DayReport {
  day: number;
  power: PowerReport;
  production: Record<ResourceId, Breakdown>;
  consumption: Record<ResourceId, Breakdown>;
  net: ResourceMap;
  survivorNotes: { survivorId: SurvivorId; text: string; tone: 'good' | 'bad' | 'neutral' }[];
  facilityNotes: string[];
  deaths: { survivorId: SurvivorId; name: string; cause: string }[];
  weather: WeatherId;
}

export interface PowerReport {
  capacity: Breakdown;
  demand: Breakdown;
  /** Facility instance ids that were browned out. */
  brownedOut: string[];
  deficit: number;
}

export interface GuidanceState {
  enabled: boolean;
  seen: string[];
}

export interface GameState {
  version: number;
  seed: string;
  rng: RngState;
  day: number;
  phase: Phase;
  scenarioId: ScenarioId;
  difficultyId: DifficultyId;
  modifiers: ModifierId[];
  weather: WeatherState;
  resources: ResourceMap;
  resourceCaps: ResourceMap;
  survivors: Survivor[];
  relationships: Record<string, number>;
  facilities: FacilityInstance[];
  slots: BuildSlot[];
  inventory: InventoryEntry[];
  craftQueue: CraftJob[];
  research: { completed: ResearchId[]; active: ActiveResearch | null; insight: number };
  world: { locations: LocationInstance[]; unlockedRing: number };
  expeditions: ActiveExpedition[];
  /** The expedition currently being resolved interactively, if any. */
  activeExpeditionId: string | null;
  events: {
    history: EventRecord[];
    cooldowns: Record<EventId, number>;
    scheduled: ScheduledEvent[];
    pending: PendingEvent[];
    seenCounts: Record<EventId, number>;
  };
  /**
   * The run's flag bag: narrative state and mechanical counters in one place, because both
   * need to be readable by the event condition DSL and both belong in the save.
   *
   * Two namespaces share it, separated by naming rather than by structure:
   *
   * - `prefix:rest` — written by the simulation. `mod:` difficulty and scenario modifiers,
   *   `banned:` scenario facility locks, `shortfall:` consecutive days a store has been
   *   empty, `power:`, `labour:`, `clearing:`, `research:`, `encounter:`, `order:`,
   *   `passive:`, `critical:`, `deeproot:`.
   * - `subject.detail` — written by content. `meridian.suspicious`, `listeners.heard`,
   *   `run.someone_died`, and so on.
   *
   * Content may write into exactly two system prefixes, and both are deliberate hand-offs:
   * `unlock:<facilityId>` lets an event open a research-gated facility, and
   * `ending:available:<endingId>` lets an event put an ending within reach. A test enforces
   * that nothing else crosses the line, because a mechanical counter quietly colliding with
   * a story flag is the kind of bug that only shows up thirty days into somebody's run.
   */
  flags: Record<string, number | boolean | string>;
  lore: LoreId[];
  stats: RunStats;
  log: LogEntry[];
  lastReport: DayReport | null;
  ending: EndingResult | null;
  guidance: GuidanceState;
  /** Wall-clock ms of the run start, used only for the save list. */
  startedAt: number;
  /** Incrementing counter used to mint unique ids without RNG. */
  idCounter: number;
}

/* ------------------------------------------------------------------ encounters */

export type EncounterStage = 'travel' | 'approach' | 'site' | 'complication' | 'extraction';

export interface EncounterOutcome {
  text: string;
  tone: 'good' | 'bad' | 'neutral';
  /** Number of loot draws from the site table. */
  lootDraws?: number;
  lootFactor?: number;
  resources?: Partial<ResourceMap>;
  items?: InventoryEntry[];
  /** Consumes an item from the pack. */
  consumeItem?: ItemId;
  injury?: { chance: number; severityScale?: number; target?: 'random' | 'weakest' | 'actor' };
  illness?: { conditionId: ConditionId; chance: number };
  fatigue?: number;
  morale?: number;
  ammo?: number;
  /** Carried into later beats: preparation raises combat power and lowers injury odds. */
  preparation?: number;
  combat?: { enemy: string; threatScale: number };
  lore?: LoreId[];
  flag?: string;
  relationship?: number;
  /** Ends the expedition early, keeping whatever has been gathered. */
  abort?: boolean;
  /** Reveals N map locations. */
  reveal?: number;
  /** Raises the site's knowledge level. */
  survey?: boolean;
  /** Marks the site permanently. */
  locationState?: LocationState;
  /** Grants insight toward the active research project. */
  insight?: number;
}

export interface EncounterChoice {
  id: string;
  label: string;
  hint?: string;
  /** The pack must contain an item carrying this tag. */
  requiresItemTag?: string;
  /** The team must include a survivor at or above this skill level. */
  requiresSkill?: { skill: SkillId; min: number };
  requiresTrait?: TraitId;
  requiresAmmo?: number;
  requiresResearch?: ResearchId;
  /** Shown but disabled when unavailable, with `lockedHint` explaining why. */
  lockedHint?: string;
  check?: { skill: SkillId; target: number; actor: 'best' | 'weakest' | 'random' };
  onSuccess?: EncounterOutcome;
  onFailure?: EncounterOutcome;
  /** Used when the choice has no check. */
  outcome?: EncounterOutcome;
}

export interface EncounterDef {
  id: EncounterId;
  stage: EncounterStage;
  title: string;
  text: string;
  /** Must intersect the location's `encounterTags`, or contain 'any'. */
  tags: string[];
  minDanger?: number;
  maxDanger?: number;
  /** Only fires in these rings. */
  rings?: number[];
  weight: number;
  choices: EncounterChoice[];
  /** Fires at most once per run. */
  once?: boolean;
  requiresFlag?: string;
  forbidsFlag?: string;
}
