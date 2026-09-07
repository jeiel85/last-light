import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Breakdown, BreakdownTerm } from '@engine';

/**
 * The single renderer for every derived number in the game.
 *
 * Because production, risk, efficiency, and craft time all return a `Breakdown`, making a
 * number inspectable is a matter of wrapping it here rather than writing bespoke tooltips.
 */

function termClass(term: BreakdownTerm): string {
  if (term.kind === 'penalty') return 'tone-bad';
  if (term.kind === 'bonus') return 'tone-good';
  if (term.kind === 'multiplier') return 'tone-info';
  return '';
}

function formatValue(term: BreakdownTerm): string {
  if (term.kind === 'multiplier') return `×${term.value.toFixed(2)}`;
  if (term.kind === 'info') return term.detail ? '' : String(round(term.value));
  const v = round(term.value);
  return v > 0 ? `+${v}` : String(v);
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

interface BreakdownPopoverProps {
  breakdown: Breakdown;
  /** What the total describes, shown as the popover heading. */
  title: string;
  children: React.ReactNode;
  unit?: string;
}

export function BreakdownPopover({ breakdown, title, children, unit }: BreakdownPopoverProps) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const id = useId();

  /*
   * The popover is portalled and positioned in viewport space. Several of its callers —
   * the status rail, the log — live inside scrolling containers that would otherwise clip
   * it, and a breakdown that cannot be read defeats the point of having one.
   */
  useLayoutEffect(() => {
    if (!open) {
      setAnchor(null);
      return;
    }
    const place = () => {
      const trigger = wrapRef.current?.getBoundingClientRect();
      if (!trigger) return;
      const width = popRef.current?.offsetWidth ?? 320;
      const height = popRef.current?.offsetHeight ?? 200;
      const left = Math.max(8, Math.min(window.innerWidth - width - 8, trigger.right - width));
      const below = trigger.bottom + 6;
      const top = below + height > window.innerHeight - 8 ? Math.max(8, trigger.top - height - 6) : below;
      setAnchor({ top, left });
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapRef.current?.contains(target) || popRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span className="bd-wrap" ref={wrapRef}>
      <button
        type="button"
        className="bd-trigger"
        aria-expanded={open}
        aria-controls={id}
        /* The visible content is a bare number, so the control needs its own name. */
        aria-label={`Inspect ${title}`}
        onClick={() => setOpen((v) => !v)}
        title={`Inspect: ${title}`}
      >
        {children}
      </button>
      {open &&
        createPortal(
          <div
            className="bd-pop"
            id={id}
            role="dialog"
            aria-label={`${title} breakdown`}
            ref={popRef}
            style={anchor ? { top: anchor.top, left: anchor.left } : { visibility: 'hidden' }}
          >
          <header className="bd-pop-head">
            <span className="label">{title}</span>
            <span className="num bd-total">
              {round(breakdown.total)}
              {unit ? ` ${unit}` : ''}
            </span>
          </header>
          <ul className="bd-terms">
            {breakdown.terms.length === 0 && <li className="tone-muted">No contributing terms.</li>}
            {breakdown.terms.map((term, i) => (
              <li key={`${term.label}-${i}`} className={termClass(term)}>
                <span className="bd-term-label">{term.label}</span>
                <span className="num bd-term-value">{formatValue(term)}</span>
                {term.detail && <span className="bd-term-detail">{term.detail}</span>}
                {term.fixHint && <span className="bd-term-fix">→ {term.fixHint}</span>}
              </li>
            ))}
            </ul>
          </div>,
          document.body,
        )}
    </span>
  );
}
