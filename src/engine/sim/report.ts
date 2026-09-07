import type { SimulationResult } from './run';
import { EVENTS } from '../data/events';
import { FACILITIES } from '../data/facilities';
import { RESEARCH } from '../data/research';

/**
 * Balance analysis over a batch of simulated runs.
 *
 * The warnings here are the ones the design brief calls out: unavoidable starvation,
 * effectively infinite resources, useless facilities, dominant strategies, and impossible
 * research costs. They are advisory — the tuning decision is still a design decision — but
 * a warning that fires on every batch is a bug in the numbers, not a taste question.
 */

export interface BalanceWarning {
  severity: 'error' | 'warn' | 'info';
  code: string;
  message: string;
}

export interface BalanceReport {
  runs: number;
  errors: number;
  survivalCurve: { day: number; alive: number }[];
  medianDays: number;
  meanDays: number;
  endingCounts: Record<string, number>;
  defeatRate: number;
  victoryRate: number;
  /** Runs that lasted to the thaw without reaching a win condition. */
  survivalRate: number;
  deathCauses: Record<string, number>;
  unusedFacilities: string[];
  unusedResearch: string[];
  unseenEvents: string[];
  strategyWinRates: Record<string, { runs: number; wins: number; rate: number }>;
  resourceRunaway: string[];
  starvationRuns: number;
  warnings: BalanceWarning[];
}

export function analyse(results: readonly SimulationResult[]): BalanceReport {
  const runs = results.length;
  const errors = results.filter((r) => r.error).length;
  const days = results.map((r) => r.days).sort((a, b) => a - b);
  const medianDays = days.length > 0 ? days[Math.floor(days.length / 2)]! : 0;
  const meanDays = days.length > 0 ? days.reduce((a, b) => a + b, 0) / days.length : 0;

  const endingCounts: Record<string, number> = {};
  for (const result of results) {
    const key = result.endingId ?? 'unfinished';
    endingCounts[key] = (endingCounts[key] ?? 0) + 1;
  }

  const defeats = results.filter((r) => r.endingKind === 'defeat').length;
  const victories = results.filter((r) => r.endingKind === 'victory' || r.endingKind === 'transcendent').length;
  // Enduring is its own outcome. Counting it as a win hid the fact that almost nobody was
  // actually reaching a win condition.
  const endured = results.filter((r) => r.endingKind === 'survival').length;

  const maxDay = Math.max(1, ...results.map((r) => r.days));
  const survivalCurve: { day: number; alive: number }[] = [];
  for (let day = 1; day <= Math.min(maxDay, 60); day += 5) {
    survivalCurve.push({ day, alive: results.filter((r) => r.days >= day).length });
  }

  const facilitiesSeen = new Set<string>();
  const researchSeen = new Set<string>();
  const eventsSeen = new Set<string>();
  for (const result of results) {
    for (const id of result.facilitiesUsed) facilitiesSeen.add(id);
    for (const id of result.researchUsed) researchSeen.add(id);
    for (const id of result.eventsUsed) eventsSeen.add(id);
  }

  const unusedFacilities = FACILITIES.filter((f) => !facilitiesSeen.has(f.id)).map((f) => f.id);
  const unusedResearch = RESEARCH.filter((r) => !researchSeen.has(r.id)).map((r) => r.id);
  const unseenEvents = EVENTS.filter((e) => !e.scheduledOnly && !eventsSeen.has(e.id)).map((e) => e.id);

  const strategyWinRates: Record<string, { runs: number; wins: number; rate: number }> = {};
  for (const result of results) {
    const entry = (strategyWinRates[result.strategy] ??= { runs: 0, wins: 0, rate: 0 });
    entry.runs += 1;
    if (result.endingKind === 'victory' || result.endingKind === 'transcendent') entry.wins += 1;
  }
  for (const entry of Object.values(strategyWinRates)) {
    entry.rate = entry.runs > 0 ? entry.wins / entry.runs : 0;
  }

  // Runaway: a resource that ends above 3× its base cap on more than a fifth of runs.
  const resourceRunaway: string[] = [];
  const runawayThresholds: Record<string, number> = {
    food: 200, water: 200, medicine: 90, components: 260, fuel: 150, ammo: 200,
  };
  for (const [resource, threshold] of Object.entries(runawayThresholds)) {
    const count = results.filter((r) => (r.peakResources[resource] ?? 0) > threshold).length;
    if (count / Math.max(1, runs) > 0.2) resourceRunaway.push(resource);
  }

  const starvationRuns = results.filter((r) => r.starvationDays > 3).length;

  const deathCauses: Record<string, number> = {};
  for (const result of results) {
    if (result.endingId) deathCauses[result.endingId] = (deathCauses[result.endingId] ?? 0) + 1;
  }

  /* ---------------------------------------------------------------- warnings */
  const warnings: BalanceWarning[] = [];

  if (errors > 0) {
    warnings.push({
      severity: 'error',
      code: 'simulation-error',
      message: `${errors} of ${runs} runs threw. The first error was: ${results.find((r) => r.error)?.error?.split('\n')[0]}`,
    });
  }

  const earlyDeaths = results.filter((r) => r.days < 6 && r.endingKind === 'defeat').length;
  if (earlyDeaths / Math.max(1, runs) > 0.12) {
    warnings.push({
      severity: 'error',
      code: 'early-death',
      message: `${Math.round((earlyDeaths / runs) * 100)}% of runs end before day 6. Opening stores or early loot are too thin.`,
    });
  }

  if (starvationRuns / Math.max(1, runs) > 0.55) {
    warnings.push({
      severity: 'warn',
      code: 'starvation',
      message: `${Math.round((starvationRuns / runs) * 100)}% of runs spend more than three days with no food. Food economy may be unwinnable.`,
    });
  }

  if (resourceRunaway.length > 0) {
    warnings.push({
      severity: 'warn',
      code: 'runaway',
      message: `Resources accumulate without bound: ${resourceRunaway.join(', ')}. Sinks are too weak or caps too high.`,
    });
  }

  if (unusedFacilities.length > 0) {
    warnings.push({
      severity: 'warn',
      code: 'unused-facility',
      message: `Never built by any agent: ${unusedFacilities.join(', ')}. Either the cost is wrong or the payoff is invisible.`,
    });
  }

  if (unusedResearch.length > RESEARCH.length * 0.4) {
    warnings.push({
      severity: 'warn',
      code: 'unused-research',
      message: `${unusedResearch.length} of ${RESEARCH.length} research nodes were never completed. Costs may be too high for the run length.`,
    });
  }

  if (unseenEvents.length > EVENTS.length * 0.3) {
    warnings.push({
      severity: 'info',
      code: 'unseen-events',
      message: `${unseenEvents.length} events never fired. Their requirements may be unreachable in a typical run.`,
    });
  }

  const rates = Object.values(strategyWinRates).map((s) => s.rate);
  if (rates.length > 1) {
    const best = Math.max(...rates);
    const worst = Math.min(...rates);
    if (best > 0.7 && best - worst > 0.4) {
      const dominant = Object.entries(strategyWinRates).find(([, s]) => s.rate === best)?.[0];
      warnings.push({
        severity: 'warn',
        code: 'dominant-strategy',
        message: `Strategy "${dominant}" wins ${Math.round(best * 100)}% against a floor of ${Math.round(worst * 100)}%. One build is dominating.`,
      });
    }
  }

  const winRate = victories / Math.max(1, runs);
  if (winRate > 0.85) {
    warnings.push({ severity: 'warn', code: 'too-easy', message: `${Math.round(winRate * 100)}% of runs reach a victory ending.` });
  }
  if (winRate < 0.03 && runs > 30) {
    warnings.push({ severity: 'warn', code: 'too-hard', message: `Only ${Math.round(winRate * 100)}% of runs reach any victory ending.` });
  }

  return {
    runs,
    errors,
    survivalCurve,
    medianDays,
    meanDays: Math.round(meanDays * 10) / 10,
    endingCounts,
    defeatRate: defeats / Math.max(1, runs),
    victoryRate: winRate,
    survivalRate: endured / Math.max(1, runs),
    deathCauses,
    unusedFacilities,
    unusedResearch,
    unseenEvents,
    strategyWinRates,
    resourceRunaway,
    starvationRuns,
    warnings,
  };
}

export function formatReport(report: BalanceReport): string {
  const lines: string[] = [];
  const pct = (n: number) => `${Math.round(n * 100)}%`;

  lines.push('');
  lines.push('══ LAST LIGHT — balance report ═══════════════════════════════════');
  lines.push(`  runs                ${report.runs}   (${report.errors} errored)`);
  lines.push(`  median days         ${report.medianDays}`);
  lines.push(`  mean days           ${report.meanDays}`);
  lines.push(`  victory rate        ${pct(report.victoryRate)}`);
  lines.push(`  endured rate        ${pct(report.survivalRate)}`);
  lines.push(`  defeat rate         ${pct(report.defeatRate)}`);
  lines.push('');

  lines.push('  survival curve');
  for (const point of report.survivalCurve) {
    const share = point.alive / Math.max(1, report.runs);
    const bar = '█'.repeat(Math.round(share * 40));
    lines.push(`    day ${String(point.day).padStart(2)}  ${bar} ${pct(share)}`);
  }
  lines.push('');

  lines.push('  endings');
  const sortedEndings = Object.entries(report.endingCounts).sort((a, b) => b[1] - a[1]);
  for (const [id, count] of sortedEndings) {
    lines.push(`    ${id.padEnd(18)} ${String(count).padStart(4)}  ${pct(count / Math.max(1, report.runs))}`);
  }
  lines.push('');

  if (Object.keys(report.strategyWinRates).length > 1) {
    lines.push('  strategies');
    for (const [strategy, entry] of Object.entries(report.strategyWinRates)) {
      lines.push(`    ${strategy.padEnd(12)} ${entry.wins}/${entry.runs} wins  ${pct(entry.rate)}`);
    }
    lines.push('');
  }

  if (report.unusedFacilities.length > 0) {
    lines.push(`  never built: ${report.unusedFacilities.join(', ')}`);
  }
  if (report.unusedResearch.length > 0) {
    lines.push(`  never researched (${report.unusedResearch.length}): ${report.unusedResearch.slice(0, 12).join(', ')}${report.unusedResearch.length > 12 ? ' …' : ''}`);
  }
  if (report.unseenEvents.length > 0) {
    lines.push(`  never fired (${report.unseenEvents.length}): ${report.unseenEvents.slice(0, 10).join(', ')}${report.unseenEvents.length > 10 ? ' …' : ''}`);
  }
  lines.push('');

  if (report.warnings.length === 0) {
    lines.push('  ✔ no balance warnings');
  } else {
    lines.push('  warnings');
    for (const warning of report.warnings) {
      const mark = warning.severity === 'error' ? '✖' : warning.severity === 'warn' ? '▲' : 'ℹ';
      lines.push(`    ${mark} [${warning.code}] ${warning.message}`);
    }
  }
  lines.push('══════════════════════════════════════════════════════════════════');
  lines.push('');
  return lines.join('\n');
}
