import { useMemo, useSyncExternalStore } from 'react';
import { getLocale, onLocaleChange, t, type LocaleId, type MessageKey } from '@i18n';

export type Translate = (key: MessageKey, params?: Record<string, string | number>) => string;

/**
 * Subscribe the component tree to the current locale.
 *
 * The locale lives in a module rather than in React context because the engine reads it
 * too — log lines and day-report notes are prose the simulation generates. `useSyncExternal-
 * Store` bridges the two: components re-render when the locale changes without the engine
 * needing to know React exists.
 */
export function useLocale(): LocaleId {
  return useSyncExternalStore(onLocaleChange, getLocale, getLocale);
}

/**
 * The translator, bound to the current locale.
 *
 * The returned function is memoised on the locale rather than being `t` itself, so that a
 * `useMemo` which formats strings can list it as a dependency and recompute on a language
 * change — which is exactly what the alert and forecast lists need.
 */
export function useT(): Translate {
  const locale = useLocale();
  return useMemo<Translate>(() => (key, params) => t(key, params, locale), [locale]);
}
