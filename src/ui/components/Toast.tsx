import { useEffect } from 'react';
import { useGameStore } from '@store/gameStore';
import { playCue } from '@ui/audio/cues';

/** Transient confirmation of an action that had no other visible result. */
export function Toast() {
  const notice = useGameStore((s) => s.notice);
  const dismiss = useGameStore((s) => s.dismissNotice);

  useEffect(() => {
    if (!notice) return;
    playCue(notice.tone === 'bad' ? 'bad' : notice.tone === 'good' ? 'build' : 'tick');
    const timer = window.setTimeout(dismiss, 3600);
    return () => window.clearTimeout(timer);
  }, [notice, dismiss]);

  if (!notice) return null;
  return (
    <div className={`toast toast-${notice.tone}`} role="status">
      {notice.text}
      <button type="button" className="toast-x" onClick={dismiss} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}
