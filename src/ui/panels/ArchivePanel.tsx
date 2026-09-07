import { useMemo, useState } from 'react';
import {
  CONDITION_BY_ID,
  CONDITIONS,
  FACILITIES,
  ITEMS,
  LORE,
  RESOURCE_LIST,
  THEORY_SUMMARY,
  TRAITS,
} from '@engine';
import type { LoreDef } from '@engine';
import { useGameStore } from '@store/gameStore';
import { Panel, EmptyState } from '@ui/components/Panel';
import { Tabs } from '@ui/components/Tabs';
import { Icon } from '@ui/components/Icon';
import { useT } from '@ui/hooks/useTranslation';
import type { MessageKey } from '@i18n';
import {
  conditionDescription,
  conditionName,
  facilityDescription,
  facilityLevelSummary,
  facilityName,
  itemDescription,
  itemName,
  loreBody,
  loreSource,
  loreTitle,
  resourceFailure,
  resourceName,
  resourceSummary,
  traitDescription,
  traitName,
} from '@i18n/content';

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
  const t = useT();
  const theoryLabel = (theory: LoreDef['theory']) => t(`theory.${theory}`);

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
        title={t('archive.title')}
        note={t('archive.fragments', { found: foundLore.length, total: LORE.length })}
        actions={
          <input
            className="input input-sm"
            placeholder={t('archive.search')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t('archive.searchLabel')}
          />
        }
      >
        <Tabs
          tabs={[
            { id: 'lore', label: t('archive.tab.lore'), count: foundLore.length },
            { id: 'stats', label: t('archive.tab.stats') },
            { id: 'resources', label: t('archive.tab.resources') },
            { id: 'facilities', label: t('archive.tab.facilities') },
            { id: 'items', label: t('archive.tab.items') },
            { id: 'traits', label: t('archive.tab.traits') },
            { id: 'conditions', label: t('archive.tab.conditions') },
          ]}
          active={tab}
          onChange={setTab}
          ariaLabel={t('archive.section')}
        />

        {tab === 'lore' && (
          <>
            {theories.length > 0 && (
              <div className="theory-row">
                {theories.map(([theory, count]) => (
                  <div
                    key={theory}
                    className="theory-card"
                    title={THEORY_SUMMARY[theory as keyof typeof THEORY_SUMMARY]}
                  >
                    <span className="label">{theoryLabel(theory as LoreDef['theory'])}</span>
                    <span className="num">{count}</span>
                  </div>
                ))}
              </div>
            )}
            {foundLore.length === 0 && (
              <EmptyState>{t('archive.noLore')}</EmptyState>
            )}
            <ul className="lore-list">
              {foundLore
                .filter((entry) => match(loreTitle(entry)) || match(loreBody(entry)))
                .map((entry) => (
                  <li key={entry.id} className="lore-entry">
                    <h3 className="lore-title">{loreTitle(entry)}</h3>
                    <p className="lore-source eyebrow">{loreSource(entry)}</p>
                    <p className="prose">{loreBody(entry)}</p>
                    {entry.theory !== 'none' && (
                      <p className="tone-lore">
                        {t('archive.supports', { theory: theoryLabel(entry.theory) })}
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
                <span>{t(`stat.${key}` as MessageKey)}</span>
                <span className="num">{Math.round(value as number)}</span>
              </li>
            ))}
          </ul>
        )}

        {tab === 'resources' && (
          <ul className="ency-list">
            {RESOURCE_LIST.filter((r) => match(resourceName(r)) || match(resourceSummary(r))).map((r) => (
              <li key={r.id}>
                <span className="ency-dot" style={{ background: r.colour }} />
                <span className="col">
                  <strong>{resourceName(r)}</strong>
                  <span className="tone-muted">{resourceSummary(r)}</span>
                  <span className="tone-bad">{resourceFailure(r)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}

        {tab === 'facilities' && (
          <ul className="ency-list">
            {FACILITIES.filter((f) => match(facilityName(f)) || match(facilityDescription(f))).map((f) => (
              <li key={f.id}>
                <Icon name={f.icon} size={20} className="build-icon" />
                <span className="col">
                  <strong>
                    {facilityName(f)}{' '}
                    {state.research.completed.includes(f.requiresResearch ?? '') || !f.requiresResearch
                      ? ''
                      : t('archive.locked')}
                  </strong>
                  <span className="tone-muted">{facilityDescription(f)}</span>
                  <span className="hint">
                    {f.levels
                      .map((_, i) =>
                        t('archive.levelSummary', {
                          level: i + 1,
                          summary: facilityLevelSummary(f, i + 1),
                        }),
                      )
                      .join(' · ')}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}

        {tab === 'items' && (
          <ul className="ency-list">
            {ITEMS.filter((i) => match(itemName(i)) || match(itemDescription(i))).map((item) => (
              <li key={item.id}>
                <Icon name={item.icon} size={20} className="build-icon" />
                <span className="col">
                  <strong>{itemName(item)}</strong>
                  <span className="tone-muted">{itemDescription(item)}</span>
                  <span className="hint mono">
                    {t('archive.itemMeta', {
                      category: t(`itemCategory.${item.category}`),
                      weight: item.weight,
                      salvage: item.salvage,
                    })}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}

        {tab === 'traits' && (
          <ul className="ency-list">
            {TRAITS.filter((trait) => match(traitName(trait)) || match(traitDescription(trait))).map((trait) => (
              <li key={trait.id}>
                <span className="col">
                  <strong>
                    {traitName(trait)}{' '}
                    <span className="tone-muted">{t(`traitCategory.${trait.category}`)}</span>
                  </strong>
                  <span className="tone-muted">{traitDescription(trait)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}

        {tab === 'conditions' && (
          <ul className="ency-list">
            {CONDITIONS.filter((c) => match(conditionName(c)) || match(conditionDescription(c))).map((c) => (
              <li key={c.id}>
                <span className="col">
                  <strong>
                    {conditionName(c)} <span className="tone-muted">{t(`conditionKind.${c.kind}`)}</span>
                  </strong>
                  <span className="tone-muted">{conditionDescription(c)}</span>
                  <span className="hint mono">
                    {c.medicineCost > 0
                      ? t('archive.treatCost', { cost: c.medicineCost })
                      : t('archive.noMedicine')}
                    {c.blocksExpedition ? t('archive.cannotTravel') : ''}
                    {c.escalatesTo
                      ? t('archive.worsensInto', {
                          name: (() => {
                            const worse = CONDITION_BY_ID[c.escalatesTo];
                            return worse ? conditionName(worse) : c.escalatesTo;
                          })(),
                        })
                      : ''}
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
