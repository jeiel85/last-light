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

const CATEGORIES: { id: ItemCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'weapon', label: 'Weapons' },
  { id: 'tool', label: 'Tools' },
  { id: 'protection', label: 'Protection' },
  { id: 'medical', label: 'Medical' },
  { id: 'exploration', label: 'Exploration' },
  { id: 'utility', label: 'Utility' },
];

function costText(cost: Partial<Record<ResourceId, number>>): string {
  const parts = RESOURCE_LIST.filter((r) => (cost[r.id] ?? 0) > 0).map(
    (r) => `${Math.ceil(cost[r.id] ?? 0)} ${r.name.toLowerCase()}`,
  );
  return parts.length ? parts.join(', ') : 'nothing';
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

  const recipes = useMemo(() => {
    const all = Crafting.availableRecipes(state);
    return all
      .filter((entry) => category === 'all' || entry.recipe.category === category)
      .filter((entry) => !hideLocked || entry.ok || entry.reason !== 'Requires research');
  }, [state, category, hideLocked]);

  const inventory = useMemo(
    () =>
      state.inventory
        .map((entry) => ({ entry, def: ITEM_BY_ID[entry.itemId] }))
        .filter((row): row is { entry: (typeof state.inventory)[number]; def: NonNullable<typeof row.def> } =>
          Boolean(row.def),
        )
        .filter((row) => category === 'all' || row.def.category === category)
        .sort((a, b) => a.def.name.localeCompare(b.def.name)),
    [state.inventory, category],
  );

  return (
    <div className="col gap-3">
      <Guidance id="workshop.craft" title="The bench needs somebody standing at it">
        Queueing a recipe charges the materials immediately; progress then depends entirely on who
        is assigned to the facility that makes it. An unstaffed workshop builds nothing.
      </Guidance>

      <Panel title="Workshop" note={`${state.craftQueue.length} queued`}>
        {state.craftQueue.length === 0 && <EmptyState>Nothing on the bench.</EmptyState>}
        <ul className="queue-list">
          {state.craftQueue.map((job) => {
            const recipe = RECIPE_BY_ID[job.recipeId];
            const item = recipe ? ITEM_BY_ID[recipe.itemId] : undefined;
            const rate = recipe ? Crafting.craftingRate(state, recipe) : null;
            return (
              <li key={job.id} className="queue-row">
                <span className="col grow">
                  <span>
                    {item?.name ?? job.recipeId}
                    {recipe && recipe.yield > 1 && <span className="tone-muted"> ×{recipe.yield}</span>}
                  </span>
                  <Bar value={Crafting.craftProgressPercent(job) / 100} colour="var(--amber)" />
                </span>
                {rate && (
                  <BreakdownPopover breakdown={rate} title="Craft rate">
                    <span className="num">{Math.round(rate.total)}/day</span>
                  </BreakdownPopover>
                )}
                <Button size="sm" tone="ghost" onClick={() => notify(cancelCraft(job.id).message ?? 'Cancelled.', 'info')}>
                  Cancel
                </Button>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel
        title="Recipes"
        note={`${recipes.length}`}
        actions={
          <label className="check check-inline">
            <input type="checkbox" checked={hideLocked} onChange={(e) => setHideLocked(e.target.checked)} />
            <span>Hide un-researched</span>
          </label>
        }
      >
        <Tabs
          tabs={CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
          active={category}
          onChange={setCategory}
          ariaLabel="Recipe category"
        />
        {recipes.length === 0 && <EmptyState>Nothing here yet.</EmptyState>}
        <ul className="recipe-list">
          {recipes.map(({ recipe, ok, reason, estimatedDays }) => {
            const item = ITEM_BY_ID[recipe.itemId];
            return (
              <li key={recipe.id} className={`recipe-row ${ok ? '' : 'recipe-row-off'}`}>
                <Icon name={item?.icon ?? 'parts'} size={20} className="build-icon" />
                <span className="col grow">
                  <span className="recipe-name">
                    {item?.name ?? recipe.itemId}
                    {recipe.yield > 1 && <span className="tone-muted"> ×{recipe.yield}</span>}
                  </span>
                  <span className="recipe-desc tone-muted">{item?.description}</span>
                  <span className="recipe-cost mono">
                    {costText(recipe.cost)}
                    {recipe.itemCost?.length
                      ? ` · ${recipe.itemCost.map((c) => `${c.count}× ${ITEM_BY_ID[c.itemId]?.name ?? c.itemId}`).join(', ')}`
                      : ''}
                    {estimatedDays !== null ? ` · ~${estimatedDays}d` : ''}
                  </span>
                </span>
                <Button
                  size="sm"
                  disabled={!ok}
                  title={reason}
                  onClick={() => {
                    const result = queueCraft(recipe.id);
                    notify(result.message ?? (result.ok ? 'Queued.' : 'Cannot craft that.'), result.ok ? 'good' : 'bad');
                  }}
                >
                  {ok ? 'Craft' : (reason ?? 'Unavailable')}
                </Button>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel title="Stores" note={`${inventory.reduce((a, r) => a + r.entry.count, 0)} items`}>
        {inventory.length === 0 && <EmptyState>The shelves are bare.</EmptyState>}
        <ul className="inv-list">
          {inventory.map(({ entry, def }) => (
            <li key={entry.itemId} className="inv-row">
              <Icon name={def.icon} size={20} className="build-icon" />
              <span className="col grow">
                <span>
                  {def.name} <span className="num tone-muted">×{entry.count}</span>
                </span>
                <span className="tone-muted">{def.description}</span>
              </span>
              {def.consumable && def.use && (
                <Button
                  size="sm"
                  onClick={() => {
                    const result = consumeItem(entry.itemId, null);
                    notify(result.message ?? 'Used.', result.ok ? 'good' : 'bad');
                  }}
                >
                  Use
                </Button>
              )}
              <Button
                size="sm"
                tone="ghost"
                onClick={() => {
                  const result = salvage(entry.itemId);
                  notify(result.message ?? 'Salvaged.', result.ok ? 'good' : 'bad');
                }}
                title={`Recovers ${def.salvage} components`}
              >
                Salvage
              </Button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
