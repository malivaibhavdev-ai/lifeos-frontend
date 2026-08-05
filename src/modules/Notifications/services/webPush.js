import { deviceApi } from '../api/device.api';

// Real browser Web Push subscription flow — no client library needed, the
// Push API/Notification API are native browser APIs. Pairs with the
// backend's real `web-push` (VAPID) delivery channel (see
// deliveryChannels.js) and public/sw.js's push handler.

export function isWebPushSupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

// VAPID public keys are delivered base64url-encoded; PushManager.subscribe
// needs them as a raw Uint8Array — this is the standard, widely-documented
// conversion (no npm package exists solely for this one function).
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function registerServiceWorker() {
  return navigator.serviceWorker.register('/sw.js');
}

export async function getWebPushSubscriptionStatus() {
  if (!isWebPushSupported()) return { supported: false, permission: 'unsupported', subscribed: false };

  const registration = await navigator.serviceWorker.getRegistration('/sw.js');
  const subscription = await registration?.pushManager.getSubscription();
  return { supported: true, permission: Notification.permission, subscribed: Boolean(subscription) };
}

// Requests permission, registers the service worker, subscribes with the
// backend's real VAPID public key, and registers the resulting
// PushSubscription as a Device — same multi-device Device collection the
// mobile app's Expo tokens live in, so this browser now shows up
// alongside a user's phone in the Devices screen.
export async function subscribeToWebPush(deviceName) {
  if (!isWebPushSupported()) throw new Error('Web Push is not supported in this browser');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Notification permission was not granted');

  const { publicKey, available } = await deviceApi.getVapidPublicKey();
  if (!available || !publicKey) throw new Error('Web Push is not configured on the server yet');

  const registration = await registerServiceWorker();
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const device = await deviceApi.registerWeb({
    subscription: subscription.toJSON(),
    deviceName: deviceName ?? `${navigator.platform || 'Browser'} (${navigator.userAgent.split(') ')[0].split('(').pop() ?? 'web'})`,
  });

  return device;
}

export async function unsubscribeFromWebPush() {
  if (!isWebPushSupported()) return;
  const registration = await navigator.serviceWorker.getRegistration('/sw.js');
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) {
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    return endpoint;
  }
  return null;
}
