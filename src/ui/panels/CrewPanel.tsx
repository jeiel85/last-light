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
      .map((f) => ({ id: f.id, label: Facilities.facilityDef(f).name }));

  const setJob = (survivor: Survivor, target: string) => {
    const value = target === 'idle' ? null : target;
    const result = assign(survivor.id, value);
    if (!result.ok) {
      notify(result.message ?? 'That assignment is not available.', 'bad');
      return;
    }
    announce(`${survivor.name} assigned to ${target === 'idle' ? 'nothing' : target === 'rest' ? 'rest' : 'work'}.`);
  };

  const idle = living.filter((s) => s.assignment.kind === 'idle');

  return (
    <div className="col gap-3">
      <Guidance id="crew.assign" when={idle.length > 0} title="Nobody works by accident">
        An unassigned survivor does nothing but eat — though idle and resting crew do supply the
        labour that finishes construction. Put people where their skills are: the multiplier beside
        each job shows exactly what that person will produce there, and why.
      </Guidance>

      <Guidance
        id="crew.rest"
        when={living.some((s) => s.fatigue > 60)}
        title="Rest is a job too"
      >
        Above about 50 fatigue people work badly and get hurt more. A day of rest is usually cheaper
        than the injury that follows a week without one.
      </Guidance>

      <Panel
        title="Crew"
        note={`${living.length} alive`}
        actions={
          <label className="inline-field">
            <span className="label">Sort</span>
            <select className="input input-sm" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="name">Name</option>
              <option value="health">Weakest</option>
              <option value="morale">Lowest morale</option>
              <option value="fatigue">Most tired</option>
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
                      {survivor.occupation} · {survivor.age}
                    </span>
                  </span>
                </button>

                <div className="crew-meters">
                  <Meter label="Health" value={survivor.health} />
                  <Meter label="Morale" value={survivor.morale} />
                  <Meter label="Fatigue" value={survivor.fatigue} invert />
                  <Meter label="Hunger" value={survivor.hunger} invert />
                </div>

                {survivor.conditions.length > 0 && (
                  <ul className="cond-list">
                    {survivor.conditions.map((c) => (
                      <li key={c.id} className={c.severity > 55 ? 'tone-bad' : 'tone-warn'}>
                        {CONDITION_BY_ID[c.id]?.name ?? c.id}
                        <span className="num"> {Math.round(c.severity)}</span>
                        {c.treated && <span className="tone-good"> · treated</span>}
                      </li>
                    ))}
                  </ul>
                )}

                <ul className="trait-row">
                  {survivor.traits.slice(0, 4).map((id) => (
                    <li key={id} className="trait-chip" title={TRAIT_BY_ID[id]?.description}>
                      {TRAIT_BY_ID[id]?.name ?? id}
                    </li>
                  ))}
                </ul>

                <div className="crew-assign">
                  {away ? (
                    <span className="tone-info">Away on an expedition</span>
                  ) : (
                    <>
                      <select
                        className="input input-sm grow"
                        value={value}
                        onChange={(e) => setJob(survivor, e.target.value)}
                        aria-label={`Assignment for ${survivor.name}`}
                      >
                        <option value="idle">Unassigned</option>
                        <option value="rest">Rest</option>
                        {jobOptions(survivor).map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <BreakdownPopover breakdown={efficiency} title={`${survivor.name} — work output`}>
                        <span className="num">×{efficiency.total.toFixed(2)}</span>
                      </BreakdownPopover>
                    </>
                  )}
                </div>

                {bond && (
                  <p className="crew-bond tone-muted">
                    {Relationships.bucketLabel(Relationships.bucketOf(bond.value))} with {bond.other.name}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        {living.length === 0 && <EmptyState>There is nobody left.</EmptyState>}
      </Panel>

      {dead.length > 0 && (
        <Panel title="Memorial" note={`${dead.length}`}>
          <ul className="memorial-list">
            {dead.map((survivor) => (
              <li key={survivor.id}>
                <Portrait survivor={survivor} size={28} />
                <span className="grow">
                  {survivor.name} {survivor.surname}
                </span>
                <span className="tone-muted">
                  day {survivor.deathDay} — {survivor.deathCause ?? 'unknown'}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Button block onClick={() => openModal('planner')}>
        Plan an expedition
      </Button>
    </div>
  );
}
