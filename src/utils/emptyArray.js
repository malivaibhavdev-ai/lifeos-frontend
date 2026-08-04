// A single frozen, stable-identity empty array/object to fall back to
// instead of `data ?? []` / `data ?? {}` literals. An inline `[]`/`{}`
// fallback is a *new* reference on every render, which defeats any
// `useMemo`/`useCallback`/`React.memo` downstream that depends on it —
// every loading/empty render looks like "the list changed" even though it
// didn't. Reusing one frozen instance keeps referential equality stable
// across renders whenever the underlying query has no data yet.
export const EMPTY_ARRAY = Object.freeze([]);
export const EMPTY_OBJECT = Object.freeze({});
