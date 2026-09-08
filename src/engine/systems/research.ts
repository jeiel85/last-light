import { t } from '../../i18n';
import { locationNameForm, researchEffect, researchName } from '../../i18n/content';
import { ARCHETYPE_BY_ID } from '../data/locations';
import { FACILITY_BY_ID } from '../data/facilities';
import { facilityName as facilityLabel } from '../../i18n/content';
import type { GameState, ResearchDef, ResearchId } from '../model/types';
import { BreakdownBuilder, type Breakdown } from '../core/breakdown';
import { BALANCE } from '../data/balance';
import { RESEARCH, RESEARCH_BY_ID } from '../data/research';
import { findFacility, operationalLevel, staffOf } from './facilities';
import { workEfficiency } from './survivors';
import { revealLocations } from './world';
import * as T from './traits';
import type { Rng } from '../core/rng';

/**
 * Research.
 *
 * Insight accrues per day from Laboratory staff and is spent on one active project at a
 * time. Completing a node applies its unlocks immediately — recipes and facilities become
 * available, passives are read directly from `state.research.completed` by the systems that
 * care, and `action` unlocks flip flags the event engine can gate on.
 */

export function insightRate(state: GameState): Breakdown {
  const b = new BreakdownBuilder();
  const lab = findFacility(state, 'laboratory');

  b.base(t('engine.rsr.byHand'), BALANCE.research.baselineInsight);
  const labLabel = (): string => {
    const def = FACILITY_BY_ID['laboratory'];
    return def ? facilityLabel(def) : 'Laboratory';
  };

  if (lab && lab.status === 'operational') {
    const staff = staffOf(state, lab);
    if (staff.length === 0) {
      b.note(t('engine.rsr.labUnstaffed'), undefined, t('engine.rsr.labUnstaffedFix'));
    }
    for (const survivor of staff) {
      const efficiency = workEfficiency(survivor, 'science', {
        facility: lab,
        facilityDef: { id: 'laboratory' } as never,
        coworkers: staff,
        relationships: state.relationships,
        brownedOut: lab.brownedOut,
      });
      const contribution =
        BALANCE.research.insightPerStaff * efficiency.total * T.researchRateFactor(survivor);
      b.add(`${survivor.name}`, Math.round(contribution * 100) / 100);
    }
    const levelBonus = BALANCE.research.labLevelBonus[lab.level] ?? 1;
    if (levelBonus !== 1) b.mul(t('engine.cbt.securityPost', { name: labLabel(), level: lab.level }), levelBonus);
    if (lab.brownedOut) {
      b.note(
        t('engine.brownedOut'),
        t('engine.rsr.labBrownoutNote'),
        t('engine.rsr.labBrownoutFix'),
      );
    }
  } else {
    b.note(t('engine.rsr.noLab'), t('engine.rsr.noLabNote'), t('engine.rsr.noLabFix'));
  }

  const archive = operationalLevel(state, 'deep_archive');
  if (archive >= 2) b.mul(t('engine.rsr.deepArchive'), 1.25);

  return b.build({ min: 0, round: 2 });
}

export interface ResearchAvailability {
  node: ResearchDef;
  ok: boolean;
  reason?: string;
  cost: number;
  /**
   * The node's own price plus every prerequisite still outstanding.
   *
   * For a node you can start today this equals `cost`. For a locked one it is the honest
   * price, and the two diverge sharply: the cheapest tier-3 node lists at 39 insight and
   * costs 76 all-in, and the mean tier-3 chain is 111 against the ~93 a 60-day run
   * generates. Showing only the list price told a player a tier was one project away when
   * it was three and unaffordable.
   */
  chainCost: number;
  /** Days to complete at the current insight rate. */
  estimatedDays: number | null;
  /** Days to complete the whole outstanding chain at the current insight rate. */
  chainDays: number | null;
  completed: boolean;
  active: boolean;
}

export function researchCost(state: GameState, node: ResearchDef): number {
  const difficulty = (state.flags['mod:researchCost'] as number | undefined) ?? 1;
  return Math.round(node.cost * difficulty);
}

/**
 * Input : a node. Output: the insight still outstanding on it and on its prerequisites.
 * Why   : two things would otherwise be overstated. Prerequisites form a small DAG —
 *         `def_kill_box` reaches `def_ranged_arms` down two separate branches — so a node
 *         already counted must not be counted again; `seen` carries across the recursion
 *         for that. And work already done is not still owed: a prerequisite half-finished,
 *         or shelved with progress banked at the 50% penalty, has had part of its price
 *         paid. Charging the list price anyway would leave the panel's estimate frozen
 *         while a prerequisite visibly progressed, then drop it by the whole price at the
 *         moment of completion.
 */
export function researchChainCost(
  state: GameState,
  node: ResearchDef,
  seen: Set<ResearchId> = new Set(),
): number {
  if (seen.has(node.id) || state.research.completed.includes(node.id)) return 0;
  seen.add(node.id);
  let total = Math.max(0, researchCost(state, node) - researchProgressOn(state, node.id));
  for (const id of node.requires) {
    const prerequisite = RESEARCH_BY_ID[id];
    if (prerequisite) total += researchChainCost(state, prerequisite, seen);
  }
  return total;
}

/** Insight already sunk into a node: live progress if it is the active project, else banked. */
function researchProgressOn(state: GameState, id: ResearchId): number {
  if (state.research.active?.id === id) return state.research.active.progress;
  return (state.flags[`research:banked:${id}`] as number | undefined) ?? 0;
}

export function researchAvailability(state: GameState, node: ResearchDef): ResearchAvailability {
  const completed = state.research.completed.includes(node.id);
  const active = state.research.active?.id === node.id;
  const cost = researchCost(state, node);
  const chainCost = researchChainCost(state, node);
  const rate = insightRate(state).total;
  const estimatedDays = rate > 0 ? Math.max(1, Math.ceil(cost / rate)) : null;
  const chainDays = rate > 0 ? Math.max(1, Math.ceil(chainCost / rate)) : null;

  if (completed) return { node, ok: false, reason: t('engine.rsr.completed'), cost, chainCost, estimatedDays, chainDays, completed, active };
  if (active) return { node, ok: false, reason: t('engine.rsr.inProgress'), cost, chainCost, estimatedDays, chainDays, completed, active };

  const missing = node.requires.filter((id) => !state.research.completed.includes(id));
  if (missing.length > 0) {
    const names = missing.map((id) => RESEARCH_BY_ID[id]?.name ?? id).join(', ');
    return { node, ok: false, reason: t('engine.rsr.requires', { names }), cost, chainCost, estimatedDays, chainDays, completed, active };
  }
  if (node.requiresFlag && !state.flags[node.requiresFlag]) {
    return { node, ok: false, reason: t('engine.rsr.notEnough'), cost, chainCost, estimatedDays, chainDays, completed, active };
  }
  const lab = findFacility(state, 'laboratory');
  const labLevel = lab && lab.status !== 'building' ? lab.level : 0;
  if (node.tier >= 2 && labLevel < 1) {
    return { node, ok: false, reason: t('engine.rsr.requiresLab'), cost, chainCost, estimatedDays, chainDays, completed, active };
  }
  if (node.tier >= 3 && labLevel < 2) {
    return { node, ok: false, reason: t('engine.rsr.requiresLab2'), cost, chainCost, estimatedDays, chainDays, completed, active };
  }
  return { node, ok: true, cost, chainCost, estimatedDays, chainDays, completed, active };
}

export function startResearch(state: GameState, id: ResearchId): { ok: boolean; reason?: string } {
  const node = RESEARCH_BY_ID[id];
  if (!node) return { ok: false, reason: t('engine.rsr.unknown') };
  const availability = researchAvailability(state, node);
  if (!availability.ok) return { ok: false, reason: availability.reason };
  // Switching projects preserves progress on the abandoned one at a 50% penalty.
  if (state.research.active) {
    state.flags[`research:banked:${state.research.active.id}`] = Math.floor(
      state.research.active.progress * 0.5,
    );
  }
  const banked = (state.flags[`research:banked:${id}`] as number | undefined) ?? 0;
  state.research.active = {
    id,
    progress: banked,
    required: availability.cost,
    startedDay: state.day,
  };
  delete state.flags[`research:banked:${id}`];
  return { ok: true };
}

export function cancelResearch(state: GameState): boolean {
  if (!state.research.active) return false;
  state.flags[`research:banked:${state.research.active.id}`] = Math.floor(
    state.research.active.progress * 0.5,
  );
  state.research.active = null;
  return true;
}

/** Advance the active project by one day. Returns log notes. */
export function progressResearch(state: GameState, rng: Rng): string[] {
  const notes: string[] = [];
  const rate = insightRate(state).total;
  state.research.insight += rate;

  const active = state.research.active;
  if (!active) return notes;

  // Only one day's worth of insight is spent per day; the rest banks toward the next project.
  const spend = Math.min(state.research.insight, rate);
  active.progress += spend;
  state.research.insight = Math.max(0, state.research.insight - spend);

  if (active.progress >= active.required) {
    const node = RESEARCH_BY_ID[active.id];
    state.research.completed.push(active.id);
    state.research.active = null;
    state.stats.researchCompleted += 1;
    if (node) {
      notes.push(t('engine.rsr.complete', { name: researchName(node), effect: researchEffect(node) }));
      notes.push(...applyResearchUnlocks(state, node, rng));
    }
  }
  return notes;
}

function applyResearchUnlocks(state: GameState, node: ResearchDef, rng: Rng): string[] {
  const notes: string[] = [];
  for (const unlock of node.unlocks) {
    switch (unlock.kind) {
      case 'action':
        state.flags[`unlock:${unlock.id}`] = true;
        break;
      case 'passive':
        state.flags[`passive:${unlock.id}`] = true;
        break;
      case 'ring':
        state.world.unlockedRing = Math.max(state.world.unlockedRing, unlock.ring);
        break;
      case 'ending':
        state.flags[`ending:available:${unlock.endingId}`] = true;
        break;
      case 'facility':
      case 'recipe':
        // Availability is derived from `research.completed`, so nothing to store.
        break;
    }
  }
  if (node.id === 'exp_cartography') {
    const revealed = revealLocations(state, rng, 2, 1);
    if (revealed.length > 0) {
      notes.push(
        t('engine.rsr.districts', {
          names: revealed
            .map((l) => {
              const archetype = ARCHETYPE_BY_ID[l.archetypeId];
              return archetype ? locationNameForm(archetype, l.name) : l.name;
            })
            .join(', '),
        }),
      );
    }
  }
  return notes;
}

export function allResearch(state: GameState): ResearchAvailability[] {
  return RESEARCH.map((node) => researchAvailability(state, node));
}

export function hasPassive(state: GameState, id: string): boolean {
  return Boolean(state.flags[`passive:${id}`]);
}

export function hasUnlockedAction(state: GameState, id: string): boolean {
  return Boolean(state.flags[`unlock:${id}`]);
}
