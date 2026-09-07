import { useEffect } from 'react';
import { useGameStore } from '@store/gameStore';
import { useUiStore } from '@store/uiStore';
import { LiveRegion } from '@ui/hooks/useAnnounce';
import { MainMenu } from './MainMenu';
import { NewRunSetup } from './NewRunSetup';
import { GameShell } from './GameShell';
import { RunReport } from './RunReport';
import { Toast } from '@ui/components/Toast';
import { closeAudio, setAudioEnabled, setAudioVolume } from '@ui/audio/cues';

/**
 * The application root.
 *
 * There are four screens and no router: the game is a single continuous session, and a
 * URL that could be reloaded mid-run would imply a persistence model the save system
 * deliberately does not have.
 */
export function App() {
  const bootstrap = useGameStore((s) => s.bootstrap);
  const loaded = useGameStore((s) => s.loaded);
  const settings = useGameStore((s) => s.settings);
  const state = useGameStore((s) => s.state);
  const screen = useUiStore((s) => s.screen);
  const setScreen = useUiStore((s) => s.setScreen);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  /* Sound is off by default and only ever starts after the player asks for it. */
  useEffect(() => {
    setAudioEnabled(settings.sound);
    setAudioVolume(settings.soundVolume);
    if (!settings.sound) closeAudio();
  }, [settings.sound, settings.soundVolume]);

  /* Accessibility settings retune the whole token set from the document root. */
  useEffect(() => {
    const root = document.documentElement;
    root.dataset['motion'] = settings.motion;
    root.dataset['contrast'] = settings.contrast;
    root.dataset['scale'] = settings.textScale;
  }, [settings.motion, settings.contrast, settings.textScale]);

  /*
   * A finished run takes over the screen, wherever the player was. This is derived from the
   * state rather than from a transition: an ending the player never got to read is a whole
   * run's worth of consequence thrown away, so the report is shown for as long as a finished
   * run is loaded, and leaving it means clearing the run.
   */
  const finished = Boolean(state?.ending);
  useEffect(() => {
    if (finished && screen !== 'report') setScreen('report');
  }, [finished, screen, setScreen]);

  /** Which screen actually renders, once the state has had its say. */
  const view = finished ? 'report' : !state && (screen === 'game' || screen === 'report') ? 'menu' : screen;

  return (
    <>
      <div className="app-bg" />
      <div className="ambience" aria-hidden="true" />
      <LiveRegion />
      {!loaded && <div className="boot">Waking the vault…</div>}
      {loaded && view === 'menu' && <MainMenu />}
      {loaded && view === 'setup' && <NewRunSetup />}
      {loaded && view === 'game' && state && <GameShell />}
      {loaded && view === 'report' && state?.ending && <RunReport />}
      <Toast />
    </>
  );
}
