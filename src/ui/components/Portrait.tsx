import { useMemo } from 'react';
import type { Survivor } from '@engine';
import { useT } from '@ui/hooks/useTranslation';

/**
 * Procedural survivor portraits.
 *
 * Every survivor carries a `portraitSeed`, so the same person always renders the same
 * face across saves. The drawing is deliberately abstract — silhouette, hair mass, and a
 * few marks — because vaguely-suggested faces read better at 32px than detailed ones.
 */

function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SKIN = ['#c99a72', '#a87550', '#7c5336', '#e0b48c', '#5f3c26', '#d8a17a', '#8d6244'];
const HAIR = ['#1b1613', '#3a2b21', '#6b4a2f', '#8a8378', '#c9c2b6', '#2a2f36', '#59321f'];

export function Portrait({ survivor, size = 40 }: { survivor: Survivor; size?: number }) {
  const t = useT();
  const art = useMemo(() => {
    const rnd = mulberry(survivor.portraitSeed);
    const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)]!;
    return {
      skin: pick(SKIN),
      hair: pick(HAIR),
      hairStyle: Math.floor(rnd() * 5),
      jaw: 0.82 + rnd() * 0.32,
      brow: 30 + rnd() * 8,
      eyeGap: 8.5 + rnd() * 3,
      scar: rnd() < 0.18,
      glasses: rnd() < 0.16,
      beard: rnd() < 0.28,
    };
  }, [survivor.portraitSeed]);

  const dead = !survivor.alive;
  const hurt = survivor.health < 45;

  return (
    <svg
      className={`portrait ${dead ? 'portrait-dead' : ''}`}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={t('survivor.portrait', { name: `${survivor.name} ${survivor.surname}` })}
    >
      <defs>
        <clipPath id={`pc-${survivor.id}`}>
          <circle cx="24" cy="24" r="22" />
        </clipPath>
      </defs>
      <circle cx="24" cy="24" r="22" fill="var(--raised)" />
      <g clipPath={`url(#pc-${survivor.id})`}>
        <rect x="0" y="0" width="48" height="48" fill="var(--panel-2)" />
        {/* shoulders */}
        <ellipse cx="24" cy="52" rx="20" ry="14" fill="var(--bezel)" />
        {/* head */}
        <ellipse cx="24" cy="24" rx={13 * art.jaw} ry="15.5" fill={art.skin} />
        {/* hair */}
        {art.hairStyle === 0 && <path d="M10 22c0-9 6-13 14-13s14 4 14 13c-3-5-8-7-14-7s-11 2-14 7z" fill={art.hair} />}
        {art.hairStyle === 1 && <path d="M10 24c-1-11 6-16 14-16s15 5 14 16c-2-8-6-10-14-10s-12 2-14 10z" fill={art.hair} />}
        {art.hairStyle === 2 && <path d="M11 21c2-8 8-11 13-11s11 3 13 11c-2-3-5-4-6-2-3-4-14-4-16 0-1-2-3-1-4 2z" fill={art.hair} />}
        {art.hairStyle === 3 && <path d="M12 20c3-7 8-10 12-10s10 3 12 10l2 14c-2-9-5-11-14-11S12 25 10 34z" fill={art.hair} />}
        {art.hairStyle === 4 && <path d="M13 19c4-6 18-6 22 0-2-1-4 0-5-1-4 2-9 2-13 0-1 1-3 0-4 1z" fill={art.hair} />}
        {/* eyes */}
        <circle cx={24 - art.eyeGap / 2} cy="25" r="1.7" fill="#12181a" />
        <circle cx={24 + art.eyeGap / 2} cy="25" r="1.7" fill="#12181a" />
        {/* brows */}
        <rect x={24 - art.eyeGap / 2 - 3} y={art.brow / 1.55} width="6" height="1.2" rx="0.6" fill={art.hair} />
        <rect x={24 + art.eyeGap / 2 - 3} y={art.brow / 1.55} width="6" height="1.2" rx="0.6" fill={art.hair} />
        {/* mouth */}
        <path
          d={`M${24 - 4} 32 q4 ${survivor.morale > 55 ? 3 : survivor.morale < 30 ? -2 : 1} 8 0`}
          stroke="#3a2620"
          strokeWidth="1.1"
          fill="none"
          strokeLinecap="round"
        />
        {art.beard && <path d="M14 28c2 8 6 11 10 11s8-3 10-11c-2 6-6 8-10 8s-8-2-10-8z" fill={art.hair} opacity="0.85" />}
        {art.glasses && (
          <g stroke="var(--ink-3)" strokeWidth="0.9" fill="none">
            <circle cx={24 - art.eyeGap / 2} cy="25" r="4" />
            <circle cx={24 + art.eyeGap / 2} cy="25" r="4" />
            <line x1={24 - art.eyeGap / 2 + 4} y1="25" x2={24 + art.eyeGap / 2 - 4} y2="25" />
          </g>
        )}
        {art.scar && <line x1="30" y1="18" x2="27" y2="28" stroke="#7d4a41" strokeWidth="1" />}
        {hurt && survivor.alive && <rect x="8" y="18" width="32" height="3.5" rx="1.5" fill="#d9d3c4" opacity="0.9" />}
      </g>
      <circle cx="24" cy="24" r="22" fill="none" stroke="var(--rule-strong)" strokeWidth="1" />
      {dead && (
        <g stroke="var(--alarm)" strokeWidth="1.6" opacity="0.8">
          <line x1="12" y1="12" x2="36" y2="36" />
          <line x1="36" y1="12" x2="12" y2="36" />
        </g>
      )}
    </svg>
  );
}
