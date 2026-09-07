import { useMemo } from 'react';
import {
  BACKGROUND_BY_ID,
  CONDITION_BY_ID,
  ITEM_BY_ID,
  PERSONALITY_BY_ID,
  Relationships,
  Survivors,
  TRAIT_BY_ID,
} from '@engine';
import type { EquipmentSlot, SkillId } from '@engine';
import { useGameStore } from '@store/gameStore';
import { useUiStore } from '@store/uiStore';
import { Modal } from '@ui/components/Modal';
import { Meter } from '@ui/components/Stat';
import { Portrait } from '@ui/components/Portrait';
import { Button } from '@ui/components/Button';

const SKILLS: SkillId[] = ['engineering', 'medicine', 'science', 'scavenging', 'combat', 'cooking', 'botany', 'negotiation'];
const SLOTS: EquipmentSlot[] = ['weapon', 'tool', 'armour', 'utility'];

/** Everything known about one person: their numbers, their history, and their opinions. */
export function SurvivorModal({ onClose }: { onClose: () => void }) {
  const state = useGameStore((s) => s.state)!;
  const equip = useGameStore((s) => s.equip);
  const unequip = useGameStore((s) => s.unequip);
  const consumeItem = useGameStore((s) => s.consumeItem);
  const notify = useGameStore((s) => s.notify);
  const id = useUiStore((s) => s.modal.id) ?? useUiStore.getState().selectedSurvivor;

  const survivor = state.survivors.find((s) => s.id === id);

  const relationships = useMemo(
    () => (survivor ? Relationships.relationshipsOf(state, survivor.id) : []),
    [state, survivor],
  );

  if (!survivor) return null;

  const background = BACKGROUND_BY_ID[survivor.backgroundId];
  const personality = PERSONALITY_BY_ID[survivor.personalityId];

  const equippable = (slot: EquipmentSlot) =>
    state.inventory
      .map((entry) => ITEM_BY_ID[entry.itemId])
      .filter((def): def is NonNullable<typeof def> => Boolean(def) && def!.slot === slot);

  return (
    <Modal
      title={`${survivor.name} ${survivor.surname}`}
      subtitle={`${survivor.occupation} · ${survivor.age} · ${survivor.pronouns}`}
      onClose={onClose}
      size="wide"
    >
      <div className="survivor-grid">
        <section className="col gap-3">
          <div className="row gap-3">
            <Portrait survivor={survivor} size={72} />
            <div className="col grow gap-1">
              <Meter label="Health" value={survivor.health} />
              <Meter label="Morale" value={survivor.morale} />
              <Meter label="Fatigue" value={survivor.fatigue} invert />
              <Meter label="Hunger" value={survivor.hunger} invert />
              <Meter label="Stress" value={survivor.stress} invert />
            </div>
          </div>

          <h3 className="label">Skills</h3>
          <ul className="skill-list">
            {SKILLS.map((skill) => (
              <li key={skill}>
                <span className="grow">{Survivors.skillLabel(skill)}</span>
                <span className="skill-pips" aria-hidden="true">
                  {Array.from({ length: 10 }, (_, i) => (
                    <span key={i} className={i < survivor.skills[skill] ? 'pip pip-on' : 'pip'} />
                  ))}
                </span>
                <span className="num">{survivor.skills[skill]}</span>
              </li>
            ))}
          </ul>

          <h3 className="label">Traits</h3>
          <ul className="trait-list">
            {survivor.traits.map((traitId) => {
              const trait = TRAIT_BY_ID[traitId];
              return (
                <li key={traitId}>
                  <strong>{trait?.name ?? traitId}</strong>
                  <span className="tone-muted"> {trait?.description}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="col gap-3">
          <h3 className="label">Background</h3>
          <p className="prose">{background?.bio}</p>
          {personality && (
            <p className="hint">
              {personality.name} — {personality.description}
            </p>
          )}

          <h3 className="label">Equipment</h3>
          <ul className="equip-list">
            {SLOTS.map((slot) => {
              const equipped = survivor.equipment[slot];
              const def = equipped ? ITEM_BY_ID[equipped] : undefined;
              return (
                <li key={slot}>
                  <span className="label grow">{slot}</span>
                  <select
                    className="input input-sm"
                    value={equipped ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      const result = value ? equip(survivor.id, value) : unequip(survivor.id, slot);
                      if (!result.ok) notify(result.message ?? 'That cannot be equipped.', 'bad');
                    }}
                    aria-label={`${slot} for ${survivor.name}`}
                  >
                    <option value="">— empty —</option>
                    {def && <option value={def.id}>{def.name}</option>}
                    {equippable(slot)
                      .filter((item) => item.id !== equipped)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </li>
              );
            })}
          </ul>

          {survivor.conditions.length > 0 && (
            <>
              <h3 className="label">Conditions</h3>
              <ul className="cond-list">
                {survivor.conditions.map((condition) => {
                  const def = CONDITION_BY_ID[condition.id];
                  return (
                    <li key={condition.id} className={condition.severity > 55 ? 'tone-bad' : 'tone-warn'}>
                      <strong>{def?.name ?? condition.id}</strong> — severity {Math.round(condition.severity)}
                      {condition.treated ? ' · being treated' : ''}
                      <span className="tone-muted"> {def?.description}</span>
                    </li>
                  );
                })}
              </ul>
              <Button
                size="sm"
                onClick={() => {
                  const kit = state.inventory.find((entry) => ITEM_BY_ID[entry.itemId]?.tags.includes('medical'));
                  if (!kit) {
                    notify('No medical supplies in stores.', 'bad');
                    return;
                  }
                  const result = consumeItem(kit.itemId, survivor.id);
                  notify(result.message ?? 'Treated.', result.ok ? 'good' : 'bad');
                }}
              >
                Treat with the best kit available
              </Button>
            </>
          )}

          <h3 className="label">Relationships</h3>
          <ul className="rel-list">
            {relationships.map((rel) => {
              const other = state.survivors.find((s) => s.id === rel.other.id);
              if (!other) return null;
              return (
                <li key={rel.other.id}>
                  <span className="grow">{other.name}</span>
                  <span className={rel.value > 20 ? 'tone-good' : rel.value < -20 ? 'tone-bad' : 'tone-muted'}>
                    {Relationships.bucketLabel(Relationships.bucketOf(rel.value))}
                  </span>
                  <span className="num">{Math.round(rel.value)}</span>
                </li>
              );
            })}
            {relationships.length === 0 && <li className="empty-state">Nobody else is left.</li>}
          </ul>

          <h3 className="label">History</h3>
          <ol className="history-list">
            {survivor.history
              .slice(-14)
              .reverse()
              .map((entry, i) => (
                <li key={i} className={`tone-${entry.tone === 'neutral' ? 'muted' : entry.tone}`}>
                  <span className="mono">d{entry.day}</span> {entry.text}
                </li>
              ))}
            {survivor.history.length === 0 && <li className="empty-state">Nothing has happened to them yet.</li>}
          </ol>
        </section>
      </div>
    </Modal>
  );
}
