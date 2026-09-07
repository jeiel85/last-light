import type {
  GameState,
  LocationArchetype,
  LocationId,
  LocationInstance,
  LootEntry,
} from '../model/types';
import type { Rng } from '../core/rng';
import { clamp } from '../core/math';
import { BALANCE } from '../data/balance';
import { ARCHETYPE_BY_ID, LOCATION_ARCHETYPES } from '../data/locations';
import { operationalLevel } from './facilities';

/**
 * World generation.
 *
 * The map is drawn from a *named RNG substream* (`worldgen`), which is what lets content be
 * added elsewhere in the game without changing the map a given seed produces. Sites are
 * placed on three concentric rings with jittered angles so the radial map reads as a place
 * rather than a wheel.
 */

export function generateWorld(rng: Rng, difficultyRichness: number): LocationInstance[] {
  const world = rng.fork('worldgen');
  const locations: LocationInstance[] = [];
  const usage: Record<string, number> = {};

  for (let ring = 0; ring < 3; ring += 1) {
    const target = BALANCE.world.ringCounts[ring]!;
    const [minKm, maxKm] = BALANCE.world.ringDistanceKm[ring]!;
    // Even angular slices with jitter keeps sites legible while still feeling organic.
    const slice = (Math.PI * 2) / target;
    const offset = world.float(0, Math.PI * 2);

    const pool = LOCATION_ARCHETYPES.filter((a) => a.rings.includes(ring));

    for (let i = 0; i < target; i += 1) {
      const candidates = pool.filter((a) => (usage[a.id] ?? 0) < a.maxInstances);
      if (candidates.length === 0) break;
      // Weight against archetypes already used, so a map is not four supermarkets.
      const archetype = world.weighted(
        candidates.map((a) => ({ value: a, weight: 10 / (1 + (usage[a.id] ?? 0) * 3) })),
      );
      usage[archetype.id] = (usage[archetype.id] ?? 0) + 1;

      const angle = offset + slice * i + world.float(-slice * 0.32, slice * 0.32);
      const radiusNorm = world.float(0.22 + ring * 0.26, 0.42 + ring * 0.27);
      const distanceKm = Math.round(world.float(minKm, maxKm) * 10) / 10;
      const danger = clamp(
        Math.round(archetype.baseDanger + world.int(-1, 1) + (ring === 2 ? 1 : 0)),
        1,
        10,
      );

      locations.push({
        id: `loc_${ring}_${i}`,
        archetypeId: archetype.id,
        name: pickName(world, archetype, locations),
        ring,
        angle,
        radius: clamp(radiusNorm, 0.16, 0.96),
        distanceKm,
        travelDays: BALANCE.world.travelDaysByRing[ring]!,
        danger,
        state: ring === 0 && i < 2 ? 'scouted' : 'unknown',
        richness: clamp(archetype.richness * difficultyRichness * world.float(0.8, 1.2), 0.2, 2),
        visits: 0,
        knowledge: ring === 0 && i < 2 ? 3 : 0,
        flags: [],
      });
    }
  }

  return locations;
}

function pickName(rng: Rng, archetype: LocationArchetype, existing: LocationInstance[]): string {
  const used = new Set(existing.map((l) => l.name));
  const options = archetype.nameForms.filter((n) => !used.has(n));
  if (options.length === 0) return `${archetype.name} ${used.size + 1}`;
  return rng.pick(options);
}

/* ------------------------------------------------------------------ queries */

export function archetypeOf(location: LocationInstance): LocationArchetype {
  const archetype = ARCHETYPE_BY_ID[location.archetypeId];
  if (!archetype) throw new Error(`Unknown archetype: ${location.archetypeId}`);
  return archetype;
}

export function locationById(state: GameState, id: LocationId): LocationInstance | undefined {
  return state.world.locations.find((l) => l.id === id);
}

/** Which rings the player may currently travel to. */
export function unlockedRing(state: GameState): number {
  let ring = 0;
  const access = operationalLevel(state, 'surface_access');
  if (access >= 1) ring = 1;
  if (access >= 2) ring = 2;
  if (state.research.completed.includes('exp_deep_range')) ring = Math.max(ring, 2);
  // Ring 1 is always reachable on foot from day 3; the vault has a service stair.
  if (state.day >= 3) ring = Math.max(ring, 1);
  return ring;
}

export function reachableLocations(state: GameState): LocationInstance[] {
  const max = unlockedRing(state);
  return state.world.locations.filter(
    (l) => l.ring <= max && l.state !== 'unknown' && l.state !== 'collapsed',
  );
}

export function travelDaysFor(state: GameState, location: LocationInstance): number {
  let days = location.travelDays;
  const access = operationalLevel(state, 'surface_access');
  if (access >= 1 && location.ring === 1) days = Math.max(0, days - 1);
  if (access >= 3) days = Math.max(0, days - 1);
  if (state.research.completed.includes('exp_deep_range') && location.distanceKm > 8) {
    days = Math.max(0, days - 1);
  }
  return days;
}

/* ------------------------------------------------------------------ discovery */

/** Reveal `count` unknown locations, preferring nearer rings. Returns what was revealed. */
export function revealLocations(
  state: GameState,
  rng: Rng,
  count: number,
  ringLimit?: number,
): LocationInstance[] {
  const candidates = state.world.locations.filter(
    (l) => l.state === 'unknown' && (ringLimit === undefined || l.ring <= ringLimit),
  );
  if (candidates.length === 0) return [];
  const weighted = candidates.map((l) => ({ value: l, weight: 10 / (1 + l.ring * 1.4) }));
  const revealed: LocationInstance[] = [];
  for (let i = 0; i < count && weighted.length > 0; i += 1) {
    const pick = rng.weighted(weighted);
    const index = weighted.findIndex((w) => w.value.id === pick.id);
    if (index >= 0) weighted.splice(index, 1);
    pick.state = 'rumoured';
    pick.knowledge = Math.max(pick.knowledge, 1);
    revealed.push(pick);
  }
  return revealed;
}

/**
 * Study a site from the tower. Returns false when there is nothing left to learn, so the
 * caller can say so rather than claiming a result the player did not get.
 */
export function scoutLocation(state: GameState, locationId: LocationId): boolean {
  const location = locationById(state, locationId);
  if (!location) return false;
  const target = state.research.completed.includes('exp_survey_gear') ? 4 : 3;
  const before = { state: location.state, knowledge: location.knowledge };

  if (location.state === 'unknown') location.state = 'rumoured';
  if (location.state === 'rumoured') location.state = 'scouted';
  location.knowledge = Math.max(location.knowledge, target);

  return location.state !== before.state || location.knowledge !== before.knowledge;
}

/** Information the player currently has about a site, for the map inspector. */
export interface LocationKnowledge {
  archetype: boolean;
  danger: boolean;
  loot: boolean;
  occupancy: boolean;
}

export function knowledgeOf(location: LocationInstance): LocationKnowledge {
  return {
    archetype: location.knowledge >= 1,
    danger: location.knowledge >= 2,
    loot: location.knowledge >= 3,
    occupancy: location.knowledge >= 4,
  };
}

/* ------------------------------------------------------------------ depletion */

export function depleteLocation(state: GameState, location: LocationInstance): void {
  location.visits += 1;
  location.lastVisitDay = state.day;
  location.richness = clamp(location.richness - BALANCE.world.depletionPerVisit, 0, 3);
  location.danger = clamp(location.danger + BALANCE.world.dangerPerVisit, 1, 10);
  location.knowledge = 4;
  if (location.richness <= 0.12) {
    location.state = 'depleted';
    location.note = 'Picked clean.';
  } else {
    location.state = 'explored';
  }
}

/** Sites slowly repopulate when left alone — scavengers move through, water pools. */
export function regenerateWorld(state: GameState): void {
  for (const location of state.world.locations) {
    if (location.state === 'collapsed' || location.state === 'claimed') continue;
    const idleDays = state.day - (location.lastVisitDay ?? 0);
    if (idleDays < 4) continue;
    const archetype = archetypeOf(location);
    const ceiling = archetype.richness * 0.75;
    if (location.richness < ceiling) {
      location.richness = clamp(location.richness + BALANCE.world.regenPerDay, 0, ceiling);
      if (location.state === 'depleted' && location.richness > 0.3) {
        location.state = 'explored';
        location.note = 'Something has moved back in.';
      }
    }
    if (location.danger > archetype.baseDanger) {
      location.danger = clamp(location.danger - 0.06, archetype.baseDanger, 10);
    }
  }
}

/* ----------------------------------------------------------------------- loot */

export interface RolledLoot {
  resources: Partial<Record<string, number>>;
  items: { itemId: string; count: number }[];
}

/**
 * Roll a site's loot for a single scavenging beat. `yieldFactor` folds in team skill,
 * traits, weather, and the beat's own quality so a good roll on a rich site feels like an
 * event rather than a rounding difference.
 */
export function rollLoot(
  rng: Rng,
  archetype: LocationArchetype,
  location: LocationInstance,
  yieldFactor: number,
  draws: number,
): RolledLoot {
  const result: RolledLoot = { resources: {}, items: [] };
  const table: LootEntry[] = archetype.loot.slice();
  if (table.length === 0) return result;

  const effective = location.richness * yieldFactor * BALANCE.world.lootScale;
  for (let i = 0; i < draws; i += 1) {
    const entry = rng.weighted(table.map((e) => ({ value: e, weight: e.weight })));
    if (entry.resource) {
      const raw = rng.float(entry.min, entry.max) * effective;
      const amount = Math.round(raw * 10) / 10;
      if (amount > 0) {
        result.resources[entry.resource] = (result.resources[entry.resource] ?? 0) + amount;
      }
    } else if (entry.itemId) {
      // Items are all-or-nothing; a depleted site simply stops yielding them.
      const chance = clamp(effective * 0.4, 0.05, 0.9);
      if (rng.chance(chance)) {
        const count = rng.int(entry.min, entry.max);
        if (count > 0) {
          const existing = result.items.find((it) => it.itemId === entry.itemId);
          if (existing) existing.count += count;
          else result.items.push({ itemId: entry.itemId, count });
        }
      }
    }
  }
  return result;
}

/** Expected haul for the forecast panel — the mean of the weighted table, not a roll. */
export function expectedHaul(
  archetype: LocationArchetype,
  location: LocationInstance,
  draws: number,
): { resource: string; min: number; max: number }[] {
  const totalWeight = archetype.loot.reduce((acc, e) => acc + e.weight, 0);
  const byResource: Record<string, { min: number; max: number }> = {};
  for (const entry of archetype.loot) {
    if (!entry.resource) continue;
    const share = (entry.weight / totalWeight) * draws;
    const min = entry.min * share * location.richness;
    const max = entry.max * share * location.richness;
    const current = byResource[entry.resource] ?? { min: 0, max: 0 };
    byResource[entry.resource] = { min: current.min + min, max: current.max + max };
  }
  return Object.entries(byResource)
    .map(([resource, range]) => ({
      resource,
      min: Math.round(range.min),
      max: Math.max(1, Math.round(range.max)),
    }))
    .filter((r) => r.max > 0)
    .sort((a, b) => b.max - a.max)
    .slice(0, 4);
}
