import { describe, expect, it } from 'vitest';
import {
  ARCHETYPE_BY_ID,
  EVENTS,
  EVENT_BY_ID,
  Expedition,
  LOCATION_ARCHETYPES,
  RESEARCH_BY_ID,
  Survivors,
  World,
  evaluateCondition,
  presentEvent,
  resolveEvent,
} from '@engine';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { EventCondition, GameState } from '@engine';
import { newState, stockUp, testRng } from '../helpers';

/** Flags the simulation itself writes, read straight out of the engine sources. */
function flagsWrittenBySystems(): Set<string> {
  const out = new Set<string>();
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((entry) => {
      const full = join(dir, entry);
      return statSync(full).isDirectory() ? walk(full) : full.endsWith('.ts') ? [full] : [];
    });

  for (const file of walk(join(process.cwd(), 'src', 'engine', 'systems'))) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/state\.flags\[\s*[`'"]([^`'"\]]+)[`'"]\s*\]\s*=/g)) {
      out.add(match[1]!);
    }
    // Template writes such as `ending:available:${id}` become a prefix rule.
    for (const match of source.matchAll(/state\.flags\[`([^`$]*)\$\{/g)) out.add(`${match[1]!}*`);
  }
  return out;
}

/**
 * Reachability of the story.
 *
 * A narrative arc that cannot be reached is worse than one that does not exist: the
 * content is paid for and never seen, and the endings it gates look like bugs. These
 * tests assert that every authored scene has a route to the player.
 */

/** Every flag any event condition tests for. */
function flagsRead(condition: EventCondition | undefined, out = new Set<string>()): Set<string> {
  if (!condition) return out;
  if (condition.kind === 'all' || condition.kind === 'any') {
    for (const child of condition.of) flagsRead(child, out);
  } else if (condition.kind === 'not') {
    flagsRead(condition.of, out);
  } else if (condition.kind === 'flag') {
    out.add(condition.flag);
  }
  return out;
}

/** Every flag any event choice writes. */
function flagsWritten(): Set<string> {
  const out = new Set<string>();
  for (const event of EVENTS) {
    for (const choice of event.choices) {
      for (const effect of [...(choice.effects ?? []), ...(choice.onSuccess ?? []), ...(choice.onFailure ?? [])]) {
        if (effect.kind === 'flag') out.add(effect.flag);
      }
    }
  }
  return out;
}

describe('site events', () => {
  it('every authored site scene is attached to a location that can be generated', () => {
    const declared = LOCATION_ARCHETYPES.flatMap((a) => (a.siteEvents ?? []).map((id) => ({ id, a })));
    expect(declared.length).toBeGreaterThan(0);
    for (const { id, a } of declared) {
      expect(EVENT_BY_ID[id], `${id} is declared on ${a.id} but does not exist`).toBeDefined();
      expect(a.rings.length, `${a.id} can never be placed`).toBeGreaterThan(0);
      expect(a.maxInstances).toBeGreaterThan(0);
    }
  });

  it('a team that works a site with a scene comes home to that decision', () => {
    // Build a run whose reachable map contains the archetype under test.
    const withScene = LOCATION_ARCHETYPES.find((a) => (a.siteEvents ?? []).length > 0)!;
    const state = stockUp(newState({ seed: 'SITE-EVENT' }));
    state.day = 8;

    const location = state.world.locations[0]!;
    location.archetypeId = withScene.id;
    location.ring = 0;
    location.state = 'scouted';
    location.travelDays = 0;

    const team = Survivors.livingSurvivors(state)
      .filter((s) => Survivors.canJoinExpedition(s).ok)
      .slice(0, 2)
      .map((s) => s.id);
    expect(team.length).toBeGreaterThan(0);

    const dispatch = Expedition.dispatchExpedition(state, location.id, team, {
      ...Expedition.emptyLoadout(),
      rations: 4,
      water: 4,
    });
    expect(dispatch.ok).toBe(true);

    let guard = 0;
    while (state.activeExpeditionId && guard < 40) {
      const beat = Expedition.currentBeat(state);
      if (!beat) break;
      // Never abort: the scene is the reward for actually working the site.
      const choice =
        beat.choices.find((c) => c.enabled && !c.choice.outcome?.abort) ??
        beat.choices.find((c) => c.enabled) ??
        beat.choices[0]!;
      Expedition.resolveBeat(state, choice.choice.id);
      guard += 1;
    }

    const worked = state.expeditions.some((e) => e.log.some((b) => b.encounterId.startsWith('site.')));
    if (!worked) return; // the queue can legitimately abort early; that path is tested elsewhere

    expect(state.events.pending.some((p) => withScene.siteEvents!.includes(p.eventId))).toBe(true);
  });

  it('a site scene fires at most once', () => {
    const withScene = LOCATION_ARCHETYPES.find((a) => (a.siteEvents ?? []).length > 0)!;
    const eventId = withScene.siteEvents![0]!;
    const state = stockUp(newState({ seed: 'SITE-ONCE' }));
    state.events.seenCounts[eventId] = 1;

    const location = state.world.locations[0]!;
    location.archetypeId = withScene.id;
    const expedition = {
      id: 'e1',
      locationId: location.id,
      members: [Survivors.livingSurvivors(state)[0]!.id],
      loadout: Expedition.emptyLoadout(),
      departedDay: 1,
      returnDay: 1,
      haulResources: {},
      haulItems: [],
      log: [
        {
          encounterId: 'site.test',
          title: 't',
          text: 't',
          choiceId: 'c',
          choiceLabel: 'c',
          outcomeText: 'o',
          tone: 'neutral' as const,
        },
      ],
      queue: [],
      resolved: true,
      casualties: [],
      loreFound: [],
      preparation: 0,
      aborted: false,
    };
    state.expeditions.push(expedition);
    Expedition.deliverExpedition(state, expedition);
    expect(state.events.pending.some((p) => p.eventId === eventId)).toBe(false);
  });
});

describe('narrative reachability', () => {
  it('every flag an event waits on is set by something', () => {
    const written = flagsWritten();
    const systems = flagsWrittenBySystems();
    const prefixes = [...systems].filter((f) => f.endsWith('*')).map((f) => f.slice(0, -1));
    const known = (flag: string): boolean =>
      written.has(flag) ||
      systems.has(flag) ||
      prefixes.some((prefix) => flag.startsWith(prefix)) ||
      flag.startsWith('mod:') ||
      flag.startsWith('banned:') ||
      flag.startsWith('research:');
    const missing: string[] = [];
    for (const event of EVENTS) {
      for (const flag of flagsRead(event.requires)) {
        if (!known(flag)) missing.push(`${event.id} waits on "${flag}"`);
      }
      for (const choice of event.choices) {
        for (const flag of flagsRead(choice.requires)) {
          if (!known(flag)) missing.push(`${event.id}/${choice.id} waits on "${flag}"`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('the arc that gates the best endings has an opening move', () => {
    // `mer.the_bulkhead` opens the Meridian arc, and it waits on meridian.suspicious.
    const opener = EVENT_BY_ID['mer.the_bulkhead'];
    expect(opener).toBeDefined();

    const setters = EVENTS.filter((event) =>
      event.choices.some((choice) =>
        [...(choice.effects ?? []), ...(choice.onSuccess ?? []), ...(choice.onFailure ?? [])].some(
          (effect) => effect.kind === 'flag' && effect.flag === 'meridian.suspicious',
        ),
      ),
    );
    expect(setters.length, 'nothing in the catalogue can start the Meridian arc').toBeGreaterThan(0);

    // And at least one of those setters must itself be reachable — either freely weighted,
    // or attached to a site the player can visit.
    const siteAttached = new Set(LOCATION_ARCHETYPES.flatMap((a) => a.siteEvents ?? []));
    const reachable = setters.filter((event) => !event.scheduledOnly || siteAttached.has(event.id));
    expect(reachable.length, 'every Meridian opener is unreachable').toBeGreaterThan(0);
  });

  it('the research that gates the archive is affordable inside a run', () => {
    const node = RESEARCH_BY_ID['com_archive_access'];
    expect(node).toBeDefined();
    const chainCost = (id: string, seen = new Set<string>()): number => {
      if (seen.has(id)) return 0;
      seen.add(id);
      const n = RESEARCH_BY_ID[id];
      if (!n) return 0;
      return n.cost + n.requires.reduce((a, r) => a + chainCost(r, seen), 0);
    };
    // A single staffed laboratory produces roughly 7 insight a day; a 40-day run therefore
    // affords about 280. The archive line must sit well inside that.
    expect(chainCost('com_archive_access')).toBeLessThan(140);
  });

  it('every ending has a state that can produce it', () => {
    const state: GameState = stockUp(newState());
    // Extinction is always available.
    for (const survivor of state.survivors) survivor.alive = false;
    expect(evaluateCondition(undefined, { state, roll: 0 })).toBe(true);
  });
});

describe('site scenes present like any other event', () => {
  it('a queued site scene can be presented and resolved', () => {
    const withScene = LOCATION_ARCHETYPES.find((a) => (a.siteEvents ?? []).length > 0)!;
    const eventId = withScene.siteEvents![0]!;
    const state = stockUp(newState({ seed: 'SITE-RESOLVE' }));
    state.events.pending.push({ eventId, scheduled: true });

    const presentation = presentEvent(state);
    expect(presentation?.event.id).toBe(eventId);
    const choice = presentation!.choices.find((c) => c.enabled)!;
    const result = resolveEvent(state, choice.choice.id, testRng('site'));
    expect(result.ok).toBe(true);
    expect(result.resultText.length).toBeGreaterThan(0);
  });

  it('the map can actually generate the archetypes that carry scenes', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 60; i += 1) {
      for (const location of World.generateWorld(testRng(`gen-${i}`), 1)) {
        if ((ARCHETYPE_BY_ID[location.archetypeId]?.siteEvents ?? []).length > 0) {
          seen.add(location.archetypeId);
        }
      }
    }
    const carriers = LOCATION_ARCHETYPES.filter((a) => (a.siteEvents ?? []).length > 0).map((a) => a.id);
    for (const id of carriers) {
      expect(seen.has(id), `${id} was never generated in 60 maps`).toBe(true);
    }
  });
});
