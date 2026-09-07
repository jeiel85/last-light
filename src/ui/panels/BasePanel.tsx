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
import { useT } from '@ui/hooks/useTranslation';
import { t } from '@i18n';
import {
  facilityDescription,
  facilityLevelSummary,
  facilityName,
  resourceName,
} from '@i18n/content';

const DECK_KEYS = ['base.deck0', 'base.deck1', 'base.deck2'] as const;

/**
 * "12 components, 3 fuel" — the shopping list for a build or an upgrade.
 *
 * The lowercase is for English running text and is a no-op in scripts that have no case,
 * which is why it survives translation rather than being spelled out per locale.
 */
function costText(cost: Partial<Record<ResourceId, number>> | undefined): string {
  if (!cost) return '—';
  const parts = RESOURCE_LIST.filter((r) => (cost[r.id] ?? 0) > 0).map(
    (r) => `${Math.ceil(cost[r.id] ?? 0)} ${resourceName(r).toLowerCase()}`,
  );
  return parts.length ? parts.join(', ') : t('base.costNothing');
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
  const t = useT();

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const power = useMemo(() => Facilities.powerReport(state), [state]);
  const buildable = useMemo(() => Facilities.buildableFacilities(state), [state]);

  const bySlot = new Map<string, FacilityInstance>();
  for (const f of state.facilities) bySlot.set(f.slotId, f);

  const slot = selectedSlot ? state.slots.find((s) => s.id === selectedSlot) : null;
  const occupant = slot ? bySlot.get(slot.id) : undefined;

  const decks = [0, 1, 2].map((deck) => state.slots.filter((s) => s.deck === deck));

  const act = (result: { ok: boolean; message?: string }) => {
    const fallback = result.ok ? t('base.done') : t('base.notPossible');
    notify(result.message ?? fallback, result.ok ? 'good' : 'bad');
    if (result.ok) announce(result.message ?? fallback);
  };

  return (
    <div className="col gap-3">
      <Guidance
        notes={[
          {
            id: 'base.power',
            when: power.deficit > 0,
            title: t('guidance.power.title'),
            body: t('guidance.power.body'),
          },
          {
            id: 'base.build',
            title: t('guidance.build.title'),
            body: t('guidance.build.body'),
          },
        ]}
      />

      <Panel
        title={t('base.title')}
        note={t('base.note', {
          facilities: state.facilities.length,
          draw: Math.round(power.demand.total),
          supply: Math.round(power.capacity.total),
        })}
      >
        <div className="vault">
          {decks.map((slots, deck) => (
            <div key={deck} className="vault-deck">
              <span className="vault-deck-label label">{t(DECK_KEYS[deck]!)}</span>
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
          title={occupant ? facilityName(Facilities.facilityDef(occupant)) : t('base.emptySlot')}
          note={slot.id}
          actions={
            <Button size="sm" tone="ghost" onClick={() => setSelectedSlot(null)}>
              {t('base.close')}
            </Button>
          }
        >
          {slot.sealed && !occupant && (
            <>
              <p className="prose">{t('base.clearBlurb', { cost: slot.clearCost })}</p>
              <Bar value={slot.clearProgress / Math.max(1, slot.clearLabour)} colour="var(--rust)" />
              <Button onClick={() => act(clearSlot(slot.id))}>{t('base.startClearing')}</Button>
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
                      <span className="build-name">{facilityName(def)}</span>
                      <span className="build-desc tone-muted">{facilityLevelSummary(def, 1)}</span>
                      <span className="build-cost mono">
                        {t('base.buildCost', {
                          cost: costText(level.buildCost),
                          labour: level.labour,
                          power: level.powerDraw,
                        })}
                      </span>
                    </span>
                    <Button
                      size="sm"
                      disabled={!permitted || !check.ok}
                      title={!permitted ? t('base.notPermitted') : check.reason}
                      onClick={() => act(build(def.id, slot.id))}
                    >
                      {permitted
                        ? check.ok
                          ? t('base.build')
                          : (check.reason ?? t('base.unavailable'))
                        : t('base.wrongDeck')}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      )}

      <Panel
        title={t('base.priorityTitle')}
        note={
          power.deficit > 0
            ? t('base.priorityShort', { amount: Math.round(power.deficit) })
            : t('base.priorityBalanced')
        }
      >
        <p className="hint">{t('base.priorityHint')}</p>
        {state.facilities.length === 0 && <EmptyState>{t('base.nothingBuilt')}</EmptyState>}
        <ul className="priority-list">
          {state.facilities
            .slice()
            .sort((a, b) => b.priority - a.priority)
            .map((facility) => {
              const def = Facilities.facilityDef(facility);
              return (
                <li key={facility.id} className={facility.brownedOut ? 'tone-bad' : ''}>
                  <span className="grow truncate">
                    {facilityName(def)} <span className="tone-muted">L{facility.level}</span>
                  </span>
                  <span className="mono">{def.levels[facility.level - 1]?.powerDraw ?? 0} kW</span>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={facility.priority}
                    onChange={(e) => setPriority(facility.id, Number(e.target.value))}
                    aria-label={t('base.priorityFor', { name: facilityName(def) })}
                  />
                  <span className="num">{facility.priority}</span>
                </li>
              );
            })}
        </ul>
        <div className="row gap-2">
          <BreakdownPopover breakdown={power.capacity} title={t('dash.powerCapacity')} unit="kW">
            <span className="num">
              {t('base.supplyLine', { value: Math.round(power.capacity.total) })}
            </span>
          </BreakdownPopover>
          <BreakdownPopover breakdown={power.demand} title={t('dash.powerDemand')} unit="kW">
            <span className="num">{t('base.drawLine', { value: Math.round(power.demand.total) })}</span>
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
  const t = useT();
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
      <span className="slot-name truncate">
        {def ? facilityName(def) : slot.sealed ? t('base.collapsed') : t('base.empty')}
      </span>
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
  const t = useT();
  const def = Facilities.facilityDef(facility);
  const level = def.levels[facility.level - 1];
  const next = def.levels[facility.level];
  const upgradeCheck = Facilities.canUpgrade(state, facility.id);
  const repairNeeded = facility.condition < 100 || facility.status === 'damaged';
  const repairPrice = Facilities.repairCost(facility);

  return (
    <>
      <p className="prose">{facilityDescription(def)}</p>
      <ul className="kv">
        <li>
          <span>{t('base.level')}</span>
          <span className="num">{facility.level} / 3</span>
        </li>
        <li>
          <span>{t('base.condition')}</span>
          <span className={`num ${facility.condition < 40 ? 'tone-bad' : ''}`}>
            {Math.round(facility.condition)}%
          </span>
        </li>
        <li>
          <span>{t('base.status')}</span>
          <span className={facility.status === 'operational' ? 'tone-good' : 'tone-warn'}>
            {t(`base.status.${facility.status}`)}
          </span>
        </li>
        <li>
          <span>{t('base.staff')}</span>
          <span className="num">
            {facility.staff.length} / {Facilities.staffSlots(facility)}
          </span>
        </li>
        <li>
          <span>{t('base.powerDraw')}</span>
          <span className="num">{level?.powerDraw ?? 0} kW</span>
        </li>
      </ul>

      {facility.status === 'building' && (
        <>
          <p className="hint">
            {facility.upgradingTo
              ? t('base.upgrading', { level: facility.upgradingTo })
              : t('base.underConstruction')}{' '}
            {t('base.labourNote')}
          </p>
          <Bar value={facility.progress / Math.max(1, facility.progressRequired)} colour="var(--ice)" height={6} />
        </>
      )}

      <p className="prose">{level ? facilityLevelSummary(def, facility.level) : null}</p>
      {next && (
        <p className="hint">
          {t('base.nextLevel', { summary: facilityLevelSummary(def, facility.level + 1) })}
        </p>
      )}

      <div className="row gap-2 wrap">
        {next && (
          <Button
            disabled={!upgradeCheck.ok}
            title={upgradeCheck.reason ?? t('base.upgrade', { cost: costText(next.buildCost) })}
            onClick={onUpgrade}
          >
            {t('base.upgrade', { cost: costText(next.buildCost) })}
          </Button>
        )}
        {repairNeeded && (
          <Button onClick={onRepair} title={t('base.repair', { cost: repairPrice.components })}>
            {t('base.repair', { cost: repairPrice.components })}
          </Button>
        )}
        <Button tone="danger" onClick={onDemolish}>
          {t('base.demolish')}
        </Button>
        <label className="inline-field">
          <span className="label">{t('base.priority')}</span>
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
