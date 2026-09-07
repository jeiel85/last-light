import type { GameState } from '../model/types';
import { createInitialState, type NewRunOptions } from '../model/state';
import { rngFromState } from '../core/rng';
import { advanceDay } from '../systems/dayCycle';
import { ENDING_BY_ID } from '../systems/endings';
import { DEFAULT_AGENT, planDay, resolveExpeditionBeats, resolvePendingEvents, type AgentConfig } from './agent';

/**
 * Headless run execution.
 *
 * A simulated run drives exactly the same public API a human player does: plan the day,
 * dispatch and resolve any expedition beat-by-beat, advance the day, then resolve whatever
 * events the pipeline queued. That equivalence is the point — a bug the simulator hits is a
 * bug the game has.
 */

export interface SimulationOptions extends NewRunOptions {
  agent?: AgentConfig;
  maxDays?: number;
}

export interface SimulationResult {
  seed: string;
  scenarioId: string;
  difficultyId: string;
  strategy: string;
  days: number;
  endingId: string | null;
  endingKind: string | null;
  survivorsAlive: number;
  survivorsLost: number;
  peakSurvivors: number;
  facilitiesBuilt: number;
  researchCompleted: number;
  expeditions: number;
  loreFound: number;
  eventsSeen: number;
  brownoutDays: number;
  starvationDays: number;
  /** Resource levels at the end, for runaway detection. */
  finalResources: Record<string, number>;
  /** Peak stock per resource across the run. */
  peakResources: Record<string, number>;
  /** Facility def ids that were ever built. */
  facilitiesUsed: string[];
  researchUsed: string[];
  eventsUsed: string[];
  /** Day-by-day food and water, for starvation-curve analysis. */
  foodSeries: number[];
  waterSeries: number[];
  error?: string;
}

export function runSimulation(options: SimulationOptions = {}): SimulationResult {
  const agent = options.agent ?? DEFAULT_AGENT;
  const maxDays = options.maxDays ?? 60;
  const unlocks = options.unlocks ?? [];

  let state: GameState;
  try {
    state = createInitialState({ ...options, guidance: false });
  } catch (error) {
    return errorResult(options, agent, String(error));
  }

  const peakResources: Record<string, number> = {};
  const foodSeries: number[] = [];
  const waterSeries: number[] = [];
  const facilitiesUsed = new Set<string>();
  const researchUsed = new Set<string>();
  const eventsUsed = new Set<string>();

  try {
    for (let day = 0; day < maxDays; day += 1) {
      const rng = rngFromState(state.rng).fork(`agent:${state.day}`);

      planDay(state, agent, rng);
      if (state.activeExpeditionId) resolveExpeditionBeats(state, agent, rng);

      const result = advanceDay(state);

      resolvePendingEvents(state, agent, unlocks);

      for (const facility of state.facilities) facilitiesUsed.add(facility.defId);
      for (const id of state.research.completed) researchUsed.add(id);
      for (const record of state.events.history) eventsUsed.add(record.eventId);
      for (const [key, value] of Object.entries(state.resources)) {
        peakResources[key] = Math.max(peakResources[key] ?? 0, value);
      }
      foodSeries.push(Math.round(state.resources.food * 10) / 10);
      waterSeries.push(Math.round(state.resources.water * 10) / 10);

      if (result.ended || state.ending) break;
    }
  } catch (error) {
    return {
      ...summarise(state, options, agent, facilitiesUsed, researchUsed, eventsUsed, peakResources, foodSeries, waterSeries),
      error: error instanceof Error ? `${error.message}\n${error.stack}` : String(error),
    };
  }

  return summarise(
    state,
    options,
    agent,
    facilitiesUsed,
    researchUsed,
    eventsUsed,
    peakResources,
    foodSeries,
    waterSeries,
  );
}

function summarise(
  state: GameState,
  options: SimulationOptions,
  agent: AgentConfig,
  facilitiesUsed: Set<string>,
  researchUsed: Set<string>,
  eventsUsed: Set<string>,
  peakResources: Record<string, number>,
  foodSeries: number[],
  waterSeries: number[],
): SimulationResult {
  const alive = state.survivors.filter((s) => s.alive).length;
  return {
    seed: state.seed,
    scenarioId: state.scenarioId,
    difficultyId: state.difficultyId,
    strategy: agent.strategy,
    days: state.day,
    endingId: state.ending?.endingId ?? null,
    endingKind: state.ending ? endingKindOf(state.ending.endingId) : null,
    survivorsAlive: alive,
    survivorsLost: state.stats.survivorsLost,
    peakSurvivors: state.stats.peakSurvivors,
    facilitiesBuilt: state.stats.facilitiesBuilt,
    researchCompleted: state.stats.researchCompleted,
    expeditions: state.stats.expeditionsCompleted + state.stats.expeditionsAborted,
    loreFound: state.lore.length,
    eventsSeen: state.stats.eventsEncountered,
    brownoutDays: state.stats.brownoutDays,
    starvationDays: state.stats.starvationDays,
    finalResources: { ...state.resources },
    peakResources,
    facilitiesUsed: [...facilitiesUsed],
    researchUsed: [...researchUsed],
    eventsUsed: [...eventsUsed],
    foodSeries,
    waterSeries,
    ...(options.seed ? {} : {}),
  };
}

/**
 * Read the kind from the ending definition rather than restating it.
 *
 * This used to be a hand-written switch with `default: 'victory'`, so adding `the_thaw` —
 * a survival ending, the baseline outcome for enduring without solving anything — silently
 * made 82% of runs count as wins and produced a "too easy" warning about the opposite of
 * what was happening.
 */
function endingKindOf(id: string): string {
  return ENDING_BY_ID[id]?.kind ?? 'defeat';
}

function errorResult(options: SimulationOptions, agent: AgentConfig, error: string): SimulationResult {
  return {
    seed: options.seed ?? '',
    scenarioId: options.scenarioId ?? 'cold_start',
    difficultyId: options.difficultyId ?? 'overcast',
    strategy: agent.strategy,
    days: 0,
    endingId: null,
    endingKind: null,
    survivorsAlive: 0,
    survivorsLost: 0,
    peakSurvivors: 0,
    facilitiesBuilt: 0,
    researchCompleted: 0,
    expeditions: 0,
    loreFound: 0,
    eventsSeen: 0,
    brownoutDays: 0,
    starvationDays: 0,
    finalResources: {},
    peakResources: {},
    facilitiesUsed: [],
    researchUsed: [],
    eventsUsed: [],
    foodSeries: [],
    waterSeries: [],
    error,
  };
}
