#!/usr/bin/env tsx
/**
 * Capture the README screenshots from a real build.
 *
 *   npm run screenshots            against the local production build
 *   npm run screenshots -- <url>   against a deployed copy
 *
 * The shots are generated rather than curated so they cannot drift from the game: a
 * screenshot that shows an interface the project no longer has is worse than none.
 */

import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium, type Page } from 'playwright';

const target = process.argv[2] ?? 'http://localhost:4373/';
const outDir = resolve(import.meta.dirname, '..', 'docs', 'screenshots');

/** Answer whatever dialog is open. Returns false once nothing is left to answer. */
async function clearModal(page: Page): Promise<boolean> {
  const choice = page.locator('.event-choice:not([disabled])').first();
  if (await choice.count()) {
    await choice.click();
    return true;
  }
  const carryOn = page.locator('.modal-foot .btn-primary').first();
  if (await carryOn.count()) {
    await carryOn.click();
    return true;
  }
  return false;
}

/** Start a run and play far enough that the panels hold real content. */
async function playInto(page: Page, days: number): Promise<void> {
  await page.getByRole('button', { name: 'New run' }).click();
  await page.getByRole('button', { name: 'Seal the door' }).click();
  await page.getByRole('button', { name: 'End day' }).waitFor();

  for (let i = 0; i < days * 8; i += 1) {
    if (await clearModal(page)) continue;
    if (Number(await page.locator('.topbar-daynum').innerText()) >= days) break;
    await page.getByRole('button', { name: 'End day' }).click();
  }

  // Never hand back a page with a dialog still over it: the next click would land on the
  // scrim, and the shot would be of a modal rather than of the panel it is meant to show.
  for (let i = 0; i < 20; i += 1) {
    if (!(await clearModal(page))) break;
  }
}

async function shoot(page: Page, name: string): Promise<void> {
  // Let the entry animations settle so nothing is captured mid-fade.
  await page.waitForTimeout(500);
  await page.screenshot({ path: resolve(outDir, `${name}.png`) });
  console.log(`  docs/screenshots/${name}.png`);
}

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
console.log(`Capturing from ${target}`);

/* ---- desktop */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto(target, { waitUntil: 'networkidle' });
  await shoot(page, 'menu');

  await playInto(page, 9);
  await shoot(page, 'dashboard');

  const nav = page.getByRole('navigation', { name: 'Panels' });
  for (const [panel, file] of [
    ['Crew', 'crew'],
    ['Base', 'base'],
    ['Map', 'map'],
    ['Research', 'research'],
  ] as const) {
    await nav.getByRole('button', { name: new RegExp(`^${panel}`) }).click();
    await shoot(page, file);
  }

  await context.close();
}

/* ---- mobile, which is a different information architecture rather than a narrow desktop */
{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(target, { waitUntil: 'networkidle' });
  await playInto(page, 6);
  await shoot(page, 'mobile-dashboard');

  await page.getByRole('navigation', { name: 'Panels' }).getByRole('button', { name: /^Crew/ }).click();
  await shoot(page, 'mobile-crew');
  await context.close();
}

await browser.close();
console.log('done');
