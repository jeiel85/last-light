import { useMemo } from 'react';
import { DIFFICULTY_BY_ID, ENDING_BY_ID, SCENARIO_BY_ID } from '@engine';
import { useGameStore } from '@store/gameStore';
import { useUiStore } from '@store/uiStore';
import { Button } from '@ui/components/Button';
import { Panel } from '@ui/components/Panel';
import { useT } from '@ui/hooks/useTranslation';
import type { MessageKey } from '@i18n';
import {
  difficultyName,
  endingEpilogue,
  endingName,
  endingSummary,
  scenarioName,
} from '@i18n/content';

/**
 * Which figures the report shows, in the order it shows them.
 *
 * This is a shorter list than the archive's: the report is the story of the run, not the
 * full ledger, and a stat that stayed at zero says nothing worth a line.
 */
const REPORT_STATS = [
  'daysSurvived',
  'survivorsLost',
  'survivorsRecruited',
  'locationsExplored',
  'expeditionsCompleted',
  'resourcesGathered',
  'eventsEncountered',
  'hardChoicesMade',
  'injuriesTreated',
  'illnessesCured',
  'facilitiesBuilt',
  'itemsCrafted',
  'researchCompleted',
  'loreFound',
  'fightsWon',
  'brownoutDays',
  'starvationDays',
] as const;

/** The end-of-run report: the epilogue, the memorial, and what the run was worth. */
export function RunReport() {
  const state = useGameStore((s) => s.state)!;
  const profile = useGameStore((s) => s.profile);
  const abandonRun = useGameStore((s) => s.abandonRun);
  const setScreen = useUiStore((s) => s.setScreen);
  const t = useT();

  const ending = state.ending!;
  const def = ENDING_BY_ID[ending.endingId];
  const scenario = SCENARIO_BY_ID[state.scenarioId];
  const difficulty = DIFFICULTY_BY_ID[state.difficultyId];

  const stats = useMemo(
    () =>
      REPORT_STATS.filter((key) => (state.stats[key] ?? 0) > 0).map((key) => ({
        key,
        label: t(`stat.${key}` as MessageKey),
        value: Math.round(state.stats[key] ?? 0),
      })),
    [state.stats, t],
  );

  return (
    <main className="report">
      <div className="report-inner">
        <p className="eyebrow">
          {t('report.seed', {
            scenario: scenario ? scenarioName(scenario) : state.scenarioId,
            difficulty: difficulty ? difficultyName(difficulty) : state.difficultyId,
            seed: state.seed,
          })}
        </p>
        <h1 className="report-title" style={{ color: def?.colour }}>
          {def ? endingName(def) : ending.endingId}
        </h1>
        <p className="report-summary">{def ? endingSummary(def) : ending.summary}</p>
        <p className="prose report-epilogue">{def ? endingEpilogue(def) : ending.epilogue}</p>

        <div className="report-grid">
          <Panel title={t('report.theRun')}>
            <ul className="kv">
              {stats.map((row) => (
                <li key={row.key}>
                  <span>{row.label}</span>
                  <span className="num">{row.value}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title={t('report.whoWalkedOut')} note={`${ending.survivorNames.length}`}>
            {ending.survivorNames.length === 0 ? (
              <p className="tone-muted">{t('report.nobody')}</p>
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
                <h3 className="label">{t('report.memorial')}</h3>
                <ul className="name-list">
                  {ending.memorial.map((entry) => (
                    <li key={`${entry.name}-${entry.day}`} className="tone-bad">
                      {t('report.memorialLine', {
                        name: entry.name,
                        day: entry.day,
                        cause: entry.cause,
                      })}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Panel>

          <Panel title={t('report.legacy')} note={t('report.legacyBanked', { value: profile.legacy })}>
            <p className="report-legacy num">+{ending.legacyAwarded}</p>
            <p className="hint">{t('report.legacyHint')}</p>
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
            {t('report.runAgain')}
          </Button>
          <Button
            size="lg"
            onClick={() => {
              abandonRun();
              setScreen('menu');
            }}
          >
            {t('report.backToMenu')}
          </Button>
        </div>
      </div>
    </main>
  );
}
