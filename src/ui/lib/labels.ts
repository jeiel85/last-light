import { ARCHETYPE_BY_ID, BACKGROUND_BY_ID, PERSONALITY_BY_ID } from '@engine';
import type { LocationInstance, RelationshipBucket, Survivor } from '@engine';
import { t } from '@i18n';
import { backgroundOccupation, locationNameForm, personalityName } from '@i18n/content';

/**
 * Labels that need both a definition table and the translator.
 *
 * A survivor stores their occupation as free text copied from their background at
 * generation, which is the right thing for the simulation and the wrong thing for a
 * translated interface — so the label is recovered from the background definition and the
 * stored string is kept only as the fallback for a survivor whose background is gone.
 */

export function occupationOf(survivor: Survivor): string {
  const background = BACKGROUND_BY_ID[survivor.backgroundId];
  return background ? backgroundOccupation(background) : survivor.occupation;
}

export function personalityOf(survivor: Survivor): string | undefined {
  const personality = PERSONALITY_BY_ID[survivor.personalityId];
  return personality ? personalityName(personality) : undefined;
}

/** The seven relationship bands, named. */
export function bondLabel(bucket: RelationshipBucket): string {
  return t(`bond.${bucket}` as const);
}

/**
 * A site's name.
 *
 * World generation picks one of the archetype's name forms and stores the chosen string,
 * so the translated name is recovered by finding that form in the archetype again. A site
 * whose name was synthesised from a collision (`Clinic 2`) has no form to match and keeps
 * the generated string, which is the correct outcome rather than a missing-key hole.
 */
export function siteName(location: LocationInstance): string {
  const archetype = ARCHETYPE_BY_ID[location.archetypeId];
  return archetype ? locationNameForm(archetype, location.name) : location.name;
}
