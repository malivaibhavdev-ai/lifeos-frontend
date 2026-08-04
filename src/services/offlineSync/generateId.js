let counter = 0;

// A client-side idempotency/queue-entry id only needs to be unique, not
// cryptographically random — timestamp + random + a same-millisecond
// tiebreaker counter is more than sufficient.
export function generateId() {
  counter = (counter + 1) % 1_000_000;
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}-${counter.toString(36)}`;
}
