// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@ui/app/ErrorBoundary';
import { useGameStore } from '@store/gameStore';
import { newState } from '../helpers';

function Boom(): never {
  throw new Error('the reactor is on fire');
}

describe('the error boundary', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // React logs the caught error itself; the test asserts behaviour, not console noise.
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
    useGameStore.setState({ state: null });
  });

  it('renders its children when nothing is wrong', () => {
    render(
      <ErrorBoundary>
        <p>the vault is fine</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('the vault is fine')).toBeTruthy();
  });

  it('catches a render error instead of blanking the page', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('heading', { name: 'The lights went out' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeTruthy();
  });

  it('offers the run as a file when a run is loaded, so the state is not lost', async () => {
    useGameStore.setState({ state: newState() });

    const clicked: string[] = [];
    const createObjectURL = vi.fn(() => 'blob:test');
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true });
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), configurable: true });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        clicked.push(this.download);
      });

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Export this run' }));
    expect(clicked).toHaveLength(1);
    expect(clicked[0]).toMatch(/^lastlight-recovered-day\d+\.json$/);
    expect(createObjectURL).toHaveBeenCalled();
    click.mockRestore();
  });

  it('does not offer a file when there is no run to save', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.queryByRole('button', { name: 'Export this run' })).toBeNull();
  });

  it('shows what went wrong so a report can be copied without dev tools', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/the reactor is on fire/)).toBeTruthy();
  });
});
