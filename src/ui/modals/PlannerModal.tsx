import { useEffect, useMemo, useState } from 'react';
import { ARCHETYPE_BY_ID, Expedition, ITEM_BY_ID, RESOURCES, Survivors, World } from '@engine';
import type { ExpeditionLoadout, InventoryEntry } from '@engine';
import { useGameStore } from '@store/gameStore';
import { useUiStore } from '@store/uiStore';
import { Modal } from '@ui/components/Modal';
import { Button } from '@ui/components/Button';
import { Bar } from '@ui/components/Bar';
import { Portrait } from '@ui/components/Portrait';
import { BreakdownPopover } from '@ui/components/BreakdownPopover';
import { Icon } from '@ui/components/Icon';
import { announce } from '@ui/hooks/announce';
import { useT } from '@ui/hooks/useTranslation';
import { occupationOf, siteName } from '@ui/lib/labels';
import { itemName, resourceName } from '@i18n/content';

/**
 * The expedition planner.
 *
 * The forecast is the whole point of this screen: risk is previewed before it is taken,
 * every figure opens into its terms, and the warnings name the specific thing that is
 * wrong with the plan rather than saying "this looks dangerous".
 */
export function PlannerModal({ onClose }: { onClose: () => void }) {
  const state = useGameStore((s) => s.state)!;
  const dispatch = useGameStore((s) => s.dispatch);
  const notify = useGameStore((s) => s.notify);
  const selectedLocation = useUiStore((s) => s.selectedLocation);
  const selectLocation = useUiStore((s) => s.selectLocation);
  const t = useT();

  const reachable = useMemo(() => World.reachableLocations(state), [state]);
  const [locationId, setLocationId] = useState(selectedLocation ?? reachable[0]?.id ?? '');
  const [members, setMembers] = useState<string[]>([]);
  const [loadout, setLoadout] = useState<ExpeditionLoadout>(() => Expedition.emptyLoadout());

  const location = reachable.find((l) => l.id === locationId);

  const eligible = useMemo(
    () =>
      Survivors.livingSurvivors(state).map((survivor) => ({
        survivor,
        gate: Survivors.canJoinExpedition(survivor),
      })),
    [state],
  );

  const forecast = useMemo(
    () => (location ? Expedition.expeditionForecast(state, location, members, loadout) : null),
    [state, location, members, loadout],
  );

  /* Suggest sensible supplies whenever the shape of the trip changes. */
  useEffect(() => {
    if (!forecast) return;
    setLoadout((current) => {
      const rations = Math.min(Math.ceil(forecast.rationsNeeded), Math.floor(state.resources.food));
      const water = Math.min(Math.ceil(forecast.waterNeeded), Math.floor(state.resources.water));
      if (current.rations === rations && current.water === water) return current;
      return { ...current, rations, water };
    });
    // Only react to the computed need, not to the loadout we are writing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forecast?.rationsNeeded, forecast?.waterNeeded, state.resources.food, state.resources.water]);

  const capacity = useMemo(
    () =>
      Expedition.packCapacity(
        state,
        members.map((id) => state.survivors.find((s) => s.id === id)!).filter(Boolean),
      ),
    [state, members],
  );
  const weight = Expedition.loadoutWeight(loadout);

  const toggleMember = (id: string) =>
    setMembers((current) => (current.includes(id) ? current.filter((m) => m !== id) : [...current, id]));

  const setItemCount = (itemId: string, count: number) =>
    setLoadout((current) => {
      const items: InventoryEntry[] = current.items.filter((entry) => entry.itemId !== itemId);
      if (count > 0) items.push({ itemId, count });
      return { ...current, items };
    });

  const go = () => {
    if (!location) return;
    const result = dispatch(location.id, members, loadout);
    if (!result.ok) {
      notify(result.message ?? t('planner.cannotLeave'), 'bad');
      return;
    }
    announce(t('planner.dispatched', { name: siteName(location) }));
    selectLocation(location.id);
    onClose();
  };

  return (
    <Modal
      title={t('planner.title')}
      subtitle={t('planner.subtitle')}
      onClose={onClose}
      size="wide"
      footer={
        <div className="row gap-2 grow">
          <span className="tone-muted">
            {t('planner.going', {
              count: members.length,
              weight: Math.round(weight),
              capacity: Math.round(capacity),
            })}
          </span>
          <span className="right row gap-2">
            <Button tone="ghost" onClick={onClose}>
              {t('planner.cancel')}
            </Button>
            <Button tone="primary" disabled={!location || members.length === 0} onClick={go}>
              {t('planner.send')}
            </Button>
          </span>
        </div>
      }
    >
      <div className="planner">
        <section className="planner-col">
          <h3 className="label">{t('planner.destination')}</h3>
          <ul className="choice-list">
            {reachable.map((loc) => {
              const archetype = ARCHETYPE_BY_ID[loc.archetypeId];
              const knowledge = World.knowledgeOf(loc);
              return (
                <li key={loc.id}>
                  <button
                    type="button"
                    className={`choice ${loc.id === locationId ? 'choice-active' : ''}`}
                    onClick={() => setLocationId(loc.id)}
                    aria-pressed={loc.id === locationId}
                  >
                    <span className="choice-name">
                      <Icon name={archetype?.icon ?? 'hatch'} size={15} /> {siteName(loc)}
                    </span>
                    <span className="choice-hint mono">
                      {t('planner.destinationMeta', {
                        days: World.travelDaysFor(state, loc),
                        danger: knowledge.danger
                          ? Math.round(loc.danger)
                          : t('map.unsurveyed'),
                      })}
                    </span>
                    <span className="choice-tag">{t(`map.state.${loc.state}`)}</span>
                  </button>
                </li>
              );
            })}
            {reachable.length === 0 && <li className="empty-state">{t('planner.nowhere')}</li>}
          </ul>
        </section>

        <section className="planner-col">
          <h3 className="label">{t('planner.team')}</h3>
          <ul className="team-list">
            {eligible.map(({ survivor, gate }) => (
              <li key={survivor.id}>
                <label className={`team-row ${gate.ok ? '' : 'team-row-off'}`}>
                  <input
                    type="checkbox"
                    checked={members.includes(survivor.id)}
                    disabled={!gate.ok}
                    onChange={() => toggleMember(survivor.id)}
                  />
                  <Portrait survivor={survivor} size={30} />
                  <span className="col grow">
                    <span className="truncate">{survivor.name}</span>
                    <span className="tone-muted truncate">
                      {gate.ok
                        ? t('planner.memberMeta', {
                            occupation: occupationOf(survivor),
                            scavenging: survivor.skills.scavenging,
                            combat: survivor.skills.combat,
                          })
                        : (gate.reason ?? '')}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>

          <h3 className="label">{t('planner.supplies')}</h3>
          <ul className="supply-list">
            {(['rations', 'water', 'ammo', 'medicine'] as const).map((key) => {
              const resource = key === 'rations' ? 'food' : key === 'water' ? 'water' : key;
              const available = Math.floor(state.resources[resource as keyof typeof state.resources] ?? 0);
              return (
                <li key={key}>
                  <span className="label grow">{t(`planner.supply.${key}`)}</span>
                  <input
                    type="number"
                    className="input input-sm input-num"
                    min={0}
                    max={available}
                    value={loadout[key]}
                    onChange={(e) =>
                      setLoadout((current) => ({
                        ...current,
                        [key]: Math.max(0, Math.min(available, Number(e.target.value))),
                      }))
                    }
                    aria-label={t('planner.packLabel', { name: t(`planner.supply.${key}`) })}
                  />
                  <span className="tone-muted mono">/{available}</span>
                </li>
              );
            })}
          </ul>

          <h3 className="label">{t('planner.gear')}</h3>
          <ul className="supply-list">
            {state.inventory.map((entry) => {
              const def = ITEM_BY_ID[entry.itemId];
              if (!def) return null;
              const packed = loadout.items.find((i) => i.itemId === entry.itemId)?.count ?? 0;
              return (
                <li key={entry.itemId}>
                  <span className="grow truncate row gap-2">
                    <Icon name={def.icon} size={15} /> {itemName(def)}
                  </span>
                  <input
                    type="number"
                    className="input input-sm input-num"
                    min={0}
                    max={entry.count}
                    value={packed}
                    onChange={(e) => setItemCount(entry.itemId, Math.max(0, Math.min(entry.count, Number(e.target.value))))}
                    aria-label={t('planner.packLabel', { name: itemName(def) })}
                  />
                  <span className="tone-muted mono">/{entry.count}</span>
                </li>
              );
            })}
            {state.inventory.length === 0 && (
              <li className="empty-state">{t('planner.nothingToTake')}</li>
            )}
          </ul>
        </section>

        <section className="planner-col">
          <h3 className="label">{t('planner.forecast')}</h3>
          {!forecast && <p className="empty-state">{t('planner.chooseDestination')}</p>}
          {forecast && (
            <>
              <ul className="kv">
                <li>
                  <span>{t('planner.timeAway')}</span>
                  <span className="num">
                    {t('planner.days', { days: forecast.travelDays * 2 + 1 })}
                  </span>
                </li>
                <li>
                  <span>{t('planner.combatPower')}</span>
                  <BreakdownPopover breakdown={forecast.combatPower} title={t('planner.combatPower')}>
                    <span className="num">{Math.round(forecast.combatPower.total)}</span>
                  </BreakdownPopover>
                </li>
                <li>
                  <span>{t('planner.carryCapacity')}</span>
                  <BreakdownPopover
                    breakdown={forecast.carryCapacity}
                    title={t('planner.carryCapacity')}
                    unit="kg"
                  >
                    <span className="num">{Math.round(forecast.carryCapacity.total)} kg</span>
                  </BreakdownPopover>
                </li>
                <li>
                  <span>{t('planner.injuryRisk')}</span>
                  <BreakdownPopover breakdown={forecast.injuryRisk} title={t('planner.injuryRisk')}>
                    <span className={`num ${forecast.injuryRisk.total > 0.4 ? 'tone-bad' : 'tone-warn'}`}>
                      {Math.round(forecast.injuryRisk.total * 100)}%
                    </span>
                  </BreakdownPopover>
                </li>
                <li>
                  <span>{t('planner.deathRisk')}</span>
                  <BreakdownPopover breakdown={forecast.deathRisk} title={t('planner.deathRisk')}>
                    <span className={`num ${forecast.deathRisk.total > 0.1 ? 'tone-bad' : 'tone-muted'}`}>
                      {Math.round(forecast.deathRisk.total * 100)}%
                    </span>
                  </BreakdownPopover>
                </li>
              </ul>

              <span className="label">{t('planner.packWeight')}</span>
              <Bar
                value={weight / Math.max(1, forecast.carryCapacity.total)}
                colour={weight > forecast.carryCapacity.total ? 'var(--alarm)' : 'var(--amber)'}
                height={6}
              />

              {forecast.expectedHaul.length > 0 && (
                <>
                  <span className="label">{t('planner.expectedHaul')}</span>
                  <ul className="kv">
                    {forecast.expectedHaul.map((row) => (
                      <li key={row.resource}>
                        <span>
                          {(() => {
                            const def = RESOURCES[row.resource];
                            return def ? resourceName(def) : row.resource;
                          })()}
                        </span>
                        <span className="num">
                          {row.min}–{row.max}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {forecast.warnings.length > 0 && (
                <ul className="warn-list">
                  {forecast.warnings.map((warning, i) => (
                    <li key={i} className="tone-warn">
                      ▲ {warning}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </div>
    </Modal>
  );
}
