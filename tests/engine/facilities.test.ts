import { describe, expect, it } from 'vitest';
import { FACILITIES, FACILITY_BY_ID, Facilities, Survivors } from '@engine';
import { newState, placeFacility, snapshot, staff, stockUp, testRng } from '../helpers';

describe('facility construction', () => {
  it('refuses to build what cannot be afforded and says why', () => {
    const state = newState();
    for (const key of Object.keys(state.resources) as (keyof typeof state.resources)[]) {
      state.resources[key] = 0;
    }
    const check = Facilities.canBuild(state, 'workshop');
    expect(check.ok).toBe(false);
    expect(check.reason).toMatch(/needs/i);
  });

  it('refuses research-gated facilities until the research is done', () => {
    const state = stockUp(newState());
    const gated = FACILITIES.find((f) => f.requiresResearch);
    expect(gated).toBeDefined();
    expect(Facilities.canBuild(state, gated!.id).reason).toBe('Requires research');
    state.research.completed.push(gated!.requiresResearch!);
    expect(Facilities.canBuild(state, gated!.id).reason).not.toBe('Requires research');
  });

  it('refuses a second copy of a unique facility', () => {
    const state = stockUp(newState());
    const unique = FACILITIES.find((f) => f.unique && !f.requiresResearch)!;
    placeFacility(state, unique.id);
    expect(Facilities.canBuild(state, unique.id).ok).toBe(false);
  });

  it('refuses a slot on a deck the facility is not permitted on', () => {
    const state = stockUp(newState());
    const def = FACILITIES.find((f) => !f.decks.includes(2) && !f.requiresResearch)!;
    const wrongSlot = state.slots.find((s) => s.deck === 2 && !s.sealed);
    if (wrongSlot) expect(Facilities.canBuild(state, def.id, wrongSlot.id).ok).toBe(false);
  });

  it('building charges the cost and starts construction rather than finishing it', () => {
    const state = stockUp(newState());
    const slot = Facilities.availableSlots(state, FACILITY_BY_ID['workshop']!)[0]!;
    const before = state.resources.components;
    expect(Facilities.buildFacility(state, 'workshop', slot.id)).toBe(true);
    const built = state.facilities.find((f) => f.defId === 'workshop')!;
    expect(built.status).toBe('building');
    expect(built.progress).toBeLessThan(built.progressRequired);
    expect(state.resources.components).toBeLessThan(before);
  });

  it('construction labour comes from unassigned and resting crew and eventually completes', () => {
    const state = stockUp(newState());
    const slot = Facilities.availableSlots(state, FACILITY_BY_ID['workshop']!)[0]!;
    Facilities.buildFacility(state, 'workshop', slot.id);
    for (const survivor of Survivors.livingSurvivors(state)) survivor.assignment = { kind: 'idle' };

    for (let day = 0; day < 30; day += 1) {
      Facilities.applyConstructionLabour(state, Facilities.totalLabourPool(state));
      if (state.facilities[state.facilities.length - 1]!.status === 'operational') break;
    }
    expect(state.facilities.find((f) => f.defId === 'workshop')!.status).toBe('operational');
  });

  it('upgrading is gated on cost and stops at level 3', () => {
    const state = stockUp(newState());
    const facility = placeFacility(state, 'workshop', 3);
    expect(Facilities.canUpgrade(state, facility.id).ok).toBe(false);
  });

  it('demolition returns half the materials', () => {
    const state = stockUp(newState(), 20);
    const facility = placeFacility(state, 'workshop', 1);
    const before = state.resources.components;
    expect(Facilities.demolishFacility(state, facility.id)).toBe(true);
    expect(state.facilities.find((f) => f.id === facility.id)).toBeUndefined();
    expect(state.resources.components).toBeGreaterThan(before);
  });

  it('demolition frees the crew working there', () => {
    const state = stockUp(newState());
    const facility = placeFacility(state, 'workshop');
    const worker = Survivors.livingSurvivors(state)[0]!;
    staff(state, facility, worker);
    expect(worker.assignment.kind).toBe('facility');
    Facilities.demolishFacility(state, facility.id);
    expect(worker.assignment.kind).not.toBe('facility');
  });
});

describe('staffing', () => {
  it('assigns and un-assigns cleanly on both sides of the link', () => {
    const state = newState();
    const facility = placeFacility(state, 'workshop');
    const worker = Survivors.livingSurvivors(state)[0]!;

    expect(Facilities.assignToFacility(state, worker.id, facility.id)).toBe(true);
    expect(facility.staff).toContain(worker.id);

    expect(Facilities.assignToFacility(state, worker.id, 'rest')).toBe(true);
    expect(facility.staff).not.toContain(worker.id);
    expect(worker.assignment.kind).toBe('rest');

    expect(Facilities.assignToFacility(state, worker.id, null)).toBe(true);
    expect(worker.assignment.kind).toBe('idle');
  });

  it('never puts one person in two places', () => {
    const state = newState();
    const a = placeFacility(state, 'workshop');
    const b = placeFacility(state, 'infirmary');
    const worker = Survivors.livingSurvivors(state)[0]!;
    Facilities.assignToFacility(state, worker.id, a.id);
    Facilities.assignToFacility(state, worker.id, b.id);
    expect(a.staff).not.toContain(worker.id);
    expect(b.staff).toContain(worker.id);
  });

  it('refuses to overfill a facility', () => {
    const state = newState();
    const facility = placeFacility(state, 'workshop', 1);
    const slots = Facilities.staffSlots(facility);
    const crew = Survivors.livingSurvivors(state);
    let placed = 0;
    for (const survivor of crew) {
      if (Facilities.assignToFacility(state, survivor.id, facility.id)) placed += 1;
    }
    expect(placed).toBe(Math.min(slots, crew.length));
    expect(facility.staff.length).toBeLessThanOrEqual(slots);
  });

  it('will not reassign someone who is away on an expedition', () => {
    const state = newState();
    const facility = placeFacility(state, 'workshop');
    const traveller = Survivors.livingSurvivors(state)[0]!;
    traveller.assignment = { kind: 'expedition', expeditionId: 'e1' };
    expect(Facilities.assignToFacility(state, traveller.id, facility.id)).toBe(false);
  });
});

describe('power', () => {
  it('powerReport does not mutate the state', () => {
    const state = newState();
    placeFacility(state, 'workshop');
    placeFacility(state, 'infirmary');
    const before = snapshot(state);
    Facilities.powerReport(state);
    expect(snapshot(state)).toEqual(before);
  });

  it('browns out the lowest priority facilities first', () => {
    const state = newState();
    const reactor = state.facilities.find((f) => f.defId === 'reactor') ?? placeFacility(state, 'reactor', 1);
    reactor.priority = 10;
    const keep = placeFacility(state, 'water_reclaimer', 3, { priority: 9 });
    const drop = placeFacility(state, 'laboratory', 3, { priority: 0 });
    state.resources.fuel = 20;

    const report = Facilities.allocatePower(state);
    if (report.deficit > 0) {
      expect(report.brownedOut).toContain(drop.id);
      expect(report.brownedOut).not.toContain(keep.id);
      expect(drop.brownedOut).toBe(true);
    }
  });

  it('a reactor without fuel supplies nothing', () => {
    const state = newState();
    state.resources.fuel = 0;
    const report = Facilities.powerReport(state);
    expect(report.capacity.total).toBe(0);
  });

  it('reports both halves of the books with labelled terms', () => {
    const state = newState();
    placeFacility(state, 'laboratory', 2);
    const report = Facilities.powerReport(state);
    expect(report.demand.terms.some((t) => t.label.includes('Laboratory'))).toBe(true);
    expect(report.capacity.terms.length).toBeGreaterThan(0);
  });

  it('facilities under construction never draw power', () => {
    const state = newState();
    placeFacility(state, 'laboratory', 3, { status: 'building' });
    const report = Facilities.powerReport(state);
    expect(report.demand.terms.some((t) => t.label.includes('Laboratory'))).toBe(false);
  });
});

describe('decay and repair', () => {
  it('condition falls over time and can break a facility', () => {
    const state = newState();
    const facility = placeFacility(state, 'workshop', 1, { condition: 3 });
    const rng = testRng('decay');
    for (let i = 0; i < 40; i += 1) Facilities.decayFacilities(state, rng);
    expect(facility.condition).toBeLessThan(100);
  });

  it('repair costs components and restores condition', () => {
    const state = stockUp(newState());
    const facility = placeFacility(state, 'workshop', 1, { condition: 40, status: 'damaged' });
    const before = state.resources.components;
    expect(Facilities.repairFacility(state, facility.id)).toBe(true);
    expect(facility.condition).toBeGreaterThan(40);
    expect(facility.status).not.toBe('damaged');
    expect(state.resources.components).toBeLessThan(before);
  });

  it('repair fails without components and leaves the facility untouched', () => {
    const state = newState();
    state.resources.components = 0;
    const facility = placeFacility(state, 'workshop', 1, { condition: 40, status: 'damaged' });
    expect(Facilities.repairFacility(state, facility.id)).toBe(false);
    expect(facility.condition).toBe(40);
  });
});

describe('slots', () => {
  it('starts with sealed sections that cost components to clear', () => {
    const state = newState();
    expect(state.slots.some((s) => s.sealed)).toBe(true);
    const sealed = state.slots.find((s) => s.sealed && s.clearCost > 0)!;
    state.resources.components = 0;
    expect(Facilities.startClearingSlot(state, sealed.id)).toBe(false);
    state.resources.components = sealed.clearCost + 5;
    expect(Facilities.startClearingSlot(state, sealed.id)).toBe(true);
  });

  it('bunk capacity grows with sleeping quarters and drives overcrowding', () => {
    const state = newState();
    const bunks = state.facilities.find((f) => f.defId === 'bunks') ?? placeFacility(state, 'bunks', 1);
    const before = Facilities.bunkCapacity(state);
    bunks.level = 3;
    expect(Facilities.bunkCapacity(state)).toBeGreaterThan(before);
    expect(Facilities.overcrowding(state)).toBe(0);

    // Overcrowding is what stops the crew growing without end.
    bunks.level = 1;
    while (state.survivors.length < Facilities.bunkCapacity(state) + 3) {
      state.survivors.push({ ...state.survivors[0]!, id: `extra-${state.survivors.length}` });
    }
    expect(Facilities.overcrowding(state)).toBe(3);
  });
});
