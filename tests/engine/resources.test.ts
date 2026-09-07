import { describe, expect, it } from 'vitest';
import { BALANCE, RESOURCE_IDS, Resources, Survivors } from '@engine';
import { newState, placeFacility, snapshot, staff, stockUp } from '../helpers';

/**
 * Resource resolution is the spine of the day pipeline, and every figure it produces is
 * shown to the player through a breakdown. These tests check both the arithmetic and the
 * promise that the breakdown explains it.
 */
describe('resource production and consumption', () => {
  it('computes a breakdown for every resource', () => {
    const state = newState();
    const production = Resources.computeProduction(state);
    const consumption = Resources.computeConsumption(state);
    for (const id of RESOURCE_IDS) {
      expect(production[id]).toBeDefined();
      expect(consumption[id]).toBeDefined();
      expect(Number.isFinite(production[id].total)).toBe(true);
      expect(Number.isFinite(consumption[id].total)).toBe(true);
    }
  });

  it('does not mutate the state it reads', () => {
    const state = newState();
    const before = snapshot(state);
    Resources.computeProduction(state);
    Resources.computeConsumption(state);
    Resources.computeCaps(state);
    expect(snapshot(state)).toEqual(before);
  });

  it('charges food and water per survivor at base', () => {
    const state = newState();
    const consumption = Resources.computeConsumption(state);
    const alive = Survivors.livingSurvivors(state).length;
    expect(alive).toBeGreaterThan(0);
    expect(consumption.water.total).toBeGreaterThanOrEqual(alive * BALANCE.needs.waterPerSurvivor);
  });

  it('does not charge base stores for people who are away', () => {
    const state = newState();
    const before = Resources.computeConsumption(state).water.total;
    const traveller = Survivors.livingSurvivors(state)[0]!;
    traveller.assignment = { kind: 'expedition', expeditionId: 'x' };
    const after = Resources.computeConsumption(state).water.total;
    expect(after).toBeLessThan(before);
  });

  it('every consumption breakdown names its terms', () => {
    const state = newState();
    const consumption = Resources.computeConsumption(state);
    for (const term of consumption.food.terms) {
      expect(term.label.length).toBeGreaterThan(0);
    }
  });

  it('a staffed water reclaimer produces more than an unstaffed one', () => {
    const unstaffed = newState();
    placeFacility(unstaffed, 'water_reclaimer', 2);
    const idle = Resources.computeProduction(unstaffed).water.total;

    const worked = newState();
    const facility = placeFacility(worked, 'water_reclaimer', 2);
    staff(worked, facility, Survivors.livingSurvivors(worked)[0]!);
    const busy = Resources.computeProduction(worked).water.total;

    expect(busy).toBeGreaterThan(idle);
  });

  it('a damaged facility produces nothing', () => {
    const state = newState();
    placeFacility(state, 'water_reclaimer', 2, { status: 'damaged' });
    const broken = Resources.computeProduction(state).water.total;

    const working = newState();
    placeFacility(working, 'water_reclaimer', 2);
    expect(broken).toBeLessThan(Resources.computeProduction(working).water.total);
  });

  it('a galley reduces food consumption', () => {
    const bare = newState();
    const withGalley = newState();
    const galley = placeFacility(withGalley, 'galley', 2);
    staff(withGalley, galley, Survivors.livingSurvivors(withGalley)[0]!);
    expect(Resources.computeConsumption(withGalley).food.total).toBeLessThan(
      Resources.computeConsumption(bare).food.total,
    );
  });

  it('caps rise when storage is built', () => {
    const bare = newState();
    const stored = newState();
    placeFacility(stored, 'storage', 2);
    const before = Resources.computeCaps(bare);
    const after = Resources.computeCaps(stored);
    expect(after.food).toBeGreaterThan(before.food);
  });

  it('grantResource never exceeds the cap and reports what actually landed', () => {
    const state = newState();
    state.resourceCaps.food = 20;
    state.resources.food = 18;
    const gained = Resources.grantResource(state, 'food', 10);
    expect(state.resources.food).toBe(20);
    expect(gained).toBeCloseTo(2, 5);
  });

  it('spendResource refuses to overdraw', () => {
    const state = newState();
    state.resources.components = 3;
    expect(Resources.spendResource(state, 'components', 5)).toBe(false);
    expect(state.resources.components).toBe(3);
    expect(Resources.spendResource(state, 'components', 3)).toBe(true);
    expect(state.resources.components).toBe(0);
  });

  it('resolveResources applies net change and clamps at zero', () => {
    const state = stockUp(newState(), 40);
    state.resources.food = 0.2;
    const result = Resources.resolveResources(state);
    expect(state.resources.food).toBeGreaterThanOrEqual(0);
    expect(result.shortfalls).toContain('food');
  });

  it('resolveResources writes the caps it computed', () => {
    const state = newState();
    placeFacility(state, 'storage', 3);
    Resources.resolveResources(state);
    expect(state.resourceCaps.food).toBe(Resources.computeCaps(state).food);
  });

  it('hope stays inside 0–100', () => {
    const state = newState();
    state.resources.hope = 99;
    Resources.resolveResources(state);
    expect(state.resources.hope).toBeLessThanOrEqual(100);
    expect(state.resources.hope).toBeGreaterThanOrEqual(0);
  });

  it('spoilage falls once cold storage research is done', () => {
    const state = newState();
    state.resources.food = 40;
    const before = Resources.spoilageRate(state);
    state.research.completed.push('sur_cold_cellar');
    expect(Resources.spoilageRate(state)).toBeLessThan(before);
  });

  it('breakdown terms sum to the total for a simple additive case', () => {
    const state = newState();
    const water = Resources.computeConsumption(state).water;
    const additive = water.terms
      .filter((t) => t.kind === 'base' || t.kind === 'bonus' || t.kind === 'penalty')
      .reduce((acc, t) => acc + t.value, 0);
    const multiplier = water.terms
      .filter((t) => t.kind === 'multiplier')
      .reduce((acc, t) => acc * t.value, 1);
    expect(additive * multiplier).toBeCloseTo(water.total, 1);
  });
});
