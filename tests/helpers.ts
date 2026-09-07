import {
  createInitialState,
  createRng,
  Facilities,
  type FacilityInstance,
  type GameState,
  type NewRunOptions,
  type Rng,
  type Survivor,
} from '@engine';

/** A fresh run with a fixed seed, so every assertion below is reproducible. */
export function newState(options: NewRunOptions = {}): GameState {
  return createInitialState({ seed: 'TEST-SEED', now: 0, ...options });
}

export function testRng(label = 'test'): Rng {
  return createRng(label);
}

/** Fill every store to its cap, so a test can isolate one system from scarcity. */
export function stockUp(state: GameState, amount = 500): GameState {
  for (const key of Object.keys(state.resources) as (keyof GameState['resources'])[]) {
    state.resources[key] = key === 'hope' ? 80 : Math.min(amount, state.resourceCaps[key]);
  }
  return state;
}

/** Place a facility directly, bypassing cost and construction time. */
export function placeFacility(
  state: GameState,
  defId: string,
  level = 1,
  overrides: Partial<FacilityInstance> = {},
): FacilityInstance {
  const slot = state.slots.find(
    (s) => !s.sealed && !state.facilities.some((f) => f.slotId === s.id),
  );
  if (!slot) throw new Error('No free slot for the test facility');
  const instance: FacilityInstance = {
    id: `test-${defId}-${state.facilities.length}`,
    defId,
    slotId: slot.id,
    level,
    condition: 100,
    status: 'operational',
    progress: 0,
    progressRequired: 0,
    staff: [],
    priority: 5,
    brownedOut: false,
    builtDay: state.day,
    ...overrides,
  };
  state.facilities.push(instance);
  return instance;
}

/** Put a survivor to work in a facility, creating the link on both sides. */
export function staff(state: GameState, facility: FacilityInstance, survivor: Survivor): void {
  Facilities.assignToFacility(state, survivor.id, facility.id);
}

export function firstAlive(state: GameState): Survivor {
  const survivor = state.survivors.find((s) => s.alive);
  if (!survivor) throw new Error('The test state has no living survivors');
  return survivor;
}

/** A deep structural copy, used to assert that a "pure" call changed nothing. */
export function snapshot<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
