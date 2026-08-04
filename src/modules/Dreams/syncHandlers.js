import { apiClient } from '../../api/client';
import { registerSyncHandler } from '../../services/offlineSync';

// Same generic execute-replay pattern as Habits/Health's handlers — replays
// a queued {method, url, payload} directly against apiClient, merging the
// idempotencyKey into the body so the dream routes' idempotencyKey field
// dedupes a request that actually reached the server once before but lost
// its response to a dropped connection.
registerSyncHandler('dreamEntry', {
  async execute(operation) {
    await apiClient.request({
      method: operation.method,
      url: operation.url,
      data: { ...operation.payload, idempotencyKey: operation.idempotencyKey },
    });
  },
});

registerSyncHandler('dreamSettings', {
  async execute(operation) {
    await apiClient.request({ method: operation.method, url: operation.url, data: operation.payload });
  },
});
