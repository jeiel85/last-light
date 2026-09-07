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
        out.push({ id: `out-${def.id}`, tone: 'bad', text: `${def.name} is gone. ${def.failure}` });
      } else if (spending) {
        const daysLeft = Math.floor(value / -net);
        if (daysLeft <= 4) {
          out.push({
            id: `low-${def.id}`,
            tone: daysLeft <= 1 ? 'bad' : 'warn',
            text:
              daysLeft <= 0
                ? `${def.name} runs out tonight.`
                : `${def.name} runs out in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`,
          });
        }
      }
    }
    if (power.deficit > 0) {
      out.push({
        id: 'power',
        tone: 'warn',
        text: `Power is short by ${Math.round(power.deficit)}. ${power.brownedOut.length} facilities browned out.`,
        fix: { label: 'Base', go: () => setPanel('base') },
      });
    }
    for (const survivor of Survivors.livingSurvivors(state)) {
      if (survivor.health < 30) {
        out.push({
          id: `hurt-${survivor.id}`,
          tone: 'bad',
          text: `${survivor.name} is badly hurt.`,
          fix: { label: 'Crew', go: () => setPanel('crew') },
        });
      } else if (survivor.conditions.some((c) => c.severity > 60 && !c.treated)) {
        out.push({
          id: `ill-${survivor.id}`,
          tone: 'warn',
          text: `${survivor.name} needs treatment.`,
          fix: { label: 'Crew', go: () => setPanel('crew') },
        });
      } else if (survivor.morale < 25) {
        out.push({ id: `morale-${survivor.id}`, tone: 'warn', text: `${survivor.name} is close to breaking.` });
      }
    }
    const idle = Survivors.livingSurvivors(state).filter((s) => s.assignment.kind === 'idle');
    if (idle.length > 0) {
      out.push({
        id: 'idle',
        tone: 'info',
        text: `${idle.length} ${idle.length === 1 ? 'person is' : 'people are'} unassigned.`,
        fix: { label: 'Crew', go: () => setPanel('crew') },
      });
    }
    for (const facility of state.facilities) {
      if (facility.status === 'damaged') {
        out.push({
          id: `dmg-${facility.id}`,
          tone: 'warn',
          text: `${Facilities.facilityDef(facility).name} has broken down.`,
          fix: { label: 'Base', go: () => setPanel('base') },
        });
      }
    }
    return out.slice(0, 8);
  }, [state, flows, power, setPanel]);

  const weather = WEATHER[state.weather.id];
  const away = state.expeditions.filter((e) => !e.resolved);
  const activeResearch = state.research.active;
  const activeResearchName = activeResearch ? (RESEARCH_BY_ID[activeResearch.id]?.name ?? activeResearch.id) : null;

  return (
    <div className="grid-2">
      <Guidance
        notes={[
          {
            id: 'intro.day',
            title: 'One decision at a time',
            body: (
              <>
                Assign your crew, spend what you can afford, then press <strong>End day</strong>.
                Everything else — production, hunger, wear, and whatever the world sends — resolves
                overnight.
              </>
            ),
          },
          {
            id: 'intro.shortage',
            when: alerts.some((a) => a.id.startsWith('low-') || a.id.startsWith('out-')),
            title: 'Something is running out',
            body: (
              <>
                A store being spent faster than it is replaced has a deadline on it. The gauge counts
                the days left at the current rate; the breakdown behind it names what to change.
              </>
            ),
          },
          {
            id: 'intro.inspect',
            when: Boolean(report),
            title: 'Every number opens up',
            body: (
              <>
                The <em>in</em> and <em>out</em> chips beside each store show exactly which facilities
                and people produced that figure. Nothing here is a mystery number.
              </>
            ),
          },
          {
            id: 'intro.horizon',
            when: state.day >= BALANCE.endings.attritionFromDay,
            title: 'The winter is breaking',
            body: (
              <>
                Around day {BALANCE.endings.horizonDay} the thaw comes and the run resolves however it
                stands. Until then everything wears faster — this is the stretch where a vault that has
                been coasting starts to come apart.
              </>
            ),
          },
        ]}
      />

      <Panel title="Situation" note={`Day ${state.day}`}>
        <div className="stat-row">
          <Stat label="Crew" value={Survivors.livingSurvivors(state).length} />
          <Stat label="Morale" value={Math.round(crew.avgMorale)} tone={crew.avgMorale < 35 ? 'bad' : undefined} />
          <Stat label="Health" value={Math.round(crew.avgHealth)} tone={crew.avgHealth < 45 ? 'bad' : undefined} />
          <Stat label="Working" value={crew.workingCount} />
          <Stat label="Resting" value={crew.restingCount} />
          <Stat label="Away" value={away.length} />
        </div>
        <hr className="divider" />
        <div className="power-row">
          <span className="label">Power</span>
          <BreakdownPopover breakdown={power.capacity} title="Power capacity" unit="kW">
            <span className="num">{Math.round(power.capacity.total)}</span>
          </BreakdownPopover>
          <span className="tone-muted">supply /</span>
          <BreakdownPopover breakdown={power.demand} title="Power demand" unit="kW">
            <span className={`num ${power.deficit > 0 ? 'tone-bad' : ''}`}>{Math.round(power.demand.total)}</span>
          </BreakdownPopover>
          <span className="tone-muted">draw</span>
        </div>
        <Bar
          value={power.demand.total / Math.max(1, power.capacity.total)}
          colour={power.deficit > 0 ? 'var(--alarm)' : 'var(--res-power)'}
          height={6}
          label="Power load"
        />
        <hr className="divider" />
        <p className="prose">
          <strong>{weather.name}.</strong> {weather.description}
        </p>
        {activeResearch ? (
          <div className="research-strip">
            <span className="label">Researching</span>
            <span className="truncate">{activeResearchName}</span>
            <Bar
              value={activeResearch.progress / Math.max(1, activeResearch.required)}
              colour="var(--violet)"
            />
            <BreakdownPopover breakdown={insight} title="Insight per day">
              <span className="num">{Math.round(insight.total * 10) / 10}/day</span>
            </BreakdownPopover>
          </div>
        ) : (
          <Button size="sm" onClick={() => setPanel('research')}>
            No active research — choose a project
          </Button>
        )}
      </Panel>

      <Panel title="Attention" note={alerts.length ? String(alerts.length) : 'clear'}>
        {alerts.length === 0 && <EmptyState>Nothing is on fire. That will change.</EmptyState>}
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

      <Panel title="Overnight" note={report ? `Day ${report.day}` : '—'}>
        {!report && <EmptyState>End your first day to see the night report.</EmptyState>}
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
                <li className="tone-muted">A quiet night.</li>
              )}
            </ul>
          </>
        )}
      </Panel>

      <Panel
        title="Crew at a glance"
        actions={
          <Button size="sm" onClick={() => setPanel('crew')}>
            Manage
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
                      {facility ? Facilities.facilityDef(facility).name : survivor.assignment.kind}
                    </span>
                  </span>
                  <span className="mini-crew-bars">
                    <Bar value={survivor.health / 100} colour="var(--alarm)" height={3} label="Health" />
                    <Bar value={survivor.morale / 100} colour="var(--phosphor)" height={3} label="Morale" />
                    <Bar value={survivor.fatigue / 100} colour="var(--amber)" height={3} label="Fatigue" />
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
