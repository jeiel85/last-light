import type { ReactNode } from 'react';

interface PanelProps {
  title?: string;
  /** Small monospaced note aligned to the right of the title. */
  note?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Removes the inner padding, for panels that host their own scroller. */
  flush?: boolean;
}

export function Panel({ title, note, actions, children, className = '', flush }: PanelProps) {
  return (
    <section className={`panel ${className}`}>
      {(title || actions) && (
        <header className="panel-head">
          {title && <h2 className="panel-title">{title}</h2>}
          {note && <span className="panel-note mono">{note}</span>}
          {actions && <div className="panel-actions">{actions}</div>}
        </header>
      )}
      <div className={flush ? 'panel-body-flush' : 'panel-body'}>{children}</div>
    </section>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="empty-state">{children}</p>;
}
