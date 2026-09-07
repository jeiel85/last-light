import type {
  BackgroundDef,
  ConditionDef,
  DifficultyDef,
  EncounterChoice,
  EncounterDef,
  EncounterOutcome,
  EndingDef,
  EnemyId,
  EventChoice,
  EventDef,
  FacilityDef,
  ItemDef,
  LocationArchetype,
  LoreDef,
  MetaUnlockDef,
  PersonalityDef,
  ResearchDef,
  ResourceDef,
  ScenarioDef,
  SkillId,
  TraitDef,
  WeatherDef,
} from '@engine';
/*
 * By relative path, and from the data file rather than the engine barrel: the engine's
 * combat code imports this module, so reaching back through the barrel would close a
 * cycle. `data/encounters` imports nothing but types.
 */
import { ENEMY_BY_ID } from '../engine/data/encounters';
import { tc } from './index';

/**
 * Localised accessors for authored content.
 *
 * Every one of these takes the definition and returns the player-facing string, translated
 * if the current locale has it and the English written in the data file if not. Callers do
 * not need to know which — that is the whole point, and it is why a partial translation is
 * a usable translation rather than a broken screen.
 *
 * Nested content carries its path in the key, so an event choice's label lives at
 * `events.<eventId>.choices.<choiceId>.label`.
 */

/* ------------------------------------------------------------------- simple */

export const resourceName = (def: ResourceDef): string => tc('resources', def.id, 'name', def.name);
export const resourceSummary = (def: ResourceDef): string =>
  tc('resources', def.id, 'summary', def.summary);
export const resourceFailure = (def: ResourceDef): string =>
  tc('resources', def.id, 'failure', def.failure);

export const weatherName = (def: WeatherDef): string => tc('weather', def.id, 'name', def.name);
export const weatherDescription = (def: WeatherDef): string =>
  tc('weather', def.id, 'description', def.description);

export const difficultyName = (def: DifficultyDef): string =>
  tc('difficulties', def.id, 'name', def.name);
export const difficultyDescription = (def: DifficultyDef): string =>
  tc('difficulties', def.id, 'description', def.description);

export const conditionName = (def: ConditionDef): string => tc('conditions', def.id, 'name', def.name);
export const conditionDescription = (def: ConditionDef): string =>
  tc('conditions', def.id, 'description', def.description);

/** Skills are addressed by id; the fallback covers a roll reported against a free-text label. */
/**
 * A combat opponent's name.
 *
 * The fallback is the English phrase from `ENEMIES`, so an id the data no longer defines
 * reads as the id rather than as an empty string — `npm run validate` is what catches it.
 */
export const enemyName = (id: EnemyId): string =>
  tc('enemies', id, 'name', ENEMY_BY_ID[id]?.name ?? id);

export const skillName = (skill: SkillId | string, fallback: string): string =>
  tc('skills', skill, 'name', fallback);

export const traitName = (def: TraitDef): string => tc('traits', def.id, 'name', def.name);
export const traitDescription = (def: TraitDef): string =>
  tc('traits', def.id, 'description', def.description);

export const itemName = (def: ItemDef): string => tc('items', def.id, 'name', def.name);
export const itemDescription = (def: ItemDef): string =>
  tc('items', def.id, 'description', def.description);

export const researchName = (def: ResearchDef): string => tc('research', def.id, 'name', def.name);
export const researchDescription = (def: ResearchDef): string =>
  tc('research', def.id, 'description', def.description);
export const researchEffect = (def: ResearchDef): string =>
  tc('research', def.id, 'effectText', def.effectText);

export const unlockName = (def: MetaUnlockDef): string => tc('unlocks', def.id, 'name', def.name);
export const unlockDescription = (def: MetaUnlockDef): string =>
  tc('unlocks', def.id, 'description', def.description);

export const personalityName = (def: PersonalityDef): string =>
  tc('personalities', def.id, 'name', def.name);
export const personalityDescription = (def: PersonalityDef): string =>
  tc('personalities', def.id, 'description', def.description);

export const backgroundOccupation = (def: BackgroundDef): string =>
  tc('backgrounds', def.id, 'occupation', def.occupation);
export const backgroundBio = (def: BackgroundDef): string => tc('backgrounds', def.id, 'bio', def.bio);

/* ------------------------------------------------------------------ nested */

export const facilityName = (def: FacilityDef): string => tc('facilities', def.id, 'name', def.name);
export const facilityDescription = (def: FacilityDef): string =>
  tc('facilities', def.id, 'description', def.description);
export const facilityLevelSummary = (def: FacilityDef, level: number): string =>
  tc('facilities', def.id, `levels.${level}.summary`, def.levels[level - 1]?.summary ?? '');

export const locationName = (def: LocationArchetype): string =>
  tc('locations', def.id, 'name', def.name);
export const locationDescription = (def: LocationArchetype): string =>
  tc('locations', def.id, 'description', def.description);
/** Site names are drawn from a list at world generation, so they translate by index. */
export const locationNameForm = (def: LocationArchetype, form: string): string => {
  const index = def.nameForms.indexOf(form);
  return index < 0 ? form : tc('locations', def.id, `nameForms.${index}`, form);
};

export const scenarioName = (def: ScenarioDef): string => tc('scenarios', def.id, 'name', def.name);
export const scenarioTagline = (def: ScenarioDef): string =>
  tc('scenarios', def.id, 'tagline', def.tagline);
export const scenarioDescription = (def: ScenarioDef): string =>
  tc('scenarios', def.id, 'description', def.description);
export const scenarioDeadline = (def: ScenarioDef): string | undefined =>
  def.deadlineText ? tc('scenarios', def.id, 'deadlineText', def.deadlineText) : undefined;

export const endingName = (def: EndingDef): string => tc('endings', def.id, 'name', def.name);
export const endingSummary = (def: EndingDef): string => tc('endings', def.id, 'summary', def.summary);
export const endingEpilogue = (def: EndingDef): string =>
  tc('endings', def.id, 'epilogue', def.epilogue);

export const loreTitle = (def: LoreDef): string => tc('lore', def.id, 'title', def.title);
export const loreSource = (def: LoreDef): string => tc('lore', def.id, 'source', def.source);
export const loreBody = (def: LoreDef): string => tc('lore', def.id, 'body', def.body);

export const eventTitle = (def: EventDef): string => tc('events', def.id, 'title', def.title);
export const eventBody = (def: EventDef): string => tc('events', def.id, 'body', def.body);

export function eventChoiceText(event: EventDef, choice: EventChoice) {
  const at = (field: string, fallback: string | undefined): string | undefined =>
    fallback === undefined ? undefined : tc('events', event.id, `choices.${choice.id}.${field}`, fallback);
  return {
    label: at('label', choice.label)!,
    hint: at('hint', choice.hint),
    resultText: at('resultText', choice.resultText),
    successText: at('successText', choice.successText),
    failureText: at('failureText', choice.failureText),
  };
}

export const encounterTitle = (def: EncounterDef): string =>
  tc('encounters', def.id, 'title', def.title);
export const encounterText = (def: EncounterDef): string => tc('encounters', def.id, 'text', def.text);

export function encounterChoiceText(encounter: EncounterDef, choice: EncounterChoice) {
  const at = (field: string, fallback: string | undefined): string | undefined =>
    fallback === undefined
      ? undefined
      : tc('encounters', encounter.id, `choices.${choice.id}.${field}`, fallback);
  return {
    label: at('label', choice.label)!,
    hint: at('hint', choice.hint),
    lockedHint: at('lockedHint', choice.lockedHint),
  };
}

/** An encounter outcome's prose, keyed by which branch it belongs to. */
export function encounterOutcomeText(
  encounter: EncounterDef,
  choice: EncounterChoice,
  branch: 'outcome' | 'onSuccess' | 'onFailure',
  outcome: EncounterOutcome,
): string {
  return tc('encounters', encounter.id, `choices.${choice.id}.${branch}.text`, outcome.text);
}
