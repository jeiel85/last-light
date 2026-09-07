import { useEffect, useRef, useState } from 'react';
import { BALANCE, SCENARIO_BY_ID, WEATHER } from '@engine';
import { useGameStore } from '@store/gameStore';
import { PANELS, useUiStore } from '@store/uiStore';
import { useBreakpoint } from '@ui/hooks/useBreakpoint';
import { announce } from '@ui/hooks/announce';
import { Button } from '@ui/components/Button';
import { Icon } from '@ui/components/Icon';
import { playCue } from '@ui/audio/cues';
import { scenarioName, weatherDescription, weatherName } from '@i18n/content';
import { useT } from '@ui/hooks/useTranslation';

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
  const t = useT();
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
          <span className="label">{t('topbar.day')}</span>
          <span className={`num topbar-daynum ${turning ? 'daynum-turn' : ''}`}>{state.day}</span>
        </span>
        <span className="topbar-weather" title={weatherDescription(weather)}>
          <span className="weather-dot" style={{ background: weather.colour }} />
          {weatherName(weather)}
          {forecast && <span className="tone-muted"> → {weatherName(forecast)}</span>}
        </span>
        {/* Once the winter starts to break, the run's horizon becomes visible. */}
        {state.day >= BALANCE.endings.attritionFromDay && (
          <span className="topbar-horizon tone-warn" title={t('topbar.thawHint')}>
            {t('topbar.thaw', { day: BALANCE.endings.horizonDay })}
          </span>
        )}
        {scenario && breakpoint === 'desktop' && (
          <span className="topbar-scenario tone-muted">{scenarioName(scenario)}</span>
        )}
      </div>

      {breakpoint !== 'mobile' && (
        <nav className="topbar-nav" aria-label={t('panel.nav')}>
          {PANELS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`navtab ${p.id === panel ? 'navtab-active' : ''}`}
              onClick={() => setPanel(p.id)}
              aria-current={p.id === panel ? 'page' : undefined}
            >
              {t(p.messageKey)}
              <span className="navtab-key mono">{p.key}</span>
            </button>
          ))}
        </nav>
      )}

      <div className="topbar-right">
        {breakpoint !== 'desktop' && (
          <Button size="sm" tone="ghost" onClick={() => toggleLog()}>
            {t('topbar.log')}
          </Button>
        )}
        <Button size="sm" tone="ghost" onClick={() => openModal('saves')}>
          {t('topbar.save')}
        </Button>
        <Button size="sm" tone="ghost" onClick={() => openModal('settings')} aria-label={t('topbar.settings')}>
          <Icon name="hardware" size={16} />
        </Button>
        {confirming ? (
          <span className="row gap-1">
            <Button size="sm" tone="primary" onClick={run} data-autofocus>
              {t('topbar.confirm')}
            </Button>
            <Button size="sm" tone="ghost" onClick={() => setConfirming(false)}>
              {t('topbar.wait')}
            </Button>
          </span>
        ) : (
          <Button
            tone="primary"
            disabled={busy}
            onClick={() => (confirmEndDay ? setConfirming(true) : run())}
            title={busy ? t('topbar.endDayBlocked') : t('topbar.endDayHint')}
          >
            {t('topbar.endDay')}
          </Button>
        )}
      </div>
    </header>
  );
}
