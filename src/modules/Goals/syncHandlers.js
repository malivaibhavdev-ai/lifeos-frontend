import { apiClient } from '../../api/client';
import { registerSyncHandler } from '../../services/offlineSync';

// Same generic replay shape as Habits' handler — idempotencyKey travels in
// the body so a replayed create/update after reconnect is safe to retry.
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

registerSyncHandler('lifeArea', genericHandler());
registerSyncHandler('vision', genericHandler());
registerSyncHandler('goal', genericHandler());
registerSyncHandler('project', genericHandler());
registerSyncHandler('milestone', genericHandler());
registerSyncHandler('goalLink', genericHandler());
