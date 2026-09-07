/**
 * Localisation types.
 *
 * The design constraint that shapes everything here: English stays authored in place, in
 * the data files, as the source of truth. A locale is an *overlay* — a flat map from a
 * content key to a translated string — so adding a language means adding one directory and
 * changing nothing else, and a half-finished translation degrades to English rather than to
 * a screen full of `missing.key.name`.
 *
 * That also keeps the content-authoring ergonomics the engine was built around: an event is
 * still readable prose in `data/events/*.ts`, not a wall of identifiers.
 */

export type LocaleId = 'en' | 'ko';

export interface LocaleDef {
  id: LocaleId;
  /** The language's name in its own language, which is what a language picker should show. */
  name: string;
  /** For documentation and for the `lang` attribute's benefit. */
  englishName: string;
  /** BCP 47 tag written to `<html lang>`. */
  tag: string;
}

export const LOCALES: readonly LocaleDef[] = [
  { id: 'en', name: 'English', englishName: 'English', tag: 'en' },
  { id: 'ko', name: '한국어', englishName: 'Korean', tag: 'ko' },
];

export const DEFAULT_LOCALE: LocaleId = 'en';

export function isLocaleId(value: unknown): value is LocaleId {
  return typeof value === 'string' && LOCALES.some((l) => l.id === value);
}

/**
 * The content tables a locale may translate.
 *
 * Keys are `<table>.<id>.<field>`, and for nested content — an event's choices, a facility's
 * levels — the id carries the path: `events.soc.the_argument.choices.intervene.label`.
 */
export type ContentTable =
  | 'events'
  | 'encounters'
  | 'items'
  | 'facilities'
  | 'traits'
  | 'research'
  | 'lore'
  | 'locations'
  | 'conditions'
  | 'scenarios'
  | 'difficulties'
  | 'resources'
  | 'weather'
  | 'backgrounds'
  | 'personalities'
  | 'unlocks'
  | 'endings'
  | 'skills';

/** A locale's content overlay: `<table>.<id>.<field>` to translated text. */
export type ContentBundle = Readonly<Record<string, string>>;

/** A locale's interface and engine strings, keyed by message id. */
export type MessageBundle = Readonly<Record<string, string>>;

export interface LocaleBundle {
  id: LocaleId;
  messages: MessageBundle;
  content: ContentBundle;
}
