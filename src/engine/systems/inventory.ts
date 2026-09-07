import { t } from '../../i18n';
import { itemName } from '../../i18n/content';
import type { GameState, InventoryEntry, ItemId, Survivor } from '../model/types';
import { ITEM_BY_ID } from '../data/items';
import { clamp } from '../core/math';
import { applyCondition, removeCondition } from './survivors';
import { grantResource } from './resources';

/** Inventory and equipment. Items are stored as a flat `{ itemId, count }` list. */

export function itemCount(state: GameState, itemId: ItemId): number {
  return state.inventory.find((entry) => entry.itemId === itemId)?.count ?? 0;
}

export function addItem(state: GameState, itemId: ItemId, count = 1): void {
  if (count <= 0) return;
  if (!ITEM_BY_ID[itemId]) return;
  const entry = state.inventory.find((e) => e.itemId === itemId);
  if (entry) entry.count += count;
  else state.inventory.push({ itemId, count });
}

export function removeItem(state: GameState, itemId: ItemId, count = 1): boolean {
  const entry = state.inventory.find((e) => e.itemId === itemId);
  if (!entry || entry.count < count) return false;
  entry.count -= count;
  if (entry.count <= 0) state.inventory = state.inventory.filter((e) => e.count > 0);
  return true;
}

export function hasItemWithTag(items: readonly InventoryEntry[], tag: string): boolean {
  return items.some((entry) => entry.count > 0 && ITEM_BY_ID[entry.itemId]?.tags.includes(tag));
}

export function inventoryHasTag(state: GameState, tag: string): boolean {
  return hasItemWithTag(state.inventory, tag);
}

/* ------------------------------------------------------------------ equipment */

export function equipItem(state: GameState, survivorId: string, itemId: ItemId): boolean {
  const survivor = state.survivors.find((s) => s.id === survivorId);
  const def = ITEM_BY_ID[itemId];
  if (!survivor || !def?.slot) return false;
  if (itemCount(state, itemId) <= 0) return false;
  const current = survivor.equipment[def.slot];
  if (current) addItem(state, current, 1);
  removeItem(state, itemId, 1);
  survivor.equipment[def.slot] = itemId;
  return true;
}

export function unequipSlot(state: GameState, survivorId: string, slot: keyof Survivor['equipment']): boolean {
  const survivor = state.survivors.find((s) => s.id === survivorId);
  if (!survivor) return false;
  const current = survivor.equipment[slot];
  if (!current) return false;
  addItem(state, current, 1);
  delete survivor.equipment[slot];
  return true;
}

/** Items a survivor carries, used to fold equipment into expedition load-outs. */
export function equippedItems(survivor: Survivor): InventoryEntry[] {
  const out: InventoryEntry[] = [];
  for (const itemId of Object.values(survivor.equipment)) {
    if (!itemId) continue;
    const existing = out.find((e) => e.itemId === itemId);
    if (existing) existing.count += 1;
    else out.push({ itemId, count: 1 });
  }
  return out;
}

/* -------------------------------------------------------------------- usage */

export interface UseResult {
  ok: boolean;
  message: string;
}

/** Use a consumable on a survivor (or on the vault, for resource items). */
export function consumeItem(
  state: GameState,
  itemId: ItemId,
  survivorId: string | null,
  rollValue: number,
): UseResult {
  const def = ITEM_BY_ID[itemId];
  const use = def?.use;
  if (!def || !use) return { ok: false, message: t('engine.inv.cannotUse') };
  if (itemCount(state, itemId) <= 0) return { ok: false, message: t('engine.inv.noneLeft') };

  const survivor = survivorId ? state.survivors.find((s) => s.id === survivorId) : null;
  if (use.kind !== 'resource' && !survivor) {
    return { ok: false, message: t('engine.inv.chooseSurvivor') };
  }

  switch (use.kind) {
    case 'heal': {
      survivor!.health = clamp(survivor!.health + use.amount, 0, 100);
      removeItem(state, itemId, 1);
      return { ok: true, message: `${survivor!.name} is patched up (+${use.amount} health).` };
    }
    case 'cure': {
      const target = survivor!.conditions.find((c) => use.kind === 'cure' && use.conditions.includes(c.id));
      if (!target) return { ok: false, message: `${survivor!.name} has nothing that would treat.` };
      removeItem(state, itemId, 1);
      if (rollValue < use.chance) {
        removeCondition(survivor!, target.id);
        state.stats.injuriesTreated += 1;
        return { ok: true, message: `${survivor!.name}'s condition has been treated.` };
      }
      target.severity = clamp(target.severity - 25, 0, 100);
      return { ok: true, message: t('engine.inv.helpsNotEnough') };
    }
    case 'restoreFatigue': {
      survivor!.fatigue = clamp(survivor!.fatigue - use.amount, 0, 100);
      survivor!.stress += 4;
      removeItem(state, itemId, 1);
      return { ok: true, message: `${survivor!.name} is wide awake. They will pay for it.` };
    }
    case 'restoreMorale': {
      survivor!.morale = clamp(survivor!.morale + use.amount, 0, 100);
      removeItem(state, itemId, 1);
      return { ok: true, message: `${survivor!.name} is steadier.` };
    }
    case 'stabilise': {
      survivor!.health = clamp(survivor!.health + use.amount * 0.4, 0, 100);
      for (const condition of survivor!.conditions) {
        condition.severity = clamp(condition.severity - use.amount * 0.6, 0, 100);
      }
      survivor!.conditions = survivor!.conditions.filter((c) => c.severity > 2);
      removeItem(state, itemId, 1);
      state.stats.injuriesTreated += 1;
      return { ok: true, message: `${survivor!.name} has been stabilised.` };
    }
    case 'resource': {
      const gained = grantResource(state, use.resource, use.amount);
      removeItem(state, itemId, 1);
      return { ok: true, message: `+${Math.round(gained)} ${use.resource}.` };
    }
  }
}

/** Break an item down for components. */
export function salvageItem(state: GameState, itemId: ItemId): UseResult {
  const def = ITEM_BY_ID[itemId];
  if (!def) return { ok: false, message: t('engine.inv.unknownItem') };
  if (itemCount(state, itemId) <= 0) return { ok: false, message: t('engine.inv.noneLeft') };
  if (def.salvage <= 0) return { ok: false, message: `${def.name} cannot be broken down usefully.` };
  const workshop = state.facilities.find((f) => f.defId === 'workshop' && f.status === 'operational');
  if (!workshop) return { ok: false, message: t('engine.inv.needWorkshop') };
  let value = def.salvage;
  if (workshop.level >= 2) value *= 1.3;
  if (state.research.completed.includes('eng_salvage_protocol')) value *= 1.5;
  removeItem(state, itemId, 1);
  const gained = grantResource(state, 'components', Math.round(value));
  return {
    ok: true,
    message: t('engine.inv.brokeDown', { name: itemName(def), amount: Math.round(gained) }),
  };
}

/** Apply an item's condition-curing effect during infirmary treatment. */
export function autoTreatWithItems(state: GameState, survivor: Survivor, roll: () => number): string[] {
  const notes: string[] = [];
  for (const condition of survivor.conditions.slice()) {
    if (condition.severity < 40) continue;
    const candidate = state.inventory.find((entry) => {
      const def = ITEM_BY_ID[entry.itemId];
      return def?.use?.kind === 'cure' && def.use.conditions.includes(condition.id) && entry.count > 0;
    });
    if (!candidate) continue;
    const result = consumeItem(state, candidate.itemId, survivor.id, roll());
    if (result.ok) notes.push(result.message);
  }
  return notes;
}

export { applyCondition };
