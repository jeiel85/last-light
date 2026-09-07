import { useGameStore } from '@store/gameStore';
import { useUiStore } from '@store/uiStore';
import { Modal } from '@ui/components/Modal';
import { Button } from '@ui/components/Button';
import { useT } from '@ui/hooks/useTranslation';
import { LOCALES, type LocaleId } from '@i18n';

/**
 * Accessibility and comfort settings. Every option here retunes design tokens at the
 * document root, so nothing needs a reload and nothing is hidden behind a restart.
 */
export function SettingsModal({ onClose }: { onClose: () => void }) {
  const settings = useGameStore((s) => s.settings);
  const setSettings = useGameStore((s) => s.setSettings);
  const abandonRun = useGameStore((s) => s.abandonRun);
  const state = useGameStore((s) => s.state);
  // Guidance is a per-run flag; while a run is open the control must show that run's value
  // rather than the default the next run would start with.
  const guidanceOn = state ? state.guidance.enabled : settings.guidance;
  const t = useT();
  const setScreen = useUiStore((s) => s.setScreen);

  return (
    <Modal title={t('settings.title')} onClose={onClose} size="narrow">
      <ul className="settings-list">
        <li>
          <span className="col grow">
            <strong>{t('settings.language')}</strong>
            <span className="tone-muted">{t('settings.languageHint')}</span>
          </span>
          <select
            className="input input-sm"
            value={settings.locale}
            onChange={(e) => setSettings({ locale: e.target.value as LocaleId })}
            aria-label={t('settings.language')}
          >
            {LOCALES.map((locale) => (
              <option key={locale.id} value={locale.id}>
                {locale.name}
              </option>
            ))}
          </select>
        </li>
        <li>
          <span className="col grow">
            <strong>{t('settings.motion')}</strong>
            <span className="tone-muted">{t('settings.motionHint')}</span>
          </span>
          <select
            className="input input-sm"
            value={settings.motion}
            onChange={(e) => setSettings({ motion: e.target.value as typeof settings.motion })}
            aria-label={t('settings.motion')}
          >
            <option value="full">{t('settings.motion.full')}</option>
            <option value="reduced">{t('settings.motion.reduced')}</option>
          </select>
        </li>
        <li>
          <span className="col grow">
            <strong>{t('settings.contrast')}</strong>
            <span className="tone-muted">{t('settings.contrastHint')}</span>
          </span>
          <select
            className="input input-sm"
            value={settings.contrast}
            onChange={(e) => setSettings({ contrast: e.target.value as typeof settings.contrast })}
            aria-label={t('settings.contrast')}
          >
            <option value="normal">{t('settings.contrast.normal')}</option>
            <option value="high">{t('settings.contrast.high')}</option>
          </select>
        </li>
        <li>
          <span className="col grow">
            <strong>{t('settings.textSize')}</strong>
          </span>
          <select
            className="input input-sm"
            value={settings.textScale}
            onChange={(e) => setSettings({ textScale: e.target.value as typeof settings.textScale })}
            aria-label={t('settings.textSize')}
          >
            <option value="small">{t('settings.scale.small')}</option>
            <option value="normal">{t('settings.scale.normal')}</option>
            <option value="large">{t('settings.scale.large')}</option>
            <option value="xlarge">{t('settings.scale.xlarge')}</option>
          </select>
        </li>
        <li>
          <label className="check grow">
            <input
              type="checkbox"
              checked={settings.sound}
              onChange={(e) => setSettings({ sound: e.target.checked })}
            />
            <span className="col">
              <strong>{t('settings.sound')}</strong>
              <span className="tone-muted">{t('settings.soundHint')}</span>
            </span>
          </label>
        </li>
        {settings.sound && (
          <li>
            <span className="col grow">
              <strong>{t('settings.volume')}</strong>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(settings.soundVolume * 100)}
              onChange={(e) => setSettings({ soundVolume: Number(e.target.value) / 100 })}
              aria-label={t('settings.volumeLabel')}
            />
            <span className="num">{Math.round(settings.soundVolume * 100)}</span>
          </li>
        )}
        <li>
          <label className="check grow">
            <input
              type="checkbox"
              checked={settings.numericMode}
              onChange={(e) => setSettings({ numericMode: e.target.checked })}
            />
            <span className="col">
              <strong>{t('settings.numeric')}</strong>
              <span className="tone-muted">{t('settings.numericHint')}</span>
            </span>
          </label>
        </li>
        <li>
          <label className="check grow">
            <input
              type="checkbox"
              checked={settings.confirmEndDay}
              onChange={(e) => setSettings({ confirmEndDay: e.target.checked })}
            />
            <span className="col">
              <strong>{t('settings.confirmEndDay')}</strong>
              <span className="tone-muted">{t('settings.confirmEndDayHint')}</span>
            </span>
          </label>
        </li>
        <li>
          <label className="check grow">
            <input
              type="checkbox"
              checked={guidanceOn}
              onChange={(e) => setSettings({ guidance: e.target.checked })}
            />
            <span className="col">
              <strong>{t('settings.guidance')}</strong>
              <span className="tone-muted">{t('settings.guidanceHint')}</span>
            </span>
          </label>
        </li>
      </ul>

      {state && (
        <>
          <hr className="divider" />
          <Button
            tone="danger"
            block
            onClick={() => {
              abandonRun();
              setScreen('menu');
            }}
          >
            {t('settings.abandon')}
          </Button>
          <p className="hint">{t('settings.abandonHint')}</p>
        </>
      )}
    </Modal>
  );
}
