import type { SkillId, TraitId } from '../model/types';

/**
 * Occupational backgrounds. Each seeds a primary and secondary skill, a short biography
 * fragment used on the survivor card, and trait affinities that bias — but never force —
 * generation. The `weight` field controls how common the background is in the survivor
 * pool; specialists are rarer than generalists, which is what makes finding a doctor feel
 * like an event rather than an inevitability.
 */

export interface BackgroundDef {
  id: string;
  occupation: string;
  primary: SkillId;
  secondary: SkillId;
  /** Short second-person-neutral biography fragment. */
  bio: string;
  traitAffinity: TraitId[];
  weight: number;
}

export const BACKGROUNDS: readonly BackgroundDef[] = [
  {
    id: 'physician',
    occupation: 'Physician',
    primary: 'medicine',
    secondary: 'science',
    bio: 'Ran a district clinic. Kept working three days after the grid failed, then walked here.',
    traitAffinity: ['field_medic', 'steady_hands', 'exhausted'],
    weight: 5,
  },
  {
    id: 'paramedic',
    occupation: 'Paramedic',
    primary: 'medicine',
    secondary: 'combat',
    bio: 'Nine years on ambulances. Very calm, in a way that unsettles people.',
    traitAffinity: ['field_medic', 'unflappable', 'insomniac'],
    weight: 7,
  },
  {
    id: 'nurse',
    occupation: 'Nurse',
    primary: 'medicine',
    secondary: 'negotiation',
    bio: 'Night shift, geriatric ward. Has seen more people die than anyone else here.',
    traitAffinity: ['field_medic', 'optimist', 'night_owl'],
    weight: 8,
  },
  {
    id: 'mechanic',
    occupation: 'Mechanic',
    primary: 'engineering',
    secondary: 'scavenging',
    bio: 'Fixed haulage trucks. Believes anything can be made to run one more time.',
    traitAffinity: ['tinkerer', 'improviser', 'stubborn'],
    weight: 10,
  },
  {
    id: 'electrician',
    occupation: 'Electrician',
    primary: 'engineering',
    secondary: 'science',
    bio: 'Industrial installations. Knew the substation layout before anyone thought it mattered.',
    traitAffinity: ['tinkerer', 'methodical', 'claustrophobic'],
    weight: 9,
  },
  {
    id: 'structural_engineer',
    occupation: 'Structural Engineer',
    primary: 'engineering',
    secondary: 'science',
    bio: 'Surveyed bridges. Reads a ceiling the way other people read a face.',
    traitAffinity: ['methodical', 'cautious', 'pessimist'],
    weight: 5,
  },
  {
    id: 'soldier',
    occupation: 'Soldier',
    primary: 'combat',
    secondary: 'engineering',
    bio: 'Two tours, then a warehouse job. Does not talk about either.',
    traitAffinity: ['hardened', 'guardian', 'haunted'],
    weight: 7,
  },
  {
    id: 'police_officer',
    occupation: 'Police Officer',
    primary: 'combat',
    secondary: 'negotiation',
    bio: 'Beat patrol. Still says "sir" and "ma\'am" to people who are about to rob them.',
    traitAffinity: ['authoritative', 'guardian', 'rigid'],
    weight: 6,
  },
  {
    id: 'hunter',
    occupation: 'Hunter',
    primary: 'combat',
    secondary: 'scavenging',
    bio: 'Culled deer for the forestry board. Comfortable being alone and cold.',
    traitAffinity: ['sharp_eyed', 'loner', 'iron_stomach'],
    weight: 6,
  },
  {
    id: 'scavenger',
    occupation: 'Scavenger',
    primary: 'scavenging',
    secondary: 'combat',
    bio: 'Was doing this before the Quiet, under a different word for it.',
    traitAffinity: ['hoarder', 'sharp_eyed', 'light_fingered'],
    weight: 9,
  },
  {
    id: 'courier',
    occupation: 'Courier',
    primary: 'scavenging',
    secondary: 'negotiation',
    bio: 'Knew every alley in the district by bicycle. Still fast.',
    traitAffinity: ['fleet_footed', 'sharp_eyed', 'restless'],
    weight: 8,
  },
  {
    id: 'chef',
    occupation: 'Chef',
    primary: 'cooking',
    secondary: 'negotiation',
    bio: 'Ran a twenty-cover kitchen. Can make almost anything edible, and knows it.',
    traitAffinity: ['quartermaster', 'optimist', 'proud'],
    weight: 7,
  },
  {
    id: 'farmer',
    occupation: 'Farmer',
    primary: 'botany',
    secondary: 'cooking',
    bio: 'Twelve hectares of barley, all of it presumably still standing and useless.',
    traitAffinity: ['green_thumb', 'stubborn', 'early_riser'],
    weight: 7,
  },
  {
    id: 'botanist',
    occupation: 'Botanist',
    primary: 'botany',
    secondary: 'science',
    bio: 'Studied blight resistance. Has theories about what the Quiet did to the topsoil.',
    traitAffinity: ['green_thumb', 'curious', 'frail'],
    weight: 4,
  },
  {
    id: 'researcher',
    occupation: 'Researcher',
    primary: 'science',
    secondary: 'engineering',
    bio: 'Materials lab. Took notes throughout the collapse and has not stopped.',
    traitAffinity: ['curious', 'methodical', 'obsessive'],
    weight: 5,
  },
  {
    id: 'radio_operator',
    occupation: 'Radio Operator',
    primary: 'science',
    secondary: 'negotiation',
    bio: 'Amateur bands, forty years. Was listening when the tone started.',
    traitAffinity: ['insomniac', 'curious', 'haunted'],
    weight: 5,
  },
  {
    id: 'teacher',
    occupation: 'Teacher',
    primary: 'negotiation',
    secondary: 'medicine',
    bio: 'Secondary school, sciences. Still corrects people, gently.',
    traitAffinity: ['optimist', 'beloved', 'soft_hearted'],
    weight: 8,
  },
  {
    id: 'social_worker',
    occupation: 'Social Worker',
    primary: 'negotiation',
    secondary: 'medicine',
    bio: 'Case files full of people who needed more than existed. Used to that.',
    traitAffinity: ['peacemaker', 'soft_hearted', 'burned_out'],
    weight: 6,
  },
  {
    id: 'lawyer',
    occupation: 'Lawyer',
    primary: 'negotiation',
    secondary: 'science',
    bio: 'Contracts. Reads every agreement here as though it will be enforced.',
    traitAffinity: ['authoritative', 'proud', 'cold'],
    weight: 4,
  },
  {
    id: 'miner',
    occupation: 'Miner',
    primary: 'engineering',
    secondary: 'combat',
    bio: 'Deep shaft work. The only person here who finds the vault comforting.',
    traitAffinity: ['tough', 'stubborn', 'dust_lung'],
    weight: 5,
  },
  {
    id: 'chemist',
    occupation: 'Chemist',
    primary: 'science',
    secondary: 'medicine',
    bio: 'Water treatment plant. Knows exactly how bad the aquifer is.',
    traitAffinity: ['methodical', 'curious', 'cautious'],
    weight: 5,
  },
  {
    id: 'quartermaster',
    occupation: 'Quartermaster',
    primary: 'scavenging',
    secondary: 'cooking',
    bio: 'Ran a depot inventory. Cannot stop counting things.',
    traitAffinity: ['quartermaster', 'hoarder', 'rigid'],
    weight: 5,
  },
  {
    id: 'student',
    occupation: 'Student',
    primary: 'science',
    secondary: 'scavenging',
    bio: 'Halfway through a degree that will never be finished. Learns fast.',
    traitAffinity: ['fast_learner', 'restless', 'frail'],
    weight: 7,
  },
  {
    id: 'labourer',
    occupation: 'Labourer',
    primary: 'engineering',
    secondary: 'cooking',
    bio: 'Site work, mostly demolition. Uncomplaining to a fault.',
    traitAffinity: ['tough', 'stubborn', 'illiterate_tech'],
    weight: 9,
  },
  {
    id: 'priest',
    occupation: 'Chaplain',
    primary: 'negotiation',
    secondary: 'medicine',
    bio: 'Has stopped offering explanations and started offering time.',
    traitAffinity: ['beloved', 'peacemaker', 'haunted'],
    weight: 4,
  },
  {
    id: 'driver',
    occupation: 'Driver',
    primary: 'scavenging',
    secondary: 'engineering',
    bio: 'Long-haul. Claims to know a road out that is still passable.',
    traitAffinity: ['restless', 'improviser', 'optimist'],
    weight: 6,
  },
];

export const BACKGROUND_BY_ID: Record<string, BackgroundDef> = Object.fromEntries(
  BACKGROUNDS.map((b) => [b.id, b]),
);
