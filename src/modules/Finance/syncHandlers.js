import { apiClient } from '../../api/client';
import { registerSyncHandler } from '../../services/offlineSync';

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

// Covers both the Finance module and the Investments module — they shipped
// together in Phase 9, same "one syncHandlers file for the whole platform"
// convention Phase 8 used for Health/Sleep/Workout.
registerSyncHandler('financeSettings', genericHandler());
registerSyncHandler('exchangeRate', genericHandler());
registerSyncHandler('financeAccount', genericHandler());
registerSyncHandler('financeCategory', genericHandler());
registerSyncHandler('transaction', genericHandler());
registerSyncHandler('budget', genericHandler());
registerSyncHandler('bill', genericHandler());
registerSyncHandler('billPayment', genericHandler());
registerSyncHandler('debt', genericHandler());
registerSyncHandler('debtPayment', genericHandler());
registerSyncHandler('investmentPortfolio', genericHandler());
registerSyncHandler('investmentAsset', genericHandler());
registerSyncHandler('priceSnapshot', genericHandler());
registerSyncHandler('investmentTransaction', genericHandler());
registerSyncHandler('sipPlan', genericHandler());
