import { useMemo, useState } from 'react';
import { ARCHETYPE_BY_ID, Expedition, RESOURCES } from '@engine';
import type { ResourceId } from '@engine';
import { useGameStore } from '@store/gameStore';
import { Modal } from '@ui/components/Modal';
import { Button } from '@ui/components/Button';
import { playCue } from '@ui/audio/cues';
import { Icon } from '@ui/components/Icon';
import { announce } from '@ui/hooks/announce';

/**
 * Interactive expedition resolution.
 *
 * Each beat is a small scene with gated options; the gate reasons are shown rather than
 * hidden, so a team that packed badly learns exactly what it should have brought.
 */
export function ExpeditionModal() {
  const state = useGameStore((s) => s.state)!;
  const resolveBeat = useGameStore((s) => s.resolveBeat);
  const closeExpedition = useGameStore((s) => s.closeExpedition);
  const notify = useGameStore((s) => s.notify);
  const [showLog, setShowLog] = useState(false);

  const expedition = state.expeditions.find((e) => e.id === state.activeExpeditionId);
  const beat = useMemo(() => Expedition.currentBeat(state), [state]);

  if (!expedition) return null;

  const location = state.world.locations.find((l) => l.id === expedition.locationId);
  const archetype = location ? ARCHETYPE_BY_ID[location.archetypeId] : undefined;
  const team = expedition.members
    .map((id) => state.survivors.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const last = expedition.log[expedition.log.length - 1];

  const choose = (choiceId: string) => {
    const result = resolveBeat(choiceId);
    if (!result.ok) {
      notify(result.message ?? 'That option is not available.', 'bad');
      return;
    }
    playCue('tick');
    announce('Outcome resolved.');
  };

  const header = (
    <div className="exped-head">
      <span className="exped-loc">
        <Icon name={archetype?.icon ?? 'hatch'} size={16} /> {location?.name ?? 'Somewhere out there'}
      </span>
      <span className="mono tone-muted">
        beat {expedition.log.length + 1}
        {beat ? ` / ${beat.total}` : ''}
      </span>
      <span className="mono tone-muted">
        ammo {Math.round(expedition.loadout.ammo)} · rations {Math.round(expedition.loadout.rations)}
      </span>
    </div>
  );

  /*
   * The team has finished but the phase has not caught up yet — normally a single frame.
   * It gets an explicit way forward regardless: a modal with no footer and no close button
   * is a screen the player cannot leave, and "unreachable in normal play" is not a good
   * enough reason to ship one.
   */
  if (!beat) {
    const haul = Object.entries(expedition.haulResources).filter(([, amount]) => (amount ?? 0) > 0);
    return (
      <Modal
        title="The team is coming back"
        onClose={closeExpedition}
        size="normal"
        footer={
          <Button tone="primary" onClick={closeExpedition} data-autofocus>
            Carry on
          </Button>
        }
      >
        {header}
        <p className="prose">
          {expedition.aborted
            ? 'They turned around early. Whatever they had already gathered comes home with them.'
            : 'The site is done. They start the walk back with what they could carry.'}
        </p>
        {haul.length > 0 && (
          <ul className="haul-list">
            {haul.map(([id, amount]) => (
              <li key={id}>
                <span>{RESOURCES[id as ResourceId]?.name ?? id}</span>
                <span className="num">+{Math.round(amount ?? 0)}</span>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    );
  }

  return (
    <Modal
      title={beat.encounter.title}
      dismissible={false}
      size="normal"
      footer={
        <div className="row gap-2 grow">
          <span className="exped-team">
            {team.map((s) => (
              <span key={s.id} className={s.health < 45 ? 'tone-bad' : ''}>
                {s.name}
              </span>
            ))}
          </span>
          <Button size="sm" tone="ghost" className="right" onClick={() => setShowLog((v) => !v)}>
            {showLog ? 'Hide log' : `Log (${expedition.log.length})`}
          </Button>
        </div>
      }
    >
      {header}
      {last && !showLog && (
        <p className={`exped-last tone-${last.tone === 'neutral' ? 'muted' : last.tone}`}>{last.outcomeText}</p>
      )}
      {showLog && (
        <ol className="exped-log">
          {expedition.log.map((entry, i) => (
            <li key={i} className={`tone-${entry.tone === 'neutral' ? 'muted' : entry.tone}`}>
              <strong>{entry.title}</strong> — {entry.choiceLabel}
              <br />
              {entry.outcomeText}
              {entry.roll && (
                <span className="mono roll">
                  {' '}
                  ({entry.roll.actor} {entry.roll.skill} {entry.roll.value} vs {entry.roll.target} —{' '}
                  {entry.roll.success ? 'passed' : 'failed'})
                </span>
              )}
            </li>
          ))}
        </ol>
      )}

      <p className="prose event-body">{beat.encounter.text}</p>

      <ul className="choice-stack">
        {beat.choices.map(({ choice, enabled, reason }, index) => (
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
                {choice.check && (
                  <span className="tone-info">
                    {choice.check.skill} vs {choice.check.target} · {choice.check.actor}
                  </span>
                )}
                {choice.requiresAmmo && <span className="tone-muted">{choice.requiresAmmo} ammo</span>}
                {!enabled && reason && <span className="tone-bad">{reason}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
