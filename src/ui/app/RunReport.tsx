import { useMemo } from 'react';
import { DIFFICULTY_BY_ID, ENDING_BY_ID, SCENARIO_BY_ID } from '@engine';
import { useGameStore } from '@store/gameStore';
import { useUiStore } from '@store/uiStore';
import { Button } from '@ui/components/Button';
import { Panel } from '@ui/components/Panel';

const STAT_LABELS: Record<string, string> = {
  daysSurvived: 'Days survived',
  survivorsLost: 'People lost',
  survivorsRecruited: 'People taken in',
  locationsExplored: 'Sites explored',
  expeditionsCompleted: 'Expeditions completed',
  resourcesGathered: 'Resources hauled home',
  eventsEncountered: 'Decisions faced',
  hardChoicesMade: 'Hard choices made',
  injuriesTreated: 'Injuries treated',
  illnessesCured: 'Illnesses cured',
  facilitiesBuilt: 'Facilities built',
  itemsCrafted: 'Items crafted',
  researchCompleted: 'Projects finished',
  loreFound: 'Fragments recovered',
  fightsWon: 'Fights won',
  brownoutDays: 'Days in brownout',
  starvationDays: 'Days without food',
};

/** The end-of-run report: the epilogue, the memorial, and what the run was worth. */
export function RunReport() {
  const state = useGameStore((s) => s.state)!;
  const profile = useGameStore((s) => s.profile);
  const abandonRun = useGameStore((s) => s.abandonRun);
  const setScreen = useUiStore((s) => s.setScreen);

  const ending = state.ending!;
  const def = ENDING_BY_ID[ending.endingId];
  const scenario = SCENARIO_BY_ID[state.scenarioId];
  const difficulty = DIFFICULTY_BY_ID[state.difficultyId];

  const stats = useMemo(
    () =>
      Object.entries(state.stats)
        .filter(([key, value]) => key in STAT_LABELS && (value as number) > 0)
        .map(([key, value]) => ({ label: STAT_LABELS[key]!, value: Math.round(value as number) })),
    [state.stats],
  );

  return (
    <main className="report">
      <div className="report-inner">
        <p className="eyebrow">
          {scenario?.name} · {difficulty?.name} · seed {state.seed}
        </p>
        <h1 className="report-title" style={{ color: def?.colour }}>
          {def?.name ?? ending.endingId}
        </h1>
        <p className="report-summary">{ending.summary}</p>
        <p className="prose report-epilogue">{ending.epilogue}</p>

        <div className="report-grid">
          <Panel title="The run">
            <ul className="kv">
              {stats.map((row) => (
                <li key={row.label}>
                  <span>{row.label}</span>
                  <span className="num">{row.value}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Who walked out" note={`${ending.survivorNames.length}`}>
            {ending.survivorNames.length === 0 ? (
              <p className="tone-muted">Nobody.</p>
            ) : (
              <ul className="name-list">
                {ending.survivorNames.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            )}
            {ending.memorial.length > 0 && (
              <>
                <hr className="divider" />
                <h3 className="label">Memorial</h3>
                <ul className="name-list">
                  {ending.memorial.map((entry) => (
                    <li key={`${entry.name}-${entry.day}`} className="tone-bad">
                      {entry.name} — day {entry.day}, {entry.cause}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Panel>

          <Panel title="Legacy" note={`${profile.legacy} banked`}>
            <p className="report-legacy num">+{ending.legacyAwarded}</p>
            <p className="hint">
              Spend it from the menu on scenarios, traits, and starting kits. What you learned this run
              carries over whether you spend it or not.
            </p>
          </Panel>
        </div>

        <div className="row gap-2 report-actions">
          <Button
            tone="primary"
            size="lg"
            onClick={() => {
              abandonRun();
              setScreen('setup');
            }}
          >
            Run it again
          </Button>
          <Button
            size="lg"
            onClick={() => {
              abandonRun();
              setScreen('menu');
            }}
          >
            Back to the menu
          </Button>
        </div>
      </div>
    </main>
  );
}
