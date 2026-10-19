#!/usr/bin/env tsx
/**
 * Produce the social-feed gameplay GIF.
 *
 *   npm run clip
 *
 * Builds the app, starts a preview server through the shared Playwright config, records a
 * ~10-day run with the headless policy, then converts the captured video to a ~1.4 MB GIF
 * with ffmpeg. The output lands in docs/clips/day-cycle.gif and is committed, so the README
 * and itch.io page can link to a clip that cannot drift from the game.
 *
 * This environment's Chromium cannot reach the local preview server; the Playwright config's
 * own webServer handles that, which is why the recorder is a spec rather than a standalone
 * page script. Requires: Playwright browsers installed, ffmpeg on PATH.
 */

import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { execSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'docs', 'clips');
const gifOut = resolve(outDir, 'day-cycle.gif');
mkdirSync(outDir, { recursive: true });

console.log('Recording a run through the Playwright spec…');
const playwrightBin = resolve(
  root,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'playwright.cmd' : 'playwright',
);
execSync(`"${playwrightBin}" test tests/e2e/clip.spec.ts --project=desktop`, {
  cwd: root,
  stdio: 'inherit',
});

/* Find the captured video under test-results/. */
const findVideo = (dir: string): string | null => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findVideo(full);
      if (found) return found;
    } else if (entry.name === 'video.webm') {
      return full;
    }
  }
  return null;
};

const videoPath = findVideo(resolve(root, 'test-results'));
if (!videoPath) throw new Error('No video.webm was produced by the spec.');

console.log('Converting to GIF…');
execSync(
  `ffmpeg -y -i "${videoPath}" -t 4.0 -vf "fps=8,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=24[p];[s1][p]paletteuse=dither=bayer" -loop 0 "${gifOut}"`,
  { stdio: 'inherit' },
);

/* Leave only the GIF; the raw capture and the playwright report are throwaway. */
rmSync(resolve(root, 'test-results'), { recursive: true, force: true });
console.log(`  ${gifOut}`);
