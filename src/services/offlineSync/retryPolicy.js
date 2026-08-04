const BASE_BACKOFF_MS = 2000;
const MAX_BACKOFF_MS = 60000;

// Pure math, deliberately kept free of any native-module imports (unlike
// syncManager.js, which pulls in expo-sqlite/expo-network/AppState) so it
// stays trivially unit-testable under this project's plain `node` Jest
// environment — same reasoning as occurrenceHelpers.js / boardColumns.js.
export function backoffMs(retryCount) {
  return Math.min(BASE_BACKOFF_MS * 2 ** retryCount, MAX_BACKOFF_MS);
}

export function isDueForRetry(operation, now = Date.now()) {
  if (operation.retryCount === 0) return true;
  return now - operation.updatedAt >= backoffMs(operation.retryCount);
}
