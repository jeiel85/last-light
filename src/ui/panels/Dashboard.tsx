import { useMemo } from 'react';
import {
  BALANCE,
  crewSummary,
  Facilities,
  RESEARCH_BY_ID,
  RESOURCE_LIST,
  Resources,
  Survivors,
  WEATHER,
  Research as ResearchSystem,
} from '@engine';
import { useGameStore } from '@store/gameStore';
import { useUiStore } from '@store/uiStore';
import { Panel, EmptyState } from '@ui/components/Panel';
import { Stat } from '@ui/components/Stat';
import { Bar } from '@ui/components/Bar';
import { Button } from '@ui/components/Button';
import { BreakdownPopover } from '@ui/components/BreakdownPopover';
import { Portrait } from '@ui/components/Portrait';
import { Guidance } from '@ui/components/Guidance';
import { useT } from '@ui/hooks/useTranslation';
import {
  facilityName as facilityLabel,
  researchName,
  resourceFailure,
  resourceName,
  weatherDescription,
  weatherName,
} from '@i18n/content';

interface Alert {
  id: string;
  tone: 'bad' | 'warn' | 'info';
  text: string;
  fix?: { label: string; go: () => void };
}

/** The daily briefing: what is wrong, who is struggling, and what finished overnight. */
export function Dashboard() {
  const state = useGameStore((s) => s.state)!;
  const setPanel = useUiStore((s) => s.setPanel);
  const selectSurvivor = useUiStore((s) => s.selectSurvivor);
  const openModal = useUiStore((s) => s.openModal);
  const t = useT();

  const crew = useMemo(() => crewSummary(state), [state]);
  const power = useMemo(() => Facilities.powerReport(state), [state]);
  const insight = useMemo(() => ResearchSystem.insightRate(state), [state]);
  const report = state.lastReport;

  const flows = useMemo(
    () => ({
      production: Resources.computeProduction(state),
      consumption: Resources.computeConsumption(state),
    }),
    [state],
  );

  const alerts = useMemo<Alert[]>(() => {
    const out: Alert[] = [];
    /*
     * A store is "running out" when it is actually being spent faster than it is replaced —
     * not merely when it sits low against its cap. Ammunition at 8 of 60 on day one is the
     * starting kit, not an emergency, and flagging it teaches the player to ignore alerts.
     */
    for (const def of RESOURCE_LIST) {
      if (def.kind === 'flow') continue;
      const value = state.resources[def.id];
      const net = flows.production[def.id].total - flows.consumption[def.id].total;
      const spending = net < -0.05;

      if (value <= 0 && spending) {
        out.push({
          id: `out-${def.id}`,
          tone: 'bad',
          text: t('alert.gone', { name: resourceName(def), failure: resourceFailure(def) }),
        });
      } else if (spending) {
        const daysLeft = Math.floor(value / -net);
        if (daysLeft <= 4) {
          const name = resourceName(def);
          out.push({
            id: `low-${def.id}`,
            tone: daysLeft <= 1 ? 'bad' : 'warn',
            text:
              daysLeft <= 0
                ? t('alert.runsOutTonight', { name })
                : daysLeft === 1
                  ? t('alert.runsOutInOne', { name })
                  : t('alert.runsOutIn', { name, days: daysLeft }),
          });
        }
      }
    }
    if (power.deficit > 0) {
      out.push({
        id: 'power',
        tone: 'warn',
        text: t('alert.powerShort', {
          amount: Math.round(power.deficit),
          count: power.brownedOut.length,
        }),
        fix: { label: t('panel.base'), go: () => setPanel('base') },
      });
    }
    for (const survivor of Survivors.livingSurvivors(state)) {
      if (survivor.health < 30) {
        out.push({
          id: `hurt-${survivor.id}`,
          tone: 'bad',
          text: t('alert.badlyHurt', { name: survivor.name }),
          fix: { label: t('panel.crew'), go: () => setPanel('crew') },
        });
      } else if (survivor.conditions.some((c) => c.severity > 60 && !c.treated)) {
        out.push({
          id: `ill-${survivor.id}`,
          tone: 'warn',
          text: t('alert.needsTreatment', { name: survivor.name }),
          fix: { label: t('panel.crew'), go: () => setPanel('crew') },
        });
      } else if (survivor.morale < 25) {
        out.push({
          id: `morale-${survivor.id}`,
          tone: 'warn',
          text: t('alert.breaking', { name: survivor.name }),
        });
      }
    }
    const idle = Survivors.livingSurvivors(state).filter((s) => s.assignment.kind === 'idle');
    if (idle.length > 0) {
      out.push({
        id: 'idle',
        tone: 'info',
        text: idle.length === 1 ? t('alert.idleOne') : t('alert.idleMany', { count: idle.length }),
        fix: { label: t('panel.crew'), go: () => setPanel('crew') },
      });
    }
    for (const facility of state.facilities) {
      if (facility.status === 'damaged') {
        out.push({
          id: `dmg-${facility.id}`,
          tone: 'warn',
          text: t('alert.brokenDown', { name: facilityLabel(Facilities.facilityDef(facility)) }),
          fix: { label: t('panel.base'), go: () => setPanel('base') },
        });
      }
    }
    return out.slice(0, 8);
  }, [state, flows, power, setPanel, t]);

  const weather = WEATHER[state.weather.id];
  const away = state.expeditions.filter((e) => !e.resolved);
  const activeResearch = state.research.active;
  const activeResearchDef = activeResearch ? RESEARCH_BY_ID[activeResearch.id] : undefined;
  const activeResearchName = activeResearchDef
    ? researchName(activeResearchDef)
    : (activeResearch?.id ?? null);

  return (
    <div className="grid-2">
      <Guidance
        notes={[
          {
            id: 'intro.day',
            title: t('guidance.day.title'),
            body: t('guidance.day.body'),
          },
          {
            id: 'intro.shortage',
            when: alerts.some((a) => a.id.startsWith('low-') || a.id.startsWith('out-')),
            title: t('guidance.shortage.title'),
            body: t('guidance.shortage.body'),
          },
          {
            id: 'intro.inspect',
            when: Boolean(report),
            title: t('guidance.inspect.title'),
            body: t('guidance.inspect.body'),
          },
          {
            id: 'intro.horizon',
            when: state.day >= BALANCE.endings.attritionFromDay,
            title: t('guidance.horizon.title'),
            body: t('guidance.horizon.body', { day: BALANCE.endings.horizonDay }),
          },
        ]}
      />

      <Panel title={t('dash.situation')} note={`${t('topbar.day')} ${state.day}`}>
        <div className="stat-row">
          <Stat label={t('dash.crew')} value={Survivors.livingSurvivors(state).length} />
          <Stat
            label={t('dash.morale')}
            value={Math.round(crew.avgMorale)}
            tone={crew.avgMorale < 35 ? 'bad' : undefined}
          />
          <Stat
            label={t('dash.health')}
            value={Math.round(crew.avgHealth)}
            tone={crew.avgHealth < 45 ? 'bad' : undefined}
          />
          <Stat label={t('dash.working')} value={crew.workingCount} />
          <Stat label={t('dash.resting')} value={crew.restingCount} />
          <Stat label={t('dash.away')} value={away.length} />
        </div>
        <hr className="divider" />
        <div className="power-row">
          <span className="label">{t('dash.power')}</span>
          <BreakdownPopover breakdown={power.capacity} title={t('dash.powerCapacity')} unit="kW">
            <span className="num">{Math.round(power.capacity.total)}</span>
          </BreakdownPopover>
          <span className="tone-muted">{t('dash.supply')}</span>
          <BreakdownPopover breakdown={power.demand} title={t('dash.powerDemand')} unit="kW">
            <span className={`num ${power.deficit > 0 ? 'tone-bad' : ''}`}>{Math.round(power.demand.total)}</span>
          </BreakdownPopover>
          <span className="tone-muted">{t('dash.draw')}</span>
        </div>
        <Bar
          value={power.demand.total / Math.max(1, power.capacity.total)}
          colour={power.deficit > 0 ? 'var(--alarm)' : 'var(--res-power)'}
          height={6}
          label={t('dash.powerLoad')}
        />
        <hr className="divider" />
        <p className="prose">
          <strong>{weatherName(weather)}.</strong> {weatherDescription(weather)}
        </p>
        {activeResearch ? (
          <div className="research-strip">
            <span className="label">{t('dash.researching')}</span>
            <span className="truncate">{activeResearchName}</span>
            <Bar
              value={activeResearch.progress / Math.max(1, activeResearch.required)}
              colour="var(--violet)"
            />
            <BreakdownPopover breakdown={insight} title={t('dash.insightPerDay')}>
              <span className="num">
                {t('dash.insightRate', { value: Math.round(insight.total * 10) / 10 })}
              </span>
            </BreakdownPopover>
          </div>
        ) : (
          <Button size="sm" onClick={() => setPanel('research')}>
            {t('dash.noResearch')}
          </Button>
        )}
      </Panel>

      <Panel
        title={t('dash.attention')}
        note={alerts.length ? String(alerts.length) : t('dash.attentionClear')}
      >
        {alerts.length === 0 && <EmptyState>{t('dash.allWell')}</EmptyState>}
        <ul className="alert-list">
          {alerts.map((alert) => (
            <li key={alert.id} className={`alert alert-${alert.tone}`}>
              <span className="alert-text">{alert.text}</span>
              {alert.fix && (
                <button type="button" className="alert-fix" onClick={alert.fix.go}>
                  {alert.fix.label} →
                </button>
              )}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title={t('dash.overnight')} note={report ? `${t('topbar.day')} ${report.day}` : '—'}>
        {!report && <EmptyState>{t('dash.firstNight')}</EmptyState>}
        {report && (
          <>
            {report.deaths.length > 0 && (
              <ul className="death-list">
                {report.deaths.map((d) => (
                  <li key={d.survivorId} className="tone-bad">
                    {d.name} — {d.cause}
                  </li>
                ))}
              </ul>
            )}
            <ul className="note-list">
              {report.survivorNotes.slice(0, 8).map((note, i) => (
                <li
                  key={`${note.survivorId}-${i}`}
                  className={`tone-${note.tone === 'neutral' ? 'muted' : note.tone}`}
                >
                  {note.text}
                </li>
              ))}
              {report.facilityNotes.slice(0, 6).map((note, i) => (
                <li key={`f-${i}`} className="tone-muted">
                  {note}
                </li>
              ))}
              {report.survivorNotes.length === 0 && report.facilityNotes.length === 0 && (
                <li className="tone-muted">{t('dash.quietNight')}</li>
              )}
            </ul>
          </>
        )}
      </Panel>

      <Panel
        title={t('dash.crewGlance')}
        actions={
          <Button size="sm" onClick={() => setPanel('crew')}>
            {t('dash.manage')}
          </Button>
        }
      >
        <ul className="mini-crew">
          {Survivors.livingSurvivors(state).map((survivor) => {
            const facility =
              survivor.assignment.kind === 'facility' && survivor.assignment.facilityId
                ? state.facilities.find((f) => f.id === survivor.assignment.facilityId)
                : undefined;
            return (
              <li key={survivor.id}>
                <button
                  type="button"
                  className="mini-crew-btn"
                  onClick={() => {
                    selectSurvivor(survivor.id);
                    openModal('survivor', survivor.id);
                  }}
                >
                  <Portrait survivor={survivor} size={32} />
                  <span className="col grow">
                    <span className="mini-crew-name truncate">{survivor.name}</span>
                    <span className="mini-crew-role tone-muted truncate">
                      {facility
                        ? facilityLabel(Facilities.facilityDef(facility))
                        : survivor.assignment.kind === 'rest'
                          ? t('crew.rest')
                          : t('crew.unassigned')}
                    </span>
                  </span>
                  <span className="mini-crew-bars">
                    <Bar
                      value={survivor.health / 100}
                      colour="var(--alarm)"
                      height={3}
                      label={t('meter.health')}
                    />
                    <Bar
                      value={survivor.morale / 100}
                      colour="var(--phosphor)"
                      height={3}
                      label={t('meter.morale')}
                    />
                    <Bar
                      value={survivor.fatigue / 100}
                      colour="var(--amber)"
                      height={3}
                      label={t('meter.fatigue')}
                    />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>
    </div>
  );
}
