import { apiClient } from '../../api/client';
import { registerSyncHandler } from '../../services/offlineSync';

// Same generic execute-replay pattern as every other module's handler —
// replays a queued {method, url, payload} directly against apiClient once
// connectivity returns.
registerSyncHandler('notification', {
  async execute(operation) {
    await apiClient.request({ method: operation.method, url: operation.url, data: operation.payload });
  },
});
