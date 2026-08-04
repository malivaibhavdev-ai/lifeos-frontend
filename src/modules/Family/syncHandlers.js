import { apiClient } from '../../api/client';
import { registerSyncHandler } from '../../services/offlineSync';

// Same generic execute-replay pattern as every other module's syncHandlers —
// replays a queued {method, url, payload} directly against apiClient,
// merging idempotencyKey into the body. One handler per household-scoped
// entity type used in useOfflineMutation calls across the Family module.
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

const ENTITY_TYPES = [
  'familyMember', 'familyEvent', 'chore', 'shoppingList', 'familyGoal',
  'familyJournalEntry', 'familyMemory', 'familyNote',
];

for (const entityType of ENTITY_TYPES) {
  registerSyncHandler(entityType, genericHandler());
}
