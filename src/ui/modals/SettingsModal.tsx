import { useGameStore } from '@store/gameStore';
import { useUiStore } from '@store/uiStore';
import { Modal } from '@ui/components/Modal';
import { Button } from '@ui/components/Button';

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
  const setScreen = useUiStore((s) => s.setScreen);

  return (
    <Modal title="Settings" onClose={onClose} size="narrow">
      <ul className="settings-list">
        <li>
          <span className="col grow">
            <strong>Motion</strong>
            <span className="tone-muted">Removes ambient flicker, scanlines, and transitions.</span>
          </span>
          <select
            className="input input-sm"
            value={settings.motion}
            onChange={(e) => setSettings({ motion: e.target.value as typeof settings.motion })}
            aria-label="Motion"
          >
            <option value="full">Full</option>
            <option value="reduced">Reduced</option>
          </select>
        </li>
        <li>
          <span className="col grow">
            <strong>Contrast</strong>
            <span className="tone-muted">Raises every ink step and hardens the rules.</span>
          </span>
          <select
            className="input input-sm"
            value={settings.contrast}
            onChange={(e) => setSettings({ contrast: e.target.value as typeof settings.contrast })}
            aria-label="Contrast"
          >
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </li>
        <li>
          <span className="col grow">
            <strong>Text size</strong>
          </span>
          <select
            className="input input-sm"
            value={settings.textScale}
            onChange={(e) => setSettings({ textScale: e.target.value as typeof settings.textScale })}
            aria-label="Text size"
          >
            <option value="small">Small</option>
            <option value="normal">Normal</option>
            <option value="large">Large</option>
            <option value="xlarge">Extra large</option>
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
              <strong>Sound</strong>
              <span className="tone-muted">Short synthesised cues for the day, events, and outcomes.</span>
            </span>
          </label>
        </li>
        {settings.sound && (
          <li>
            <span className="col grow">
              <strong>Volume</strong>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(settings.soundVolume * 100)}
              onChange={(e) => setSettings({ soundVolume: Number(e.target.value) / 100 })}
              aria-label="Sound volume"
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
              <strong>Numeric gauges</strong>
              <span className="tone-muted">Show caps and exact figures alongside every bar.</span>
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
              <strong>Confirm End Day</strong>
              <span className="tone-muted">Asks before time moves.</span>
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
              <strong>Contextual guidance</strong>
              <span className="tone-muted">Explains systems the first time they matter.</span>
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
            Abandon this run
          </Button>
          <p className="hint">The autosave is kept — abandoning only returns you to the menu.</p>
        </>
      )}
    </Modal>
  );
}
