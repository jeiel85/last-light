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
