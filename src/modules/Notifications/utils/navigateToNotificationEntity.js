import { router } from '../../../Navigation/router';

// Web equivalent of the mobile app's own navigateToNotificationEntity.js.
// Notification.model.js's `relatedType` enum is wider than the reminder
// engine's own (task/household/document/analyticsAlert/chore/familyGoal/
// goal/habit/notificationDigest) — this only wires up the deep links whose
// target route is actually known/verified (task, habit, document, goal).
// The rest are a documented, honest no-op rather than a guessed route that
// could 404 — their notifications still work, they just don't deep-link
// past the Notification Detail page yet.
export function navigateToNotificationEntity(relatedType, relatedId) {
  if (!relatedId) return;

  try {
    if (relatedType === 'task') {
      router.navigate(`/tasks/${relatedId}`);
    } else if (relatedType === 'habit') {
      router.navigate(`/habits/${relatedId}`);
    } else if (relatedType === 'document') {
      router.navigate(`/documents/${relatedId}`);
    } else if (relatedType === 'goal') {
      router.navigate(`/goals/${relatedId}`);
    }
  } catch {
    // Router tree shape didn't match (e.g. mid-auth-transition) — the
    // notification itself was still processed, so this is non-fatal.
  }
}
