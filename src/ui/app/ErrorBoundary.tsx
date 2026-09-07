import { Component, type ErrorInfo, type ReactNode } from 'react';
import { buildSaveFile, downloadText, exportSave } from '@save/serialize';
import { useGameStore } from '@store/gameStore';
import { t } from '@i18n';

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
      exportSave(buildSaveFile(state, 0, `Recovered \u2014 day ${state.day}`)),
    );
  };

  override render(): ReactNode {
    const { error, info } = this.state;
    if (!error) return this.props.children;

    const state = useGameStore.getState().state;

    return (
      <main className="crash">
        <div className="crash-inner">
          <p className="eyebrow">{t('crash.eyebrow')}</p>
          <h1 className="crash-title">{t('crash.title')}</h1>
          <p className="prose">
            {t('crash.body', {
              day: state ? t('crash.atDay', { day: state.day }) : '',
            })}
          </p>

          <div className="row gap-2 wrap crash-actions">
            {state && (
              <button type="button" className="btn btn-primary btn-lg" onClick={this.saveTheRun}>
                {t('crash.export')}
              </button>
            )}
            <button type="button" className="btn btn-lg" onClick={() => window.location.reload()}>
              {t('crash.reload')}
            </button>
          </div>

          <p className="hint">{t('crash.hint')}</p>

          <details className="crash-details">
            <summary>{t('crash.details')}</summary>
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
