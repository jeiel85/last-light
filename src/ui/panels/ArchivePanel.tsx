import { useMemo, useState } from 'react';
import {
  CONDITION_BY_ID,
  CONDITIONS,
  FACILITIES,
  ITEMS,
  LORE,
  RESOURCE_LIST,
  THEORY_LABEL,
  THEORY_SUMMARY,
  TRAITS,
} from '@engine';
import { useGameStore } from '@store/gameStore';
import { Panel, EmptyState } from '@ui/components/Panel';
import { Tabs } from '@ui/components/Tabs';
import { Icon } from '@ui/components/Icon';

type ArchiveTab = 'lore' | 'stats' | 'resources' | 'facilities' | 'items' | 'traits' | 'conditions';

/**
 * The archive holds the two things the player accumulates across a run: fragments of what
 * happened to the world, and the reference material that makes the numbers legible.
 */
export function ArchivePanel() {
  const state = useGameStore((s) => s.state)!;
  const profile = useGameStore((s) => s.profile);
  const [tab, setTab] = useState<ArchiveTab>('lore');
  const [query, setQuery] = useState('');

  const foundLore = useMemo(() => {
    const ids = new Set([...state.lore, ...profile.loreArchive]);
    return LORE.filter((entry) => ids.has(entry.id)).sort((a, b) => a.order - b.order);
  }, [state.lore, profile.loreArchive]);

  const theories = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of foundLore) counts[entry.theory] = (counts[entry.theory] ?? 0) + 1;
    return Object.entries(counts)
      .filter(([theory]) => theory !== 'none')
      .sort((a, b) => b[1] - a[1]);
  }, [foundLore]);

  const match = (text: string) => text.toLowerCase().includes(query.toLowerCase());

  return (
    <div className="col gap-3">
      <Panel
        title="Archive"
        note={`${foundLore.length}/${LORE.length} fragments`}
        actions={
          <input
            className="input input-sm"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search the archive"
          />
        }
      >
        <Tabs
          tabs={[
            { id: 'lore', label: 'Fragments', count: foundLore.length },
            { id: 'stats', label: 'Run' },
            { id: 'resources', label: 'Resources' },
            { id: 'facilities', label: 'Facilities' },
            { id: 'items', label: 'Items' },
            { id: 'traits', label: 'Traits' },
            { id: 'conditions', label: 'Conditions' },
          ]}
          active={tab}
          onChange={setTab}
          ariaLabel="Archive section"
        />

        {tab === 'lore' && (
          <>
            {theories.length > 0 && (
              <div className="theory-row">
                {theories.map(([theory, count]) => (
                  <div key={theory} className="theory-card" title={THEORY_SUMMARY[theory as keyof typeof THEORY_SUMMARY]}>
                    <span className="label">{THEORY_LABEL[theory as keyof typeof THEORY_LABEL] ?? theory}</span>
                    <span className="num">{count}</span>
                  </div>
                ))}
              </div>
            )}
            {foundLore.length === 0 && (
              <EmptyState>Nothing recovered yet. Fragments come from expeditions and the radio.</EmptyState>
            )}
            <ul className="lore-list">
              {foundLore
                .filter((entry) => match(entry.title) || match(entry.body))
                .map((entry) => (
                  <li key={entry.id} className="lore-entry">
                    <h3 className="lore-title">{entry.title}</h3>
                    <p className="lore-source eyebrow">{entry.source}</p>
                    <p className="prose">{entry.body}</p>
                    {entry.theory !== 'none' && (
                      <p className="tone-lore">
                        Supports: {THEORY_LABEL[entry.theory as keyof typeof THEORY_LABEL] ?? entry.theory}
                      </p>
                    )}
                  </li>
                ))}
            </ul>
          </>
        )}

        {tab === 'stats' && (
          <ul className="kv kv-2col">
            {Object.entries(state.stats).map(([key, value]) => (
              <li key={key}>
                <span>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                <span className="num">{Math.round(value as number)}</span>
              </li>
            ))}
          </ul>
        )}

        {tab === 'resources' && (
          <ul className="ency-list">
            {RESOURCE_LIST.filter((r) => match(r.name) || match(r.summary)).map((r) => (
              <li key={r.id}>
                <span className="ency-dot" style={{ background: r.colour }} />
                <span className="col">
                  <strong>{r.name}</strong>
                  <span className="tone-muted">{r.summary}</span>
                  <span className="tone-bad">{r.failure}</span>
                </span>
              </li>
            ))}
          </ul>
        )}

        {tab === 'facilities' && (
          <ul className="ency-list">
            {FACILITIES.filter((f) => match(f.name) || match(f.description)).map((f) => (
              <li key={f.id}>
                <Icon name={f.icon} size={20} className="build-icon" />
                <span className="col">
                  <strong>
                    {f.name}{' '}
                    {state.research.completed.includes(f.requiresResearch ?? '') || !f.requiresResearch ? '' : '(locked)'}
                  </strong>
                  <span className="tone-muted">{f.description}</span>
                  <span className="hint">{f.levels.map((l, i) => `L${i + 1}: ${l.summary}`).join(' · ')}</span>
                </span>
              </li>
            ))}
          </ul>
        )}

        {tab === 'items' && (
          <ul className="ency-list">
            {ITEMS.filter((i) => match(i.name) || match(i.description)).map((item) => (
              <li key={item.id}>
                <Icon name={item.icon} size={20} className="build-icon" />
                <span className="col">
                  <strong>{item.name}</strong>
                  <span className="tone-muted">{item.description}</span>
                  <span className="hint mono">
                    {item.category} · {item.weight} kg · salvages for {item.salvage}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}

        {tab === 'traits' && (
          <ul className="ency-list">
            {TRAITS.filter((t) => match(t.name) || match(t.description)).map((t) => (
              <li key={t.id}>
                <span className="col">
                  <strong>
                    {t.name} <span className="tone-muted">{t.category}</span>
                  </strong>
                  <span className="tone-muted">{t.description}</span>
                </span>
              </li>
            ))}
          </ul>
        )}

        {tab === 'conditions' && (
          <ul className="ency-list">
            {CONDITIONS.filter((c) => match(c.name) || match(c.description)).map((c) => (
              <li key={c.id}>
                <span className="col">
                  <strong>
                    {c.name} <span className="tone-muted">{c.kind}</span>
                  </strong>
                  <span className="tone-muted">{c.description}</span>
                  <span className="hint mono">
                    {c.medicineCost > 0 ? `${c.medicineCost} medicine to treat` : 'no medicine needed'}
                    {c.blocksExpedition ? ' · cannot travel' : ''}
                    {c.escalatesTo ? ` · worsens into ${CONDITION_BY_ID[c.escalatesTo]?.name ?? c.escalatesTo}` : ''}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
