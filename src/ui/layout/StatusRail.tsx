import { useMemo, useState } from 'react';
import { Facilities, RESOURCE_LIST, Resources } from '@engine';
import { useGameStore } from '@store/gameStore';
import { Gauge } from '@ui/components/Gauge';
import { useT } from '@ui/hooks/useTranslation';

/**
 * The status rail is the game's spine: eight resources, their direction of travel, and a
 * way into the arithmetic behind each one. On mobile it collapses to a strip that expands.
 *
 * Power is read from the power books rather than the resource store. It is a flow that is
 * generated and spent inside the same day and never accumulates, so its stored value is
 * permanently zero — showing that as a gauge was both meaningless and a direct
 * contradiction of the supply figure on the dashboard.
 */
export function StatusRail({ compact = false }: { compact?: boolean }) {
  const state = useGameStore((s) => s.state);
  const numericMode = useGameStore((s) => s.settings.numericMode);
  const [open, setOpen] = useState(false);
  const t = useT();

  const flows = useMemo(() => {
    if (!state) return null;
    return {
      production: Resources.computeProduction(state),
      consumption: Resources.computeConsumption(state),
      power: Facilities.powerReport(state),
    };
  }, [state]);

  if (!state || !flows) return null;

  const gauges = RESOURCE_LIST.map((def) => {
    const isFlow = def.kind === 'flow';
    const production = isFlow ? flows.power.capacity : flows.production[def.id];
    const consumption = isFlow ? flows.power.demand : flows.consumption[def.id];
    return (
      <Gauge
        key={def.id}
        def={def}
        value={isFlow ? flows.power.capacity.total : state.resources[def.id]}
        cap={isFlow ? flows.power.demand.total : state.resourceCaps[def.id]}
        {...(isFlow ? {} : { net: production.total - consumption.total })}
        production={production}
        consumption={consumption}
        numeric={numericMode}
      />
    );
  });

  if (!compact) {
    return (
      <aside className="rail" aria-label={t('rail.status')}>
        <h2 className="label rail-head">{t('rail.title')}</h2>
        {gauges}
      </aside>
    );
  }

  /* The collapsed strip flags what is actually about to run out, not what is merely low. */
  const critical = RESOURCE_LIST.filter((def) => {
    if (def.kind === 'flow') return flows.power.deficit > 0;
    const net = flows.production[def.id].total - flows.consumption[def.id].total;
    const stock = state.resources[def.id];
    if (stock <= 0) return true;
    return net < -0.05 && stock / -net < 5;
  });

  return (
    <div className="rail-strip">
      <button
        type="button"
        className="rail-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="label">{t('rail.title')}</span>
        <span className="rail-chips">
          {RESOURCE_LIST.filter((def) => def.kind !== 'flow')
            .slice(0, 5)
            .map((def) => (
              <span key={def.id} className="rail-chip num" style={{ borderColor: def.colour }}>
                {Math.round(state.resources[def.id])}
              </span>
            ))}
        </span>
        {critical.length > 0 && (
          <span className="tone-bad">▲ {critical.length}</span>
        )}
        <span className="rail-caret">{open ? '▴' : '▾'}</span>
      </button>
      {open && <div className="rail-expanded">{gauges}</div>}
    </div>
  );
}
