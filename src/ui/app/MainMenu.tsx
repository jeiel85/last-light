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
      </div>

      {modal.kind === 'saves' && <SavesModal onClose={closeModal} context="menu" />}
      {modal.kind === 'settings' && <SettingsModal onClose={closeModal} />}
      {modal.kind === 'legacy' && <LegacyModal onClose={closeModal} />}
      {modal.kind === 'help' && <HelpModal onClose={closeModal} />}
    </main>
  );
}
