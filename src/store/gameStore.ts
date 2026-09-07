import { create } from 'zustand';
import { produce } from 'immer';
import type {
  ExpeditionLoadout,
  GameState,
  ItemId,
  MetaProfile,
  RecipeId,
  ResearchId,
  SurvivorId,
} from '@engine';
import {
  advanceDay,
  createInitialState,
  Crafting,
  Expedition,
  Facilities,
  Inventory,
  Meta,
  resolveEvent as engineResolveEvent,
  Research,
  rngFromState,
  World,
  type NewRunOptions,
} from '@engine';
import { autosave, deleteSlot, readMeta, readSlot, writeMeta } from '@save/serialize';
import { AUTOSAVE_SLOT } from '@save/schema';
import type { Settings } from '@save/schema';
import { DEFAULT_SETTINGS } from '@save/schema';

/**
 * The game store.
 *
 * This is a thin shell: every action produces the next state by calling an engine
 * function inside `produce`. No game rule is implemented here, which is what keeps the
 * simulation testable in isolation and identical between the UI and the headless
 * simulator.
 */

export interface ActionResult {
  ok: boolean;
  message?: string;
}

interface GameStoreState {
  state: GameState | null;
  profile: MetaProfile;
  settings: Settings;
  loaded: boolean;
  /** Transient user-facing message, shown as a toast. */
  notice: { text: string; tone: 'good' | 'bad' | 'info' } | null;
  /** Incremented whenever the day advances, so panels can animate. */
  dayTick: number;

  /* lifecycle */
  bootstrap: () => Promise<void>;
  newRun: (options: NewRunOptions) => void;
  loadState: (state: GameState) => void;
  abandonRun: () => void;
  setSettings: (patch: Partial<Settings>) => void;
  setProfile: (profile: MetaProfile) => void;
  notify: (text: string, tone?: 'good' | 'bad' | 'info') => void;
  dismissNotice: () => void;

  /* planning */
  assign: (survivorId: SurvivorId, target: string | null) => ActionResult;
  build: (defId: string, slotId: string) => ActionResult;
  upgrade: (facilityId: string) => ActionResult;
  demolish: (facilityId: string) => ActionResult;
  repair: (facilityId: string) => ActionResult;
  setPriority: (facilityId: string, priority: number) => void;
  clearSlot: (slotId: string) => ActionResult;
  queueCraft: (recipeId: RecipeId) => ActionResult;
  cancelCraft: (jobId: string) => ActionResult;
  startResearch: (id: ResearchId) => ActionResult;
  cancelResearch: () => ActionResult;
  equip: (survivorId: SurvivorId, itemId: ItemId) => ActionResult;
  unequip: (survivorId: SurvivorId, slot: 'weapon' | 'tool' | 'armour' | 'utility') => ActionResult;
  consumeItem: (itemId: ItemId, survivorId: string | null) => ActionResult;
  salvage: (itemId: ItemId) => ActionResult;
  toggleOrder: (flag: string) => void;
  markGuidanceSeen: (id: string) => void;

  /* expedition */
  dispatch: (locationId: string, members: SurvivorId[], loadout: ExpeditionLoadout) => ActionResult;
  resolveBeat: (choiceId: string) => ActionResult;
  scout: (locationId: string) => ActionResult;

  /* time */
  endDay: () => { ended: boolean; pendingEvents: number };
  resolveEvent: (choiceId: string) => ReturnType<typeof engineResolveEvent> | null;
  finishRun: () => void;
}

function mutate(
  get: () => GameStoreState,
  set: (partial: Partial<GameStoreState>) => void,
  recipe: (draft: GameState) => void,
): void {
  const current = get().state;
  if (!current) return;
  set({ state: produce(current, recipe) });
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  state: null,
  profile: {
    version: 1,
    legacy: 0,
    legacySpent: 0,
    unlocks: [],
    loreArchive: [],
    runsStarted: 0,
    runsCompleted: 0,
    bestDays: 0,
    endingsSeen: [],
    hasPlayed: false,
  },
  settings: { ...DEFAULT_SETTINGS },
  loaded: false,
  notice: null,
  dayTick: 0,

  async bootstrap() {
    const { profile, settings } = await readMeta();

    /*
     * A finished run is restored on load so its report survives a refresh. An ending is the
     * payoff for twenty to sixty days of decisions, and losing it to an accidental reload
     * threw all of that away. An unfinished run stays behind Continue, as before.
     */
    let ended: GameState | null = null;
    try {
      const autosaved = await readSlot(AUTOSAVE_SLOT);
      if (autosaved?.ok && autosaved.state?.ending) ended = autosaved.state;
    } catch {
      // Unreadable storage is the save browser's problem to report, not the boot path's.
    }

    set({ profile, settings, loaded: true, ...(ended ? { state: ended } : {}) });
  },

  newRun(options) {
    const profile = Meta.startRun(get().profile);
    const state = createInitialState({
      ...options,
      unlocks: options.unlocks ?? profile.unlocks,
      guidance: options.guidance ?? get().settings.guidance,
      now: Date.now(),
    });
    set({ state, profile, dayTick: 0 });
    void writeMeta(profile, get().settings);
    void autosave(state);
  },

  loadState(state) {
    set({ state, dayTick: 0 });
  },

  abandonRun() {
    // Leaving a finished run clears its autosave: the run is over, its result is already in
    // the Legacy profile, and keeping it would put the same report back on the next reload.
    if (get().state?.ending) void deleteSlot(AUTOSAVE_SLOT);
    set({ state: null });
  },

  setSettings(patch) {
    const settings = { ...get().settings, ...patch };
    set({ settings });
    // Guidance is stored per run so it can be turned off for a single game, but toggling it
    // in settings mid-run should take effect immediately rather than only from the next one.
    if (patch.guidance !== undefined) {
      mutate(get, set, (draft) => {
        draft.guidance.enabled = patch.guidance!;
      });
    }
    void writeMeta(get().profile, settings);
  },

  setProfile(profile) {
    set({ profile });
    void writeMeta(profile, get().settings);
  },

  notify(text, tone = 'info') {
    set({ notice: { text, tone } });
  },

  dismissNotice() {
    set({ notice: null });
  },

  /* ------------------------------------------------------------- planning */

  assign(survivorId, target) {
    let ok = false;
    mutate(get, set, (draft) => {
      ok = Facilities.assignToFacility(draft, survivorId, target);
    });
    return { ok, ...(ok ? {} : { message: 'That assignment is not available.' }) };
  },

  build(defId, slotId) {
    const state = get().state;
    if (!state) return { ok: false };
    const check = Facilities.canBuild(state, defId, slotId);
    if (!check.ok) return { ok: false, ...(check.reason ? { message: check.reason } : {}) };
    mutate(get, set, (draft) => {
      Facilities.buildFacility(draft, defId, slotId);
    });
    return { ok: true, message: 'Construction started.' };
  },

  upgrade(facilityId) {
    const state = get().state;
    if (!state) return { ok: false };
    const check = Facilities.canUpgrade(state, facilityId);
    if (!check.ok) return { ok: false, ...(check.reason ? { message: check.reason } : {}) };
    mutate(get, set, (draft) => {
      Facilities.upgradeFacility(draft, facilityId);
    });
    return { ok: true, message: 'Upgrade started.' };
  },

  demolish(facilityId) {
    let ok = false;
    mutate(get, set, (draft) => {
      ok = Facilities.demolishFacility(draft, facilityId);
    });
    return { ok, message: ok ? 'Demolished. Half the materials were recovered.' : 'Could not demolish.' };
  },

  repair(facilityId) {
    let ok = false;
    mutate(get, set, (draft) => {
      ok = Facilities.repairFacility(draft, facilityId);
    });
    return { ok, message: ok ? 'Repaired.' : 'Not enough components, or nothing to repair.' };
  },

  setPriority(facilityId, priority) {
    mutate(get, set, (draft) => {
      const facility = draft.facilities.find((f) => f.id === facilityId);
      if (facility) facility.priority = priority;
    });
  },

  clearSlot(slotId) {
    let ok = false;
    mutate(get, set, (draft) => {
      ok = Facilities.startClearingSlot(draft, slotId);
    });
    return { ok, message: ok ? 'Clearing started. It will take a few days.' : 'Not enough components.' };
  },

  queueCraft(recipeId) {
    let result: { ok: boolean; reason?: string } = { ok: false };
    mutate(get, set, (draft) => {
      result = Crafting.queueCraft(draft, recipeId);
    });
    return { ok: result.ok, ...(result.reason ? { message: result.reason } : {}) };
  },

  cancelCraft(jobId) {
    let ok = false;
    mutate(get, set, (draft) => {
      ok = Crafting.cancelCraft(draft, jobId);
    });
    return { ok, message: ok ? 'Cancelled. Most materials were recovered.' : undefined };
  },

  startResearch(id) {
    let result: { ok: boolean; reason?: string } = { ok: false };
    mutate(get, set, (draft) => {
      result = Research.startResearch(draft, id);
    });
    return { ok: result.ok, ...(result.reason ? { message: result.reason } : {}) };
  },

  cancelResearch() {
    let ok = false;
    mutate(get, set, (draft) => {
      ok = Research.cancelResearch(draft);
    });
    return { ok, message: ok ? 'Project shelved. Half the progress is kept.' : undefined };
  },

  equip(survivorId, itemId) {
    let ok = false;
    mutate(get, set, (draft) => {
      ok = Inventory.equipItem(draft, survivorId, itemId);
    });
    return { ok, message: ok ? undefined : 'That cannot be equipped.' };
  },

  unequip(survivorId, slot) {
    let ok = false;
    mutate(get, set, (draft) => {
      ok = Inventory.unequipSlot(draft, survivorId, slot);
    });
    return { ok };
  },

  consumeItem(itemId, survivorId) {
    const state = get().state;
    if (!state) return { ok: false };
    const roll = rngFromState(state.rng).fork(`use:${itemId}:${state.day}`).next();
    let result = { ok: false, message: '' };
    mutate(get, set, (draft) => {
      result = Inventory.consumeItem(draft, itemId, survivorId, roll);
    });
    return { ok: result.ok, message: result.message };
  },

  salvage(itemId) {
    let result = { ok: false, message: '' };
    mutate(get, set, (draft) => {
      result = Inventory.salvageItem(draft, itemId);
    });
    return { ok: result.ok, message: result.message };
  },

  toggleOrder(flag) {
    mutate(get, set, (draft) => {
      draft.flags[flag] = !draft.flags[flag];
    });
  },

  markGuidanceSeen(id) {
    mutate(get, set, (draft) => {
      if (!draft.guidance.seen.includes(id)) draft.guidance.seen.push(id);
    });
  },

  /* ----------------------------------------------------------- expedition */

  dispatch(locationId, members, loadout) {
    let result: Expedition.DispatchResult = { ok: false };
    mutate(get, set, (draft) => {
      result = Expedition.dispatchExpedition(draft, locationId, members, loadout);
    });
    return { ok: result.ok, ...(result.reason ? { message: result.reason } : {}) };
  },

  resolveBeat(choiceId) {
    let result: { ok: boolean; reason?: string } = { ok: false };
    mutate(get, set, (draft) => {
      result = Expedition.resolveBeat(draft, choiceId);
    });
    const state = get().state;
    if (state) void autosave(state);
    return { ok: result.ok, ...(result.reason ? { message: result.reason } : {}) };
  },

  scout(locationId) {
    let ok = false;
    mutate(get, set, (draft) => {
      ok = World.scoutLocation(draft, locationId);
    });
    return { ok };
  },

  /* ----------------------------------------------------------------- time */

  endDay() {
    const current = get().state;
    if (!current) return { ended: false, pendingEvents: 0 };
    let outcome = { ended: false, pendingEvents: 0 };
    const next = produce(current, (draft) => {
      const result = advanceDay(draft);
      outcome = { ended: result.ended, pendingEvents: result.pendingEvents };
    });
    set({ state: next, dayTick: get().dayTick + 1 });
    void autosave(next);
    if (outcome.ended) get().finishRun();
    return outcome;
  },

  resolveEvent(choiceId) {
    const current = get().state;
    if (!current) return null;
    let result: ReturnType<typeof engineResolveEvent> | null = null;
    const unlocks = get().profile.unlocks;
    const next = produce(current, (draft) => {
      const rng = rngFromState(draft.rng);
      result = engineResolveEvent(draft, choiceId, rng, unlocks);
      draft.rng = rng.snapshot();
      if (draft.events.pending.length === 0 && draft.phase === 'events') draft.phase = 'planning';
    });
    set({ state: next });
    void autosave(next);
    return result;
  },

  finishRun() {
    const state = get().state;
    if (!state || !state.ending) return;
    const profile = Meta.applyRunResult(get().profile, state);
    set({ profile });
    void writeMeta(profile, get().settings);
  },
}));

/* ------------------------------------------------------------------ selectors */

export const selectState = (s: GameStoreState) => s.state;
export const selectDay = (s: GameStoreState) => s.state?.day ?? 0;
export const selectPhase = (s: GameStoreState) => s.state?.phase ?? 'planning';
export const selectResources = (s: GameStoreState) => s.state?.resources;
export const selectSurvivors = (s: GameStoreState) => s.state?.survivors ?? [];
export const selectFacilities = (s: GameStoreState) => s.state?.facilities ?? [];
export const selectSettings = (s: GameStoreState) => s.settings;
export const selectProfile = (s: GameStoreState) => s.profile;
