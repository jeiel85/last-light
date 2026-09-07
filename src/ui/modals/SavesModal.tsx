import { useCallback, useEffect, useState } from 'react';
import type { SlotSummary } from '@save/schema';
import { AUTOSAVE_SLOT, SLOT_COUNT } from '@save/schema';
import {
  buildSaveFile,
  deleteSlot,
  downloadText,
  exportSave,
  importSave,
  listSlots,
  readSlot,
  writeSlot,
} from '@save/serialize';
import { useGameStore } from '@store/gameStore';
import { useUiStore } from '@store/uiStore';
import { Modal } from '@ui/components/Modal';
import { Button } from '@ui/components/Button';
import { useT } from '@ui/hooks/useTranslation';
import { localeTag } from '@i18n';
import { SCENARIO_BY_ID } from '@engine';
import { scenarioName } from '@i18n/content';

function when(ts: number): string {
  if (!ts) return '—';
  const tag = localeTag();
  const date = new Date(ts);
  return `${date.toLocaleDateString(tag)} ${date.toLocaleTimeString(tag, { hour: '2-digit', minute: '2-digit' })}`;
}

/**
 * Save management, including the recovery path: a slot that fails to load is listed with
 * its problem and an export button rather than being hidden or deleted.
 */
export function SavesModal({ onClose, context }: { onClose: () => void; context: 'menu' | 'game' }) {
  const state = useGameStore((s) => s.state);
  const loadState = useGameStore((s) => s.loadState);
  const notify = useGameStore((s) => s.notify);
  const setScreen = useUiStore((s) => s.setScreen);
  const [slots, setSlots] = useState<SlotSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const t = useT();

  const refresh = useCallback(() => {
    void listSlots().then(setSlots);
  }, []);

  useEffect(refresh, [refresh]);

  const save = async (slot: number) => {
    if (!state) return;
    setBusy(true);
    const result = await writeSlot(state, slot, `${t('topbar.day')} ${state.day}`);
    setBusy(false);
    notify(
      result.ok ? t('saves.saved', { n: slot }) : (result.error ?? t('saves.writeFailed')),
      result.ok ? 'good' : 'bad',
    );
    refresh();
  };

  const load = async (slot: number) => {
    setBusy(true);
    const result = await readSlot(slot);
    setBusy(false);
    if (!result?.ok || !result.state) {
      notify(result?.problem ?? t('saves.readFailed'), 'bad');
      return;
    }
    loadState(result.state);
    setScreen('game');
    onClose();
  };

  const doExport = async (slot: number) => {
    const summary = slots.find((s) => s.slot === slot);
    if (summary?.raw) {
      downloadText(`lastlight-slot${slot}-recovered.json`, exportSave(summary.raw));
      return;
    }
    const result = await readSlot(slot);
    if (!result?.file) {
      notify(t('saves.nothingToExport'), 'bad');
      return;
    }
    downloadText(`lastlight-slot${slot}.json`, exportSave(result.file));
  };

  const doImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = importSave(String(reader.result ?? ''));
      if (!result.ok || !result.state) {
        notify(result.problem ?? t('saves.notASave'), 'bad');
        return;
      }
      loadState(result.state);
      setScreen('game');
      onClose();
    };
    reader.readAsText(file);
  };

  return (
    <Modal title={t('saves.title')} subtitle={t('saves.subtitle')} onClose={onClose} size="normal">
      <ul className="slot-list">
        {Array.from({ length: SLOT_COUNT }, (_, slot) => {
          const summary = slots.find((s) => s.slot === slot);
          const isAuto = slot === AUTOSAVE_SLOT;
          return (
            <li key={slot} className={`slot-row ${summary?.problem ? 'slot-row-bad' : ''}`}>
              <span className="col grow">
                <strong>
                  {isAuto ? t('saves.autosave') : t('saves.slot', { n: slot })}
                  {summary ? ` — ${summary.label}` : ''}
                </strong>
                {summary ? (
                  <span className="tone-muted mono">
                    {t('saves.preview', {
                      day: summary.preview.day,
                      survivors: summary.preview.survivors,
                      scenario: (() => {
                        const def = SCENARIO_BY_ID[summary.preview.scenarioId];
                        return def ? scenarioName(def) : summary.preview.scenarioId;
                      })(),
                      when: when(summary.savedAt),
                    })}
                    {summary.preview.ending
                      ? t('saves.ended', { ending: summary.preview.ending })
                      : ''}
                  </span>
                ) : (
                  <span className="tone-muted">{t('saves.empty')}</span>
                )}
                {summary?.problem && <span className="tone-bad">{summary.problem}</span>}
              </span>
              <span className="row gap-1">
                {context === 'game' && !isAuto && (
                  <Button size="sm" disabled={busy || !state} onClick={() => void save(slot)}>
                    {t('saves.save')}
                  </Button>
                )}
                <Button size="sm" disabled={busy || !summary || Boolean(summary.problem)} onClick={() => void load(slot)}>
                  {t('saves.load')}
                </Button>
                <Button size="sm" tone="ghost" disabled={!summary} onClick={() => void doExport(slot)}>
                  {t('saves.export')}
                </Button>
                <Button
                  size="sm"
                  tone="danger"
                  disabled={!summary}
                  onClick={() => {
                    void deleteSlot(slot).then(refresh);
                  }}
                >
                  {t('saves.delete')}
                </Button>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="row gap-2 wrap">
        <label className="btn btn-default btn-md">
          {t('saves.import')}
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) doImport(file);
            }}
          />
        </label>
        {state && (
          <Button
            tone="ghost"
            onClick={() =>
              downloadText(
                `lastlight-day${state.day}.json`,
                exportSave(buildSaveFile(state, 0, `${t('topbar.day')} ${state.day}`)),
              )
            }
          >
            {t('saves.exportCurrent')}
          </Button>
        )}
      </div>
    </Modal>
  );
}
