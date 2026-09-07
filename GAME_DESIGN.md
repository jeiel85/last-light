# LAST LIGHT — Game Design Document

> Working title: **LAST LIGHT**
> Genre: survival-management roguelite
> Fantasy: *You are the person who decides who eats tonight.*

---

## 1. Premise

Fifty-one days ago the lights went out across the region and did not come back. There was
no blast, no cloud, no announcement. Radios carried a single repeating tone for nine hours
and then nothing. People called it **the Quiet**.

You and a handful of others reached **Vault Meridian**, a decommissioned civil-defence
shelter cut into the bedrock beneath an industrial suburb. The reactor stub still turns.
The air scrubbers still run, mostly. There is food for a week.

Above you, a city is going cold.

The game never states outright what the Quiet was. Across a run the player accumulates
**lore fragments** — radio intercepts, water-damaged documents, the testimony of people who
should not still be alive — that support several mutually incompatible theories. Reaching
certain endings resolves some of them.

### The competing theories

| Theory | Suggested by | Status |
|---|---|---|
| **Grid Cascade** — an infrastructure failure that simply never got fixed | early documents, engineer survivors | plausible, incomplete |
| **The Meridian Program** — a state continuity-of-government experiment that succeeded too well | vault documents, Deep Archive chain | strongly supported late |
| **Quiet Bloom** — an atmospheric/biological event suppressing electromagnetic activity | hydroponics anomalies, medical logs | partially supported |
| **The Listeners** — something is transmitting, and it is answering | radio tower chain, Unknown Signal sites | resolves in one ending |

---

## 2. The core loop

A run is a sequence of **days**. Each day runs through six phases. The player acts freely
in phases 1–3, resolves interactively in 4–5, and watches consequences land in 6.

```
  ┌─ DAWN ─────────── overnight report, weather, arrivals, facility status
  │
  ├─ ASSIGN ───────── put each survivor on a job, rest, or an expedition team
  │
  ├─ WORKSHOP ─────── build/upgrade facilities, craft items, commit research
  │
  ├─ DISPATCH ─────── expeditions resolve as interactive encounter sequences
  │
  ├─ DUSK ─────────── 0–3 events fire; the player chooses; consequences apply
  │
  └─ NIGHT ────────── production, consumption, health, morale, hazards, deaths
        ↓
      next day
```

The emotional shape of a day is: *see the shortfall → decide who absorbs it → discover
whether you guessed right*.

### Why this shape

- **Phases 1–3 are planning**, and are fully reversible until the player commits. Nothing
  is spent until `END DAY`. This removes misclick punishment without removing tension.
- **Phase 4 is the risk spike.** Expeditions are the only place a survivor can die
  quickly, and the player always sees a risk forecast before committing.
- **Phases 5–6 are the consequence engine.** Events reference decisions made days ago.

---

## 3. Resources

Eight resources. Each has a distinct pressure and a distinct failure mode.

| Resource | Pressure | Failure mode |
|---|---|---|
| **Food** | consumed by every survivor daily | starvation → health loss → death |
| **Water** | consumed daily; purifier needs power | dehydration, faster than starvation |
| **Power** | produced by generator, drawn by facilities | brownout: facilities offline, morale hit |
| **Medicine** | treats injuries and illness | untreated wounds worsen and kill |
| **Components** | builds, upgrades, repairs, crafts | the base decays and cannot grow |
| **Fuel** | generator burn, long expeditions, the convoy | power collapse; evacuation blocked |
| **Ammo** | expedition combat resolution | expeditions become far more dangerous |
| **Hope** | collective morale currency, 0–100 | mutiny, desertion, refusal to work |

**Power is a flow, not a stock.** Each day the generator produces a capacity; facilities
draw against it. Deficit is resolved by browning out the lowest-priority facilities (the
player sets priority). Batteries (research) let surplus carry over.

**Hope is spent as well as lost.** Certain choices ("tell them the truth", "hold a
funeral") cost or refund Hope. At Hope ≤ 15 survivors begin refusing assignments; at 0 a
desertion or mutiny event chain begins.

### Legibility requirement

Every resource delta on the dashboard is expandable into its contributing terms:

```
FOOD            -7 / day
  ├ base consumption            -5   (5 survivors × 1.0)
  ├ Vera Kaminska (pregnant)    -1
  ├ Kitchen L2 efficiency       +2
  ├ Hydroponics L1 yield        +3
  └ spoilage (no cold storage)  -6   ← click to see fix
```

---

## 4. Survivors

Survivors are the heart of the game. Every one is generated with:

- **Identity**: name, age (17–68), pronouns, background, occupation, portrait seed
- **Portrait**: procedurally composed SVG (head shape, hair, eyes, marks, palette)
- **Personality**: one of 12 archetypes affecting event dialogue and relationship drift
- **Traits**: 2–4 from a pool of 40+, each mechanically active
- **Skills** (0–10): medicine, engineering, combat, scavenging, cooking, science,
  botany, negotiation
- **Needs** (0–100): health, hunger, fatigue, morale
- **Conditions**: injuries (bleeding, fracture, burn…) and illnesses (fever, dysentery,
  infection, dust lung…) with progression and treatment paths
- **Equipment**: weapon, tool, armour, one utility slot
- **Relationships**: a per-pair score with every other survivor
- **History**: a per-survivor timeline of significant events

### Needs model

| Need | Direction | Effect |
|---|---|---|
| Health 0–100 | lower = worse | <30 cannot work; 0 = death |
| Hunger 0–100 | higher = worse | >60 morale drain; >85 health drain |
| Fatigue 0–100 | higher = worse | >50 efficiency penalty; >80 injury risk |
| Morale 0–100 | lower = worse | <25 refusal chance; affects relationship drift |

### Efficiency formula

Work output for a survivor on a job is:

```
output = base
       × skillFactor(skill)        // 0.55 → 1.60 across skill 0 → 10
       × healthFactor(health)      // 0.40 → 1.00
       × fatigueFactor(fatigue)    // 0.55 → 1.05
       × moraleFactor(morale)      // 0.75 → 1.15
       × traitModifiers            // multiplicative stack
       × facilityLevelFactor       // 1.00 / 1.35 / 1.75
       × powerFactor               // 1.00 or 0.35 if browned out
       × relationshipFactor        // 0.80 → 1.15 based on co-workers
```

Every one of these terms is shown to the player in the job tooltip.

### Traits (selection — full list in `src/engine/data/traits.ts`)

| Trait | Effect |
|---|---|
| Optimist | +12% morale recovery for all survivors in the same facility |
| Insomniac | Rest restores 40% less fatigue, but night-shift work has no penalty; +1 stress/day |
| Field Medic | Treatment consumes 1 less medicine (min 1); +25% treatment success |
| Coward | +35% chance to trigger retreat during expedition combat |
| Hoarder | +10% scavenging yield; refuses to give resources away in events |
| Iron Stomach | Immune to spoiled-food illness; can eat at 50% ration without morale loss |
| Grudge-Keeper | Negative relationship changes are doubled and decay 60% slower |
| Green Thumb | +30% hydroponics yield; unlocks two agriculture events |
| Tinkerer | 15% chance a craft costs no components |
| Claustrophobic | −1 morale/day while no Surface Access facility is built |
| Beloved | On death, all survivors lose 12 morale instead of 6 |
| Night Owl | +20% output on the night shift, −10% on day shift |
| Scarred | −20% injury severity, −15% starting morale |
| Quartermaster | Expedition pack capacity +4; rationing decisions cost 1 less Hope |

Traits are attached to a small hook system, so a trait is data plus (optionally) one
handler in a typed registry — no scattered `if (trait === …)` checks.

---

## 5. Relationships

Every ordered pair of survivors carries a score from −100 to +100, bucketed:

```
 -100 ── hatred ── -60 ── resentment ── -25 ── rivalry ── 0 ── acquaintance
                                                      ── 25 ── trust
                                                      ── 60 ── friendship
                                                      ── 85 ── devotion
```

**Drift**: working the same facility, resting in the same quarters, and surviving an
expedition together push the pair positive. Competing for rations, being blamed in an
event, and one refusing to treat the other push it negative.

**Emergent consequences**:
- Two survivors at *devotion* on the same expedition: if one would die, the other may
  take the wound instead (once per expedition, checked against their combat skill).
- Two at *hatred* assigned to the same facility: −20% output for both, and a daily 8%
  chance of a fight event that injures one.
- A *friendship* dying causes the survivor to enter **Grieving** for 4 days (−20 morale,
  −15% output), and afterwards they gain either the `Hardened` or `Broken` trait.
- Relationship state gates roughly 20 events.

Relationships are **not** a romance system. Affection exists as one bucket label and feeds
the same mechanical hooks as friendship, with slightly stronger grief effects.

---

## 6. The base

Vault Meridian has **14 build slots** across three decks. Slots on lower decks are sealed
at start and opened by clearing rubble (a project costing components and labour).

### Facilities

| Facility | Produces / enables | Power | Staff |
|---|---|---|---|
| Reactor Stub | Power capacity (burns fuel) | — | 1 |
| Water Reclaimer | Water | 4 | 1 |
| Galley | Converts raw food → rations, reduces spoilage | 3 | 1 |
| Infirmary | Treatment quality, illness recovery | 3 | 1 |
| Workshop | Crafting speed, repairs, component salvage | 5 | 2 |
| Bunks | Fatigue recovery, morale floor | 1 | — |
| Storage | Resource caps, reduces spoilage | 1 | — |
| Radio Room | Signal scanning, distant location discovery, trade events | 4 | 1 |
| Laboratory | Research throughput | 6 | 2 |
| Hydroponics | Food, and water cost | 5 | 2 |
| Security Post | Base defence rating, raid resolution | 2 | 1 |
| Surface Access | Reduces expedition travel time, opens far map ring | 2 | — |
| Machine Shop | Unlocks tier-3 recipes, component refining | 6 | 2 |
| Deep Archive | Lore recovery, unlocks the Meridian ending chain | 4 | 1 |

Each facility has **levels 1–3** with escalating build cost, power draw, and output, and a
**condition** value (0–100). Condition decays with use and with power instability. Below
40 the facility risks a **breakdown** event; at 0 it is offline until repaired.

The base view is a stylised cross-section: three decks of slots drawn with SVG, with
condition, power draw, and staffing readable at a glance, and browned-out facilities
visibly dimmed with a scanline flicker.

---

## 7. Crafting

**50 items**, six categories:

| Category | Examples |
|---|---|
| Tools | pry bar, multitool, welding rig, geiger wand, lockpick set |
| Weapons | pipe club, machete, hunting rifle, service pistol, nail bat, crossbow |
| Protection | padded vest, riot plate, respirator, hazard suit |
| Medical | bandage, antiseptic, splint, antibiotics, stim, blood bag, surgical kit |
| Exploration | rope kit, lantern, pack frame, map case, radio beacon, water skin |
| Utility | battery cell, water filter, ration pack, fuel canister, spare parts, seed tray |

Recipes require a facility (Workshop / Machine Shop / Infirmary / Laboratory), a minimum
facility level, sometimes a research unlock, and consume resources plus optionally other
items. Craft time is measured in **labour units** produced by assigned survivors, so a
skilled engineer finishes a rig in one day where an untrained survivor needs three.

Design rule: **no filler recipes.** Every item either changes an expedition outcome,
changes a survivor's state, or unlocks a facility action.

---

## 8. Research

**38 nodes, 7 branches.** Research is committed as a project; Laboratory staff generate
*insight* per day. Nodes cost insight and sometimes an item or a discovery.

| Branch | Theme | Sample terminal node |
|---|---|---|
| Survival | rationing, preservation, shelter | **Cold Cellar** — spoilage → 0, unlocks preserved-food events |
| Engineering | power, repair, construction | **Battery Bank** — power surplus carries over, brownout immunity 1 day |
| Medicine | treatment, disease, surgery | **Field Surgery** — can save a survivor from an otherwise fatal wound |
| Exploration | range, mapping, extraction | **Cache Network** — pre-place supply caches; expeditions can extend a day |
| Agriculture | yield, water use, genetics | **Deep Root Cultivar** — hydroponics self-sustaining; unlocks Deep Root ending |
| Communications | radio, signal, contact | **Directional Array** — locate the source of the Signal; unlocks Listener chain |
| Defence | fortification, deterrence, arms | **Kill Box** — raids resolve without expedition-team casualties |

**Design rule**: at least half of all nodes unlock a *possibility* (a new action, event,
facility, or ending path), not a percentage. Percentage nodes exist but are never terminal.

---

## 9. The world map

The region is generated from the run seed as three concentric **rings** around the vault:

- **Ring 0 — The Block** (0–2 km): 5–7 sites, low danger, thin loot, short travel.
- **Ring 1 — The District** (2–8 km): 8–10 sites, moderate danger, real loot.
- **Ring 2 — The Reach** (8–25 km): 6–9 sites, high danger, unique loot and lore. Requires
  Surface Access or a vehicle.

Sites are drawn from **24 archetypes** (ruined apartment block, supermarket, clinic,
hospital, police station, subway platform, warehouse, school, textile factory, water
treatment plant, radio tower, military checkpoint, collapsed tunnel, unknown signal,
church, garden centre, filling station, sunken car park, data centre, quarantine tent,
grain silo, hardware store, bus depot, Meridian access hatch).

Each site carries:
- **danger** 1–10 (drives encounter tables and combat difficulty)
- **loot profile** (weighted resource/item pools, richness that depletes with visits)
- **distance** (drives travel days and pack food cost)
- **state**: unknown → rumoured → scouted → explored → picked clean → collapsed / claimed
- **known information** (revealed progressively: first the archetype, then danger, then
  the loot profile, then whether it is occupied)
- **site events**: archetype-specific events that can only fire there

The map view is an SVG radial chart with the vault at centre, hand-drawn-feeling connector
lines, fog for undiscovered rings, and a hover/tap inspector showing exactly what is known
and what is guessed.

---

## 10. Expeditions

The player forms a team (1–4 survivors), then packs a **load-out** with limited capacity:
weapons, tools, medical supplies, food rations, and utility items. Pack capacity is
determined by team size, pack frames, and the `Quartermaster` trait.

Before dispatch the player sees a **risk forecast**:

```
  TARGET       Northgate Supermarket   (Ring 1 · danger 4 · 2 days)
  TEAM         Iris ✚ Doran ✚ Sela
  ─────────────────────────────────────────────────────
  Combat power        14   (rifle 6 · machete 3 · skill 5)
  Carry capacity      22   (pack frame ×1)
  Rations packed       6   / 6 needed
  ─────────────────────────────────────────────────────
  Injury risk        MODERATE   ~31%
  Death risk         LOW        ~6%
  Expected haul      medium     food, components, medical
  ⚠ Sela is at fatigue 71 — injury risk +9%
```

Dispatch resolves as an **interactive encounter sequence** of 3–6 beats:

```
  TRAVEL  →  APPROACH  →  SITE (×1–3)  →  COMPLICATION  →  EXTRACTION
```

Each beat presents a situation and 2–4 choices. Choices are gated by items, skills,
traits, and ammo. Outcomes are resolved by skill checks against a displayed target, with
the roll shown. Results include loot, injury, illness, relationship change, lore
discovery, flags, and occasionally death — always preceded by at least one beat that
signalled the danger.

**Return**: the team is away for `travelDays`, eating packed rations rather than base
stores. Loot arrives on the return day. This makes packing a genuine decision: food you
send out is food not eaten at home.

---

## 11. Combat resolution

Combat is abstract and fully previewed. When an encounter forces a fight:

```
teamPower  = Σ over members of (combatSkill × healthFactor × moraleFactor)
           + Σ weapon power (ranged weapons additionally consume ammo)
           + armour mitigation
           + preparation bonus (from prior beat choices)
           + trait modifiers

threat     = enemy base × danger scaling × site modifiers × night modifier

margin     = teamPower − threat  (+ 1d10-derived variance from the seeded RNG)
```

Margin bands map to outcomes: rout → clean win → costly win → repulsed → disaster.
Casualties are chosen by a weighted roll favouring the lowest-health, highest-fatigue
member, modified by traits (`Coward` flees, `Guardian` interposes, devotion pairs
interpose). **A survivor can never die from a full-health, no-warning single roll**: fatal
outcomes require the survivor to already be wounded, or the disaster band to be hit, and
both are visible in the forecast.

---

## 12. Event engine

Events are pure data. The engine evaluates a **condition tree** and applies an **effect
list**; the UI is generic. Adding an event requires no UI code.

```ts
{
  id: 'radio.stranger_broadcast',
  title: 'A Voice on 112.4',
  tags: ['radio', 'contact'],
  phase: 'dusk',
  weight: 30,
  cooldown: 8,
  once: false,
  requires: all(
    facility('radio_room', { minLevel: 1, operational: true }),
    dayAtLeast(4),
    not(flag('listeners.contacted')),
  ),
  body: '…',
  choices: [
    {
      id: 'answer',
      label: 'Answer them',
      hint: 'Negotiation check vs 6',
      requires: survivorWithSkill('negotiation', 3),
      check: { skill: 'negotiation', target: 6, actor: 'best' },
      onSuccess: [ gainResource('food', 8), setFlag('listeners.contacted'),
                   scheduleEvent('radio.stranger_returns', { inDays: 3 }) ],
      onFailure: [ loseResource('hope', 6), addRelationship(-10, 'actor', 'all'),
                   scheduleEvent('radio.stranger_hostile', { inDays: 2 }) ],
    },
    …
  ],
}
```

Supported condition atoms: day range, resource thresholds, facility presence/level/state,
survivor count/skill/trait/condition, relationship bucket, flags, research completed,
item owned, location state, weather, difficulty, scenario, previous event outcomes.

Supported effects: resource change, item grant/remove, survivor need change, injury,
illness, cure, death, recruit, facility damage/repair/unlock, research grant, location
reveal/change, relationship change, flag set/clear, lore unlock, scheduled event, chained
event, statistic increment, trait grant.

**Delayed consequences** are first-class: `scheduleEvent` places an entry on a timeline
that fires on a future day regardless of weighting, which is how chains stay coherent.

**Content target: 90+ events**, grouped:
survival (14), social/relationship (16), facility (10), radio/lore (14), stranger/contact
(10), weather/seasonal (8), medical (8), moral dilemma (12), chain-only events (8+).

---

## 13. Scenarios

| Scenario | Twist |
|---|---|
| **Cold Start** *(default)* | 4 survivors, balanced stores, all systems available. |
| **Black Winter** | Temperature system active: +60% food/fuel drain, freezing events, hydroponics halved. |
| **Silent City** | Radio Room destroyed and unbuildable for 10 days; no distant discovery; the Listener chain starts hostile. |
| **The Last Convoy** | 8 survivors, 3 days of food, an evacuation deadline on day 25. |
| **Skeleton Crew** | 2 survivors, double stores, all facilities pre-built at L1. A logistics puzzle. |
| **The Meridian Key** *(unlock)* | Start with the Deep Archive and a fragment of the truth. Enemies know it. |

## 14. Difficulty

Four levels, each adjusting **eleven** distinct system parameters rather than one multiplier:

| Parameter | Dim | Overcast *(default)* | Blackout | Absolute |
|---|---|---|---|---|
| Starting stores | ×1.5 | ×1.0 | ×0.75 | ×0.6 |
| Loot richness | ×1.3 | ×1.0 | ×0.85 | ×0.7 |
| Consumption | ×0.85 | ×1.0 | ×1.1 | ×1.2 |
| Event severity | −1 band | normal | +1 band | +2 bands |
| Injury chance | ×0.7 | ×1.0 | ×1.2 | ×1.4 |
| Death threshold | forgiving | normal | harsh | harsh |
| Facility decay | ×0.7 | ×1.0 | ×1.25 | ×1.5 |
| Illness chance | ×0.6 | ×1.0 | ×1.3 | ×1.6 |
| Hope drain | ×0.7 | ×1.0 | ×1.2 | ×1.45 |
| Research cost | ×0.9 | ×1.0 | ×1.1 | ×1.2 |
| Recruit frequency | ×1.4 | ×1.0 | ×0.8 | ×0.6 |

`Dim` is explicitly labelled as the way to learn the game, not an insult.

## 15. Endings

A run ends when one of these resolves. Each produces a distinct end-of-run report.

| Ending | Trigger |
|---|---|
| **Silence** | All survivors dead. |
| **The Vault Fails** | Water or power at zero for 3 consecutive days with no recovery path. |
| **Scattered** | Hope 0 and the mutiny chain completes; the survivors leave without you. |
| **Exodus** | Build and fuel the Convoy (Machine Shop L3 + 60 fuel + vehicle project); drive out. |
| **Deep Root** | Achieve full self-sufficiency (food, water, power net-positive) and hold 10 days. |
| **The Signal** | Complete the Listener chain and go to the source. |
| **Meridian** | Complete the Deep Archive chain and learn what the vault was for. |
| **Last Light** | Reach Meridian *and* Signal resolution in one run, then choose what to do with it. |

## 16. Meta-progression (Legacy)

Ending a run awards **Legacy** based on days survived, endings reached, lore recovered,
and survivors saved. Legacy unlocks, in a small tree:

- 3 additional scenarios
- 8 additional traits in the generation pool
- 4 starting kit options (Tools / Medicine / Arms / Seeds)
- 3 run modifiers (Ironman, Rich Region, Long Winter)
- The lore archive (permanent, cross-run, only reveals what has been found)

**Anti-grind rule**: total Legacy required to unlock everything is achievable in roughly
8–12 runs, and nothing unlocked is a raw power increase to the base run — unlocks add
*options*, not stats.

## 17. Onboarding

No tutorial modal. Instead:

- Day 1 restricts the UI to Dashboard + Crew, with one highlighted objective.
- Days 2–6 unlock one panel each with a single-sentence contextual card that can be
  dismissed forever.
- The first time any derived number matters, its breakdown opens automatically once.
- A **Guidance** toggle in settings turns all of this off for returning players, and the
  main menu offers "Skip guidance" from the second run onward.

## 18. Accessibility

- Full keyboard navigation; every interactive element reachable and labelled.
- Reduced-motion mode disabling scanlines, flicker, particles, and transitions.
- Three text scales; layout reflows rather than clipping.
- Colour is never the sole carrier of meaning: status uses icon + label + colour.
- WCAG AA contrast on all text; verified by an automated contrast test.
- Screen-reader live region announcing phase changes and critical alerts.

## 19. Visual direction

**Abandoned command centre, still powered.** Deep charcoal and oxidised steel surfaces,
amber and phosphor-green readouts, thin rules, and monospaced numerics. Restraint is the
point: motion is limited to slow ambient flicker, readout ticks, and short purposeful
transitions.

- Palette: `#0a0c0d` void, `#14181a` panel, `#1f2528` raised, `#c8a24a` amber signal,
  `#5fd0a0` phosphor, `#d05f5f` alarm, `#8a9499` muted text, `#e6ecef` primary text.
- Typography: a geometric sans for prose, a monospace for all numbers and identifiers.
- Texture: subtle procedural noise and a very low-opacity scanline overlay, both disabled
  by reduced motion.
- Every panel reads as a physical instrument: bezel, label plate, indicator lamps.

## 20. Audio

All audio is synthesised at runtime with WebAudio — no files. A small set of cues: UI
click, confirm, alert, day transition, discovery, death toll, ambient hum bed. Master and
category volumes, off by default until the player enables sound.
