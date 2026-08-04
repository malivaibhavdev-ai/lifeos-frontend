import { router } from './router';

// Web replacement for navigationRef.js's navigateToEntity — React Router's
// data-router instance exposes an imperative `.navigate()` on itself, which
// is the direct equivalent of the mobile app's standalone
// `createNavigationContainerRef()`: code outside the component tree (the
// reminder polling service, in place of a notification-tap listener) can
// navigate without a ref threaded through props.
export function navigateToEntity(entityType, entityId) {
  if (!entityId) return;

  try {
    if (entityType === 'task') {
      router.navigate(`/tasks/${entityId}`);
    } else if (entityType === 'calendarEvent') {
      router.navigate(`/calendar?openEventId=${entityId}`);
    } else if (entityType === 'habit') {
      router.navigate(`/habits/${entityId}`);
    }
  } catch {
    // Router tree shape didn't match (e.g. mid-auth-transition) — the
    // reminder itself was still processed, so this is non-fatal.
  }
}
