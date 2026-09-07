import { useMemo, useState } from 'react';
import { Crafting, ITEM_BY_ID, RECIPE_BY_ID, RESOURCE_LIST } from '@engine';
import type { ItemCategory, ResourceId } from '@engine';
import { useGameStore } from '@store/gameStore';
import { Panel, EmptyState } from '@ui/components/Panel';
import { Button } from '@ui/components/Button';
import { Bar } from '@ui/components/Bar';
import { Tabs } from '@ui/components/Tabs';
import { BreakdownPopover } from '@ui/components/BreakdownPopover';
import { Guidance } from '@ui/components/Guidance';
import { Icon } from '@ui/components/Icon';
import { useT } from '@ui/hooks/useTranslation';
import { t } from '@i18n';
import { itemDescription, itemName, resourceName } from '@i18n/content';

const CATEGORIES = [
  'all',
  'weapon',
  'tool',
  'protection',
  'medical',
  'exploration',
  'utility',
] as const satisfies readonly (ItemCategory | 'all')[];

function costText(cost: Partial<Record<ResourceId, number>>): string {
  const parts = RESOURCE_LIST.filter((r) => (cost[r.id] ?? 0) > 0).map(
    (r) => `${Math.ceil(cost[r.id] ?? 0)} ${resourceName(r).toLowerCase()}`,
  );
  return parts.length ? parts.join(', ') : t('base.costNothing');
}

/** Crafting queue, recipe book, and the pack — everything the vault physically owns. */
export function WorkshopPanel() {
  const state = useGameStore((s) => s.state)!;
  const queueCraft = useGameStore((s) => s.queueCraft);
  const cancelCraft = useGameStore((s) => s.cancelCraft);
  const consumeItem = useGameStore((s) => s.consumeItem);
  const salvage = useGameStore((s) => s.salvage);
  const notify = useGameStore((s) => s.notify);
  const [category, setCategory] = useState<ItemCategory | 'all'>('all');
  const [hideLocked, setHideLocked] = useState(true);
  const t = useT();

  const recipes = useMemo(() => {
    const all = Crafting.availableRecipes(state);
    return all
      .filter((entry) => category === 'all' || entry.recipe.category === category)
      .filter((entry) => !hideLocked || entry.ok || !entry.researchLocked);
  }, [state, category, hideLocked]);

  const inventory = useMemo(
    () =>
      state.inventory
        .map((entry) => ({ entry, def: ITEM_BY_ID[entry.itemId] }))
        .filter((row): row is { entry: (typeof state.inventory)[number]; def: NonNullable<typeof row.def> } =>
          Boolean(row.def),
        )
        .filter((row) => category === 'all' || row.def.category === category)
        .sort((a, b) => itemName(a.def).localeCompare(itemName(b.def))),
    [state.inventory, category],
  );

  return (
    <div className="col gap-3">
      <Guidance
        notes={[
          {
            id: 'workshop.craft',
            title: t('guidance.craft.title'),
            body: t('guidance.craft.body'),
          },
        ]}
      />

      <Panel title={t('workshop.title')} note={t('workshop.queued', { count: state.craftQueue.length })}>
        {state.craftQueue.length === 0 && <EmptyState>{t('workshop.benchEmpty')}</EmptyState>}
        <ul className="queue-list">
          {state.craftQueue.map((job) => {
            const recipe = RECIPE_BY_ID[job.recipeId];
            const item = recipe ? ITEM_BY_ID[recipe.itemId] : undefined;
            const rate = recipe ? Crafting.craftingRate(state, recipe) : null;
            return (
              <li key={job.id} className="queue-row">
                <span className="col grow">
                  <span>
                    {item ? itemName(item) : job.recipeId}
                    {recipe && recipe.yield > 1 && <span className="tone-muted"> ×{recipe.yield}</span>}
                  </span>
                  <Bar value={Crafting.craftProgressPercent(job) / 100} colour="var(--amber)" />
                </span>
                {rate && (
                  <BreakdownPopover breakdown={rate} title={t('workshop.craftRate')}>
                    <span className="num">
                      {t('workshop.perDay', { value: Math.round(rate.total) })}
                    </span>
                  </BreakdownPopover>
                )}
                <Button
                  size="sm"
                  tone="ghost"
                  onClick={() =>
                    notify(cancelCraft(job.id).message ?? t('workshop.cancelled'), 'info')
                  }
                >
                  {t('workshop.cancel')}
                </Button>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel
        title={t('workshop.recipes')}
        note={`${recipes.length}`}
        actions={
          <label className="check check-inline">
            <input type="checkbox" checked={hideLocked} onChange={(e) => setHideLocked(e.target.checked)} />
            <span>{t('workshop.hideLocked')}</span>
          </label>
        }
      >
        <Tabs
          tabs={CATEGORIES.map((c) => ({ id: c, label: t(`workshop.category.${c}`) }))}
          active={category}
          onChange={setCategory}
          ariaLabel={t('workshop.categoryLabel')}
        />
        {recipes.length === 0 && <EmptyState>{t('workshop.nothingHere')}</EmptyState>}
        <ul className="recipe-list">
          {recipes.map(({ recipe, ok, reason, estimatedDays }) => {
            const item = ITEM_BY_ID[recipe.itemId];
            return (
              <li key={recipe.id} className={`recipe-row ${ok ? '' : 'recipe-row-off'}`}>
                <Icon name={item?.icon ?? 'parts'} size={20} className="build-icon" />
                <span className="col grow">
                  <span className="recipe-name">
                    {item ? itemName(item) : recipe.itemId}
                    {recipe.yield > 1 && <span className="tone-muted"> ×{recipe.yield}</span>}
                  </span>
                  <span className="recipe-desc tone-muted">{item ? itemDescription(item) : null}</span>
                  <span className="recipe-cost mono">
                    {costText(recipe.cost)}
                    {recipe.itemCost?.length
                      ? ` · ${recipe.itemCost
                          .map((c) => {
                            const part = ITEM_BY_ID[c.itemId];
                            return t('workshop.itemCost', {
                              count: c.count,
                              name: part ? itemName(part) : c.itemId,
                            });
                          })
                          .join(', ')}`
                      : ''}
                    {estimatedDays !== null ? t('workshop.estimate', { days: estimatedDays }) : ''}
                  </span>
                </span>
                <Button
                  size="sm"
                  disabled={!ok}
                  title={reason}
                  onClick={() => {
                    const result = queueCraft(recipe.id);
                    const fallback = result.ok ? t('workshop.queuedOk') : t('workshop.cannotCraft');
                    notify(result.message ?? fallback, result.ok ? 'good' : 'bad');
                  }}
                >
                  {ok ? t('workshop.craft') : (reason ?? t('base.unavailable'))}
                </Button>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel
        title={t('workshop.stores')}
        note={t('workshop.itemCount', {
          count: inventory.reduce((a, r) => a + r.entry.count, 0),
        })}
      >
        {inventory.length === 0 && <EmptyState>{t('workshop.shelvesBare')}</EmptyState>}
        <ul className="inv-list">
          {inventory.map(({ entry, def }) => (
            <li key={entry.itemId} className="inv-row">
              <Icon name={def.icon} size={20} className="build-icon" />
              <span className="col grow">
                <span>
                  {itemName(def)} <span className="num tone-muted">×{entry.count}</span>
                </span>
                <span className="tone-muted">{itemDescription(def)}</span>
              </span>
              {def.consumable && def.use && (
                <Button
                  size="sm"
                  onClick={() => {
                    const result = consumeItem(entry.itemId, null);
                    notify(result.message ?? t('workshop.used'), result.ok ? 'good' : 'bad');
                  }}
                >
                  {t('workshop.use')}
                </Button>
              )}
              <Button
                size="sm"
                tone="ghost"
                onClick={() => {
                  const result = salvage(entry.itemId);
                  notify(result.message ?? t('workshop.salvaged'), result.ok ? 'good' : 'bad');
                }}
                title={t('workshop.salvageHint', { value: def.salvage })}
              >
                {t('workshop.salvage')}
              </Button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
