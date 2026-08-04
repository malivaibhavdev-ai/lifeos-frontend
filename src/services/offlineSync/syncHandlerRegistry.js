// The Offline Engine's plugin registry — deliberately the same shape as the
// backend's Calendar Engine provider registry (calendarEngine/
// calendarProviderRegistry.js): any module with mutations worth queuing
// while offline (Habits today; Tasks/Calendar/Finance/Health/Goals/Notes
// later) registers a handler here instead of the sync manager knowing about
// each module by name. Adding a new consumer is: give it an
// `execute(operation)` function, call registerSyncHandler once — zero
// changes to syncManager.js or this file's other registrations.
const handlers = new Map();

function registerSyncHandler(entityType, handler) {
  if (typeof handler?.execute !== 'function') {
    throw new Error(`Sync handler for "${entityType}" must implement execute(operation)`);
  }
  handlers.set(entityType, handler);
}

function getSyncHandler(entityType) {
  return handlers.get(entityType);
}

export { registerSyncHandler, getSyncHandler };
