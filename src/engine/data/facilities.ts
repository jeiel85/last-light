import type { FacilityDef, FacilityId } from '../model/types';

/**
 * Vault Meridian's facilities.
 *
 * Each level triple escalates cost, power draw, and output. Costs were tuned from the
 * headless simulator so that a competent player can reach two level-2 facilities by around
 * day 10 on Overcast, and cannot reach level 3 anywhere before roughly day 18 without
 * either an unusually rich map roll or a deliberate specialisation.
 */

export const FACILITIES: readonly FacilityDef[] = [
  {
    id: 'reactor',
    name: 'Reactor Stub',
    role: 'power',
    description:
      'A truncated arm of the district plant, left behind when the vault was sealed. It burns fuel and hums. Everything else here depends on it.',
    decks: [0],
    skill: 'engineering',
    unique: true,
    decayPerDay: 0.7,
    icon: 'reactor',
    levels: [
      {
        buildCost: { components: 0 },
        labour: 0,
        powerDraw: 0,
        staffSlots: 1,
        summary: '14 kW capacity. Burns 1.1 fuel per day.',
      },
      {
        buildCost: { components: 30, fuel: 6 },
        labour: 40,
        powerDraw: 0,
        staffSlots: 1,
        summary: '22 kW capacity. Burns 1.6 fuel per day.',
      },
      {
        buildCost: { components: 62, fuel: 14 },
        labour: 78,
        powerDraw: 0,
        staffSlots: 2,
        summary: '30 kW capacity. Burns 2.1 fuel per day.',
      },
    ],
  },
  {
    id: 'water_reclaimer',
    name: 'Water Reclaimer',
    role: 'water',
    description:
      'Draws from the aquifer seep in the sub-level and pushes it through three stages of filtration. The third stage has never worked.',
    decks: [0, 1],
    skill: 'engineering',
    unique: true,
    decayPerDay: 0.8,
    icon: 'water',
    levels: [
      {
        buildCost: { components: 16 },
        labour: 22,
        powerDraw: 3,
        staffSlots: 1,
        summary: 'Produces 8 water per day with a staffer.',
      },
      {
        buildCost: { components: 30, fuel: 4 },
        labour: 44,
        powerDraw: 5,
        staffSlots: 1,
        summary: 'Produces 11 water per day. Halves dysentery risk.',
      },
      {
        buildCost: { components: 54, fuel: 10 },
        labour: 80,
        powerDraw: 9,
        staffSlots: 2,
        summary: 'Produces 16 water per day. Water is clean enough to stop illness entirely.',
      },
    ],
  },
  {
    id: 'galley',
    name: 'Galley',
    role: 'food',
    description:
      'Two induction rings, a scavenged pressure cooker, and a whiteboard where someone keeps writing menus for food that does not exist.',
    decks: [0, 1],
    skill: 'cooking',
    unique: true,
    decayPerDay: 0.9,
    icon: 'galley',
    levels: [
      {
        buildCost: { components: 12 },
        labour: 18,
        powerDraw: 2,
        staffSlots: 1,
        summary: 'Stretches rations: +22% food efficiency. Halves spoilage.',
      },
      {
        buildCost: { components: 26, fuel: 2 },
        labour: 38,
        powerDraw: 3,
        staffSlots: 1,
        summary: '+36% food efficiency. Cooked meals give +1.5 morale per survivor.',
      },
      {
        buildCost: { components: 46, medicine: 4 },
        labour: 70,
        powerDraw: 6,
        staffSlots: 2,
        summary: '+50% food efficiency. +3 morale per survivor. Preserves surplus.',
      },
    ],
  },
  {
    id: 'infirmary',
    name: 'Infirmary',
    role: 'medical',
    description:
      'A store room with a examination couch bolted to the floor and a cabinet that is emptier every week.',
    decks: [0, 1],
    skill: 'medicine',
    unique: true,
    decayPerDay: 0.8,
    icon: 'infirmary',
    levels: [
      {
        buildCost: { components: 18, medicine: 2 },
        labour: 26,
        powerDraw: 3,
        staffSlots: 1,
        summary: 'Enables treatment. +3 health recovery per day for patients.',
      },
      {
        buildCost: { components: 34, medicine: 6 },
        labour: 50,
        powerDraw: 5,
        staffSlots: 1,
        summary: '+40% treatment speed. Illness cannot spread while staffed.',
      },
      {
        buildCost: { components: 58, medicine: 12 },
        labour: 86,
        powerDraw: 7,
        staffSlots: 2,
        summary: '+80% treatment speed. Enables surgery on otherwise fatal wounds.',
      },
    ],
  },
  {
    id: 'workshop',
    name: 'Workshop',
    role: 'industry',
    description:
      'Bench, vice, and a wall of hand tools with two gaps where someone took what they needed and left.',
    decks: [0, 1, 2],
    skill: 'engineering',
    unique: true,
    decayPerDay: 1.2,
    icon: 'workshop',
    levels: [
      {
        buildCost: { components: 14 },
        labour: 20,
        powerDraw: 4,
        staffSlots: 2,
        summary: 'Tier-1 crafting and repairs. +25% construction labour. Sorts 1.2 components/day.',
      },
      {
        buildCost: { components: 32, fuel: 4 },
        labour: 48,
        powerDraw: 6,
        staffSlots: 2,
        summary: 'Tier-2 crafting. +50% labour. Sorts 2.1 components/day. Salvage +30%.',
      },
      {
        buildCost: { components: 56, fuel: 10 },
        labour: 84,
        powerDraw: 10,
        staffSlots: 3,
        summary: 'Tier-2 crafting at double speed. +80% labour. Sorts 3.1 components/day.',
      },
    ],
  },
  {
    id: 'bunks',
    name: 'Bunks',
    role: 'rest',
    description:
      'Fold-down frames from the original stores. Someone has written names on masking tape above each one.',
    decks: [0, 1, 2],
    skill: 'negotiation',
    unique: true,
    decayPerDay: 0.4,
    icon: 'bunks',
    levels: [
      {
        buildCost: { components: 8 },
        labour: 12,
        powerDraw: 1,
        staffSlots: 0,
        summary: 'Rest restores 14 additional fatigue. Sleeps 5.',
      },
      {
        buildCost: { components: 20 },
        labour: 30,
        powerDraw: 1,
        staffSlots: 0,
        summary: 'Rest restores 20 additional fatigue. Sleeps 9. +1 morale floor.',
      },
      {
        buildCost: { components: 38, fuel: 6 },
        labour: 56,
        powerDraw: 3,
        staffSlots: 0,
        summary: 'Rest restores 26 additional fatigue. Sleeps 14. +3 morale floor.',
      },
    ],
  },
  {
    id: 'storage',
    name: 'Storage',
    role: 'storage',
    description:
      'Racking, crates, and a padlock that everyone has a key to because pretending otherwise caused a fight.',
    decks: [0, 1, 2],
    skill: 'scavenging',
    unique: true,
    decayPerDay: 0.3,
    icon: 'storage',
    levels: [
      {
        buildCost: { components: 10 },
        labour: 14,
        powerDraw: 1,
        staffSlots: 0,
        summary: '+40 capacity to every stored resource. Spoilage −20%.',
      },
      {
        buildCost: { components: 24 },
        labour: 34,
        powerDraw: 2,
        staffSlots: 0,
        summary: '+80 capacity. Spoilage −40%.',
      },
      {
        buildCost: { components: 44, fuel: 4 },
        labour: 60,
        powerDraw: 4,
        staffSlots: 1,
        summary: '+130 capacity. Spoilage −65%. Enables bulk trade events.',
      },
    ],
  },
  {
    id: 'radio_room',
    name: 'Radio Room',
    role: 'comms',
    description:
      'A transceiver, a bank of dead repeaters, and a logbook of frequencies with most entries crossed out.',
    decks: [1, 2],
    skill: 'science',
    unique: true,
    decayPerDay: 0.9,
    icon: 'radio',
    levels: [
      {
        buildCost: { components: 22, fuel: 2 },
        labour: 30,
        powerDraw: 4,
        staffSlots: 1,
        summary: 'Reveals tomorrow\'s weather. Scans for distant sites. Opens contact events.',
      },
      {
        buildCost: { components: 40, fuel: 6 },
        labour: 56,
        powerDraw: 6,
        staffSlots: 1,
        summary: 'Reveals two sites per scan. Doubles trade and stranger events.',
      },
      {
        buildCost: { components: 66, fuel: 14 },
        labour: 92,
        powerDraw: 9,
        staffSlots: 2,
        summary: 'Can triangulate the Signal. Required for the Listener chain.',
      },
    ],
  },
  {
    id: 'laboratory',
    name: 'Laboratory',
    role: 'science',
    description:
      'Two benches, a microscope with a cracked stage, and a whiteboard nobody is allowed to wipe.',
    decks: [1, 2],
    skill: 'science',
    unique: true,
    decayPerDay: 1.0,
    icon: 'lab',
    levels: [
      {
        buildCost: { components: 22, fuel: 2 },
        labour: 32,
        powerDraw: 6,
        staffSlots: 2,
        summary: 'Generates research insight. Required for most research.',
      },
      {
        buildCost: { components: 46, fuel: 8 },
        labour: 62,
        powerDraw: 8,
        staffSlots: 2,
        summary: '+45% insight. Unlocks tier-2 research.',
      },
      {
        buildCost: { components: 74, fuel: 16, medicine: 6 },
        labour: 100,
        powerDraw: 12,
        staffSlots: 3,
        summary: '+90% insight. Unlocks tier-3 research and sample analysis.',
      },
    ],
  },
  {
    id: 'hydroponics',
    name: 'Hydroponics',
    role: 'food',
    description:
      'Stacked trays under grow lamps, running on nutrient solution someone is mixing from memory.',
    decks: [1, 2],
    skill: 'botany',
    unique: true,
    decayPerDay: 1.0,
    icon: 'hydroponics',
    levels: [
      {
        buildCost: { components: 28, water: 8 },
        labour: 40,
        powerDraw: 4,
        staffSlots: 2,
        summary: 'Produces 7 food per day. Consumes 2 water per day.',
      },
      {
        buildCost: { components: 48, water: 14 },
        labour: 66,
        powerDraw: 7,
        staffSlots: 2,
        summary: 'Produces 12 food per day. Consumes 3 water.',
      },
      {
        buildCost: { components: 76, water: 24, medicine: 4 },
        labour: 104,
        powerDraw: 12,
        staffSlots: 3,
        summary: 'Produces 18 food per day. Consumes 4 water. Enables Deep Root.',
      },
    ],
  },
  {
    id: 'security',
    name: 'Security Post',
    role: 'defence',
    description:
      'The old guard station, with a rack for whatever passes as arms and a monitor showing four dead cameras.',
    decks: [0, 1],
    skill: 'combat',
    unique: true,
    decayPerDay: 0.7,
    icon: 'security',
    levels: [
      {
        buildCost: { components: 18 },
        labour: 26,
        powerDraw: 2,
        staffSlots: 1,
        summary: 'Base defence 8. Reduces theft and raid severity.',
      },
      {
        buildCost: { components: 36, ammo: 10 },
        labour: 48,
        powerDraw: 4,
        staffSlots: 1,
        summary: 'Base defence 16. Raids can be repelled without casualties.',
      },
      {
        buildCost: { components: 60, ammo: 24 },
        labour: 82,
        powerDraw: 6,
        staffSlots: 2,
        summary: 'Base defence 28. Deters most raids before they begin.',
      },
    ],
  },
  {
    id: 'surface_access',
    name: 'Surface Access',
    role: 'access',
    description:
      'The service stair, re-shored and fitted with a lock that works from the inside only.',
    decks: [0, 1],
    skill: 'engineering',
    unique: true,
    decayPerDay: 0.5,
    icon: 'access',
    levels: [
      {
        buildCost: { components: 20 },
        labour: 30,
        powerDraw: 2,
        staffSlots: 0,
        summary: 'Opens Ring 1. −1 travel day on Ring 1. Eases claustrophobia.',
      },
      {
        buildCost: { components: 38, fuel: 8 },
        labour: 54,
        powerDraw: 2,
        staffSlots: 0,
        summary: 'Opens Ring 2. Expedition packs carry +4.',
      },
      {
        buildCost: { components: 62, fuel: 20 },
        labour: 88,
        powerDraw: 5,
        staffSlots: 1,
        summary: 'Vehicle bay: −1 travel day everywhere. Required for the convoy.',
      },
    ],
  },
  {
    id: 'machine_shop',
    name: 'Machine Shop',
    role: 'industry',
    description:
      'A lathe, a press, and a diesel compressor that has to be started by hand and hated by everyone.',
    decks: [2],
    skill: 'engineering',
    unique: true,
    requiresResearch: 'eng_machining',
    decayPerDay: 1.3,
    icon: 'machine',
    levels: [
      {
        buildCost: { components: 44, fuel: 8 },
        labour: 60,
        powerDraw: 6,
        staffSlots: 2,
        summary: 'Tier-3 crafting. Refines 2 scrap into 3 components per day.',
      },
      {
        buildCost: { components: 68, fuel: 16 },
        labour: 90,
        powerDraw: 9,
        staffSlots: 2,
        summary: 'Refining doubled. Facility repairs cost 40% less.',
      },
      {
        buildCost: { components: 96, fuel: 28, medicine: 6 },
        labour: 130,
        powerDraw: 13,
        staffSlots: 3,
        summary: 'Enables the convoy project. Refining tripled.',
      },
    ],
  },
  {
    id: 'deep_archive',
    name: 'Deep Archive',
    role: 'archive',
    description:
      'Behind the sub-level bulkhead: rows of sealed cabinets, a reader that still powers up, and a door that was locked from this side.',
    decks: [2],
    skill: 'science',
    unique: true,
    requiresResearch: 'com_archive_access',
    decayPerDay: 0.6,
    icon: 'archive',
    levels: [
      {
        buildCost: { components: 40, fuel: 6 },
        labour: 56,
        powerDraw: 4,
        staffSlots: 1,
        summary: 'Recovers one archive fragment every 3 days. Opens the Meridian chain.',
      },
      {
        buildCost: { components: 64, fuel: 12 },
        labour: 84,
        powerDraw: 6,
        staffSlots: 1,
        summary: 'One fragment every 2 days. +25% research insight.',
      },
      {
        buildCost: { components: 92, fuel: 22, medicine: 8 },
        labour: 120,
        powerDraw: 9,
        staffSlots: 2,
        summary: 'One fragment per day. Required for the Meridian ending.',
      },
    ],
  },
];

export const FACILITY_BY_ID: Record<FacilityId, FacilityDef> = Object.fromEntries(
  FACILITIES.map((f) => [f.id, f]),
);

export function facilityName(id: FacilityId): string {
  return FACILITY_BY_ID[id]?.name ?? id;
}
