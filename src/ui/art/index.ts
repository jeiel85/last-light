import type { EventTheme, WeatherId } from '@engine';

/**
 * Scene illustrations.
 *
 * Every image here is decorative: the words beside it carry the meaning, so each one renders
 * with an empty alt and a missing file degrades to no image rather than a broken one. The
 * files are bundled through the glob so they get hashed names and land in the PWA precache.
 */

const FILES = import.meta.glob<string>('./*.webp', { eager: true, query: '?url', import: 'default' });

function art(name: string): string | undefined {
  return FILES[`./${name}.webp`];
}

export const titleArt = (): string | undefined => art('title');
export const eventArt = (theme: EventTheme | undefined): string | undefined =>
  theme ? art(`event-${theme}`) : undefined;
export const weatherArt = (id: WeatherId): string | undefined => art(`weather-${id}`);
export const endingArt = (id: string): string | undefined => art(`ending-${id}`);
