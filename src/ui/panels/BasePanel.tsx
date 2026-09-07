import { useMemo, useState } from 'react';
import { Facilities, RESOURCE_LIST } from '@engine';
import type { BuildSlot, FacilityInstance, ResourceId } from '@engine';
import { useGameStore } from '@store/gameStore';
import { Panel, EmptyState } from '@ui/components/Panel';
import { Button } from '@ui/components/Button';
import { Bar } from '@ui/components/Bar';
import { BreakdownPopover } from '@ui/components/BreakdownPopover';
import { Guidance } from '@ui/components/Guidance';
import { Icon } from '@ui/components/Icon';
import { announce } from '@ui/hooks/announce';

const DECK_NAMES = ['Deck A — entry level', 'Deck B — services', 'Deck C — the deep floor'];

function costText(cost: Partial<Record<ResourceId, number>> | undefined): string {
  if (!cost) return '—';
  const parts = RESOURCE_LIST.filter((r) => (cost[r.id] ?? 0) > 0).map(
    (r) => `${Math.ceil(cost[r.id] ?? 0)} ${r.name.toLowerCase()}`,
  );
  return parts.length ? parts.join(', ') : 'nothing';
}

/**
 * The base panel is a cross-section, not a list: where a facility sits matters (decks
 * gate what can be built) and a picture of a half-collapsed shelter says more about the
 * player's situation than a table of rows would.
 */
export function BasePanel() {
  const state = useGameStore((s) => s.state)!;
  const build = useGameStore((s) => s.build);
  const upgrade = useGameStore((s) => s.upgrade);
  const repair = useGameStore((s) => s.repair);
  const demolish = useGameStore((s) => s.demolish);
  const clearSlot = useGameStore((s) => s.clearSlot);
  const setPriority = useGameStore((s) => s.setPriority);
  const notify = useGameStore((s) => s.notify);

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const power = useMemo(() => Facilities.powerReport(state), [state]);
  const buildable = useMemo(() => Facilities.buildableFacilities(state), [state]);

  const bySlot = new Map<string, FacilityInstance>();
  for (const f of state.facilities) bySlot.set(f.slotId, f);

  const slot = selectedSlot ? state.slots.find((s) => s.id === selectedSlot) : null;
  const occupant = slot ? bySlot.get(slot.id) : undefined;

  const decks = [0, 1, 2].map((deck) => state.slots.filter((s) => s.deck === deck));

  const act = (result: { ok: boolean; message?: string }) => {
    notify(result.message ?? (result.ok ? 'Done.' : 'That is not possible right now.'), result.ok ? 'good' : 'bad');
    if (result.ok) announce(result.message ?? 'Done.');
  };

  return (
    <div className="col gap-3">
      <Guidance id="base.build" title="Pick a slot, then a facility">
        Every facility needs a slot on a deck that permits it. Building charges the materials at
        once and then takes days of labour from whoever is not otherwise busy.
      </Guidance>

      <Guidance id="base.power" when={power.deficit > 0} title="The lights are going out somewhere">
        Demand is above supply, so the lowest-priority facilities are being browned out. Raise the
        reactor, lower your draw, or decide what you are willing to lose using the priorities below.
      </Guidance>

      <Panel
        title="Vault Meridian"
        note={`${state.facilities.length} facilities · ${Math.round(power.demand.total)}/${Math.round(power.capacity.total)} kW`}
      >
        <div className="vault">
          {decks.map((slots, deck) => (
            <div key={deck} className="vault-deck">
              <span className="vault-deck-label label">{DECK_NAMES[deck]}</span>
              <div className="vault-slots">
                {slots.map((s) => (
                  <SlotCell
                    key={s.id}
                    slot={s}
                    facility={bySlot.get(s.id)}
                    active={s.id === selectedSlot}
                    brownedOut={power.brownedOut.includes(bySlot.get(s.id)?.id ?? '')}
                    onSelect={() => setSelectedSlot(s.id === selectedSlot ? null : s.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {slot && (
        <Panel
          title={occupant ? Facilities.facilityDef(occupant).name : 'Empty slot'}
          note={slot.id}
          actions={
            <Button size="sm" tone="ghost" onClick={() => setSelectedSlot(null)}>
              Close
            </Button>
          }
        >
          {slot.sealed && !occupant && (
            <>
              <p className="prose">
                This part of the deck is behind a collapse. Clearing it costs {slot.clearCost} components and
                takes several days of labour.
              </p>
              <Bar value={slot.clearProgress / Math.max(1, slot.clearLabour)} colour="var(--rust)" />
              <Button onClick={() => act(clearSlot(slot.id))}>Start clearing</Button>
            </>
          )}

          {occupant && <FacilityDetail facility={occupant} onUpgrade={() => act(upgrade(occupant.id))} onRepair={() => act(repair(occupant.id))} onDemolish={() => act(demolish(occupant.id))} onPriority={(p) => setPriority(occupant.id, p)} />}

          {!occupant && !slot.sealed && (
            <ul className="build-list">
              {buildable.map(({ def, check }) => {
                const permitted = def.decks.includes(slot.deck);
                const level = def.levels[0];
                return (
                  <li key={def.id} className={`build-row ${!permitted || !check.ok ? 'build-row-off' : ''}`}>
                    <Icon name={def.icon} size={20} className="build-icon" />
                    <span className="col grow">
                      <span className="build-name">{def.name}</span>
                      <span className="build-desc tone-muted">{level.summary}</span>
                      <span className="build-cost mono">
                        {costText(level.buildCost)} · {level.labour} labour · {level.powerDraw} kW
                      </span>
                    </span>
                    <Button
                      size="sm"
                      disabled={!permitted || !check.ok}
                      title={!permitted ? 'Not permitted on this deck' : check.reason}
                      onClick={() => act(build(def.id, slot.id))}
                    >
                      {permitted ? (check.ok ? 'Build' : (check.reason ?? 'Unavailable')) : 'Wrong deck'}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      )}

      <Panel title="Power priority" note={power.deficit > 0 ? `${Math.round(power.deficit)} kW short` : 'balanced'}>
        <p className="hint">
          When supply falls short, the lowest priority facilities are browned out first. Set what you are
          willing to lose.
        </p>
        {state.facilities.length === 0 && <EmptyState>Nothing built yet.</EmptyState>}
        <ul className="priority-list">
          {state.facilities
            .slice()
            .sort((a, b) => b.priority - a.priority)
            .map((facility) => {
              const def = Facilities.facilityDef(facility);
              return (
                <li key={facility.id} className={facility.brownedOut ? 'tone-bad' : ''}>
                  <span className="grow truncate">
                    {def.name} <span className="tone-muted">L{facility.level}</span>
                  </span>
                  <span className="mono">{def.levels[facility.level - 1]?.powerDraw ?? 0} kW</span>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={facility.priority}
                    onChange={(e) => setPriority(facility.id, Number(e.target.value))}
                    aria-label={`Power priority for ${def.name}`}
                  />
                  <span className="num">{facility.priority}</span>
                </li>
              );
            })}
        </ul>
        <div className="row gap-2">
          <BreakdownPopover breakdown={power.capacity} title="Power capacity" unit="kW">
            <span className="num">supply {Math.round(power.capacity.total)}</span>
          </BreakdownPopover>
          <BreakdownPopover breakdown={power.demand} title="Power demand" unit="kW">
            <span className="num">draw {Math.round(power.demand.total)}</span>
          </BreakdownPopover>
        </div>
      </Panel>
    </div>
  );
}

function SlotCell({
  slot,
  facility,
  active,
  brownedOut,
  onSelect,
}: {
  slot: BuildSlot;
  facility: FacilityInstance | undefined;
  active: boolean;
  brownedOut: boolean;
  onSelect: () => void;
}) {
  const def = facility ? Facilities.facilityDef(facility) : null;
  const classes = [
    'slot',
    active ? 'slot-active' : '',
    facility ? 'slot-built' : slot.sealed ? 'slot-sealed' : 'slot-empty',
    facility?.status === 'damaged' ? 'slot-damaged' : '',
    facility?.status === 'building' ? 'slot-building' : '',
    brownedOut ? 'slot-brownout' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={classes} onClick={onSelect} aria-pressed={active}>
      <span className="slot-icon">
        {def ? <Icon name={def.icon} size={22} /> : <Icon name={slot.sealed ? 'warning' : 'more'} size={18} />}
      </span>
      <span className="slot-name truncate">{def ? def.name : slot.sealed ? 'Collapsed' : 'Empty'}</span>
      {facility && (
        <>
          <span className="slot-level mono">L{facility.level}</span>
          {facility.status === 'building' && (
            <Bar value={facility.progress / Math.max(1, facility.progressRequired)} colour="var(--ice)" height={3} />
          )}
          {facility.status !== 'building' && (
            <Bar
              value={facility.condition / 100}
              colour={facility.condition < 40 ? 'var(--alarm)' : 'var(--phosphor-dim)'}
              height={3}
            />
          )}
          <span className="slot-staff mono">
            {facility.staff.length}/{Facilities.staffSlots(facility)}
          </span>
        </>
      )}
    </button>
  );
}

function FacilityDetail({
  facility,
  onUpgrade,
  onRepair,
  onDemolish,
  onPriority,
}: {
  facility: FacilityInstance;
  onUpgrade: () => void;
  onRepair: () => void;
  onDemolish: () => void;
  onPriority: (p: number) => void;
}) {
  const state = useGameStore((s) => s.state)!;
  const def = Facilities.facilityDef(facility);
  const level = def.levels[facility.level - 1];
  const next = def.levels[facility.level];
  const upgradeCheck = Facilities.canUpgrade(state, facility.id);
  const repairNeeded = facility.condition < 100 || facility.status === 'damaged';
  const repairPrice = Facilities.repairCost(facility);

  return (
    <>
      <p className="prose">{def.description}</p>
      <ul className="kv">
        <li>
          <span>Level</span>
          <span className="num">{facility.level} / 3</span>
        </li>
        <li>
          <span>Condition</span>
          <span className={`num ${facility.condition < 40 ? 'tone-bad' : ''}`}>
            {Math.round(facility.condition)}%
          </span>
        </li>
        <li>
          <span>Status</span>
          <span className={facility.status === 'operational' ? 'tone-good' : 'tone-warn'}>{facility.status}</span>
        </li>
        <li>
          <span>Staff</span>
          <span className="num">
            {facility.staff.length} / {Facilities.staffSlots(facility)}
          </span>
        </li>
        <li>
          <span>Power draw</span>
          <span className="num">{level?.powerDraw ?? 0} kW</span>
        </li>
      </ul>

      {facility.status === 'building' && (
        <>
          <p className="hint">
            {facility.upgradingTo ? `Upgrading to level ${facility.upgradingTo}.` : 'Under construction.'} Progress
            comes from unassigned and resting crew.
          </p>
          <Bar value={facility.progress / Math.max(1, facility.progressRequired)} colour="var(--ice)" height={6} />
        </>
      )}

      <p className="prose">{level?.summary}</p>
      {next && <p className="hint">Next level: {next.summary}</p>}

      <div className="row gap-2 wrap">
        {next && (
          <Button
            disabled={!upgradeCheck.ok}
            title={upgradeCheck.reason ?? `Costs ${costText(next.buildCost)}`}
            onClick={onUpgrade}
          >
            Upgrade — {costText(next.buildCost)}
          </Button>
        )}
        {repairNeeded && (
          <Button onClick={onRepair} title={`Costs ${repairPrice.components} components`}>
            Repair — {repairPrice.components} components
          </Button>
        )}
        <Button tone="danger" onClick={onDemolish}>
          Demolish
        </Button>
        <label className="inline-field">
          <span className="label">Priority</span>
          <input
            type="number"
            className="input input-sm input-num"
            min={0}
            max={10}
            value={facility.priority}
            onChange={(e) => onPriority(Number(e.target.value))}
          />
        </label>
      </div>
    </>
  );
}
