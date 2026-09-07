import { t } from '../../i18n';
import type { EndingDef, EndingResult, GameState } from '../model/types';
import { BALANCE } from '../data/balance';
import { DIFFICULTY_BY_ID } from '../data/difficulties';
import { SCENARIO_BY_ID } from '../data/scenarios';
import { fullName, livingSurvivors } from './survivors';
import { operationalLevel } from './facilities';

/**
 * Endings.
 *
 * Detection runs once per day after everything else has resolved. Victory conditions are
 * checked before defeat conditions so that a run which achieves both on the same day is
 * remembered as the better of the two.
 */

export const ENDINGS: readonly EndingDef[] = [
  {
    id: 'silence',
    name: 'Silence',
    kind: 'defeat',
    summary: 'Everyone is gone.',
    epilogue:
      'The reactor stub runs for another eleven days on the fuel that is left, and the lights in the corridor stay on the whole time. Nobody comes down the stair. When the tank finally empties, the vault becomes exactly what it was before you arrived: a sealed volume of dry air under a great deal of rock, waiting.',
    legacyBase: 10,
    colour: '#6b7276',
  },
  {
    id: 'vault_fails',
    name: 'The Vault Fails',
    kind: 'defeat',
    summary: 'The systems that kept you alive stopped, and could not be restarted.',
    epilogue:
      'You leave on foot, with what can be carried, in the direction that seems least bad. {survivors} walk out of the yard and up the service stair for the last time. The door is not barred behind them, because there is no longer any reason to bar it.',
    legacyBase: 20,
    colour: '#8a6a4a',
  },
  {
    id: 'scattered',
    name: 'Scattered',
    kind: 'defeat',
    summary: 'They stopped believing you, and then they stopped staying.',
    epilogue:
      'It is not dramatic. Over four days people simply are not where they should be, and then the bunks are empty, and then it is only you and the hum. Somebody left the whiteboard up. On the left, what the vault has. On the right, what it needs. Nobody has updated either column in a week.',
    legacyBase: 25,
    colour: '#7a5a72',
  },
  {
    id: 'deadline_missed',
    name: 'The Road Closed',
    kind: 'defeat',
    summary: 'The convoy left without you, or never left at all.',
    epilogue:
      'The freight road north-east goes under on the twenty-fifth day, the way everybody said it would. {survivors} are still here, and the vault is still here, and there is no longer a version of this that ends with a coast.',
    legacyBase: 30,
    colour: '#8a5a4a',
  },
  {
    id: 'exodus',
    name: 'Exodus',
    kind: 'victory',
    summary: 'You built the convoy, fuelled it, and drove out.',
    epilogue:
      'Two vehicles, sixty litres, and nine hundred kilometres of a road that nobody has driven since the Quiet. {survivors} go north-east at first light on day {days}, with the trays in the back and the archive on a data slate. It is not a good plan. It was never going to be a good plan. It is the plan that got made, by people who made it together, and the vault is still standing behind them when the road turns.',
    legacyBase: 120,
    colour: '#c8a24a',
  },
  {
    id: 'deep_root',
    name: 'Deep Root',
    kind: 'victory',
    summary: 'The vault feeds itself, waters itself, and powers itself. You are not counting days any more.',
    epilogue:
      'Generation nine germinated at ninety-one per cent under lamp spectrum alone. The reclaimer runs on the seep and the seep does not stop. There is food for {survivors} indefinitely, and the bedrock here attenuates whatever is asking by better than ninety per cent, which the Committee knew and did not want in the hands of people they had not selected. On day {days} somebody takes the countdown off the whiteboard and writes a planting schedule instead.',
    legacyBase: 140,
    colour: '#5fd0a0',
  },
  {
    id: 'the_thaw',
    kind: 'survival',
    name: 'The Thaw',
    summary: 'You lasted the winter. Nothing is solved, and everyone is still here.',
    epilogue:
      'Water comes off the terrace roof for four days straight and the seep runs brown with it. Nobody has answered the radio, the second door is still shut, and the stores are what they have always been: enough, barely, if nothing goes wrong. On day {days} the door is propped open for an hour because the air outside is finally warmer than the air inside, and {survivors} stand in it without saying very much. The problem was never the winter. But the winter is over, and you are still here, which for the moment is the whole of the achievement.',
    legacyBase: 85,
    colour: '#6fb4dd',
  },
  {
    id: 'signal',
    name: 'The Signal',
    kind: 'transcendent',
    summary: 'You went west, and found what had been asking.',
    epilogue:
      'The bearings never intersected at a point, because it was never at a point. {survivors} walk out along the freight road on day {days} and the last transmission from Vault Meridian is nine seconds of unmodulated carrier, and then a woman reading five-figure groups, unhurried, in a voice that four people in the district recognise.',
    legacyBase: 170,
    colour: '#5aa9d6',
  },
  {
    id: 'meridian',
    name: 'Meridian',
    kind: 'victory',
    summary: 'You found the second door, and you know what the programme was.',
    epilogue:
      'Hatch Seven opens onto a stair with a working light and warm air coming up it, and at the bottom of the stair are people who were selected, nine years of stores, and a great deal to explain. {survivors} go down on day {days}. The archive goes with them, and every page of it, and the last thing anybody does before the hatch closes is chalk the number twelve on the outside of the door where somebody will see it.',
    legacyBase: 180,
    colour: '#c07a6a',
  },
  {
    id: 'last_light',
    name: 'Last Light',
    kind: 'transcendent',
    summary: 'You learned what the vault was for and what has been asking, and you chose anyway.',
    epilogue:
      'You have the charter, the attenuation model, and forty-one minutes of a woman reading numbers she never recorded. You know that the Committee described an infrastructure failure because the alternative was unsayable, and that this facility was emptied because the rock works. On day {days}, with all of it on the table, {survivors} decide what to do — and whatever they decide, they decide it knowing. That was never guaranteed. Almost nobody else got that.',
    legacyBase: 240,
    colour: '#e6ecef',
  },
];

export const ENDING_BY_ID: Record<string, EndingDef> = Object.fromEntries(
  ENDINGS.map((e) => [e.id, e]),
);

/* --------------------------------------------------------------- detection */

export function detectEnding(state: GameState): string | null {
  const living = livingSurvivors(state);

  // An event can force an ending directly.
  const forced = state.flags['ending:trigger'];
  if (typeof forced === 'string' && ENDING_BY_ID[forced]) return forced;

  /* ---- victories, checked first */

  // Last Light: both major narrative threads resolved in one run.
  if (
    living.length > 0 &&
    Boolean(state.flags['meridian.knows']) &&
    Boolean(state.flags['listeners.understood']) &&
    (Number(state.flags['meridian.progress'] ?? 0) >= 9)
  ) {
    return 'last_light';
  }

  // Meridian: the second door is open and the archive has been read.
  if (
    living.length > 0 &&
    Boolean(state.flags['meridian.opened']) &&
    Boolean(state.flags['meridian.knows'])
  ) {
    return 'meridian';
  }

  // The Signal: the array is built, the source located, and the crew committed.
  if (
    living.length > 0 &&
    state.research.completed.includes('com_directional_array') &&
    Boolean(state.flags['listeners.committed'])
  ) {
    return 'signal';
  }

  /*
   * Exodus: the convoy is built and fuelled.
   *
   * This used to want level 3 of both facilities. Cumulatively that is 328 components, 80
   * fuel and 450 days of labour before the convoy's own 60 fuel and 45 components — beyond
   * what the run horizon affords, and the simulator never saw it once in hundreds of runs.
   * Level 2 keeps it the most industrially demanding ending in the game without making it
   * arithmetic nobody can reach.
   */
  if (
    living.length > 0 &&
    Boolean(state.flags['convoy.started']) &&
    operationalLevel(state, 'machine_shop') >= 2 &&
    operationalLevel(state, 'surface_access') >= 2 &&
    state.resources.fuel >= BALANCE.endings.convoyFuel &&
    state.resources.components >= BALANCE.endings.convoyComponents
  ) {
    return 'exodus';
  }

  // Deep Root: sustained self-sufficiency.
  const streak = Number(state.flags['deeproot:streak'] ?? 0);
  if (living.length > 0 && streak >= BALANCE.endings.deepRootDays) return 'deep_root';

  // The Thaw: the winter is over and the crew is alive, whatever else is unresolved.
  if (living.length > 0 && state.day >= BALANCE.endings.horizonDay) return 'the_thaw';

  /* ---- defeats */

  if (living.length === 0) return 'silence';

  const criticalDays = Number(state.flags['critical:streak'] ?? 0);
  if (criticalDays >= BALANCE.endings.criticalFailureDays) return 'vault_fails';

  if (Boolean(state.flags['mutiny.departed']) && living.length <= 1) return 'scattered';
  if (state.resources.hope <= 0 && Number(state.flags['mutiny.stage'] ?? 0) >= 3) return 'scattered';

  const scenario = SCENARIO_BY_ID[state.scenarioId];
  if (scenario?.deadlineDay && state.day > scenario.deadlineDay) return 'deadline_missed';

  return null;
}

/**
 * Track the multi-day conditions that endings depend on. Called once per day by the
 * pipeline, before `detectEnding`.
 */
export function updateEndingProgress(state: GameState, netFood: number, netWater: number, powerSurplus: number): void {
  const selfSufficient =
    netFood >= 0 &&
    netWater >= 0 &&
    powerSurplus >= 0 &&
    state.resources.food > 12 &&
    state.resources.water > 12 &&
    livingSurvivors(state).length >= 2;
  // The streak decays rather than resetting: one bad weather roll should not erase a
  // fortnight of genuine self-sufficiency, but a sustained slide still undoes it.
  const streak = Number(state.flags['deeproot:streak'] ?? 0);
  state.flags['deeproot:streak'] = selfSufficient
    ? streak + 1
    : Math.max(0, streak - BALANCE.endings.deepRootDecay);

  const critical = state.resources.water <= 0 || (state.resources.fuel <= 0 && state.resources.power <= 0);
  state.flags['critical:streak'] = critical ? Number(state.flags['critical:streak'] ?? 0) + 1 : 0;
}

/* ------------------------------------------------------------------ resolve */

export function buildEndingResult(state: GameState, endingId: string): EndingResult {
  const def = ENDING_BY_ID[endingId] ?? ENDINGS[0]!;
  const living = livingSurvivors(state);
  const names = living.map((s) => fullName(s));

  const survivorText =
    names.length === 0
      ? 'Nobody'
      : names.length === 1
        ? names[0]!
        : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

  const epilogue = def.epilogue
    .replace(/\{survivors\}/g, survivorText)
    .replace(/\{days\}/g, String(state.day));

  return {
    endingId,
    day: state.day,
    summary: def.summary,
    epilogue,
    legacyAwarded: computeLegacy(state, def),
    survivorNames: names,
    memorial: state.survivors
      .filter((s) => !s.alive)
      .map((s) => ({ name: fullName(s), day: s.deathDay ?? 0, cause: s.deathCause ?? t('engine.death.unknown') })),
  };
}

export function computeLegacy(state: GameState, def: EndingDef): number {
  const l = BALANCE.legacy;
  let total = def.legacyBase;
  total += state.day * l.perDaySurvived;
  total += livingSurvivors(state).length * l.perSurvivorAlive;
  total += state.lore.length * l.perLoreFound;
  total += state.research.completed.length * l.perResearch;
  total += state.stats.locationsExplored * l.perLocationExplored;

  const difficulty = DIFFICULTY_BY_ID[state.difficultyId];
  total *= difficulty?.legacyMultiplier ?? 1;

  if (state.modifiers.includes('mod_ironman')) total *= 1.4;
  if (state.modifiers.includes('mod_rich_region')) total *= 0.75;
  if (state.modifiers.includes('mod_long_winter')) total *= 1.3;

  return Math.round(total);
}
