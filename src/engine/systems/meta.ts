import type { GameState, MetaProfile, MetaUnlockDef, UnlockId } from '../model/types';
import { META_UNLOCKS, UNLOCK_BY_ID } from '../data/metaUnlocks';
import { SCENARIOS } from '../data/scenarios';

/**
 * Meta-progression.
 *
 * Legacy accrues from ended runs and is spent on a small unlock tree. Nothing in the tree
 * increases raw power; unlocks add scenarios, traits to the generation pool, starting kits
 * that trade one advantage for another, and modifiers that mostly make runs harder in
 * exchange for more Legacy.
 */

export function applyRunResult(profile: MetaProfile, state: GameState): MetaProfile {
  const next: MetaProfile = {
    ...profile,
    unlocks: profile.unlocks.slice(),
    loreArchive: profile.loreArchive.slice(),
    endingsSeen: profile.endingsSeen.slice(),
  };

  next.runsCompleted += 1;
  next.hasPlayed = true;
  next.bestDays = Math.max(next.bestDays, state.day);

  for (const loreId of state.lore) {
    if (!next.loreArchive.includes(loreId)) next.loreArchive.push(loreId);
  }

  if (state.ending) {
    const isNew = !next.endingsSeen.includes(state.ending.endingId);
    if (isNew) next.endingsSeen.push(state.ending.endingId);
    next.legacy += state.ending.legacyAwarded + (isNew ? 30 : 0);
  }

  return next;
}

export function startRun(profile: MetaProfile): MetaProfile {
  return { ...profile, runsStarted: profile.runsStarted + 1 };
}

export interface UnlockAvailability {
  unlock: MetaUnlockDef;
  owned: boolean;
  affordable: boolean;
  locked: boolean;
  lockedReason?: string;
}

export function unlockAvailability(profile: MetaProfile): UnlockAvailability[] {
  return META_UNLOCKS.map((unlock) => {
    const owned = profile.unlocks.includes(unlock.id);
    const missing = (unlock.requires ?? []).filter((id) => !profile.unlocks.includes(id));
    const locked = missing.length > 0;
    return {
      unlock,
      owned,
      affordable: !owned && !locked && profile.legacy >= unlock.cost,
      locked,
      ...(locked
        ? { lockedReason: `Requires ${missing.map((id) => UNLOCK_BY_ID[id]?.name ?? id).join(', ')}` }
        : {}),
    };
  });
}

export function purchaseUnlock(
  profile: MetaProfile,
  id: UnlockId,
): { ok: boolean; reason?: string; profile: MetaProfile } {
  const unlock = UNLOCK_BY_ID[id];
  if (!unlock) return { ok: false, reason: 'Unknown unlock', profile };
  if (profile.unlocks.includes(id)) return { ok: false, reason: 'Already unlocked', profile };
  const missing = (unlock.requires ?? []).filter((r) => !profile.unlocks.includes(r));
  if (missing.length > 0) return { ok: false, reason: 'Prerequisites not met', profile };
  if (profile.legacy < unlock.cost) return { ok: false, reason: 'Not enough Legacy', profile };

  return {
    ok: true,
    profile: {
      ...profile,
      legacy: profile.legacy - unlock.cost,
      legacySpent: profile.legacySpent + unlock.cost,
      unlocks: [...profile.unlocks, id],
    },
  };
}

export function availableScenarios(profile: MetaProfile) {
  return SCENARIOS.filter((s) => !s.requiresUnlock || profile.unlocks.includes(s.requiresUnlock));
}

export function availableModifiers(profile: MetaProfile): MetaUnlockDef[] {
  return META_UNLOCKS.filter((u) => u.category === 'modifier' && profile.unlocks.includes(u.id));
}

/** Total Legacy still needed to own everything, for the progression screen. */
export function remainingLegacyCost(profile: MetaProfile): number {
  return META_UNLOCKS.filter((u) => !profile.unlocks.includes(u.id)).reduce((acc, u) => acc + u.cost, 0);
}
