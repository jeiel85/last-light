import { useMemo, useState } from 'react';
import { presentEvent, RESOURCES } from '@engine';
import type { EventResolution } from '@engine';
import { useGameStore } from '@store/gameStore';
import { Modal } from '@ui/components/Modal';
import { Button } from '@ui/components/Button';
import { Portrait } from '@ui/components/Portrait';
import { announce } from '@ui/hooks/announce';
import { playCue } from '@ui/audio/cues';
import { useT } from '@ui/hooks/useTranslation';
import { occupationOf } from '@ui/lib/labels';
import { eventBody, eventChoiceText, eventTitle, resourceName, skillName } from '@i18n/content';

/**
 * The event modal is where the game asks its questions.
 *
 * Costs and success chances are shown before the choice is made and never after the fact,
 * because "no opaque deaths" is a design pillar: a player who loses someone should be able
 * to point at the number they accepted.
 */
export function EventModal() {
  const state = useGameStore((s) => s.state)!;
  const resolve = useGameStore((s) => s.resolveEvent);
  const notify = useGameStore((s) => s.notify);
  const [outcome, setOutcome] = useState<EventResolution | null>(null);
  const t = useT();

  // `presentEvent` is pure, so it is safe to call during render against a frozen draft.
  const presentation = useMemo(() => presentEvent(state), [state]);

  if (!presentation) return null;
  const { event, actor, choices, remaining } = presentation;

  const choose = (choiceId: string) => {
    const result = resolve(choiceId);
    if (!result) return;
    if (!result.ok) {
      notify(result.reason ?? t('event.unavailable'), 'bad');
      return;
    }
    setOutcome(result);
    playCue(result.success === false ? 'bad' : result.success === true ? 'good' : 'tick');
    announce(result.resultText);
  };

  if (outcome) {
    return (
      <Modal
        title={eventTitle(event)}
        subtitle={
          outcome.success === undefined
            ? undefined
            : outcome.success
              ? t('event.worked')
              : t('event.didNotWork')
        }
        dismissible={false}
        size="narrow"
        footer={
          <Button tone="primary" onClick={() => setOutcome(null)} data-autofocus>
            {outcome.hasMore ? t('event.next') : t('event.carryOn')}
          </Button>
        }
      >
        <p className="prose">{outcome.resultText}</p>
        {outcome.rollDetail && (
          <p className="roll mono">
            {t('event.roll', {
              actor: outcome.rollDetail.actor,
              skill: skillName(outcome.rollDetail.skill, outcome.rollDetail.skill),
              roll: outcome.rollDetail.roll,
              bonus: outcome.rollDetail.total - outcome.rollDetail.roll,
              target: outcome.rollDetail.target,
            })}
          </p>
        )}
        {outcome.notes.length > 0 && (
          <ul className="note-list">
            {outcome.notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        )}
      </Modal>
    );
  }

  return (
    <Modal
      title={eventTitle(event)}
      subtitle={remaining > 1 ? t('event.remaining', { count: remaining }) : undefined}
      dismissible={false}
      size="narrow"
    >
      {actor && (
        <div className="event-actor">
          <Portrait survivor={actor} size={40} />
          <span className="col">
            <strong>
              {actor.name} {actor.surname}
            </strong>
            <span className="tone-muted">{occupationOf(actor)}</span>
          </span>
        </div>
      )}
      <p className="prose event-body">{eventBody(event)}</p>
      <ul className="choice-stack">
        {choices.map(({ choice, enabled, reason, successChance, checkActor }, index) => {
          const text = eventChoiceText(event, choice);
          return (
          <li key={choice.id}>
            <button
              type="button"
              className={`event-choice ${enabled ? '' : 'event-choice-off'}`}
              disabled={!enabled}
              onClick={() => choose(choice.id)}
              {...(index === 0 ? { 'data-autofocus': true } : {})}
            >
              <span className="event-choice-label">{text.label}</span>
              {text.hint && <span className="event-choice-hint">{text.hint}</span>}
              <span className="event-choice-meta mono">
                {successChance !== null && (
                  <span className={successChance < 0.4 ? 'tone-bad' : successChance > 0.75 ? 'tone-good' : 'tone-warn'}>
                    {Math.round(successChance * 100)}% {checkActor ? `· ${checkActor}` : ''}
                  </span>
                )}
                {choice.cost?.resources &&
                  Object.entries(choice.cost.resources).map(([id, amount]) => {
                    const def = RESOURCES[id as keyof typeof RESOURCES];
                    return (
                      <span key={id} className="tone-muted">
                        −{Math.round(amount ?? 0)} {def ? resourceName(def) : id}
                      </span>
                    );
                  })}
                {!enabled && reason && <span className="tone-bad">{reason}</span>}
              </span>
            </button>
          </li>
          );
        })}
      </ul>
    </Modal>
  );
}
