import type { EventDef } from '../../model/types';

/**
 * The opening days.
 *
 * The design brief forbids a tutorial modal, so the first week teaches through events that
 * are indistinguishable from ordinary play: each one puts a system in front of the player
 * at the moment it becomes relevant, and each has a real cost attached so it never reads as
 * a tutorial. They are `once` and day-gated, so a second run does not repeat them all.
 */

export const ONBOARDING_EVENTS: readonly EventDef[] = [
  {
    id: 'onb.the_manifest',
    title: 'The Stores Office',
    body: 'There is a manifest on a clipboard by the door. It lists the provisioning standard for this facility: forty persons, nine years. The racking behind it holds six days of food.',
    tags: ['onboarding', 'lore'],
    phase: 'dusk',
    weight: 900,
    cooldown: 999,
    once: true,
    requires: { kind: 'day', max: 2 },
    choices: [
      {
        id: 'count_it',
        label: 'Count what is actually here',
        hint: 'Establishes exactly how long you have.',
        effects: [
          { kind: 'lore', loreId: 'note_vault_manifest' },
          { kind: 'resource', resource: 'food', amount: 3 },
          { kind: 'resource', resource: 'hope', amount: -3 },
        ],
        resultText: 'Six days, and three tins that had rolled behind the racking. Everybody now knows the number.',
        tone: 'neutral',
      },
      {
        id: 'do_not_count',
        label: 'Do not count it in front of everyone',
        effects: [
          { kind: 'resource', resource: 'hope', amount: 3 },
          { kind: 'flag', flag: 'social.kept_a_secret', increment: 1 },
        ],
        resultText: 'You take the clipboard and do the arithmetic alone, later, twice.',
        tone: 'neutral',
      },
      {
        id: 'read_manifest',
        label: 'Ask why a shelter for forty was emptied',
        effects: [
          { kind: 'lore', loreId: 'note_vault_manifest' },
          { kind: 'lore', loreId: 'note_first_night' },
          { kind: 'flag', flag: 'meridian.suspicious' },
          { kind: 'research', researchId: 'com_archive_access', insight: 4 },
        ],
        resultText: 'Nobody has an answer. The question goes on the whiteboard and stays there.',
        tone: 'neutral',
      },
    ],
  },
  {
    id: 'onb.the_first_job',
    title: 'Somebody Has to Decide',
    body: 'Four of you, one reactor that needs watching, a seep that needs pumping, and about nine other things. Everybody is waiting to be told what to do.',
    tags: ['onboarding', 'social'],
    phase: 'dusk',
    weight: 900,
    cooldown: 999,
    once: true,
    requires: { kind: 'day', min: 2, max: 3 },
    choices: [
      {
        id: 'water_first',
        label: 'Water first — everything else can wait a day',
        hint: 'Assign someone to the Water Reclaimer in the Crew panel.',
        effects: [
          { kind: 'resource', resource: 'water', amount: 6 },
          { kind: 'need', target: 'all', need: 'morale', amount: 3 },
          { kind: 'flag', flag: 'onboarding.water_first' },
        ],
        resultText: 'The reclaimer gets a full day of attention and produces more than it has since you arrived.',
        tone: 'good',
      },
      {
        id: 'build_first',
        label: 'Build first — the vault is barely a vault',
        hint: 'Anyone left Idle contributes labour to construction.',
        effects: [
          { kind: 'resource', resource: 'components', amount: 8 },
          { kind: 'need', target: 'all', need: 'fatigue', amount: 8 },
          { kind: 'flag', flag: 'onboarding.build_first' },
        ],
        resultText: 'Racking, a bench, and a door that closes properly. It costs a day and it is a day well spent.',
        tone: 'good',
      },
      {
        id: 'look_outside',
        label: 'Look outside — you need to know what is out there',
        hint: 'Opens two nearby sites on the map.',
        effects: [
          { kind: 'revealLocation', count: 2, ring: 0 },
          { kind: 'need', target: 'random', need: 'fatigue', amount: 12 },
          { kind: 'flag', flag: 'onboarding.scout_first' },
        ],
        resultText: 'Two hours on the surface and two buildings on the district sheet that are worth going into.',
        tone: 'good',
      },
    ],
  },
  {
    id: 'onb.the_first_expedition',
    title: 'The Stair Head',
    body: 'The service stair is re-shored and the door works. Whatever happens next, it starts by somebody going up it.',
    tags: ['onboarding', 'expedition'],
    phase: 'dusk',
    weight: 900,
    cooldown: 999,
    once: true,
    requires: { kind: 'day', min: 3, max: 5 },
    choices: [
      {
        id: 'send_two',
        label: 'Send two, properly equipped',
        hint: 'Plan expeditions from the Map panel. Pack rations for the days you will be away.',
        effects: [
          { kind: 'item', itemId: 'pipe_club', count: 1 },
          { kind: 'item', itemId: 'bandage', count: 2 },
          { kind: 'revealLocation', count: 2 },
          { kind: 'resource', resource: 'hope', amount: 4 },
        ],
        resultText: 'A club made of scaffold tube, two dressings, and a rule: nobody goes alone.',
        tone: 'good',
      },
      {
        id: 'send_one',
        label: 'Send one, fast and light',
        effects: [
          { kind: 'revealLocation', count: 3 },
          { kind: 'need', target: 'random', need: 'fatigue', amount: 18 },
          { kind: 'injure', target: 'random', conditionId: 'sprain', severity: 25 },
        ],
        resultText: 'Three streets covered in two hours, a turned ankle on the way back, and a rule reconsidered.',
        tone: 'neutral',
      },
      {
        id: 'nobody_yet',
        label: 'Nobody goes up yet',
        effects: [
          { kind: 'resource', resource: 'components', amount: 6 },
          { kind: 'resource', resource: 'hope', amount: -2 },
        ],
        resultText: 'Another day inside, and the vault is measurably better for it, and the stores are one day lower.',
        tone: 'neutral',
      },
    ],
  },
  {
    id: 'onb.the_whiteboard',
    title: 'The Whiteboard',
    body: 'Somebody has drawn a line down the middle of it. On the left, what the vault has. On the right, what it needs. The right-hand column is much longer.',
    tags: ['onboarding', 'social'],
    phase: 'dusk',
    weight: 900,
    cooldown: 999,
    once: true,
    requires: { kind: 'day', min: 5, max: 7 },
    choices: [
      {
        id: 'prioritise_research',
        label: 'Put science at the top',
        hint: 'The Laboratory turns a staffed shift into research insight.',
        effects: [
          { kind: 'research', researchId: 'agr_hydroponics', insight: 12 },
          { kind: 'resource', resource: 'hope', amount: 3 },
          { kind: 'flag', flag: 'onboarding.research_path' },
        ],
        resultText: 'Hydroponics goes to the top of the board. It will take a fortnight and it will change everything.',
        tone: 'good',
      },
      {
        id: 'prioritise_defence',
        label: 'Put the door at the top',
        hint: 'The Security Post and Fortification research raise base defence.',
        effects: [
          { kind: 'resource', resource: 'components', amount: 10 },
          { kind: 'resource', resource: 'ammo', amount: 6 },
          { kind: 'flag', flag: 'onboarding.defence_path' },
        ],
        resultText: 'Hinges, a bar, and a rack for whatever passes as arms. Nobody argues with it.',
        tone: 'good',
      },
      {
        id: 'prioritise_people',
        label: 'Put people at the top',
        hint: 'Morale and Hope are resources like any other.',
        effects: [
          { kind: 'need', target: 'all', need: 'morale', amount: 12 },
          { kind: 'resource', resource: 'hope', amount: 10 },
          { kind: 'relationship', a: 'all', b: 'all', amount: 10 },
          { kind: 'flag', flag: 'onboarding.people_path' },
        ],
        resultText: 'Proper meals, proper sleep, and one evening a week where nothing is scheduled.',
        tone: 'good',
      },
    ],
  },
];
