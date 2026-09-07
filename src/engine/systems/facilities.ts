import { t } from '../../i18n';
import { facilityName as facilityLabel, resourceName } from '../../i18n/content';
import { RESOURCES } from '../data/resources';
import type {
  BuildSlot,
  FacilityDef,
  FacilityId,
  FacilityInstance,
  GameState,
  PowerReport,
  ResourceId,
  ResourceMap,
  Survivor,
} from '../model/types';
import { BreakdownBuilder } from '../core/breakdown';
import { clamp } from '../core/math';
import { BALANCE } from '../data/balance';
import { FACILITIES, FACILITY_BY_ID } from '../data/facilities';
import { livingSurvivors, workEfficiency } from './survivors';

/* ------------------------------------------------------------------- queries */

/** The translated name of a facility definition, by id. */
function labelOf(defId: string): string {
  const def = FACILITY_BY_ID[defId];
  return def ? facilityLabel(def) : defId;
}

/** "Needs 12 components" — the first thing the vault cannot pay for. */
function shortfallReason(first: { needed: number; resource: ResourceId }): string {
  return t('engine.fac.needs', {
    amount: Math.ceil(first.needed),
    resource: resourceName(RESOURCES[first.resource]).toLowerCase(),
  });
}

export function facilityDef(instance: FacilityInstance): FacilityDef {
  const def = FACILITY_BY_ID[instance.defId];
  if (!def) throw new Error(`Unknown facility def: ${instance.defId}`);
  return def;
}

export function findFacility(state: GameState, defId: FacilityId): FacilityInstance | undefined {
  return state.facilities.find((f) => f.defId === defId);
}

export function facilityLevel(state: GameState, defId: FacilityId): number {
  const facility = findFacility(state, defId);
  if (!facility || facility.status === 'building') return 0;
  return facility.level;
}

export function isOperational(facility: FacilityInstance | undefined): boolean {
  return Boolean(facility) && facility!.status === 'operational' && !facility!.brownedOut;
}

export function operationalLevel(state: GameState, defId: FacilityId): number {
  const facility = findFacility(state, defId);
  return isOperational(facility) ? facility!.level : 0;
}

export function staffOf(state: GameState, facility: FacilityInstance): Survivor[] {
  return facility.staff
    .map((id) => state.survivors.find((s) => s.id === id))
    .filter((s): s is Survivor => Boolean(s) && s!.alive);
}

/** Total staff effectiveness for a facility, expressed in "effective workers". */
export function staffPower(state: GameState, facility: FacilityInstance): number {
  const def = facilityDef(facility);
  const staff = staffOf(state, facility);
  let total = 0;
  for (const survivor of staff) {
    const efficiency = workEfficiency(survivor, def.skill, {
      facility,
      facilityDef: def,
      coworkers: staff,
      relationships: state.relationships,
      brownedOut: facility.brownedOut,
    });
    total += efficiency.total;
  }
  return total;
}

/* ---------------------------------------------------------------- build slots */

export function createSlots(): BuildSlot[] {
  const slots: BuildSlot[] = [];
  // Deck 0 — the entry level, mostly clear. Deck 1 — partially collapsed. Deck 2 — sealed.
  const layout: { deck: number; count: number; sealedFrom: number; clearCost: number; clearLabour: number }[] = [
    { deck: 0, count: 6, sealedFrom: 6, clearCost: 0, clearLabour: 0 },
    { deck: 1, count: 6, sealedFrom: 3, clearCost: 10, clearLabour: 18 },
    { deck: 2, count: 5, sealedFrom: 1, clearCost: 20, clearLabour: 32 },
  ];
  for (const row of layout) {
    for (let i = 0; i < row.count; i += 1) {
      slots.push({
        id: `d${row.deck}s${i}`,
        deck: row.deck,
        index: i,
        sealed: i >= row.sealedFrom,
        clearCost: row.clearCost,
        clearLabour: row.clearLabour,
        clearProgress: 0,
      });
    }
  }
  return slots;
}

export function availableSlots(state: GameState, def: FacilityDef): BuildSlot[] {
  const occupied = new Set(state.facilities.map((f) => f.slotId));
  return state.slots.filter(
    (slot) => !slot.sealed && !occupied.has(slot.id) && def.decks.includes(slot.deck),
  );
}

/* ---------------------------------------------------------------- affordability */

export interface CostCheck {
  ok: boolean;
  missing: { resource: ResourceId; needed: number; have: number }[];
}

export function canAfford(resources: ResourceMap, cost: Partial<ResourceMap>): CostCheck {
  const missing: { resource: ResourceId; needed: number; have: number }[] = [];
  for (const [key, amount] of Object.entries(cost) as [ResourceId, number][]) {
    if (amount <= 0) continue;
    if (resources[key] < amount) missing.push({ resource: key, needed: amount, have: resources[key] });
  }
  return { ok: missing.length === 0, missing };
}

export function payCost(resources: ResourceMap, cost: Partial<ResourceMap>): void {
  for (const [key, amount] of Object.entries(cost) as [ResourceId, number][]) {
    resources[key] = Math.max(0, resources[key] - amount);
  }
}

/* ---------------------------------------------------------------- build/upgrade */

export interface BuildCheck {
  ok: boolean;
  reason?: string;
  cost?: Partial<ResourceMap>;
  labour?: number;
}

export function canBuild(state: GameState, defId: FacilityId, slotId?: string): BuildCheck {
  const def = FACILITY_BY_ID[defId];
  if (!def) return { ok: false, reason: t('engine.fac.unknown') };
  /*
   * Research is the usual key, but not the only one: an event that physically opens a space
   * — cutting through the sub-level bulkhead, say — should unlock what is behind it without
   * asking the player to also derive it from first principles. Events set `unlock:<id>`.
   */
  const unlockedByEvent = Boolean(state.flags[`unlock:${defId}`]);
  if (def.requiresResearch && !state.research.completed.includes(def.requiresResearch) && !unlockedByEvent) {
    return { ok: false, reason: t('engine.fac.requiresResearch') };
  }
  const banned = (state.flags[`banned:${defId}`] as number | undefined) ?? 0;
  if (banned > state.day) return { ok: false, reason: t('engine.fac.bannedUntil', { day: banned }) };
  if (def.unique && findFacility(state, defId)) return { ok: false, reason: t('engine.fac.alreadyBuilt') };

  const slots = availableSlots(state, def);
  if (slots.length === 0) return { ok: false, reason: t('engine.fac.noSlot') };
  if (slotId && !slots.some((s) => s.id === slotId)) {
    return { ok: false, reason: t('engine.fac.slotUnavailable') };
  }

  const cost = def.levels[0].buildCost;
  const check = canAfford(state.resources, cost);
  if (!check.ok) {
    const first = check.missing[0]!;
    return { ok: false, reason: shortfallReason(first), cost };
  }
  return { ok: true, cost, labour: def.levels[0].labour };
}

export function buildFacility(state: GameState, defId: FacilityId, slotId: string): boolean {
  const check = canBuild(state, defId, slotId);
  if (!check.ok) return false;
  const def = FACILITY_BY_ID[defId]!;
  payCost(state.resources, def.levels[0].buildCost);
  state.idCounter += 1;
  state.facilities.push({
    id: `f${state.idCounter}`,
    defId,
    slotId,
    level: 1,
    condition: 100,
    status: def.levels[0].labour > 0 ? 'building' : 'operational',
    progress: 0,
    progressRequired: def.levels[0].labour,
    staff: [],
    priority: defaultPriority(def.id),
    brownedOut: false,
    builtDay: state.day,
  });
  return true;
}

export function canUpgrade(state: GameState, facilityId: string): BuildCheck {
  const facility = state.facilities.find((f) => f.id === facilityId);
  if (!facility) return { ok: false, reason: t('engine.fac.notFound') };
  if (facility.status === 'building') return { ok: false, reason: t('engine.fac.stillBuilding') };
  if (facility.upgradingTo) return { ok: false, reason: t('engine.fac.upgradeInProgress') };
  if (facility.level >= 3) return { ok: false, reason: t('engine.fac.maxLevel') };
  const def = facilityDef(facility);
  const next = def.levels[facility.level];
  if (!next) return { ok: false, reason: t('engine.fac.maxLevel') };
  const check = canAfford(state.resources, next.buildCost);
  if (!check.ok) {
    const first = check.missing[0]!;
    return { ok: false, reason: shortfallReason(first), cost: next.buildCost };
  }
  return { ok: true, cost: next.buildCost, labour: next.labour };
}

export function upgradeFacility(state: GameState, facilityId: string): boolean {
  const check = canUpgrade(state, facilityId);
  if (!check.ok) return false;
  const facility = state.facilities.find((f) => f.id === facilityId)!;
  const def = facilityDef(facility);
  const next = def.levels[facility.level]!;
  payCost(state.resources, next.buildCost);
  facility.upgradingTo = facility.level + 1;
  facility.progress = 0;
  facility.progressRequired = next.labour;
  return true;
}

export function demolishFacility(state: GameState, facilityId: string): boolean {
  const index = state.facilities.findIndex((f) => f.id === facilityId);
  if (index < 0) return false;
  const facility = state.facilities[index]!;
  const def = facilityDef(facility);
  let refund = 0;
  for (let level = 0; level < facility.level; level += 1) {
    refund += def.levels[level]?.buildCost.components ?? 0;
  }
  state.resources.components += Math.floor(refund * BALANCE.facilities.demolishRefund);
  for (const id of facility.staff) {
    const survivor = state.survivors.find((s) => s.id === id);
    if (survivor) survivor.assignment = { kind: 'idle' };
  }
  state.facilities.splice(index, 1);
  return true;
}

function defaultPriority(id: FacilityId): number {
  switch (id) {
    case 'water_reclaimer':
      return 100;
    case 'infirmary':
      return 90;
    case 'galley':
      return 80;
    case 'hydroponics':
      return 70;
    case 'bunks':
      return 60;
    case 'workshop':
      return 50;
    case 'storage':
      return 45;
    case 'security':
      return 40;
    case 'surface_access':
      return 35;
    case 'radio_room':
      return 30;
    case 'machine_shop':
      return 25;
    case 'laboratory':
      return 20;
    case 'deep_archive':
      return 15;
    default:
      return 50;
  }
}

/**
 * How many people the vault can actually sleep. Beyond this, survivors bed down in
 * corridors: morale falls and rest is worth much less. This is the constraint that stops
 * an unbounded population, and it is why the Bunks are worth upgrading.
 */
export function bunkCapacity(state: GameState): number {
  const bunks = findFacility(state, 'bunks');
  if (!bunks || bunks.status === 'building') return 3;
  return [3, 5, 9, 14][bunks.level] ?? 3;
}

export function overcrowding(state: GameState): number {
  const living = state.survivors.filter((s) => s.alive).length;
  return Math.max(0, living - bunkCapacity(state));
}

/* -------------------------------------------------------------------- staffing */

export function assignToFacility(
  state: GameState,
  survivorId: string,
  facilityId: string | null,
): boolean {
  const survivor = state.survivors.find((s) => s.id === survivorId);
  if (!survivor || !survivor.alive) return false;
  if (survivor.assignment.kind === 'expedition') return false;

  // Remove from any current facility.
  for (const facility of state.facilities) {
    const index = facility.staff.indexOf(survivorId);
    if (index >= 0) facility.staff.splice(index, 1);
  }

  if (facilityId === null) {
    survivor.assignment = { kind: 'idle' };
    return true;
  }
  if (facilityId === 'rest') {
    survivor.assignment = { kind: 'rest' };
    return true;
  }

  const facility = state.facilities.find((f) => f.id === facilityId);
  if (!facility) return false;
  const def = facilityDef(facility);
  const slots = def.levels[facility.level - 1]?.staffSlots ?? 0;
  if (slots === 0) return false;
  if (facility.staff.length >= slots) return false;
  facility.staff.push(survivorId);
  survivor.assignment = { kind: 'facility', facilityId: facility.id };
  return true;
}

export function staffSlots(facility: FacilityInstance): number {
  return facilityDef(facility).levels[facility.level - 1]?.staffSlots ?? 0;
}

/* ----------------------------------------------------------------------- power */

/**
 * Allocate power. Capacity comes from the reactor (scaled by its staff and condition);
 * demand is the sum of facility draw. When demand exceeds capacity, facilities are browned
 * out in ascending priority order until the books balance — which is why the player sets
 * priorities rather than the game guessing.
 */
/**
 * Work out the power books without touching the state.
 *
 * The UI needs this figure every render — the dashboard and the base panel both show it —
 * and render-time reads happen against a frozen draft, so the calculation and the write
 * are deliberately separate. `allocatePower` is the only writer.
 */
function resolvePower(state: GameState): { report: PowerReport; brownedOut: Set<string>; remaining: number } {
  const capacity = new BreakdownBuilder();
  const reactor = findFacility(state, 'reactor');

  if (reactor && reactor.status !== 'building') {
    const base = BALANCE.power.reactorOutput[reactor.level] ?? 0;
    capacity.base(
      t('engine.facilityLevel', { name: labelOf('reactor'), level: reactor.level }),
      base,
    );
    const conditionFactor = clamp(0.6 + (reactor.condition / 100) * 0.4, 0.6, 1);
    capacity.mul(
      t('engine.pow.reactorCondition'),
      conditionFactor,
      t('engine.conditionPct', { value: Math.round(reactor.condition) }),
      reactor.condition < 60 ? t('engine.pow.reactorRepairFix') : undefined,
    );
    const staff = staffOf(state, reactor);
    if (staff.length === 0) {
      capacity.mul(
        t('engine.unstaffed'),
        0.85,
        t('engine.pow.reactorUnstaffed'),
        t('engine.pow.reactorUnstaffedFix'),
      );
    } else {
      capacity.mul(t('engine.staffed'), clamp(1 + staffPower(state, reactor) * 0.12, 1, 1.35));
    }
    if (state.resources.fuel <= 0) {
      capacity.mul(
        t('engine.pow.noFuel'),
        0,
        t('engine.pow.noFuelNote'),
        t('engine.pow.noFuelFix'),
      );
    }
  } else {
    capacity.base(t('engine.pow.noReactor'), 0);
  }

  if (state.research.completed.includes('eng_battery_bank')) {
    const carry = Math.min(BALANCE.power.batteryCarry, (state.flags['power:carry'] as number) ?? 0);
    if (carry > 0) capacity.add(t('engine.pow.battery'), carry);
  }

  const capacityResult = capacity.build({ min: 0, round: 1 });

  const demand = new BreakdownBuilder();
  const draws: { facility: FacilityInstance; draw: number }[] = [];
  for (const facility of state.facilities) {
    if (facility.status === 'building') continue;
    const def = facilityDef(facility);
    const draw = def.levels[facility.level - 1]?.powerDraw ?? 0;
    if (draw <= 0) continue;
    draws.push({ facility, draw });
    demand.add(
      t('engine.facilityLevel', { name: facilityLabel(def), level: facility.level }),
      draw,
    );
  }
  const demandResult = demand.build({ min: 0, round: 1 });

  const brownedOut: string[] = [];
  let remaining = capacityResult.total;
  const ordered = draws.slice().sort((a, b) => b.facility.priority - a.facility.priority);
  for (const entry of ordered) {
    if (remaining >= entry.draw) {
      remaining -= entry.draw;
    } else {
      brownedOut.push(entry.facility.id);
    }
  }

  return {
    report: {
      capacity: capacityResult,
      demand: demandResult,
      brownedOut,
      deficit: Math.max(0, demandResult.total - capacityResult.total),
    },
    brownedOut: new Set(brownedOut),
    remaining,
  };
}

/** The power books as a read-only figure. Safe to call from render. */
export function powerReport(state: GameState): PowerReport {
  return resolvePower(state).report;
}

/**
 * Allocate power and record the result on the facilities: browned-out machines stop
 * producing, and any surplus is carried by a battery bank if one has been researched.
 */
export function allocatePower(state: GameState): PowerReport {
  const { report, brownedOut, remaining } = resolvePower(state);

  for (const facility of state.facilities) {
    facility.brownedOut = facility.status !== 'building' && brownedOut.has(facility.id);
  }

  state.flags['power:carry'] = state.research.completed.includes('eng_battery_bank')
    ? Math.min(BALANCE.power.batteryCarry, Math.max(0, remaining))
    : 0;

  return report;
}

/* ----------------------------------------------------------------- maintenance */

export interface DecayResult {
  notes: string[];
  breakdowns: FacilityInstance[];
}

export function decayFacilities(state: GameState, rng: { next(): number; chance(p: number): boolean }): DecayResult {
  const notes: string[] = [];
  const breakdowns: FacilityInstance[] = [];
  const difficultyDecay = (state.flags['mod:facilityDecay'] as number | undefined) ?? 1;

  /*
   * Deep winter. Past the attrition threshold everything wears faster, which stops a vault
   * that is neither thriving nor failing from sitting on the fence indefinitely.
   */
  const pastHorizon = Math.max(0, state.day - BALANCE.endings.attritionFromDay);
  const attrition = (pastHorizon / 10) * BALANCE.endings.attritionDecayPerDecade;
  if (attrition > 0 && state.day === BALANCE.endings.attritionFromDay + 1) {
    notes.push(t('engine.fac.coldWear'));
  }

  for (const facility of state.facilities) {
    if (facility.status === 'building') continue;
    const def = facilityDef(facility);
    let decay = def.decayPerDay * difficultyDecay + attrition;
    if (facility.brownedOut) decay += BALANCE.facilities.brownoutDecay;
    if (facility.staff.length === 0 && def.levels[facility.level - 1]!.staffSlots > 0) decay *= 1.15;
    if (state.research.completed.includes('eng_preventive_maintenance')) decay *= 0.65;
    facility.condition = clamp(facility.condition - decay, 0, 100);

    if (facility.condition < BALANCE.facilities.breakdownThreshold && facility.status === 'operational') {
      const chance =
        BALANCE.facilities.breakdownChanceAtZero *
        (1 - facility.condition / BALANCE.facilities.breakdownThreshold);
      if (rng.chance(chance)) {
        facility.status = 'damaged';
        breakdowns.push(facility);
        notes.push(t('engine.fac.brokeDown', { name: facilityLabel(def) }));
      }
    }
    if (facility.condition <= 0 && facility.status !== 'offline') {
      facility.status = 'offline';
      notes.push(t('engine.fac.failedCompletely', { name: facilityLabel(def) }));
    }
  }
  return { notes, breakdowns };
}

export function repairCost(facility: FacilityInstance): { components: number; labour: number } {
  const missing = 100 - facility.condition;
  return {
    components: Math.ceil(missing * 0.12),
    labour: Math.ceil(missing / BALANCE.facilities.repairPerLabour),
  };
}

export function repairFacility(state: GameState, facilityId: string): boolean {
  const facility = state.facilities.find((f) => f.id === facilityId);
  if (!facility) return false;
  if (facility.condition >= 100 && facility.status === 'operational') return false;
  const cost = repairCost(facility);
  const machineShop = operationalLevel(state, 'machine_shop');
  const components = machineShop >= 2 ? Math.ceil(cost.components * 0.6) : cost.components;
  if (state.resources.components < components) return false;
  state.resources.components -= components;
  facility.condition = 100;
  if (facility.status === 'damaged' || facility.status === 'offline') facility.status = 'operational';
  return true;
}

/* -------------------------------------------------------------- construction */

/**
 * Progress builds, upgrades, and slot clearing using labour generated by survivors who are
 * not otherwise occupied, plus a workshop bonus. Anyone assigned to `idle` counts as
 * general labour, which is why "idle" is really "on the crew".
 */
export function totalLabourPool(state: GameState): number {
  let total = 0;
  for (const survivor of livingSurvivors(state)) {
    const kind = survivor.assignment.kind;
    if (kind === 'expedition' || kind === 'rest') continue;
    const rate =
      kind === 'idle' ? BALANCE.labour.perSurvivorDay : BALANCE.labour.perAssignedDay;
    const efficiency = workEfficiency(survivor, 'engineering');
    total += rate * efficiency.total;
  }
  const workshop = findFacility(state, 'workshop');
  if (workshop && isOperational(workshop)) {
    const bonus = [0, 0.25, 0.5, 0.8][workshop.level] ?? 0;
    total *= 1 + bonus;
  }
  return total;
}

export function applyConstructionLabour(state: GameState, labour: number): string[] {
  const notes: string[] = [];
  let remaining = labour;
  if (remaining <= 0) return notes;

  // Slot clearing first — it is a prerequisite for everything else.
  for (const slot of state.slots) {
    if (!slot.sealed || remaining <= 0) continue;
    if (slot.clearProgress <= 0 && !(state.flags[`clearing:${slot.id}`] as boolean)) continue;
    const need = slot.clearLabour - slot.clearProgress;
    const spend = Math.min(remaining, need);
    slot.clearProgress += spend;
    remaining -= spend;
    if (slot.clearProgress >= slot.clearLabour) {
      slot.sealed = false;
      delete state.flags[`clearing:${slot.id}`];
      notes.push(t('engine.fac.cleared', { deck: slot.deck + 1 }));
    }
  }

  for (const facility of state.facilities) {
    if (remaining <= 0) break;
    const isBuilding = facility.status === 'building';
    const isUpgrading = Boolean(facility.upgradingTo);
    if (!isBuilding && !isUpgrading) continue;
    const need = facility.progressRequired - facility.progress;
    const spend = Math.min(remaining, need);
    facility.progress += spend;
    remaining -= spend;
    if (facility.progress >= facility.progressRequired) {
      const def = facilityDef(facility);
      if (isBuilding) {
        facility.status = 'operational';
        facility.progress = 0;
        facility.progressRequired = 0;
        state.stats.facilitiesBuilt += 1;
        notes.push(t('engine.fac.operational', { name: facilityLabel(def) }));
      } else if (facility.upgradingTo) {
        facility.level = facility.upgradingTo;
        delete facility.upgradingTo;
        facility.progress = 0;
        facility.progressRequired = 0;
        facility.condition = Math.min(100, facility.condition + 25);
        state.stats.facilitiesUpgraded += 1;
        notes.push(t('engine.fac.upgraded', { name: facilityLabel(def), level: facility.level }));
      }
    }
  }

  state.flags['labour:spare'] = Math.round(remaining * 10) / 10;
  return notes;
}

export function startClearingSlot(state: GameState, slotId: string): boolean {
  const slot = state.slots.find((s) => s.id === slotId);
  if (!slot || !slot.sealed) return false;
  if (state.flags[`clearing:${slotId}`]) return false;
  if (state.resources.components < slot.clearCost) return false;
  state.resources.components -= slot.clearCost;
  state.flags[`clearing:${slotId}`] = true;
  slot.clearProgress = Math.max(slot.clearProgress, 0.01);
  return true;
}

/** Facilities the player could build right now, for the Base panel's build list. */
export function buildableFacilities(state: GameState): { def: FacilityDef; check: BuildCheck }[] {
  return FACILITIES.filter((def) => !def.unique || !findFacility(state, def.id)).map((def) => ({
    def,
    check: canBuild(state, def.id),
  }));
}
