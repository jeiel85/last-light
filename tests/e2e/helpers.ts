import { expect, type Page } from '@playwright/test';

/**
 * Shared driving helpers for the end-to-end suite.
 *
 * The game is a single page with no routing, so every test starts from the title screen
 * and plays forward. These helpers keep that navigation in one place, and — importantly —
 * they assert as they go, so a test that "passes" cannot have silently skipped a step.
 */

export const CONSOLE_ALLOWLIST = [
  // Vite's dev overlay and the PWA registration are both noisy but harmless.
  /vite/i,
  /workbox/i,
  /service worker/i,
  /Download the React DevTools/i,
];

export interface ConsoleWatcher {
  errors: string[];
  assertClean(): void;
}

/** Fail a test on any console error or page exception the app produces. */
export function watchConsole(page: Page): ConsoleWatcher {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (CONSOLE_ALLOWLIST.some((pattern) => pattern.test(text))) return;
    errors.push(text);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  return {
    errors,
    assertClean() {
      expect(errors, `console errors:\n${errors.join('\n')}`).toEqual([]);
    },
  };
}

/** Load the title screen with a clean profile, so tests never inherit each other's state. */
export async function openFresh(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // A fresh IndexedDB per test keeps runs, saves, and unlocks isolated. The guard matters:
    // init scripts run on every navigation, and wiping storage on reload would make the
    // save tests test nothing.
    try {
      if (sessionStorage.getItem('e2e:wiped')) return;
      sessionStorage.setItem('e2e:wiped', '1');
      indexedDB.deleteDatabase('lastlight');
    } catch {
      /* the game copes with storage being unavailable */
    }
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'New run' })).toBeVisible();
}

/** Start a run from the setup screen, optionally choosing a scenario and difficulty. */
export async function startRun(
  page: Page,
  options: { scenario?: string; difficulty?: string; seed?: string } = {},
): Promise<void> {
  await page.getByRole('button', { name: 'New run' }).click();
  await expect(page.getByRole('heading', { name: 'Prepare the run' })).toBeVisible();

  if (options.scenario) await page.getByRole('button', { name: new RegExp(options.scenario, 'i') }).first().click();
  if (options.difficulty) {
    await page.getByRole('button', { name: new RegExp(options.difficulty, 'i') }).first().click();
  }
  if (options.seed) {
    const field = page.getByLabel('Run seed');
    await field.fill(options.seed);
  }

  await page.getByRole('button', { name: 'Seal the door' }).click();
  await expect(page.getByRole('button', { name: 'End day' })).toBeVisible();
}

/**
 * The panel switcher. Desktop and tablet carry all seven panels in the header; mobile keeps
 * four on the tab bar and the rest behind a "More" sheet, so this walks whichever path the
 * current viewport actually offers.
 */
export async function openPanel(page: Page, label: string): Promise<void> {
  const nav = page.getByRole('navigation', { name: 'Panels' });
  const direct = nav.getByRole('button', { name: new RegExp(`^${label}`, 'i') });
  if (await direct.count()) {
    await direct.first().click();
    return;
  }
  await nav.getByRole('button', { name: /More|Workshop|Research|Archive/ }).last().click();
  await page.getByRole('dialog', { name: 'More' }).getByRole('button', { name: label }).click();
}

/** Answer whatever modal is open: an event choice, a beat, or an outcome acknowledgement. */
export async function clearModals(page: Page, limit = 30): Promise<number> {
  let handled = 0;
  for (let i = 0; i < limit; i += 1) {
    const choice = page.locator('.event-choice:not([disabled])').first();
    if (await choice.count()) {
      await choice.click();
      handled += 1;
      continue;
    }
    const carryOn = page.locator('.modal-foot .btn-primary').first();
    if (await carryOn.count()) {
      await carryOn.click();
      handled += 1;
      continue;
    }
    break;
  }
  return handled;
}

/** Advance one day and resolve everything the night produced. */
export async function endDay(page: Page): Promise<void> {
  const button = page.getByRole('button', { name: 'End day' });
  await expect(button).toBeEnabled();
  await button.click();
  await clearModals(page);
}

export async function currentDay(page: Page): Promise<number> {
  return Number(await page.locator('.topbar-daynum').innerText());
}

/** Play `days` days, stopping early if the run ends. */
export async function playDays(page: Page, days: number): Promise<number> {
  for (let i = 0; i < days; i += 1) {
    if (await page.locator('.report-title').count()) break;
    await endDay(page);
  }
  return page.locator('.report-title').count().then((n) => n);
}
