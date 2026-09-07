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
