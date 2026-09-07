#!/usr/bin/env tsx
/**
 * Generate the PWA icons and the favicon.
 *
 * The project ships no hand-authored art, so the icons are drawn here: a dark plate with
 * an amber aperture, the same shape as the title treatment. PNG encoding is done directly
 * against node's zlib rather than pulling in an image library for three files.
 */

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const iconDir = resolve(root, 'public/icons');

/* ------------------------------------------------------------------ png encoding */

function crc32(buf: Uint8Array): number {
  let c = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i]!;
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const body = new Uint8Array(typeBytes.length + data.length);
  body.set(typeBytes, 0);
  body.set(data, typeBytes.length);

  const out = new Uint8Array(body.length + 8);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  out.set(body, 4);
  view.setUint32(out.length - 4, crc32(body));
  return out;
}

/** Encode straight RGBA pixels (width × height × 4) as a PNG. */
function encodePng(width: number, height: number, rgba: Uint8Array): Uint8Array {
  const stride = width * 4;
  const raw = new Uint8Array((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // filter type 0 (None)
    raw.set(rgba.subarray(y * stride, (y + 1) * stride), y * (stride + 1) + 1);
  }

  const ihdr = new Uint8Array(13);
  const view = new DataView(ihdr.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const parts = [
    new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', new Uint8Array(deflateSync(raw, { level: 9 }))),
    chunk('IEND', new Uint8Array(0)),
  ];
  const total = parts.reduce((acc, p) => acc + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/* ---------------------------------------------------------------------- drawing */

interface Rgb {
  r: number;
  g: number;
  b: number;
}

const PLATE: Rgb = { r: 10, g: 12, b: 13 };
const RING: Rgb = { r: 46, g: 55, b: 59 };
const AMBER: Rgb = { r: 217, g: 178, b: 92 };
const GLOW: Rgb = { r: 120, g: 96, b: 44 };

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

/**
 * @param size    edge length in pixels
 * @param maskable when true the art is inset so it survives the 40% safe-zone crop
 */
function drawIcon(size: number, maskable: boolean): Uint8Array {
  const rgba = new Uint8Array(size * size * 4);
  const centre = (size - 1) / 2;
  const scale = maskable ? 0.62 : 0.82;
  const outer = (size / 2) * scale;
  const inner = outer * 0.46;
  const bar = outer * 0.1;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x - centre;
      const dy = y - centre;
      const dist = Math.hypot(dx, dy);

      // Plate, with a soft warm bloom towards the centre.
      let colour = mix(PLATE, GLOW, Math.max(0, 1 - dist / (outer * 1.6)) * 0.22);

      // The aperture: an amber disc with a dark horizontal slit through it.
      if (dist <= inner) {
        colour = Math.abs(dy) <= bar ? mix(PLATE, AMBER, 0.15) : AMBER;
      } else if (dist <= inner + Math.max(1, size / 160)) {
        colour = mix(colour, AMBER, 0.55);
      } else if (dist >= outer - Math.max(1, size / 128) && dist <= outer) {
        // The bezel ring.
        colour = mix(RING, AMBER, 0.25);
      }

      const i = (y * size + x) * 4;
      rgba[i] = colour.r;
      rgba[i + 1] = colour.g;
      rgba[i + 2] = colour.b;
      rgba[i + 3] = 255;
    }
  }
  return encodePng(size, size, rgba);
}

const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="8" fill="#0a0c0d"/>
  <circle cx="32" cy="32" r="26" fill="none" stroke="#2e373b" stroke-width="2"/>
  <circle cx="32" cy="32" r="12" fill="#d9b25c"/>
  <rect x="18" y="30" width="28" height="4" fill="#0a0c0d"/>
</svg>
`;

mkdirSync(iconDir, { recursive: true });
writeFileSync(resolve(iconDir, 'icon-192.png'), drawIcon(192, false));
writeFileSync(resolve(iconDir, 'icon-512.png'), drawIcon(512, false));
writeFileSync(resolve(iconDir, 'icon-maskable-512.png'), drawIcon(512, true));
writeFileSync(resolve(root, 'public/favicon.svg'), FAVICON);

console.log('icons: public/icons/{icon-192,icon-512,icon-maskable-512}.png + public/favicon.svg');
