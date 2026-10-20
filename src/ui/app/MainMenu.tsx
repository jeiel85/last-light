import { useEffect, useState } from 'react';
import { ENDINGS } from '@engine';
import { useGameStore } from '@store/gameStore';
import { useUiStore } from '@store/uiStore';
import { Button } from '@ui/components/Button';
import { SavesModal } from '@ui/modals/SavesModal';
import { SettingsModal } from '@ui/modals/SettingsModal';
import { LegacyModal } from '@ui/modals/LegacyModal';
import { HelpModal } from '@ui/modals/HelpModal';
import { listSlots } from '@save/serialize';
import { AUTOSAVE_SLOT } from '@save/schema';
import { useT } from '@ui/hooks/useTranslation';

/**
 * The title screen. It exists mostly to answer three questions: is there a run to
 * resume, what has this player unlocked, and how does any of this work.
 */
export function MainMenu() {
  const profile = useGameStore((s) => s.profile);
  const setScreen = useUiStore((s) => s.setScreen);
  const openModal = useUiStore((s) => s.openModal);
  const modal = useUiStore((s) => s.modal);
  const closeModal = useUiStore((s) => s.closeModal);
  const [hasAutosave, setHasAutosave] = useState(false);
  const t = useT();

  useEffect(() => {
    void listSlots().then((slots) => {
      setHasAutosave(slots.some((s) => s.slot === AUTOSAVE_SLOT && !s.problem && !s.preview.ending));
    });
  }, []);

  return (
    <main className="menu">
      <div className="menu-inner">
        <p className="eyebrow">{t('app.eyebrow')}</p>
        <h1 className="menu-title flicker">
          LAST<span className="menu-title-dim">LIGHT</span>
        </h1>
        <p className="menu-tag prose">{t('app.tagline')}</p>

        <div className="menu-actions">
          <Button tone="primary" size="lg" block onClick={() => setScreen('setup')}>
            {t('menu.newRun')}
          </Button>
          <Button
            size="lg"
            block
            disabled={!hasAutosave}
            onClick={() => openModal('saves')}
            title={hasAutosave ? undefined : t('menu.noRun')}
          >
            {t('menu.continue')}
          </Button>
          <div className="menu-row">
            <Button block onClick={() => openModal('legacy')}>
              {t('menu.legacy')} <span className="num menu-legacy">{profile.legacy}</span>
            </Button>
            <Button block onClick={() => openModal('saves')}>
              {t('menu.saves')}
            </Button>
          </div>
          <div className="menu-row">
            <Button block onClick={() => openModal('help')}>
              {t('menu.howToPlay')}
            </Button>
            <Button block onClick={() => openModal('settings')}>
              {t('menu.settings')}
            </Button>
          </div>
        </div>

        <dl className="menu-stats">
          <div>
            <dt className="label">{t('menu.stat.runs')}</dt>
            <dd className="num">{profile.runsStarted}</dd>
          </div>
          <div>
            <dt className="label">{t('menu.stat.best')}</dt>
            <dd className="num">{profile.bestDays}d</dd>
          </div>
          <div>
            <dt className="label">{t('menu.stat.endings')}</dt>
            <dd className="num">
              {profile.endingsSeen.length}/{ENDINGS.length}
            </dd>
          </div>
          <div>
            <dt className="label">{t('menu.stat.archive')}</dt>
            <dd className="num">{profile.loreArchive.length}</dd>
          </div>
        </dl>

        <a
          className="menu-source"
          href="https://github.com/jeiel85/last-light"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('menu.source')}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
          GitHub
        </a>
      </div>

      {modal.kind === 'saves' && <SavesModal onClose={closeModal} context="menu" />}
      {modal.kind === 'settings' && <SettingsModal onClose={closeModal} />}
      {modal.kind === 'legacy' && <LegacyModal onClose={closeModal} />}
      {modal.kind === 'help' && <HelpModal onClose={closeModal} />}
    </main>
  );
}
