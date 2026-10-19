#!/usr/bin/env tsx
/**
 * Draw the link-preview card.
 *
 *   npm run og
 *
 * Every other visual in this project is generated rather than authored, and the card that
 * represents the game in a feed should not be the exception: it is rendered from the same
 * palette and wordmark the player meets after the click, so the two cannot drift apart.
 *
 * 1200x630 is the size every large-card renderer crops from — Threads, X, Discord, Slack,
 * iMessage. Rendered through Chromium rather than an image library because the type has to
 * be real type, with the Korean line set in a font that has the glyphs.
 *
 * The output is committed (public/og.png) rather than generated at build time: `npm run
 * build` runs in CI, where no browser is installed, and a build that needs one to produce a
 * static image is a build that fails for a reason unrelated to the code.
 */

import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { tmpdir } from 'node:os';
import { chromium } from 'playwright';

const root = resolve(import.meta.dirname, '..');
const out = resolve(root, 'public', 'og.png');

/* ---- the card ------------------------------------------------------------- */

const CARD = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    background: #0b0e10;
    color: #e6ecef;
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    position: relative;
  }

  /* The vault's own light: a cold wash from the stair, warm amber from the plant. */
  .glow-a {
    position: absolute; inset: 0;
    background:
      radial-gradient(720px 520px at 88% 42%, rgba(217,178,92,0.13), transparent 68%),
      radial-gradient(900px 640px at 4% 108%, rgba(111,180,221,0.09), transparent 62%);
  }
  /* Faint deck rules, the same structure the base panel draws. */
  .rules {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(to bottom, rgba(230,236,239,0.045) 1px, transparent 1px),
      linear-gradient(to right, rgba(230,236,239,0.03) 1px, transparent 1px);
    background-size: 100% 79px, 79px 100%;
    mask-image: linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.25));
  }
  .vignette {
    position: absolute; inset: 0;
    background: radial-gradient(115% 95% at 50% 50%, transparent 42%, rgba(0,0,0,0.55) 100%);
  }

  .frame { position: absolute; inset: 0; display: flex; align-items: center; }
  .copy { position: relative; padding-left: 88px; width: 720px; }

  .kicker {
    font-family: 'Cascadia Mono', Consolas, monospace;
    font-size: 12px; letter-spacing: 0.19em; color: #8a7137;
    text-transform: uppercase; margin-bottom: 26px;
  }

  .wordmark {
    font-size: 92px; font-weight: 300; letter-spacing: 0.14em;
    color: #d9b25c; line-height: 1; margin-left: -6px;
    text-shadow: 0 0 42px rgba(217,178,92,0.22);
  }

  .rule { width: 74px; height: 1px; background: #8a7137; margin: 30px 0 26px; }

  .ko {
    font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
    font-size: 27px; font-weight: 400; color: #d3dbdf; letter-spacing: -0.01em;
  }
  .en {
    margin-top: 12px; font-size: 17px; color: #8a9499; letter-spacing: 0.02em;
  }

  .tags { position: absolute; left: 88px; bottom: 66px; display: flex; gap: 10px; }
  .tag {
    font-family: 'Cascadia Mono', Consolas, monospace;
    font-size: 11px; letter-spacing: 0.13em; text-transform: uppercase;
    color: #8a9499; border: 1px solid #2e373b; padding: 7px 12px 6px; border-radius: 2px;
    background: rgba(20,24,26,0.55);
  }
  .tag.hot { color: #d9b25c; border-color: #8a7137; }

  .map { position: absolute; right: -74px; top: 50%; transform: translateY(-50%); }
</style>
</head>
<body>
  <div class="glow-a"></div>
  <div class="rules"></div>

  <svg class="map" width="620" height="620" viewBox="0 0 620 620" fill="none" aria-hidden="true">
    <defs>
      <radialGradient id="core" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#d9b25c" stop-opacity="0.30" />
        <stop offset="100%" stop-color="#d9b25c" stop-opacity="0" />
      </radialGradient>
    </defs>
    <circle cx="310" cy="310" r="150" fill="url(#core)" />
    <circle cx="310" cy="310" r="96"  stroke="#d9b25c" stroke-opacity="0.42" stroke-width="1" />
    <circle cx="310" cy="310" r="178" stroke="#8a7137" stroke-opacity="0.34" stroke-width="1" />
    <circle cx="310" cy="310" r="260" stroke="#2e373b" stroke-opacity="0.85" stroke-width="1" />
    <circle cx="310" cy="310" r="260" stroke="#6fb4dd" stroke-opacity="0.18" stroke-width="7" stroke-dasharray="1 25" />

    <!-- bearing ticks, the map panel's ring graduations -->
    <g stroke="#8a7137" stroke-opacity="0.30">
      <path d="M310 214 v-14 M310 406 v14 M214 310 h-14 M406 310 h14" stroke-opacity="0.55" />
      <path d="M378 242 l10 -10 M242 378 l-10 10 M378 378 l10 10 M242 242 l-10 -10" stroke-opacity="0.45" />
      <path d="M310 50 v-10 M310 570 v10 M50 310 h-10 M570 310 h10" />
    </g>

    <!-- sites: known, unknown, and one that has gone quiet -->
    <g>
      <circle cx="368" cy="248" r="5"   fill="#d9b25c" />
      <circle cx="368" cy="248" r="13"  stroke="#d9b25c" stroke-opacity="0.34" />
      <circle cx="238" cy="330" r="4.5" fill="#6fb4dd" fill-opacity="0.9" />
      <circle cx="300" cy="430" r="4"   fill="#5fd0a0" fill-opacity="0.75" />
      <circle cx="418" cy="392" r="3.5" fill="#8a9499" fill-opacity="0.55" />
      <circle cx="196" cy="238" r="3.5" fill="#8a9499" fill-opacity="0.45" />
      <circle cx="470" cy="196" r="3"   fill="#8a9499" fill-opacity="0.35" />
      <circle cx="310" cy="310" r="6"   fill="#e07070" fill-opacity="0.85" />
      <path d="M310 310 L368 248" stroke="#d9b25c" stroke-opacity="0.22" stroke-dasharray="3 5" />
      <path d="M310 310 L238 330" stroke="#6fb4dd" stroke-opacity="0.16" stroke-dasharray="3 5" />
    </g>
  </svg>

  <div class="vignette"></div>

  <div class="frame">
    <div class="copy">
      <div class="kicker">Vault Meridian · Civil Defence Facility</div>
      <div class="wordmark">LAST LIGHT</div>
      <div class="rule"></div>
      <div class="ko">세상이 조용해진 뒤, 지하 벙커에서 60일.</div>
      <div class="en">A survival-management roguelite — ten endings, no clean choices.</div>
    </div>
  </div>

  <div class="tags">
    <span class="tag hot">Play in browser</span>
    <span class="tag">Free</span>
    <span class="tag">English · 한국어</span>
    <span class="tag">No install</span>
  </div>
</body>
</html>`;

/* ---- render --------------------------------------------------------------- */

const htmlPath = resolve(tmpdir(), `lastlight-og-${process.pid}.html`);
writeFileSync(htmlPath, CARD, 'utf8');
mkdirSync(resolve(root, 'public'), { recursive: true });

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
  /*
   * The Korean line must actually lay out: if the system has no font with the glyphs, the
   * card ships as a row of boxes. Measured through the layout rather than assumed, and
   * checked as a string expression because this file is type-checked without the DOM lib.
   */
  const korean = await page.locator('.ko').boundingBox();
  const fonts = (await page.evaluate('document.fonts.status')) as string;
  if (!korean || korean.width < 200 || fonts !== 'loaded') {
    throw new Error('The Korean line did not lay out; check the font stack.');
  }
  await page.waitForTimeout(150);
  await page.screenshot({ path: out, type: 'png' });
  console.log(`  public/og.png  (1200x630)`);
} finally {
  await browser.close();
  rmSync(htmlPath, { force: true });
}
