// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BreakdownBuilder, RESOURCES, Survivors } from '@engine';
import { Bar } from '@ui/components/Bar';
import { BreakdownPopover } from '@ui/components/BreakdownPopover';
import { Button } from '@ui/components/Button';
import { Gauge } from '@ui/components/Gauge';
import { Modal } from '@ui/components/Modal';
import { Portrait } from '@ui/components/Portrait';
import { Meter, Stat } from '@ui/components/Stat';
import { Tabs } from '@ui/components/Tabs';
import { newState } from '../helpers';

describe('primitives', () => {
  it('a button reports its disabled state to assistive technology', async () => {
    let clicks = 0;
    const { rerender } = render(<Button onClick={() => (clicks += 1)}>Build</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Build' }));
    expect(clicks).toBe(1);

    rerender(
      <Button disabled onClick={() => (clicks += 1)}>
        Build
      </Button>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Build' }));
    expect(clicks).toBe(1);
  });

  it('a bar communicates its value without relying on colour', () => {
    render(<Bar value={0.42} label="Water 42%" />);
    expect(screen.getByRole('img', { name: 'Water 42%' })).toBeTruthy();
  });

  it('a bar clamps values outside 0–1 instead of overflowing', () => {
    const { container, rerender } = render(<Bar value={5} />);
    expect((container.querySelector('.bar-fill') as HTMLElement).style.width).toBe('100%');
    rerender(<Bar value={-3} />);
    expect((container.querySelector('.bar-fill') as HTMLElement).style.width).toBe('0%');
  });

  it('a meter shows the number as well as the bar', () => {
    render(<Meter label="Health" value={73} />);
    expect(screen.getByText('73')).toBeTruthy();
    expect(screen.getByText('Health')).toBeTruthy();
  });

  it('a stat renders its label and value', () => {
    render(<Stat label="Crew" value={4} />);
    expect(screen.getByText('Crew')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
  });

  it('tabs expose the selected tab through aria', async () => {
    let active: 'a' | 'b' = 'a';
    render(
      <Tabs
        tabs={[
          { id: 'a', label: 'Alpha' },
          { id: 'b', label: 'Beta' },
        ]}
        active="a"
        onChange={(id) => (active = id)}
        ariaLabel="Sections"
      />,
    );
    const tablist = screen.getByRole('tablist', { name: 'Sections' });
    expect(within(tablist).getByRole('tab', { name: /Alpha/ }).getAttribute('aria-selected')).toBe('true');
    await userEvent.click(within(tablist).getByRole('tab', { name: /Beta/ }));
    expect(active).toBe('b');
  });
});

describe('breakdown popover', () => {
  const breakdown = new BreakdownBuilder('Water Reclaimer L2', 12)
    .mul('Crew efficiency', 1.2)
    .add('Rain catchment', 2.2, 'It is raining.', 'Nothing to do — enjoy it.')
    .build({ round: 1 });

  it('opens on click and lists every contributing term', async () => {
    render(
      <BreakdownPopover breakdown={breakdown} title="Water — production" unit="L">
        <span>17</span>
      </BreakdownPopover>,
    );
    await userEvent.click(screen.getByRole('button', { name: /Inspect/ }));
    const dialog = screen.getByRole('dialog', { name: /Water — production/ });
    expect(within(dialog).getByText('Water Reclaimer L2')).toBeTruthy();
    expect(within(dialog).getByText('Crew efficiency')).toBeTruthy();
    expect(within(dialog).getByText('Rain catchment')).toBeTruthy();
    expect(within(dialog).getByText(/Nothing to do/)).toBeTruthy();
  });

  it('closes again on a second click', async () => {
    render(
      <BreakdownPopover breakdown={breakdown} title="Water — production">
        <span>17</span>
      </BreakdownPopover>,
    );
    const trigger = screen.getByRole('button', { name: /Inspect/ });
    await userEvent.click(trigger);
    expect(screen.queryByRole('dialog')).toBeTruthy();
    await userEvent.click(trigger);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('says so rather than showing an empty box when there are no terms', async () => {
    render(
      <BreakdownPopover breakdown={{ total: 0, terms: [] }} title="Nothing">
        <span>0</span>
      </BreakdownPopover>,
    );
    await userEvent.click(screen.getByRole('button', { name: /Inspect/ }));
    expect(screen.getByText(/No contributing terms/)).toBeTruthy();
  });
});

describe('gauge', () => {
  it('shows the level, the direction of travel, and a way into the arithmetic', async () => {
    const production = new BreakdownBuilder('Reclaimer', 8).build();
    const consumption = new BreakdownBuilder('Drinking water', 4).build();
    render(
      <Gauge def={RESOURCES.water} value={20} cap={60} net={4} production={production} consumption={consumption} />,
    );
    expect(screen.getByText('Water')).toBeTruthy();
    expect(screen.getByText('+4/day')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: /Water — production/ }));
    expect(screen.getByRole('dialog', { name: /production/ })).toBeTruthy();
  });

  it('warns how long a falling resource has left', () => {
    render(<Gauge def={RESOURCES.food} value={12} cap={60} net={-3} />);
    expect(screen.getByText('4d left')).toBeTruthy();
  });

  it('does not claim a deadline for a resource that is not falling', () => {
    render(<Gauge def={RESOURCES.food} value={12} cap={60} net={2} />);
    expect(screen.queryByText(/d left/)).toBeNull();
  });
});

describe('modal', () => {
  it('is a labelled dialog and closes on Escape when it is dismissible', async () => {
    let closed = false;
    render(
      <Modal title="Saves" onClose={() => (closed = true)}>
        <p>body</p>
      </Modal>,
    );
    expect(screen.getByRole('dialog', { name: 'Saves' })).toBeTruthy();
    await userEvent.keyboard('{Escape}');
    expect(closed).toBe(true);
  });

  it('cannot be escaped when the story requires an answer', async () => {
    let closed = false;
    render(
      <Modal title="A Decision" dismissible={false} onClose={() => (closed = true)}>
        <p>body</p>
      </Modal>,
    );
    await userEvent.keyboard('{Escape}');
    expect(closed).toBe(false);
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
  });

  it('moves focus to the marked control when it opens', () => {
    render(
      <Modal title="Focus" dismissible={false}>
        <button type="button" data-autofocus>
          Carry on
        </button>
      </Modal>,
    );
    expect(document.activeElement?.textContent).toBe('Carry on');
  });
});

describe('portrait', () => {
  it('renders a labelled, deterministic portrait for a survivor', () => {
    const state = newState();
    const survivor = Survivors.livingSurvivors(state)[0]!;
    const { container, rerender } = render(<Portrait survivor={survivor} />);
    const first = container.innerHTML;
    expect(screen.getByRole('img', { name: `Portrait of ${survivor.name} ${survivor.surname}` })).toBeTruthy();
    rerender(<Portrait survivor={survivor} />);
    expect(container.innerHTML).toBe(first);
  });

  it('marks the dead visibly, not only by colour', () => {
    const state = newState();
    const survivor = { ...Survivors.livingSurvivors(state)[0]!, alive: false };
    const { container } = render(<Portrait survivor={survivor} />);
    expect(container.querySelector('.portrait-dead')).toBeTruthy();
  });
});
