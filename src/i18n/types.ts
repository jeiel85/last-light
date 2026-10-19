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
 * Choose a starting language from the browser's preference list.
 *
 * Consulted once, on a first run with no stored profile. After that the player's own
 * choice in Settings is the answer, and this never runs again — a Korean speaker who
 * prefers the English text should not be re-negotiated with on every visit.
 *
 * Matching is on the primary subtag, so `ko-KR`, `ko-KP` and a bare `ko` all land on
 * Korean; a language the game does not ship falls through to the next preference rather
 * than giving up on the list, because `['fr-FR', 'ko-KR']` is a Korean reader whose system
 * language is simply not supported.
 *
 * Pure and list-in rather than reading `navigator` itself: the engine and the tests both
 * import this module, and neither has a DOM.
 */
export function detectLocale(languages: readonly string[]): LocaleId {
  for (const language of languages) {
    const primary = language.toLowerCase().split(/[-_]/)[0];
    const match = LOCALES.find((l) => l.id === primary);
    if (match) return match.id;
  }
  return DEFAULT_LOCALE;
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
  | 'skills'
  /**
   * Combat opponents, keyed by the English phrase written in the encounter data.
   *
   * These are short noun phrases ("the pack", "the other crew") composed into combat
   * outcome lines rather than fields of a definition, so the phrase itself is the id.
   */
  | 'enemies';

/** A locale's content overlay: `<table>.<id>.<field>` to translated text. */
export type ContentBundle = Readonly<Record<string, string>>;

/**
 * A last pass over a finished string, for grammar a lookup table cannot express.
 *
 * Korean picks its subject and object particles by whether the preceding syllable ends in
 * a consonant, which depends on the interpolated value rather than on the template. Rather
 * than force every such line into the stilted `이(가)` form, a locale may supply a function
 * that resolves those pairs once the placeholders are filled in.
 */
export type LocalePostProcess = (text: string) => string;

/** A locale's interface and engine strings, keyed by message id. */
export type MessageBundle = Readonly<Record<string, string>>;

export interface LocaleBundle {
  id: LocaleId;
  messages: MessageBundle;
  content: ContentBundle;
  postProcess?: LocalePostProcess;
}
