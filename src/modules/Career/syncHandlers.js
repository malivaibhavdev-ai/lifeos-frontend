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

// The entire Career Operating System's mutable entities, all through the
// same generic handler every other module uses — file uploads (Resume,
// CareerDocument) are excluded since a binary payload can't survive a
// serialized sync-queue entry and are plain online-only mutations instead.
registerSyncHandler('careerProfile', genericHandler());
registerSyncHandler('workHistoryEntry', genericHandler());
registerSyncHandler('educationEntry', genericHandler());
registerSyncHandler('skill', genericHandler());
registerSyncHandler('learningItem', genericHandler());
registerSyncHandler('certification', genericHandler());
registerSyncHandler('jobApplication', genericHandler());
registerSyncHandler('interview', genericHandler());
registerSyncHandler('resume', genericHandler());
registerSyncHandler('portfolioProject', genericHandler());
registerSyncHandler('performanceReview', genericHandler());
registerSyncHandler('salaryRecord', genericHandler());
registerSyncHandler('contact', genericHandler());
registerSyncHandler('careerDocument', genericHandler());
