# LAST LIGHT — Project Plan

## 1. Product summary

**LAST LIGHT** is a browser-based, single-player survival-management roguelite. The player
commands a small crew of survivors inside **Vault Meridian**, an abandoned underground
civil-defence facility, in the months after an event known only as *the Quiet*.

Each run is a self-contained story of 20–60 in-game days that ends in one of several
endings — extinction, escape, entrenchment, or the discovery of what actually happened.
Between runs, a persistent **Legacy** layer unlocks scenarios, traits, starting kits, and
lore, but player knowledge remains the dominant form of progression.

- **Genre**: survival management / roguelite / narrative strategy
- **Session length**: 30–90 minutes per run; save-and-resume at any point
- **Platform**: web (desktop, tablet, mobile), installable as a PWA, fully offline
- **Audience**: players of management sims and choice-driven narrative strategy games

## 2. Design pillars

1. **Scarcity is the antagonist.** Every number on screen is either running out or
   about to. The player is always paying for something with something else.
2. **No clean choices.** The event and expedition systems are authored so that the
   "obviously correct" option is rare. Costs are legible; the *right* answer is not.
3. **People, not units.** Survivors have names, histories, opinions about each other,
   and the capacity to break. Losing one should sting mechanically *and* narratively.
4. **The world explains itself slowly.** No opening exposition dump. The catastrophe is
   assembled from radio fragments, documents, and contradicting theories.
5. **Legibility.** Every derived number can be inspected down to its contributing terms.
   Risk is always previewed before it is taken. No opaque deaths.

## 3. Scope — what ships in v1.0

| Area | Target |
|---|---|
| Resources | 8 (food, water, power, medicine, components, fuel, ammo, hope) |
| Survivor traits | 40+, all with mechanical effect |
| Facilities | 12, three levels each, staffed, breakable |
| Items | 50+ across 6 categories |
| Crafting recipes | 45+ |
| Research nodes | 34 across 7 branches |
| World locations | 24 archetypes, procedurally placed |
| Events | 90+ authored, data-driven, with chains and delayed consequences |
| Expedition encounters | 40+ beats |
| Scenarios | 6 |
| Difficulties | 4 |
| Endings | 10 |
| Lore entries | 45+ |

## 4. Non-goals

- Multiplayer, accounts, cloud saves, analytics, monetisation.
- Real-time or twitch gameplay. All combat is abstract strategic resolution.
- Hand-authored art assets. All visuals are generated (CSS/SVG/Canvas).
- A relationship/dating sim. Relationships exist to generate stories, not romance arcs.

## 5. Technical approach

- **TypeScript (strict)** + **React 19** + **Vite 8**.
- **Hard separation** between `src/engine` (pure, deterministic, React-free simulation)
  and `src/ui` (presentation). The engine is importable by Node for headless simulation.
- **Zustand + Immer** for the single game store; the store is a thin shell that calls
  engine reducers. Selectors keep re-renders local.
- **Seeded RNG** (SplitMix64-derived) threaded explicitly through the simulation. The
  same seed + same inputs always produces the same run.
- **IndexedDB** for saves, with a versioned schema and a migration chain.
- **Vitest** for unit/integration, **Playwright** for end-to-end and visual QA.
- **vite-plugin-pwa** for the manifest/service worker; icons generated at build time.

## 6. Milestones

| # | Milestone | Contents |
|---|---|---|
| M0 | Foundation | Repo, tooling, docs, design tokens, RNG, types |
| M1 | Simulation core | Resources, survivors, traits, facilities, day pipeline |
| M2 | Content systems | Items, crafting, research, world map, expeditions |
| M3 | Event engine | Condition/effect DSL, 90+ events, chains, flags |
| M4 | Interface | Command deck, all panels, survivor cards, map, modals |
| M5 | Run structure | Scenarios, difficulty, endings, statistics, meta-progression |
| M6 | Persistence | IndexedDB saves, slots, migration, import/export, PWA |
| M7 | Balance | Headless simulator, `npm run simulate`, numbers tuned from data |
| M8 | QA | Vitest suite, content validator, Playwright e2e, visual QA |
| M9 | Polish | Onboarding, encyclopedia, accessibility, audio, motion |
| M10 | Release | README, landing page, GitHub Pages deploy |

## 7. Quality gates (all must pass before v1.0)

- `npm install` clean.
- `npm run build` succeeds with zero TypeScript errors (strict).
- `npm test` — unit + integration + content validation all green.
- `npm run e2e` — Playwright suite green, zero console errors.
- `npm run simulate` — 500 headless runs; no unavoidable-death seeds, no infinite
  resource loops, every facility used by at least one winning strategy.
- Manual visual pass at 1920×1080, 1440×900, 1024×768, 768×1024, 390×844, 360×640.
- A full run is completable start to ending, saved, reloaded, and resumed.

## 8. Risks

| Risk | Mitigation |
|---|---|
| Content volume overwhelms schedule | Events authored as data in themed batches; validator catches breakage early |
| Balance guesswork | Headless simulator built at M7 *before* final tuning; numbers derived from run data |
| UI complexity on mobile | Mobile layout designed as its own information architecture, not a shrunk desktop |
| Save corruption | Versioned schema, migration chain, never destructive, export/import escape hatch |
| Determinism drift | RNG passed explicitly; no `Math.random` in `src/engine` (lint-enforced) |
