import type { ReactNode } from 'react';
import { useGameStore } from '@store/gameStore';
import { Icon } from './Icon';

/**
 * Contextual onboarding.
 *
 * There is no tutorial modal. Instead a system explains itself the first time it becomes
 * the player's problem — the food gauge explains spoilage when food first falls, the crew
 * panel explains assignment when somebody is idle — and never again once dismissed.
 *
 * Seen ids live in the save, so guidance does not reappear on reload, and the whole layer
 * can be switched off in settings or at the start of a run.
 */
export function Guidance({
  id,
  when = true,
  title,
  children,
}: {
  /** Stable id recorded in the save once dismissed. */
  id: string;
  /** The moment this advice is worth giving. */
  when?: boolean;
  title: string;
  children: ReactNode;
}) {
  const enabled = useGameStore((s) => s.state?.guidance.enabled ?? false);
  const seen = useGameStore((s) => s.state?.guidance.seen ?? []);
  const markSeen = useGameStore((s) => s.markGuidanceSeen);

  if (!enabled || !when || seen.includes(id)) return null;

  return (
    <aside className="guidance" role="note">
      <Icon name="help" size={16} className="guidance-icon" />
      <div className="col grow gap-1">
        <strong className="guidance-title">{title}</strong>
        <p className="guidance-body">{children}</p>
      </div>
      <button type="button" className="guidance-x" onClick={() => markSeen(id)} aria-label={`Dismiss: ${title}`}>
        Got it
      </button>
    </aside>
  );
}
