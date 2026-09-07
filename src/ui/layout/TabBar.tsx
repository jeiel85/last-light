import { useEffect, useState } from 'react';
import { PRIMARY_PANELS, SECONDARY_PANELS, useUiStore, type PanelId } from '@store/uiStore';
import { Icon, type IconName } from '@ui/components/Icon';
import { useT } from '@ui/hooks/useTranslation';

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
  const t = useT();

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
            aria-label={t('panel.more')}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="label sheet-head">{t('panel.more')}</h2>
            <ul className="sheet-list">
              {SECONDARY_PANELS.map((p) => (
                <li key={p.id}>
                  <button type="button" className="sheet-item" onClick={() => go(p.id)}>
                    <Icon name={PANEL_ICONS[p.id]} size={20} />
                    <span>{t(p.messageKey)}</span>
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
                  <span>{t('menu.howToPlay')}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}

      <nav className="tabbar" aria-label={t('panel.nav')}>
        {PRIMARY_PANELS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`tabbar-btn ${p.id === panel ? 'tabbar-active' : ''}`}
            onClick={() => go(p.id)}
            aria-current={p.id === panel ? 'page' : undefined}
          >
            <Icon name={PANEL_ICONS[p.id]} size={20} />
            <span className="tabbar-label">{t(p.messageKey)}</span>
          </button>
        ))}
        <button
          type="button"
          className={`tabbar-btn ${secondaryActive ? 'tabbar-active' : ''}`}
          onClick={() => setSheetOpen((v) => !v)}
          aria-expanded={sheetOpen}
        >
          <Icon name="more" size={20} />
          <span className="tabbar-label">
            {secondaryActive ? t(secondaryKey(panel)) : t('panel.more')}
          </span>
        </button>
      </nav>
    </>
  );
}

/** The sheet button borrows the label of whichever secondary panel is currently open. */
function secondaryKey(id: PanelId) {
  return SECONDARY_PANELS.find((p) => p.id === id)?.messageKey ?? ('panel.more' as const);
}
