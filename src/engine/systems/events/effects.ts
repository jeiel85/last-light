import type {
  EffectTarget,
  EventEffect,
  GameState,
  ResourceId,
  RunStats,
  Survivor,
} from '../../model/types';
import type { Rng } from '../../core/rng';
import { clamp } from '../../core/math';
import { CONDITION_BY_ID } from '../../data/conditions';
import { FACILITY_BY_ID } from '../../data/facilities';
import { ITEM_BY_ID } from '../../data/items';
import { LORE_BY_ID } from '../../data/lore';
import { RESEARCH_BY_ID } from '../../data/research';
import { WEATHER } from '../../data/weather';
import { addItem, removeItem } from '../inventory';
import { adjustRelationship } from '../relationships';
import { computeCaps, grantResource } from '../resources';
import { addHistory, applyCondition, fullName, generateSurvivor, livingSurvivors, removeCondition } from '../survivors';
import { killSurvivor } from '../expedition';
import { revealLocations } from '../world';

/**
 * Effect application for the event engine.
 *
 * Every effect returns a short human-readable note so the event modal can show the player
 * exactly what happened rather than leaving them to diff the status rail.
 */

export interface EffectContext {
  state: GameState;
  rng: Rng;
  actor?: Survivor;
  /** Unlocks owned by the player, needed when recruiting. */
  unlocks?: readonly string[];
}

export function resolveTargets(target: EffectTarget, ctx: EffectContext): Survivor[] {
  const living = livingSurvivors(ctx.state);
  if (living.length === 0) return [];
  if (typeof target === 'object') {
    const found = ctx.state.survivors.find((s) => s.id === target.survivorId && s.alive);
    return found ? [found] : [];
  }
  switch (target) {
    case 'actor':
      return ctx.actor && ctx.actor.alive ? [ctx.actor] : [ctx.rng.pick(living)];
    case 'all':
      return living;
    case 'random':
      return [ctx.rng.pick(living)];
    case 'random_other': {
      const others = living.filter((s) => s.id !== ctx.actor?.id);
      return others.length > 0 ? [ctx.rng.pick(others)] : [];
    }
    case 'weakest':
      return [living.reduce((worst, s) => (s.health < worst.health ? s : worst))];
    case 'strongest':
      return [living.reduce((best, s) => (s.health > best.health ? s : best))];
    case 'lowestMorale':
      return [living.reduce((worst, s) => (s.morale < worst.morale ? s : worst))];
  }
}

export function applyEffect(effect: EventEffect, ctx: EffectContext): string | null {
  const { state, rng } = ctx;

  switch (effect.kind) {
    case 'resource': {
      const before = state.resources[effect.resource];
      const gained = grantResource(state, effect.resource, effect.amount);
      if (Math.abs(gained) < 0.05) {
        if (effect.amount > 0 && before >= (state.resourceCaps[effect.resource] ?? Infinity)) {
          return `Storage for ${effect.resource} is already full.`;
        }
        return null;
      }
      return `${gained > 0 ? '+' : ''}${Math.round(gained * 10) / 10} ${effect.resource}${effect.detail ? ` (${effect.detail})` : ''}`;
    }

    case 'resourcePercent': {
      const caps = state.resourceCaps ?? computeCaps(state);
      void caps;
      const delta = state.resources[effect.resource] * effect.percent;
      const gained = grantResource(state, effect.resource, delta);
      return `${gained > 0 ? '+' : ''}${Math.round(gained * 10) / 10} ${effect.resource}`;
    }

    case 'item': {
      if (effect.count > 0) {
        addItem(state, effect.itemId, effect.count);
        return `+${effect.count}× ${ITEM_BY_ID[effect.itemId]?.name ?? effect.itemId}`;
      }
      const removed = removeItem(state, effect.itemId, -effect.count);
      return removed ? `−${-effect.count}× ${ITEM_BY_ID[effect.itemId]?.name ?? effect.itemId}` : null;
    }

    case 'need': {
      const targets = resolveTargets(effect.target, ctx);
      if (targets.length === 0) return null;
      for (const survivor of targets) {
        survivor[effect.need] = clamp(survivor[effect.need] + effect.amount, 0, 100);
      }
      const label = effect.need === 'hunger' ? 'hunger' : effect.need;
      const names = targets.length > 2 ? 'Everyone' : targets.map((s) => s.name).join(' and ');
      return `${names}: ${effect.amount > 0 ? '+' : ''}${effect.amount} ${label}`;
    }

    case 'injure': {
      const targets = resolveTargets(effect.target, ctx);
      const names: string[] = [];
      for (const survivor of targets) {
        if (applyCondition(survivor, effect.conditionId, effect.severity, state.day)) {
          names.push(survivor.name);
        }
      }
      if (names.length === 0) return null;
      return `${names.join(', ')}: ${CONDITION_BY_ID[effect.conditionId]?.name ?? effect.conditionId}`;
    }

    case 'cure': {
      const targets = resolveTargets(effect.target, ctx);
      const cured: string[] = [];
      for (const survivor of targets) {
        if (effect.conditionId) {
          if (removeCondition(survivor, effect.conditionId)) cured.push(survivor.name);
        } else if (survivor.conditions.length > 0) {
          survivor.conditions = [];
          cured.push(survivor.name);
        }
      }
      if (cured.length === 0) return null;
      state.stats.illnessesCured += cured.length;
      return `${cured.join(', ')} recovered.`;
    }

    case 'kill': {
      const targets = resolveTargets(effect.target, ctx);
      const names: string[] = [];
      for (const survivor of targets) {
        names.push(fullName(survivor));
        killSurvivor(state, survivor, effect.cause);
      }
      return names.length > 0 ? `${names.join(', ')} died.` : null;
    }

    case 'recruit': {
      const count = effect.count ?? 1;
      const names: string[] = [];
      for (let i = 0; i < count; i += 1) {
        state.idCounter += 1;
        const survivor = generateSurvivor(rng, {
          day: state.day,
          idSeq: state.idCounter,
          ...(ctx.unlocks ? { unlocks: ctx.unlocks } : {}),
          ...(effect.skillHint ? { skillHint: effect.skillHint } : {}),
          ...(effect.traitHint ? { traitHint: effect.traitHint } : {}),
        });
        state.survivors.push(survivor);
        state.stats.survivorsRecruited += 1;
        state.stats.peakSurvivors = Math.max(state.stats.peakSurvivors, livingSurvivors(state).length);
        names.push(`${survivor.name} ${survivor.surname} (${survivor.occupation})`);
      }
      return `Joined the vault: ${names.join(', ')}.`;
    }

    case 'trait': {
      const targets = resolveTargets(effect.target, ctx);
      const changed: string[] = [];
      for (const survivor of targets) {
        if (effect.remove) {
          const index = survivor.traits.indexOf(effect.traitId);
          if (index >= 0) {
            survivor.traits.splice(index, 1);
            changed.push(survivor.name);
          }
        } else if (!survivor.traits.includes(effect.traitId)) {
          survivor.traits.push(effect.traitId);
          changed.push(survivor.name);
          addHistory(survivor, state.day, `Changed by what happened.`, 'neutral');
        }
      }
      return changed.length > 0 ? `${changed.join(', ')} is changed by it.` : null;
    }

    case 'facilityDamage': {
      const candidates = effect.facilityId
        ? state.facilities.filter((f) => f.defId === effect.facilityId)
        : state.facilities.filter((f) => f.status !== 'building');
      if (candidates.length === 0) return null;
      const facility = effect.facilityId ? candidates[0]! : rng.pick(candidates);
      facility.condition = clamp(facility.condition - effect.amount, 0, 100);
      if (facility.condition <= 0) facility.status = 'offline';
      else if (facility.condition < 40 && facility.status === 'operational') facility.status = 'damaged';
      return `${FACILITY_BY_ID[facility.defId]?.name ?? facility.defId} damaged (−${effect.amount} condition).`;
    }

    case 'facilityRepair': {
      const candidates = effect.facilityId
        ? state.facilities.filter((f) => f.defId === effect.facilityId)
        : state.facilities.filter((f) => f.condition < 100);
      if (candidates.length === 0) return null;
      const facility = effect.facilityId ? candidates[0]! : rng.pick(candidates);
      facility.condition = clamp(facility.condition + effect.amount, 0, 100);
      if (facility.condition > 40 && facility.status === 'damaged') facility.status = 'operational';
      return `${FACILITY_BY_ID[facility.defId]?.name ?? facility.defId} repaired (+${effect.amount} condition).`;
    }

    case 'facilityGrant': {
      const existing = state.facilities.find((f) => f.defId === effect.facilityId);
      if (existing) {
        existing.level = Math.max(existing.level, effect.level ?? existing.level);
        return `${FACILITY_BY_ID[effect.facilityId]?.name} improved.`;
      }
      const occupied = new Set(state.facilities.map((f) => f.slotId));
      const def = FACILITY_BY_ID[effect.facilityId];
      if (!def) return null;
      const slot = state.slots.find((s) => !s.sealed && !occupied.has(s.id) && def.decks.includes(s.deck));
      if (!slot) return `There is no room for a ${def.name}.`;
      state.idCounter += 1;
      state.facilities.push({
        id: `f${state.idCounter}`,
        defId: effect.facilityId,
        slotId: slot.id,
        level: effect.level ?? 1,
        condition: 90,
        status: 'operational',
        progress: 0,
        progressRequired: 0,
        staff: [],
        priority: 50,
        brownedOut: false,
        builtDay: state.day,
      });
      return `${def.name} is now available.`;
    }

    case 'research': {
      if (effect.grant && !state.research.completed.includes(effect.researchId)) {
        state.research.completed.push(effect.researchId);
        state.stats.researchCompleted += 1;
        return `Learned: ${RESEARCH_BY_ID[effect.researchId]?.name ?? effect.researchId}.`;
      }
      if (effect.insight) {
        state.research.insight += effect.insight;
        return `+${effect.insight} insight`;
      }
      return null;
    }

    case 'relationship': {
      const a = resolveTargets(effect.a, ctx);
      const b = resolveTargets(effect.b, ctx);
      let applied = 0;
      for (const x of a) {
        for (const y of b) {
          if (x.id === y.id) continue;
          adjustRelationship(state, x.id, y.id, effect.amount);
          applied += 1;
        }
      }
      if (applied === 0) return null;
      return effect.amount > 0 ? 'The crew is closer for it.' : 'It leaves a mark between them.';
    }

    case 'flag': {
      if (effect.increment !== undefined) {
        const current = typeof state.flags[effect.flag] === 'number' ? (state.flags[effect.flag] as number) : 0;
        state.flags[effect.flag] = current + effect.increment;
      } else {
        state.flags[effect.flag] = effect.value ?? true;
      }
      return null;
    }

    case 'lore': {
      if (state.lore.includes(effect.loreId)) return null;
      state.lore.push(effect.loreId);
      state.stats.loreFound += 1;
      return `Archive entry recovered: ${LORE_BY_ID[effect.loreId]?.title ?? effect.loreId}.`;
    }

    case 'revealLocation': {
      if (effect.archetypeId) {
        const target = state.world.locations.find(
          (l) => l.archetypeId === effect.archetypeId && l.state === 'unknown',
        );
        if (!target) return null;
        target.state = 'rumoured';
        target.knowledge = Math.max(target.knowledge, 1);
        return `Located: ${target.name}.`;
      }
      const revealed = revealLocations(state, rng, effect.count ?? 1, effect.ring);
      if (revealed.length === 0) return null;
      return `Located: ${revealed.map((l) => l.name).join(', ')}.`;
    }

    case 'locationState': {
      const target = effect.locationId
        ? state.world.locations.find((l) => l.id === effect.locationId)
        : state.world.locations.find((l) => l.state === 'explored');
      if (!target) return null;
      target.state = effect.state;
      return `${target.name} is now ${effect.state}.`;
    }

    case 'schedule': {
      state.events.scheduled.push({
        eventId: effect.eventId,
        day: state.day + effect.inDays,
        ...(ctx.actor ? { actorId: ctx.actor.id } : {}),
      });
      return null;
    }

    case 'chain': {
      state.events.pending.push({
        eventId: effect.eventId,
        ...(ctx.actor ? { actorId: ctx.actor.id } : {}),
      });
      return null;
    }

    case 'stat': {
      const key = effect.stat as keyof RunStats;
      state.stats[key] = (state.stats[key] ?? 0) + effect.amount;
      return null;
    }

    case 'weather': {
      state.weather = { id: effect.weatherId, streak: 1, forecast: null };
      return `The weather turns: ${WEATHER[effect.weatherId].name}.`;
    }

    case 'ending': {
      state.flags[`ending:trigger`] = effect.endingId;
      return null;
    }
  }
}

export function applyEffects(effects: readonly EventEffect[] | undefined, ctx: EffectContext): string[] {
  if (!effects) return [];
  const notes: string[] = [];
  for (const effect of effects) {
    const note = applyEffect(effect, ctx);
    if (note) notes.push(note);
  }
  return notes;
}

/** Check whether an event choice's cost can be paid. */
export function canPayCost(
  state: GameState,
  cost: { resources?: Partial<Record<ResourceId, number>>; items?: { itemId: string; count: number }[] } | undefined,
): { ok: boolean; reason?: string } {
  if (!cost) return { ok: true };
  for (const [resource, amount] of Object.entries(cost.resources ?? {}) as [ResourceId, number][]) {
    if (state.resources[resource] < amount) {
      return { ok: false, reason: `Needs ${Math.ceil(amount)} ${resource}` };
    }
  }
  for (const entry of cost.items ?? []) {
    const held = state.inventory.find((i) => i.itemId === entry.itemId)?.count ?? 0;
    if (held < entry.count) {
      return { ok: false, reason: `Needs ${entry.count}× ${ITEM_BY_ID[entry.itemId]?.name ?? entry.itemId}` };
    }
  }
  return { ok: true };
}

export function payChoiceCost(
  state: GameState,
  cost: { resources?: Partial<Record<ResourceId, number>>; items?: { itemId: string; count: number }[] } | undefined,
): string[] {
  if (!cost) return [];
  const notes: string[] = [];
  for (const [resource, amount] of Object.entries(cost.resources ?? {}) as [ResourceId, number][]) {
    state.resources[resource] = Math.max(0, state.resources[resource] - amount);
    notes.push(`−${amount} ${resource}`);
  }
  for (const entry of cost.items ?? []) {
    removeItem(state, entry.itemId, entry.count);
    notes.push(`−${entry.count}× ${ITEM_BY_ID[entry.itemId]?.name ?? entry.itemId}`);
  }
  return notes;
}
