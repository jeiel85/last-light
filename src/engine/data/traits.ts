import type { TraitDef, TraitId } from '../model/types';

/**
 * Traits.
 *
 * Every trait declares its effects as data consumed by `systems/traits.ts`, so no system
 * contains `if (trait === 'x')` branches. Positive traits have positive `cost`; flaws have
 * negative cost and act as a generation budget refund, which is what produces survivors
 * who are genuinely good at something *and* genuinely a problem.
 */

export const TRAITS: readonly TraitDef[] = [
  /* ------------------------------------------------------------------ physical */
  {
    id: 'tough',
    name: 'Tough',
    description: 'Takes a beating and gets up. Injuries land lighter.',
    category: 'physical',
    cost: 2,
    conflicts: ['frail'],
    effects: [
      { kind: 'injurySeverity', factor: 0.75 },
      { kind: 'needRate', need: 'health', factor: 1.2 },
    ],
  },
  {
    id: 'frail',
    name: 'Frail',
    description: 'Something never healed right. Wounds go deeper and heal slower.',
    category: 'flaw',
    cost: -2,
    conflicts: ['tough'],
    effects: [
      { kind: 'injurySeverity', factor: 1.35 },
      { kind: 'needRate', need: 'health', factor: 0.7 },
    ],
  },
  {
    id: 'iron_stomach',
    name: 'Iron Stomach',
    description: 'Eats anything without consequence. Half rations do not dent their mood.',
    category: 'physical',
    cost: 2,
    effects: [
      { kind: 'foodTolerance', factor: 0.55 },
      { kind: 'immunity', condition: 'food_poisoning' },
    ],
  },
  {
    id: 'fleet_footed',
    name: 'Fleet-Footed',
    description: 'Fast over broken ground. Expeditions with them move quicker.',
    category: 'physical',
    cost: 2,
    effects: [
      { kind: 'expeditionSpeed', factor: 1.2 },
      { kind: 'retreatChance', delta: -0.1 },
    ],
  },
  {
    id: 'sharp_eyed',
    name: 'Sharp-Eyed',
    description: 'Notices the hatch behind the shelving. Finds more, and finds trouble sooner.',
    category: 'physical',
    cost: 3,
    effects: [
      { kind: 'scavengeYield', factor: 1.22 },
      { kind: 'injuryChance', factor: 0.9 },
    ],
  },
  {
    id: 'steady_hands',
    name: 'Steady Hands',
    description: 'Does fine work under pressure. Treatment and crafting both benefit.',
    category: 'physical',
    cost: 3,
    skillMods: { medicine: 1 },
    effects: [
      { kind: 'treatmentQuality', factor: 1.25 },
      { kind: 'workMultiplier', facility: 'workshop', factor: 1.15 },
    ],
  },
  {
    id: 'dust_lung',
    name: 'Dust Lung',
    description: 'Years of particulate. Coughs at night, tires early, and the vault air does not help.',
    category: 'flaw',
    cost: -2,
    effects: [
      { kind: 'needRate', need: 'fatigue', factor: 1.25 },
      { kind: 'illnessChance', factor: 1.35 },
    ],
  },
  {
    id: 'early_riser',
    name: 'Early Riser',
    description: 'Up before the lights. Gets more out of a day shift.',
    category: 'physical',
    cost: 2,
    conflicts: ['night_owl'],
    effects: [{ kind: 'shiftBonus', shift: 'day', factor: 1.15 }],
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Comes alive after dark. Poor mornings, excellent nights.',
    category: 'physical',
    cost: 1,
    conflicts: ['early_riser'],
    effects: [
      { kind: 'shiftBonus', shift: 'night', factor: 1.2 },
      { kind: 'shiftBonus', shift: 'day', factor: 0.9 },
    ],
  },
  {
    id: 'insomniac',
    name: 'Insomniac',
    description: 'Sleeps badly and works anyway. Rest does less, and it accumulates.',
    category: 'flaw',
    cost: -1,
    effects: [
      { kind: 'restQuality', factor: 0.6 },
      { kind: 'stressPerDay', amount: 1.4 },
      { kind: 'shiftBonus', shift: 'night', factor: 1.1 },
    ],
  },

  /* -------------------------------------------------------------------- mental */
  {
    id: 'optimist',
    name: 'Optimist',
    description: 'Keeps everyone in the room a little further from the edge.',
    category: 'mental',
    cost: 3,
    conflicts: ['pessimist'],
    effects: [
      { kind: 'moraleAura', radius: 'facility', amount: 2.2 },
      { kind: 'needRate', need: 'morale', factor: 1.15 },
    ],
  },
  {
    id: 'pessimist',
    name: 'Pessimist',
    description: 'Says the quiet part. It is usually correct, which is the problem.',
    category: 'flaw',
    cost: -2,
    conflicts: ['optimist'],
    effects: [
      { kind: 'moraleAura', radius: 'facility', amount: -1.6 },
      { kind: 'needRate', need: 'morale', factor: 0.85 },
    ],
  },
  {
    id: 'unflappable',
    name: 'Unflappable',
    description: 'Emergencies do not register as emergencies. Very useful; slightly alarming.',
    category: 'mental',
    cost: 3,
    conflicts: ['coward'],
    effects: [
      { kind: 'needRate', need: 'morale', factor: 1.3 },
      { kind: 'retreatChance', delta: -0.15 },
    ],
  },
  {
    id: 'coward',
    name: 'Coward',
    description: 'Runs. Has always run. Survives more expeditions than most, and costs them.',
    category: 'flaw',
    cost: -2,
    conflicts: ['guardian', 'unflappable'],
    effects: [
      { kind: 'retreatChance', delta: 0.35 },
      { kind: 'combatPower', delta: -2 },
    ],
  },
  {
    id: 'haunted',
    name: 'Haunted',
    description: 'Carries something from before. Works fine until it surfaces.',
    category: 'flaw',
    cost: -2,
    effects: [
      { kind: 'stressPerDay', amount: 1.8 },
      { kind: 'eventWeight', tag: 'psychological', factor: 2.0 },
    ],
  },
  {
    id: 'curious',
    name: 'Curious',
    description: 'Opens the door. Reads the file. Occasionally regrets it.',
    category: 'mental',
    cost: 2,
    effects: [
      { kind: 'researchRate', factor: 1.15 },
      { kind: 'eventWeight', tag: 'lore', factor: 1.8 },
    ],
  },
  {
    id: 'methodical',
    name: 'Methodical',
    description: 'Slower to start, far less likely to be wrong.',
    category: 'mental',
    cost: 2,
    effects: [
      { kind: 'workMultiplier', facility: 'laboratory', factor: 1.2 },
      { kind: 'injuryChance', factor: 0.82 },
    ],
  },
  {
    id: 'improviser',
    name: 'Improviser',
    description: 'Makes the wrong part work. The repair holds, mostly.',
    category: 'mental',
    cost: 3,
    effects: [
      { kind: 'craftCostChance', chance: 0.18 },
      { kind: 'workMultiplier', facility: 'workshop', factor: 1.12 },
    ],
  },
  {
    id: 'fast_learner',
    name: 'Fast Learner',
    description: 'Picks up whatever the vault needs next.',
    category: 'mental',
    cost: 3,
    effects: [{ kind: 'researchRate', factor: 1.1 }],
  },
  {
    id: 'obsessive',
    name: 'Obsessive',
    description: 'Finishes the task past the point of usefulness. Forgets to eat.',
    category: 'flaw',
    cost: -1,
    effects: [
      { kind: 'needRate', need: 'hunger', factor: 1.2 },
      { kind: 'workMultiplier', factor: 1.08 },
      { kind: 'stressPerDay', amount: 0.8 },
    ],
  },
  {
    id: 'cautious',
    name: 'Cautious',
    description: 'Takes the long way. Fewer wounds, thinner hauls.',
    category: 'mental',
    cost: 1,
    conflicts: ['reckless'],
    effects: [
      { kind: 'injuryChance', factor: 0.7 },
      { kind: 'scavengeYield', factor: 0.9 },
    ],
  },
  {
    id: 'reckless',
    name: 'Reckless',
    description: 'Goes deeper than agreed. Comes back with more, or comes back wrong.',
    category: 'flaw',
    cost: -1,
    conflicts: ['cautious'],
    effects: [
      { kind: 'injuryChance', factor: 1.4 },
      { kind: 'scavengeYield', factor: 1.25 },
    ],
  },
  {
    id: 'burned_out',
    name: 'Burned Out',
    description: 'Gave everything to a job that no longer exists. Recovers slowly.',
    category: 'flaw',
    cost: -2,
    effects: [
      { kind: 'restQuality', factor: 0.75 },
      { kind: 'needRate', need: 'morale', factor: 0.8 },
    ],
  },
  {
    id: 'stubborn',
    name: 'Stubborn',
    description: 'Will not be moved. Excellent at holding a line, bad at changing plans.',
    category: 'mental',
    cost: 1,
    effects: [
      { kind: 'needRate', need: 'morale', factor: 1.12 },
      { kind: 'relationshipDrift', direction: 'negative', factor: 1.2 },
    ],
  },
  {
    id: 'hardened',
    name: 'Hardened',
    description: 'Has already lost people. It does not land the same way any more.',
    category: 'mental',
    cost: 2,
    conflicts: ['soft_hearted'],
    effects: [
      { kind: 'needRate', need: 'morale', factor: 1.25 },
      { kind: 'moraleAura', radius: 'facility', amount: -0.6 },
    ],
  },
  {
    id: 'broken',
    name: 'Broken',
    description: 'Something gave way and has not come back. Present, but barely.',
    category: 'flaw',
    cost: -3,
    effects: [
      { kind: 'workMultiplier', factor: 0.75 },
      { kind: 'needRate', need: 'morale', factor: 0.65 },
      { kind: 'moraleAura', radius: 'facility', amount: -1.2 },
    ],
  },

  /* -------------------------------------------------------------------- social */
  {
    id: 'beloved',
    name: 'Beloved',
    description: 'Everyone likes them. Losing them would be much worse than losing anyone else.',
    category: 'social',
    cost: 2,
    effects: [
      { kind: 'moraleAura', radius: 'base', amount: 1.1 },
      { kind: 'hopeOnDeath', delta: -8 },
      { kind: 'relationshipDrift', direction: 'positive', factor: 1.35 },
    ],
  },
  {
    id: 'peacemaker',
    name: 'Peacemaker',
    description: 'Defuses arguments before they become incidents.',
    category: 'social',
    cost: 3,
    conflicts: ['grudge_keeper'],
    skillMods: { negotiation: 1 },
    effects: [
      { kind: 'relationshipDrift', direction: 'negative', factor: 0.6 },
      { kind: 'eventWeight', tag: 'conflict', factor: 0.6 },
    ],
  },
  {
    id: 'grudge_keeper',
    name: 'Grudge-Keeper',
    description: 'Remembers exactly who said what, on which day, and in what tone.',
    category: 'flaw',
    cost: -2,
    conflicts: ['peacemaker'],
    effects: [
      { kind: 'relationshipDrift', direction: 'negative', factor: 2.0 },
      { kind: 'eventWeight', tag: 'conflict', factor: 1.6 },
    ],
  },
  {
    id: 'authoritative',
    name: 'Authoritative',
    description: 'People do what they say. Not everyone enjoys that.',
    category: 'social',
    cost: 2,
    effects: [
      { kind: 'workMultiplier', factor: 1.06 },
      { kind: 'moraleAura', radius: 'base', amount: 0.5 },
      { kind: 'relationshipDrift', direction: 'negative', factor: 1.15 },
    ],
  },
  {
    id: 'loner',
    name: 'Loner',
    description: 'Better alone. Actively worse in a crowded room.',
    category: 'flaw',
    cost: -1,
    effects: [
      { kind: 'relationshipDrift', direction: 'positive', factor: 0.5 },
      { kind: 'workMultiplier', factor: 1.1 },
    ],
  },
  {
    id: 'soft_hearted',
    name: 'Soft-Hearted',
    description: 'Cannot turn anyone away. This has already cost them everything once.',
    category: 'flaw',
    cost: -1,
    conflicts: ['cold', 'hardened'],
    effects: [
      { kind: 'needRate', need: 'morale', factor: 0.85 },
      { kind: 'moraleAura', radius: 'facility', amount: 1.0 },
      { kind: 'eventWeight', tag: 'stranger', factor: 1.5 },
    ],
  },
  {
    id: 'cold',
    name: 'Cold',
    description: 'Makes the arithmetic decision without visible difficulty.',
    category: 'social',
    cost: 1,
    conflicts: ['soft_hearted'],
    effects: [
      { kind: 'needRate', need: 'morale', factor: 1.2 },
      { kind: 'moraleAura', radius: 'facility', amount: -0.9 },
    ],
  },
  {
    id: 'proud',
    name: 'Proud',
    description: 'Does not accept help gracefully, or criticism at all.',
    category: 'flaw',
    cost: -1,
    effects: [
      { kind: 'relationshipDrift', direction: 'negative', factor: 1.3 },
      { kind: 'workMultiplier', factor: 1.05 },
    ],
  },
  {
    id: 'guardian',
    name: 'Guardian',
    description: 'Puts themselves between other people and the thing. Every time.',
    category: 'social',
    cost: 3,
    conflicts: ['coward'],
    effects: [
      { kind: 'guardian', chance: 0.55 },
      { kind: 'combatPower', delta: 1 },
    ],
  },
  {
    id: 'rigid',
    name: 'Rigid',
    description: 'The rules are the rules, especially when they no longer make sense.',
    category: 'flaw',
    cost: -1,
    effects: [
      { kind: 'eventWeight', tag: 'moral', factor: 1.4 },
      { kind: 'relationshipDrift', direction: 'negative', factor: 1.2 },
    ],
  },
  {
    id: 'light_fingered',
    name: 'Light-Fingered',
    description: 'Takes a little off the top. Nobody has proved it yet.',
    category: 'flaw',
    cost: -2,
    effects: [
      { kind: 'scavengeYield', factor: 1.15 },
      { kind: 'eventWeight', tag: 'theft', factor: 2.5 },
    ],
  },

  /* ------------------------------------------------------------------ vocational */
  {
    id: 'field_medic',
    name: 'Field Medic',
    description: 'Treats efficiently under bad conditions, and with less supply.',
    category: 'skill',
    cost: 4,
    skillMods: { medicine: 2 },
    effects: [
      { kind: 'treatmentQuality', factor: 1.3 },
      { kind: 'treatmentCost', delta: -1 },
    ],
  },
  {
    id: 'tinkerer',
    name: 'Tinkerer',
    description: 'Sometimes finishes a build without spending the parts you set aside.',
    category: 'skill',
    cost: 3,
    skillMods: { engineering: 1 },
    effects: [
      { kind: 'craftCostChance', chance: 0.15 },
      { kind: 'workMultiplier', facility: 'workshop', factor: 1.12 },
    ],
  },
  {
    id: 'green_thumb',
    name: 'Green Thumb',
    description: 'Coaxes yield out of dead trays. Hydroponics runs noticeably better.',
    category: 'skill',
    cost: 3,
    skillMods: { botany: 2 },
    effects: [
      { kind: 'workMultiplier', facility: 'hydroponics', factor: 1.32 },
      { kind: 'eventWeight', tag: 'agriculture', factor: 1.6 },
    ],
  },
  {
    id: 'quartermaster',
    name: 'Quartermaster',
    description: 'Packs better than anyone. Expeditions carry more and waste less.',
    category: 'skill',
    cost: 3,
    effects: [
      { kind: 'packCapacity', delta: 5 },
      { kind: 'foodTolerance', factor: 0.85 },
    ],
  },
  {
    id: 'hoarder',
    name: 'Hoarder',
    description: 'Brings back more, and will not let any of it go.',
    category: 'flaw',
    cost: -1,
    effects: [
      { kind: 'scavengeYield', factor: 1.12 },
      { kind: 'eventWeight', tag: 'charity', factor: 0.4 },
    ],
  },
  {
    id: 'claustrophobic',
    name: 'Claustrophobic',
    description: 'The vault presses in. Needs to see sky occasionally or it gets worse.',
    category: 'flaw',
    cost: -2,
    effects: [{ kind: 'requiresFacility', facility: 'surface_access', moralePerDay: -1.6 }],
  },
  {
    id: 'restless',
    name: 'Restless',
    description: 'Cannot be idle. Rest days barely help and morale suffers on them.',
    category: 'flaw',
    cost: -1,
    effects: [
      { kind: 'restQuality', factor: 0.7 },
      { kind: 'workMultiplier', factor: 1.08 },
    ],
  },
  {
    id: 'illiterate_tech',
    name: 'Uneasy With Machines',
    description: 'Excellent hands, no instinct for electronics. Avoid the laboratory.',
    category: 'flaw',
    cost: -1,
    effects: [
      { kind: 'workMultiplier', facility: 'laboratory', factor: 0.65 },
      { kind: 'workMultiplier', facility: 'radio_room', factor: 0.7 },
    ],
  },
  {
    id: 'exhausted',
    name: 'Exhausted',
    description: 'Arrived already running on nothing. Starts the run tired.',
    category: 'flaw',
    cost: -1,
    effects: [{ kind: 'needRate', need: 'fatigue', factor: 1.2 }],
  },

  /* ------------------------------------------------- unlockable (meta-progression) */
  {
    id: 'radio_ear',
    name: 'Radio Ear',
    description: 'Hears structure in static. Signal work goes far faster.',
    category: 'skill',
    cost: 3,
    requiresUnlock: 'trait_radio_ear',
    skillMods: { science: 1 },
    effects: [
      { kind: 'workMultiplier', facility: 'radio_room', factor: 1.4 },
      { kind: 'eventWeight', tag: 'radio', factor: 1.8 },
    ],
  },
  {
    id: 'survivalist',
    name: 'Survivalist',
    description: 'Prepared for exactly this, and is quietly a little pleased about it.',
    category: 'skill',
    cost: 4,
    requiresUnlock: 'trait_survivalist',
    skillMods: { scavenging: 1, combat: 1 },
    effects: [
      { kind: 'foodTolerance', factor: 0.8 },
      { kind: 'scavengeYield', factor: 1.15 },
      { kind: 'injuryChance', factor: 0.88 },
    ],
  },
  {
    id: 'field_surgeon',
    name: 'Field Surgeon',
    description: 'Has cut people open on a floor before. Can hold back a death.',
    category: 'skill',
    cost: 5,
    requiresUnlock: 'trait_field_surgeon',
    skillMods: { medicine: 3 },
    effects: [
      { kind: 'treatmentQuality', factor: 1.5 },
      { kind: 'guardian', chance: 0.2 },
    ],
  },
  {
    id: 'quiet_touched',
    name: 'Quiet-Touched',
    description: 'Was outside when it happened. Dreams in a frequency, and sometimes it is right.',
    category: 'mental',
    cost: 2,
    requiresUnlock: 'trait_quiet_touched',
    effects: [
      { kind: 'eventWeight', tag: 'listeners', factor: 3.0 },
      { kind: 'eventWeight', tag: 'lore', factor: 1.6 },
      { kind: 'stressPerDay', amount: 1.0 },
    ],
  },
  {
    id: 'forager',
    name: 'Forager',
    description: 'Knows which of it is edible. The city yields food it should not.',
    category: 'skill',
    cost: 3,
    requiresUnlock: 'trait_forager',
    skillMods: { botany: 1, scavenging: 1 },
    effects: [
      { kind: 'scavengeYield', factor: 1.1 },
      { kind: 'eventWeight', tag: 'agriculture', factor: 1.4 },
    ],
  },
];

export const TRAIT_BY_ID: Record<TraitId, TraitDef> = Object.fromEntries(
  TRAITS.map((t) => [t.id, t]),
);

/** Traits available without any meta-progression unlock. */
export const BASE_TRAIT_POOL: readonly TraitDef[] = TRAITS.filter((t) => !t.requiresUnlock);

export function traitName(id: TraitId): string {
  return TRAIT_BY_ID[id]?.name ?? id;
}
