import { memo } from 'react';

/**
 * The icon set.
 *
 * The project ships no hand-authored art, so every icon here is drawn as SVG geometry on a
 * 24×24 grid using `currentColor`. That keeps them theme-aware, contrast-aware, and
 * crisp at any size, and it means adding a facility or an item never requires an asset.
 *
 * The drawing style is deliberately uniform: 1.6px strokes, rounded caps, no fills except
 * where a shape needs to read as solid at 16px. Glyphs are shared where two things are the
 * same kind of thing — every bladed weapon uses the same blade — because ninety-four
 * individually-drawn pictograms would be ninety-four inconsistent ones.
 */

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/* ------------------------------------------------------------------- glyphs */

const GLYPHS = {
  /* ---- structure and facilities */
  vault: (
    <>
      <path {...S} d="M3 20V9l9-5 9 5v11" />
      <path {...S} d="M3 20h18M9 20v-6h6v6" />
    </>
  ),
  reactor: (
    <>
      <circle {...S} cx="12" cy="12" r="3" />
      <ellipse {...S} cx="12" cy="12" rx="9" ry="3.6" />
      <ellipse {...S} cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" />
      <ellipse {...S} cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" />
    </>
  ),
  water: (
    <>
      <path {...S} d="M12 3c3.6 4.4 5.4 7.4 5.4 9.8A5.4 5.4 0 0 1 12 18a5.4 5.4 0 0 1-5.4-5.2C6.6 10.4 8.4 7.4 12 3Z" />
      <path {...S} d="M6 21h12" />
    </>
  ),
  galley: (
    <>
      <path {...S} d="M5 3v7a2 2 0 0 0 4 0V3M7 10v11" />
      <path {...S} d="M17 3c-1.8 0-3 1.6-3 4s1.2 4 3 4v10" />
    </>
  ),
  infirmary: (
    <>
      <rect {...S} x="3" y="6" width="18" height="13" rx="2" />
      <path {...S} d="M12 9.5v6M9 12.5h6M8 6V4h8v2" />
    </>
  ),
  workshop: (
    <>
      <path {...S} d="M14.5 4.5a4 4 0 0 0 5 5L21 8v3.5L12 20l-3-3 8.5-8.5" />
      <path {...S} d="M6.5 4 3 7.5 6 10l3.5-3.5Z" />
    </>
  ),
  storage: (
    <>
      <rect {...S} x="3" y="7" width="18" height="13" rx="1.5" />
      <path {...S} d="M3 11h18M9 7V4h6v3M9 15h6" />
    </>
  ),
  radio: (
    <>
      <rect {...S} x="3" y="11" width="18" height="9" rx="2" />
      <path {...S} d="M7 15.5h.01M11 15.5h6M8 11 17 5" />
      <circle {...S} cx="18" cy="4.5" r="1.4" />
    </>
  ),
  lab: (
    <>
      <path {...S} d="M10 3v6.2L4.8 18a2 2 0 0 0 1.7 3h11a2 2 0 0 0 1.7-3L14 9.2V3" />
      <path {...S} d="M9 3h6M7.6 15h8.8" />
    </>
  ),
  hydroponics: (
    <>
      <path {...S} d="M12 21v-8" />
      <path {...S} d="M12 13c0-3 2-5 5-5 0 3-2 5-5 5ZM12 15c0-2.6-1.8-4.4-4.4-4.4C7.6 13.2 9.4 15 12 15Z" />
      <path {...S} d="M5 21h14" />
    </>
  ),
  security: (
    <>
      <path {...S} d="M12 3 4.5 6v6c0 4.6 3.1 8.2 7.5 9 4.4-.8 7.5-4.4 7.5-9V6L12 3Z" />
      <path {...S} d="M9.5 12.2l1.8 1.8 3.4-3.6" />
    </>
  ),
  bunks: (
    <>
      <path {...S} d="M3 5v14M21 5v14" />
      <path {...S} d="M3 10h18M3 17h18M6 8.5h4M6 15.5h4" />
    </>
  ),
  access: (
    <>
      <path {...S} d="M6 21V7l6-4 6 4v14" />
      <path {...S} d="M9 21v-6h6v6M12 3v4" />
      <path {...S} d="M3 21h18" />
    </>
  ),
  archive: (
    <>
      <rect {...S} x="3" y="4" width="18" height="16" rx="1.5" />
      <path {...S} d="M3 9h18M8 4v16M12.5 13h5M12.5 16h3" />
    </>
  ),

  /* ---- items: weapons */
  machete: (
    <>
      <path {...S} d="M4 20 15 9l4-4 1 1-4 4L5 21Z" />
      <path {...S} d="M3 21l2-2" />
    </>
  ),
  axe: (
    <>
      <path {...S} d="M14 3c3.4 0 6 2.4 6 5.6 0 1.6-.7 2.6-2.4 2.6-2 0-2.3-1.4-4.2-1.4-1.2 0-1.9.7-1.9 1.6" />
      <path {...S} d="m11.5 11.4-7 7a2 2 0 0 0 2.8 2.8l7-7" />
    </>
  ),
  club: (
    <>
      <path {...S} d="m5 19 8-8" />
      <path {...S} d="M13 11c1.8-1.8 4.4-2.2 6-.6s1.2 4.2-.6 6-4.4 2.2-6 .6-1.2-4.2.6-6Z" />
      <path {...S} d="M3 21l2-2" />
    </>
  ),
  bat: (
    <>
      <path {...S} d="m4 20 5-5" />
      <path {...S} d="M9 15c2.2-2.2 6-5.2 8.4-5.2 1.6 0 2.6 1 2.6 2.6 0 2.4-3 6.2-5.2 8.4" />
      <path {...S} d="M15 13h.01M17 11h.01" />
    </>
  ),
  baton: (
    <>
      <path {...S} d="M5 19 17 7" />
      <path {...S} d="M15 5h4v4" />
      <path {...S} d="m9 11 2 2M13 15l1 3-3-1" />
    </>
  ),
  pistol: (
    <>
      <path {...S} d="M3 8h13l2 3h3v3h-6l-2 3H9l-1-3H3Z" />
      <path {...S} d="M8 14 6 20h3l2-3" />
    </>
  ),
  rifle: (
    <>
      <path {...S} d="M2 9h20v3H8l-2 4H3l1-4H2Z" />
      <path {...S} d="M15 6h4v3M9 12v2" />
    </>
  ),
  shotgun: (
    <>
      <path {...S} d="M2 10h20v2.5H9l-3 5H3l2-5H2Z" />
      <path {...S} d="M14 10v-3h5v3" />
    </>
  ),
  crossbow: (
    <>
      <path {...S} d="M4 6c3 3 5 5 8 5s5-2 8-5" />
      <path {...S} d="M12 4v16M8 20h8" />
      <path {...S} d="M4 6v3M20 6v3" />
    </>
  ),

  /* ---- items: protection */
  vest: (
    <>
      <path {...S} d="M8 3 5 5v15h14V5l-3-2-4 3-4-3Z" />
      <path {...S} d="M12 6v14" />
    </>
  ),
  plate: (
    <>
      <path {...S} d="M12 3 5 5.5v6.8c0 4 2.8 7.4 7 8.7 4.2-1.3 7-4.7 7-8.7V5.5L12 3Z" />
      <path {...S} d="M12 3v17.5M5 11h14" />
    </>
  ),
  helmet: (
    <>
      <path {...S} d="M4 15a8 8 0 0 1 16 0v2H4Z" />
      <path {...S} d="M3 17h18v3H3ZM9 17v-2h6v2" />
    </>
  ),
  hazmat: (
    <>
      <path {...S} d="M12 3a6 6 0 0 0-6 6v3l-1.5 3.5a1.6 1.6 0 0 0 1.5 2.2h12a1.6 1.6 0 0 0 1.5-2.2L18 12V9a6 6 0 0 0-6-6Z" />
      <circle {...S} cx="9.5" cy="10" r="1.2" />
      <circle {...S} cx="14.5" cy="10" r="1.2" />
      <path {...S} d="M8 21h8" />
    </>
  ),
  respirator: (
    <>
      <path {...S} d="M4 8h16v5a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6Z" />
      <circle {...S} cx="8.5" cy="12" r="1.8" />
      <circle {...S} cx="15.5" cy="12" r="1.8" />
      <path {...S} d="M2 6h20" />
    </>
  ),
  gloves: (
    <>
      <path {...S} d="M7 21v-7l-2-2a1.5 1.5 0 0 1 2-2.2l1 1V4.5a1.5 1.5 0 0 1 3 0V9m0-1.5a1.5 1.5 0 0 1 3 0V10m0-1a1.5 1.5 0 0 1 3 0v6a6 6 0 0 1-6 6Z" />
    </>
  ),

  /* ---- items: medical */
  bandage: (
    <>
      <rect {...S} x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-30 12 12)" />
      <path {...S} d="M10 11h.01M13 13h.01M11 14h.01M12.5 10h.01" />
    </>
  ),
  firstaid: (
    <>
      <rect {...S} x="3" y="7" width="18" height="12" rx="2" />
      <path {...S} d="M12 10.5v5M9.5 13h5M9 7V5h6v2" />
    </>
  ),
  antiseptic: (
    <>
      <path {...S} d="M10 3h4v3l3 4v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9l3-4Z" />
      <path {...S} d="M7 14h10M11.5 10.5h1" />
    </>
  ),
  pills: (
    <>
      <rect {...S} x="2.5" y="9" width="12" height="6" rx="3" transform="rotate(-25 8.5 12)" />
      <circle {...S} cx="17" cy="16" r="4.5" />
      <path {...S} d="M14 16h6" />
    </>
  ),
  painkillers: (
    <>
      <circle {...S} cx="8" cy="9" r="4" />
      <circle {...S} cx="15.5" cy="15.5" r="4.5" />
      <path {...S} d="M5.5 6.5 10.5 11.5M13 15.5h5" />
    </>
  ),
  stim: (
    <>
      <path {...S} d="m3 21 3-3M6.5 17.5 15 9l-1.5-1.5" />
      <path {...S} d="m13 5.5 5.5 5.5M15.5 3 21 8.5M9.5 12l3 3" />
    </>
  ),
  blood: (
    <>
      <path {...S} d="M12 3c3.6 4.4 5.4 7.4 5.4 9.8A5.4 5.4 0 0 1 12 18a5.4 5.4 0 0 1-5.4-5.2C6.6 10.4 8.4 7.4 12 3Z" />
      <path {...S} d="M10 12.5a2 2 0 0 0 2 2" />
    </>
  ),
  surgical: (
    <>
      <path {...S} d="M3 20 14 9" />
      <path {...S} d="M14 9 19 4l2 2-5 5-2-2Z" />
      <circle {...S} cx="5" cy="18" r="2" />
    </>
  ),
  splint: (
    <>
      <path {...S} d="M7 3v18M17 3v18" />
      <path {...S} d="M5 8h14M5 16h14" />
    </>
  ),
  treatment: (
    <>
      <rect {...S} x="3" y="5" width="18" height="14" rx="2" />
      <path {...S} d="M3 13h4l2-4 3 8 2-4h7" />
    </>
  ),

  /* ---- items: tools */
  multitool: (
    <>
      <path {...S} d="M6 3v7a3 3 0 0 0 6 0V3" />
      <path {...S} d="M9 13v8M15 21V9a3 3 0 0 1 6 0" />
    </>
  ),
  prybar: (
    <>
      <path {...S} d="M4 20 16 8" />
      <path {...S} d="M16 8c1.6-1.6 1.6-3.4 0-5l4 4c-1.6 1.6-3.4 1.6-4 1Z" />
      <path {...S} d="m3 21 1-1" />
    </>
  ),
  boltcutters: (
    <>
      <path {...S} d="M4 4 12 12M4 20 12 12" />
      <path {...S} d="m12 12 4-2 4 2-4 2Z" />
    </>
  ),
  welder: (
    <>
      <path {...S} d="M5 21V9l6-6 3 3-4 4v11" />
      <path {...S} d="M14 6h6v4h-6" />
      <path {...S} d="M17 10v4l-2 3" />
    </>
  ),
  shovel: (
    <>
      <path {...S} d="M12 3v10" />
      <path {...S} d="M9 3h6" />
      <path {...S} d="M8 13h8l-1.5 5A3 3 0 0 1 12 21a3 3 0 0 1-2.5-3Z" />
    </>
  ),
  lockpick: (
    <>
      <circle {...S} cx="7" cy="8" r="3.5" />
      <path {...S} d="M9.5 10.5 20 21M17 18l2-2M14 15l2-2" />
    </>
  ),
  key: (
    <>
      <circle {...S} cx="7.5" cy="7.5" r="4" />
      <path {...S} d="m10.5 10.5 9 9M17 17l2.5-2.5M14 14l2 2" />
    </>
  ),
  hardware: (
    <>
      <circle {...S} cx="12" cy="12" r="3" />
      <path {...S} d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </>
  ),
  parts: (
    <>
      <rect {...S} x="3" y="10" width="7" height="7" rx="1" />
      <rect {...S} x="12" y="5" width="7" height="7" rx="1" />
      <path {...S} d="M14 16h7M17.5 13v6" />
    </>
  ),
  machine: (
    <>
      <rect {...S} x="3" y="8" width="18" height="11" rx="2" />
      <circle {...S} cx="9" cy="13.5" r="2.5" />
      <path {...S} d="M15 11h4M15 14h4M15 17h2M7 8V5h4v3" />
    </>
  ),

  /* ---- items: exploration and utility */
  rope: (
    <>
      <path {...S} d="M8 3c4 3 4 5 0 8s-4 5 0 8" />
      <path {...S} d="M16 3c-4 3-4 5 0 8s4 5 0 8" />
    </>
  ),
  harness: (
    <>
      <path {...S} d="M5 6h14v3H5Z" />
      <path {...S} d="M8 9v5a4 4 0 0 0 8 0V9" />
      <path {...S} d="M12 18v3M9 21h6" />
    </>
  ),
  lantern: (
    <>
      <path {...S} d="M9 3h6M10 3v3h4V3" />
      <path {...S} d="M8 6h8l1.5 10.5A2 2 0 0 1 15.5 19h-7a2 2 0 0 1-2-2.5Z" />
      <path {...S} d="M12 9v7M9 21h6" />
    </>
  ),
  flare: (
    <>
      <path {...S} d="M12 21V11" />
      <path {...S} d="M9 11h6l-3-8Z" />
      <path {...S} d="M6 15c1.5 1 2.5 2.5 3 4M18 15c-1.5 1-2.5 2.5-3 4" />
    </>
  ),
  map: (
    <>
      <path {...S} d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" />
      <path {...S} d="M9 3v15M15 6v15" />
    </>
  ),
  compass: (
    <>
      <circle {...S} cx="12" cy="12" r="9" />
      <path {...S} d="m15.5 8.5-2 5.5-5.5 2 2-5.5Z" />
    </>
  ),
  geiger: (
    <>
      <rect {...S} x="3" y="9" width="12" height="9" rx="1.5" />
      <path {...S} d="M6 12.5h6M6 15h3" />
      <circle {...S} cx="19" cy="7" r="2.5" />
      <path {...S} d="m15 9 2.2-.8" />
    </>
  ),
  meter: (
    <>
      <rect {...S} x="3" y="6" width="18" height="12" rx="2" />
      <path {...S} d="M6 14a6 6 0 0 1 12 0" />
      <path {...S} d="m12 14 3.5-3.5" />
    </>
  ),
  beacon: (
    <>
      <path {...S} d="M12 21v-8" />
      <circle {...S} cx="12" cy="10" r="2.5" />
      <path {...S} d="M7.5 5.5a6.4 6.4 0 0 0 0 9M16.5 5.5a6.4 6.4 0 0 1 0 9" />
      <path {...S} d="M8 21h8" />
    </>
  ),
  recorder: (
    <>
      <rect {...S} x="2.5" y="7" width="19" height="10" rx="2" />
      <circle {...S} cx="8" cy="12" r="2.2" />
      <circle {...S} cx="16" cy="12" r="2.2" />
      <path {...S} d="M10.2 12h3.6" />
    </>
  ),
  slate: (
    <>
      <rect {...S} x="5" y="3" width="14" height="18" rx="2" />
      <path {...S} d="M8.5 8h7M8.5 12h7M8.5 16h4" />
    </>
  ),
  notes: (
    <>
      <path {...S} d="M6 3h9l4 4v14H6Z" />
      <path {...S} d="M15 3v4h4M9 12h7M9 16h5" />
    </>
  ),
  book: (
    <>
      <path {...S} d="M4 4h6a3 3 0 0 1 2 1 3 3 0 0 1 2-1h6v14h-6a3 3 0 0 0-2 1 3 3 0 0 0-2-1H4Z" />
      <path {...S} d="M12 5v14" />
    </>
  ),
  pack: (
    <>
      <path {...S} d="M6 8h12v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z" />
      <path {...S} d="M9 8V6a3 3 0 0 1 6 0v2M9 13h6" />
    </>
  ),
  sled: (
    <>
      <path {...S} d="M4 6h12l2 8H6Z" />
      <path {...S} d="M3 18h18M6 14v4M18 14v4" />
    </>
  ),
  tarp: (
    <>
      <path {...S} d="M3 8h18l-3 12H6Z" />
      <path {...S} d="M3 8 12 3l9 5M12 8v12" />
    </>
  ),
  tent: (
    <>
      <path {...S} d="M12 3 3 20h18Z" />
      <path {...S} d="M12 9v11M8.5 20l3.5-6 3.5 6" />
    </>
  ),
  battery: (
    <>
      <rect {...S} x="3" y="7" width="16" height="10" rx="2" />
      <path {...S} d="M21 10.5v3M7 12h6" />
    </>
  ),
  canister: (
    <>
      <path {...S} d="M6 7h11v14H6Z" />
      <path {...S} d="M9 7V4h5v3M17 10h3v6h-3" />
      <path {...S} d="M9 12h5" />
    </>
  ),
  fuel: (
    <>
      <path {...S} d="M4 20V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14" />
      <path {...S} d="M3 21h12M14 9h3l2 2v7a1.5 1.5 0 0 1-3 0v-4h-2" />
    </>
  ),
  ammo: (
    <>
      <path {...S} d="M7 21V9l2.5-6h5L17 9v12Z" />
      <path {...S} d="M7 12h10" />
    </>
  ),
  ration: (
    <>
      <rect {...S} x="4" y="6" width="16" height="14" rx="2" />
      <path {...S} d="M4 10h16M9 6V3h6v3M11 14h2" />
    </>
  ),
  skin: (
    <>
      <path {...S} d="M9 3h6v3l2 3v9a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3V9l2-3Z" />
      <path {...S} d="M8 13h8" />
    </>
  ),
  filter: (
    <>
      <path {...S} d="M3 5h18l-7 8v6l-4 2v-8Z" />
    </>
  ),
  cartridge: (
    <>
      <rect {...S} x="6" y="4" width="12" height="16" rx="2" />
      <path {...S} d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  seeds: (
    <>
      <path {...S} d="M12 21v-7" />
      <path {...S} d="M12 14c0-3.3 2.7-6 6-6 0 3.3-2.7 6-6 6Z" />
      <ellipse {...S} cx="7.5" cy="17" rx="2" ry="2.8" transform="rotate(-25 7.5 17)" />
    </>
  ),
  trade: (
    <>
      <path {...S} d="M4 9h16l-1.5 11H5.5Z" />
      <path {...S} d="M9 9V6a3 3 0 0 1 6 0v3M9.5 14h5" />
    </>
  ),
  signal: (
    <>
      <path {...S} d="M12 20v-6" />
      <circle {...S} cx="12" cy="11.5" r="1.6" />
      <path {...S} d="M8.4 8a5 5 0 0 0 0 7M15.6 8a5 5 0 0 1 0 7M5.6 5a9 9 0 0 0 0 13M18.4 5a9 9 0 0 1 0 13" />
    </>
  ),

  /* ---- locations */
  apartment: (
    <>
      <path {...S} d="M4 21V4h9v17M13 21V10h7v11" />
      <path {...S} d="M7 8h3M7 12h3M7 16h3M16 14h1.5M16 17.5h1.5M3 21h18" />
    </>
  ),
  shop: (
    <>
      <path {...S} d="M4 9h16v12H4Z" />
      <path {...S} d="M3 9 5 4h14l2 5M9 21v-6h6v6" />
    </>
  ),
  supermarket: (
    <>
      <path {...S} d="M3 5h3l2.5 10h9L20 8H7" />
      <circle {...S} cx="10" cy="19" r="1.4" />
      <circle {...S} cx="17" cy="19" r="1.4" />
    </>
  ),
  hospital: (
    <>
      <path {...S} d="M4 21V7h16v14" />
      <path {...S} d="M12 10v6M9 13h6M3 21h18M8 7V4h8v3" />
    </>
  ),
  clinic: (
    <>
      <rect {...S} x="4" y="8" width="16" height="12" rx="2" />
      <path {...S} d="M12 11v6M9 14h6M8 8V5h8v3M3 20h18" />
    </>
  ),
  police: (
    <>
      <path {...S} d="M12 3 5 5.5v6.5c0 4.2 3 7.6 7 9 4-1.4 7-4.8 7-9V5.5Z" />
      <path {...S} d="m12 8 1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4L9.4 16l.5-3-2.2-2.1 3-.4Z" />
    </>
  ),
  checkpoint: (
    <>
      <path {...S} d="M3 12h18M5 9v6M19 9v6" />
      <path {...S} d="M7 12v8M17 12v8M9 6h6l-1 3h-4Z" />
    </>
  ),
  school: (
    <>
      <path {...S} d="M3 10 12 5l9 5v11H3Z" />
      <path {...S} d="M9 21v-6h6v6M12 3v2" />
    </>
  ),
  church: (
    <>
      <path {...S} d="M12 2v6M9.5 4.5h5" />
      <path {...S} d="M6 21V11l6-3 6 3v10Z" />
      <path {...S} d="M10.5 21v-5h3v5M3 21h18" />
    </>
  ),
  factory: (
    <>
      <path {...S} d="M3 21V11l5 3V11l5 3V11l5 3V6h3v15Z" />
      <path {...S} d="M6 17h2M11 17h2M16 17h2" />
    </>
  ),
  warehouse: (
    <>
      <path {...S} d="M3 21V9l9-4 9 4v12Z" />
      <path {...S} d="M8 21v-7h8v7M8 17h8" />
    </>
  ),
  depot: (
    <>
      <path {...S} d="M2 17V9h11v8Z" />
      <path {...S} d="M13 11h4l4 3v3h-8Z" />
      <circle {...S} cx="7" cy="19" r="1.6" />
      <circle {...S} cx="17" cy="19" r="1.6" />
    </>
  ),
  carpark: (
    <>
      <rect {...S} x="3" y="3" width="18" height="18" rx="2" />
      <path {...S} d="M9.5 17V8h3.2a2.6 2.6 0 0 1 0 5.2H9.5" />
    </>
  ),
  garden: (
    <>
      <path {...S} d="M4 21c0-4 3-7 8-7s8 3 8 7Z" />
      <path {...S} d="M12 14V9M12 9c0-2.4 1.8-4 4-4 0 2.4-1.8 4-4 4ZM12 11c0-2-1.5-3.4-3.4-3.4C8.6 9.6 10 11 12 11Z" />
    </>
  ),
  subway: (
    <>
      <rect {...S} x="5" y="3" width="14" height="14" rx="3" />
      <path {...S} d="M5 10h14M9 13.5h.01M15 13.5h.01M8 17l-2 4M16 17l2 4" />
    </>
  ),
  tunnel: (
    <>
      <path {...S} d="M4 21V13a8 8 0 0 1 16 0v8Z" />
      <path {...S} d="M9 21v-7a3 3 0 0 1 6 0v7" />
    </>
  ),
  tower: (
    <>
      <path {...S} d="m8 21 4-13 4 13" />
      <path {...S} d="M9.4 16h5.2M6 4l6 4 6-4M12 8V3" />
    </>
  ),
  datacentre: (
    <>
      <rect {...S} x="4" y="3" width="16" height="18" rx="2" />
      <path {...S} d="M4 9h16M4 15h16M7 6h.01M7 12h.01M7 18h.01" />
    </>
  ),
  silo: (
    <>
      <path {...S} d="M7 21V8a5 5 0 0 1 10 0v13Z" />
      <path {...S} d="M7 12h10M7 16h10M3 21h18" />
    </>
  ),
  hatch: (
    <>
      <circle {...S} cx="12" cy="12" r="8" />
      <circle {...S} cx="12" cy="12" r="3" />
      <path {...S} d="M12 4v3M12 17v3M4 12h3M17 12h3" />
    </>
  ),

  /* ---- interface */
  gauge: (
    <>
      <path {...S} d="M4 18a8 8 0 1 1 16 0" />
      <path {...S} d="m12 18 4-6M3 18h4M17 18h4" />
    </>
  ),
  crew: (
    <>
      <circle {...S} cx="9" cy="8" r="3.2" />
      <path {...S} d="M3 20a6 6 0 0 1 12 0" />
      <path {...S} d="M16 5.6a3.2 3.2 0 0 1 0 4.8M17 14.4A6 6 0 0 1 21 20" />
    </>
  ),
  flask: (
    <>
      <path {...S} d="M10 3v6L5 18a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3" />
      <path {...S} d="M9 3h6M8 14h8" />
    </>
  ),
  more: (
    <>
      <circle {...S} cx="5" cy="12" r="1.4" />
      <circle {...S} cx="12" cy="12" r="1.4" />
      <circle {...S} cx="19" cy="12" r="1.4" />
    </>
  ),
  help: (
    <>
      <circle {...S} cx="12" cy="12" r="9" />
      <path {...S} d="M9.5 9.5a2.5 2.5 0 1 1 3.2 2.4c-.7.2-.7 1-.7 1.6M12 17h.01" />
    </>
  ),
  warning: (
    <>
      <path {...S} d="M12 3.5 21.5 20H2.5Z" />
      <path {...S} d="M12 10v4.5M12 17.5h.01" />
    </>
  ),
  clock: (
    <>
      <circle {...S} cx="12" cy="12" r="9" />
      <path {...S} d="M12 7v5.5l3.5 2" />
    </>
  ),
} as const;

export type IconName = keyof typeof GLYPHS;

/**
 * Every icon name used by the data has a drawing above. A name without one still renders a
 * deliberate geometric mark rather than a word, so adding content can never leave a label
 * like "grapnel" sitting in the interface where a picture should be.
 */
function resolve(name: string): IconName | null {
  return name in GLYPHS ? (name as IconName) : null;
}

/* A deterministic mark for any name without a drawing, so nothing ever renders as a word. */
function markFor(name: string): { points: string; rotation: number } {
  let hash = 2166136261;
  for (let i = 0; i < name.length; i += 1) {
    hash ^= name.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  const sides = 3 + (hash % 4);
  const rotation = hash % 90;
  const points: string[] = [];
  for (let i = 0; i < sides; i += 1) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
    points.push(`${(12 + Math.cos(angle) * 7).toFixed(1)},${(12 + Math.sin(angle) * 7).toFixed(1)}`);
  }
  return { points: points.join(' '), rotation };
}

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  /** Set when the icon is the only thing conveying meaning. */
  label?: string;
}

export const Icon = memo(function Icon({ name, size = 18, className = '', label }: IconProps) {
  const resolved = resolve(name);
  const aria = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true as const };

  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      focusable="false"
      {...aria}
    >
      {resolved ? GLYPHS[resolved] : <Mark name={name} />}
    </svg>
  );
});

function Mark({ name }: { name: string }) {
  const mark = markFor(name);
  return <polygon {...S} points={mark.points} transform={`rotate(${mark.rotation} 12 12)`} />;
}
