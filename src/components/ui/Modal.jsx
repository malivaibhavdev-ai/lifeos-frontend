import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Shared web replacement for the mobile app's BottomSheetModal. Same props
// contract (visible/onClose/onDone/title/children) so every consumer
// (FilterSheet, SortMenu, form sheets, ...) is untouched — only the
// primitive underneath changes. Centered dialog on wide viewports, bottom
// sheet on narrow ones, decided internally so callers never branch on it.
// Traps focus while open, restores it to the triggering element on close,
// and exposes proper dialog semantics for assistive tech.
export function Modal({ visible, onClose, onDone, title, children }) {
  const titleId = useId();
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!visible) return undefined;

    previouslyFocused.current = document.activeElement;
    const panel = panelRef.current;
    const firstFocusable = panel?.querySelector(FOCUSABLE_SELECTOR);
    (firstFocusable ?? panel)?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const focusable = panel.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-surface-dark shadow-xl outline-none"
      >
        <div className="flex flex-row items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <p id={titleId} className="text-lg font-bold text-gray-900 dark:text-white">
            {title}
          </p>
          <button type="button" onClick={onDone ?? onClose} className="text-base font-semibold text-primary-600">
            Done
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
