import { useEffect, useState } from 'react';
import { PRIMARY_PANELS, SECONDARY_PANELS, useUiStore, type PanelId } from '@store/uiStore';
import { Icon, type IconName } from '@ui/components/Icon';

const PANEL_ICONS: Record<PanelId, IconName> = {
  dashboard: 'gauge',
  crew: 'crew',
  base: 'vault',
  workshop: 'workshop',
  research: 'flask',
  map: 'compass',
  archive: 'book',
};

/**
 * Mobile navigation.
 *
 * Four destinations plus a sheet, rather than seven tabs squeezed into 360px. The split is
 * by frequency: the panels a player touches every single day sit on the bar, and the ones
 * they visit when they have a decision to make live one tap deeper.
 */
export function TabBar() {
  const panel = useUiStore((s) => s.panel);
  const setPanel = useUiStore((s) => s.setPanel);
  const openModal = useUiStore((s) => s.openModal);
  const [sheetOpen, setSheetOpen] = useState(false);

  const secondaryActive = SECONDARY_PANELS.some((p) => p.id === panel);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  const go = (id: PanelId) => {
    setPanel(id);
    setSheetOpen(false);
  };

  return (
    <>
      {sheetOpen && (
        <div className="sheet-scrim" onClick={() => setSheetOpen(false)}>
          <div
            className="sheet"
            role="dialog"
            aria-label="More"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="label sheet-head">More</h2>
            <ul className="sheet-list">
              {SECONDARY_PANELS.map((p) => (
                <li key={p.id}>
                  <button type="button" className="sheet-item" onClick={() => go(p.id)}>
                    <Icon name={PANEL_ICONS[p.id]} size={20} />
                    <span>{p.label}</span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  className="sheet-item"
                  onClick={() => {
                    setSheetOpen(false);
                    openModal('help');
                  }}
                >
                  <Icon name="help" size={20} />
                  <span>How to play</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}

      <nav className="tabbar" aria-label="Panels">
        {PRIMARY_PANELS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`tabbar-btn ${p.id === panel ? 'tabbar-active' : ''}`}
            onClick={() => go(p.id)}
            aria-current={p.id === panel ? 'page' : undefined}
          >
            <Icon name={PANEL_ICONS[p.id]} size={20} />
            <span className="tabbar-label">{p.label}</span>
          </button>
        ))}
        <button
          type="button"
          className={`tabbar-btn ${secondaryActive ? 'tabbar-active' : ''}`}
          onClick={() => setSheetOpen((v) => !v)}
          aria-expanded={sheetOpen}
        >
          <Icon name="more" size={20} />
          <span className="tabbar-label">{secondaryActive ? PANELS_LABEL(panel) : 'More'}</span>
        </button>
      </nav>
    </>
  );
}

function PANELS_LABEL(id: PanelId): string {
  return SECONDARY_PANELS.find((p) => p.id === id)?.label ?? 'More';
}
