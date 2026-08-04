// Web stand-in for services/notificationService.js. The mobile app schedules
// local on-device notifications (expo-notifications) as a backup delivery
// channel for task/entity reminders; there is no equivalent concept for a
// browser tab that isn't running, so this is a no-op shim purely so the
// Tasks hooks (useCreateTask/useUpdateTask/useMarkTaskStatus/...) that call
// these after every mutation keep an identical call shape. Server-side
// reminder delivery (email/push) is unaffected — only the local scheduling
// half is stubbed. Revisit once a Notifications/Reminders module is ported.
export async function syncTaskReminders(_task) {}

export async function clearTaskReminders(_taskId) {}

// Generic entity-shaped counterparts of the two functions above — Calendar's
// useCalendarEvents (and any future module) call these directly with a plain
// {entityType, entityId, title, body, reminders} shape instead of a Task.
// Same no-op treatment; see the file-level comment.
export async function syncEntityReminders(_entity) {}

export async function clearEntityReminders(_entityType, _entityId) {}
