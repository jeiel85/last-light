import { describe, expect, it } from 'vitest';
import { ENDINGS, EVENT_THEME, EVENTS, WEATHER_LIST } from '@engine';
import { endingArt, eventArt, titleArt, weatherArt } from '@ui/art';

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
});
