import { useMemo, useState } from 'react';
import type { LogTone } from '@engine';
import { useGameStore } from '@store/gameStore';
import { useUiStore } from '@store/uiStore';
import { useT } from '@ui/hooks/useTranslation';

const FILTERS: { id: 'all' | 'alerts' | 'story'; tones: LogTone[] }[] = [
  { id: 'all', tones: [] },
  { id: 'alerts', tones: ['bad', 'warn'] },
  { id: 'story', tones: ['lore', 'good'] },
];

/**
 * The running log. It is the only place the game explains what happened while the player
 * was not looking, so it is filterable rather than truncated.
 */
export function LogColumn({ drawer = false }: { drawer?: boolean }) {
  const log = useGameStore((s) => s.state?.log ?? []);
  const day = useGameStore((s) => s.state?.day ?? 0);
  const logOpen = useUiStore((s) => s.logOpen);
  const toggleLog = useUiStore((s) => s.toggleLog);
  const [filter, setFilter] = useState<'all' | 'alerts' | 'story'>('all');
  const t = useT();

  const entries = useMemo(() => {
    const active = FILTERS.find((f) => f.id === filter)!;
    const filtered = active.tones.length === 0 ? log : log.filter((e) => active.tones.includes(e.tone));
    return filtered.slice(-160).reverse();
  }, [log, filter]);

  if (drawer && !logOpen) return null;

  const body = (
    <>
      <header className="log-head">
        <h2 className="label">{t('common.log')}</h2>
        <div className="log-filters">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`chip ${filter === f.id ? 'chip-active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {t(`common.logFilter.${f.id}`)}
            </button>
          ))}
        </div>
        {drawer && (
          <button type="button" className="modal-close" onClick={() => toggleLog(false)} aria-label={t('common.closeLog')}>
            ✕
          </button>
        )}
      </header>
      <ol className="log-list">
        {entries.length === 0 && <li className="empty-state">{t('common.logEmpty')}</li>}
        {entries.map((entry) => (
          <li key={entry.id} className={`log-entry log-${entry.tone}`}>
            <span className="log-day mono">
              {entry.day === day ? t('common.now') : t('common.dayShort', { day: entry.day })}
            </span>
            <span className="log-text">
              {entry.channel && <span className="log-channel">{entry.channel} · </span>}
              {entry.text}
            </span>
          </li>
        ))}
      </ol>
    </>
  );

  if (drawer) {
    return (
      <div
        className="log-scrim"
        onClick={(e) => {
          if (e.target === e.currentTarget) toggleLog(false);
        }}
      >
        <aside className="log-drawer" aria-label={t('common.log')}>
          {body}
        </aside>
      </div>
    );
  }

  return (
    <aside className="log-col" aria-label={t('common.log')}>
      {body}
    </aside>
  );
}
