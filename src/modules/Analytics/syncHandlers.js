import { apiClient } from '../../api/client';
import { registerSyncHandler } from '../../services/offlineSync';

// Same generic execute-replay pattern as every other module's syncHandlers
// (see Documents/Family's syncHandlers.js) — replays a queued
// {method, url, payload} directly against apiClient.
function genericHandler() {
  return {
    async execute(operation) {
      await apiClient.request({
        method: operation.method,
        url: operation.url,
        data: { ...operation.payload, idempotencyKey: operation.idempotencyKey },
      });
    },
  };
}

const ENTITY_TYPES = ['analyticsDashboard', 'customMetric', 'alertRule'];

for (const entityType of ENTITY_TYPES) {
  registerSyncHandler(entityType, genericHandler());
}
