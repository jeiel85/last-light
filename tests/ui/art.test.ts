import { describe, expect, it } from 'vitest';
import type { Pronouns } from '@engine';
import {
  ENDINGS,
  EVENT_THEME,
  EVENTS,
  FACILITIES,
  ITEMS,
  LOCATION_ARCHETYPES,
  Survivors,
  WEATHER_LIST,
} from '@engine';
import {
  assignPortraits,
  endingArt,
  eventArt,
  facilityArt,
  itemArt,
  locationArt,
  titleArt,
  weatherArt,
} from '@ui/art';
import { newState } from '../helpers';

/** A missing file degrades silently in the UI, so coverage is checked here instead. */
describe('scene art', () => {
  it('has a title image', () => {
    expect(titleArt()).toBeTruthy();
  });

  it('gives every event a theme with an image', () => {
    for (const event of EVENTS) {
      expect(EVENT_THEME[event.id], `${event.id} has no theme`).toBeDefined();
      expect(eventArt(EVENT_THEME[event.id]), `${event.id} has no image`).toBeTruthy();
    }
  });

  it('has an image for every weather', () => {
    for (const weather of WEATHER_LIST) {
      expect(weatherArt(weather.id), weather.id).toBeTruthy();
    }
  });

  it('has an image for every ending', () => {
    for (const ending of ENDINGS) {
      expect(endingArt(ending.id), ending.id).toBeTruthy();
    }
  });

  it('has an image for every item, facility and site', () => {
    for (const item of ITEMS) expect(itemArt(item.id), item.id).toBeTruthy();
    for (const facility of FACILITIES) expect(facilityArt(facility.id), facility.id).toBeTruthy();
    for (const site of LOCATION_ARCHETYPES) expect(locationArt(site.id), site.id).toBeTruthy();
  });
});

describe('painted portraits', () => {
  const base = Survivors.livingSurvivors(newState())[0]!;
  const crewOf = (pronouns: Pronouns, age: number, count: number) =>
    Array.from({ length: count }, (_, i) => ({ ...base, id: `p${i}`, pronouns, age, portraitSeed: 7 }));

  it('has a face for every pronoun and age band', () => {
    for (const pronouns of ['she/her', 'he/him', 'they/them'] as const) {
      for (const age of [22, 40, 63]) {
        expect(assignPortraits(crewOf(pronouns, age, 1)).size, `${pronouns} ${age}`).toBe(1);
      }
    }
  });

  it('never gives two people in one vault the same face while the pool lasts', () => {
    const crew = crewOf('he/him', 40, 5);
    expect(new Set(assignPortraits(crew).values()).size).toBe(5);
  });

  it('keeps existing faces when someone joins', () => {
    const crew = [...crewOf('she/her', 25, 3)];
    const before = assignPortraits(crew);
    const after = assignPortraits([...crew, { ...crew[0]!, id: 'newcomer' }]);
    for (const survivor of crew) expect(after.get(survivor.id)).toBe(before.get(survivor.id));
  });
});
