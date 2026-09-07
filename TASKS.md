# LAST LIGHT — Implementation Checklist

Status key: `[ ]` todo · `[~]` in progress · `[x]` done

## M0 — Foundation
- [x] Inspect environment (Node 24, npm 11, git, gh)
- [x] Scaffold Vite + React + TypeScript
- [x] Install dependencies (zustand, immer, vitest, playwright, vite-plugin-pwa)
- [x] PROJECT_PLAN.md
- [x] GAME_DESIGN.md
- [x] ARCHITECTURE.md
- [x] TASKS.md
- [x] Strict tsconfig, path aliases, npm scripts
- [x] Design tokens + global CSS

## M1 — Simulation core
- [x] `core/rng.ts` — seeded RNG, substreams, serialisable
- [x] `core/math.ts`, `core/breakdown.ts`, `core/ids.ts`
- [x] `model/types.ts` — full domain model
- [x] `data/balance.ts` — all tuning constants in one place
- [x] `data/resources.ts`
- [x] `data/names.ts`, `data/backgrounds.ts`, `data/personalities.ts`
- [x] `data/traits.ts` — 40+ traits with hooks
- [x] `data/conditions.ts` — injuries and illnesses
- [x] `data/weather.ts`
- [x] `systems/survivors.ts` — generation, needs, efficiency
- [x] `systems/traits.ts` — hook registry
- [x] `systems/relationships.ts`
- [x] `data/facilities.ts` — 14 facilities × 3 levels
- [x] `systems/facilities.ts` — build, upgrade, power, decay
- [x] `systems/resources.ts` — production/consumption with breakdowns
- [x] `model/state.ts` — createInitialState

## M2 — Content systems
- [x] `data/items.ts` — 50+ items
- [x] `data/recipes.ts` — 45+ recipes
- [x] `systems/crafting.ts`
- [x] `data/research.ts` — 34 nodes, 7 branches
- [x] `systems/research.ts`
- [x] `data/locations.ts` — 24 archetypes
- [x] `systems/world.ts` — seeded generation, discovery, depletion
- [x] `data/encounters.ts` — 40+ expedition beats
- [x] `systems/combat.ts`
- [x] `systems/expedition.ts` — forecast, sequencing, resolution, return

## M3 — Event engine
- [x] `systems/events/conditions.ts`
- [x] `systems/events/effects.ts`
- [x] `systems/events/select.ts`
- [x] `data/events/` — 90+ events across 10 themed modules
- [x] `data/lore.ts` — 45+ entries
- [x] Chains, scheduling, flags verified

## M4 — Interface
- [x] Design system primitives (Panel, Gauge, Stat, Breakdown, Button, Tabs…)
- [x] Procedural survivor portraits (SVG)
- [x] App shell + main menu + new-game setup
- [x] Command deck layout (desktop / tablet / mobile)
- [x] Dashboard panel
- [x] Crew panel + survivor detail
- [x] Base panel (SVG cross-section) + build/upgrade
- [x] Workshop panel (crafting + inventory)
- [x] Research panel (tree view)
- [x] Map panel (SVG radial) + location inspector
- [x] Expedition planner + interactive resolution
- [x] Event modal
- [x] Log / alerts
- [x] Archive (encyclopedia + lore)
- [x] End-of-run report
- [x] Settings

## M5 — Run structure
- [x] `data/scenarios.ts` — 6 scenarios
- [x] `data/difficulties.ts` — 4 difficulties × 11 parameters
- [x] `systems/endings.ts` — 10 endings
- [x] `systems/stats.ts` (folded into dayCycle/endings)
- [x] `systems/meta.ts` + `data/metaUnlocks.ts`
- [x] `systems/dayCycle.ts` — the pipeline

## M6 — Persistence & PWA
- [x] IndexedDB wrapper
- [x] Save schema + migrations
- [x] Slots, autosave, manual save
- [x] Export / import
- [x] Corruption recovery
- [x] PWA manifest, service worker, generated icons

## M7 — Balance
- [x] `sim/agent.ts` headless player
- [x] `sim/run.ts`, `sim/report.ts`
- [x] `npm run simulate`
- [x] Tune balance from simulation output

## M8 — QA
- [x] Vitest suites for every engine system
- [x] Content validation suite
- [x] Playwright e2e suite
- [x] Visual QA at 6 viewports
- [x] Console error sweep

## M9 — Polish
- [x] Contextual onboarding
- [x] Accessibility pass (keyboard, contrast, reduced motion, text scale, SR)
- [x] WebAudio cues
- [x] Motion/feedback pass

## M10 — Release
- [x] README with screenshots
- [ ] Landing page + live demo
- [ ] GitHub repository, topics, description
- [ ] GitHub Pages deployment

## M11 — Independent QA & polish loop (post-v1.0 review)
- [x] Play multiple full runs through Playwright
- [x] Desktop / tablet / mobile visual inspection
- [x] Fix identified issues
- [x] Expand content where replayability required it
- [x] Re-run all gates
