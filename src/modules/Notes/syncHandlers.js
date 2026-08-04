import { apiClient } from '../../api/client';
import { registerSyncHandler } from '../../services/offlineSync';

// Same generic replay shape as Habits'/Goals' handlers — idempotencyKey
// travels in the body so a replayed create/update after reconnect is safe.
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

registerSyncHandler('note', genericHandler());
registerSyncHandler('notebook', genericHandler());
registerSyncHandler('journalEntry', genericHandler());
registerSyncHandler('template', genericHandler());
registerSyncHandler('knowledgeLink', genericHandler());
registerSyncHandler('savedSearch', genericHandler());
