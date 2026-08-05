// LifeOS Notification OS — Web Push service worker. Hand-written and
// minimal on purpose (no Workbox/PWA build plugin in this project) since
// its only job is: receive a push event from the backend's real `web-push`
// (VAPID) delivery, show it as a native OS notification, and route a click
// back into the app. Registered by services/webPush.js.

self.addEventListener('install', () => {
  // Activate the new worker immediately rather than waiting for every
  // existing tab to close — a notification-delivery worker with stale
  // logic sitting idle in the background is worse than a brief mid-session
  // swap.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'LifeOS', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title ?? 'LifeOS';
  const options = {
    body: payload.body ?? '',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: payload.notificationId ?? undefined, // same-tag pushes collapse instead of stacking, matching the backend's own Smart Grouping intent
    data: { notificationId: payload.notificationId, relatedType: payload.relatedType, relatedId: payload.relatedId, url: payload.url },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? '/notifications';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'notification-click', data: event.notification.data });
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
