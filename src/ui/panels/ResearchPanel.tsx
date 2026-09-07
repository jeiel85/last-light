import { useMemo, useState } from 'react';
import { BRANCH_COLOUR, BRANCH_LABEL, RESEARCH, RESEARCH_BRANCHES, Research } from '@engine';
import type { ResearchBranch } from '@engine';
import { useGameStore } from '@store/gameStore';
import { Panel, EmptyState } from '@ui/components/Panel';
import { Button } from '@ui/components/Button';
import { Bar } from '@ui/components/Bar';
import { BreakdownPopover } from '@ui/components/BreakdownPopover';
import { Guidance } from '@ui/components/Guidance';

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

  const insight = useMemo(() => Research.insightRate(state), [state]);
  const rows = useMemo(() => Research.allResearch(state), [state]);
  const active = state.research.active;
  const activeNode = active ? RESEARCH.find((n) => n.id === active.id) : null;

  const visible = rows.filter((r) => branch === 'all' || r.node.branch === branch);
  const tiers = [1, 2, 3, 4];

  return (
    <div className="col gap-3">
      <Guidance id="research.start" when={!active} title="Insight only accrues while you are working">
        Pick a project and the Laboratory starts generating insight toward it. Nothing accumulates
        while the bench is empty, and switching projects banks half of what you had.
      </Guidance>

      <Panel
        title="Research"
        note={`${state.research.completed.length}/${RESEARCH.length} complete`}
        actions={
          <BreakdownPopover breakdown={insight} title="Insight per day">
            <span className="num">{Math.round(insight.total * 10) / 10} insight/day</span>
          </BreakdownPopover>
        }
      >
        {activeNode && active ? (
          <div className="active-research">
            <div className="row gap-2">
              <span className="branch-dot" style={{ background: BRANCH_COLOUR[activeNode.branch] }} />
              <strong className="grow">{activeNode.name}</strong>
              <span className="num tone-muted">
                {Math.round(active.progress)}/{active.required}
              </span>
              <Button
                size="sm"
                tone="ghost"
                onClick={() => notify(cancelResearch().message ?? 'Shelved.', 'info')}
              >
                Shelve
              </Button>
            </div>
            <Bar value={active.progress / Math.max(1, active.required)} colour={BRANCH_COLOUR[activeNode.branch]} height={6} />
            <p className="prose">{activeNode.description}</p>
            <p className="hint">{activeNode.effectText}</p>
          </div>
        ) : (
          <EmptyState>
            No project running. Insight accumulates only while something is being worked on.
          </EmptyState>
        )}
      </Panel>

      <Panel
        title="Projects"
        actions={
          <div className="branch-filter">
            <button
              type="button"
              className={`chip ${branch === 'all' ? 'chip-active' : ''}`}
              onClick={() => setBranch('all')}
            >
              All
            </button>
            {RESEARCH_BRANCHES.map((b) => (
              <button
                key={b}
                type="button"
                className={`chip ${branch === b ? 'chip-active' : ''}`}
                onClick={() => setBranch(b)}
                style={{ borderColor: BRANCH_COLOUR[b] }}
              >
                {BRANCH_LABEL[b]}
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
                <h3 className="label tree-tier-label">Tier {tier}</h3>
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
                        <span className="tree-name grow">{node.name}</span>
                        <span className="num tone-muted">{cost}</span>
                      </div>
                      <p className="tree-desc">{node.description}</p>
                      <p className="tree-effect hint">{node.effectText}</p>
                      <div className="row gap-2">
                        <span className="tone-muted mono">{BRANCH_LABEL[node.branch]}</span>
                        {estimatedDays !== null && !completed && (
                          <span className="tone-muted mono">~{estimatedDays}d</span>
                        )}
                        <span className="right">
                          {completed ? (
                            <span className="tone-good">Complete</span>
                          ) : isActive ? (
                            <span className="tone-info">Running</span>
                          ) : (
                            <Button
                              size="sm"
                              disabled={!ok}
                              title={reason}
                              onClick={() => {
                                const result = startResearch(node.id);
                                notify(
                                  result.message ?? (result.ok ? 'Project started.' : 'Cannot start that.'),
                                  result.ok ? 'good' : 'bad',
                                );
                              }}
                            >
                              {ok ? 'Start' : (reason ?? 'Locked')}
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
