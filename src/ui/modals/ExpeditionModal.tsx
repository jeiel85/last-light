import { useMemo, useState } from 'react';
import { ARCHETYPE_BY_ID, Expedition, RESOURCES } from '@engine';
import type { ResourceId } from '@engine';
import { useGameStore } from '@store/gameStore';
import { Modal } from '@ui/components/Modal';
import { Button } from '@ui/components/Button';
import { playCue } from '@ui/audio/cues';
import { Icon } from '@ui/components/Icon';
import { announce } from '@ui/hooks/announce';
import { useT } from '@ui/hooks/useTranslation';
import { siteName } from '@ui/lib/labels';
import {
  encounterChoiceText,
  encounterText,
  encounterTitle,
  resourceName,
  skillName,
} from '@i18n/content';

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
  const t = useT();

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
      notify(result.message ?? t('exped.unavailableChoice'), 'bad');
      return;
    }
    playCue('tick');
    announce(t('event.outcomeAnnounced'));
  };

  const header = (
    <div className="exped-head">
      <span className="exped-loc">
        <Icon name={archetype?.icon ?? 'hatch'} size={16} />{' '}
        {location ? siteName(location) : t('exped.somewhere')}
      </span>
      <span className="mono tone-muted">
        {beat
          ? t('exped.beatOf', { index: expedition.log.length + 1, total: beat.total })
          : t('exped.beat', { index: expedition.log.length + 1 })}
      </span>
      <span className="mono tone-muted">
        {t('exped.supplies', {
          ammo: Math.round(expedition.loadout.ammo),
          rations: Math.round(expedition.loadout.rations),
        })}
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
        title={t('exped.returning')}
        onClose={closeExpedition}
        size="normal"
        footer={
          <Button tone="primary" onClick={closeExpedition} data-autofocus>
            {t('event.carryOn')}
          </Button>
        }
      >
        {header}
        <p className="prose">
          {expedition.aborted ? t('exped.aborted') : t('exped.finished')}
        </p>
        {haul.length > 0 && (
          <ul className="haul-list">
            {haul.map(([id, amount]) => (
              <li key={id}>
                <span>
                  {(() => {
                    const def = RESOURCES[id as ResourceId];
                    return def ? resourceName(def) : id;
                  })()}
                </span>
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
      title={encounterTitle(beat.encounter)}
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
            {showLog ? t('exped.hideLog') : t('exped.showLog', { count: expedition.log.length })}
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
                  {t('exped.rollDetail', {
                    actor: entry.roll.actor,
                    skill: skillName(entry.roll.skill, entry.roll.skill),
                    value: entry.roll.value,
                    target: entry.roll.target,
                    result: entry.roll.success ? t('exped.passed') : t('exped.failed'),
                  })}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}

      <p className="prose event-body">{encounterText(beat.encounter)}</p>

      <ul className="choice-stack">
        {beat.choices.map(({ choice, enabled, reason }, index) => {
          const text = encounterChoiceText(beat.encounter, choice);
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
                {choice.check && (
                  <span className="tone-info">
                    {skillName(choice.check.skill, choice.check.skill)} vs {choice.check.target} ·{' '}
                    {choice.check.actor}
                  </span>
                )}
                {choice.requiresAmmo && (
                  <span className="tone-muted">
                    {t('exped.ammoCost', { count: choice.requiresAmmo })}
                  </span>
                )}
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
