import { test } from '@playwright/test';

/**
 * Records a short gameplay clip for social feeds.
 *
 * Run via `npm run clip`, which builds the app, starts a preview server through the shared
 * Playwright config, plays ~10 in-game days, and converts the captured video to a GIF.
 *
 * This spec turns video capture on for itself only; the rest of the suite stays silent.
 */
test.use({ video: 'on' });

test('record gameplay clip', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /New run|새 회차/ }).waitFor({ timeout: 30000 });
  await page.getByRole('button', { name: /New run|새 회차/ }).click();
  await page.getByRole('button', { name: /Seal the door|문을 닫는다/ }).click();
  await page.getByRole('button', { name: /End day|하루 마치기/ }).waitFor();

  async function clearModal(): Promise<boolean> {
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

  for (let i = 0; i < 12 * 8; i += 1) {
    if (await clearModal()) continue;
    const dayText = await page.locator('.topbar-daynum').innerText().catch(() => '0');
    if (Number(dayText) >= 12) break;
    await page.getByRole('button', { name: /End day|하루 마치기/ }).click();
  }

  for (let i = 0; i < 20; i += 1) {
    if (!(await clearModal())) break;
  }

  await page.waitForTimeout(800);
});
