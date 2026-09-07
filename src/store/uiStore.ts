import { create } from 'zustand';

/**
 * Presentation state.
 *
 * Nothing here affects the simulation, which is why it lives apart from `gameStore` and
 * is never written to a save file.
 */

export type PanelId = 'dashboard' | 'crew' | 'base' | 'workshop' | 'research' | 'map' | 'archive';

export type Screen = 'menu' | 'setup' | 'game' | 'report';

export interface ModalState {
  kind:
    | 'none'
    | 'settings'
    | 'saves'
    | 'survivor'
    | 'location'
    | 'planner'
    | 'facility'
    | 'legacy'
    | 'help';
  /** Entity id the modal is about, when it needs one. */
  id?: string;
}

interface UiStoreState {
  screen: Screen;
  panel: PanelId;
  modal: ModalState;
  /** Mobile/tablet log drawer. */
  logOpen: boolean;
  /** Selected survivor in the crew panel. */
  selectedSurvivor: string | null;
  /** Location selected on the map. */
  selectedLocation: string | null;

  setScreen: (screen: Screen) => void;
  setPanel: (panel: PanelId) => void;
  openModal: (kind: ModalState['kind'], id?: string) => void;
  closeModal: () => void;
  toggleLog: (open?: boolean) => void;
  selectSurvivor: (id: string | null) => void;
  selectLocation: (id: string | null) => void;
}

export const useUiStore = create<UiStoreState>((set) => ({
  screen: 'menu',
  panel: 'dashboard',
  modal: { kind: 'none' },
  logOpen: false,
  selectedSurvivor: null,
  selectedLocation: null,

  setScreen: (screen) => set({ screen, modal: { kind: 'none' } }),
  setPanel: (panel) => set({ panel }),
  openModal: (kind, id) => set({ modal: id === undefined ? { kind } : { kind, id } }),
  closeModal: () => set({ modal: { kind: 'none' } }),
  toggleLog: (open) => set((s) => ({ logOpen: open ?? !s.logOpen })),
  selectSurvivor: (id) => set({ selectedSurvivor: id }),
  selectLocation: (id) => set({ selectedLocation: id }),
}));

export interface PanelDef {
  id: PanelId;
  label: string;
  key: string;
  /**
   * Mobile shows four destinations plus a "More" sheet rather than seven cramped tabs,
   * so each panel declares whether it earns a permanent place on the bar.
   */
  primary: boolean;
}

export const PANELS: PanelDef[] = [
  { id: 'dashboard', label: 'Dashboard', key: '1', primary: true },
  { id: 'crew', label: 'Crew', key: '2', primary: true },
  { id: 'base', label: 'Base', key: '3', primary: true },
  { id: 'workshop', label: 'Workshop', key: '4', primary: false },
  { id: 'research', label: 'Research', key: '5', primary: false },
  { id: 'map', label: 'Map', key: '6', primary: true },
  { id: 'archive', label: 'Archive', key: '7', primary: false },
];

export const PRIMARY_PANELS = PANELS.filter((p) => p.primary);
export const SECONDARY_PANELS = PANELS.filter((p) => !p.primary);
