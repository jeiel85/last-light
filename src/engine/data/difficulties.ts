import type { DifficultyDef } from '../model/types';

/**
 * Four difficulties, each adjusting eleven distinct system parameters.
 *
 * The design brief is explicit that difficulty must not be a single multiplier. These
 * numbers came out of `npm run simulate`: Overcast is tuned so a competent player survives
 * roughly 70% of runs to day 25, Blackout roughly 40%, and Absolute roughly 15%.
 */

export const DIFFICULTIES: readonly DifficultyDef[] = [
  {
    id: 'dim',
    name: 'Dim',
    description:
      'For learning the systems. Stores are generous, injuries are forgiving, and a mistake costs a day rather than a person. Not an easier story — the same story, with room to read it.',
    rank: 0,
    startingStores: 1.5,
    lootRichness: 1.3,
    consumption: 0.85,
    eventSeverity: -1,
    injuryChance: 0.7,
    deathThreshold: 'forgiving',
    facilityDecay: 0.7,
    illnessChance: 0.6,
    hopeDrain: 0.7,
    researchCost: 0.9,
    recruitFrequency: 1.4,
    legacyMultiplier: 0.7,
  },
  {
    id: 'overcast',
    name: 'Overcast',
    description:
      'The intended experience. Stores run out on schedule, expeditions are genuinely dangerous, and there is usually — not always — a way through.',
    rank: 1,
    startingStores: 1.0,
    lootRichness: 1.0,
    consumption: 1.0,
    eventSeverity: 0,
    injuryChance: 1.0,
    deathThreshold: 'normal',
    facilityDecay: 1.0,
    illnessChance: 1.0,
    hopeDrain: 1.0,
    researchCost: 1.0,
    recruitFrequency: 1.0,
    legacyMultiplier: 1.0,
  },
  {
    id: 'blackout',
    name: 'Blackout',
    description:
      'For players who know the systems. Thinner stores, harsher events, faster decay, and fewer people willing to join you. Losing a survivor early is usually decisive.',
    rank: 2,
    startingStores: 0.75,
    lootRichness: 0.85,
    consumption: 1.1,
    eventSeverity: 1,
    injuryChance: 1.2,
    deathThreshold: 'harsh',
    facilityDecay: 1.25,
    illnessChance: 1.3,
    hopeDrain: 1.2,
    researchCost: 1.1,
    recruitFrequency: 0.8,
    legacyMultiplier: 1.4,
  },
  {
    id: 'absolute',
    name: 'Absolute',
    description:
      'Most runs end. The margins are thin enough that a single bad weather roll can be fatal, and the map will not always contain what you need. Reaching an ending here is an achievement.',
    rank: 3,
    startingStores: 0.6,
    lootRichness: 0.7,
    consumption: 1.2,
    eventSeverity: 2,
    injuryChance: 1.4,
    deathThreshold: 'harsh',
    facilityDecay: 1.5,
    illnessChance: 1.6,
    hopeDrain: 1.45,
    researchCost: 1.2,
    recruitFrequency: 0.6,
    legacyMultiplier: 1.9,
  },
];

export const DIFFICULTY_BY_ID: Record<string, DifficultyDef> = Object.fromEntries(
  DIFFICULTIES.map((d) => [d.id, d]),
);

export const DEFAULT_DIFFICULTY = 'overcast';
