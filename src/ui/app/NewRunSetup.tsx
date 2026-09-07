import { useMemo, useState } from 'react';
import {
  DEFAULT_DIFFICULTY,
  DEFAULT_SCENARIO,
  DIFFICULTIES,
  SCENARIOS,
  generateSeed,
  Meta,
  normaliseSeed,
  RESOURCES,
} from '@engine';
import { useGameStore } from '@store/gameStore';
import { useUiStore } from '@store/uiStore';
import { Button } from '@ui/components/Button';

const HINT_TONE: Record<string, string> = {
  gentle: 'tone-good',
  standard: 'tone-info',
  hard: 'tone-warn',
  brutal: 'tone-bad',
};

/**
 * New-run setup.
 *
 * The three choices — scenario, difficulty, seed — are presented together because they
 * interact: a brutal scenario on a brutal difficulty is a different game, and the player
 * should be able to see both descriptions at once before committing.
 */
export function NewRunSetup() {
  const profile = useGameStore((s) => s.profile);
  const settings = useGameStore((s) => s.settings);
  const newRun = useGameStore((s) => s.newRun);
  const setScreen = useUiStore((s) => s.setScreen);
  const setPanel = useUiStore((s) => s.setPanel);

  const scenarios = useMemo(() => Meta.availableScenarios(profile), [profile]);
  const [scenarioId, setScenarioId] = useState<string>(DEFAULT_SCENARIO);
  const [difficultyId, setDifficultyId] = useState<string>(DEFAULT_DIFFICULTY);
  const [seed, setSeed] = useState(() => generateSeed());
  const [guidance, setGuidance] = useState(settings.guidance && !profile.hasPlayed);

  const scenario = scenarios.find((s) => s.id === scenarioId) ?? scenarios[0] ?? SCENARIOS[0]!;
  const difficulty = DIFFICULTIES.find((d) => d.id === difficultyId) ?? DIFFICULTIES[0]!;

  const start = () => {
    newRun({
      seed: normaliseSeed(seed),
      scenarioId: scenario.id,
      difficultyId: difficulty.id,
      unlocks: profile.unlocks,
      guidance,
    });
    setPanel('dashboard');
    setScreen('game');
  };

  return (
    <main className="setup">
      <header className="setup-head">
        <button type="button" className="link-back" onClick={() => setScreen('menu')}>
          ← Menu
        </button>
        <h1 className="setup-title">Prepare the run</h1>
      </header>

      <div className="setup-grid">
        <section className="setup-col">
          <h2 className="label">Scenario</h2>
          <ul className="choice-list">
            {scenarios.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`choice ${s.id === scenarioId ? 'choice-active' : ''}`}
                  onClick={() => setScenarioId(s.id)}
                  aria-pressed={s.id === scenarioId}
                >
                  <span className="choice-name">{s.name}</span>
                  <span className={`choice-hint ${HINT_TONE[s.difficultyHint] ?? ''}`}>
                    {s.difficultyHint}
                  </span>
                  <span className="choice-tag">{s.tagline}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="setup-col">
          <h2 className="label">Difficulty</h2>
          <ul className="choice-list">
            {DIFFICULTIES.map((d) => (
              <li key={d.id}>
                <button
                  type="button"
                  className={`choice ${d.id === difficultyId ? 'choice-active' : ''}`}
                  onClick={() => setDifficultyId(d.id)}
                  aria-pressed={d.id === difficultyId}
                >
                  <span className="choice-name">{d.name}</span>
                  <span className="choice-hint num">×{d.legacyMultiplier.toFixed(2)} legacy</span>
                  <span className="choice-tag">{d.description}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="setup-col setup-brief">
          <h2 className="label">Briefing</h2>
          <p className="prose setup-desc">{scenario.description}</p>

          <h3 className="label">Starting stores</h3>
          <ul className="kv">
            {Object.entries(scenario.startingResources).map(([id, amount]) => (
              <li key={id}>
                <span>{RESOURCES[id as keyof typeof RESOURCES]?.name ?? id}</span>
                <span className="num">{Math.round((amount ?? 0) * difficulty.startingStores)}</span>
              </li>
            ))}
            <li>
              <span>Survivors</span>
              <span className="num">{scenario.survivorCount}</span>
            </li>
          </ul>

          {scenario.deadlineText && <p className="setup-deadline tone-warn">{scenario.deadlineText}</p>}

          <h3 className="label">Seed</h3>
          <div className="seed-row">
            <input
              className="input mono"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              aria-label="Run seed"
              maxLength={32}
            />
            <Button size="sm" onClick={() => setSeed(generateSeed())}>
              Reroll
            </Button>
          </div>
          <p className="hint">The same seed produces the same vault, crew, and map.</p>

          <label className="check">
            <input type="checkbox" checked={guidance} onChange={(e) => setGuidance(e.target.checked)} />
            <span>Show contextual guidance</span>
          </label>

          <Button tone="primary" size="lg" block onClick={start} data-autofocus>
            Seal the door
          </Button>
        </section>
      </div>
    </main>
  );
}
