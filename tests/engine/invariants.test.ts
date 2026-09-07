import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  EVENTS,
  Expedition,
  Survivors,
  World,
  advanceDay,
  dropUnknownEvents,
  presentEvent,
  resolveEvent,
} from '@engine';
import { newState, snapshot, stockUp, testRng } from '../helpers';

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : full.endsWith('.ts') ? [full] : [];
  });
}

describe('presentEvent is safe to call during render', () => {
  it('does not touch the state', () => {
    const state = stockUp(newState());
    state.events.pending = [{ eventId: EVENTS[0]!.id }];
    const before = snapshot(state);
    presentEvent(state);
    expect(snapshot(state)).toEqual(before);
  });

  it('does not touch the state even when the queue holds an id this build lacks', () => {
    const state = stockUp(newState());
    state.events.pending = [{ eventId: 'gone.in.this.build' }, { eventId: EVENTS[0]!.id }];
    const before = snapshot(state);

    const presentation = presentEvent(state);
    expect(presentation?.event.id).toBe(EVENTS[0]!.id);
    expect(snapshot(state)).toEqual(before);
  });

  it('reports only the events it could actually present', () => {
    const state = stockUp(newState());
    state.events.pending = [
      { eventId: 'gone' },
      { eventId: EVENTS[0]!.id },
      { eventId: EVENTS[1]!.id },
    ];
    expect(presentEvent(state)!.remaining).toBe(2);
  });

  it('returns nothing when every queued id is unknown', () => {
    const state = stockUp(newState());
    state.events.pending = [{ eventId: 'gone' }, { eventId: 'also-gone' }];
    expect(presentEvent(state)).toBeNull();
  });
});

describe('unknown queued events are swept by the writers', () => {
  it('resolveEvent drops them and still consumes the right entry', () => {
    const state = stockUp(newState());
    state.events.pending = [{ eventId: 'gone' }, { eventId: EVENTS[0]!.id }];

    const choice = presentEvent(state)!.choices.find((c) => c.enabled)!;
    const result = resolveEvent(state, choice.choice.id, testRng('sweep'));

    expect(result.ok).toBe(true);
    expect(state.events.pending).toHaveLength(0);
    expect(state.events.seenCounts[EVENTS[0]!.id]).toBe(1);
  });

  it('the day pipeline never leaves an unpresentable event queued', () => {
    const state = stockUp(newState());
    advanceDay(state);
    state.events.pending.push({ eventId: 'gone' });
    advanceDay(state);
    for (const entry of state.events.pending) {
      expect(EVENTS.some((e) => e.id === entry.eventId)).toBe(true);
    }
  });

  it('dropUnknownEvents reports how many it removed', () => {
    const state = newState();
    state.events.pending = [{ eventId: 'a' }, { eventId: EVENTS[0]!.id }, { eventId: 'b' }];
    expect(dropUnknownEvents(state)).toBe(2);
    expect(state.events.pending).toHaveLength(1);
  });
});

describe('the expedition view can always be left', () => {
  it('dismissing returns the game to a phase the player can act in', () => {
    const state = stockUp(newState());
    state.day = 6;
    const location = World.reachableLocations(state)[0]!;
    const team = Survivors.livingSurvivors(state)
      .filter((s) => Survivors.canJoinExpedition(s).ok)
      .slice(0, 1)
      .map((s) => s.id);
    Expedition.dispatchExpedition(state, location.id, team, { ...Expedition.emptyLoadout(), rations: 3, water: 3 });

    // A queue still to answer is not dismissable: the decisions are the expedition.
    Expedition.dismissExpeditionView(state);
    expect(state.phase).toBe('expedition');

    // Once there is nothing left to answer, it always is.
    const expedition = state.expeditions.find((e) => e.id === state.activeExpeditionId)!;
    expedition.queue = [];
    Expedition.dismissExpeditionView(state);
    expect(state.phase).not.toBe('expedition');
    expect(state.activeExpeditionId).toBeNull();
  });

  it('hands back to the event phase when events are still waiting', () => {
    const state = stockUp(newState());
    state.phase = 'expedition';
    state.activeExpeditionId = null;
    state.events.pending = [{ eventId: EVENTS[0]!.id }];
    Expedition.dismissExpeditionView(state);
    expect(state.phase).toBe('events');
  });
});

describe('the flag namespace stays separated', () => {
  /** Prefixes the simulation owns. Content may only write the two sanctioned hand-offs. */
  const SYSTEM_PREFIXES = [
    'mod:',
    'banned:',
    'shortfall:',
    'power:',
    'labour:',
    'clearing:',
    'research:',
    'encounter:',
    'order:',
    'passive:',
    'critical:',
    'deeproot:',
  ];
  const CONTENT_MAY_WRITE = ['unlock:', 'ending:available:'];

  const contentFlags = (() => {
    const out = new Set<string>();
    for (const file of walk(join(process.cwd(), 'src', 'engine', 'data', 'events'))) {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(/kind:\s*'flag',\s*flag:\s*'([^']+)'/g)) out.add(match[1]!);
    }
    return out;
  })();

  it('content never writes into a prefix the simulation owns', () => {
    const trespass = [...contentFlags].filter(
      (flag) =>
        SYSTEM_PREFIXES.some((prefix) => flag.startsWith(prefix)) &&
        !CONTENT_MAY_WRITE.some((prefix) => flag.startsWith(prefix)),
    );
    expect(trespass, 'events must not write mechanical counters').toEqual([]);
  });

  it('the two sanctioned hand-offs are the only colon-prefixed flags content writes', () => {
    const colonised = [...contentFlags].filter((flag) => flag.includes(':'));
    for (const flag of colonised) {
      expect(
        CONTENT_MAY_WRITE.some((prefix) => flag.startsWith(prefix)),
        `${flag} crosses into the simulation's namespace`,
      ).toBe(true);
    }
  });

  it('the shortage counter is scoped and cleared rather than accumulating', () => {
    const state = newState();
    state.resources.food = 0;
    state.resources.water = 0;
    advanceDay(state);
    state.events.pending = [];
    expect(Number(state.flags['shortfall:food'] ?? 0)).toBeGreaterThan(0);

    // Refill and the counter resets rather than lingering in the save for the whole run.
    state.resources.food = 200;
    state.resourceCaps.food = 200;
    advanceDay(state);
    expect(state.flags['shortfall:food']).toBeUndefined();
  });
});
