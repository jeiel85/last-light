import type { ReactNode } from 'react';

interface StatProps {
  label: string;
  value: ReactNode;
  tone?: 'good' | 'bad' | 'warn' | 'info' | 'muted';
  hint?: string;
}

export function Stat({ label, value, tone, hint }: StatProps) {
  return (
    <div className="stat" title={hint}>
      <span className="label">{label}</span>
      <span className={`stat-value num ${tone ? `tone-${tone}` : ''}`}>{value}</span>
    </div>
  );
}

/** A 0–100 meter with a label, used for health/morale/fatigue on survivor cards. */
export function Meter({
  label,
  value,
  invert = false,
}: {
  label: string;
  value: number;
  /** When true, high values are bad (fatigue, stress). */
  invert?: boolean;
}) {
  const good = invert ? value < 40 : value > 60;
  const bad = invert ? value > 75 : value < 30;
  const colour = bad ? 'var(--alarm)' : good ? 'var(--phosphor)' : 'var(--amber)';
  return (
    <div className="meter">
      <span className="meter-label label">{label}</span>
      <span className="meter-track">
        <span className="meter-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: colour }} />
      </span>
      <span className="meter-num num">{Math.round(value)}</span>
    </div>
  );
}
