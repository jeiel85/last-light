import { expect, test, type Page } from '@playwright/test';
import { endDay, openFresh, openPanel, startRun, watchConsole } from './helpers';

/**
 * Visual QA.
 *
 * These are structural assertions rather than pixel snapshots: the things that actually
 * break a responsive layout are horizontal overflow, elements that spill outside their
 * container, text too small to read, and tap targets too small to hit. Screenshots would
 * catch none of those automatically, and would fail on every deliberate design change.
 */

const VIEWPORTS = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '390x844', width: 390, height: 844 },
  { name: '360x640', width: 360, height: 640 },
];

const PANELS = ['Dashboard', 'Crew', 'Base', 'Workshop', 'Research', 'Map', 'Archive'];

/** The document must never scroll sideways: that is the signature of a broken layout. */
async function assertNoHorizontalOverflow(page: Page, where: string): Promise<void> {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return { scrollWidth: doc.scrollWidth, clientWidth: doc.clientWidth };
  });
  expect(
    overflow.scrollWidth,
    `${where}: the page scrolls horizontally (${overflow.scrollWidth} > ${overflow.clientWidth})`,
  ).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

/**
 * No visible element may extend past the right edge of the viewport — unless it sits inside
 * something that scrolls horizontally on purpose, which is a deliberate affordance rather
 * than a broken layout.
 */
async function assertNothingClipped(page: Page, where: string): Promise<void> {
  const offenders = await page.evaluate(() => {
    const limit = window.innerWidth + 2;
    const bad: string[] = [];

    const insideScroller = (element: HTMLElement): boolean => {
      let node: HTMLElement | null = element.parentElement;
      while (node && node !== document.body) {
        const overflow = getComputedStyle(node).overflowX;
        if ((overflow === 'auto' || overflow === 'scroll') && node.scrollWidth > node.clientWidth) return true;
        node = node.parentElement;
      }
      return false;
    };

    for (const element of Array.from(document.body.querySelectorAll<HTMLElement>('*'))) {
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || style.position === 'fixed') continue;
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      if (rect.right <= limit) continue;
      if (insideScroller(element)) continue;
      const id = `${element.tagName.toLowerCase()}.${element.className?.toString().split(' ')[0] ?? ''}`;
      if (!bad.includes(id)) bad.push(id);
    }
    return bad.slice(0, 8);
  });
  expect(offenders, `${where}: elements extend past the viewport`).toEqual([]);
}

/** Body text must stay legible at every scale. */
async function assertTextIsLegible(page: Page, where: string): Promise<void> {
  const tooSmall = await page.evaluate(() => {
    const bad: string[] = [];
    for (const element of Array.from(document.body.querySelectorAll<HTMLElement>('p, li, span, button, td, a'))) {
      if (!element.textContent?.trim()) continue;
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      const size = Number.parseFloat(style.fontSize);
      if (size > 0 && size < 9) bad.push(`${element.tagName.toLowerCase()} @ ${size}px`);
    }
    return [...new Set(bad)].slice(0, 6);
  });
  expect(tooSmall, `${where}: text below 9px`).toEqual([]);
}

for (const viewport of VIEWPORTS) {
  test.describe(`layout at ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test('the title screen fits', async ({ page }) => {
      const console_ = watchConsole(page);
      await openFresh(page);
      await assertNoHorizontalOverflow(page, `menu ${viewport.name}`);
      await assertNothingClipped(page, `menu ${viewport.name}`);
      await assertTextIsLegible(page, `menu ${viewport.name}`);
      console_.assertClean();
    });

    test('the setup screen fits', async ({ page }) => {
      await openFresh(page);
      await page.getByRole('button', { name: 'New run' }).click();
      await expect(page.getByRole('heading', { name: 'Prepare the run' })).toBeVisible();
      await assertNoHorizontalOverflow(page, `setup ${viewport.name}`);
      await assertNothingClipped(page, `setup ${viewport.name}`);
    });

    test('every panel fits', async ({ page }) => {
      const console_ = watchConsole(page);
      await openFresh(page);
      await startRun(page, { seed: `VIS-${viewport.name}` });
      // A few days in, so panels have real content rather than empty states.
      for (let i = 0; i < 4; i += 1) await endDay(page);

      for (const panel of PANELS) {
        await openPanel(page, panel);
        await page.waitForTimeout(60);
        await assertNoHorizontalOverflow(page, `${panel} @ ${viewport.name}`);
        await assertNothingClipped(page, `${panel} @ ${viewport.name}`);
        await assertTextIsLegible(page, `${panel} @ ${viewport.name}`);
      }
      console_.assertClean();
    });

    test('modals fit and stay inside the viewport', async ({ page }) => {
      await openFresh(page);
      await startRun(page, { seed: `VISMODAL-${viewport.name}` });

      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.getByRole('dialog', { name: 'Saves' })).toBeVisible();
      await assertNoHorizontalOverflow(page, `saves @ ${viewport.name}`);

      const box = await page.locator('.modal').boundingBox();
      expect(box, 'the modal should be laid out').toBeTruthy();
      expect(box!.height, `saves @ ${viewport.name}: modal taller than the viewport`).toBeLessThanOrEqual(
        viewport.height + 1,
      );
      await page.getByRole('button', { name: 'Close' }).click();
    });
  });
}

test.describe('mobile information architecture', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('reorganises rather than shrinking: tab bar, collapsible stores, drawer log', async ({ page }) => {
    await openFresh(page);
    await startRun(page, { seed: 'MOBILE-IA' });

    // Navigation moves to a bottom tab bar with reachable targets.
    const tabbar = page.locator('.tabbar');
    await expect(tabbar).toBeVisible();
    const box = await tabbar.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);

    // The status rail becomes a strip that expands on demand.
    const toggle = page.locator('.rail-toggle');
    await expect(toggle).toBeVisible();
    await expect(page.locator('.rail-expanded')).toHaveCount(0);
    await toggle.click();
    await expect(page.locator('.rail-expanded')).toBeVisible();

    // The log is a drawer rather than a column.
    await expect(page.locator('.log-col')).toHaveCount(0);
    await page.locator('.topbar-right').getByRole('button', { name: 'Log' }).click();
    await expect(page.locator('.log-drawer')).toBeVisible();
  });

  test('tap targets are big enough to hit', async ({ page }) => {
    await openFresh(page);
    await startRun(page, { seed: 'MOBILE-TAP' });

    const small = await page.evaluate(() => {
      const bad: string[] = [];
      for (const element of Array.from(document.querySelectorAll<HTMLElement>('.tabbar-btn, .topbar-right button'))) {
        const rect = element.getBoundingClientRect();
        if (rect.width === 0) continue;
        if (rect.height < 30 || rect.width < 30) {
          bad.push(`${element.textContent?.trim() || element.className} ${Math.round(rect.width)}×${Math.round(rect.height)}`);
        }
      }
      return bad;
    });
    expect(small, 'primary controls should be at least 30px').toEqual([]);
  });

  test('a story modal fills the screen rather than floating in it', async ({ page }) => {
    await openFresh(page);
    await startRun(page, { seed: 'MOBILE-MODAL' });
    await page.getByRole('button', { name: 'Settings' }).click();
    const modal = page.locator('.modal');
    await expect(modal).toBeVisible();
    const box = await modal.boundingBox();
    expect(box!.width).toBeGreaterThan(360);
  });
});

test.describe('accessibility', () => {
  test('the interface is navigable by keyboard alone', async ({ page }) => {
    await openFresh(page);
    for (let i = 0; i < 3; i += 1) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => document.activeElement?.tagName);
      expect(focused).not.toBe('BODY');
    }
    // Enter activates the focused control.
    await page.getByRole('button', { name: 'New run' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Prepare the run' })).toBeVisible();
  });

  test('number keys switch panels', async ({ page }) => {
    await openFresh(page);
    await startRun(page, { seed: 'A11Y-KEYS' });
    await page.keyboard.press('3');
    await expect(page.getByRole('heading', { name: 'Vault Meridian' })).toBeVisible();
    await page.keyboard.press('1');
    await expect(page.getByRole('heading', { name: 'Situation' })).toBeVisible();
  });

  test('reduced motion strips animation without removing affordances', async ({ page }) => {
    await openFresh(page);
    await page.getByRole('button', { name: 'Settings' }).click();
    await page.getByLabel('Motion').selectOption('reduced');
    await page.getByRole('button', { name: 'Close' }).click();

    const duration = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--dur').trim(),
    );
    expect(['0ms', '0s']).toContain(duration);
    await expect(page.getByRole('button', { name: 'New run' })).toBeVisible();
  });

  test('every image and control carries a name', async ({ page }) => {
    await openFresh(page);
    await startRun(page, { seed: 'A11Y-NAMES' });

    const unnamed = await page.evaluate(() => {
      const bad: string[] = [];
      for (const element of Array.from(document.querySelectorAll<HTMLElement>('button, [role="button"]'))) {
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        const name =
          element.getAttribute('aria-label') ??
          element.getAttribute('title') ??
          element.textContent?.trim() ??
          '';
        if (!name) bad.push(element.className || element.tagName);
      }
      return [...new Set(bad)];
    });
    expect(unnamed, 'controls without an accessible name').toEqual([]);
  });

  test('important state is never signalled by colour alone', async ({ page, isMobile }) => {
    await openFresh(page);
    await startRun(page, { seed: 'A11Y-COLOUR' });
    for (let i = 0; i < 3; i += 1) await endDay(page);
    if (isMobile) await page.locator('.rail-toggle').click();

    // Gauges pair the bar with a number and a label.
    const gauge = page.locator('.gauge').first();
    await expect(gauge.locator('.gauge-name')).not.toBeEmpty();
    await expect(gauge.locator('.gauge-value')).not.toBeEmpty();
    await expect(gauge.locator('[role="img"]')).toHaveAttribute('aria-label', /%/);
  });
});
