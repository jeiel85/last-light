import { useMemo } from 'react';
import { ENDINGS, Meta } from '@engine';
import { useGameStore } from '@store/gameStore';
import { Modal } from '@ui/components/Modal';
import { Button } from '@ui/components/Button';

const CATEGORY_LABEL: Record<string, string> = {
  scenario: 'Scenarios',
  trait: 'Traits',
  kit: 'Starting kits',
  modifier: 'Modifiers',
  archive: 'Archive',
};

/** Between-run progression: what Legacy has bought, and what it could buy next. */
export function LegacyModal({ onClose }: { onClose: () => void }) {
  const profile = useGameStore((s) => s.profile);
  const setProfile = useGameStore((s) => s.setProfile);
  const notify = useGameStore((s) => s.notify);

  const rows = useMemo(() => Meta.unlockAvailability(profile), [profile]);
  const grouped = useMemo(() => {
    const out = new Map<string, typeof rows>();
    for (const row of rows) {
      const list = out.get(row.unlock.category) ?? [];
      list.push(row);
      out.set(row.unlock.category, list);
    }
    return [...out.entries()];
  }, [rows]);

  return (
    <Modal
      title="Legacy"
      subtitle={`${profile.legacy} unspent · ${profile.legacySpent} spent · ${Meta.remainingLegacyCost(profile)} still to buy`}
      onClose={onClose}
      size="wide"
    >
      <section className="col gap-2">
        <h3 className="label">Endings seen</h3>
        <ul className="ending-row">
          {ENDINGS.map((ending) => {
            const seen = profile.endingsSeen.includes(ending.id);
            return (
              <li key={ending.id} className={`ending-chip ${seen ? '' : 'ending-chip-off'}`} style={{ borderColor: seen ? ending.colour : undefined }}>
                <strong>{seen ? ending.name : '???'}</strong>
                <span className="tone-muted">{seen ? ending.summary : 'Not yet reached'}</span>
              </li>
            );
          })}
        </ul>
      </section>

      {grouped.map(([category, list]) => (
        <section key={category} className="col gap-2">
          <h3 className="label">{CATEGORY_LABEL[category] ?? category}</h3>
          <ul className="unlock-list">
            {list.map(({ unlock, owned, affordable, locked, lockedReason }) => (
              <li key={unlock.id} className={`unlock-row ${owned ? 'unlock-owned' : ''}`}>
                <span className="col grow">
                  <strong>{unlock.name}</strong>
                  <span className="tone-muted">{unlock.description}</span>
                  {locked && <span className="tone-warn">{lockedReason}</span>}
                </span>
                <span className="num unlock-cost">{unlock.cost}</span>
                <Button
                  size="sm"
                  disabled={owned || !affordable}
                  onClick={() => {
                    const result = Meta.purchaseUnlock(profile, unlock.id);
                    if (!result.ok) {
                      notify(result.reason ?? 'Cannot buy that.', 'bad');
                      return;
                    }
                    setProfile(result.profile);
                    notify(`${unlock.name} unlocked.`, 'good');
                  }}
                >
                  {owned ? 'Owned' : affordable ? 'Unlock' : locked ? 'Locked' : 'Too dear'}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Modal>
  );
}
