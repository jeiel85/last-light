/**
 * Referential integrity over every data table.
 *
 * Content in LAST LIGHT is data, and data rots quietly: a recipe pointing at an item that
 * was renamed will not throw until the player opens the workshop on day nine. This module
 * is the thing that notices. It runs as a vitest suite (so it gates the build) and as
 * `npm run validate` (so it can be run against a content branch on its own).
 *
 * Findings are graded. An `error` is a broken reference or a structural impossibility and
 * fails the build. A `warning` is content that is legal but probably not what the author
 * meant — an event nothing can reach, a lore entry nothing grants.
 */

import { BACKGROUNDS } from '../engine/data/backgrounds';
import { CONDITIONS, CONDITION_BY_ID } from '../engine/data/conditions';
import { DIFFICULTIES } from '../engine/data/difficulties';
import { ENCOUNTERS } from '../engine/data/encounters';
import { EVENTS, EVENT_BY_ID } from '../engine/data/events';
import { FACILITIES, FACILITY_BY_ID } from '../engine/data/facilities';
import { ITEMS, ITEM_BY_ID } from '../engine/data/items';
import { LOCATION_ARCHETYPES } from '../engine/data/locations';
import { LORE, LORE_BY_ID } from '../engine/data/lore';
import { META_UNLOCKS, UNLOCK_BY_ID } from '../engine/data/metaUnlocks';
import { PERSONALITIES } from '../engine/data/personalities';
import { RECIPES, RECIPE_BY_ID } from '../engine/data/recipes';
import { RESEARCH, RESEARCH_BY_ID } from '../engine/data/research';
import { RESOURCES, RESOURCE_LIST } from '../engine/data/resources';
import { SCENARIOS } from '../engine/data/scenarios';
import { TRAITS, TRAIT_BY_ID } from '../engine/data/traits';
import { WEATHER_LIST } from '../engine/data/weather';
import { ENDINGS } from '../engine/systems/endings';
import type {
  EventCondition,
  EventEffect,
  ResourceId,
  SkillId,
} from '../engine/model/types';
import { RESOURCE_IDS, SKILL_IDS } from '../engine/model/types';

export type Severity = 'error' | 'warning';

export interface Finding {
  severity: Severity;
  /** Where the problem is, e.g. `recipes/med_bandage`. */
  where: string;
  message: string;
}

export interface ValidationReport {
  findings: Finding[];
  errors: Finding[];
  warnings: Finding[];
  ok: boolean;
  counts: Record<string, number>;
}

class Collector {
  readonly findings: Finding[] = [];

  error(where: string, message: string): void {
    this.findings.push({ severity: 'error', where, message });
  }

  warn(where: string, message: string): void {
    this.findings.push({ severity: 'warning', where, message });
  }

  /** Assert that `id` resolves in `table`, reporting the reference site when it does not. */
  ref(where: string, kind: string, id: string | undefined, table: Record<string, unknown>): void {
    if (id === undefined) return;
    if (!(id in table)) this.error(where, `references a ${kind} that does not exist: "${id}"`);
  }
}

function duplicates(c: Collector, label: string, ids: readonly string[]): void {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) c.error(label, `duplicate id: "${id}"`);
    seen.add(id);
  }
}

const RESOURCE_TABLE = Object.fromEntries(RESOURCE_IDS.map((id) => [id, true]));
const SKILL_TABLE = Object.fromEntries(SKILL_IDS.map((id) => [id, true]));
const ENDING_TABLE = Object.fromEntries(ENDINGS.map((e) => [e.id, true]));
const ARCHETYPE_TABLE = Object.fromEntries(LOCATION_ARCHETYPES.map((a) => [a.id, true]));
const WEATHER_TABLE = Object.fromEntries(WEATHER_LIST.map((w) => [w.id, true]));
const BACKGROUND_TABLE = Object.fromEntries(BACKGROUNDS.map((b) => [b.id, true]));

/* ------------------------------------------------------------------ traversal */

function walkCondition(c: Collector, where: string, condition: EventCondition | undefined): void {
  if (!condition) return;
  switch (condition.kind) {
    case 'all':
    case 'any':
      for (const child of condition.of) walkCondition(c, where, child);
      return;
    case 'not':
      walkCondition(c, where, condition.of);
      return;
    case 'resource':
    case 'resourceRatio':
      c.ref(where, 'resource', condition.resource, RESOURCE_TABLE);
      return;
    case 'facility':
      c.ref(where, 'facility', condition.facilityId, FACILITY_BY_ID);
      return;
    case 'skill':
      c.ref(where, 'skill', condition.skill, SKILL_TABLE);
      return;
    case 'trait':
      c.ref(where, 'trait', condition.traitId, TRAIT_BY_ID);
      return;
    case 'condition':
      c.ref(where, 'condition', condition.conditionId, CONDITION_BY_ID);
      return;
    case 'research':
      c.ref(where, 'research node', condition.researchId, RESEARCH_BY_ID);
      return;
    case 'item':
      c.ref(where, 'item', condition.itemId, ITEM_BY_ID);
      return;
    case 'location':
      c.ref(where, 'location archetype', condition.archetypeId, ARCHETYPE_TABLE);
      return;
    case 'weather':
      c.ref(where, 'weather', condition.weatherId, WEATHER_TABLE);
      return;
    case 'eventSeen':
      c.ref(where, 'event', condition.eventId, EVENT_BY_ID);
      return;
    case 'chance':
      if (condition.p < 0 || condition.p > 1) c.error(where, `chance p is out of range: ${condition.p}`);
      return;
    default:
      return;
  }
}

function walkEffect(c: Collector, where: string, effect: EventEffect, grants: Set<string>): void {
  switch (effect.kind) {
    case 'resource':
    case 'resourcePercent':
      c.ref(where, 'resource', effect.resource, RESOURCE_TABLE);
      return;
    case 'item':
      c.ref(where, 'item', effect.itemId, ITEM_BY_ID);
      return;
    case 'injure':
      c.ref(where, 'condition', effect.conditionId, CONDITION_BY_ID);
      return;
    case 'cure':
      c.ref(where, 'condition', effect.conditionId, CONDITION_BY_ID);
      return;
    case 'trait':
      c.ref(where, 'trait', effect.traitId, TRAIT_BY_ID);
      return;
    case 'recruit':
      c.ref(where, 'trait', effect.traitHint, TRAIT_BY_ID);
      c.ref(where, 'skill', effect.skillHint, SKILL_TABLE);
      return;
    case 'facilityDamage':
    case 'facilityRepair':
      c.ref(where, 'facility', effect.facilityId, FACILITY_BY_ID);
      return;
    case 'facilityGrant':
      c.ref(where, 'facility', effect.facilityId, FACILITY_BY_ID);
      if (effect.level !== undefined && (effect.level < 1 || effect.level > 3)) {
        c.error(where, `grants facility level ${effect.level}, outside 1–3`);
      }
      return;
    case 'research':
      c.ref(where, 'research node', effect.researchId, RESEARCH_BY_ID);
      return;
    case 'lore':
      c.ref(where, 'lore entry', effect.loreId, LORE_BY_ID);
      grants.add(effect.loreId);
      return;
    case 'revealLocation':
      c.ref(where, 'location archetype', effect.archetypeId, ARCHETYPE_TABLE);
      return;
    case 'schedule':
    case 'chain':
      c.ref(where, 'event', effect.eventId, EVENT_BY_ID);
      if (effect.kind === 'schedule' && effect.inDays < 0) {
        c.error(where, `schedules an event ${effect.inDays} days in the past`);
      }
      return;
    case 'weather':
      c.ref(where, 'weather', effect.weatherId, WEATHER_TABLE);
      return;
    case 'ending':
      c.ref(where, 'ending', effect.endingId, ENDING_TABLE);
      return;
    default:
      return;
  }
}

/* -------------------------------------------------------------------- checks */

function checkResources(c: Collector): void {
  duplicates(c, 'resources', RESOURCE_LIST.map((r) => r.id));
  for (const resource of RESOURCE_LIST) {
    const where = `resources/${resource.id}`;
    if (!resource.name) c.error(where, 'has no display name');
    if (!resource.summary) c.error(where, 'has no encyclopedia summary');
    if (!resource.failure) c.error(where, 'does not say what happens when it runs out');
    if (resource.baseCap <= 0) c.error(where, `has a non-positive cap: ${resource.baseCap}`);
  }
  for (const id of RESOURCE_IDS) {
    if (!RESOURCES[id]) c.error('resources', `no definition for declared resource "${id}"`);
  }
}

function checkTraits(c: Collector): void {
  duplicates(c, 'traits', TRAITS.map((t) => t.id));
  for (const trait of TRAITS) {
    const where = `traits/${trait.id}`;
    if (!trait.name) c.error(where, 'has no display name');
    if (!trait.description) c.error(where, 'has no description');
    if (trait.effects.length === 0 && !trait.skillMods) {
      c.warn(where, 'has no mechanical effect at all');
    }
    for (const conflict of trait.conflicts ?? []) {
      c.ref(where, 'trait', conflict, TRAIT_BY_ID);
      if (conflict === trait.id) c.error(where, 'conflicts with itself');
      const other = TRAIT_BY_ID[conflict];
      if (other && !(other.conflicts ?? []).includes(trait.id)) {
        c.warn(where, `conflict with "${conflict}" is not declared on both sides`);
      }
    }
    c.ref(where, 'unlock', trait.requiresUnlock, UNLOCK_BY_ID);
    for (const skill of Object.keys(trait.skillMods ?? {})) {
      c.ref(where, 'skill', skill, SKILL_TABLE);
    }
  }
}

function checkConditions(c: Collector): void {
  duplicates(c, 'conditions', CONDITIONS.map((x) => x.id));
  for (const condition of CONDITIONS) {
    const where = `conditions/${condition.id}`;
    if (!condition.name) c.error(where, 'has no display name');
    if (!condition.description) c.error(where, 'has no description');
    c.ref(where, 'condition', condition.escalatesTo, CONDITION_BY_ID);
    if (condition.escalatesTo === condition.id) c.error(where, 'escalates into itself');
    if (condition.workPenaltyAtFull < 0 || condition.workPenaltyAtFull > 1) {
      c.error(where, `work penalty ${condition.workPenaltyAtFull} is outside 0–1`);
    }
  }
}

function checkFacilities(c: Collector): void {
  duplicates(c, 'facilities', FACILITIES.map((f) => f.id));
  for (const facility of FACILITIES) {
    const where = `facilities/${facility.id}`;
    if (!facility.name) c.error(where, 'has no display name');
    if (!facility.icon) c.error(where, 'has no icon glyph');
    if (facility.levels.length !== 3) c.error(where, `has ${facility.levels.length} levels, expected 3`);
    if (facility.decks.length === 0) c.error(where, 'cannot be built on any deck');
    c.ref(where, 'research node', facility.requiresResearch, RESEARCH_BY_ID);
    c.ref(where, 'skill', facility.skill, SKILL_TABLE);

    let previousCost = -1;
    facility.levels.forEach((level, index) => {
      const levelWhere = `${where}/L${index + 1}`;
      if (!level.summary) c.error(levelWhere, 'has no summary');
      for (const [resource, amount] of Object.entries(level.buildCost) as [ResourceId, number][]) {
        c.ref(levelWhere, 'resource', resource, RESOURCE_TABLE);
        if (amount < 0) c.error(levelWhere, `has a negative cost for ${resource}`);
      }
      const total = Object.values(level.buildCost).reduce((a, v) => a + (v ?? 0), 0);
      if (total <= previousCost) {
        c.warn(levelWhere, 'costs no more than the level below it');
      }
      previousCost = total;
      if (level.labour < 0) c.error(levelWhere, 'has negative labour');
      if (level.powerDraw < 0) c.error(levelWhere, 'has negative power draw');
    });
  }
}

function checkItemsAndRecipes(c: Collector): void {
  duplicates(c, 'items', ITEMS.map((i) => i.id));
  for (const item of ITEMS) {
    const where = `items/${item.id}`;
    if (!item.name) c.error(where, 'has no display name');
    if (!item.description) c.error(where, 'has no description');
    if (!item.icon) c.error(where, 'has no icon glyph');
    if (item.weight < 0) c.error(where, 'has negative weight');
    if (item.salvage < 0) c.error(where, 'has negative salvage value');
    if (item.consumable && !item.use) c.error(where, 'is consumable but has no use effect');
    if (item.use?.kind === 'cure') {
      for (const conditionId of item.use.conditions) c.ref(where, 'condition', conditionId, CONDITION_BY_ID);
    }
    if (item.use?.kind === 'resource') c.ref(where, 'resource', item.use.resource, RESOURCE_TABLE);
    for (const skill of Object.keys(item.skillBonus ?? {})) c.ref(where, 'skill', skill, SKILL_TABLE);
  }

  duplicates(c, 'recipes', RECIPES.map((r) => r.id));
  const craftable = new Set<string>();
  for (const recipe of RECIPES) {
    const where = `recipes/${recipe.id}`;
    c.ref(where, 'item', recipe.itemId, ITEM_BY_ID);
    c.ref(where, 'facility', recipe.facility, FACILITY_BY_ID);
    c.ref(where, 'research node', recipe.requiresResearch, RESEARCH_BY_ID);
    craftable.add(recipe.itemId);

    if (recipe.yield <= 0) c.error(where, `produces ${recipe.yield} items`);
    if (recipe.labour <= 0) c.error(where, 'takes no labour, so it would complete instantly');
    if (recipe.minLevel < 1 || recipe.minLevel > 3) c.error(where, `requires facility level ${recipe.minLevel}`);

    const facility = FACILITY_BY_ID[recipe.facility];
    if (facility && facility.levels.length < recipe.minLevel) {
      c.error(where, `requires ${recipe.facility} L${recipe.minLevel}, which cannot be reached`);
    }
    for (const [resource, amount] of Object.entries(recipe.cost) as [ResourceId, number][]) {
      c.ref(where, 'resource', resource, RESOURCE_TABLE);
      if ((amount ?? 0) < 0) c.error(where, `has a negative cost for ${resource}`);
    }
    for (const entry of recipe.itemCost ?? []) {
      c.ref(where, 'item', entry.itemId, ITEM_BY_ID);
      if (entry.itemId === recipe.itemId) c.error(where, 'consumes the item it produces');
      if (entry.count <= 0) c.error(where, `consumes ${entry.count} of ${entry.itemId}`);
    }
    const totalCost =
      Object.values(recipe.cost).reduce((a, v) => a + (v ?? 0), 0) + (recipe.itemCost?.length ?? 0);
    if (totalCost === 0) c.warn(where, 'costs nothing at all');
  }
}

function checkResearch(c: Collector): void {
  duplicates(c, 'research', RESEARCH.map((r) => r.id));
  for (const node of RESEARCH) {
    const where = `research/${node.id}`;
    if (!node.name) c.error(where, 'has no display name');
    if (!node.description) c.error(where, 'has no description');
    if (!node.effectText) c.error(where, 'does not describe what it unlocks');
    if (node.cost <= 0) c.error(where, `costs ${node.cost} insight`);
    if (node.unlocks.length === 0) c.warn(where, 'unlocks nothing');

    for (const requirement of node.requires) {
      c.ref(where, 'research node', requirement, RESEARCH_BY_ID);
      const parent = RESEARCH_BY_ID[requirement];
      if (parent && parent.tier > node.tier) {
        c.error(where, `depends on "${requirement}", which sits at a higher tier`);
      }
    }
    for (const unlock of node.unlocks) {
      switch (unlock.kind) {
        case 'recipe':
          c.ref(where, 'recipe', unlock.recipeId, RECIPE_BY_ID);
          break;
        case 'facility':
          c.ref(where, 'facility', unlock.facilityId, FACILITY_BY_ID);
          break;
        case 'ending':
          c.ref(where, 'ending', unlock.endingId, ENDING_TABLE);
          break;
        case 'ring':
          if (unlock.ring < 0 || unlock.ring > 2) c.error(where, `unlocks ring ${unlock.ring}`);
          break;
        default:
          break;
      }
    }
  }

  /* The graph must be acyclic and fully reachable from the tier-1 roots. */
  const visiting = new Set<string>();
  const done = new Set<string>();
  const visit = (id: string, trail: string[]): void => {
    if (done.has(id)) return;
    if (visiting.has(id)) {
      c.error('research', `dependency cycle: ${[...trail, id].join(' → ')}`);
      return;
    }
    visiting.add(id);
    for (const requirement of RESEARCH_BY_ID[id]?.requires ?? []) visit(requirement, [...trail, id]);
    visiting.delete(id);
    done.add(id);
  };
  for (const node of RESEARCH) visit(node.id, []);

  const reachable = new Set<string>();
  let grew = true;
  while (grew) {
    grew = false;
    for (const node of RESEARCH) {
      if (reachable.has(node.id)) continue;
      if (node.requires.every((r) => reachable.has(r))) {
        reachable.add(node.id);
        grew = true;
      }
    }
  }
  for (const node of RESEARCH) {
    if (!reachable.has(node.id)) c.error(`research/${node.id}`, 'can never be reached from the roots');
  }
}

function checkLocations(c: Collector): void {
  duplicates(c, 'locations', LOCATION_ARCHETYPES.map((a) => a.id));
  const tagsInUse = new Set<string>();
  for (const archetype of LOCATION_ARCHETYPES) {
    const where = `locations/${archetype.id}`;
    if (!archetype.name) c.error(where, 'has no display name');
    if (!archetype.description) c.error(where, 'has no description');
    if (!archetype.icon) c.error(where, 'has no icon glyph');
    if (archetype.nameForms.length === 0) c.error(where, 'has no name forms to draw from');
    if (archetype.rings.length === 0) c.error(where, 'can never be placed: no rings');
    if (archetype.maxInstances <= 0) c.error(where, 'can never be placed: maxInstances is zero');
    if (archetype.loot.length === 0) c.error(where, 'has an empty loot table');
    if (archetype.encounterTags.length === 0) c.warn(where, 'has no encounter tags, so only "any" beats can fire');
    for (const tag of archetype.encounterTags) tagsInUse.add(tag);

    for (const entry of archetype.loot) {
      if (!entry.resource && !entry.itemId) c.error(where, 'has a loot entry that yields nothing');
      if (entry.resource) c.ref(where, 'resource', entry.resource, RESOURCE_TABLE);
      if (entry.itemId) c.ref(where, 'item', entry.itemId, ITEM_BY_ID);
      if (entry.weight <= 0) c.error(where, 'has a loot entry that can never be drawn');
      if (entry.min > entry.max) c.error(where, `has a loot entry with min ${entry.min} above max ${entry.max}`);
    }
    for (const eventId of archetype.siteEvents ?? []) c.ref(where, 'event', eventId, EVENT_BY_ID);
    for (const loreId of archetype.lore ?? []) c.ref(where, 'lore entry', loreId, LORE_BY_ID);
  }

  /* Every stage must have at least one beat that can fire on the tags in use. */
  const stages = ['travel', 'approach', 'site', 'complication', 'extraction'] as const;
  for (const stage of stages) {
    const beats = ENCOUNTERS.filter((e) => e.stage === stage);
    if (beats.length === 0) c.error('encounters', `no beats exist for the "${stage}" stage`);
    const universal = beats.some((e) => e.tags.includes('any'));
    if (!universal) {
      c.warn('encounters', `the "${stage}" stage has no untagged fallback beat`);
    }
  }
  for (const encounter of ENCOUNTERS) {
    const where = `encounters/${encounter.id}`;
    const usable = encounter.tags.includes('any') || encounter.tags.some((t) => tagsInUse.has(t));
    if (!usable) c.warn(where, `tags ${encounter.tags.join('/')} match no location archetype`);
  }
}

function checkEncounters(c: Collector): void {
  duplicates(c, 'encounters', ENCOUNTERS.map((e) => e.id));
  for (const encounter of ENCOUNTERS) {
    const where = `encounters/${encounter.id}`;
    if (!encounter.title) c.error(where, 'has no title');
    if (!encounter.text) c.error(where, 'has no body text');
    if (encounter.choices.length === 0) c.error(where, 'has no choices');
    if (encounter.weight <= 0) c.error(where, 'can never be drawn: weight is zero');
    duplicates(c, where, encounter.choices.map((x) => x.id));

    for (const choice of encounter.choices) {
      const choiceWhere = `${where}/${choice.id}`;
      if (!choice.label) c.error(choiceWhere, 'has no label');
      if (!choice.outcome && !choice.onSuccess && !choice.onFailure) {
        c.error(choiceWhere, 'leads nowhere: no outcome and no check branches');
      }
      if (choice.check && !choice.onSuccess && !choice.onFailure) {
        c.error(choiceWhere, 'has a check but neither branch');
      }
      if (choice.check) c.ref(choiceWhere, 'skill', choice.check.skill, SKILL_TABLE);
      if (choice.requiresSkill) c.ref(choiceWhere, 'skill', choice.requiresSkill.skill, SKILL_TABLE);
      c.ref(choiceWhere, 'trait', choice.requiresTrait, TRAIT_BY_ID);
      c.ref(choiceWhere, 'research node', choice.requiresResearch, RESEARCH_BY_ID);

      const gated = Boolean(
        choice.requiresItemTag ?? choice.requiresSkill ?? choice.requiresTrait ?? choice.requiresResearch,
      );
      if (gated && !choice.lockedHint) {
        c.warn(choiceWhere, 'is gated but does not explain why it is unavailable');
      }
      if (choice.requiresItemTag) {
        const supplied = ITEMS.some((item) => item.tags.includes(choice.requiresItemTag!));
        if (!supplied) c.error(choiceWhere, `requires item tag "${choice.requiresItemTag}", which no item carries`);
      }

      for (const outcome of [choice.outcome, choice.onSuccess, choice.onFailure]) {
        if (!outcome) continue;
        if (!outcome.text) c.error(choiceWhere, 'has an outcome with no text');
        for (const entry of outcome.items ?? []) c.ref(choiceWhere, 'item', entry.itemId, ITEM_BY_ID);
        c.ref(choiceWhere, 'item', outcome.consumeItem, ITEM_BY_ID);
        if (outcome.illness) c.ref(choiceWhere, 'condition', outcome.illness.conditionId, CONDITION_BY_ID);
        for (const loreId of outcome.lore ?? []) c.ref(choiceWhere, 'lore entry', loreId, LORE_BY_ID);
        for (const resource of Object.keys(outcome.resources ?? {})) {
          c.ref(choiceWhere, 'resource', resource, RESOURCE_TABLE);
        }
      }
    }
  }
}

function checkEvents(c: Collector, grants: Set<string>): void {
  duplicates(c, 'events', EVENTS.map((e) => e.id));
  for (const event of EVENTS) {
    const where = `events/${event.id}`;
    if (!event.title) c.error(where, 'has no title');
    if (!event.body) c.error(where, 'has no body text');
    if (event.choices.length === 0) c.error(where, 'has no choices');
    if (event.weight <= 0 && !event.scheduledOnly) {
      c.error(where, 'can never be drawn: weight is zero and it is not scheduled-only');
    }
    if (event.cooldown < 0) c.error(where, 'has a negative cooldown');
    duplicates(c, where, event.choices.map((x) => x.id));
    walkCondition(c, where, event.requires);

    for (const choice of event.choices) {
      const choiceWhere = `${where}/${choice.id}`;
      if (!choice.label) c.error(choiceWhere, 'has no label');
      walkCondition(c, choiceWhere, choice.requires);

      if (choice.check) {
        c.ref(choiceWhere, 'skill', choice.check.skill, SKILL_TABLE);
        for (const bonus of choice.check.traitBonus ?? []) {
          c.ref(choiceWhere, 'trait', bonus.traitId, TRAIT_BY_ID);
        }
        if (!choice.successText && !choice.onSuccess?.length && !choice.resultText) {
          c.warn(choiceWhere, 'has a check but says nothing on success');
        }
      }
      for (const [resource, amount] of Object.entries(choice.cost?.resources ?? {}) as [ResourceId, number][]) {
        c.ref(choiceWhere, 'resource', resource, RESOURCE_TABLE);
        if ((amount ?? 0) < 0) c.error(choiceWhere, `has a negative cost for ${resource}`);
      }
      for (const entry of choice.cost?.items ?? []) c.ref(choiceWhere, 'item', entry.itemId, ITEM_BY_ID);

      const effects = [...(choice.effects ?? []), ...(choice.onSuccess ?? []), ...(choice.onFailure ?? [])];
      for (const effect of effects) walkEffect(c, choiceWhere, effect, grants);

      const says = Boolean(choice.resultText ?? choice.successText ?? choice.failureText);
      if (!says && effects.length === 0) {
        c.error(choiceWhere, 'does nothing and says nothing');
      }
    }
  }

  /* A scheduled-only event that nothing schedules can never fire. */
  const referenced = new Set<string>();
  for (const event of EVENTS) {
    for (const choice of event.choices) {
      for (const effect of [...(choice.effects ?? []), ...(choice.onSuccess ?? []), ...(choice.onFailure ?? [])]) {
        if (effect.kind === 'schedule' || effect.kind === 'chain') referenced.add(effect.eventId);
      }
    }
  }
  for (const archetype of LOCATION_ARCHETYPES) {
    for (const eventId of archetype.siteEvents ?? []) referenced.add(eventId);
  }
  for (const event of EVENTS) {
    if (event.scheduledOnly && !referenced.has(event.id)) {
      c.error(`events/${event.id}`, 'is scheduled-only but nothing ever schedules it');
    }
  }
}

function checkLore(c: Collector, grants: Set<string>): void {
  duplicates(c, 'lore', LORE.map((l) => l.id));
  for (const entry of LORE) {
    const where = `lore/${entry.id}`;
    if (!entry.title) c.error(where, 'has no title');
    if (!entry.body) c.error(where, 'has no body');
    if (!entry.source) c.error(where, 'has no source attribution');
  }

  /* Lore reachable from encounters and archetypes as well as events. */
  for (const encounter of ENCOUNTERS) {
    for (const choice of encounter.choices) {
      for (const outcome of [choice.outcome, choice.onSuccess, choice.onFailure]) {
        for (const loreId of outcome?.lore ?? []) grants.add(loreId);
      }
    }
  }
  for (const archetype of LOCATION_ARCHETYPES) {
    for (const loreId of archetype.lore ?? []) grants.add(loreId);
  }

  for (const entry of LORE) {
    if (!grants.has(entry.id)) {
      c.warn(`lore/${entry.id}`, 'is never granted by any event, encounter, or location');
    }
  }
}

function checkRunStructure(c: Collector): void {
  duplicates(c, 'scenarios', SCENARIOS.map((s) => s.id));
  for (const scenario of SCENARIOS) {
    const where = `scenarios/${scenario.id}`;
    if (!scenario.name) c.error(where, 'has no display name');
    if (!scenario.description) c.error(where, 'has no description');
    if (scenario.survivorCount <= 0) c.error(where, 'starts with nobody alive');
    c.ref(where, 'unlock', scenario.requiresUnlock, UNLOCK_BY_ID);
    for (const resource of Object.keys(scenario.startingResources)) {
      c.ref(where, 'resource', resource, RESOURCE_TABLE);
    }
    for (const entry of scenario.startingItems) c.ref(where, 'item', entry.itemId, ITEM_BY_ID);
    for (const entry of scenario.startingFacilities) {
      c.ref(where, 'facility', entry.facilityId, FACILITY_BY_ID);
      if (entry.level < 1 || entry.level > 3) c.error(where, `starts ${entry.facilityId} at level ${entry.level}`);
    }
    for (const banned of scenario.bannedFacilities ?? []) {
      c.ref(where, 'facility', banned.facilityId, FACILITY_BY_ID);
    }
    for (const weatherId of Object.keys(scenario.modifiers.weatherWeights ?? {})) {
      c.ref(where, 'weather', weatherId, WEATHER_TABLE);
    }
    if (scenario.deadlineDay !== undefined && !scenario.deadlineText) {
      c.error(where, 'has a deadline the player is never told about');
    }
  }

  duplicates(c, 'difficulties', DIFFICULTIES.map((d) => d.id));
  for (const difficulty of DIFFICULTIES) {
    const where = `difficulties/${difficulty.id}`;
    if (!difficulty.name) c.error(where, 'has no display name');
    if (!difficulty.description) c.error(where, 'has no description');
    if (difficulty.legacyMultiplier <= 0) c.error(where, 'awards no legacy at all');
    for (const [key, value] of Object.entries(difficulty)) {
      if (typeof value === 'number' && !Number.isFinite(value)) c.error(where, `${key} is not a finite number`);
    }
  }

  duplicates(c, 'endings', ENDINGS.map((e) => e.id));
  for (const ending of ENDINGS) {
    const where = `endings/${ending.id}`;
    if (!ending.name) c.error(where, 'has no display name');
    if (!ending.summary) c.error(where, 'has no summary');
    if (ending.epilogue.length < 40) c.error(where, 'has an epilogue too short to be an ending');
    if (ending.legacyBase <= 0) c.error(where, 'awards no legacy');
  }
  if (!ENDINGS.some((e) => e.kind === 'victory' || e.kind === 'transcendent')) {
    c.error('endings', 'no ending counts as a win');
  }
  if (!ENDINGS.some((e) => e.kind === 'defeat')) c.error('endings', 'no ending counts as a loss');

  duplicates(c, 'metaUnlocks', META_UNLOCKS.map((u) => u.id));
  for (const unlock of META_UNLOCKS) {
    const where = `metaUnlocks/${unlock.id}`;
    if (!unlock.name) c.error(where, 'has no display name');
    if (!unlock.description) c.error(where, 'has no description');
    if (unlock.cost <= 0) c.error(where, 'is free');
    for (const requirement of unlock.requires ?? []) {
      c.ref(where, 'unlock', requirement, UNLOCK_BY_ID);
      if (requirement === unlock.id) c.error(where, 'requires itself');
    }
    for (const entry of unlock.kitItems ?? []) c.ref(where, 'item', entry.itemId, ITEM_BY_ID);
    for (const resource of Object.keys(unlock.kitResources ?? {})) {
      c.ref(where, 'resource', resource, RESOURCE_TABLE);
    }
    if (unlock.category === 'kit' && !unlock.kitItems && !unlock.kitResources) {
      c.error(where, 'is a kit that grants nothing');
    }
  }

  /* Every trait gated behind an unlock must be reachable through one that exists. */
  for (const trait of TRAITS) {
    if (trait.requiresUnlock && !UNLOCK_BY_ID[trait.requiresUnlock]) {
      c.error(`traits/${trait.id}`, `is gated behind unlock "${trait.requiresUnlock}", which does not exist`);
    }
  }
}

function checkPeople(c: Collector): void {
  duplicates(c, 'backgrounds', BACKGROUNDS.map((b) => b.id));
  for (const background of BACKGROUNDS) {
    const where = `backgrounds/${background.id}`;
    if (!background.occupation) c.error(where, 'has no occupation label');
    if (!background.bio) c.error(where, 'has no biography fragment');
    c.ref(where, 'skill', background.primary, SKILL_TABLE);
    c.ref(where, 'skill', background.secondary, SKILL_TABLE);
    if (background.primary === background.secondary) {
      c.warn(where, 'has the same primary and secondary skill');
    }
    for (const traitId of background.traitAffinity) c.ref(where, 'trait', traitId, TRAIT_BY_ID);
    if (background.weight <= 0) c.error(where, 'can never be rolled');
  }

  duplicates(c, 'personalities', PERSONALITIES.map((p) => p.id));
  for (const personality of PERSONALITIES) {
    const where = `personalities/${personality.id}`;
    if (!personality.name) c.error(where, 'has no display name');
    if (!personality.description) c.error(where, 'has no description');
    if (personality.voice.length === 0) c.warn(where, 'has no voice samples');
  }

  /* Every skill must be somebody's speciality, or it is a stat nobody trains. */
  for (const skill of SKILL_IDS as readonly SkillId[]) {
    const owned = BACKGROUNDS.some((b) => b.primary === skill || b.secondary === skill);
    if (!owned) c.warn('backgrounds', `no background specialises in "${skill}"`);
  }

  duplicates(c, 'weather', WEATHER_LIST.map((w) => w.id));
  for (const weather of WEATHER_LIST) {
    const where = `weather/${weather.id}`;
    if (!weather.name) c.error(where, 'has no display name');
    if (!weather.description) c.error(where, 'has no description');
    if (weather.weight <= 0) c.error(where, 'can never be rolled');
  }
  void BACKGROUND_TABLE;
}

/* --------------------------------------------------------------------- entry */

export function validateContent(): ValidationReport {
  const c = new Collector();
  const loreGrants = new Set<string>();

  checkResources(c);
  checkTraits(c);
  checkConditions(c);
  checkFacilities(c);
  checkItemsAndRecipes(c);
  checkResearch(c);
  checkEncounters(c);
  checkLocations(c);
  checkEvents(c, loreGrants);
  checkLore(c, loreGrants);
  checkRunStructure(c);
  checkPeople(c);

  const errors = c.findings.filter((f) => f.severity === 'error');
  const warnings = c.findings.filter((f) => f.severity === 'warning');

  return {
    findings: c.findings,
    errors,
    warnings,
    ok: errors.length === 0,
    counts: {
      resources: RESOURCE_LIST.length,
      traits: TRAITS.length,
      conditions: CONDITIONS.length,
      facilities: FACILITIES.length,
      items: ITEMS.length,
      recipes: RECIPES.length,
      research: RESEARCH.length,
      locations: LOCATION_ARCHETYPES.length,
      encounters: ENCOUNTERS.length,
      events: EVENTS.length,
      lore: LORE.length,
      scenarios: SCENARIOS.length,
      difficulties: DIFFICULTIES.length,
      endings: ENDINGS.length,
      unlocks: META_UNLOCKS.length,
      backgrounds: BACKGROUNDS.length,
      personalities: PERSONALITIES.length,
      weather: WEATHER_LIST.length,
    },
  };
}
