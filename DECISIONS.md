# Decisions

Choices that are hard to reverse — data formats, save schemas, public boundaries — with the
reasoning that led to them. A decision recorded here is not permanent, but changing it costs
a migration or a break, so it should be changed on purpose rather than by drift.

---

## 1. Prose is translated when it is written, not when it is read

**Status**: decided, 2026-09-07. Raised as a hardening candidate in
[#4](https://github.com/jeiel85/last-light/issues/4) so it would be settled deliberately
rather than by default.

Log lines, survivor history, and the stored ending summary are written into the save as
finished text, in whatever language was current at the moment they happened. Switching
language afterwards changes the interface around them; it does not rewrite them. A save
played across a language switch therefore reads in two languages.

**The alternative** is to store a message key and its parameters and render at read time, so
history re-renders in the current language. That is the more flexible representation, and it
is what a fresh design would probably reach for.

**Why we are not doing it.** Three reasons, in order of weight:

1. **A log is a record.** It is the account of what happened on day 31, written at the time.
   The engine composes these lines from values that no longer exist afterwards — a survivor
   who has since died, a facility that was demolished, a roll that was made once. Reducing
   them to a key plus parameters means every one of those values has to survive in the save
   for as long as the line does, which is the rest of the run.
2. **The cost is a schema change and a migration** across every save on every player's
   machine, to fix a seam that only appears if a player switches language mid-run — and the
   seam it produces is legible rather than broken: old entries read in the old language,
   new entries in the new one.
3. **It is asserted, not accidental.** `tests/i18n/i18n.test.ts` locks the behaviour in place
   with the reasoning attached, so nobody "fixes" it by accident and nobody has to rediscover
   this argument to know it was made.

**What would change our mind.** A save format change we are making anyway for another reason
— at which point storing keys costs a migration we are already paying for. Or evidence that
players do switch language mid-run often enough for the seam to be a complaint rather than a
curiosity.

---

## 2. A locale is fetched on demand, not bundled into the app chunk

**Status**: decided, 2026-09-07.

`src/i18n/index.ts` holds a loader per locale rather than a static import, so each language
is its own chunk and an English-only player never downloads one. This makes `setLocale`
asynchronous, which is the real cost: `gameStore.bootstrap` awaits it so the first paint is
already in the player's language, and `coverageFor` is async because the report has to ask
for a bundle rather than assume the runtime holds it.

The alternative — importing every locale statically — is simpler and was what v1.0.1
shipped. It put ~270 kB of Korean into the first load of every player, and the next language
would add as much again. The cost of loading on demand is paid once, in the shape of two
async boundaries; the cost of not doing it grows with every language added.

**What this does and does not buy.** It takes the locale off the critical path: the app chunk
drops from 610 kB to 294 kB and Korean is fetched only by a player who reads Korean. It does
*not* mean the bytes are never transferred. The service worker's precache glob is
`**/*.{js,css,html,svg,png,woff2}`, so an installed PWA still downloads every locale chunk in
the background, after load. That is deliberate: a player who installs the game and then goes
offline should still be able to switch language, and a language switch that silently fails
offline is worse than a background download that already happens off the critical path.

---

## 3. Tier-3 research is aspirational, and the interface says so

**Status**: decided, 2026-09-08. The last open item on
[#4](https://github.com/jeiel85/last-light/issues/4), left open there deliberately so it
would be settled with measurements rather than by taste.

No run completes a tier-3 research node. The item asked whether that makes them
"you must choose" or "these are overpriced". Measured, they are neither: **the run's
insight budget is smaller than the chains it is meant to pay for.**

| | insight |
|---|---|
| generated in a 60-day run (mean, 300 runs) | **93** |
| cheapest tier-3 node, all-in with prerequisites (`sur_cold_cellar`) | **76** |
| mean tier-3 chain across the ten nodes | **111** |
| whole tree, list price | 1071 |

A run's entire research budget, spent in one perfectly straight line and ignoring the
laboratory gate altogether, buys the single cheapest tier-3 node with 17 points to spare
and buys no other one at all.

**The levers were measured, not guessed**, on 300 identical seeds each. Cutting the
laboratory's level-2 price from 46 components to 28 changes nothing — tier 3 stays at 0.00
nodes per run. Raising `insightPerStaff` from 7.2 to 9.0 changes nothing, because the
laboratory stands unstaffed on about two-thirds of the days it is running and no crew are
idle on those days: they are resting, in other facilities, or on expedition. Moving the
tier-3 gate off laboratory level 2 entirely buys 0.05 nodes per run.

**What we are doing.** Keeping the balance numbers exactly as they are, and making the
interface stop implying otherwise. `researchAvailability` now returns `chainCost` — the
node's price plus every prerequisite still outstanding — and the research panel shows that,
with a matching day estimate, for any node the player cannot start yet. A tier-3 node used
to advertise "39" and "~22d"; it now reads "76 all-in" and the estimate that follows from
it.

**Why not retune.** The two honest alternatives are to roughly double the insight budget or
to cut the tier-3 chains to fit, and both change what the game is. The only lever measured
that moves research at all is `baselineInsight` — the rate that applies with no laboratory —
which raises completions from 4.3 to 6.8 nodes and wins from 9% to 15%, and does it by
making the laboratory matter less. That is backwards for a science building. Tier 3 as
content a run reaches for and rarely closes is a defensible shape; tier 3 mispriced in the
panel was not.

**What would change our mind.** A longer run length or a meta-progression that carries
insight between runs — either would move the budget rather than the prices, which is the
side of the equation the measurements point at. Or evidence that players read a locked tier
as broken rather than as distant.
