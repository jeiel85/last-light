import { useEffect, useRef, useState } from 'react';
import { BALANCE, SCENARIO_BY_ID, WEATHER } from '@engine';
import { useGameStore } from '@store/gameStore';
import { PANELS, useUiStore } from '@store/uiStore';
import { useBreakpoint } from '@ui/hooks/useBreakpoint';
import { announce } from '@ui/hooks/announce';
import { Button } from '@ui/components/Button';
import { Icon } from '@ui/components/Icon';
import { playCue } from '@ui/audio/cues';

/** Day, weather, navigation, and the one button that moves time. */
export function TopBar() {
  const state = useGameStore((s) => s.state);
  const endDay = useGameStore((s) => s.endDay);
  const confirmEndDay = useGameStore((s) => s.settings.confirmEndDay);
  const panel = useUiStore((s) => s.panel);
  const setPanel = useUiStore((s) => s.setPanel);
  const openModal = useUiStore((s) => s.openModal);
  const toggleLog = useUiStore((s) => s.toggleLog);
  const dayTick = useGameStore((s) => s.dayTick);
  const breakpoint = useBreakpoint();
  const [confirming, setConfirming] = useState(false);
  const [turning, setTurning] = useState(false);
  const first = useRef(true);

  /* A single quiet acknowledgement that time moved. Reduced motion zeroes the duration. */
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setTurning(true);
    const timer = window.setTimeout(() => setTurning(false), 700);
    return () => window.clearTimeout(timer);
  }, [dayTick]);

  if (!state) return null;
  const weather = WEATHER[state.weather.id];
  const forecast = state.weather.forecast ? WEATHER[state.weather.forecast] : null;
  const scenario = SCENARIO_BY_ID[state.scenarioId];
  const busy = state.phase !== 'planning';

  const run = () => {
    setConfirming(false);
    const result = endDay();
    playCue(result.ended ? 'death' : result.pendingEvents > 0 ? 'event' : 'day');
    announce(
      result.ended
        ? 'The run has ended.'
        : `Day ${state.day + 1}. ${result.pendingEvents} event${result.pendingEvents === 1 ? '' : 's'} to resolve.`,
    );
  };

  return (
    <header className={`topbar ${turning ? 'topbar-turning' : ''}`}>
      <div className="topbar-left">
        <span className="topbar-day">
          <span className="label">Day</span>
          <span className={`num topbar-daynum ${turning ? 'daynum-turn' : ''}`}>{state.day}</span>
        </span>
        <span className="topbar-weather" title={weather.description}>
          <span className="weather-dot" style={{ background: weather.colour }} />
          {weather.name}
          {forecast && <span className="tone-muted"> → {forecast.name}</span>}
        </span>
        {/* Once the winter starts to break, the run's horizon becomes visible. */}
        {state.day >= BALANCE.endings.attritionFromDay && (
          <span className="topbar-horizon tone-warn" title="The winter breaks, and the run resolves.">
            thaw ~day {BALANCE.endings.horizonDay}
          </span>
        )}
        {scenario && breakpoint === 'desktop' && (
          <span className="topbar-scenario tone-muted">{scenario.name}</span>
        )}
      </div>

      {breakpoint !== 'mobile' && (
        <nav className="topbar-nav" aria-label="Panels">
          {PANELS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`navtab ${p.id === panel ? 'navtab-active' : ''}`}
              onClick={() => setPanel(p.id)}
              aria-current={p.id === panel ? 'page' : undefined}
            >
              {p.label}
              <span className="navtab-key mono">{p.key}</span>
            </button>
          ))}
        </nav>
      )}

      <div className="topbar-right">
        {breakpoint !== 'desktop' && (
          <Button size="sm" tone="ghost" onClick={() => toggleLog()}>
            Log
          </Button>
        )}
        <Button size="sm" tone="ghost" onClick={() => openModal('saves')}>
          Save
        </Button>
        <Button size="sm" tone="ghost" onClick={() => openModal('settings')} aria-label="Settings">
          <Icon name="hardware" size={16} />
        </Button>
        {confirming ? (
          <span className="row gap-1">
            <Button size="sm" tone="primary" onClick={run} data-autofocus>
              Confirm
            </Button>
            <Button size="sm" tone="ghost" onClick={() => setConfirming(false)}>
              Wait
            </Button>
          </span>
        ) : (
          <Button
            tone="primary"
            disabled={busy}
            onClick={() => (confirmEndDay ? setConfirming(true) : run())}
            title={busy ? 'Resolve what is in front of you first.' : 'Advance to the next day'}
          >
            End day
          </Button>
        )}
      </div>
    </header>
  );
}
