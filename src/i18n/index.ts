import { EN_MESSAGES, type MessageKey } from './messages';
import {
  DEFAULT_LOCALE,
  LOCALES,
  isLocaleId,
  type ContentTable,
  type LocaleBundle,
  type LocaleId,
} from './types';

export { LOCALES, DEFAULT_LOCALE, isLocaleId } from './types';
export type { LocaleId, LocaleDef, ContentTable } from './types';
export type { MessageKey } from './messages';
export { EN_MESSAGES } from './messages';

/**
 * The translation runtime.
 *
 * A module-level current locale rather than React context, for one reason: the engine reads
 * it too. Log lines, day-report notes, and combat outcomes are prose generated inside the
 * simulation, and routing all of it back through a React provider would mean either a
 * React-aware engine or an untranslated third of the game.
 *
 * This module is pure TypeScript — no DOM, no React — so the engine may depend on it without
 * breaking the rule that keeps the simulation headless and testable.
 */

/**
 * How each locale's overlay is fetched.
 *
 * A locale is loaded on demand rather than imported statically: the Korean bundle is
 * ~270 kB of text an English-only player would otherwise download and never read. The
 * loaders are `import()` calls so the bundler gives each locale its own chunk, and the
 * `Record<LocaleId, ...>` makes adding a language to `LOCALES` without a loader a type
 * error rather than a locale that silently renders as English.
 */
type BundleLoader = () => Promise<LocaleBundle>;

const LOADERS: Readonly<Record<LocaleId, BundleLoader | null>> = {
  // English is the source of truth and lives in the data files, so it needs no overlay.
  en: null,
  ko: async () => (await import('./locales/ko')).KO_BUNDLE,
};

/** Overlays that have finished loading. English is present from the start, as `null`. */
const BUNDLES = new Map<LocaleId, LocaleBundle | null>([['en', null]]);
/** In-flight loads, so two switches to the same locale share one request. */
const pending = new Map<LocaleId, Promise<LocaleBundle | null>>();
/** Post-processed content, per bundle. See `tc`. */
const processedContent = new WeakMap<LocaleBundle, Map<string, string>>();

let current: LocaleId = DEFAULT_LOCALE;
/** Identifies the most recent switch, so a slow load cannot overwrite a later choice. */
let generation = 0;
const listeners = new Set<() => void>();

export function getLocale(): LocaleId {
  return current;
}

/**
 * Load a locale's overlay without switching to it.
 *
 * Resolves to `null` for English, which has no overlay. A failed load is reported and
 * resolves to `null` rather than rejecting: a missing translation is a degraded reading
 * experience, not a reason to take the game down.
 */
export function loadLocale(id: LocaleId): Promise<LocaleBundle | null> {
  if (!isLocaleId(id)) return Promise.resolve(null);
  const cached = BUNDLES.get(id);
  if (cached !== undefined) return Promise.resolve(cached);
  const inFlight = pending.get(id);
  if (inFlight) return inFlight;

  const loader = LOADERS[id];
  if (!loader) {
    BUNDLES.set(id, null);
    return Promise.resolve(null);
  }
  const load = loader()
    .then((bundle) => {
      BUNDLES.set(id, bundle);
      return bundle;
    })
    .catch((error: unknown) => {
      /*
       * Leave the locale out of the cache so a later attempt can retry — a chunk that
       * failed on a flaky connection should not be written off for the session.
       */
      console.error(`Could not load the ${id} translation; falling back to English.`, error);
      return null;
    })
    .finally(() => {
      pending.delete(id);
    });
  pending.set(id, load);
  return load;
}

/**
 * Switch language, loading the locale's overlay first.
 *
 * The switch is applied only once the text is in hand, so nothing renders half-translated,
 * and a load that fails leaves the previous language in place rather than emptying the
 * screen.
 *
 * Resolves with the locale that is *actually* in effect, which is how a caller learns the
 * load failed. That matters because the language is a saved setting: silently keeping the
 * old text while the setting says otherwise leaves the picker disagreeing with the screen,
 * and re-choosing the language the setting already holds fires no change to retry with.
 */
export function setLocale(id: LocaleId): Promise<LocaleId> {
  if (!isLocaleId(id)) return Promise.resolve(current);
  /*
   * The generation is bumped before the early return, not after it. Choosing the language
   * that is already current is still a decision, and it has to cancel a switch that has
   * not landed yet: pick Korean, change your mind before the chunk arrives, and without
   * this the Korean load applies on top of the English you went back to — leaving the
   * screen in a language the settings disagree with, and no effect left to run to fix it.
   */
  const token = (generation += 1);
  if (id === current) return Promise.resolve(current);
  return loadLocale(id).then((bundle) => {
    /* A slower earlier switch must not land on top of a later one the player made. */
    if (token !== generation) return current;
    if (bundle === null && LOADERS[id]) return current;
    current = id;
    for (const listener of listeners) listener();
    return current;
  });
}

/** Subscribe to locale changes. Returns the unsubscribe function. */
export function onLocaleChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function localeTag(id: LocaleId = current): string {
  return LOCALES.find((l) => l.id === id)?.tag ?? 'en';
}

/* --------------------------------------------------------------- interpolation */

/** Replace `{name}` placeholders. Missing values are left visible rather than blanked. */
function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in params ? String(params[key]) : whole,
  );
}

/* -------------------------------------------------------------- interface text */

/**
 * Translate an interface or engine message.
 *
 * English is the fallback at every step, so a key a locale has not translated yet still
 * reads correctly; `npm run validate` reports exactly which ones those are.
 */
export function t(
  key: MessageKey,
  params?: Record<string, string | number>,
  locale: LocaleId = current,
): string {
  const bundle = BUNDLES.get(locale);
  const translated = bundle?.messages[key];
  const text = interpolate(translated ?? EN_MESSAGES[key] ?? key, params);
  /* The fix-up pass only applies to the locale's own text, never to English fallback. */
  return translated && bundle?.postProcess ? bundle.postProcess(text) : text;
}

/* ----------------------------------------------------------------- content text */

/** The key a locale file uses for one field of one piece of content. */
export function contentKey(table: ContentTable, id: string, field: string): string {
  return `${table}.${id}.${field}`;
}

/**
 * Translate a piece of authored content, falling back to the English written in the data
 * file. `fallback` is the authored string itself, so a caller never has to know whether a
 * translation exists.
 */
export function tc(table: ContentTable, id: string, field: string, fallback: string): string {
  if (current === 'en') return fallback;
  const bundle = BUNDLES.get(current);
  const key = contentKey(table, id, field);
  const translated = bundle?.content[key];
  if (translated === undefined) return fallback;
  if (!bundle?.postProcess) return translated;

  /*
   * Content carries no placeholders, so the fix-up pass over a given key always produces
   * the same string — and `tc` is called from render, once per visible line per frame.
   * Memoising it per bundle turns a repeated scan into a map lookup; `t` cannot do the
   * same because its result depends on the parameters it was given.
   */
  let processed = processedContent.get(bundle);
  if (!processed) {
    processed = new Map();
    processedContent.set(bundle, processed);
  }
  let value = processed.get(key);
  if (value === undefined) {
    value = bundle.postProcess(translated);
    processed.set(key, value);
  }
  return value;
}

/**
 * The raw bundle for a locale, or `null` for English and for any locale not yet loaded.
 * Call `loadLocale` first if you need it present; tooling and tests do.
 */
export function bundleFor(id: LocaleId): LocaleBundle | null {
  return BUNDLES.get(id) ?? null;
}
