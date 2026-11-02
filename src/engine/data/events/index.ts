import type { EventDef, EventId } from '../../model/types';
import { SURVIVAL_EVENTS } from './survival';
import { SOCIAL_EVENTS } from './social';
import { FACILITY_EVENTS } from './facility';
import { RADIO_EVENTS } from './radio';
import { STRANGER_EVENTS } from './strangers';
import { MEDICAL_EVENTS } from './medical';
import { ENVIRONMENT_EVENTS } from './environment';
import { MORAL_EVENTS } from './moral';
import { CHAIN_EVENTS } from './chains';
import { MERIDIAN_EVENTS } from './meridian';
import { ONBOARDING_EVENTS } from './onboarding';

/**
 * The event catalogue.
 *
 * Modules are themed so that authoring a batch of events means opening one file. The
 * content validator (`src/content-validation/validate.ts`) checks this combined list for
 * duplicate ids, broken chain targets, and references to items, facilities, research,
 * conditions, and lore that do not exist.
 */

export const EVENTS: readonly EventDef[] = [
  ...ONBOARDING_EVENTS,
  ...SURVIVAL_EVENTS,
  ...SOCIAL_EVENTS,
  ...FACILITY_EVENTS,
  ...RADIO_EVENTS,
  ...STRANGER_EVENTS,
  ...MEDICAL_EVENTS,
  ...ENVIRONMENT_EVENTS,
  ...MORAL_EVENTS,
  ...CHAIN_EVENTS,
  ...MERIDIAN_EVENTS,
];

export const EVENT_BY_ID: Record<EventId, EventDef> = Object.fromEntries(
  EVENTS.map((e) => [e.id, e]),
);

export const EVENT_COUNT = EVENTS.length;

/**
 * Which catalogue module an event was authored in. The UI uses it to pick a scene image,
 * so it follows the file layout above rather than tags, which overlap freely.
 */
export type EventTheme =
  | 'onboarding'
  | 'survival'
  | 'social'
  | 'facility'
  | 'radio'
  | 'strangers'
  | 'medical'
  | 'environment'
  | 'moral'
  | 'chain'
  | 'meridian';

const THEMED: readonly [EventTheme, readonly EventDef[]][] = [
  ['onboarding', ONBOARDING_EVENTS],
  ['survival', SURVIVAL_EVENTS],
  ['social', SOCIAL_EVENTS],
  ['facility', FACILITY_EVENTS],
  ['radio', RADIO_EVENTS],
  ['strangers', STRANGER_EVENTS],
  ['medical', MEDICAL_EVENTS],
  ['environment', ENVIRONMENT_EVENTS],
  ['moral', MORAL_EVENTS],
  ['chain', CHAIN_EVENTS],
  ['meridian', MERIDIAN_EVENTS],
];

export const EVENT_THEME: Record<EventId, EventTheme> = Object.fromEntries(
  THEMED.flatMap(([theme, events]) => events.map((e) => [e.id, theme] as const)),
);
