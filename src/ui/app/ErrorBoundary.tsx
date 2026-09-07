import { Component, type ErrorInfo, type ReactNode } from 'react';
import { buildSaveFile, downloadText, exportSave } from '@save/serialize';
import { useGameStore } from '@store/gameStore';

/**
 * The last line of defence.
 *
 * A render error anywhere in the tree blanks the page, and with it a run the player may
 * have spent an hour on. The save system already promises never to destroy a run it cannot
 * read; this extends the same promise to a run the *interface* cannot draw — the state is
 * still in memory, so the player is offered the file before anything else.
 */
interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  info: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Nothing leaves the machine: this is written to the console the player can open, and
    // shown on screen so a bug report can be copied without opening dev tools at all.
    console.error('LAST LIGHT crashed while rendering:', error, info.componentStack);
    this.setState({ info: info.componentStack ?? null });
  }

  private saveTheRun = (): void => {
    const state = useGameStore.getState().state;
    if (!state) return;
    downloadText(
      `lastlight-recovered-day${state.day}.json`,
      exportSave(buildSaveFile(state, 0, `Recovered — day ${state.day}`)),
    );
  };

  override render(): ReactNode {
    const { error, info } = this.state;
    if (!error) return this.props.children;

    const state = useGameStore.getState().state;

    return (
      <main className="crash">
        <div className="crash-inner">
          <p className="eyebrow">Something in the interface has failed</p>
          <h1 className="crash-title">The lights went out</h1>
          <p className="prose">
            The game hit an error it could not draw its way out of. The simulation itself is
            unharmed and still in memory
            {state ? `, at day ${state.day}` : ''} — take the file first, then reload.
          </p>

          <div className="row gap-2 wrap crash-actions">
            {state && (
              <button type="button" className="btn btn-primary btn-lg" onClick={this.saveTheRun}>
                Export this run
              </button>
            )}
            <button type="button" className="btn btn-lg" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>

          <p className="hint">
            The autosave is untouched, so reloading and choosing <strong>Continue</strong> will
            usually pick the run back up.
          </p>

          <details className="crash-details">
            <summary>What went wrong</summary>
            <pre className="crash-trace">
              {error.message}
              {info ? `\n${info}` : ''}
            </pre>
          </details>
        </div>
      </main>
    );
  }
}
