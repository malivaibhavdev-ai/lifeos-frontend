import { reminderApi } from '../api/reminderApi';
import { useActiveReminderStore } from '../Store/activeReminderStore';
import { getEscalationPolicy } from '../constants/reminderPolicies';

// Web replacement for the mobile app's local-notification-chain scheduler
// (services/notificationService.js's scheduleReminderChain/foreground
// listener). There is no OS-level scheduled-notification API for a web tab
// that isn't open, so this polls the backend — the same authoritative
// source the mobile app's own server-side escalation sweep already trusts —
// for reminders that have become due, and reacts exactly like the mobile
// app's `registerForegroundReminderListener` would: a 'forced' escalation
// reminder opens the full-screen ForcedReminderOverlay; anything else gets
// a best-effort Web Notification (works only while the OS grants permission
// and the browser is capable — never a hard requirement).
const POLL_INTERVAL_MS = 15000;

let timer = null;
const lastNotifiedAt = new Map(); // reminderId -> ms timestamp, throttles repeat Web Notifications

function isDue(reminder) {
  return reminder.remindAt && new Date(reminder.remindAt).getTime() <= Date.now();
}

function isAcknowledgeable(reminder) {
  return reminder.status === 'scheduled' || reminder.status === 'pending_ack';
}

async function ensureWebNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
}

function notifyBrowser(reminder) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const policy = getEscalationPolicy(reminder.escalation);
  const lastAt = lastNotifiedAt.get(reminder._id) ?? 0;
  const throttleMs = (policy.intervalMinutes ?? 5) * 60000;
  if (Date.now() - lastAt < throttleMs) return;

  lastNotifiedAt.set(reminder._id, Date.now());
  try {
    const notification = new Notification(reminder.title ?? 'Reminder', {
      body: reminder.body || 'Reminder',
      tag: reminder._id,
    });
    notification.onclick = () => {
      window.focus();
      reminderApi.markOpened(reminder._id).catch(() => {});
    };
  } catch {
    // Notification constructor can throw in some contexts (e.g. service-
    // worker-only platforms); a missed browser notification is non-fatal,
    // the next poll cycle (or the in-app overlay, for forced reminders)
    // still covers it.
  }
}

async function poll() {
  if (document.visibilityState !== 'visible') return;

  let due = [];
  try {
    due = (await reminderApi.upcoming(50)) ?? [];
  } catch {
    return; // offline / unreachable — try again next cycle, same best-effort tone as the rest of the app
  }

  const dueNow = due.filter((r) => isDue(r) && isAcknowledgeable(r));
  if (dueNow.length === 0) return;

  const alreadyShowing = useActiveReminderStore.getState().activeReminder;

  for (const reminder of dueNow) {
    const policy = getEscalationPolicy(reminder.escalation);
    if (policy.requiresForegroundOverlay) {
      if (!alreadyShowing) {
        useActiveReminderStore.getState().showReminder({
          reminderId: reminder._id,
          entityType: reminder.entityType,
          entityId: reminder.entityId,
          escalation: reminder.escalation,
          title: reminder.title,
          body: reminder.body,
        });
      }
    } else {
      notifyBrowser(reminder);
    }
  }
}

// Call once at app startup, after auth is hydrated (see App.jsx). Idempotent.
export function initReminderPolling() {
  if (timer) return;
  ensureWebNotificationPermission();
  poll();
  timer = setInterval(poll, POLL_INTERVAL_MS);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') poll();
  });
}

export function stopReminderPolling() {
  if (timer) clearInterval(timer);
  timer = null;
  lastNotifiedAt.clear();
}
