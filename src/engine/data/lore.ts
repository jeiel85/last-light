import type { LoreDef, LoreId } from '../model/types';

/**
 * The archive.
 *
 * Lore is never handed to the player as exposition. Every entry is a found object — a note,
 * a log, a transcript — and the four theories contradict each other on purpose. Entries are
 * only revealed once discovered, and the archive persists across runs so a player slowly
 * assembles the picture over many attempts.
 */

export const LORE: readonly LoreDef[] = [
  /* --------------------------------------------------------- domestic fragments */
  {
    id: 'note_kitchen_table',
    title: 'Left on a Kitchen Table',
    theory: 'none',
    source: 'Apartment block, second floor',
    order: 10,
    body: 'Gone to your mother\'s. Took the dog, left the cat, sorry. The radio says stay but the radio has said stay for four days and the taps stopped this morning. If you get back before us the spare key is where it always is. I love you. Please be sensible.',
  },
  {
    id: 'note_school_run',
    title: 'A Note in a Coat Pocket',
    theory: 'none',
    source: 'Apartment block, stairwell',
    order: 11,
    body: 'Reminders: bread, Ellie\'s inhaler, ring the surgery about Dad. Under it, in different ink and a much worse hand: they are not answering at the surgery. They are not answering anywhere.',
  },
  {
    id: 'note_names_on_the_wall',
    title: 'Names on the Wall',
    theory: 'none',
    source: 'Church, north aisle',
    order: 12,
    body: 'Four hundred names in pencil, then marker, then charcoal as the pens ran out. The last dozen are in the same hand, and the last of those is unfinished. Under them: WE WERE HERE AND WE WERE KIND TO EACH OTHER, MOSTLY.',
  },
  {
    id: 'note_queue_discipline',
    title: 'Queue Discipline',
    theory: 'none',
    source: 'Supermarket, customer services',
    order: 13,
    body: 'A laminated sign, hand-corrected three times. ONE PERSON PER HOUSEHOLD. Then TWO ITEMS PER PERSON. Then, in marker across both: TAKE WHAT YOU NEED. GOD HELP US. LOCK UP WHEN YOU GO.',
  },
  {
    id: 'note_chalkboard',
    title: 'The Chalkboard',
    theory: 'none',
    source: 'School, assembly hall',
    order: 14,
    body: 'A roll call, updated daily for eleven days. Names are crossed off in two colours: black for collected by family, red for the other thing. On day nine somebody stopped using red and started leaving them blank.',
  },
  {
    id: 'note_evacuation_list',
    title: 'Evacuation List',
    theory: 'cascade',
    source: 'School, head teacher\'s office',
    order: 15,
    body: 'Muster points for four districts, with coach numbers and departure times. Every time is on the same day. No coaches are recorded as having arrived. In the margin: "Called the depot. Called the council. Called the emergency number. It rings."',
  },

  /* ------------------------------------------------------------- grid cascade */
  {
    id: 'note_water_log',
    title: 'Plant Operations Log',
    theory: 'cascade',
    source: 'Water treatment plant, control room',
    order: 20,
    body: '0412 — supply from Grid North lost. Switched to standby generation.\n0630 — Grid South lost. Load shedding per protocol.\n1140 — Standby fuel at 40%. No contact with regional control.\nDay 2, 0900 — Fuel exhausted. Chlorination stopped. I have opened the sluices to keep something moving. Whoever reads this: boil everything.',
  },
  {
    id: 'note_last_briefing',
    title: 'Last Shift Briefing',
    theory: 'cascade',
    source: 'Police station, muster room',
    order: 21,
    body: 'Points for the tour: no radio net, use runners. No custody transfers, we have nowhere to transfer to. Do not attend calls single-crewed. If you are asked what happened, the honest answer is that we do not know and that saying so is better than guessing. Look after each other. — Sgt Ivers',
  },
  {
    id: 'note_detention_log',
    title: 'Custody Record',
    theory: 'none',
    source: 'Police station, custody suite',
    order: 22,
    body: 'Three detainees, all released without charge on day two "in view of circumstances". A fourth entry has no name, no offence, and no release time. Under "reason for detention" somebody has written: found inside the cordon walking outward. Under "disposal": transferred, Meridian.',
  },
  {
    id: 'note_tunnel_graffiti',
    title: 'Tunnel Graffiti',
    theory: 'cascade',
    source: 'Subway, running tunnel',
    order: 23,
    body: 'Spray-painted at intervals along two kilometres, each one further from the platform than the last. THE POWER IS COMING BACK. THE POWER IS COMING BACK. THE POWER IS NOT COMING BACK. IT WAS NEVER THE POWER.',
  },
  {
    id: 'note_last_train',
    title: 'Service Notice',
    theory: 'cascade',
    source: 'Subway, platform display',
    order: 24,
    body: 'A dot-matrix board frozen mid-scroll: SERVICE SUSPENDED — PLEASE SEEK ALTERNATIVE — SERVICE SUS. The board is dead. It has been dead for weeks. There is a battery in the housing behind it, and the battery is flat, and somebody replaced it at least once.',
  },

  /* ---------------------------------------------------------------- the bloom */
  {
    id: 'note_triage_sheet',
    title: 'Triage Sheet',
    theory: 'bloom',
    source: 'Clinic, reception',
    order: 30,
    body: 'Presenting complaints, day four: headache (31), tinnitus (28), "hearing a tone" (24), disorientation (19), nosebleed (9). Under notes: no fever in any case. No inflammatory markers. Nothing on examination. They are not ill. They are all describing the same sound.',
  },
  {
    id: 'note_it_was_not_a_disease',
    title: 'Screening Notes',
    theory: 'bloom',
    source: 'Quarantine post, records box',
    order: 31,
    body: 'We are screening for a pathogen we have never isolated, using a protocol written for something else, at the instruction of an authority that has not answered in six days. Nobody who came through here was contagious. I want that written down somewhere, by somebody, in case anybody ever asks.',
  },
  {
    id: 'note_screening_protocol',
    title: 'Screening Protocol 4-B',
    theory: 'meridian',
    source: 'Quarantine post, clipboard',
    order: 32,
    body: 'Screening criteria, revision four. 1. Auditory reporting. 2. Directional disorientation, particularly toward bearing 041. 3. Any subject presenting BOTH is to be logged and referred. Do not detain. Do not inform. Referral contact: MERIDIAN LIAISON, this frequency, any hour.',
  },
  {
    id: 'note_seventh_day',
    title: 'Ward Log, Day Seven',
    theory: 'bloom',
    source: 'Hospital, nursing station',
    order: 33,
    body: 'Generators failed 0340. Ambient temperature falling. Twenty-two patients on the ward, all stable, none requiring intervention. At 0500 all twenty-two were sitting up. Nobody woke them. They were facing the same direction. I asked what they were listening to and they said, all of them, "you can hear it too."',
  },
  {
    id: 'note_ward_nine',
    title: 'Ward Nine',
    theory: 'bloom',
    source: 'Hospital, ward nine',
    order: 34,
    body: 'Beds made, charts filed, and every patient gone. The fire doors were chained from the corridor. The chain was intact. There is no other exit from ward nine.',
  },

  /* ------------------------------------------------------------- the meridian */
  {
    id: 'note_cordon_orders',
    title: 'Cordon Standing Orders',
    theory: 'meridian',
    source: 'Military checkpoint, guard post',
    order: 40,
    body: 'Effective immediately: this cordon is INWARD-FACING. Civilians attempting to enter the exclusion area are to be turned back with courtesy. Civilians attempting to LEAVE are to be detained pending Meridian assessment. This order is not to be discussed with civilians, local authorities, or your own families.',
  },
  {
    id: 'note_they_were_not_keeping_people_out',
    title: 'A Corporal\'s Notebook',
    theory: 'meridian',
    source: 'Military checkpoint, vehicle',
    order: 41,
    body: 'Day three and nobody will tell us what we are containing. There is no cloud. There is no casualty stream. The Geiger sets read background. We are stopping people from walking west out of a city that has no power and no water, and we are calling it a health measure, and I have started writing things down.',
  },
  {
    id: 'note_meridian_charter',
    title: 'Programme Charter (Extract)',
    theory: 'meridian',
    source: 'Data centre, console',
    order: 42,
    body: 'MERIDIAN is a continuity-of-government capability comprising forty-one hardened nodes at regional intervals, each provisioned for autonomous operation of not less than nine years. Activation authority rests with the Standing Committee. Nodes are not to be disclosed to local authorities. Node populations are to be selected, not self-selecting.',
  },
  {
    id: 'note_node_four',
    title: 'Node Four Status',
    theory: 'meridian',
    source: 'Data centre, console',
    order: 43,
    body: 'NODE 04 — POPULATED — SEALED — NOMINAL.\nNODE 07 — POPULATED — SEALED — NOMINAL.\nNODE 12 — UNPOPULATED — OPEN — ENVIRONMENTAL CONTROL ACTIVE.\nYour blast door plate reads 12.',
  },
  {
    id: 'note_the_second_door',
    title: 'The Second Door',
    theory: 'meridian',
    source: 'Meridian access hatch',
    order: 44,
    body: 'The same manufacturer\'s plate as your own blast door. The same paint code. The same year of installation. The facility number differs by one digit, and behind it the air is warm, which means something down there is still running the plant.',
  },
  {
    id: 'note_continuity_of_government',
    title: 'Selection Criteria',
    theory: 'meridian',
    source: 'Meridian access hatch, document case',
    order: 45,
    body: 'Node populations shall be selected against the Continuity Index: technical competence, reproductive viability, and absence of Category Three auditory response. Persons exhibiting Category Three are to be excluded from all node populations without exception and without explanation.',
  },
  {
    id: 'note_past_the_blockage',
    title: 'Past the Blockage',
    theory: 'meridian',
    source: 'Collapsed tunnel',
    order: 46,
    body: 'The collapse is not a collapse. The rubble is graded, the face is cut square, and there are drill marks. Somebody brought this tunnel down deliberately, from the far side, and did a professional job of it.',
  },

  /* ------------------------------------------------------------- the listeners */
  {
    id: 'note_carrier_tone',
    title: 'Carrier Tone',
    theory: 'listeners',
    source: 'Radio tower, log book',
    order: 50,
    body: 'Nine hours of unmodulated carrier on a band that is not allocated, from a transmitter that is not ours, at a power we cannot account for. It stopped at 1811. Every set in the building was tuned to it by then. Nobody remembers tuning them.',
  },
  {
    id: 'note_the_tone',
    title: 'The Loop',
    theory: 'listeners',
    source: 'Unknown signal source',
    order: 51,
    body: 'A tone, nine seconds. Then a woman reading five-figure groups, unhurried. Then the same groups again in a different voice, and the second voice is also hers, recorded on a different day. The loop is forty-one minutes. It has never repeated a group.',
  },
  {
    id: 'note_they_know_your_frequency',
    title: 'Reply',
    theory: 'listeners',
    source: 'Unknown signal source',
    order: 52,
    body: 'You transmitted for ninety seconds on a frequency you chose at random. Eleven minutes later the loop changed. The new groups, decoded against the standard book, give your bearing, your distance, and the number stencilled on your blast door.',
  },
  {
    id: 'note_it_is_answering',
    title: 'It Is Answering',
    theory: 'listeners',
    source: 'Radio tower, welded shack',
    order: 53,
    body: 'Written on the inside of a door that was welded shut from within: I ASKED IT A QUESTION AND IT ANSWERED. I ASKED IT A BETTER QUESTION AND IT ANSWERED THAT TOO. DO NOT ASK IT THE THIRD QUESTION.',
  },
  {
    id: 'note_the_relay',
    title: 'The Relay',
    theory: 'listeners',
    source: 'A woman changing a battery',
    order: 54,
    body: '"I am not transmitting," she said. "I am relaying. There is a difference and it matters. Somebody has to keep it moving or it stops, and when it stops it starts looking for another way through, and the other ways through are people."',
  },
  {
    id: 'note_bearing_041',
    title: 'Bearing 041',
    theory: 'listeners',
    source: 'Direction-finding logs',
    order: 55,
    body: 'Four bearings from four positions, taken over three weeks. They do not intersect. Each pair intersects somewhere different, and the four points describe a circle forty kilometres across, and the centre of that circle is the city.',
  },

  /* ---------------------------------------------------------------- the world */
  {
    id: 'note_the_settlement',
    title: 'The Walls at Ashfield',
    theory: 'none',
    source: 'A recruiter with a clipboard',
    order: 60,
    body: '"Four hundred people, running water, and a wall. Yes, a wall. No, not for raiders — we have had eleven raiders and nine hundred sleepwalkers. They walk west. They do not stop for fences and they do not stop for shouting. The wall is so they walk round us instead of through."',
  },
  {
    id: 'note_the_walkers',
    title: 'They Walk West',
    theory: 'listeners',
    source: 'Field observation',
    order: 61,
    body: 'Not aggressive. Not fast. They do not respond to speech, obstruction, or injury, and they correct course when you move them. Given water they drink it. Given food they eat it. Then they carry on walking, and they are all walking the same way.',
  },
  {
    id: 'note_the_quiet_itself',
    title: 'What We Call It',
    theory: 'none',
    source: 'Vault Meridian, first week',
    order: 62,
    body: 'Somebody wrote "the Quiet" on the board on day two and it stuck, which tells you what people noticed first. Not the dark. Not the cold. The fact that on the evening it happened, for about nine hours, nobody anywhere could hear anything at all except the tone.',
  },
  {
    id: 'note_vault_manifest',
    title: 'Facility Manifest',
    theory: 'meridian',
    source: 'Vault Meridian, stores office',
    order: 63,
    body: 'FACILITY 12 — provisioning schedule: 40 persons, 9 years. Actual stores on hand at survey: 6 days. Somebody emptied this place, methodically, between commissioning and the Quiet, and filed no record of where any of it went.',
  },
  {
    id: 'note_the_engineer',
    title: 'The Engineer Who Stayed',
    theory: 'meridian',
    source: 'Vault Meridian, plant room',
    order: 64,
    body: 'Handwritten on the reactor housing: "Left the stub running and the seep valve cracked. Whoever gets here will need both. Do not trust the door schedule — 12 was never meant to be populated and the schedule knows it. Good luck. — B.O., Facilities."',
  },
  {
    id: 'note_the_third_question',
    title: 'The Third Question',
    theory: 'listeners',
    source: 'Directional array, first contact',
    order: 65,
    body: 'The first question was where. It answered with a bearing. The second was who, and it answered with a list of names, and every name was somebody in this room. The third question is why, and the door on the radio tower was welded from the inside for a reason.',
  },
  {
    id: 'note_nine_years',
    title: 'Nine Years',
    theory: 'meridian',
    source: 'Deep archive',
    order: 66,
    body: 'The provisioning standard is nine years because the modelling said the surface would be habitable again in seven. The modelling was not about fallout, weather, or contagion. Section 4 of the model is titled ATTENUATION, and the y-axis is labelled "proportion still responding".',
  },
  {
    id: 'note_the_committee',
    title: 'Minutes, Standing Committee',
    theory: 'meridian',
    source: 'Deep archive',
    order: 67,
    body: 'Item 4. The Committee noted that the phenomenon is not an attack and has no identifiable origin, direction, or intent, and that the term "signal" is a convenience. Item 5. The Committee agreed that public communication should continue to describe an infrastructure failure. Item 6. The Committee activated MERIDIAN.',
  },
  {
    id: 'note_facility_twelve',
    title: 'Facility Twelve',
    theory: 'meridian',
    source: 'Deep archive',
    order: 68,
    body: 'Twelve was decommissioned before activation and its population reassigned. Reason: acoustic survey found the bedrock here attenuates the phenomenon by better than ninety per cent. Twelve was not abandoned because it was worthless. It was emptied because it worked, and the Committee did not want a place that worked in the hands of people they had not selected.',
  },
  {
    id: 'note_what_it_wants',
    title: 'Attenuation',
    theory: 'listeners',
    source: 'Directional array, final analysis',
    order: 69,
    body: 'It is not speaking to us. It is measuring. Every reply we send narrows the estimate. The people walking west are not being summoned — they are being read, one at a time, and when it has read enough of them it will not need to ask any more questions.',
  },
  {
    id: 'note_the_choice',
    title: 'What Is Left to Decide',
    theory: 'none',
    source: 'Vault Meridian',
    order: 70,
    body: 'Three doors. One leads west, to whatever is asking. One leads down, to a facility built by people who decided who was worth keeping. One leads nowhere at all: you stay, you grow food under lamps, and you become the thing the archive calls a residual population. Nobody in this room is qualified to choose, and somebody in this room is going to.',
  },
  {
    id: 'note_convoy_plan',
    title: 'Convoy Plan',
    theory: 'none',
    source: 'Vault Meridian, workshop wall',
    order: 71,
    body: 'Two vehicles, sixty litres, and a route north-east along the old freight road that avoids the cordon, the tunnel, and every bearing on the board. Nine hundred kilometres to a coast that may or may not still have boats. It is not a good plan. It is a plan.',
  },
  {
    id: 'note_deep_root',
    title: 'Generation Nine',
    theory: 'none',
    source: 'Hydroponics, tray log',
    order: 72,
    body: 'Generation nine germinated at ninety-one per cent under lamp spectrum alone. We can feed fourteen people indefinitely on four trays and a reactor stub. Whatever else is true, we are no longer counting days until the food runs out. We are just counting days.',
  },
  {
    id: 'note_first_night',
    title: 'The First Night',
    theory: 'none',
    source: 'Vault Meridian',
    order: 73,
    body: 'Four of you, a stub reactor, six days of food, and a door that locks. Nobody slept. Somebody found the stores office and read out the manifest, which said forty persons, nine years, and then everybody laughed for slightly too long.',
  },
];

export const LORE_BY_ID: Record<LoreId, LoreDef> = Object.fromEntries(LORE.map((l) => [l.id, l]));

export const THEORY_LABEL: Record<LoreDef['theory'], string> = {
  cascade: 'Grid Cascade',
  meridian: 'The Meridian Programme',
  bloom: 'Quiet Bloom',
  listeners: 'The Listeners',
  none: 'Unattributed',
};

export const THEORY_SUMMARY: Record<LoreDef['theory'], string> = {
  cascade:
    'An infrastructure failure that cascaded past the point of repair, and simply was never fixed because there was nobody left to fix it.',
  meridian:
    'A state continuity programme that knew something was coming, built forty-one shelters for the people it selected, and told everyone else it was a power cut.',
  bloom:
    'An atmospheric or biological event that suppressed electromagnetic activity and did something to the people who were outside when it happened.',
  listeners:
    'Something is transmitting. It has been transmitting since the first evening. It responds to being addressed, and the people who walk west are walking toward it.',
  none: 'Fragments that belong to no single explanation.',
};
