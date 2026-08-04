import { reminderApi } from '../../../api/reminderApi';
import { syncEntityReminders, clearEntityReminders } from '../../../services/notificationService';

const ENTITY_TYPE = 'habit';

// Unlike a Task's reminders (a user-edited list embedded in the task
// response), a habit's single forward-looking reminder is computed
// server-side (see backend habit.service.js's syncHabitReminder, which
// re-anchors it to the habit's next scheduled occurrence). The client side
// just needs to know what that computed reminder currently is, which is
// exactly what the existing generic GET /reminders?entityType&entityId
// already answers — no habit-specific reminder endpoint needed.
export async function syncHabitReminders(habit) {
  if (!habit?._id) return;
  try {
    const reminders = await reminderApi.list({ entityType: ENTITY_TYPE, entityId: habit._id });
    await syncEntityReminders({
      entityType: ENTITY_TYPE,
      entityId: habit._id,
      title: habit.name,
      body: habit.description,
      reminders,
    });
  } catch {
    // Best-effort — local notification scheduling should never block the
    // habit save flow; the backend's own Reminder Engine sweep is the
    // source of truth for delivery regardless of whether this succeeds.
  }
}

export async function clearHabitReminders(habitId) {
  await clearEntityReminders(ENTITY_TYPE, habitId).catch(() => {});
}
