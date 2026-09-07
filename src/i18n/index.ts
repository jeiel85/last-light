import { EN_MESSAGES, type MessageKey } from './messages';
import { KO_BUNDLE } from './locales/ko';
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

const BUNDLES: Readonly<Record<LocaleId, LocaleBundle | null>> = {
  // English is the source of truth and lives in the data files, so it needs no overlay.
  en: null,
  ko: KO_BUNDLE,
};

let current: LocaleId = DEFAULT_LOCALE;
const listeners = new Set<() => void>();

export function getLocale(): LocaleId {
  return current;
}

export function setLocale(id: LocaleId): void {
  if (!isLocaleId(id) || id === current) return;
  current = id;
  for (const listener of listeners) listener();
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
  const bundle = BUNDLES[locale];
  const translated = bundle?.messages[key];
  return interpolate(translated ?? EN_MESSAGES[key] ?? key, params);
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
  return BUNDLES[current]?.content[contentKey(table, id, field)] ?? fallback;
}

/** Whether the current locale covers a given content field. Used by the coverage report. */
export function hasTranslation(table: ContentTable, id: string, field: string): boolean {
  if (current === 'en') return true;
  return Boolean(BUNDLES[current]?.content[contentKey(table, id, field)]);
}

/** The raw bundle for a locale, for tooling and tests. */
export function bundleFor(id: LocaleId): LocaleBundle | null {
  return BUNDLES[id];
}
