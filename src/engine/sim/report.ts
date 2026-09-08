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

export interface ResearchTierStat {
  tier: number;
  nodes: number;
  /** Nodes at this tier that no run in the batch ever completed. */
  never: number;
  /** Mean nodes of this tier completed per run. */
  perRun: number;
}

/**
 * Where the insight to pay for the research tree actually comes from.
 *
 * A finished-node count cannot distinguish a tree that is too expensive from a laboratory
 * that is never built, never staffed, or never upgraded past the level that gates a tier.
 * These four numbers separate those cases, so `unreachable-tier` can name the gate instead
 * of advising the reader to go and look for it.
 */
export interface InsightEconomyStat {
  /** Mean insight generated across a whole run. */
  meanInsightPerRun: number;
  /** Total insight the whole tree costs, at list price. */
  treeCost: number;
  /** Share of runs in which the laboratory was ever operational. */
  labBuiltRate: number;
  /** Share of operational laboratory days on which somebody was actually working in it. */
  labStaffedRate: number;
  /** Mean highest laboratory level reached, and how many runs reached each level. */
  labLevelRuns: Record<number, number>;
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
  /** How much of each research tier a batch reached, and how often. */
  researchTiers: ResearchTierStat[];
  /** Mean research nodes completed per run. */
  meanResearchCompleted: number;
  /** What the run could afford to research, and why. */
  insightEconomy: InsightEconomyStat;
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
  const buildableSeen = new Set<string>();
  for (const result of results) for (const id of result.facilitiesBuildable) buildableSeen.add(id);
  const buildableRuns = (id: string): number =>
    results.filter((r) => r.facilitiesBuildable.includes(id)).length;
  const unusedResearch = RESEARCH.filter((r) => !researchSeen.has(r.id)).map((r) => r.id);

  /*
   * Per tier, not just per node. A tier nobody ever reaches is a different fault from a
   * node nobody chooses: it means something gates the tier — a facility level, a
   * prerequisite chain — rather than that its price is a little high. Reading only the
   * flat "never researched" list hid exactly that, because the list never said that all
   * ten of the nodes on it were the whole of tier 3.
   */
  const researchTiers: ResearchTierStat[] = [...new Set(RESEARCH.map((r) => r.tier))]
    .sort((a, b) => a - b)
    .map((tier) => {
      const nodes = RESEARCH.filter((r) => r.tier === tier);
      const ids = new Set(nodes.map((r) => r.id));
      const completions = results.reduce(
        (acc, result) => acc + result.researchUsed.filter((id) => ids.has(id)).length,
        0,
      );
      return {
        tier,
        nodes: nodes.length,
        never: nodes.filter((r) => !researchSeen.has(r.id)).length,
        perRun: completions / Math.max(1, runs),
      };
    });
  const meanResearchCompleted =
    results.reduce((acc, r) => acc + r.researchCompleted, 0) / Math.max(1, runs);

  const labOperationalDays = results.reduce((acc, r) => acc + r.labOperationalDays, 0);
  const labLevelRuns: Record<number, number> = {};
  for (const result of results) {
    labLevelRuns[result.labMaxLevel] = (labLevelRuns[result.labMaxLevel] ?? 0) + 1;
  }
  const insightEconomy: InsightEconomyStat = {
    meanInsightPerRun:
      results.reduce((acc, r) => acc + r.insightGenerated, 0) / Math.max(1, runs),
    treeCost: RESEARCH.reduce((acc, r) => acc + r.cost, 0),
    labBuiltRate: results.filter((r) => r.labOperationalDays > 0).length / Math.max(1, runs),
    labStaffedRate:
      results.reduce((acc, r) => acc + r.labStaffedDays, 0) / Math.max(1, labOperationalDays),
    labLevelRuns,
  };
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
      /*
       * Say which of the two it is, rather than offering both.
       *
       * The message used to read "either the cost is wrong or the payoff is invisible",
       * and for the Deep Archive it was neither: the archive was buildable on 899 days
       * across 200 runs and built on none of them, because the agent's own `busy` guard
       * held on 80% of those days. A warning that names two causes and means a third
       * sends the reader to retune a price that was never the problem.
       */
      message: `Never built by any agent: ${unusedFacilities
        .map((id) => {
          const runsBuildable = buildableRuns(id);
          if (runsBuildable === 0) return `${id} (never became buildable — check its unlock, not its price)`;
          return `${id} (buildable in ${Math.round((runsBuildable / Math.max(1, runs)) * 100)}% of runs and still never built — the agent never chose it, so look at the payoff or at the build order)`;
        })
        .join(', ')}.`,
    });
  }

  if (unusedResearch.length > RESEARCH.length * 0.4) {
    warnings.push({
      severity: 'warn',
      code: 'unused-research',
      message: `${unusedResearch.length} of ${RESEARCH.length} research nodes were never completed. Costs may be too high for the run length.`,
    });
  }

  /*
   * Naming the gate, rather than telling the reader to go and find it.
   *
   * The first version of this warning said "look for the gate before the cost", which is
   * the right instinct and no help at all: the reader still has to instrument the run to
   * learn whether the tier was priced out, unstaffed, or behind a facility level nobody
   * reached. The economy numbers above answer that, so say which one it is. The ranking is
   * by how early the cause bites — a laboratory that was never built cannot be understaffed.
   */
  for (const tier of researchTiers) {
    if (tier.never === tier.nodes && tier.nodes > 0) {
      const labLevelsReached = Object.entries(insightEconomy.labLevelRuns)
        .filter(([level]) => Number(level) > 0)
        .map(([level, count]) => `L${level}×${count}`)
        .join(' ');
      let gate: string;
      if (insightEconomy.labBuiltRate < 0.75) {
        gate = `the laboratory was built in only ${Math.round(insightEconomy.labBuiltRate * 100)}% of runs`;
      } else if (insightEconomy.labStaffedRate < 0.5) {
        gate = `the laboratory stood unstaffed on ${Math.round((1 - insightEconomy.labStaffedRate) * 100)}% of the days it was running, so it produced nothing`;
      } else if (insightEconomy.meanInsightPerRun < insightEconomy.treeCost * 0.15) {
        gate = `a run generates ${insightEconomy.meanInsightPerRun.toFixed(0)} insight against a tree costing ${insightEconomy.treeCost}`;
      } else {
        gate = `laboratory levels reached across the batch: ${labLevelsReached || 'none'}`;
      }
      warnings.push({
        severity: 'warn',
        code: 'unreachable-tier',
        message: `No run completed a single tier-${tier.tier} research node. All ${tier.nodes} of them are authored content the game never shows. The gate: ${gate}.`,
      });
    }
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
    researchTiers,
    meanResearchCompleted,
    insightEconomy,
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
  lines.push(
    `  research    ${report.meanResearchCompleted.toFixed(1)} of ${RESEARCH.length} nodes per run  ` +
      report.researchTiers
        .map((tier) => `t${tier.tier} ${tier.perRun.toFixed(1)}/${tier.nodes}`)
        .join('  '),
  );
  {
    const economy = report.insightEconomy;
    const levels = Object.entries(economy.labLevelRuns)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([level, count]) => `L${level} ${count}`)
      .join('  ');
    lines.push(
      `  insight     ${economy.meanInsightPerRun.toFixed(0)} per run against a ${economy.treeCost}-point tree  ` +
        `lab built ${Math.round(economy.labBuiltRate * 100)}%  staffed ${Math.round(economy.labStaffedRate * 100)}% of its days`,
    );
    lines.push(`  lab level   ${levels}  (runs by highest level reached)`);
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
