#!/usr/bin/env tsx
/**
 * Balance simulation harness.
 *
 *   npm run simulate
 *   npm run simulate -- --runs 500 --difficulty overcast --scenario cold_start
 *   npm run simulate -- --runs 200 --all-strategies --json out.json
 */

import { writeFileSync } from 'node:fs';
import { runSimulation, type SimulationResult } from '../src/engine/sim/run';
import { analyse, formatReport } from '../src/engine/sim/report';
import type { AgentConfig } from '../src/engine/sim/agent';
import { SCENARIOS } from '../src/engine/data/scenarios';
import { DIFFICULTIES } from '../src/engine/data/difficulties';

interface Args {
  runs: number;
  scenario?: string;
  difficulty?: string;
  allStrategies: boolean;
  allScenarios: boolean;
  allDifficulties: boolean;
  maxDays: number;
  json?: string;
  quiet: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = {
    runs: 200,
    allStrategies: true,
    allScenarios: false,
    allDifficulties: false,
    maxDays: 60,
    quiet: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    switch (arg) {
      case '--runs':
        args.runs = Number(next) || args.runs;
        i += 1;
        break;
      case '--scenario':
        args.scenario = next;
        i += 1;
        break;
      case '--difficulty':
        args.difficulty = next;
        i += 1;
        break;
      case '--max-days':
        args.maxDays = Number(next) || args.maxDays;
        i += 1;
        break;
      case '--json':
        args.json = next;
        i += 1;
        break;
      case '--all-scenarios':
        args.allScenarios = true;
        break;
      case '--all-difficulties':
        args.allDifficulties = true;
        break;
      case '--single-strategy':
        args.allStrategies = false;
        break;
      case '--quiet':
        args.quiet = true;
        break;
      default:
        break;
    }
  }
  return args;
}

const STRATEGIES: AgentConfig['strategy'][] = ['balanced', 'industry', 'science', 'defence'];

function main(): void {
  const args = parseArgs(process.argv.slice(2));

  const scenarios = args.allScenarios
    ? SCENARIOS.map((s) => s.id)
    : [args.scenario ?? 'cold_start'];
  const difficulties = args.allDifficulties
    ? DIFFICULTIES.map((d) => d.id)
    : [args.difficulty ?? 'overcast'];
  const strategies = args.allStrategies ? STRATEGIES : ['balanced' as const];

  const started = Date.now();
  const results: SimulationResult[] = [];

  for (const scenarioId of scenarios) {
    for (const difficultyId of difficulties) {
      for (let i = 0; i < args.runs; i += 1) {
        const strategy = strategies[i % strategies.length]!;
        const risk = 0.3 + (i % 3) * 0.2;
        results.push(
          runSimulation({
            seed: `SIM-${scenarioId}-${difficultyId}-${i}`,
            scenarioId,
            difficultyId,
            maxDays: args.maxDays,
            unlocks: [
              'scenario_black_winter', 'scenario_silent_city', 'scenario_last_convoy',
              'scenario_skeleton_crew', 'scenario_meridian_key',
            ],
            agent: { strategy, risk },
          }),
        );
      }
    }
  }

  const elapsed = Date.now() - started;
  const report = analyse(results);

  if (!args.quiet) {
    for (const scenarioId of scenarios) {
      if (scenarios.length === 1) break;
      const subset = results.filter((r) => r.scenarioId === scenarioId);
      const subReport = analyse(subset);
      console.log(`\n── ${scenarioId} ────────────────────────────`);
      console.log(
        `   median ${subReport.medianDays}d   victory ${Math.round(subReport.victoryRate * 100)}%   defeat ${Math.round(subReport.defeatRate * 100)}%`,
      );
    }
    console.log(formatReport(report));
    console.log(`  ${results.length} runs in ${(elapsed / 1000).toFixed(1)}s (${(elapsed / results.length).toFixed(1)}ms per run)\n`);
  }

  if (args.json) {
    writeFileSync(args.json, JSON.stringify({ report, results }, null, 2));
    console.log(`  wrote ${args.json}`);
  }

  const fatal = report.warnings.filter((w) => w.severity === 'error');
  if (fatal.length > 0) {
    console.error(`\n  ${fatal.length} fatal balance issue(s).`);
    process.exit(1);
  }
}

main();
