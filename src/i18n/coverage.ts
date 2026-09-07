import { BACKGROUNDS } from '../engine/data/backgrounds';
import { CONDITIONS } from '../engine/data/conditions';
import { DIFFICULTIES } from '../engine/data/difficulties';
import { ENCOUNTERS } from '../engine/data/encounters';
import { EVENTS } from '../engine/data/events';
import { FACILITIES } from '../engine/data/facilities';
import { ITEMS } from '../engine/data/items';
import { LOCATION_ARCHETYPES } from '../engine/data/locations';
import { LORE } from '../engine/data/lore';
import { META_UNLOCKS } from '../engine/data/metaUnlocks';
import { PERSONALITIES } from '../engine/data/personalities';
import { RESEARCH } from '../engine/data/research';
import { RESOURCE_LIST } from '../engine/data/resources';
import { SCENARIOS } from '../engine/data/scenarios';
import { TRAITS } from '../engine/data/traits';
import { WEATHER_LIST } from '../engine/data/weather';
import { ENDINGS } from '../engine/systems/endings';
import { SKILL_IDS } from '../engine/model/types';
import { EN_MESSAGES } from './messages';
import { bundleFor, contentKey } from './index';
import { LOCALES, type ContentTable, type LocaleId } from './types';

/**
 * Which strings a locale is expected to translate, and how many of them it has.
 *
 * The set of translatable keys is derived from the data tables themselves rather than
 * written down anywhere, so adding an event adds its title, body, and every choice label
 * to the ledger automatically. A locale is never *required* to be complete — the runtime
 * falls back to English per string — but a report that says which 40% is missing is the
 * difference between a translation that can be finished and one that cannot.
 */

export interface CoverageRow {
  table: ContentTable | 'messages';
  expected: number;
  translated: number;
  /** The first few keys a locale has not covered, for a report that fits on a screen. */
  missingSample: string[];
}

export interface LocaleCoverage {
  locale: LocaleId;
  rows: CoverageRow[];
  expected: number;
  translated: number;
  /** Keys present in the bundle that no longer correspond to anything. */
  stale: string[];
}

/** Every content key the game can ask for, in the order a translator would meet them. */
export function expectedContentKeys(): string[] {
  const keys: string[] = [];
  const add = (table: ContentTable, id: string, field: string) =>
    keys.push(contentKey(table, id, field));
  const maybe = (table: ContentTable, id: string, field: string, value: unknown) => {
    if (typeof value === 'string' && value.length > 0) add(table, id, field);
  };

  for (const def of RESOURCE_LIST) for (const f of ['name', 'summary', 'failure']) add('resources', def.id, f);
  for (const def of WEATHER_LIST) for (const f of ['name', 'description']) add('weather', def.id, f);
  for (const def of DIFFICULTIES) for (const f of ['name', 'description']) add('difficulties', def.id, f);
  for (const def of CONDITIONS) for (const f of ['name', 'description']) add('conditions', def.id, f);
  for (const skill of SKILL_IDS) add('skills', skill, 'name');
  for (const def of TRAITS) for (const f of ['name', 'description']) add('traits', def.id, f);
  for (const def of ITEMS) for (const f of ['name', 'description']) add('items', def.id, f);
  for (const def of RESEARCH) for (const f of ['name', 'description', 'effectText']) add('research', def.id, f);
  for (const def of META_UNLOCKS) for (const f of ['name', 'description']) add('unlocks', def.id, f);
  for (const def of PERSONALITIES) for (const f of ['name', 'description']) add('personalities', def.id, f);
  for (const def of BACKGROUNDS) for (const f of ['occupation', 'bio']) add('backgrounds', def.id, f);

  for (const def of FACILITIES) {
    for (const f of ['name', 'description']) add('facilities', def.id, f);
    def.levels.forEach((level, i) => maybe('facilities', def.id, `levels.${i + 1}.summary`, level.summary));
  }

  for (const def of LOCATION_ARCHETYPES) {
    for (const f of ['name', 'description']) add('locations', def.id, f);
    def.nameForms.forEach((_, i) => add('locations', def.id, `nameForms.${i}`));
  }

  for (const def of SCENARIOS) {
    for (const f of ['name', 'tagline', 'description']) add('scenarios', def.id, f);
    maybe('scenarios', def.id, 'deadlineText', def.deadlineText);
  }

  for (const def of ENDINGS) for (const f of ['name', 'summary', 'epilogue']) add('endings', def.id, f);
  for (const def of LORE) for (const f of ['title', 'source', 'body']) add('lore', def.id, f);

  for (const def of EVENTS) {
    for (const f of ['title', 'body']) add('events', def.id, f);
    for (const choice of def.choices) {
      add('events', def.id, `choices.${choice.id}.label`);
      for (const f of ['hint', 'resultText', 'successText', 'failureText']) {
        maybe('events', def.id, `choices.${choice.id}.${f}`, (choice as unknown as Record<string, unknown>)[f]);
      }
    }
  }

  for (const def of ENCOUNTERS) {
    for (const f of ['title', 'text']) add('encounters', def.id, f);
    for (const choice of def.choices) {
      add('encounters', def.id, `choices.${choice.id}.label`);
      for (const f of ['hint', 'lockedHint']) {
        maybe('encounters', def.id, `choices.${choice.id}.${f}`, (choice as unknown as Record<string, unknown>)[f]);
      }
      for (const branch of ['outcome', 'onSuccess', 'onFailure'] as const) {
        const outcome = (choice as unknown as Record<string, unknown>)[branch] as { text?: string } | undefined;
        maybe('encounters', def.id, `choices.${choice.id}.${branch}.text`, outcome?.text);
      }
    }
  }

  /* Combat opponents are keyed by the phrase itself; the same phrase recurs across sites. */
  const enemies = new Set<string>();
  for (const def of ENCOUNTERS) {
    for (const choice of def.choices) {
      for (const branch of ['outcome', 'onSuccess', 'onFailure'] as const) {
        const outcome = (choice as unknown as Record<string, unknown>)[branch] as
          | { combat?: { enemy?: string } }
          | undefined;
        if (outcome?.combat?.enemy) enemies.add(outcome.combat.enemy);
      }
    }
  }
  for (const enemy of [...enemies].sort()) add('enemies', enemy, 'name');

  return keys;
}

/** The table a content key belongs to, for grouping the report. */
function tableOf(key: string): ContentTable {
  return key.slice(0, key.indexOf('.')) as ContentTable;
}

export function coverageFor(locale: LocaleId): LocaleCoverage {
  const bundle = bundleFor(locale);
  const contentKeys = expectedContentKeys();
  const messageKeys = Object.keys(EN_MESSAGES);
  const known = new Set(contentKeys);

  const rows = new Map<ContentTable | 'messages', CoverageRow>();
  const row = (table: ContentTable | 'messages'): CoverageRow => {
    let found = rows.get(table);
    if (!found) {
      found = { table, expected: 0, translated: 0, missingSample: [] };
      rows.set(table, found);
    }
    return found;
  };

  const messages = row('messages');
  for (const key of messageKeys) {
    messages.expected += 1;
    /* English is the source of truth, so it is complete by definition. */
    if (locale === 'en' || bundle?.messages[key]) messages.translated += 1;
    else if (messages.missingSample.length < 8) messages.missingSample.push(key);
  }

  for (const key of contentKeys) {
    const entry = row(tableOf(key));
    entry.expected += 1;
    if (locale === 'en' || bundle?.content[key]) entry.translated += 1;
    else if (entry.missingSample.length < 8) entry.missingSample.push(key);
  }

  const stale = bundle ? Object.keys(bundle.content).filter((key) => !known.has(key)) : [];

  const list = [...rows.values()];
  return {
    locale,
    rows: list,
    expected: list.reduce((acc, r) => acc + r.expected, 0),
    translated: list.reduce((acc, r) => acc + r.translated, 0),
    stale,
  };
}

/** Coverage for every locale the game ships, English first. */
export function coverageReport(): LocaleCoverage[] {
  return LOCALES.map((locale) => coverageFor(locale.id));
}
