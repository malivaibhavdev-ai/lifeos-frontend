// Mirrors backend/src/modules/reminders/constants/reminderConstants.js.
// Kept as a plain object (not an enum-locked type) for the same reason as
// the backend: adding a new escalation level later is a config change on
// both sides, never a breaking one — an unrecognized level here falls back
// to DEFAULT_POLICY exactly like the server does.
export const ESCALATION_LEVELS = {
  SOFT: 'soft',
  NORMAL: 'normal',
  FORCED: 'forced',
};

export const ESCALATION_POLICIES = {
  soft: { maxEscalations: 0, intervalMinutes: null, requiresForegroundOverlay: false, label: 'Soft', description: 'One gentle notification, no follow-up.' },
  normal: { maxEscalations: 3, intervalMinutes: 5, requiresForegroundOverlay: false, label: 'Normal', description: 'Re-notifies every 5 min if ignored, up to 3 times.' },
  forced: { maxEscalations: 6, intervalMinutes: 3, requiresForegroundOverlay: true, label: 'Forced', description: 'Full-screen when the app is open, re-notifies every 3 min, up to 6 times.' },
};

const DEFAULT_POLICY = { maxEscalations: 3, intervalMinutes: 5, requiresForegroundOverlay: false, label: 'Normal', description: '' };

export function getEscalationPolicy(level) {
  return ESCALATION_POLICIES[level] ?? DEFAULT_POLICY;
}

export const ESCALATION_LEVEL_ORDER = ['soft', 'normal', 'forced'];

// Notification category identifiers — kept for parity with the mobile
// constants module even though the web app has no local-notification
// scheduler (see services/notificationService.js).
export const NOTIFICATION_CATEGORIES = {
  normal: 'reminder-normal',
  forced: 'reminder-forced',
};

export const NOTIFICATION_ACTIONS = {
  DONE: 'done',
  SNOOZE: 'snoozed',
  RESCHEDULE: 'rescheduled',
  SKIP: 'skipped',
};
