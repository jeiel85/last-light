import type { GameState, InventoryEntry, Survivor } from '../model/types';
import type { Rng } from '../core/rng';
import { BreakdownBuilder, type Breakdown } from '../core/breakdown';
import { clamp, remap } from '../core/math';
import { BALANCE } from '../data/balance';
import { ITEM_BY_ID } from '../data/items';
import { operationalLevel } from './facilities';
import * as T from './traits';

/**
 * Abstract combat resolution.
 *
 * Combat never plays out blow by blow. It computes a team power, a threat, and a margin,
 * then maps the margin onto an outcome band. Everything that goes into team power is
 * exposed in the expedition forecast *before* the player commits, which is the promise made
 * in GAME_DESIGN §11: no opaque deaths.
 */

export type CombatOutcome = 'rout' | 'clean' | 'costly' | 'repulsed' | 'disaster';

export interface CombatResult {
  outcome: CombatOutcome;
  margin: number;
  teamPower: Breakdown;
  threat: number;
  ammoSpent: number;
  /** Survivors who took a wound, with a severity scale. */
  wounded: { survivorId: string; severity: number }[];
  /** Survivors at genuine risk of dying — resolved by the caller with interpose checks. */
  mortal: string[];
  retreated: boolean;
  text: string;
}

export interface CombatContext {
  members: Survivor[];
  /** Items available in the expedition pack (or the base armoury for a raid). */
  pack: InventoryEntry[];
  ammo: number;
  danger: number;
  threatScale: number;
  /** Accumulated preparation from earlier expedition beats. */
  preparation: number;
  enemy: string;
  night?: boolean;
}

export function computeTeamPower(ctx: CombatContext): Breakdown {
  const b = new BreakdownBuilder();
  const c = BALANCE.combat;

  for (const survivor of ctx.members) {
    const health = remap(survivor.health, 20, 100, 0.45, 1);
    const morale = remap(survivor.morale, 0, 100, 0.75, 1.1);
    const skill = survivor.skills.combat * c.skillWeight * health * morale;
    b.add(`${survivor.name} (combat ${survivor.skills.combat})`, Math.round(skill * 10) / 10);
    const traitDelta = T.combatPowerDelta(survivor);
    if (traitDelta !== 0) b.add(`${survivor.name} traits`, traitDelta);
  }

  // Weapons: the best weapon per member contributes, so stacking six clubs does nothing.
  const weapons = ctx.pack
    .flatMap((entry) => {
      const def = ITEM_BY_ID[entry.itemId];
      if (!def?.power) return [];
      return Array.from({ length: entry.count }, () => def);
    })
    .sort((a, b2) => (b2.power ?? 0) - (a.power ?? 0))
    .slice(0, ctx.members.length);

  let ammoNeeded = 0;
  for (const weapon of weapons) {
    const needsAmmo = (weapon.ammoPerFight ?? 0) > 0;
    if (needsAmmo && ctx.ammo < ammoNeeded + (weapon.ammoPerFight ?? 0)) {
      b.add(`${weapon.name} (no ammunition)`, Math.round((weapon.power ?? 0) * 0.25 * 10) / 10,
        'An unloaded firearm is a club.', 'Bring ammunition or craft an Ammunition Box.');
      continue;
    }
    if (needsAmmo) ammoNeeded += weapon.ammoPerFight ?? 0;
    b.add(weapon.name, weapon.power ?? 0);
  }
  if (ammoNeeded > 0) {
    b.add('Ammunition on hand', Math.min(ammoNeeded, ctx.ammo) * c.ammoBonusPerRound * 0.25);
  }

  let armour = 0;
  for (const entry of ctx.pack) {
    const def = ITEM_BY_ID[entry.itemId];
    if (def?.armour) armour += def.armour * Math.min(entry.count, ctx.members.length);
  }
  if (armour > 0) b.add('Protection', Math.round(armour * c.armourWeight * 10) / 10);

  if (ctx.preparation !== 0) {
    b.add(
      ctx.preparation > 0 ? 'Preparation' : 'Caught out of position',
      ctx.preparation,
      ctx.preparation > 0 ? 'Earned by earlier choices on this expedition.' : undefined,
    );
  }

  if (ctx.night) b.mul('Fighting at night', 0.85);

  return b.build({ min: 0, round: 1 });
}

export function computeThreat(ctx: CombatContext): number {
  const c = BALANCE.combat;
  let threat = (c.baseThreatAtDanger1 + (ctx.danger - 1) * c.threatPerDanger) * ctx.threatScale;
  if (ctx.night) threat *= c.nightMultiplier;
  return Math.round(threat * 10) / 10;
}

export function resolveCombat(rng: Rng, ctx: CombatContext): CombatResult {
  const c = BALANCE.combat;
  const teamPower = computeTeamPower(ctx);
  const threat = computeThreat(ctx);

  // Cowards may pull the team out before the margin is even rolled.
  let retreatChance = 0;
  for (const survivor of ctx.members) retreatChance += Math.max(0, T.retreatChanceDelta(survivor));
  retreatChance = clamp(retreatChance / Math.max(1, ctx.members.length), 0, 0.6);
  const retreated = teamPower.total < threat * 0.75 && rng.chance(retreatChance);

  const variance = rng.float(-1, 1) * threat * c.variance;
  const margin = Math.round((teamPower.total - threat + variance) * 10) / 10;

  let outcome: CombatOutcome = 'disaster';
  for (const band of c.bands) {
    if (margin >= band.min) outcome = band.outcome as CombatOutcome;
  }
  if (retreated && (outcome === 'disaster' || outcome === 'repulsed')) outcome = 'repulsed';

  const ammoSpent = Math.min(
    ctx.ammo,
    ctx.pack.reduce((acc, entry) => {
      const def = ITEM_BY_ID[entry.itemId];
      return acc + (def?.ammoPerFight ?? 0) * Math.min(entry.count, ctx.members.length);
    }, 0),
  );

  const wounded: { survivorId: string; severity: number }[] = [];
  const mortal: string[] = [];

  const casualtyCount =
    outcome === 'rout' ? 0 : outcome === 'clean' ? (rng.chance(0.25) ? 1 : 0)
      : outcome === 'costly' ? 1
        : outcome === 'repulsed' ? (rng.chance(0.6) ? 2 : 1)
          : Math.min(ctx.members.length, 2 + (rng.chance(0.4) ? 1 : 0));

  if (casualtyCount > 0) {
    // Casualties are weighted toward the already-hurt and exhausted, and away from
    // survivors whose traits make them harder to hit.
    const pool = ctx.members.map((survivor) => ({
      value: survivor,
      weight: clamp(
        (110 - survivor.health) * 0.6 + survivor.fatigue * 0.4 + 20,
        5,
        200,
      ) * T.injuryChanceFactor(survivor),
    }));
    const picked: Survivor[] = [];
    for (let i = 0; i < casualtyCount && pool.length > 0; i += 1) {
      const survivor = rng.weighted(pool);
      const index = pool.findIndex((p) => p.value.id === survivor.id);
      if (index >= 0) pool.splice(index, 1);
      picked.push(survivor);
    }

    const severityBase =
      outcome === 'clean' ? 0.5 : outcome === 'costly' ? 0.8 : outcome === 'repulsed' ? 1.0 : 1.35;
    for (const survivor of picked) {
      wounded.push({ survivorId: survivor.id, severity: severityBase * rng.float(0.8, 1.25) });
      // A survivor can only die if they were already below the health ceiling, or the
      // fight was a disaster. This is the invariant tested in tests/expedition.test.ts.
      const alreadyHurt = survivor.health <= BALANCE.expedition.deathHealthCeiling;
      if ((outcome === 'disaster' && rng.chance(0.5)) || (alreadyHurt && outcome === 'repulsed' && rng.chance(0.3))) {
        mortal.push(survivor.id);
      }
    }
  }

  return {
    outcome,
    margin,
    teamPower,
    threat,
    ammoSpent,
    wounded,
    mortal,
    retreated,
    text: describeOutcome(outcome, ctx.enemy, retreated),
  };
}

function describeOutcome(outcome: CombatOutcome, enemy: string, retreated: boolean): string {
  if (retreated && (outcome === 'repulsed' || outcome === 'disaster')) {
    return `Somebody breaks first, and then everybody does. You disengage from ${enemy} and do not stop for two streets.`;
  }
  switch (outcome) {
    case 'rout':
      return `It is over before it is a fight. ${capitalise(enemy)} withdraws without a shot fired in return.`;
    case 'clean':
      return `Short, controlled, and decided quickly. ${capitalise(enemy)} breaks off.`;
    case 'costly':
      return `You win it, and it costs. ${capitalise(enemy)} does not follow.`;
    case 'repulsed':
      return `You are pushed back. ${capitalise(enemy)} holds the ground and you take what you can carry.`;
    case 'disaster':
      return `It goes wrong immediately and stays wrong. ${capitalise(enemy)} is still there when you run.`;
  }
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* ------------------------------------------------------------- base defence */

export function baseDefence(state: GameState): Breakdown {
  const b = new BreakdownBuilder();
  const security = operationalLevel(state, 'security');
  if (security > 0) {
    b.base(`Security Post L${security}`, [0, 8, 16, 28][security] ?? 0);
    const facility = state.facilities.find((f) => f.defId === 'security');
    if (facility && facility.staff.length === 0) {
      b.mul('Unstaffed', 0.5, 'Nobody is watching the approach.', 'Assign someone to the Security Post.');
    }
  } else {
    b.base('The blast door', 4);
  }
  if (state.research.completed.includes('def_fortification')) b.add('Fortification', 6);
  for (const survivor of state.survivors) {
    if (!survivor.alive || survivor.assignment.kind === 'expedition') continue;
    b.add(`${survivor.name}`, survivor.skills.combat * 0.5);
  }
  const weapons = state.inventory.filter((entry) => ITEM_BY_ID[entry.itemId]?.power);
  const weaponPower = weapons.reduce(
    (acc, entry) => acc + (ITEM_BY_ID[entry.itemId]?.power ?? 0) * Math.min(entry.count, 3),
    0,
  );
  if (weaponPower > 0) b.add('Armoury', Math.round(weaponPower * 0.4 * 10) / 10);
  if (state.flags['base.location_known']) {
    b.mul('The location is known', 0.85, 'Somebody followed a team home.');
  }
  return b.build({ min: 0, round: 1 });
}
