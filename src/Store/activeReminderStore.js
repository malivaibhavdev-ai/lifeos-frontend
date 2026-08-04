import { create } from 'zustand';

// Global, module-agnostic — drives the ForcedReminderOverlay from wherever a
// 'forced' reminder is detected as due. Any module can push a reminder in
// here the same way Tasks does; the overlay itself has no idea what created it.
export const useActiveReminderStore = create((set) => ({
  activeReminder: null, // { reminderId, title, body, escalation, entityType, entityId }

  showReminder: (reminder) => set({ activeReminder: reminder }),
  clearReminder: () => set({ activeReminder: null }),
}));
