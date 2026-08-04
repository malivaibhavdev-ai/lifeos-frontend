import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useActiveReminderStore } from '../../Store/activeReminderStore';
import { reminderApi } from '../../api/reminderApi';
import { navigateToEntity } from '../../Navigation/navigateToEntity';
import { Icon } from './Icon';
import { notificationAsync, NotificationFeedbackType } from '../../services/haptics';
import { COLORS } from '../../theme/colors';

// Global, module-agnostic full-screen takeover for 'forced' reminders,
// driven entirely by activeReminderStore — mirrors the mobile app's
// ForcedReminderOverlay exactly (same actions, same copy, same escalation
// semantics), only the delivery trigger differs (see
// services/reminderPollingService.js). Mount once near the app root, not
// inside any one screen. No backdrop-click/Escape dismissal — matches the
// mobile version's `onRequestClose={() => {}}`, since a forced reminder is
// deliberately not casually dismissible.
export function ForcedReminderOverlay() {
  const activeReminder = useActiveReminderStore((s) => s.activeReminder);
  const clearReminder = useActiveReminderStore((s) => s.clearReminder);
  const [showSkipReason, setShowSkipReason] = useState(false);
  const [skipReason, setSkipReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!activeReminder) return;
    previouslyFocused.current = document.activeElement;
    dialogRef.current?.focus();
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
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
  }, [activeReminder]);

  if (!activeReminder) return null;

  const handleAction = async (action, extra = {}) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    notificationAsync(NotificationFeedbackType.Success);

    try {
      await reminderApi.acknowledge(activeReminder.reminderId, { action, ...extra });
    } catch {
      // Best-effort: even if the network call fails, the overlay still
      // dismisses — the user made their choice, the backend's own sweep
      // will reconcile eventually rather than leaving them stuck.
    }

    setIsSubmitting(false);
    setShowSkipReason(false);
    setSkipReason('');
    clearReminder();
  };

  const handleReschedule = () => {
    const { entityType, entityId } = activeReminder;
    clearReminder();
    navigateToEntity(entityType, entityId);
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6">
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="forced-reminder-title"
        tabIndex={-1}
        className="w-full max-w-sm rounded-3xl bg-white p-6 outline-none dark:bg-gray-900"
      >
        <div className="mb-4 h-14 w-14 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
          <Icon name="alarm" size={28} color={COLORS.danger} />
        </div>

        <p id="forced-reminder-title" className="text-xl font-bold text-gray-900 dark:text-white">
          {activeReminder.title}
        </p>
        {activeReminder.body ? (
          <p className="mt-1 text-base text-gray-500 dark:text-gray-400">{activeReminder.body}</p>
        ) : null}

        {showSkipReason ? (
          <div className="mt-5">
            <input
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              placeholder="Reason (optional)"
              autoFocus
              className="h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white"
            />
            <button
              type="button"
              onClick={() => handleAction('skipped', { reason: skipReason.trim() || undefined })}
              disabled={isSubmitting}
              className="mt-3 h-12 w-full rounded-xl bg-gray-900 text-base font-semibold text-white disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900"
            >
              Confirm skip
            </button>
            <button
              type="button"
              onClick={() => setShowSkipReason(false)}
              className="mt-2 h-10 w-full text-sm font-medium text-gray-500 dark:text-gray-400"
            >
              Back
            </button>
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => handleAction('done')}
              disabled={isSubmitting}
              aria-label="Mark reminder done"
              className="h-12 rounded-xl bg-primary-600 text-base font-semibold text-white disabled:opacity-50"
            >
              Done
            </button>
            <button
              type="button"
              onClick={() => handleAction('snoozed', { snoozeMinutes: 10 })}
              disabled={isSubmitting}
              aria-label="Snooze reminder for 10 minutes"
              className="h-12 rounded-xl bg-gray-100 text-base font-semibold text-gray-900 disabled:opacity-50 dark:bg-gray-800 dark:text-white"
            >
              Snooze 10 min
            </button>
            <button
              type="button"
              onClick={handleReschedule}
              aria-label="Reschedule reminder"
              className="h-12 rounded-xl bg-gray-100 text-base font-semibold text-gray-900 dark:bg-gray-800 dark:text-white"
            >
              Reschedule
            </button>
            <button
              type="button"
              onClick={() => setShowSkipReason(true)}
              aria-label="Skip reminder"
              className="h-12 rounded-xl text-base font-medium text-danger"
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
