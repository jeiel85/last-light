#!/usr/bin/env tsx
/**
 * Extract the English source for one or more content tables.
 *
 *   npm run locales:extract -- facilities items
 *
 * Prints `key\tEnglish` as JSON, which is the shape a locale file needs filling in. This
 * exists so a translator never has to read the data files to find the strings.
 */

import { EVENTS } from '../src/engine/data/events';
import { ENCOUNTERS } from '../src/engine/data/encounters';
import { expectedContentKeys } from '../src/i18n/coverage';
import { RESOURCES } from '../src/engine/data/resources';
import { WEATHER_LIST } from '../src/engine/data/weather';
import { DIFFICULTIES } from '../src/engine/data/difficulties';
import { CONDITIONS } from '../src/engine/data/conditions';
import { TRAITS } from '../src/engine/data/traits';
import { ITEMS } from '../src/engine/data/items';
import { RESEARCH } from '../src/engine/data/research';
import { META_UNLOCKS } from '../src/engine/data/metaUnlocks';
import { PERSONALITIES } from '../src/engine/data/personalities';
import { BACKGROUNDS } from '../src/engine/data/backgrounds';
import { FACILITIES } from '../src/engine/data/facilities';
import { LOCATION_ARCHETYPES } from '../src/engine/data/locations';
import { SCENARIOS } from '../src/engine/data/scenarios';
import { LORE } from '../src/engine/data/lore';
import { ENDINGS } from '../src/engine/systems/endings';
import { Survivors } from '../src/engine';

/** Every definition that carries translatable text, indexed the way the keys are. */
const SOURCES: Record<string, Record<string, unknown>> = {};

function index(table: string, defs: readonly { id: string }[]): void {
  SOURCES[table] = Object.fromEntries(defs.map((def) => [def.id, def]));
}

index('resources', Object.values(RESOURCES));
index('weather', WEATHER_LIST);
index('difficulties', DIFFICULTIES);
index('conditions', CONDITIONS);
index('traits', TRAITS);
index('items', ITEMS);
index('research', RESEARCH);
index('unlocks', META_UNLOCKS);
index('personalities', PERSONALITIES);
index('backgrounds', BACKGROUNDS);
index('facilities', FACILITIES);
index('locations', LOCATION_ARCHETYPES);
index('scenarios', SCENARIOS);
index('lore', LORE);
index('endings', ENDINGS);
index('events', EVENTS);
index('encounters', ENCOUNTERS);
SOURCES['skills'] = Object.fromEntries(
  (['engineering', 'medicine', 'science', 'scavenging', 'combat', 'cooking', 'botany', 'negotiation'] as const).map(
    (id) => [id, { name: Survivors.skillLabel(id) }],
  ),
);

/** Walk `choices.hurl.onSuccess.text` style paths, including list indices. */
function pick(root: unknown, path: string[]): unknown {
  let node: unknown = root;
  for (const step of path) {
    if (node === undefined || node === null) return undefined;
    if (Array.isArray(node)) {
      const byIndex = /^\d+$/.test(step) ? node[Number(step)] : undefined;
      node = byIndex ?? node.find((entry) => (entry as { id?: string })?.id === step);
    } else {
      node = (node as Record<string, unknown>)[step];
    }
  }
  return node;
}

const wanted = new Set(process.argv.slice(2));
const out: Record<string, string> = {};

for (const key of expectedContentKeys()) {
  const table = key.slice(0, key.indexOf('.'));
  if (wanted.size > 0 && !wanted.has(table)) continue;
  const remainder = key.slice(table.length + 1);
  /*
   * Event and encounter ids contain a dot (`med.the_amputation`), so the id cannot be
   * taken as the next path segment — it is whichever known id the remainder starts with.
   */
  const id = Object.keys(SOURCES[table] ?? {})
    .filter((candidate) => remainder === candidate || remainder.startsWith(`${candidate}.`))
    .sort((a, b) => b.length - a.length)[0];
  if (table === 'enemies') {
    out[key] = remainder.slice(0, remainder.lastIndexOf('.'));
    continue;
  }
  if (!id) continue;
  const rest = remainder.slice(id.length + 1).split('.');
  const def = SOURCES[table]?.[id];
  /*
   * `nameForms.3` indexes its list directly, but a facility level is numbered from one
   * while the array is numbered from zero, so that one path is shifted back.
   */
  const path =
    rest[0] === 'levels' && /^\d+$/.test(rest[1] ?? '')
      ? ['levels', String(Number(rest[1]) - 1), ...rest.slice(2)]
      : rest;
  const value = pick(def, path);
  if (typeof value === 'string') out[key] = value;
}

console.log(JSON.stringify(out, null, 2));
