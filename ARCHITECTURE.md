# LAST LIGHT — Architecture

## 1. Guiding constraint

> The simulation must run headlessly in Node with no React, no DOM, and no `Math.random`.

Everything else follows from that. `src/engine` is a pure TypeScript library. `src/ui` is
a React application that renders engine state and dispatches engine actions. The store in
`src/store` is the only place the two meet.

This makes the game testable (`vitest` imports the engine directly), simulatable
(`npm run simulate` runs thousands of games in seconds), and deterministic (same seed →
same run).

## 2. Directory layout

```
src/
  engine/
    core/
      rng.ts              seeded RNG (SplitMix64 → xoshiro128**), serialisable state
      ids.ts              branded id types
      math.ts             clamp, lerp, weighted pick, band lookup
      breakdown.ts        Breakdown<T>: a number plus its labelled contributing terms
    model/
      types.ts            every domain type; the save shape lives here
      state.ts            createInitialState, invariants
    data/                 pure content, no logic
      resources.ts  traits.ts  personalities.ts  backgrounds.ts  names.ts
      facilities.ts items.ts   recipes.ts        research.ts     locations.ts
      conditions.ts weather.ts scenarios.ts      difficulties.ts lore.ts
      encounters.ts events/    index.ts + 10 themed modules
      metaUnlocks.ts
    systems/
      resources.ts        production/consumption resolution with full breakdowns
      survivors.ts        generation, needs, efficiency, conditions
      traits.ts           trait hook registry
      relationships.ts    drift, buckets, emergent checks
      facilities.ts       build, upgrade, repair, decay, power allocation
      crafting.ts         recipe availability, labour, completion
      research.ts         insight, project completion, unlock application
      world.ts            seeded map generation, discovery, depletion
      expedition.ts       forecast, encounter sequencing, resolution, return
      combat.ts           abstract combat resolution
      events/
        conditions.ts     condition atom evaluation
        effects.ts        effect application
        select.ts         weighting, cooldowns, scheduled timeline
      dayCycle.ts         the day pipeline — the single entry point for time passing
      endings.ts          ending detection
      stats.ts            run statistics
      meta.ts             legacy scoring and unlocks
    sim/
      agent.ts            headless heuristic player
      run.ts              runSimulation(config): SimulationResult
      report.ts           aggregation and balance warnings
    index.ts              public engine API
  store/
    gameStore.ts          zustand store; actions are thin wrappers over engine reducers
    uiStore.ts            panel/tab/modal/settings state (persisted separately)
    selectors.ts          memoised derived selectors
  save/
    db.ts                 IndexedDB wrapper (idb-less, ~120 lines)
    schema.ts             SaveFile envelope + CURRENT_VERSION
    migrations.ts         ordered migration chain v1 → vN
    serialize.ts          state ⇄ save file, export/import, integrity check
  ui/
    app/                  App shell, routing between menu / game / report
    layout/               CommandDeck (desktop), MobileShell, panel chrome
    panels/               Dashboard Crew Base Workshop Research Map Log Archive
    components/           reusable primitives (Gauge, Breakdown, Portrait, Card…)
    modals/               EventModal ExpeditionModal SettingsModal SaveModal…
    hooks/                useBreakpoint, useKeyboardNav, useAnnounce…
    audio/                WebAudio synth cues
    theme/                design tokens, global CSS, motion
  content-validation/
    validate.ts           referential integrity over all data modules
  main.tsx
```

## 3. Determinism

### RNG

`RngState` is `{ a, b, c, d }` (four uint32). It is part of `GameState` and therefore part
of the save file, so reloading a save resumes the exact same stream.

```ts
const rng = createRng(seedString);       // SplitMix64 expansion of a string seed
rng.next();                              // [0,1)
rng.int(1, 6); rng.pick(arr); rng.weighted(entries); rng.shuffle(arr);
rng.fork('worldgen');                    // named substream, independent of call order
```

`fork(label)` is critical: world generation, survivor generation, and event selection each
draw from a **named substream** derived from the run seed. That means changing how many
rolls the event system makes cannot alter the generated map — content can be added without
invalidating seeds.

An ESLint/oxlint rule and a unit test both assert `Math.random` never appears in
`src/engine`.

### The day pipeline

`advanceDay(state, options)` is the only function that moves time. It is a pure reducer:

```
advanceDay(state) →
  1. resolveExpeditionReturns
  2. rollWeather
  3. allocatePower              → PowerReport
  4. runFacilityProduction      → ResourceReport (with breakdowns)
  5. runCraftingAndResearch
  6. consumeResources
  7. applySurvivorNeeds         (hunger, fatigue, morale, conditions)
  8. progressConditions         (illness/injury worsening or healing)
  9. relationshipDrift
 10. facilityDecayAndBreakdowns
 11. selectAndQueueEvents       → events resolved by the UI, then applyEventOutcome
 12. checkEndings
 13. incrementDay, appendLog
```

Steps 1–10 and 12–13 are synchronous and pure. Step 11 produces a *queue*; the UI presents
each event and calls `resolveEvent(state, eventId, choiceId)`. The headless simulator calls
the same function with its own choice policy, which is why the AI agent exercises the exact
same code path as a human player.

## 4. State shape

`GameState` is a single serialisable plain object. No class instances, no `Map`/`Set`, no
functions, no `Date` objects (days are integers; wall-clock timestamps are numbers).

```ts
interface GameState {
  version: number;
  seed: string;
  rng: RngState;
  day: number;
  phase: Phase;
  scenarioId: ScenarioId;
  difficultyId: DifficultyId;
  modifiers: ModifierId[];
  weather: WeatherState;
  resources: Record<ResourceId, number>;
  resourceCaps: Record<ResourceId, number>;
  survivors: Survivor[];
  relationships: Record<string, number>;      // "idA|idB" with idA < idB
  facilities: FacilityInstance[];
  slots: BuildSlot[];
  inventory: InventoryEntry[];
  craftQueue: CraftJob[];
  research: { completed: ResearchId[]; active: ActiveResearch | null; insight: number };
  world: { locations: LocationInstance[]; discoveredRings: number };
  expeditions: ActiveExpedition[];
  events: { history: EventRecord[]; cooldowns: Record<string, number>;
            scheduled: ScheduledEvent[]; pending: PendingEvent[] };
  flags: Record<string, number | boolean | string>;
  lore: LoreId[];
  stats: RunStats;
  log: LogEntry[];
  ending: EndingResult | null;
  guidance: { seen: string[]; enabled: boolean };
}
```

Immer produces the next state; structural sharing keeps React re-renders cheap.

## 5. Breakdowns

Any number the player might question is computed as a `Breakdown`:

```ts
interface Breakdown {
  total: number;
  terms: { label: string; value: number; kind: 'base'|'bonus'|'penalty'|'multiplier';
           detail?: string; fixHint?: string }[];
}
```

Production, consumption, work efficiency, expedition risk, craft time, research rate, and
combat power all return `Breakdown`s. The UI has a single `<BreakdownPopover>` that renders
any of them, so legibility is structural rather than something to remember to add.

## 6. Event engine

Conditions are a discriminated-union tree evaluated by `evaluateCondition(cond, ctx)`.
Effects are a flat discriminated union applied by `applyEffect(state, effect, ctx)`. The
context carries the acting survivor, the event record, and the RNG substream.

Selection each dusk:

1. Fire all `scheduled` events whose day has arrived (bypassing weighting).
2. Filter the catalogue by `requires`, cooldown, `once`, phase, scenario, difficulty.
3. Apply dynamic weight modifiers (state pressure — e.g. low food raises hunger events).
4. Weighted-pick `n` events (`n` from difficulty and day), no duplicate tags in one day.

Because selection reads only `state` and a forked RNG, the same state produces the same
event set — which is what makes save/reload non-exploitable within a day.

## 7. Presentation

- **Desktop (≥1200px)**: three-column command deck — status rail, main panel, log/alerts.
- **Tablet (768–1199px)**: two columns, log collapses into a drawer.
- **Mobile (<768px)**: single column, bottom tab bar with 5 destinations, status rail
  becomes a collapsible header strip, modals become full-screen sheets. This is a distinct
  information architecture, not a scaled desktop layout.

Components are small and typed. No component exceeds ~200 lines; panels compose
sub-components. All game rules live in the engine — components never compute game maths.

## 8. Persistence

`SaveFile` envelope:

```ts
{ magic: 'LASTLIGHT', version: number, savedAt: number, slot: number,
  label: string, preview: { day, survivors, scenario, difficulty, ending },
  state: GameState, checksum: string }
```

- **IndexedDB** database `lastlight`, stores `saves` (slots 0–5, slot 0 = autosave) and
  `meta` (legacy profile, unlocks, lore archive, settings).
- **Autosave** after every `END DAY` and after every event resolution.
- **Migrations**: `migrations[v]` transforms v → v+1. Loading runs the chain. An
  unmigratable save is never deleted — it is preserved and the player is offered an export.
- **Export/import**: base64-wrapped JSON via a download/upload; checksum verified with a
  clear error rather than a crash.
- **Corruption handling**: any load failure falls back to a recovery screen listing all
  slots with raw export buttons.

## 9. Testing

| Layer | Tool | Coverage |
|---|---|---|
| RNG determinism | vitest | identical streams, fork independence, save/restore |
| Resource maths | vitest | production, consumption, caps, breakdown term sums |
| Survivors | vitest | generation validity, needs progression, efficiency bounds |
| Facilities | vitest | build/upgrade costs, power allocation, decay, breakdown |
| Crafting/research | vitest | requirement gating, labour accumulation, unlocks |
| Events | vitest | condition atoms, every effect type, chains, cooldowns, scheduling |
| Expeditions | vitest | forecast accuracy, resolution bands, no-warning-death invariant |
| Save/load | vitest | round-trip equality, every migration, corruption paths |
| Content | vitest | referential integrity over all data (see §10) |
| Full runs | vitest | 200 seeded headless runs complete without throwing |
| E2E | Playwright | new game → play days → build → craft → research → expedition → event → save → reload |
| Visual | Playwright | 6 viewports, overflow/clipping assertions, zero console errors |

## 10. Content validation

`npm run validate` (also a vitest suite, so it gates the build) checks:

- duplicate ids across every data table
- every `itemId`/`facilityId`/`researchId`/`locationId`/`traitId`/`loreId` reference resolves
- every event `scheduleEvent`/`chain` target exists
- every recipe's facility exists and its output item exists
- every research node's prerequisites exist and the graph is acyclic and fully reachable
- every location archetype's loot table references real resources/items
- no event is unreachable (its `requires` is satisfiable against a permissive model)
- no orphan lore entries (every lore id is granted by something)
- string tables complete for every id that needs a display name

Serious errors fail the build.

## 11. Balance simulation

`npm run simulate -- --runs 500 --difficulty overcast --scenario cold_start`

The headless agent implements a competent-but-not-optimal policy: it prioritises
water > food > power, staffs by best-skill match, rests survivors above fatigue 70,
builds along a scenario-appropriate order, researches the cheapest useful node, and runs
expeditions when stores fall below a threshold. Event choices are picked by a scoring
function over immediate effect value with a risk-aversion parameter.

`report.ts` aggregates and emits warnings for:
survival curve anomalies, resource runaway (any resource above cap for >5 days),
never-used facilities/items/research, dominant strategies (>70% of wins share a build),
unreachable events, and death-cause distribution skew.

Balance constants live in `src/engine/data/balance.ts` so tuning is a single-file change.

## 12. Performance

- Engine work happens once per day transition, not per frame.
- Zustand selectors are narrow; panels subscribe only to their slice.
- The map, portraits, and base cross-section are SVG memoised on their inputs.
- Ambient effects are CSS-only; no requestAnimationFrame loops except the optional
  particle layer, which is capped and disabled under reduced motion.
- Target: <16ms interaction response on a mid-range phone; day transition <80ms.
