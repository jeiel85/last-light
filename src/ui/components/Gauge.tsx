import type { Breakdown, ResourceDef } from '@engine';
import { Bar } from './Bar';
import { BreakdownPopover } from './BreakdownPopover';

function fmt(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1000) return `${Math.round(n / 100) / 10}k`;
  if (abs >= 100) return String(Math.round(n));
  return String(Math.round(n * 10) / 10);
}

function netClass(net: number): string {
  if (net > 0.05) return 'tone-good';
  if (net < -0.05) return 'tone-bad';
  return 'tone-muted';
}

interface GaugeProps {
  def: ResourceDef;
  /** For a stock: what is in the store. For a flow: what is being supplied today. */
  value: number;
  /** For a stock: the storage cap. For a flow: today's draw. */
  cap: number;
  /** Yesterday's net change, if a day has been resolved. */
  net?: number;
  production?: Breakdown;
  consumption?: Breakdown;
  numeric?: boolean;
}

/**
 * One resource row in the status rail: level, headroom, direction of travel, and — behind
 * one click — exactly which facilities and people produced that number.
 *
 * Flow resources are drawn differently on purpose. Power is generated and spent within the
 * same day and never accumulates, so showing it as a store sitting at zero was both wrong
 * and directly contradicted the power figure on the dashboard. A flow shows supply against
 * draw, and its bar is a load meter.
 */
export function Gauge({ def, value, cap, net, production, consumption, numeric }: GaugeProps) {
  const isFlow = def.kind === 'flow';
  const supply = value;
  const draw = cap;

  const fraction = isFlow
    ? supply > 0
      ? Math.min(1, draw / supply)
      : draw > 0
        ? 1
        : 0
    : cap > 0
      ? value / cap
      : 0;

  const short = isFlow && draw > supply;
  const daysLeft = !isFlow && net !== undefined && net < -0.05 ? Math.floor(value / -net) : null;
  /*
   * Red means "this has a deadline on it", not "this number is small". A stock that nothing
   * is currently spending — the starting ammunition, say — is not an emergency, and marking
   * it as one teaches the player to stop reading the rail.
   */
  const critical = isFlow ? short : daysLeft !== null && daysLeft <= 4;

  const barColour = isFlow && short ? 'var(--alarm)' : def.colour;
  const barLabel = isFlow
    ? `${def.name}: ${Math.round(draw)} drawn of ${Math.round(supply)} supplied`
    : `${def.name} ${Math.round(fraction * 100)}%`;

  return (
    <div className={`gauge ${critical ? 'gauge-critical' : ''}`}>
      <div className="gauge-head">
        <span className="gauge-name">{def.name}</span>
        <span className="gauge-value num">
          {isFlow ? (
            <>
              {fmt(draw)}
              <span className="gauge-cap">/{fmt(supply)}</span>
              {def.unit ? <span className="gauge-unit">{def.unit}</span> : null}
            </>
          ) : (
            <>
              {fmt(value)}
              {def.unit ? <span className="gauge-unit">{def.unit}</span> : null}
              {numeric && <span className="gauge-cap">/{fmt(cap)}</span>}
            </>
          )}
        </span>
      </div>
      <Bar value={fraction} colour={barColour} label={barLabel} />
      <div className="gauge-foot">
        {isFlow ? (
          <span className={`num ${short ? 'tone-bad' : 'tone-muted'}`}>
            {short ? `${fmt(draw - supply)}${def.unit ?? ''} short` : `${fmt(supply - draw)}${def.unit ?? ''} spare`}
          </span>
        ) : (
          net !== undefined && (
            <span className={`num ${netClass(net)}`}>
              {net >= 0 ? '+' : ''}
              {fmt(net)}/day
            </span>
          )
        )}
        {daysLeft !== null && daysLeft < 10 && (
          <span className="gauge-eta tone-warn">{daysLeft}d left</span>
        )}
        <span className="gauge-inspect">
          {production && (
            <BreakdownPopover breakdown={production} title={`${def.name} — ${isFlow ? 'supply' : 'production'}`}>
              <span className="bd-chip">in</span>
            </BreakdownPopover>
          )}
          {consumption && (
            <BreakdownPopover breakdown={consumption} title={`${def.name} — ${isFlow ? 'draw' : 'consumption'}`}>
              <span className="bd-chip">out</span>
            </BreakdownPopover>
          )}
        </span>
      </div>
    </div>
  );
}
