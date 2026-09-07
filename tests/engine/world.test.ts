import { describe, expect, it } from 'vitest';
import {
  ARCHETYPE_BY_ID,
  Combat,
  Expedition,
  ITEM_BY_ID,
  LOCATION_ARCHETYPES,
  Survivors,
  World,
} from '@engine';
import type { LocationInstance, Survivor } from '@engine';
import { newState, placeFacility, snapshot, stockUp, testRng } from '../helpers';

describe('world generation', () => {
  it('is deterministic for a seed', () => {
    expect(World.generateWorld(testRng('world'), 1)).toEqual(World.generateWorld(testRng('world'), 1));
  });

  it('differs between seeds', () => {
    const a = World.generateWorld(testRng('world-a'), 1);
    const b = World.generateWorld(testRng('world-b'), 1);
    expect(a.map((l) => l.name)).not.toEqual(b.map((l) => l.name));
  });

  it('places locations across all three rings with unique ids', () => {
    const world = World.generateWorld(testRng('rings'), 1);
    expect(world.length).toBeGreaterThan(8);
    expect(new Set(world.map((l) => l.id)).size).toBe(world.length);
    for (const ring of [0, 1, 2]) {
      expect(world.some((l) => l.ring === ring)).toBe(true);
    }
  });

  it('keeps every location inside its declared bounds', () => {
    const world = World.generateWorld(testRng('bounds'), 1);
    for (const location of world) {
      expect(ARCHETYPE_BY_ID[location.archetypeId]).toBeDefined();
      expect(location.danger).toBeGreaterThanOrEqual(1);
      expect(location.danger).toBeLessThanOrEqual(10);
      expect(location.richness).toBeGreaterThan(0);
      expect(location.radius).toBeGreaterThan(0);
      expect(location.radius).toBeLessThanOrEqual(1);
      expect(location.distanceKm).toBeGreaterThan(0);
      expect(ARCHETYPE_BY_ID[location.archetypeId]!.rings).toContain(location.ring);
    }
  });

  it('names are unique so the map never reads as a duplicate', () => {
    const world = World.generateWorld(testRng('names'), 1);
    expect(new Set(world.map((l) => l.name)).size).toBe(world.length);
  });

  it('respects the per-archetype instance limit', () => {
    const world = World.generateWorld(testRng('limits'), 1);
    for (const archetype of LOCATION_ARCHETYPES) {
      const used = world.filter((l) => l.archetypeId === archetype.id).length;
      expect(used).toBeLessThanOrEqual(archetype.maxInstances);
    }
  });

  it('starts the player with a couple of known nearby sites', () => {
    const state = newState();
    expect(state.world.locations.some((l) => l.state !== 'unknown')).toBe(true);
  });

  it('scales richness with the difficulty multiplier', () => {
    const lean = World.generateWorld(testRng('rich'), 0.5);
    const fat = World.generateWorld(testRng('rich'), 1.5);
    const leanTotal = lean.reduce((a, l) => a + l.richness, 0);
    expect(fat.reduce((a, l) => a + l.richness, 0)).toBeGreaterThan(leanTotal);
  });
});

describe('world access and knowledge', () => {
  it('opens ring 1 on foot after the first couple of days', () => {
    const state = newState();
    state.day = 1;
    const early = World.unlockedRing(state);
    state.day = 5;
    expect(World.unlockedRing(state)).toBeGreaterThanOrEqual(early);
    expect(World.unlockedRing(state)).toBeGreaterThanOrEqual(1);
  });

  it('surface access shortens travel to the near ring', () => {
    const state = newState();
    state.day = 5;
    const location = state.world.locations.find((l) => l.ring === 1)!;
    const onFoot = World.travelDaysFor(state, location);
    placeFacility(state, 'surface_access', 1);
    expect(World.travelDaysFor(state, location)).toBeLessThanOrEqual(onFoot);
  });

  it('only offers reachable, non-collapsed sites', () => {
    const state = newState();
    state.day = 5;
    for (const location of World.reachableLocations(state)) {
      expect(location.ring).toBeLessThanOrEqual(World.unlockedRing(state));
      expect(location.state).not.toBe('unknown');
      expect(location.state).not.toBe('collapsed');
    }
  });

  it('scouting raises knowledge one step at a time and then stops', () => {
    const state = newState();
    const location = state.world.locations[0]!;
    location.knowledge = 0;
    let raised = 0;
    for (let i = 0; i < 10; i += 1) if (World.scoutLocation(state, location.id)) raised += 1;
    expect(raised).toBeGreaterThan(0);
    expect(location.knowledge).toBeLessThanOrEqual(4);
    expect(World.scoutLocation(state, location.id)).toBe(false);
  });

  it('knowledge gates what the inspector is allowed to say', () => {
    const location = { knowledge: 0 } as LocationInstance;
    expect(World.knowledgeOf(location).danger).toBe(false);
    expect(World.knowledgeOf({ ...location, knowledge: 4 }).occupancy).toBe(true);
  });

  it('revealing surfaces unknown sites, preferring the near ring', () => {
    const state = newState();
    for (const location of state.world.locations) {
      location.state = 'unknown';
      location.knowledge = 0;
    }
    const revealed = World.revealLocations(state, testRng('reveal'), 3);
    expect(revealed.length).toBeGreaterThan(0);
    for (const location of revealed) expect(location.state).not.toBe('unknown');
  });

  it('visiting a site depletes it and makes it more dangerous', () => {
    const state = newState();
    const location = state.world.locations[0]!;
    const richness = location.richness;
    const danger = location.danger;
    World.depleteLocation(state, location);
    expect(location.visits).toBe(1);
    expect(location.richness).toBeLessThan(richness);
    expect(location.danger).toBeGreaterThanOrEqual(danger);
  });

  it('loot rolls stay inside the archetype table', () => {
    const state = newState();
    const location = state.world.locations[0]!;
    const archetype = World.archetypeOf(location);
    const loot = World.rollLoot(testRng('loot'), archetype, location, 4, 1);
    for (const entry of Object.keys(loot.resources)) {
      expect(archetype.loot.some((l) => l.resource === entry)).toBe(true);
    }
    for (const item of loot.items) expect(ITEM_BY_ID[item.itemId]).toBeDefined();
  });

  it('expected haul is a preview, not a mutation', () => {
    const state = newState();
    const location = state.world.locations[0]!;
    const before = snapshot(location);
    World.expectedHaul(World.archetypeOf(location), location, 4);
    expect(snapshot(location)).toEqual(before);
  });
});

function fighters(state: ReturnType<typeof newState>): Survivor[] {
  return Survivors.livingSurvivors(state).slice(0, 2);
}

describe('combat', () => {
  it('team power is a legible breakdown that rises with skill and gear', () => {
    const state = newState();
    const members = fighters(state);
    for (const member of members) member.skills.combat = 1;
    const weak = Combat.computeTeamPower({
      members,
      pack: [],
      ammo: 0,
      danger: 5,
      threatScale: 1,
      preparation: 0,
      enemy: 'a hostile group',
    });
    for (const member of members) member.skills.combat = 9;
    const weapon = Object.values(ITEM_BY_ID).find((i) => (i.power ?? 0) > 0)!;
    const strong = Combat.computeTeamPower({
      members,
      pack: [{ itemId: weapon.id, count: 2 }],
      ammo: 20,
      danger: 5,
      threatScale: 1,
      preparation: 0,
      enemy: 'a hostile group',
    });
    expect(strong.total).toBeGreaterThan(weak.total);
    expect(strong.terms.length).toBeGreaterThan(0);
  });

  it('threat rises with danger and again at night', () => {
    const base = { members: [], pack: [], ammo: 0, threatScale: 1, preparation: 0, enemy: 'x' };
    const low = Combat.computeThreat({ ...base, danger: 1 });
    const high = Combat.computeThreat({ ...base, danger: 9 });
    expect(high).toBeGreaterThan(low);
    expect(Combat.computeThreat({ ...base, danger: 5, night: true })).toBeGreaterThan(
      Combat.computeThreat({ ...base, danger: 5 }),
    );
  });

  it('a strong team beats a weak threat and a weak team does not', () => {
    const state = newState();
    const members = fighters(state);
    for (const member of members) {
      member.skills.combat = 10;
      member.health = 100;
      member.traits = [];
    }
    const win = Combat.resolveCombat(testRng('win'), {
      members,
      pack: [],
      ammo: 10,
      danger: 1,
      threatScale: 0.4,
      preparation: 4,
      enemy: 'a stray dog',
    });
    expect(['rout', 'clean']).toContain(win.outcome);
    expect(win.mortal).toHaveLength(0);

    for (const member of members) member.skills.combat = 0;
    const lose = Combat.resolveCombat(testRng('lose'), {
      members,
      pack: [],
      ammo: 0,
      danger: 10,
      threatScale: 3,
      preparation: 0,
      enemy: 'something worse',
    });
    expect(['disaster', 'repulsed', 'costly']).toContain(lose.outcome);
  });

  it('never spends more ammunition than the pack carries', () => {
    const state = newState();
    const gun = Object.values(ITEM_BY_ID).find((i) => (i.ammoPerFight ?? 0) > 0);
    if (!gun) return;
    const result = Combat.resolveCombat(testRng('ammo'), {
      members: fighters(state),
      pack: [{ itemId: gun.id, count: 4 }],
      ammo: 2,
      danger: 5,
      threatScale: 1,
      preparation: 0,
      enemy: 'raiders',
    });
    expect(result.ammoSpent).toBeLessThanOrEqual(2);
  });

  it('always produces readable text and a bounded margin', () => {
    const state = newState();
    for (let i = 0; i < 40; i += 1) {
      const result = Combat.resolveCombat(testRng(`combat-${i}`), {
        members: fighters(state),
        pack: [],
        ammo: 5,
        danger: (i % 10) + 1,
        threatScale: 1,
        preparation: i % 4,
        enemy: 'raiders',
      });
      expect(result.text.length).toBeGreaterThan(0);
      expect(Number.isFinite(result.margin)).toBe(true);
      for (const wound of result.wounded) {
        expect(state.survivors.some((s) => s.id === wound.survivorId)).toBe(true);
      }
    }
  });

  it('base defence reflects what has been built', () => {
    const bare = newState();
    const fortified = newState();
    placeFacility(fortified, 'security', 3);
    expect(Combat.baseDefence(fortified).total).toBeGreaterThan(Combat.baseDefence(bare).total);
  });
});

describe('expedition forecast', () => {
  function ready() {
    const state = stockUp(newState());
    state.day = 6;
    return state;
  }

  it('previews risk without changing anything', () => {
    const state = ready();
    const location = World.reachableLocations(state)[0]!;
    const before = snapshot(state);
    Expedition.expeditionForecast(state, location, [Survivors.livingSurvivors(state)[0]!.id], Expedition.emptyLoadout());
    expect(snapshot(state)).toEqual(before);
  });

  it('reports risks as fractions with labelled terms', () => {
    const state = ready();
    const location = World.reachableLocations(state)[0]!;
    const forecast = Expedition.expeditionForecast(
      state,
      location,
      Survivors.livingSurvivors(state).map((s) => s.id),
      Expedition.emptyLoadout(),
    );
    expect(forecast.injuryRisk.total).toBeGreaterThanOrEqual(0);
    expect(forecast.injuryRisk.total).toBeLessThanOrEqual(1);
    expect(forecast.deathRisk.total).toBeGreaterThanOrEqual(0);
    expect(forecast.deathRisk.total).toBeLessThanOrEqual(1);
    expect(forecast.deathRisk.terms.length).toBeGreaterThan(0);
    expect(forecast.carryCapacity.total).toBeGreaterThan(0);
  });

  it('warns about an unarmed team and about missing supplies', () => {
    const state = ready();
    const location = World.reachableLocations(state).sort((a, b) => b.danger - a.danger)[0]!;
    const forecast = Expedition.expeditionForecast(
      state,
      location,
      [Survivors.livingSurvivors(state)[0]!.id],
      Expedition.emptyLoadout(),
    );
    expect(forecast.warnings.length).toBeGreaterThan(0);
    expect(forecast.rationsNeeded).toBeGreaterThan(0);
  });

  it('a bigger, better-armed team lowers the death risk', () => {
    const state = ready();
    const location = World.reachableLocations(state).sort((a, b) => b.danger - a.danger)[0]!;
    const solo = Expedition.expeditionForecast(
      state,
      location,
      [Survivors.livingSurvivors(state)[0]!.id],
      Expedition.emptyLoadout(),
    );
    const weapon = Object.values(ITEM_BY_ID).find((i) => (i.power ?? 0) > 0)!;
    const party = Expedition.expeditionForecast(state, location, Survivors.livingSurvivors(state).map((s) => s.id), {
      ...Expedition.emptyLoadout(),
      items: [{ itemId: weapon.id, count: 3 }],
      ammo: 10,
    });
    expect(party.deathRisk.total).toBeLessThanOrEqual(solo.deathRisk.total);
  });

  it('pack capacity grows with the team and the weight of the load is measured', () => {
    const state = ready();
    const crew = Survivors.livingSurvivors(state);
    const one = Expedition.packCapacity(state, [crew[0]!]);
    expect(Expedition.packCapacity(state, crew)).toBeGreaterThan(one);
    expect(Expedition.loadoutWeight({ ...Expedition.emptyLoadout(), rations: 10 })).toBeGreaterThan(0);
  });
});
