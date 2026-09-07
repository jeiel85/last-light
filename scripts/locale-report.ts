#!/usr/bin/env tsx
/**
 * Translation coverage.
 *
 *   npm run locales             what each language has and has not translated
 *   npm run locales -- --missing print the missing keys in full, ready to fill in
 *
 * English is the source of truth and is complete by definition; every other locale is an
 * overlay that may be partial, because the runtime falls back per string.
 */

import { coverageReport } from '../src/i18n/coverage';

const RESET = '[0m';
const DIM = '[2m';
const RED = '[31m';
const YELLOW = '[33m';
const GREEN = '[32m';
const showMissing = process.argv.includes('--missing');

function bar(fraction: number): string {
  const width = 24;
  const filled = Math.round(fraction * width);
  const colour = fraction >= 0.999 ? GREEN : fraction >= 0.5 ? YELLOW : RED;
  return `${colour}${'█'.repeat(filled)}${DIM}${'·'.repeat(width - filled)}${RESET}`;
}

let stale = 0;

for (const locale of coverageReport()) {
  const fraction = locale.expected === 0 ? 1 : locale.translated / locale.expected;
  console.log('');
  console.log(
    `  ${locale.locale}  ${bar(fraction)}  ${locale.translated}/${locale.expected}  ` +
      `${Math.round(fraction * 100)}%`,
  );
  for (const row of locale.rows.slice().sort((a, b) => a.table.localeCompare(b.table))) {
    if (row.expected === 0) continue;
    const done = row.translated === row.expected;
    const label = row.table.padEnd(14);
    const count = `${row.translated}/${row.expected}`.padStart(9);
    console.log(`    ${done ? GREEN : DIM}${label}${RESET}${count}`);
    if (showMissing && row.missingSample.length > 0) {
      for (const key of row.missingSample) console.log(`      ${DIM}${key}${RESET}`);
    }
  }
  if (locale.stale.length > 0) {
    stale += locale.stale.length;
    console.log(`    ${RED}${locale.stale.length} keys no longer match any content:${RESET}`);
    for (const key of locale.stale.slice(0, 20)) console.log(`      ${key}`);
  }
}

console.log('');
if (stale > 0) {
  console.log(`${RED}  ${stale} stale translation keys. Remove or re-point them.${RESET}`);
  process.exit(1);
}
console.log(`${DIM}  No stale keys. Partial coverage is expected and falls back to English.${RESET}`);
