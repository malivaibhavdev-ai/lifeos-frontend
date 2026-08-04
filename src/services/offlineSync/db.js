import Dexie from 'dexie';

// Web replacement for the mobile app's expo-sqlite `sync_queue` table.
// Same shape (id/entityType/opType/method/url/payload/idempotencyKey/status/
// retryCount/lastError/createdAt/updatedAt), backed by IndexedDB via Dexie
// instead of SQLite. `payload` is stored as a plain object (IndexedDB can
// store structured data directly — no JSON.stringify/parse round-trip needed
// the way SQLite's TEXT column required).
export const db = new Dexie('lifeos_offline_sync');

db.version(1).stores({
  sync_queue: 'id, status, createdAt',
});

export async function getDb() {
  return db;
}
