import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  EN_MESSAGES,
  LOCALES,
  bundleFor,
  contentKey,
  getLocale,
  isLocaleId,
  localeTag,
  setLocale,
  t,
  tc,
} from '@i18n';
import { coverageFor, expectedContentKeys } from '@i18n/coverage';
import { resolveJosa } from '@i18n/locales/ko/josa';
import { RESOURCES } from '@engine';
import { resourceName } from '@i18n/content';

/**
 * The translation layer's contract.
 *
 * The promise the architecture makes is that a *partial* translation is a usable one: every
 * lookup falls back to the English written in the data files, nothing throws on a missing
 * key, and no locale can quietly shadow content that no longer exists.
 */

afterEach(() => setLocale('en'));

describe('locale registry', () => {
  it('recognises exactly the locales it ships', () => {
    for (const locale of LOCALES) expect(isLocaleId(locale.id)).toBe(true);
    expect(isLocaleId('fr')).toBe(false);
    expect(isLocaleId('')).toBe(false);
  });

  it('gives every locale a name in its own language and a BCP 47 tag', () => {
    for (const locale of LOCALES) {
      expect(locale.name.length).toBeGreaterThan(0);
      expect(locale.englishName.length).toBeGreaterThan(0);
      expect(locale.tag).toMatch(/^[a-z]{2}(-[A-Za-z0-9]+)*$/);
    }
  });

  it('ignores a locale it does not have', () => {
    setLocale('ko');
    setLocale('xx' as never);
    expect(getLocale()).toBe('ko');
    expect(localeTag()).toBe('ko');
  });
});

describe('message lookup', () => {
  it('falls back to English for anything a locale has not translated', () => {
    setLocale('ko');
    for (const key of Object.keys(EN_MESSAGES) as (keyof typeof EN_MESSAGES)[]) {
      expect(typeof t(key)).toBe('string');
      expect(t(key).length).toBeGreaterThan(0);
    }
  });

  it('interpolates named parameters and leaves unknown ones visible', () => {
    expect(t('topbar.thaw', { day: 42 })).toContain('42');
    expect(t('alert.runsOutIn', { name: 'Water' })).toContain('{days}');
  });

  it('translates without React, so the engine can call it', () => {
    setLocale('ko');
    expect(t('engine.channel.stores')).not.toBe(EN_MESSAGES['engine.channel.stores']);
  });
});

describe('content lookup', () => {
  it('returns the authored English when the locale is English', () => {
    setLocale('en');
    expect(resourceName(RESOURCES.water)).toBe(RESOURCES.water.name);
  });

  it('returns the translation when there is one', () => {
    setLocale('ko');
    expect(resourceName(RESOURCES.water)).not.toBe(RESOURCES.water.name);
  });

  it('returns the fallback for content the locale has not reached', () => {
    setLocale('ko');
    expect(tc('events', 'no_such_event', 'title', 'Fallback title')).toBe('Fallback title');
  });
});

describe('locale bundles', () => {
  const nonEnglish = LOCALES.filter((locale) => locale.id !== 'en');

  it('ships at least one translation beyond the source language', () => {
    expect(nonEnglish.length).toBeGreaterThan(0);
  });

  for (const locale of nonEnglish) {
    it(`${locale.id}: every message key it defines exists in English`, () => {
      const bundle = bundleFor(locale.id);
      expect(bundle).not.toBeNull();
      const unknown = Object.keys(bundle!.messages).filter((key) => !(key in EN_MESSAGES));
      expect(unknown, 'a translated key that English does not have is dead weight').toEqual([]);
    });

    it(`${locale.id}: every content key it defines points at real content`, () => {
      const known = new Set(expectedContentKeys());
      const stale = coverageFor(locale.id).stale;
      expect(stale, 'these keys no longer match any content').toEqual([]);
      expect(known.has(contentKey('resources', 'water', 'name'))).toBe(true);
    });

    it(`${locale.id}: keeps every placeholder its English original uses`, () => {
      const bundle = bundleFor(locale.id)!;
      const offenders: string[] = [];
      for (const [key, translated] of Object.entries(bundle.messages)) {
        const english = EN_MESSAGES[key as keyof typeof EN_MESSAGES];
        if (typeof english !== 'string') continue;
        const wanted = [...english.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
        const got = [...translated.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
        if (wanted.join(',') !== got.join(',')) offenders.push(key);
      }
      expect(offenders, 'a dropped placeholder loses a number the player needs').toEqual([]);
    });

    it(`${locale.id}: translates the interface, which is what a player meets first`, () => {
      const messages = coverageFor(locale.id).rows.find((row) => row.table === 'messages')!;
      expect(messages.translated / messages.expected).toBeGreaterThanOrEqual(1);
    });
  }
});

describe('Korean particle selection', () => {
  it('picks the particle from the syllable the placeholder actually produced', () => {
    expect(resolveJosa('수물이/가')).toBe('수물이');
    expect(resolveJosa('정수기이/가')).toBe('정수기가');
    expect(resolveJosa('부품을/를')).toBe('부품을');
    expect(resolveJosa('물을/를')).toBe('물을');
    expect(resolveJosa('연료을/를')).toBe('연료를');
  });

  it('treats a non-Korean name as ending in a vowel, which is the usual convention', () => {
    expect(resolveJosa('Bekele이/가')).toBe('Bekele가');
  });

  it('reads a trailing digit as it is spoken', () => {
    expect(resolveJosa('3이/가')).toBe('3이');
    expect(resolveJosa('2이/가')).toBe('2가');
  });

  it('leaves a string with no particle pair untouched', () => {
    expect(resolveJosa('20/20')).toBe('20/20');
  });

  it('runs over translated messages, so no line ships the parenthesised form', () => {
    setLocale('ko');
    const offenders = Object.keys(EN_MESSAGES).filter((key) =>
      /이\(가\)|을\(를\)|은\(는\)/.test(t(key as never)),
    );
    expect(offenders).toEqual([]);
  });
});

describe('the engine reads the locale without importing React', () => {
  it('imports the translator by relative path, not through a bundler alias', () => {
    const source = readFileSync(join(process.cwd(), 'src', 'engine', 'systems', 'dayCycle.ts'), 'utf8');
    expect(source).toMatch(/from '\.\.\/\.\.\/i18n'/);
    expect(source).not.toMatch(/from '@i18n/);
  });
});
