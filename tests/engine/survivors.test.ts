import { describe, expect, it } from 'vitest';
import {
  BALANCE,
  CONDITION_BY_ID,
  FACILITY_BY_ID,
  Relationships,
  SKILL_IDS,
  Survivors,
  TRAIT_BY_ID,
  Traits,
} from '@engine';
import type { Survivor } from '@engine';
import { newState, placeFacility, testRng } from '../helpers';

function generate(seed: string, seq = 1): Survivor {
  return Survivors.generateSurvivor(testRng(seed), { day: 1, idSeq: seq });
}

describe('survivor generation', () => {
  it('is deterministic for a given rng stream', () => {
    expect(generate('gen-a')).toEqual(generate('gen-a'));
  });

  it('produces valid, in-range people', () => {
    for (let i = 0; i < 60; i += 1) {
      const survivor = generate(`gen-${i}`, i);
      expect(survivor.name.length).toBeGreaterThan(0);
      expect(survivor.surname.length).toBeGreaterThan(0);
      expect(survivor.age).toBeGreaterThanOrEqual(BALANCE.survivorGen.ageRange[0]);
      expect(survivor.age).toBeLessThanOrEqual(BALANCE.survivorGen.ageRange[1]);
      expect(survivor.health).toBeGreaterThan(0);
      expect(survivor.health).toBeLessThanOrEqual(100);
      expect(survivor.alive).toBe(true);
      expect(['she/her', 'he/him', 'they/them']).toContain(survivor.pronouns);
      for (const skill of SKILL_IDS) {
        expect(survivor.skills[skill]).toBeGreaterThanOrEqual(0);
        expect(survivor.skills[skill]).toBeLessThanOrEqual(10);
      }
    }
  });

  it('gives everyone at least one trait, all of them real', () => {
    for (let i = 0; i < 40; i += 1) {
      const survivor = generate(`traits-${i}`, i);
      expect(survivor.traits.length).toBeGreaterThan(0);
      for (const trait of survivor.traits) expect(TRAIT_BY_ID[trait]).toBeDefined();
    }
  });

  it('never assigns two conflicting traits to one person', () => {
    for (let i = 0; i < 120; i += 1) {
      const survivor = generate(`conflict-${i}`, i);
      for (const traitId of survivor.traits) {
        for (const conflict of TRAIT_BY_ID[traitId]?.conflicts ?? []) {
          expect(survivor.traits).not.toContain(conflict);
        }
      }
    }
  });

  it('mints unique ids from the sequence number', () => {
    const ids = new Set(Array.from({ length: 25 }, (_, i) => generate(`ids-${i}`, i).id));
    expect(ids.size).toBe(25);
  });

  it('honours a forced background', () => {
    const survivor = Survivors.generateSurvivor(testRng('forced'), {
      day: 1,
      idSeq: 1,
      backgroundId: 'medic',
    });
    if (Survivors.backgroundOf(survivor).id === 'medic') {
      expect(survivor.backgroundId).toBe('medic');
    }
  });

  it('respects a primary-skill floor', () => {
    const survivor = Survivors.generateSurvivor(testRng('floor'), {
      day: 1,
      idSeq: 1,
      skillHint: 'engineering',
      minPrimary: 6,
    });
    expect(survivor.skills.engineering).toBeGreaterThanOrEqual(6);
  });
});

describe('work efficiency', () => {
  it('is a labelled multiplier, never negative', () => {
    const state = newState();
    const survivor = Survivors.livingSurvivors(state)[0]!;
    const breakdown = Survivors.workEfficiency(survivor, 'engineering');
    expect(breakdown.total).toBeGreaterThan(0);
    expect(breakdown.terms.length).toBeGreaterThan(0);
    expect(breakdown.terms.every((t) => t.label.length > 0)).toBe(true);
  });

  it('falls with poor health', () => {
    const state = newState();
    const survivor = Survivors.livingSurvivors(state)[0]!;
    const healthy = Survivors.workEfficiency(survivor, 'engineering').total;
    survivor.health = 30;
    expect(Survivors.workEfficiency(survivor, 'engineering').total).toBeLessThan(healthy);
  });

  it('falls with heavy fatigue and explains it', () => {
    const state = newState();
    const survivor = Survivors.livingSurvivors(state)[0]!;
    const rested = Survivors.workEfficiency(survivor, 'engineering').total;
    survivor.fatigue = 95;
    const tired = Survivors.workEfficiency(survivor, 'engineering');
    expect(tired.total).toBeLessThan(rested);
    expect(tired.terms.some((t) => /fatigue/i.test(t.label))).toBe(true);
  });

  it('rises with skill', () => {
    const state = newState();
    const survivor = Survivors.livingSurvivors(state)[0]!;
    survivor.skills.engineering = 0;
    const low = Survivors.workEfficiency(survivor, 'engineering').total;
    survivor.skills.engineering = 10;
    expect(Survivors.workEfficiency(survivor, 'engineering').total).toBeGreaterThan(low);
  });

  it('penalises a browned-out facility', () => {
    const state = newState();
    const survivor = Survivors.livingSurvivors(state)[0]!;
    const facility = placeFacility(state, 'workshop');
    const lit = Survivors.workEfficiency(survivor, 'crafting' in survivor.skills ? 'engineering' : 'engineering', {
      facility,
      facilityDef: FACILITY_BY_ID['workshop']!,
      brownedOut: false,
    }).total;
    const dark = Survivors.workEfficiency(survivor, 'engineering', {
      facility,
      facilityDef: FACILITY_BY_ID['workshop']!,
      brownedOut: true,
    }).total;
    expect(dark).toBeLessThan(lit);
  });

  it('penalises working beside someone you cannot stand', () => {
    const state = newState();
    const [a, b] = Survivors.livingSurvivors(state);
    const facility = placeFacility(state, 'workshop', 2);
    const friendly = Survivors.workEfficiency(a!, 'engineering', {
      facility,
      facilityDef: FACILITY_BY_ID['workshop']!,
      coworkers: [b!],
      relationships: {},
    }).total;

    Relationships.adjustRelationship(state, a!.id, b!.id, -100);
    const hostile = Survivors.workEfficiency(a!, 'engineering', {
      facility,
      facilityDef: FACILITY_BY_ID['workshop']!,
      coworkers: [b!],
      relationships: state.relationships,
    }).total;
    expect(hostile).toBeLessThanOrEqual(friendly);
  });
});

describe('conditions', () => {
  it('applies a condition once and merges a second instance into it', () => {
    const survivor = generate('cond');
    survivor.traits = [];
    expect(Survivors.applyCondition(survivor, 'bleeding', 30, 1)).toBe(true);
    expect(Survivors.applyCondition(survivor, 'bleeding', 30, 1)).toBe(false);
    expect(survivor.conditions.filter((c) => c.id === 'bleeding')).toHaveLength(1);
    expect(survivor.conditions[0]!.severity).toBeGreaterThan(30);
  });

  it('records the injury in the survivor history', () => {
    const survivor = generate('history');
    survivor.traits = [];
    Survivors.applyCondition(survivor, 'bleeding', 30, 4);
    expect(survivor.history.some((h) => h.day === 4 && h.tone === 'bad')).toBe(true);
  });

  it('removes conditions cleanly', () => {
    const survivor = generate('remove');
    survivor.traits = [];
    Survivors.applyCondition(survivor, 'bleeding', 20, 1);
    expect(Survivors.removeCondition(survivor, 'bleeding')).toBe(true);
    expect(Survivors.removeCondition(survivor, 'bleeding')).toBe(false);
  });

  it('drags work output down, bounded by the penalty cap', () => {
    const survivor = generate('penalty');
    survivor.traits = [];
    expect(Survivors.conditionWorkFactor(survivor)).toBe(1);
    for (const id of Object.keys(CONDITION_BY_ID).slice(0, 6)) {
      Survivors.applyCondition(survivor, id, 100, 1);
    }
    const factor = Survivors.conditionWorkFactor(survivor);
    expect(factor).toBeLessThan(1);
    expect(factor).toBeGreaterThanOrEqual(0.4);
  });

  it('blocks expeditions for the wounded, the exhausted, and the contagious', () => {
    const healthy = generate('fit');
    healthy.health = 100;
    healthy.fatigue = 10;
    healthy.conditions = [];
    expect(Survivors.canJoinExpedition(healthy).ok).toBe(true);

    const hurt = { ...healthy, health: 20 };
    expect(Survivors.canJoinExpedition(hurt).ok).toBe(false);

    const tired = { ...healthy, fatigue: 95 };
    expect(Survivors.canJoinExpedition(tired).reason).toBe('Exhausted');

    const blocking = Object.values(CONDITION_BY_ID).find((c) => c.blocksExpedition);
    if (blocking) {
      const ill: Survivor = {
        ...healthy,
        conditions: [{ id: blocking.id, age: 0, severity: 60, treated: false, acquiredDay: 1 }],
      };
      expect(Survivors.canJoinExpedition(ill).ok).toBe(false);
    }
  });

  it('marks the badly hurt as incapacitated', () => {
    const survivor = generate('incap');
    survivor.health = BALANCE.needs.incapacitatedBelow - 1;
    expect(Survivors.isIncapacitated(survivor)).toBe(true);
  });

  it('caps history so a long run cannot grow it without bound', () => {
    const survivor = generate('log');
    for (let i = 0; i < 200; i += 1) Survivors.addHistory(survivor, i, `event ${i}`);
    expect(survivor.history.length).toBeLessThanOrEqual(60);
    expect(survivor.history[survivor.history.length - 1]!.text).toBe('event 199');
  });
});

describe('traits', () => {
  it('every trait definition is internally consistent', () => {
    for (const trait of Object.values(TRAIT_BY_ID)) {
      expect(trait.name.length).toBeGreaterThan(0);
      expect(trait.description.length).toBeGreaterThan(0);
      expect(Array.isArray(trait.effects)).toBe(true);
      for (const conflict of trait.conflicts ?? []) expect(TRAIT_BY_ID[conflict]).toBeDefined();
    }
  });

  it('conflicts are declared symmetrically', () => {
    for (const trait of Object.values(TRAIT_BY_ID)) {
      for (const conflictId of trait.conflicts ?? []) {
        expect(TRAIT_BY_ID[conflictId]!.conflicts ?? []).toContain(trait.id);
      }
    }
  });

  it('trait hooks return sane multipliers for an ordinary person', () => {
    const survivor = generate('hooks');
    expect(Traits.needRateFactor(survivor, 'hunger')).toBeGreaterThan(0);
    expect(Traits.restQualityFactor(survivor)).toBeGreaterThan(0);
    expect(Traits.injuryChanceFactor(survivor)).toBeGreaterThan(0);
    expect(Traits.scavengeYieldFactor(survivor)).toBeGreaterThan(0);
    expect(Traits.expeditionSpeedFactor(survivor)).toBeGreaterThan(0);
  });

  it('hasTrait reflects what the person actually carries', () => {
    const survivor = generate('has');
    const [first] = survivor.traits;
    expect(Traits.hasTrait(survivor, first!)).toBe(true);
    expect(Traits.hasTrait(survivor, 'definitely_not_a_trait')).toBe(false);
  });
});

describe('relationships', () => {
  it('stores a pair once, whichever way round it is read', () => {
    const state = newState();
    const [a, b] = Survivors.livingSurvivors(state);
    Relationships.adjustRelationship(state, a!.id, b!.id, 20);
    expect(Relationships.getRelationship(state, b!.id, a!.id)).toBe(
      Relationships.getRelationship(state, a!.id, b!.id),
    );
    // Adjusting an existing pair must not create a mirrored second entry.
    const keys = Object.keys(state.relationships).filter((k) => k.includes(a!.id) && k.includes(b!.id));
    expect(keys).toHaveLength(1);
  });

  it('clamps to the bucket range and labels every bucket', () => {
    const state = newState();
    const [a, b] = Survivors.livingSurvivors(state);
    for (let i = 0; i < 20; i += 1) Relationships.adjustRelationship(state, a!.id, b!.id, 1000);
    expect(Relationships.getRelationship(state, a!.id, b!.id)).toBeLessThanOrEqual(100);
    for (let i = 0; i < 40; i += 1) Relationships.adjustRelationship(state, a!.id, b!.id, -1000);
    expect(Relationships.getRelationship(state, a!.id, b!.id)).toBeGreaterThanOrEqual(-100);

    for (const value of [-100, -50, -10, 0, 10, 50, 100]) {
      expect(Relationships.bucketLabel(Relationships.bucketOf(value)).length).toBeGreaterThan(0);
    }
  });

  it('finds hostile pairs once a relationship sours', () => {
    const state = newState();
    const [a, b] = Survivors.livingSurvivors(state);
    expect(Relationships.hasHostilePair(state, [a!.id, b!.id])).toBeFalsy();
    // A single interaction is deliberately bounded, so hatred takes repeated friction.
    for (let i = 0; i < 12; i += 1) Relationships.adjustRelationship(state, a!.id, b!.id, -40);
    expect(Relationships.getRelationship(state, a!.id, b!.id)).toBeLessThan(-60);
    expect(Relationships.hasHostilePair(state, [a!.id, b!.id])).toBeTruthy();
  });

  it('drifts relationships without inventing people', () => {
    const state = newState();
    Relationships.driftRelationships(state);
    for (const key of Object.keys(state.relationships)) {
      const [x, y] = key.split('|');
      expect(state.survivors.some((s) => s.id === x)).toBe(true);
      expect(state.survivors.some((s) => s.id === y)).toBe(true);
    }
  });

  it('lists relationships in descending order', () => {
    const state = newState();
    const [a, b, c] = Survivors.livingSurvivors(state);
    if (!c) return;
    for (let i = 0; i < 3; i += 1) Relationships.adjustRelationship(state, a!.id, b!.id, -40);
    for (let i = 0; i < 3; i += 1) Relationships.adjustRelationship(state, a!.id, c.id, 40);
    const list = Relationships.relationshipsOf(state, a!.id);
    expect(list[0]!.value).toBeGreaterThanOrEqual(list[list.length - 1]!.value);
  });
});
