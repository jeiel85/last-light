import { useMemo } from 'react';
import { ARCHETYPE_BY_ID, RESOURCES, World } from '@engine';
import type { LocationInstance } from '@engine';
import { useGameStore } from '@store/gameStore';
import { useUiStore } from '@store/uiStore';
import { Panel, EmptyState } from '@ui/components/Panel';
import { Button } from '@ui/components/Button';
import { Bar } from '@ui/components/Bar';
import { Icon } from '@ui/components/Icon';
import { Guidance } from '@ui/components/Guidance';

const SIZE = 460;
const CENTRE = SIZE / 2;
/** Where each ring's boundary sits, as a fraction of the plate. Ring 0 clears the vault. */
const RING_RADII = [0.18, 0.42, 0.68, 0.94];

const STATE_LABEL: Record<string, string> = {
  unknown: 'Unknown',
  rumoured: 'Rumoured',
  scouted: 'Scouted',
  explored: 'Explored',
  depleted: 'Stripped',
  collapsed: 'Collapsed',
  claimed: 'Claimed',
};

function dangerColour(danger: number): string {
  if (danger >= 7) return 'var(--alarm)';
  if (danger >= 4) return 'var(--amber)';
  return 'var(--phosphor)';
}

/**
 * A radial map. The vault is the centre, distance is literal, and the three rings are the
 * three ranges the player can unlock — so "how far can we go" is answered by looking.
 */
export function MapPanel() {
  const state = useGameStore((s) => s.state)!;
  const scout = useGameStore((s) => s.scout);
  const notify = useGameStore((s) => s.notify);
  const selectedLocation = useUiStore((s) => s.selectedLocation);
  const selectLocation = useUiStore((s) => s.selectLocation);
  const openModal = useUiStore((s) => s.openModal);

  const maxRing = World.unlockedRing(state);
  const known = state.world.locations.filter((l) => l.state !== 'unknown');
  const selected = selectedLocation ? state.world.locations.find((l) => l.id === selectedLocation) : null;

  const points = useMemo(
    () =>
      known.map((location) => {
        // Worldgen already jittered a radius per site; using it keeps the map organic
        // instead of laying every ring out as a perfect circle of pins.
        const inner = RING_RADII[location.ring] ?? 0.6;
        const outer = RING_RADII[location.ring + 1] ?? 0.98;
        const radius = inner + (outer - inner) * Math.min(1, Math.max(0, location.radius));
        return {
          location,
          x: CENTRE + Math.cos(location.angle) * radius * CENTRE * 0.92,
          y: CENTRE + Math.sin(location.angle) * radius * CENTRE * 0.92,
        };
      }),
    [known],
  );

  return (
    <div className="col gap-3">
      <Guidance
        notes={[
          {
            id: 'map.expedition',
            when: maxRing >= 1,
            title: 'The surface is where the materials are',
            body: (
              <>
                Almost nothing is manufactured down here. Pick a site, pick a team, and read the
                forecast before you commit — it states the injury and death risk, and names what is
                wrong with the plan.
              </>
            ),
          },
        ]}
      />

      <Panel
        title="The surface"
        note={`ring ${maxRing} reachable · ${known.length} known`}
        actions={
          <Button size="sm" tone="primary" onClick={() => openModal('planner')}>
            Plan expedition
          </Button>
        }
      >
        <div className="map-wrap">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="map" role="img" aria-label="Map of known locations">
            {[1, 2, 3].map((ring) => (
              <circle
                key={ring}
                cx={CENTRE}
                cy={CENTRE}
                r={(RING_RADII[ring] ?? 0.9) * CENTRE * 0.92}
                fill="none"
                stroke={ring <= maxRing ? 'var(--rule-strong)' : 'var(--rule)'}
                strokeDasharray={ring <= maxRing ? undefined : '3 5'}
              />
            ))}
            <circle cx={CENTRE} cy={CENTRE} r="16" fill="var(--panel-2)" stroke="var(--amber)" />
            <text x={CENTRE} y={CENTRE + 4} textAnchor="middle" className="map-vault">
              ⌂
            </text>

            {points.map(({ location, x, y }) => {
              const archetype = ARCHETYPE_BY_ID[location.archetypeId];
              const reachable = location.ring <= maxRing && location.state !== 'collapsed';
              const isSelected = location.id === selectedLocation;
              return (
                <g
                  key={location.id}
                  className={`map-node ${reachable ? '' : 'map-node-off'} ${isSelected ? 'map-node-selected' : ''}`}
                  onClick={() => selectLocation(isSelected ? null : location.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${location.name}, ${STATE_LABEL[location.state]}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectLocation(isSelected ? null : location.id);
                    }
                  }}
                >
                  <line x1={CENTRE} y1={CENTRE} x2={x} y2={y} className="map-link" />
                  <circle cx={x} cy={y} r={isSelected ? 11 : 8} fill="var(--panel-2)" stroke={dangerColour(location.danger)} strokeWidth={isSelected ? 2 : 1.2} />
                  <g transform={`translate(${x - 7} ${y - 7}) scale(0.58)`} className="map-icon">
                    <Icon name={archetype?.icon ?? 'hatch'} size={24} />
                  </g>
                  <text x={x} y={y + 22} textAnchor="middle" className="map-label">
                    {location.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        {known.length === 0 && <EmptyState>Nothing has been found yet. Send someone out.</EmptyState>}
      </Panel>

      {selected && <LocationInspector location={selected} onScout={() => {
        const result = scout(selected.id);
        notify(result.ok ? 'Studied the approach from the tower.' : 'There is nothing more to learn from here.', result.ok ? 'good' : 'info');
      }} onPlan={() => openModal('planner')} />}
    </div>
  );
}

function LocationInspector({
  location,
  onScout,
  onPlan,
}: {
  location: LocationInstance;
  onScout: () => void;
  onPlan: () => void;
}) {
  const state = useGameStore((s) => s.state)!;
  const archetype = ARCHETYPE_BY_ID[location.archetypeId];
  const knowledge = World.knowledgeOf(location);
  const travelDays = World.travelDaysFor(state, location);
  const reachable = location.ring <= World.unlockedRing(state);
  const haul = archetype ? World.expectedHaul(archetype, location, 4) : [];

  return (
    <Panel title={location.name} note={STATE_LABEL[location.state]}>
      <p className="prose">{knowledge.archetype ? archetype?.description : 'You know only that something is there.'}</p>
      <ul className="kv">
        <li>
          <span>Distance</span>
          <span className="num">{location.distanceKm.toFixed(1)} km · {travelDays}d travel</span>
        </li>
        <li>
          <span>Danger</span>
          <span className="num" style={{ color: dangerColour(location.danger) }}>
            {knowledge.danger ? `${Math.round(location.danger)}/10` : 'unsurveyed'}
          </span>
        </li>
        <li>
          <span>Richness</span>
          <span className="num">{knowledge.loot ? location.richness.toFixed(1) : '—'}</span>
        </li>
        <li>
          <span>Visits</span>
          <span className="num">{location.visits}</span>
        </li>
      </ul>

      <span className="label">Knowledge</span>
      <Bar value={location.knowledge / 4} colour="var(--ice)" height={5} />

      {knowledge.loot && haul.length > 0 && (
        <>
          <span className="label">Likely haul</span>
          <ul className="kv">
            {haul.map((row) => (
              <li key={row.resource}>
                <span>{RESOURCES[row.resource as keyof typeof RESOURCES]?.name ?? row.resource}</span>
                <span className="num">
                  {row.min}–{row.max}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {location.note && <p className="hint">{location.note}</p>}

      <div className="row gap-2 wrap">
        <Button size="sm" onClick={onScout} disabled={location.knowledge >= 4}>
          Study from the tower
        </Button>
        <Button size="sm" tone="primary" onClick={onPlan} disabled={!reachable}>
          {reachable ? 'Plan an expedition here' : 'Out of range'}
        </Button>
      </div>
    </Panel>
  );
}
