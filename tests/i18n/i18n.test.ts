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
  loadLocale,
  localeTag,
  setLocale,
  t,
  tc,
} from '@i18n';
import { coverageFor, expectedContentEntries, expectedContentKeys } from '@i18n/coverage';
import { ENCOUNTERS, ENEMIES, ENEMY_BY_ID } from '@engine';
import { enemyName } from '@i18n/content';
import { resolveJosa } from '@i18n/locales/ko/josa';
import { DEFAULT_SETTINGS } from '@save/schema';
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

  it('ignores a locale it does not have', async () => {
    await setLocale('ko');
    await setLocale('xx' as never);
    expect(getLocale()).toBe('ko');
    expect(localeTag()).toBe('ko');
  });
});

describe('message lookup', () => {
  it('falls back to English for anything a locale has not translated', async () => {
    await setLocale('ko');
    for (const key of Object.keys(EN_MESSAGES) as (keyof typeof EN_MESSAGES)[]) {
      expect(typeof t(key)).toBe('string');
      expect(t(key).length).toBeGreaterThan(0);
    }
  });

  it('interpolates named parameters and leaves unknown ones visible', () => {
    expect(t('topbar.thaw', { day: 42 })).toContain('42');
    expect(t('alert.runsOutIn', { name: 'Water' })).toContain('{days}');
  });

  it('translates without React, so the engine can call it', async () => {
    await setLocale('ko');
    expect(t('engine.channel.stores')).not.toBe(EN_MESSAGES['engine.channel.stores']);
  });
});

describe('content lookup', () => {
  it('returns the authored English when the locale is English', async () => {
    await setLocale('en');
    expect(resourceName(RESOURCES.water)).toBe(RESOURCES.water.name);
  });

  it('returns the translation when there is one', async () => {
    await setLocale('ko');
    expect(resourceName(RESOURCES.water)).not.toBe(RESOURCES.water.name);
  });

  it('returns the fallback for content the locale has not reached', async () => {
    await setLocale('ko');
    expect(tc('events', 'no_such_event', 'title', 'Fallback title')).toBe('Fallback title');
  });
});

describe('locale bundles', () => {
  const nonEnglish = LOCALES.filter((locale) => locale.id !== 'en');

  it('ships at least one translation beyond the source language', () => {
    expect(nonEnglish.length).toBeGreaterThan(0);
  });

  for (const locale of nonEnglish) {
    it(`${locale.id}: every message key it defines exists in English`, async () => {
      const bundle = await loadLocale(locale.id);
      expect(bundle).not.toBeNull();
      const unknown = Object.keys(bundle!.messages).filter((key) => !(key in EN_MESSAGES));
      expect(unknown, 'a translated key that English does not have is dead weight').toEqual([]);
    });

    it(`${locale.id}: every content key it defines points at real content`, async () => {
      const known = new Set(expectedContentKeys());
      const stale = (await coverageFor(locale.id)).stale;
      expect(stale, 'these keys no longer match any content').toEqual([]);
      expect(known.has(contentKey('resources', 'water', 'name'))).toBe(true);
    });

    it(`${locale.id}: keeps every placeholder its English original uses`, async () => {
      const bundle = (await loadLocale(locale.id))!;
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

    it(`${locale.id}: translates the interface, which is what a player meets first`, async () => {
      const messages = (await coverageFor(locale.id)).rows.find((row) => row.table === 'messages')!;
      expect(messages.translated / messages.expected).toBeGreaterThanOrEqual(1);
    });
  }
});

describe('locales load on demand', () => {
  /*
   * A locale's overlay is fetched when it is first needed rather than imported into the
   * app chunk, so an English-only player never downloads a translation they cannot read.
   * That makes the switch asynchronous, and these are the properties that has to keep.
   */

  it('applies the switch only once the text is in hand', async () => {
    const pending = setLocale('ko');
    /* Whatever the loader is doing, the language has not changed yet. */
    expect(getLocale()).toBe('en');
    await pending;
    expect(getLocale()).toBe('ko');
    expect(bundleFor('ko')).not.toBeNull();
  });

  it('keeps English out of the loader, because English is the source', async () => {
    expect(await loadLocale('en')).toBeNull();
  });

  it('shares one load between concurrent switches', async () => {
    await Promise.all([setLocale('ko'), setLocale('ko'), loadLocale('ko')]);
    expect(getLocale()).toBe('ko');
    expect(t('engine.channel.stores')).not.toBe(EN_MESSAGES['engine.channel.stores']);
  });

  it('lets a change of mind cancel a switch that has not landed', async () => {
    /* Pick Korean, go back to English before the chunk arrives: English must win. */
    const korean = setLocale('ko');
    await setLocale('en');
    await korean;
    expect(getLocale()).toBe('en');
  });

  it('gives every locale a loader, so a new language cannot ship as silent English', async () => {
    for (const locale of LOCALES) {
      const bundle = await loadLocale(locale.id);
      if (locale.id === 'en') expect(bundle).toBeNull();
      else expect(bundle, `${locale.id} has no loader`).not.toBeNull();
    }
  });
});

describe('combat opponents are addressed by id', () => {
  /*
   * They used to be keyed by their English phrase, which meant rewording the English
   * orphaned the translation silently. The id is the identity now.
   */

  it('gives every opponent an id and a phrase', () => {
    expect(ENEMIES.length).toBeGreaterThan(0);
    for (const enemy of ENEMIES) {
      expect(enemy.id).toMatch(/^[a-z][a-z0-9_]*$/);
      expect(enemy.name.length).toBeGreaterThan(0);
    }
  });

  it('names an opponent every encounter can actually reach', () => {
    const unknown: string[] = [];
    for (const encounter of ENCOUNTERS) {
      for (const choice of encounter.choices) {
        for (const outcome of [choice.outcome, choice.onSuccess, choice.onFailure]) {
          const id = outcome?.combat?.enemy;
          if (id && !ENEMY_BY_ID[id]) unknown.push(`${encounter.id}/${choice.id}: ${id}`);
        }
      }
    }
    expect(unknown, 'an unknown opponent prints as its own id in the combat line').toEqual([]);
  });

  it('lists every opponent in the translation ledger, keyed by id', () => {
    const entries = expectedContentEntries().filter((entry) => entry.table === 'enemies');
    expect(entries.map((entry) => entry.id).sort()).toEqual(ENEMIES.map((e) => e.id).slice().sort());
  });

  it('translates by id and falls back to the authored phrase', async () => {
    await setLocale('en');
    expect(enemyName('pack')).toBe(ENEMY_BY_ID['pack']!.name);
    await setLocale('ko');
    expect(enemyName('pack')).not.toBe(ENEMY_BY_ID['pack']!.name);
    expect(enemyName('no_such_enemy')).toBe('no_such_enemy');
  });
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

  it('runs over translated messages, so no line ships the parenthesised form', async () => {
    await setLocale('ko');
    const offenders = Object.keys(EN_MESSAGES).filter((key) =>
      /이\(가\)|을\(를\)|은\(는\)/.test(t(key as never)),
    );
    expect(offenders).toEqual([]);
  });
});

describe('the fix-up pass is memoised per content key', () => {
  /*
   * Content carries no placeholders, so post-processing a key always yields the same
   * string — and `tc` is called from render. The cache must be invisible: same answer,
   * every time, and never shared across locales.
   */
  it('returns the same string on every call', async () => {
    await setLocale('ko');
    const first = resourceName(RESOURCES.water);
    expect(resourceName(RESOURCES.water)).toBe(first);
    await setLocale('en');
    expect(resourceName(RESOURCES.water)).toBe(RESOURCES.water.name);
    await setLocale('ko');
    expect(resourceName(RESOURCES.water)).toBe(first);
  });

  it('leaves no particle pair unresolved in any translated content', async () => {
    await setLocale('ko');
    const offenders = expectedContentEntries()
      .map((entry) => tc(entry.table, entry.id, entry.field, ''))
      .filter((text) => /이\/가|을\/를|은\/는/.test(text));
    expect(offenders).toEqual([]);
  });
});

describe('settings carry the language', () => {
  it('defaults to English, so an existing player is not moved to another language', () => {
    expect(DEFAULT_SETTINGS.locale).toBe('en');
  });

  it('records prose in the language it was written in, which is a record not a bug', async () => {
    /*
     * A log line, a survivor's history, and an ending's stored summary are written into the
     * save as text at the moment they happen. Switching language afterwards does not rewrite
     * history — the interface around it changes, and what was said stays as it was said.
     */
    await setLocale('ko');
    const korean = t('engine.history.arrived');
    await setLocale('en');
    expect(korean).not.toBe(t('engine.history.arrived'));
  });
});

describe('the engine reads the locale without importing React', () => {
  it('imports the translator by relative path, not through a bundler alias', () => {
    const source = readFileSync(join(process.cwd(), 'src', 'engine', 'systems', 'dayCycle.ts'), 'utf8');
    expect(source).toMatch(/from '\.\.\/\.\.\/i18n'/);
    expect(source).not.toMatch(/from '@i18n/);
  });
});
