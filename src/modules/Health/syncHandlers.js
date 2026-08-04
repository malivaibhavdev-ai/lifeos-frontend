import { apiClient } from '../../api/client';
import { registerSyncHandler } from '../../services/offlineSync';

// Registers every entity type across the Phase 8 Health & Wellness
// platform in one place — Water/Weight/Mood/Vitals/BodyMeasurements/
// Nutrition/Meditation/Medicine (this module) plus Sleep/Workout (their
// own module folders, mirroring the backend's separation), since they all
// shipped together and share this exact registration shape.
// Same generic replay shape as every other module's handler — idempotencyKey
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

registerSyncHandler('waterLog', genericHandler());
registerSyncHandler('waterSettings', genericHandler());
registerSyncHandler('weightLog', genericHandler());
registerSyncHandler('moodLog', genericHandler());
registerSyncHandler('vitalSignLog', genericHandler());
registerSyncHandler('bodyMeasurementLog', genericHandler());
registerSyncHandler('mealLog', genericHandler());
registerSyncHandler('meditationSession', genericHandler());
registerSyncHandler('medicine', genericHandler());
registerSyncHandler('sleepLog', genericHandler());
registerSyncHandler('sleepSchedule', genericHandler());
registerSyncHandler('workout', genericHandler());
registerSyncHandler('workoutTemplate', genericHandler());
