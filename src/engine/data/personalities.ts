/**
 * Personality archetypes.
 *
 * Personality is deliberately *lighter* than traits: it never changes a formula directly.
 * It biases relationship drift, decides how a survivor is quoted in event text, and gates
 * a handful of social events. That keeps the mechanical surface small while making crews
 * feel different from one another.
 */

export interface PersonalityDef {
  id: string;
  name: string;
  description: string;
  /** Multiplier on positive relationship drift. */
  warmth: number;
  /** Multiplier on negative relationship drift. */
  friction: number;
  /** Morale drift bias per day. */
  resilience: number;
  /** Voice sample used when this survivor is quoted in events. */
  voice: string[];
}

export const PERSONALITIES: readonly PersonalityDef[] = [
  {
    id: 'steady',
    name: 'Steady',
    description: 'Hard to rattle, hard to excite. Says what needs saying and stops.',
    warmth: 1.0,
    friction: 0.8,
    resilience: 0.12,
    voice: ['"It holds or it does not. We will know by morning."', '"Give me the list."'],
  },
  {
    id: 'bright',
    name: 'Bright',
    description: 'Finds the joke. Sometimes the joke is not welcome.',
    warmth: 1.3,
    friction: 1.0,
    resilience: 0.18,
    voice: ['"Worse ways to spend a Tuesday."', '"We are still here. That is the whole speech."'],
  },
  {
    id: 'severe',
    name: 'Severe',
    description: 'Holds everyone to a standard, starting with themselves.',
    warmth: 0.7,
    friction: 1.35,
    resilience: 0.05,
    voice: ['"That was avoidable."', '"I will do it properly or not at all."'],
  },
  {
    id: 'gentle',
    name: 'Gentle',
    description: 'Takes on other people\'s weight without being asked.',
    warmth: 1.4,
    friction: 0.7,
    resilience: -0.05,
    voice: ['"Sit down. I will finish it."', '"You do not have to explain."'],
  },
  {
    id: 'guarded',
    name: 'Guarded',
    description: 'Watches. Decides slowly. Rarely revises.',
    warmth: 0.75,
    friction: 1.0,
    resilience: 0.1,
    voice: ['"I would rather see it first."', '"Not yet."'],
  },
  {
    id: 'restless',
    name: 'Restless',
    description: 'Cannot sit in the dark and think. Needs a task.',
    warmth: 1.05,
    friction: 1.15,
    resilience: -0.02,
    voice: ['"Put me on something."', '"Waiting is the part that kills people."'],
  },
  {
    id: 'wry',
    name: 'Wry',
    description: 'Deflects everything, right up until they do not.',
    warmth: 1.15,
    friction: 0.95,
    resilience: 0.08,
    voice: ['"Ah. Excellent. More of that."', '"Do not ask me to be inspiring."'],
  },
  {
    id: 'devout',
    name: 'Devout',
    description: 'Believes this means something. Will not argue about what.',
    warmth: 1.2,
    friction: 0.85,
    resilience: 0.2,
    voice: ['"We were not brought this far to stop."', '"I will sit with them tonight."'],
  },
  {
    id: 'blunt',
    name: 'Blunt',
    description: 'Says the true thing at the worst moment.',
    warmth: 0.85,
    friction: 1.4,
    resilience: 0.1,
    voice: ['"That plan gets someone killed."', '"Say it plainly or do not say it."'],
  },
  {
    id: 'anxious',
    name: 'Anxious',
    description: 'Runs every scenario, including the ones that will not happen.',
    warmth: 1.0,
    friction: 1.1,
    resilience: -0.14,
    voice: ['"What if the seep runs dry?"', '"I counted it three times."'],
  },
  {
    id: 'dry',
    name: 'Dry',
    description: 'Efficient to the point of appearing cold. Is not, quite.',
    warmth: 0.8,
    friction: 0.9,
    resilience: 0.14,
    voice: ['"Noted."', '"It will take four days. Not three."'],
  },
  {
    id: 'fierce',
    name: 'Fierce',
    description: 'Protective in a way that is occasionally a problem.',
    warmth: 1.25,
    friction: 1.3,
    resilience: 0.06,
    voice: ['"Nobody touches them."', '"I will go. Do not argue."'],
  },
];

export const PERSONALITY_BY_ID: Record<string, PersonalityDef> = Object.fromEntries(
  PERSONALITIES.map((p) => [p.id, p]),
);
