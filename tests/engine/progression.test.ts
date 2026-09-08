import { describe, expect, it } from 'vitest';
import {
  BALANCE,
  Crafting,
  FACILITY_BY_ID,
  ITEM_BY_ID,
  Inventory,
  RECIPES,
  RECIPE_BY_ID,
  RESEARCH,
  RESEARCH_BY_ID,
  Research,
  Survivors,
} from '@engine';
import { newState, placeFacility, snapshot, staff, stockUp, testRng } from '../helpers';

/** A state with a staffed workshop, so crafting has somewhere to happen. */
function craftingState() {
  const state = stockUp(newState());
  const workshop = placeFacility(state, 'workshop', 3);
  staff(state, workshop, Survivors.livingSurvivors(state)[0]!);
  return state;
}

describe('crafting', () => {
  it('reports availability for every recipe without mutating anything', () => {
    const state = craftingState();
    const before = snapshot(state);
    const rows = Crafting.availableRecipes(state);
    expect(rows).toHaveLength(RECIPES.length);
    expect(snapshot(state)).toEqual(before);
  });

  it('refuses recipes whose facility does not exist', () => {
    const state = stockUp(newState());
    const recipe = RECIPES.find((r) => r.facility === 'workshop')!;
    const availability = Crafting.recipeAvailability(state, recipe);
    expect(availability.ok).toBe(false);
    expect(availability.reason).toBeTruthy();
  });

  it('refuses recipes gated behind research until it is done', () => {
    const state = craftingState();
    const gated = RECIPES.find((r) => r.requiresResearch && r.facility === 'workshop');
    if (!gated) return;
    expect(Crafting.recipeAvailability(state, gated).reason).toBe('Requires research');
    state.research.completed.push(gated.requiresResearch!);
    expect(Crafting.recipeAvailability(state, gated).reason).not.toBe('Requires research');
  });

  it('refuses recipes the stores cannot pay for', () => {
    const state = craftingState();
    for (const key of Object.keys(state.resources) as (keyof typeof state.resources)[]) {
      state.resources[key] = 0;
    }
    const recipe = RECIPES.find((r) => r.facility === 'workshop' && !r.requiresResearch)!;
    expect(Crafting.recipeAvailability(state, recipe).ok).toBe(false);
  });

  it('queueing charges the cost up front', () => {
    const state = craftingState();
    const recipe = Crafting.availableRecipes(state).find((r) => r.ok)!.recipe;
    const before = { ...state.resources };
    expect(Crafting.queueCraft(state, recipe.id).ok).toBe(true);
    expect(state.craftQueue).toHaveLength(1);
    const spent = Object.entries(recipe.cost).some(
      ([key, amount]) => (amount ?? 0) > 0 && state.resources[key as keyof typeof state.resources] < before[key as keyof typeof before],
    );
    expect(spent).toBe(true);
  });

  it('cancelling a job returns most of the materials', () => {
    const state = craftingState();
    const recipe = Crafting.availableRecipes(state).find((r) => r.ok && (r.recipe.cost.components ?? 0) > 0)!.recipe;
    Crafting.queueCraft(state, recipe.id);
    const afterQueue = state.resources.components;
    expect(Crafting.cancelCraft(state, state.craftQueue[0]!.id)).toBe(true);
    expect(state.craftQueue).toHaveLength(0);
    expect(state.resources.components).toBeGreaterThan(afterQueue);
  });

  it('progresses and eventually delivers the item into stores', () => {
    const state = craftingState();
    const recipe = Crafting.availableRecipes(state).find((r) => r.ok)!.recipe;
    Crafting.queueCraft(state, recipe.id);
    const before = Inventory.itemCount(state, recipe.itemId);

    for (let day = 0; day < 60 && state.craftQueue.length > 0; day += 1) {
      Crafting.progressCrafting(state);
    }
    expect(state.craftQueue).toHaveLength(0);
    expect(Inventory.itemCount(state, recipe.itemId)).toBe(before + recipe.yield);
  });

  it('makes no progress when nobody is working the bench', () => {
    const state = stockUp(newState());
    placeFacility(state, 'workshop', 3);
    const recipe = Crafting.availableRecipes(state).find((r) => r.ok)!.recipe;
    Crafting.queueCraft(state, recipe.id);
    const rate = Crafting.craftingRate(state, recipe);
    expect(rate.total).toBe(0);
    expect(rate.terms.length).toBeGreaterThan(0);
    Crafting.progressCrafting(state);
    expect(state.craftQueue[0]!.progress).toBe(0);
  });

  it('estimates days only when the work can actually happen', () => {
    const state = craftingState();
    for (const row of Crafting.availableRecipes(state)) {
      if (row.ok) expect(row.estimatedDays === null || row.estimatedDays > 0).toBe(true);
    }
  });
});

describe('inventory', () => {
  it('adds, counts, and removes items', () => {
    const state = newState();
    const start = Inventory.itemCount(state, 'bandage');
    Inventory.addItem(state, 'bandage', 3);
    expect(Inventory.itemCount(state, 'bandage')).toBe(start + 3);
    expect(Inventory.removeItem(state, 'bandage', 2)).toBe(true);
    expect(Inventory.itemCount(state, 'bandage')).toBe(start + 1);
    expect(Inventory.removeItem(state, 'bandage', start + 99)).toBe(false);
  });

  it('never leaves a zero-count row behind', () => {
    const state = newState();
    Inventory.addItem(state, 'test_marker_item', 1);
    Inventory.removeItem(state, 'test_marker_item', 1);
    expect(state.inventory.some((e) => e.count <= 0)).toBe(false);
  });

  it('equips into the matching slot and refuses anything else', () => {
    const state = newState();
    const survivor = Survivors.livingSurvivors(state)[0]!;
    const weapon = Object.values(ITEM_BY_ID).find((i) => i.slot === 'weapon')!;
    Inventory.addItem(state, weapon.id, 1);
    expect(Inventory.equipItem(state, survivor.id, weapon.id)).toBe(true);
    expect(survivor.equipment.weapon).toBe(weapon.id);

    const material = Object.values(ITEM_BY_ID).find((i) => !i.slot)!;
    Inventory.addItem(state, material.id, 1);
    expect(Inventory.equipItem(state, survivor.id, material.id)).toBe(false);
  });

  it('unequipping returns the item to stores', () => {
    const state = newState();
    const survivor = Survivors.livingSurvivors(state)[0]!;
    const weapon = Object.values(ITEM_BY_ID).find((i) => i.slot === 'weapon')!;
    Inventory.addItem(state, weapon.id, 1);
    Inventory.equipItem(state, survivor.id, weapon.id);
    expect(Inventory.itemCount(state, weapon.id)).toBe(0);
    expect(Inventory.unequipSlot(state, survivor.id, 'weapon')).toBe(true);
    expect(Inventory.itemCount(state, weapon.id)).toBe(1);
  });

  it('salvaging needs a workshop, then destroys the item and returns components', () => {
    const state = newState();
    const item = Object.values(ITEM_BY_ID).find((i) => i.salvage > 0)!;
    const start = Inventory.itemCount(state, item.id);
    Inventory.addItem(state, item.id, 1);
    expect(Inventory.salvageItem(state, item.id).ok).toBe(false);
    placeFacility(state, 'workshop', 1);
    const before = state.resources.components;
    const result = Inventory.salvageItem(state, item.id);
    expect(result.ok).toBe(true);
    expect(Inventory.itemCount(state, item.id)).toBe(start);
    expect(state.resources.components).toBeGreaterThan(before);
  });

  it('using a consumable removes exactly one', () => {
    const state = newState();
    const consumable = Object.values(ITEM_BY_ID).find((i) => i.consumable && i.use?.kind === 'heal')!;
    Inventory.addItem(state, consumable.id, 2);
    const survivor = Survivors.livingSurvivors(state)[0]!;
    survivor.health = 50;
    const before = Inventory.itemCount(state, consumable.id);
    const result = Inventory.consumeItem(state, consumable.id, survivor.id, 0.5);
    expect(result.ok).toBe(true);
    expect(result.message.length).toBeGreaterThan(0);
    expect(Inventory.itemCount(state, consumable.id)).toBe(before - 1);
    expect(survivor.health).toBeGreaterThan(50);
  });

  it('detects tagged gear in a pack', () => {
    const tagged = Object.values(ITEM_BY_ID).find((i) => i.tags.length > 0)!;
    expect(Inventory.hasItemWithTag([{ itemId: tagged.id, count: 1 }], tagged.tags[0]!)).toBe(true);
    expect(Inventory.hasItemWithTag([], tagged.tags[0]!)).toBe(false);
  });
});

describe('research', () => {
  /*
   * A locked node's list price is not what it costs you.
   *
   * The panel used to show a tier-3 node's own price and an estimate derived from it, which
   * reads as "one project away". The cheapest tier-3 node lists at 39 insight and costs 76
   * once its prerequisites are counted; the mean tier-3 chain is 111, against roughly 93
   * generated in a 60-day run. `chainCost` is what the panel shows for a locked node, so
   * these assertions are the ones keeping that display honest.
   */
  it('prices a locked node by its whole outstanding chain', () => {
    const state = newState();
    const node = RESEARCH_BY_ID['sur_cold_cellar']!;
    const availability = Research.researchAvailability(state, node);
    const chain = node.cost + RESEARCH_BY_ID['sur_preserving']!.cost + RESEARCH_BY_ID['sur_rationing']!.cost;
    expect(availability.cost).toBe(node.cost);
    expect(availability.chainCost).toBe(chain);
    expect(availability.chainCost).toBeGreaterThan(availability.cost);
  });

  it('charges a shared prerequisite once, not once per path', () => {
    // def_kill_box reaches def_ranged_arms down two branches, via plate armour and firearms.
    const state = newState();
    const killBox = RESEARCH_BY_ID['def_kill_box']!;
    const ids = new Set<string>();
    const walk = (id: string) => {
      if (ids.has(id)) return;
      ids.add(id);
      for (const r of RESEARCH_BY_ID[id]!.requires) walk(r);
    };
    walk(killBox.id);
    const distinct = [...ids].reduce((acc, id) => acc + RESEARCH_BY_ID[id]!.cost, 0);
    expect(Research.researchChainCost(state, killBox)).toBe(distinct);
  });

  it('drops a prerequisite from the chain once it is completed', () => {
    const state = newState();
    const node = RESEARCH_BY_ID['sur_cold_cellar']!;
    const before = Research.researchAvailability(state, node).chainCost;
    state.research.completed.push('sur_rationing');
    const after = Research.researchAvailability(state, node).chainCost;
    expect(after).toBe(before - RESEARCH_BY_ID['sur_rationing']!.cost);
  });

  it('does not charge again for work already sunk into a prerequisite', () => {
    /*
     * Otherwise the panel's all-in figure sits still while a prerequisite visibly
     * progresses, then falls by its whole price the moment it completes.
     */
    const state = newState();
    placeFacility(state, 'laboratory', 1);
    const node = RESEARCH_BY_ID['sur_cold_cellar']!;
    const full = Research.researchChainCost(state, node);
    Research.startResearch(state, 'sur_rationing');
    expect(state.research.active?.id, 'the prerequisite should be the active project').toBe('sur_rationing');
    state.research.active!.progress = 10;
    expect(Research.researchChainCost(state, node)).toBe(full - 10);
  });

  it('credits progress banked when a project was shelved', () => {
    const state = newState();
    placeFacility(state, 'laboratory', 1);
    const node = RESEARCH_BY_ID['sur_cold_cellar']!;
    const full = Research.researchChainCost(state, node);
    Research.startResearch(state, 'sur_rationing');
    state.research.active!.progress = 12;
    // Shelving preserves half the progress, and half is still paid for.
    Research.cancelResearch(state);
    expect(state.flags['research:banked:sur_rationing']).toBe(6);
    expect(Research.researchChainCost(state, node)).toBe(full - 6);
  });

  it('never prices a chain below zero when progress exceeds the list cost', () => {
    const state = newState();
    const node = RESEARCH_BY_ID['sur_preserving']!;
    state.flags['research:banked:sur_rationing'] = 9999;
    expect(Research.researchChainCost(state, node)).toBe(node.cost);
  });

  it('gates tier 2+ behind a laboratory', () => {
    const state = newState();
    const tier2 = RESEARCH.find((n) => n.tier >= 2 && n.requires.length === 0);
    if (!tier2) return;
    expect(Research.researchAvailability(state, tier2).ok).toBe(false);
  });

  /*
   * The laboratory's level summaries are the only place the game tells a player what an
   * upgrade buys, and they were wrong on both counts: they named the wrong level for each
   * research tier and quoted bonuses that did not match `labLevelBonus`, so a player
   * reading them over-invested by a level. These tie the prose to the numbers it claims.
   */
  it('unlocks each research tier at the laboratory level its summary advertises', () => {
    const levels = FACILITY_BY_ID['laboratory']!.levels;
    for (const tier of [2, 3]) {
      const node = RESEARCH.find((n) => n.tier === tier && n.requires.length === 0)
        ?? RESEARCH.find((n) => n.tier === tier)!;
      /* The lowest level at which a node of this tier stops citing the laboratory. */
      const unlockedAt = [0, 1, 2, 3].find((level) => {
        const state = newState();
        if (level > 0) placeFacility(state, 'laboratory', level);
        for (const id of node.requires) state.research.completed.push(id);
        return !Research.researchAvailability(state, node).reason?.includes('Laboratory');
      });
      expect(unlockedAt, `no laboratory level unlocks tier ${tier}`).toBeDefined();
      expect(
        levels[unlockedAt! - 1]?.summary,
        `the level-${unlockedAt} summary should be the one promising tier-${tier} research`,
      ).toContain(`tier-${tier} research`);
    }
  });

  it('quotes the insight bonus the balance table actually applies', () => {
    const levels = FACILITY_BY_ID['laboratory']!.levels;
    levels.forEach((level, index) => {
      const quoted = /([+-]\d+)% insight/.exec(level.summary ?? '');
      if (!quoted) return;
      const factor = BALANCE.research.labLevelBonus[index + 1] ?? 1;
      expect(Number(quoted[1]), `the level-${index + 1} summary quotes ${quoted[1]}%`).toBe(
        Math.round((factor - 1) * 100),
      );
    });
  });

  it('gates nodes behind their prerequisites and names them', () => {
    const state = newState();
    placeFacility(state, 'laboratory', 3);
    const node = RESEARCH.find((n) => n.requires.length > 0)!;
    const availability = Research.researchAvailability(state, node);
    expect(availability.ok).toBe(false);
    expect(availability.reason).toContain(RESEARCH_BY_ID[node.requires[0]!]!.name);
  });

  it('starts, progresses, completes, and records a node', () => {
    const state = newState();
    const lab = placeFacility(state, 'laboratory', 3);
    staff(state, lab, Survivors.livingSurvivors(state)[0]!);
    const node = Research.allResearch(state).find((r) => r.ok)!.node;

    expect(Research.startResearch(state, node.id).ok).toBe(true);
    expect(state.research.active?.id).toBe(node.id);

    const rng = testRng('research');
    for (let day = 0; day < 200 && state.research.active; day += 1) {
      Research.progressResearch(state, rng);
    }
    expect(state.research.completed).toContain(node.id);
    expect(state.stats.researchCompleted).toBeGreaterThan(0);
  });

  it('switching projects banks half the abandoned progress and restores it later', () => {
    const state = newState();
    placeFacility(state, 'laboratory', 3);
    const [first, second] = Research.allResearch(state).filter((r) => r.ok);
    if (!second) return;

    Research.startResearch(state, first!.node.id);
    state.research.active!.progress = 30;
    Research.startResearch(state, second.node.id);
    expect(state.research.active!.id).toBe(second.node.id);
    expect(state.flags[`research:banked:${first!.node.id}`]).toBe(15);

    Research.startResearch(state, first!.node.id);
    expect(state.research.active!.progress).toBe(15);
    expect(state.flags[`research:banked:${first!.node.id}`]).toBeUndefined();
  });

  it('shelving keeps half the progress', () => {
    const state = newState();
    placeFacility(state, 'laboratory', 3);
    const node = Research.allResearch(state).find((r) => r.ok)!.node;
    Research.startResearch(state, node.id);
    state.research.active!.progress = 40;
    expect(Research.cancelResearch(state)).toBe(true);
    expect(state.research.active).toBeNull();
    // Half the work is banked against that node, so resuming later is not a fresh start.
    expect(state.flags[`research:banked:${node.id}`]).toBe(20);
  });

  it('insight accrues only where somebody is thinking', () => {
    const bare = newState();
    const withLab = newState();
    const lab = placeFacility(withLab, 'laboratory', 3);
    staff(withLab, lab, Survivors.livingSurvivors(withLab)[0]!);
    expect(Research.insightRate(withLab).total).toBeGreaterThan(Research.insightRate(bare).total);
  });

  it('difficulty scales the cost of every node', () => {
    const gentle = newState({ difficultyId: 'dim' });
    const harsh = newState({ difficultyId: 'absolute' });
    const node = RESEARCH[0]!;
    expect(Research.researchCost(harsh, node)).toBeGreaterThanOrEqual(Research.researchCost(gentle, node));
  });

  it('completing a node applies its unlocks', () => {
    const state = newState();
    const unlocking = RESEARCH.find((n) => n.unlocks.length > 0)!;
    placeFacility(state, 'laboratory', 3);
    state.research.completed.push(...unlocking.requires);
    state.research.active = { id: unlocking.id, progress: 9999, required: 1, startedDay: 1 };
    Research.progressResearch(state, testRng('unlock'));
    expect(state.research.completed).toContain(unlocking.id);
  });

  it('every recipe unlocked by research points at a real recipe', () => {
    for (const node of RESEARCH) {
      for (const unlock of node.unlocks) {
        if (unlock.kind === 'recipe') expect(RECIPE_BY_ID[unlock.recipeId]).toBeDefined();
      }
    }
  });
});
