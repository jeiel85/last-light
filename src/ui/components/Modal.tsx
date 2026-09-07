import { useEffect, useRef, type ReactNode } from 'react';
import { useT } from '@ui/hooks/useTranslation';

interface ModalProps {
  title: string;
  subtitle?: string;
  onClose?: (() => void) | undefined;
  children: ReactNode;
  footer?: ReactNode;
  /** Wide modals host tables and planners; narrow ones host prose. */
  size?: 'narrow' | 'normal' | 'wide';
  /** Story modals must be answered, so they have no dismiss affordance. */
  dismissible?: boolean;
}

/**
 * A focus-trapping dialog. Escape closes it only when it is dismissible, which keeps
 * event modals from being skipped.
 */
export function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  size = 'normal',
  dismissible = true,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const t = useT();

  useEffect(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const preferred = node?.querySelector<HTMLElement>('[data-autofocus]');
    if (preferred) preferred.focus();
    else node?.focus();
    return () => {
      restoreRef.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible && onClose) {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !ref.current) return;
      const focusable = ref.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [dismissible, onClose]);

  return (
    <div
      className="modal-scrim"
      /*
       * Closing on click-of-the-scrim-itself rather than on mousedown: a press that lands
       * outside while a dialog is opening should not dismiss it, and a drag that starts
       * inside and ends outside should not either.
       */
      onClick={dismissible && onClose ? (e) => { if (e.target === e.currentTarget) onClose(); } : undefined}
    >
      <div
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
      >
        <header className="modal-head">
          <div className="col">
            <h2 className="modal-title">{title}</h2>
            {subtitle && <p className="modal-sub">{subtitle}</p>}
          </div>
          {dismissible && onClose && (
            <button type="button" className="modal-close" onClick={onClose} aria-label={t('common.close')}>
              ✕
            </button>
          )}
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-foot">{footer}</footer>}
      </div>
    </div>
  );
}
