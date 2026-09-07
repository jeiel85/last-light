import type {
  ExpeditionLoadout,
  GameState,
  Survivor,
} from '../model/types';
import type { Rng } from '../core/rng';
import { rngFromState } from '../core/rng';
import { RECIPES } from '../data/recipes';
import { RESEARCH } from '../data/research';
import { FACILITIES } from '../data/facilities';
import {
  assignToFacility,
  buildFacility,
  canBuild,
  canUpgrade,
  findFacility,

  repairFacility,
  staffSlots,
  startClearingSlot,
  availableSlots,
  upgradeFacility,
  overcrowding,
  bunkCapacity,
} from '../systems/facilities';
import { queueCraft, recipeAvailability } from '../systems/crafting';
import { researchAvailability, startResearch } from '../systems/research';
import { canJoinExpedition, isIncapacitated, livingSurvivors } from '../systems/survivors';
import { computeConsumption, computeProduction } from '../systems/resources';
import { dispatchExpedition, currentBeat, resolveBeat, expeditionForecast } from '../systems/expedition';
import { reachableLocations, travelDaysFor } from '../systems/world';
import { presentEvent, resolveEvent } from '../systems/events/select';
import { BALANCE } from '../data/balance';

/**
 * A competent-but-not-optimal headless player.
 *
 * The agent exists to find balance faults, not to play well: it uses obvious heuristics a
 * new player would arrive at within a couple of runs. If *this* policy starves on a given
 * seed, a human almost certainly would too, which is exactly the signal the balance pass
 * needs. Crucially it drives the same public API the UI does, so a bug here is a bug there.
 */

export interface AgentConfig {
  /** 0 = reckless, 1 = very cautious. Governs expedition thresholds and event choices. */
  risk: number;
  /** Which build order to follow. */
  strategy: 'balanced' | 'industry' | 'science' | 'defence';
}

export const DEFAULT_AGENT: AgentConfig = { risk: 0.5, strategy: 'balanced' };

const BUILD_ORDERS: Record<AgentConfig['strategy'], string[]> = {
  balanced: [
    'water_reclaimer', 'galley', 'hydroponics', 'laboratory', 'workshop', 'bunks',
    'storage', 'infirmary', 'surface_access', 'radio_room', 'security',
  ],
  industry: [
    // The laboratory sits high on purpose: every facility past the basics is gated behind
    // tier-2 research, so an industry run that defers it never reaches its own build.
    'water_reclaimer', 'galley', 'hydroponics', 'workshop', 'laboratory', 'machine_shop',
    'bunks', 'storage', 'surface_access', 'infirmary',
  ],
  science: [
    'water_reclaimer', 'galley', 'hydroponics', 'workshop', 'laboratory', 'deep_archive',
    'bunks', 'infirmary', 'storage', 'radio_room',
  ],
  defence: [
    'water_reclaimer', 'galley', 'hydroponics', 'workshop', 'bunks', 'security',
    'laboratory', 'storage', 'infirmary', 'surface_access',
  ],
};

const RESEARCH_ORDERS: Record<AgentConfig['strategy'], string[]> = {
  balanced: [
    'agr_hydroponics', 'eng_preventive_maintenance', 'sur_filtration', 'med_antiseptics',
    'exp_load_bearing', 'agr_seed_bank', 'agr_mycology', 'sur_rationing', 'sur_preserving',
    'eng_power_storage', 'sur_greywater', 'agr_deep_root', 'eng_machining', 'sur_cold_cellar',
  ],
  industry: [
    'eng_power_storage', 'eng_preventive_maintenance', 'eng_machining', 'exp_load_bearing',
    'agr_hydroponics', 'eng_salvage_protocol', 'eng_efficient_burn', 'exp_deep_range',
    'eng_biodiesel', 'agr_mycology', 'sur_filtration',
  ],
  science: [
    'agr_hydroponics', 'med_antiseptics', 'com_beacons', 'com_barter', 'agr_seed_bank',
    'med_cultures', 'com_direction_finding', 'com_archive_access', 'agr_mycology',
    'com_directional_array', 'med_synthesis', 'agr_deep_root',
  ],
  defence: ['def_fortification', 'def_ranged_arms', 'agr_hydroponics', 'med_antiseptics', 'def_reloading', 'eng_preventive_maintenance', 'def_plate_armour'],
};

/* ------------------------------------------------------------------ planning */

export function planDay(state: GameState, config: AgentConfig, rng: Rng): void {
  assignCrew(state);
  manageBase(state, config);
  manageResearch(state, config);
  manageCrafting(state, config);
  maybeDispatch(state, config, rng);
}

/**
 * Facilities that keep people alive. These are staffed before anybody is allowed a rest
 * day: a well-rested crew that let the reclaimer run dry is not a survival strategy, and
 * an agent making exactly that mistake was the first thing the balance pass caught.
 */
const CRITICAL_FACILITIES = ['water_reclaimer', 'hydroponics'];
const SECONDARY_FACILITIES = [
  'laboratory', 'infirmary', 'galley', 'workshop', 'reactor', 'machine_shop',
  'deep_archive', 'radio_room', 'security', 'storage',
];

function assignCrew(state: GameState): void {
  const living = livingSurvivors(state).filter((s) => s.assignment.kind !== 'expedition');

  // Clear every post so assignment is recomputed from scratch each morning.
  for (const facility of state.facilities) facility.staff = [];
  for (const survivor of living) survivor.assignment = { kind: 'idle' };

  const assigned = new Set<string>();

  const staff = (defId: string, pool: readonly Survivor[], maxFill: number): void => {
    const facility = findFacility(state, defId);
    if (!facility || facility.status !== 'operational') return;
    const slots = staffSlots(facility);
    if (slots === 0) return;
    if (defId === 'infirmary' && !state.survivors.some((s) => s.alive && s.conditions.length > 0)) return;

    const skill = FACILITIES.find((f) => f.id === defId)?.skill ?? 'engineering';
    const fitness = (s: Survivor) =>
      (s.skills[skill] + 1) *
      Math.max(0.15, s.health / 100) *
      Math.max(0.3, 1 - s.fatigue / 140) *
      (s.conditions.some((c) => c.severity > 50) ? 0.5 : 1);
    const candidates = pool
      .filter((s) => !assigned.has(s.id) && !isIncapacitated(s))
      .sort((a, b) => fitness(b) - fitness(a));
    for (let i = 0; i < Math.min(maxFill, slots) && i < candidates.length; i += 1) {
      const survivor = candidates[i]!;
      if (assignToFacility(state, survivor.id, facility.id)) assigned.add(survivor.id);
    }
  };

  // 1. Life support is staffed first, from the freshest people available.
  const byFreshness = living.slice().sort((a, b) => a.fatigue - b.fatigue);
  for (const defId of CRITICAL_FACILITIES) staff(defId, byFreshness, 1);

  // A crew that is ill stops being a crew. Treatment outranks everything but life support.
  const seriouslyIll = state.survivors.filter(
    (s) => s.alive && s.conditions.some((c) => c.severity > 30),
  ).length;
  if (seriouslyIll > 0) staff('infirmary', byFreshness, seriouslyIll > 2 ? 2 : 1);

  // 2. Anyone genuinely spent now rests.
  const resting = new Set<string>();
  for (const survivor of living) {
    if (assigned.has(survivor.id)) continue;
    if (survivor.fatigue > 78 || survivor.health < 40 || survivor.conditions.some((c) => c.severity > 55)) {
      survivor.assignment = { kind: 'rest' };
      resting.add(survivor.id);
    }
  }

  // 3. Everything else, from whoever is left.
  const available = living.filter((s) => !resting.has(s.id) && !assigned.has(s.id));
  for (const defId of SECONDARY_FACILITIES) {
    const remaining = available.filter((s) => !assigned.has(s.id)).length;
    staff(defId, available, remaining > 3 ? 2 : 1);
  }

  // 4. Second slots on critical facilities, if there is genuine slack.
  const stillFree = living.filter((s) => !resting.has(s.id) && !assigned.has(s.id));
  if (stillFree.length > 2) {
    for (const defId of CRITICAL_FACILITIES) staff(defId, stillFree, 2);
  }
  // Everyone else stays idle, which is the labour pool for construction.
}

/**
 * Base management, in three phases.
 *
 * Phase 1 stabilises life support. Phase 2 invests in the Laboratory and the level-2
 * upgrades that stop the vault sliding backwards. Phase 3 consolidates toward an ending
 * rather than sprawling: a settlement that merely persists is the failure state this
 * function exists to avoid, and it was the outcome of every run before it was written.
 */
function manageBase(state: GameState, config: AgentConfig): void {
  // Repair anything close to failing before spending on anything new.
  for (const facility of state.facilities) {
    if (facility.condition < 55 && state.resources.components >= 10) {
      repairFacility(state, facility.id);
    }
  }

  const production = computeProduction(state);
  const consumption = computeConsumption(state);
  const power = state.lastReport?.power;
  const powerShort = power ? power.demand.total > power.capacity.total : false;

  const tryUpgrade = (defId: string, reserve = 6): boolean => {
    const facility = findFacility(state, defId);
    if (!facility) return false;
    const check = canUpgrade(state, facility.id);
    if (!check.ok) return false;
    if (state.resources.components < (check.cost?.components ?? 0) + reserve) return false;
    return upgradeFacility(state, facility.id);
  };

  const tryBuild = (defId: string, reserve = 4): boolean => {
    if (findFacility(state, defId)) return false;
    if (!canBuild(state, defId).ok) return false;
    const def = FACILITIES.find((f) => f.id === defId);
    if (!def) return false;
    const slots = availableSlots(state, def);
    if (slots.length === 0) return false;
    if (state.resources.components < (def.levels[0].buildCost.components ?? 0) + reserve) return false;
    return buildFacility(state, defId, slots[0]!.id);
  };

  /* ---- unconditional emergencies, in order of how fast they kill you */
  if (production.water.total < consumption.water.total && tryUpgrade('water_reclaimer', 0)) return;
  if (powerShort) {
    if (tryUpgrade('reactor', 0)) return;
    // If the reactor upgrade is not yet affordable, bank for it rather than spending the
    // components on something that will only add to the deficit.
    const reactor = findFacility(state, 'reactor');
    const next = reactor ? FACILITIES.find((f) => f.id === 'reactor')?.levels[reactor.level] : undefined;
    if (next && (next.buildCost.components ?? 0) > state.resources.components) return;
  }
  const canFeedMore = production.food.total >= consumption.food.total;
  if (overcrowding(state) > 0 && canFeedMore && tryUpgrade('bunks', 2)) return;
  if (production.food.total + 1 < consumption.food.total && tryUpgrade('hydroponics', 2)) return;

  // Open the lower decks before they are needed — rubble takes days to shift.
  if (state.resources.components > 44) {
    const sealed = state.slots.find((s) => s.sealed && !state.flags[`clearing:${s.id}`]);
    if (sealed) startClearingSlot(state, sealed.id);
  }

  const busy = state.facilities.some((f) => f.status === 'building' || f.upgradingTo);
  if (busy) return;

  /* ---- phase 1: life support */
  for (const defId of BUILD_ORDERS[config.strategy]) {
    if (findFacility(state, defId)) continue;
    if (tryBuild(defId)) return;
    // A slot shortage is worth clearing rubble for.
    const def = FACILITIES.find((f) => f.id === defId);
    if (def && canBuild(state, defId).reason === 'No free slot on a permitted deck') {
      const sealed = state.slots.find((s) => s.sealed && def.decks.includes(s.deck));
      if (sealed && state.resources.components >= sealed.clearCost + 10) {
        startClearingSlot(state, sealed.id);
        return;
      }
    }
  }

  /* ---- phase 2: the research engine, then the level-2 backbone */
  if (state.day >= 10) {
    if (tryUpgrade('laboratory', 8)) return;
    for (const defId of ['water_reclaimer', 'hydroponics', 'reactor', 'galley', 'storage', 'bunks']) {
      const facility = findFacility(state, defId);
      if (facility && facility.level < 2 && tryUpgrade(defId, 8)) return;
    }
  }

  /* ---- phase 3: consolidate toward an ending */
  if (state.day >= 20) {
    for (const defId of ['machine_shop', 'deep_archive', 'radio_room', 'surface_access', 'security']) {
      if (tryBuild(defId, 6)) return;
    }
    const endgame =
      config.strategy === 'industry'
        ? ['machine_shop', 'surface_access', 'reactor', 'hydroponics', 'water_reclaimer', 'workshop']
        : config.strategy === 'science'
          ? ['laboratory', 'deep_archive', 'hydroponics', 'water_reclaimer', 'reactor', 'radio_room']
          : ['hydroponics', 'water_reclaimer', 'reactor', 'laboratory', 'galley', 'storage', 'bunks', 'workshop'];
    for (const defId of endgame) {
      if (tryUpgrade(defId, 10)) return;
    }
  }

  /* ---- otherwise, deepen whatever is weakest */
  for (const defId of ['water_reclaimer', 'hydroponics', 'reactor', 'galley', 'workshop', 'storage', 'infirmary', 'bunks', 'laboratory']) {
    if (tryUpgrade(defId, 14)) return;
  }
}

function manageResearch(state: GameState, config: AgentConfig): void {
  if (state.research.active) return;

  for (const id of RESEARCH_ORDERS[config.strategy]) {
    const node = RESEARCH.find((r) => r.id === id);
    if (!node) continue;
    if (researchAvailability(state, node).ok) {
      startResearch(state, id);
      return;
    }
  }
  // Fall back to the cheapest available node.
  const options = RESEARCH.map((node) => researchAvailability(state, node))
    .filter((a) => a.ok)
    .sort((a, b) => a.cost - b.cost);
  if (options[0]) startResearch(state, options[0].node.id);
}

function manageCrafting(state: GameState, config: AgentConfig): void {
  if (state.craftQueue.length >= 2) return;
  const wants: string[] = [];

  const bandages = state.inventory.find((i) => i.itemId === 'bandage')?.count ?? 0;
  if (bandages < 3) wants.push('r_bandage');
  const weapons = state.inventory.filter((i) => ['machete', 'pipe_club', 'fire_axe', 'nail_bat'].includes(i.itemId));
  if (weapons.reduce((a, w) => a + w.count, 0) < 2) wants.push('r_machete', 'r_pipe_club');
  const packs = state.inventory.find((i) => i.itemId === 'pack_frame')?.count ?? 0;
  if (packs < 1) wants.push('r_pack_frame');
  if (config.strategy === 'defence') wants.push('r_padded_vest', 'r_crossbow');
  if (config.strategy === 'science') wants.push('r_lantern');
  wants.push('r_lantern', 'r_rope_kit', 'r_first_aid_kit');

  for (const recipeId of wants) {
    const recipe = RECIPES.find((r) => r.id === recipeId);
    if (!recipe) continue;
    if (!recipeAvailability(state, recipe).ok) continue;
    // Never spend the last of the components on gear.
    const cost = recipe.cost.components ?? 0;
    if (state.resources.components < cost + 16) continue;
    queueCraft(state, recipeId);
    return;
  }
}

/* ---------------------------------------------------------------- expeditions */

function maybeDispatch(state: GameState, config: AgentConfig, rng: Rng): void {
  if (state.expeditions.some((e) => !e.resolved)) return;
  if (state.activeExpeditionId) return;

  const foodDays = state.resources.food / Math.max(1, livingSurvivors(state).length);
  const waterDays = state.resources.water / Math.max(1, livingSurvivors(state).length);
  const needsSupplies =
    foodDays < 10 || waterDays < 7 || state.resources.components < 34 || state.resources.fuel < 12;
  const opportunistic = state.day > 3 && rng.chance(0.45);
  if (!needsSupplies && !opportunistic) return;

  const candidates = livingSurvivors(state).filter((s) => canJoinExpedition(s).ok && s.fatigue < 76);
  if (candidates.length < 2) return;

  const team = candidates
    .sort((a, b) => b.skills.combat + b.skills.scavenging - (a.skills.combat + a.skills.scavenging))
    .slice(0, Math.min(3, Math.max(2, candidates.length - 1)));

  const locations = reachableLocations(state).filter((l) => l.state !== 'depleted');
  if (locations.length === 0) return;

  const scored = locations
    .map((location) => {
      const travel = travelDaysFor(state, location);
      let score = location.richness * 10 - location.danger * (1 + config.risk * 1.6) - travel * 2.5;
      if (location.state === 'rumoured') score += 3;
      if (location.visits > 0) score -= location.visits * 2;
      return { location, score };
    })
    .sort((a, b) => b.score - a.score);

  const target = scored[0]?.location;
  if (!target) return;
  if (target.danger > 5 + (1 - config.risk) * 4 && state.day < 8) return;

  const loadout = packFor(state, team, travelDaysFor(state, target));
  const forecast = expeditionForecast(state, target, team.map((s) => s.id), loadout);
  if (forecast.deathRisk.total > 0.25 + (1 - config.risk) * 0.15) return;

  dispatchExpedition(state, target.id, team.map((s) => s.id), loadout);
}

function packFor(state: GameState, team: readonly Survivor[], travelDays: number): ExpeditionLoadout {
  const days = Math.max(1, travelDays) + 1;
  const rations = Math.min(
    state.resources.food,
    team.length * days * BALANCE.expedition.rationsPerMemberPerDay,
  );
  const water = Math.min(
    state.resources.water,
    team.length * days * BALANCE.expedition.waterPerMemberPerDay,
  );
  const ammo = Math.min(state.resources.ammo, 10);
  const medicine = Math.min(state.resources.medicine, 2);

  const wanted = [
    'machete', 'fire_axe', 'nail_bat', 'pipe_club', 'hunting_rifle', 'service_pistol', 'crossbow',
    'pry_bar', 'bolt_cutters', 'lockpick_set', 'rope_kit', 'lantern', 'pack_frame',
    'bandage', 'first_aid_kit', 'padded_vest', 'respirator', 'multitool', 'tarpaulin',
  ];
  const items: ExpeditionLoadout['items'] = [];
  for (const itemId of wanted) {
    const held = state.inventory.find((i) => i.itemId === itemId);
    if (!held || held.count <= 0) continue;
    items.push({ itemId, count: Math.min(held.count, itemId === 'bandage' ? 2 : 1) });
  }

  return { items, rations: Math.floor(rations), water: Math.floor(water), ammo, medicine };
}

/* ------------------------------------------------------- expedition resolution */

export function resolveExpeditionBeats(state: GameState, config: AgentConfig, rng: Rng): void {
  let guard = 0;
  while (state.activeExpeditionId && guard < 24) {
    guard += 1;
    const beat = currentBeat(state);
    if (!beat) break;
    const options = beat.choices.filter((c) => c.enabled);
    if (options.length === 0) break;

    // Prefer choices that mention preparation or safety when cautious, loot when not.
    const scored = options.map((option) => {
      const outcome = option.choice.onSuccess ?? option.choice.outcome;
      let score = rng.float(0, 1);
      if (outcome?.lootDraws) score += outcome.lootDraws * (1.2 - config.risk);
      if (outcome?.preparation) score += outcome.preparation * 0.3;
      if (outcome?.injury) score -= outcome.injury.chance * (4 * config.risk);
      if (outcome?.combat) score -= 2 * config.risk;
      if (outcome?.abort) score -= 3 * (1 - config.risk);
      if (option.choice.requiresItemTag) score += 1.5;
      return { option, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const chosen = scored[0]!.option.choice.id;
    const result = resolveBeat(state, chosen);
    if (!result.ok) break;
    if (result.finished) break;
  }
  // Safety net: if the loop exits with a live expedition, force it closed.
  if (state.activeExpeditionId) {
    const expedition = state.expeditions.find((e) => e.id === state.activeExpeditionId);
    if (expedition) {
      expedition.queue = [];
      const beat = currentBeat(state);
      if (!beat) {
        state.activeExpeditionId = null;
        state.phase = 'planning';
      }
    }
  }
}

/* ------------------------------------------------------------ event resolution */

export function resolvePendingEvents(state: GameState, config: AgentConfig, unlocks: readonly string[] = []): void {
  const rng = rngFromState(state.rng);
  let guard = 0;
  while (state.events.pending.length > 0 && guard < 12) {
    guard += 1;
    const presentation = presentEvent(state);
    if (!presentation) break;
    const enabled = presentation.choices.filter((c) => c.enabled);
    if (enabled.length === 0) {
      state.events.pending.shift();
      continue;
    }

    const scored = enabled.map((option) => {
      let score = 0;
      const effects = [
        ...(option.choice.effects ?? []),
        ...(option.choice.onSuccess ?? []),
      ];
      for (const effect of effects) {
        if (effect.kind === 'resource') {
          const weight =
            effect.resource === 'food' ? 1.6 :
            effect.resource === 'water' ? 1.6 :
            effect.resource === 'medicine' ? 1.2 :
            effect.resource === 'hope' ? 0.9 : 1;
          score += effect.amount * weight * 0.35;
        }
        if (effect.kind === 'need' && effect.need === 'morale') score += effect.amount * 0.2;
        if (effect.kind === 'need' && effect.need === 'health') score += effect.amount * 0.3;
        if (effect.kind === 'injure') score -= 4 * config.risk;
        if (effect.kind === 'kill') score -= 25;
        if (effect.kind === 'recruit') {
          // A competent player counts the larder before opening the door. Taking everyone
          // in regardless is the single fastest way to starve a vault, and modelling that
          // judgement is the difference between a useful simulation and a naive one.
          const foodDays =
            state.resources.food / Math.max(1, state.survivors.filter((s) => s.alive).length);
          const spare = bunkCapacity(state) - state.survivors.filter((s) => s.alive).length;
          score += foodDays > 8 && spare > 0 ? 9 : foodDays > 5 && spare > 0 ? 2 : -12;
        }
        if (effect.kind === 'lore') score += 1.5;
      }
      for (const effect of option.choice.onFailure ?? []) {
        if (effect.kind === 'kill') score -= 18 * config.risk;
        if (effect.kind === 'injure') score -= 4 * config.risk;
        if (effect.kind === 'resource') score += effect.amount * 0.15;
      }
      if (option.successChance !== null) {
        score *= 0.3 + option.successChance * 0.9;
      }
      if (option.choice.cost?.resources) {
        for (const [, amount] of Object.entries(option.choice.cost.resources)) score -= amount * 0.4;
      }
      score += rng.float(-0.5, 0.5);
      return { option, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const result = resolveEvent(state, scored[0]!.option.choice.id, rng, unlocks);
    if (!result.ok) {
      state.events.pending.shift();
    }
  }
  state.rng = rng.snapshot();
  if (state.events.pending.length === 0 && state.phase === 'events') state.phase = 'planning';
}
