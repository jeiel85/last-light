import { useEffect } from 'react';
import { useGameStore } from '@store/gameStore';
import { PANELS, useUiStore } from '@store/uiStore';
import { useBreakpoint } from '@ui/hooks/useBreakpoint';
import { TopBar } from '@ui/layout/TopBar';
import { StatusRail } from '@ui/layout/StatusRail';
import { LogColumn } from '@ui/layout/LogColumn';
import { TabBar } from '@ui/layout/TabBar';
import { Dashboard } from '@ui/panels/Dashboard';
import { CrewPanel } from '@ui/panels/CrewPanel';
import { BasePanel } from '@ui/panels/BasePanel';
import { WorkshopPanel } from '@ui/panels/WorkshopPanel';
import { ResearchPanel } from '@ui/panels/ResearchPanel';
import { MapPanel } from '@ui/panels/MapPanel';
import { ArchivePanel } from '@ui/panels/ArchivePanel';
import { EventModal } from '@ui/modals/EventModal';
import { ExpeditionModal } from '@ui/modals/ExpeditionModal';
import { PlannerModal } from '@ui/modals/PlannerModal';
import { SurvivorModal } from '@ui/modals/SurvivorModal';
import { SavesModal } from '@ui/modals/SavesModal';
import { SettingsModal } from '@ui/modals/SettingsModal';
import { HelpModal } from '@ui/modals/HelpModal';

/** The command deck: status rail, working panel, and the log. */
export function GameShell() {
  const panel = useUiStore((s) => s.panel);
  const setPanel = useUiStore((s) => s.setPanel);
  const modal = useUiStore((s) => s.modal);
  const closeModal = useUiStore((s) => s.closeModal);
  const phase = useGameStore((s) => s.state?.phase);
  const breakpoint = useBreakpoint();

  /* Number keys jump between panels; the story modals swallow them while open. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      const hit = PANELS.find((p) => p.key === e.key);
      if (hit) setPanel(hit.id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setPanel]);

  return (
    <div className={`deck deck-${breakpoint}`}>
      <TopBar />
      <div className="deck-body">
        {breakpoint !== 'mobile' && <StatusRail />}
        <main className="deck-main" id="main-panel">
          {breakpoint === 'mobile' && <StatusRail compact />}
          {panel === 'dashboard' && <Dashboard />}
          {panel === 'crew' && <CrewPanel />}
          {panel === 'base' && <BasePanel />}
          {panel === 'workshop' && <WorkshopPanel />}
          {panel === 'research' && <ResearchPanel />}
          {panel === 'map' && <MapPanel />}
          {panel === 'archive' && <ArchivePanel />}
        </main>
        {breakpoint === 'desktop' && <LogColumn />}
      </div>
      {breakpoint !== 'desktop' && <LogColumn drawer />}
      {breakpoint === 'mobile' && <TabBar />}

      {phase === 'events' && <EventModal />}
      {phase === 'expedition' && <ExpeditionModal />}
      {modal.kind === 'planner' && <PlannerModal onClose={closeModal} />}
      {modal.kind === 'survivor' && <SurvivorModal onClose={closeModal} />}
      {modal.kind === 'saves' && <SavesModal onClose={closeModal} context="game" />}
      {modal.kind === 'settings' && <SettingsModal onClose={closeModal} />}
      {modal.kind === 'help' && <HelpModal onClose={closeModal} />}
    </div>
  );
}
