interface BarProps {
  /** 0–1. */
  value: number;
  colour?: string;
  /** Draws a thin marker at this fraction, e.g. a threshold. */
  marker?: number;
  height?: number;
  label?: string;
}

export function Bar({ value, colour = 'var(--amber)', marker, height = 4, label }: BarProps) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className="bar"
      style={{ height }}
      role="img"
      aria-label={label ?? `${Math.round(pct)}%`}
    >
      <span className="bar-fill" style={{ width: `${pct}%`, background: colour }} />
      {marker !== undefined && (
        <span className="bar-marker" style={{ left: `${Math.max(0, Math.min(1, marker)) * 100}%` }} />
      )}
    </div>
  );
}
