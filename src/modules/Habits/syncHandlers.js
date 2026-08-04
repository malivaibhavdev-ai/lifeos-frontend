import { apiClient } from '../../api/client';
import { registerSyncHandler } from '../../services/offlineSync';

// Habits is the first (pilot) consumer of the Offline Sync Engine — see
// services/offlineSync/syncHandlerRegistry.js. Replays a queued operation's
// raw {method, url, payload} directly against apiClient (bypassing the
// normal call()/unwrap() wrapper, which is designed for an immediate UI
// response, not a background replay). The idempotency key is merged into
// the request body — the habit routes check it there (see
// habit.validation.js's idempotencyKey field), not as a header — so a
// request that actually reached the server once before but whose response
// was lost to a dropped connection doesn't create a duplicate on retry.
registerSyncHandler('habit', {
  async execute(operation) {
    await apiClient.request({
      method: operation.method,
      url: operation.url,
      data: { ...operation.payload, idempotencyKey: operation.idempotencyKey },
    });
  },
});
