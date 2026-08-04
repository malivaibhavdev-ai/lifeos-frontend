// Web stand-in for services/focusNotifications.js. The mobile app schedules
// a local on-device notification as a backup "this phase just ended" alert
// (expo-notifications) for when the app is backgrounded; a browser tab that
// isn't in the foreground has no equivalent scheduling primitive available
// here (the Notifications API would need a service worker + user
// permission grant, out of scope for this port). This is a no-op shim so
// useFocusTimer's calls keep an identical shape — the in-app timer still
// completes correctly via its own timestamp comparison regardless, so the
// only loss is the backgrounded-tab alert itself.
export async function scheduleFocusEndNotification(_args) {}

export async function cancelFocusEndNotification() {}
