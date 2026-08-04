// Web replacement for expo-haptics. There is no true haptics equivalent on
// desktop/iOS web — this is a no-op stub (falls back to navigator.vibrate on
// the subset of Android Chrome contexts that support it) so the ~10 call
// sites throughout the app keep an identical import shape.
export const NotificationFeedbackType = { Success: 'success', Warning: 'warning', Error: 'error' };
export const ImpactFeedbackStyle = { Light: 'light', Medium: 'medium', Heavy: 'heavy' };

function vibrate(ms) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms);
}

export async function notificationAsync() {
  vibrate(10);
}

export async function impactAsync() {
  vibrate(10);
}

export async function selectionAsync() {
  vibrate(5);
}
