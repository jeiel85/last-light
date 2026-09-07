import { useMemo, useState } from 'react';
import { BRANCH_COLOUR, RESEARCH, RESEARCH_BRANCHES, Research } from '@engine';
import type { ResearchBranch } from '@engine';
import { useGameStore } from '@store/gameStore';
import { Panel, EmptyState } from '@ui/components/Panel';
import { Button } from '@ui/components/Button';
import { Bar } from '@ui/components/Bar';
import { BreakdownPopover } from '@ui/components/BreakdownPopover';
import { Guidance } from '@ui/components/Guidance';
import { useT } from '@ui/hooks/useTranslation';
import { researchDescription, researchEffect, researchName } from '@i18n/content';

/**
 * The research tree, drawn as tiered columns per branch rather than a free-form graph:
 * prerequisites in this game are shallow, and a column reads far better on a phone than
 * a node-and-edge diagram does.
 */
export function ResearchPanel() {
  const state = useGameStore((s) => s.state)!;
  const startResearch = useGameStore((s) => s.startResearch);
  const cancelResearch = useGameStore((s) => s.cancelResearch);
  const notify = useGameStore((s) => s.notify);
  const [branch, setBranch] = useState<ResearchBranch | 'all'>('all');
  const t = useT();

  const insight = useMemo(() => Research.insightRate(state), [state]);
  const rows = useMemo(() => Research.allResearch(state), [state]);
  const active = state.research.active;
  const activeNode = active ? RESEARCH.find((n) => n.id === active.id) : null;

  const visible = rows.filter((r) => branch === 'all' || r.node.branch === branch);
  const tiers = [1, 2, 3, 4];

  return (
    <div className="col gap-3">
      <Guidance
        notes={[
          {
            id: 'research.start',
            when: !active,
            title: t('guidance.research.title'),
            body: t('guidance.research.body'),
          },
        ]}
      />

      <Panel
        title={t('research.title')}
        note={t('research.complete', {
          done: state.research.completed.length,
          total: RESEARCH.length,
        })}
        actions={
          <BreakdownPopover breakdown={insight} title={t('dash.insightPerDay')}>
            <span className="num">
              {t('research.insightPerDay', { value: Math.round(insight.total * 10) / 10 })}
            </span>
          </BreakdownPopover>
        }
      >
        {activeNode && active ? (
          <div className="active-research">
            <div className="row gap-2">
              <span className="branch-dot" style={{ background: BRANCH_COLOUR[activeNode.branch] }} />
              <strong className="grow">{researchName(activeNode)}</strong>
              <span className="num tone-muted">
                {Math.round(active.progress)}/{active.required}
              </span>
              <Button
                size="sm"
                tone="ghost"
                onClick={() => notify(cancelResearch().message ?? t('research.shelved'), 'info')}
              >
                {t('research.shelve')}
              </Button>
            </div>
            <Bar value={active.progress / Math.max(1, active.required)} colour={BRANCH_COLOUR[activeNode.branch]} height={6} />
            <p className="prose">{researchDescription(activeNode)}</p>
            <p className="hint">{researchEffect(activeNode)}</p>
          </div>
        ) : (
          <EmptyState>{t('research.none')}</EmptyState>
        )}
      </Panel>

      <Panel
        title={t('research.projects')}
        actions={
          <div className="branch-filter" role="group" aria-label={t('research.categoryLabel')}>
            <button
              type="button"
              className={`chip ${branch === 'all' ? 'chip-active' : ''}`}
              onClick={() => setBranch('all')}
            >
              {t('research.all')}
            </button>
            {RESEARCH_BRANCHES.map((b) => (
              <button
                key={b}
                type="button"
                className={`chip ${branch === b ? 'chip-active' : ''}`}
                onClick={() => setBranch(b)}
                style={{ borderColor: BRANCH_COLOUR[b] }}
              >
                {t(`research.branch.${b}`)}
              </button>
            ))}
          </div>
        }
      >
        <div className="tree">
          {tiers.map((tier) => {
            const nodes = visible.filter((r) => r.node.tier === tier);
            if (nodes.length === 0) return null;
            return (
              <div key={tier} className="tree-tier">
                <h3 className="label tree-tier-label">{t('research.tier', { tier })}</h3>
                <ul className="tree-nodes">
                  {nodes.map(({ node, ok, reason, cost, estimatedDays, completed, active: isActive }) => (
                    <li
                      key={node.id}
                      className={`tree-node ${completed ? 'tree-done' : ''} ${isActive ? 'tree-active' : ''} ${
                        !ok && !completed && !isActive ? 'tree-locked' : ''
                      }`}
                      style={{ borderLeftColor: BRANCH_COLOUR[node.branch] }}
                    >
                      <div className="row gap-2">
                        <span className="tree-name grow">{researchName(node)}</span>
                        <span className="num tone-muted">{cost}</span>
                      </div>
                      <p className="tree-desc">{researchDescription(node)}</p>
                      <p className="tree-effect hint">{researchEffect(node)}</p>
                      <div className="row gap-2">
                        <span className="tone-muted mono">{t(`research.branch.${node.branch}`)}</span>
                        {estimatedDays !== null && !completed && (
                          <span className="tone-muted mono">
                            {t('research.estimate', { days: estimatedDays })}
                          </span>
                        )}
                        <span className="right">
                          {completed ? (
                            <span className="tone-good">{t('research.completeLabel')}</span>
                          ) : isActive ? (
                            <span className="tone-info">{t('research.running')}</span>
                          ) : (
                            <Button
                              size="sm"
                              disabled={!ok}
                              title={reason}
                              onClick={() => {
                                const result = startResearch(node.id);
                                const fallback = result.ok
                                  ? t('research.started')
                                  : t('research.cannotStart');
                                notify(result.message ?? fallback, result.ok ? 'good' : 'bad');
                              }}
                            >
                              {ok ? t('research.start') : (reason ?? t('research.locked'))}
                            </Button>
                          )}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
