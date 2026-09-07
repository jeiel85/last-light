import { useMemo } from 'react';
import { ENDINGS, Meta } from '@engine';
import { useGameStore } from '@store/gameStore';
import { Modal } from '@ui/components/Modal';
import { Button } from '@ui/components/Button';
import { useT } from '@ui/hooks/useTranslation';
import type { MessageKey } from '@i18n';
import { endingName, endingSummary, unlockDescription, unlockName } from '@i18n/content';

/** Between-run progression: what Legacy has bought, and what it could buy next. */
export function LegacyModal({ onClose }: { onClose: () => void }) {
  const profile = useGameStore((s) => s.profile);
  const setProfile = useGameStore((s) => s.setProfile);
  const notify = useGameStore((s) => s.notify);
  const t = useT();

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
      title={t('legacy.title')}
      subtitle={t('legacy.subtitle', {
        unspent: profile.legacy,
        spent: profile.legacySpent,
        remaining: Meta.remainingLegacyCost(profile),
      })}
      onClose={onClose}
      size="wide"
    >
      <section className="col gap-2">
        <h3 className="label">{t('legacy.endingsSeen')}</h3>
        <ul className="ending-row">
          {ENDINGS.map((ending) => {
            const seen = profile.endingsSeen.includes(ending.id);
            return (
              <li key={ending.id} className={`ending-chip ${seen ? '' : 'ending-chip-off'}`} style={{ borderColor: seen ? ending.colour : undefined }}>
                <strong>{seen ? endingName(ending) : '???'}</strong>
                <span className="tone-muted">
                  {seen ? endingSummary(ending) : t('legacy.notYet')}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {grouped.map(([category, list]) => (
        <section key={category} className="col gap-2">
          <h3 className="label">{t(`legacy.category.${category}` as MessageKey)}</h3>
          <ul className="unlock-list">
            {list.map(({ unlock, owned, affordable, locked, lockedReason }) => (
              <li key={unlock.id} className={`unlock-row ${owned ? 'unlock-owned' : ''}`}>
                <span className="col grow">
                  <strong>{unlockName(unlock)}</strong>
                  <span className="tone-muted">{unlockDescription(unlock)}</span>
                  {locked && <span className="tone-warn">{lockedReason}</span>}
                </span>
                <span className="num unlock-cost">{unlock.cost}</span>
                <Button
                  size="sm"
                  disabled={owned || !affordable}
                  onClick={() => {
                    const result = Meta.purchaseUnlock(profile, unlock.id);
                    if (!result.ok) {
                      notify(result.reason ?? t('legacy.cannotBuy'), 'bad');
                      return;
                    }
                    setProfile(result.profile);
                    notify(t('legacy.unlocked', { name: unlockName(unlock) }), 'good');
                  }}
                >
                  {owned
                    ? t('legacy.owned')
                    : affordable
                      ? t('legacy.unlock')
                      : locked
                        ? t('legacy.locked')
                        : t('legacy.tooDear')}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Modal>
  );
}
