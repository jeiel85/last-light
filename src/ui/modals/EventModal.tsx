import { useMemo, useState } from 'react';
import { presentEvent } from '@engine';
import type { EventResolution } from '@engine';
import { useGameStore } from '@store/gameStore';
import { Modal } from '@ui/components/Modal';
import { Button } from '@ui/components/Button';
import { Portrait } from '@ui/components/Portrait';
import { announce } from '@ui/hooks/announce';
import { playCue } from '@ui/audio/cues';

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

  // `presentEvent` is pure, so it is safe to call during render against a frozen draft.
  const presentation = useMemo(() => presentEvent(state), [state]);

  if (!presentation) return null;
  const { event, actor, choices, remaining } = presentation;

  const choose = (choiceId: string) => {
    const result = resolve(choiceId);
    if (!result) return;
    if (!result.ok) {
      notify(result.reason ?? 'That is not available.', 'bad');
      return;
    }
    setOutcome(result);
    playCue(result.success === false ? 'bad' : result.success === true ? 'good' : 'tick');
    announce(result.resultText);
  };

  if (outcome) {
    return (
      <Modal
        title={event.title}
        subtitle={outcome.success === undefined ? undefined : outcome.success ? 'It worked.' : 'It did not work.'}
        dismissible={false}
        size="narrow"
        footer={
          <Button tone="primary" onClick={() => setOutcome(null)} data-autofocus>
            {outcome.hasMore ? 'Next' : 'Carry on'}
          </Button>
        }
      >
        <p className="prose">{outcome.resultText}</p>
        {outcome.rollDetail && (
          <p className="roll mono">
            {outcome.rollDetail.actor} · {outcome.rollDetail.skill} · rolled {outcome.rollDetail.roll} +{' '}
            {outcome.rollDetail.total - outcome.rollDetail.roll} vs {outcome.rollDetail.target}
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
      title={event.title}
      subtitle={remaining > 1 ? `${remaining} things need answering tonight` : undefined}
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
            <span className="tone-muted">{actor.occupation}</span>
          </span>
        </div>
      )}
      <p className="prose event-body">{event.body}</p>
      <ul className="choice-stack">
        {choices.map(({ choice, enabled, reason, successChance, checkActor }, index) => (
          <li key={choice.id}>
            <button
              type="button"
              className={`event-choice ${enabled ? '' : 'event-choice-off'}`}
              disabled={!enabled}
              onClick={() => choose(choice.id)}
              {...(index === 0 ? { 'data-autofocus': true } : {})}
            >
              <span className="event-choice-label">{choice.label}</span>
              {choice.hint && <span className="event-choice-hint">{choice.hint}</span>}
              <span className="event-choice-meta mono">
                {successChance !== null && (
                  <span className={successChance < 0.4 ? 'tone-bad' : successChance > 0.75 ? 'tone-good' : 'tone-warn'}>
                    {Math.round(successChance * 100)}% {checkActor ? `· ${checkActor}` : ''}
                  </span>
                )}
                {choice.cost?.resources &&
                  Object.entries(choice.cost.resources).map(([id, amount]) => (
                    <span key={id} className="tone-muted">
                      −{Math.round(amount ?? 0)} {id}
                    </span>
                  ))}
                {!enabled && reason && <span className="tone-bad">{reason}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
