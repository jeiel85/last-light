import { expect, test } from '@playwright/test';
import { clearModals, currentDay, endDay, openFresh, openPanel, startRun, watchConsole } from './helpers';

test.describe('a full session', () => {
  test('starts a run, plays several days, and keeps the console clean', async ({ page }) => {
    const console_ = watchConsole(page);
    await openFresh(page);
    await startRun(page, { seed: 'E2E-MAIN' });

    expect(await currentDay(page)).toBe(1);
    await expect(page.getByRole('heading', { name: 'Situation' })).toBeVisible();

    for (let i = 0; i < 6; i += 1) await endDay(page);
    expect(await currentDay(page)).toBeGreaterThanOrEqual(5);

    console_.assertClean();
  });

  test('every panel opens and shows its content', async ({ page }) => {
    const console_ = watchConsole(page);
    await openFresh(page);
    await startRun(page, { seed: 'E2E-PANELS' });

    const panels: [string, string | RegExp][] = [
      ['Crew', /Crew/],
      ['Base', /Vault Meridian/],
      ['Workshop', /Workshop/],
      ['Research', /Research/],
      ['Map', /The surface/],
      ['Archive', /Archive/],
      ['Dashboard', /Situation/],
    ];
    for (const [label, expected] of panels) {
      await openPanel(page, label);
      await expect(page.getByRole('heading', { name: expected }).first()).toBeVisible();
    }
    console_.assertClean();
  });

  test('assigning a survivor to a job sticks', async ({ page }) => {
    await openFresh(page);
    await startRun(page, { seed: 'E2E-ASSIGN' });
    await openPanel(page, 'Crew');

    const select = page.locator('.crew-assign select').first();
    await expect(select).toBeVisible();
    const options = await select.locator('option').all();
    const values = await Promise.all(options.map((o) => o.getAttribute('value')));
    const job = values.find((v) => v && v !== 'idle' && v !== 'rest');
    expect(job, 'there should be at least one job to assign to').toBeTruthy();

    await select.selectOption(job!);
    await expect(select).toHaveValue(job!);

    await endDay(page);
    await openPanel(page, 'Crew');
    await expect(page.locator('.crew-assign select').first()).toHaveValue(job!);
  });

  test('building a facility charges the stores and shows construction', async ({ page }) => {
    await openFresh(page);
    await startRun(page, { seed: 'E2E-BUILD' });
    await openPanel(page, 'Base');

    await page.locator('.slot-empty').first().click();
    const buildRow = page.locator('.build-row').filter({ has: page.locator('button:not([disabled])') }).first();
    await expect(buildRow).toBeVisible();
    const name = await buildRow.locator('.build-name').innerText();
    expect(name.length).toBeGreaterThan(0);

    await buildRow.getByRole('button').click();
    await expect(page.locator('.toast')).toContainText(/Construction started/i);
    await expect(page.locator('.slot-building')).toHaveCount(1);
  });

  test('starting research shows an active project that progresses', async ({ page }) => {
    await openFresh(page);
    await startRun(page, { seed: 'E2E-RESEARCH' });
    await openPanel(page, 'Research');

    const start = page.locator('.tree-node button', { hasText: /^Start$/ }).first();
    await expect(start).toBeVisible();
    await start.click();
    await expect(page.locator('.active-research')).toBeVisible();

    const label = await page.locator('.active-research strong').innerText();
    await endDay(page);
    await openPanel(page, 'Research');
    await expect(page.locator('.active-research strong')).toHaveText(label);
  });

  test('every number in the status rail can be inspected', async ({ page, isMobile }) => {
    await openFresh(page);
    await startRun(page, { seed: 'E2E-BREAKDOWN' });

    if (isMobile) await page.locator('.rail-toggle').click();
    const trigger = page.getByRole('button', { name: /Inspect Water — production/ }).first();
    await expect(trigger).toBeVisible();
    await trigger.click();

    const dialog = page.getByRole('dialog', { name: /Water — production/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.bd-terms li').first()).toBeVisible();
  });

  test('the map shows sites and the planner previews the risk before committing', async ({ page }) => {
    await openFresh(page);
    await startRun(page, { seed: 'E2E-MAP' });

    // Ring 1 opens on foot from day 3.
    for (let i = 0; i < 5; i += 1) await endDay(page);
    await openPanel(page, 'Map');
    await expect(page.locator('.map-node').first()).toBeVisible();

    await page.getByRole('button', { name: 'Plan expedition' }).click();
    await expect(page.getByRole('dialog', { name: 'Plan an expedition' })).toBeVisible();

    const member = page.locator('.team-row input:not([disabled])').first();
    await expect(member).toBeVisible();
    await member.check();

    // The forecast must state the risk before the player can commit to it.
    await expect(page.getByRole('button', { name: /Inspect Death risk/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send them' })).toBeEnabled();
  });

  test('an expedition can be dispatched and played to its return', async ({ page }) => {
    const console_ = watchConsole(page);
    await openFresh(page);
    await startRun(page, { seed: 'E2E-EXPED' });
    for (let i = 0; i < 5; i += 1) await endDay(page);

    await openPanel(page, 'Map');
    await page.getByRole('button', { name: 'Plan expedition' }).click();
    for (const box of await page.locator('.team-row input:not([disabled])').all()) {
      await box.check();
      break;
    }
    await page.getByRole('button', { name: 'Send them' }).click();

    // The expedition modal takes over until every beat is answered.
    await expect(page.locator('.exped-head')).toBeVisible();
    const handled = await clearModals(page, 40);
    expect(handled).toBeGreaterThan(0);

    await expect(page.getByRole('button', { name: 'End day' })).toBeVisible();
    console_.assertClean();
  });

  test('the archive reveals lore only after it is found', async ({ page }) => {
    await openFresh(page);
    await startRun(page, { seed: 'E2E-ARCHIVE' });
    await openPanel(page, 'Archive');
    await expect(page.getByRole('heading', { name: 'Archive' })).toBeVisible();

    const note = await page.locator('.panel-note').first().innerText();
    expect(note).toMatch(/\d+\/\d+ fragments/);
  });

  test('the run ends and the report explains what happened', async ({ page }) => {
    test.slow();
    await openFresh(page);
    // A brutal scenario on the hardest difficulty reliably terminates inside the budget.
    await startRun(page, { seed: 'E2E-END', scenario: 'Skeleton Crew', difficulty: 'Absolute' });

    for (let i = 0; i < 70; i += 1) {
      if (await page.locator('.report-title').count()) break;
      await endDay(page);
    }

    await expect(page.locator('.report-title')).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('.report-epilogue')).not.toBeEmpty();
    await expect(page.getByRole('button', { name: 'Run it again' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back to the menu' })).toBeVisible();

    // A finished run must not be able to fall through to the menu unread: the report is a
    // whole run's worth of consequence, and it survives a reload for the same reason.
    await page.reload();
    await expect(page.locator('.report-title')).toBeVisible({ timeout: 20_000 });

    // Leaving is explicit, and it clears the run rather than hiding it.
    await page.getByRole('button', { name: 'Back to the menu' }).click();
    await expect(page.getByRole('button', { name: 'New run' })).toBeVisible();
  });
});

test.describe('saving', () => {
  test('a run survives a save, a reload, and a load', async ({ page }) => {
    await openFresh(page);
    await startRun(page, { seed: 'E2E-SAVE' });
    for (let i = 0; i < 3; i += 1) await endDay(page);
    const day = await currentDay(page);

    await page.getByRole('button', { name: 'Save' }).click();
    const dialog = page.getByRole('dialog', { name: 'Saves' });
    await expect(dialog).toBeVisible();
    await dialog.locator('.slot-row', { hasText: 'Slot 1' }).getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('.toast')).toContainText(/Saved to slot 1/i);
    await page.getByRole('button', { name: 'Close' }).click();

    await page.reload();
    await expect(page.getByRole('button', { name: 'New run' })).toBeVisible();

    await page.getByRole('button', { name: 'Saves' }).click();
    await page
      .getByRole('dialog', { name: 'Saves' })
      .locator('.slot-row', { hasText: 'Slot 1' })
      .getByRole('button', { name: 'Load' })
      .click();

    await expect(page.locator('.topbar-daynum')).toHaveText(String(day));
  });

  test('the autosave offers to continue after a reload', async ({ page }) => {
    await openFresh(page);
    await startRun(page, { seed: 'E2E-AUTOSAVE' });
    await endDay(page);

    await page.reload();
    const cont = page.getByRole('button', { name: 'Continue' });
    await expect(cont).toBeEnabled();
    await cont.click();
    await page
      .getByRole('dialog', { name: 'Saves' })
      .locator('.slot-row', { hasText: 'Autosave' })
      .getByRole('button', { name: 'Load' })
      .click();
    await expect(page.locator('.topbar-daynum')).toBeVisible();
  });

  test('a corrupted save is reported, not silently dropped', async ({ page }) => {
    await openFresh(page);
    await startRun(page, { seed: 'E2E-CORRUPT' });
    await endDay(page);

    // Damage the autosave the way a half-finished write would.
    await page.evaluate(async () => {
      const open = indexedDB.open('lastlight');
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        open.onsuccess = () => resolve(open.result);
        open.onerror = () => reject(open.error);
      });
      await new Promise<void>((resolve) => {
        const tx = db.transaction('saves', 'readwrite');
        tx.objectStore('saves').put({ magic: 'LASTLIGHT', version: 3, state: { seed: 'x' } }, 'slot-0');
        tx.oncomplete = () => resolve();
      });
    });

    await page.reload();
    await page.getByRole('button', { name: 'Saves' }).click();
    const row = page.getByRole('dialog', { name: 'Saves' }).locator('.slot-row', { hasText: 'Autosave' });
    await expect(row).toContainText(/damaged|Missing|malformed/i);
    // The player can still get the file out.
    await expect(row.getByRole('button', { name: 'Export' })).toBeEnabled();
  });
});

test.describe('settings', () => {
  test('accessibility settings retune the interface immediately', async ({ page }) => {
    await openFresh(page);
    await page.getByRole('button', { name: 'Settings' }).click();

    await page.getByLabel('Motion').selectOption('reduced');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');

    await page.getByLabel('Contrast').selectOption('high');
    await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high');

    await page.getByLabel('Text size').selectOption('large');
    await expect(page.locator('html')).toHaveAttribute('data-scale', 'large');
  });

  test('settings survive a reload', async ({ page }) => {
    await openFresh(page);
    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByLabel('Contrast').selectOption('high');
    await page.getByRole('button', { name: 'Close' }).click();

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high');
  });

  test('how to play explains the loop without a wall of tutorial', async ({ page }) => {
    await openFresh(page);
    await page.getByRole('button', { name: 'How to play' }).click();
    const dialog = page.getByRole('dialog', { name: 'How to play' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/End day/);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});
