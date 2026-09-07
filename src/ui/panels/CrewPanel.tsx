import { useMemo, useState } from 'react';
import {
  CONDITION_BY_ID,
  Facilities,
  Relationships,
  Survivors,
  TRAIT_BY_ID,
  closestBond,
} from '@engine';
import type { Survivor } from '@engine';
import { useGameStore } from '@store/gameStore';
import { useUiStore } from '@store/uiStore';
import { Panel, EmptyState } from '@ui/components/Panel';
import { Meter } from '@ui/components/Stat';
import { Portrait } from '@ui/components/Portrait';
import { Button } from '@ui/components/Button';
import { BreakdownPopover } from '@ui/components/BreakdownPopover';
import { Guidance } from '@ui/components/Guidance';
import { announce } from '@ui/hooks/announce';
import { useT } from '@ui/hooks/useTranslation';
import { bondLabel, occupationOf } from '@ui/lib/labels';
import { conditionDescription, conditionName, facilityName, traitDescription, traitName } from '@i18n/content';

type Sort = 'name' | 'health' | 'morale' | 'fatigue';

/**
 * The crew panel is an assignment board first and a roster second: the most common action
 * in the game is moving a person from one job to another, so that lives on the card.
 */
export function CrewPanel() {
  const state = useGameStore((s) => s.state)!;
  const assign = useGameStore((s) => s.assign);
  const notify = useGameStore((s) => s.notify);
  const selectSurvivor = useUiStore((s) => s.selectSurvivor);
  const openModal = useUiStore((s) => s.openModal);
  const [sort, setSort] = useState<Sort>('name');
  const t = useT();

  const living = useMemo(() => {
    const list = Survivors.livingSurvivors(state).slice();
    list.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'health') return a.health - b.health;
      if (sort === 'morale') return a.morale - b.morale;
      return b.fatigue - a.fatigue;
    });
    return list;
  }, [state, sort]);

  const dead = state.survivors.filter((s) => !s.alive);

  /* Only facilities with a free chair, plus the two universal assignments. */
  const jobOptions = (survivor: Survivor) =>
    state.facilities
      .filter((f) => f.status !== 'building')
      .filter((f) => Facilities.staffSlots(f) > 0)
      .filter((f) => f.staff.length < Facilities.staffSlots(f) || f.staff.includes(survivor.id))
      .map((f) => ({ id: f.id, label: facilityName(Facilities.facilityDef(f)) }));

  const setJob = (survivor: Survivor, target: string) => {
    const value = target === 'idle' ? null : target;
    const result = assign(survivor.id, value);
    if (!result.ok) {
      notify(result.message ?? t('crew.assignFailed'), 'bad');
      return;
    }
    const job =
      target === 'idle'
        ? t('crew.jobNothing')
        : target === 'rest'
          ? t('crew.jobRest')
          : t('crew.jobWork');
    announce(t('crew.assigned', { name: survivor.name, job }));
  };

  const idle = living.filter((s) => s.assignment.kind === 'idle');

  return (
    <div className="col gap-3">
      <Guidance
        notes={[
          {
            id: 'crew.assign',
            when: idle.length > 0,
            title: t('guidance.assign.title'),
            body: t('guidance.assign.body'),
          },
          {
            id: 'crew.rest',
            when: living.some((s) => s.fatigue > 60),
            title: t('guidance.rest.title'),
            body: t('guidance.rest.body'),
          },
        ]}
      />

      <Panel
        title={t('crew.title')}
        note={t('crew.alive', { count: living.length })}
        actions={
          <label className="inline-field">
            <span className="label">{t('crew.sort')}</span>
            <select
              className="input input-sm"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label={t('crew.sort')}
            >
              <option value="name">{t('crew.sort.name')}</option>
              <option value="health">{t('crew.sort.health')}</option>
              <option value="morale">{t('crew.sort.morale')}</option>
              <option value="fatigue">{t('crew.sort.fatigue')}</option>
            </select>
          </label>
        }
      >
        <ul className="crew-grid">
          {living.map((survivor) => {
            const facility =
              survivor.assignment.kind === 'facility' && survivor.assignment.facilityId
                ? state.facilities.find((f) => f.id === survivor.assignment.facilityId)
                : undefined;
            const def = facility ? Facilities.facilityDef(facility) : undefined;
            const efficiency = Survivors.workEfficiency(survivor, def?.skill, {
              ...(facility ? { facility } : {}),
              ...(def ? { facilityDef: def } : {}),
              coworkers: facility
                ? facility.staff
                    .filter((id) => id !== survivor.id)
                    .map((id) => state.survivors.find((s) => s.id === id))
                    .filter((s): s is Survivor => Boolean(s))
                : [],
              relationships: state.relationships,
              brownedOut: facility?.brownedOut ?? false,
            });
            const bond = closestBond(state, survivor);
            const away = survivor.assignment.kind === 'expedition';
            const value = away
              ? 'expedition'
              : survivor.assignment.kind === 'rest'
                ? 'rest'
                : (facility?.id ?? 'idle');

            return (
              <li key={survivor.id} className={`crew-card ${away ? 'crew-card-away' : ''}`}>
                <button
                  type="button"
                  className="crew-card-head"
                  onClick={() => {
                    selectSurvivor(survivor.id);
                    openModal('survivor', survivor.id);
                  }}
                >
                  <Portrait survivor={survivor} size={44} />
                  <span className="col grow">
                    <span className="crew-name">
                      {survivor.name} {survivor.surname}
                    </span>
                    <span className="crew-role tone-muted truncate">
                      {occupationOf(survivor)} · {survivor.age}
                    </span>
                  </span>
                </button>

                <div className="crew-meters">
                  <Meter label={t('meter.health')} value={survivor.health} />
                  <Meter label={t('meter.morale')} value={survivor.morale} />
                  <Meter label={t('meter.fatigue')} value={survivor.fatigue} invert />
                  <Meter label={t('meter.hunger')} value={survivor.hunger} invert />
                </div>

                {survivor.conditions.length > 0 && (
                  <ul className="cond-list">
                    {survivor.conditions.map((c) => {
                      const cond = CONDITION_BY_ID[c.id];
                      return (
                        <li
                          key={c.id}
                          className={c.severity > 55 ? 'tone-bad' : 'tone-warn'}
                          title={cond ? conditionDescription(cond) : undefined}
                        >
                          {cond ? conditionName(cond) : c.id}
                          <span className="num"> {Math.round(c.severity)}</span>
                          {c.treated && <span className="tone-good">{t('crew.treated')}</span>}
                        </li>
                      );
                    })}
                  </ul>
                )}

                <ul className="trait-row">
                  {survivor.traits.slice(0, 4).map((id) => {
                    const trait = TRAIT_BY_ID[id];
                    return (
                      <li
                        key={id}
                        className="trait-chip"
                        title={trait ? traitDescription(trait) : undefined}
                      >
                        {trait ? traitName(trait) : id}
                      </li>
                    );
                  })}
                </ul>

                <div className="crew-assign">
                  {away ? (
                    <span className="tone-info">{t('crew.away')}</span>
                  ) : (
                    <>
                      <select
                        className="input input-sm grow"
                        value={value}
                        onChange={(e) => setJob(survivor, e.target.value)}
                        aria-label={t('crew.assignmentFor', { name: survivor.name })}
                      >
                        <option value="idle">{t('crew.unassigned')}</option>
                        <option value="rest">{t('crew.rest')}</option>
                        {jobOptions(survivor).map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <BreakdownPopover
                        breakdown={efficiency}
                        title={t('crew.workOutput', { name: survivor.name })}
                      >
                        <span className="num">×{efficiency.total.toFixed(2)}</span>
                      </BreakdownPopover>
                    </>
                  )}
                </div>

                {bond && (
                  <p className="crew-bond tone-muted">
                    {t('crew.bond', {
                      bucket: bondLabel(Relationships.bucketOf(bond.value)),
                      name: bond.other.name,
                    })}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        {living.length === 0 && <EmptyState>{t('crew.empty')}</EmptyState>}
      </Panel>

      {dead.length > 0 && (
        <Panel title={t('crew.memorial')} note={`${dead.length}`}>
          <ul className="memorial-list">
            {dead.map((survivor) => (
              <li key={survivor.id}>
                <Portrait survivor={survivor} size={28} />
                <span className="grow">
                  {survivor.name} {survivor.surname}
                </span>
                <span className="tone-muted">
                  {t('crew.diedOn', {
                    day: survivor.deathDay ?? 0,
                    cause: survivor.deathCause ?? '—',
                  })}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Button block onClick={() => openModal('planner')}>
        {t('crew.planExpedition')}
      </Button>
    </div>
  );
}
