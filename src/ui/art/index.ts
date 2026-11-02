import type { EventTheme, Survivor, WeatherId } from '@engine';

/**
 * Scene illustrations and asset art.
 *
 * Every image here is decorative: the words beside it carry the meaning, so each one renders
 * with an empty alt and a missing file degrades to the SVG icon or no image rather than a
 * broken one. The files are bundled through the glob so they get hashed names and land in
 * the PWA precache.
 */

const FILES = import.meta.glob<string>('./**/*.webp', { eager: true, query: '?url', import: 'default' });

function art(name: string): string | undefined {
  return FILES[`./${name}.webp`];
}

export const titleArt = (): string | undefined => art('title');
export const eventArt = (theme: EventTheme | undefined): string | undefined =>
  theme ? art(`event-${theme}`) : undefined;
export const weatherArt = (id: WeatherId): string | undefined => art(`weather-${id}`);
export const endingArt = (id: string): string | undefined => art(`ending-${id}`);
export const itemArt = (id: string): string | undefined => art(`items/${id}`);
export const facilityArt = (id: string): string | undefined => art(`facilities/${id}`);
export const locationArt = (archetypeId: string): string | undefined => art(`locations/${archetypeId}`);

/* ---------------------------------------------------------------- portraits */

type PortraitGroup = `${'she' | 'he' | 'they'}-${'young' | 'mid' | 'old'}`;

/** The painted portraits, grouped so a face matches the survivor's pronouns and rough age. */
const PORTRAITS: Partial<Record<PortraitGroup, string[]>> = {};
for (const [path, url] of Object.entries(FILES)) {
  const match = /^\.\/portraits\/(she|he|they)-(young|mid|old)-\d+\.webp$/.exec(path);
  if (!match) continue;
  const group = `${match[1]}-${match[2]}` as PortraitGroup;
  (PORTRAITS[group] ??= []).push(url);
}
for (const list of Object.values(PORTRAITS)) list.sort();

function groupOf(survivor: Survivor): PortraitGroup {
  const who = survivor.pronouns === 'she/her' ? 'she' : survivor.pronouns === 'he/him' ? 'he' : 'they';
  const age = survivor.age < 32 ? 'young' : survivor.age < 52 ? 'mid' : 'old';
  return `${who}-${age}`;
}

/**
 * Painted portraits for a crew, keyed by survivor id.
 *
 * Each survivor starts from the face their `portraitSeed` points at and steps forward past
 * any face already taken, so two people in the same vault do not share one. Survivors are
 * taken in roster order, which only ever grows at the end, so a newcomer never changes the
 * face of someone already there.
 */
export function assignPortraits(survivors: readonly Survivor[]): Map<string, string> {
  const taken = new Set<string>();
  const out = new Map<string, string>();
  for (const survivor of survivors) {
    const pool = PORTRAITS[groupOf(survivor)];
    if (!pool?.length) continue;
    const start = (survivor.portraitSeed >>> 0) % pool.length;
    let pick = pool[start]!;
    for (let step = 0; step < pool.length; step += 1) {
      const candidate = pool[(start + step) % pool.length]!;
      if (!taken.has(candidate)) {
        pick = candidate;
        break;
      }
    }
    taken.add(pick);
    out.set(survivor.id, pick);
  }
  return out;
}
