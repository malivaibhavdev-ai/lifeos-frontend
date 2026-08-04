import { apiClient } from '../../api/client';
import { registerSyncHandler } from '../../services/offlineSync';

// Same generic execute-replay pattern as every other module's syncHandlers
// (see Family's syncHandlers.js) — replays a queued {method, url, payload}
// directly against apiClient. File uploads (create document, upload
// version) never go through this queue at all (multipart bodies aren't
// offline-replayable) — only the plain-JSON mutations registered below do.
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

const ENTITY_TYPES = ['document', 'documentFolder', 'automationRule'];

for (const entityType of ENTITY_TYPES) {
  registerSyncHandler(entityType, genericHandler());
}
