// Pluggable per-entityType conflict resolution, consulted by syncManager
// whenever a queued operation's server round-trip comes back with an error
// instead of success. A resolver returns one of:
//   'retry'  — presumed transient (network blip, 5xx, timeout); leave the
//              operation queued for the next drain.
//   'drop'   — the operation is moot (its target is already gone, or its
//              effect is already achieved); remove it from the queue
//              without surfacing anything to the user.
//   'surface' — needs a human decision; stop retrying automatically and
//              expose it as a failed operation (see syncQueue's 'dead'
//              status) for manual review.
//
// The default policy below is deliberately simple last-write-wins-lite, not
// a merge engine — true concurrent-edit merging is a much bigger problem
// than this phase's scope, and this app is single-user (multi-device for
// the same account is the only realistic conflict source, and it's rare
// enough that "surface it, let the user decide" is the honest answer rather
// than guessing at an automatic merge). A module wanting smarter behavior
// registers its own resolver via registerConflictResolver.
const resolvers = new Map();

function registerConflictResolver(entityType, resolver) {
  resolvers.set(entityType, resolver);
}

function defaultResolve(operation, error) {
  if (error?.statusCode === 404 && (operation.opType === 'update' || operation.opType === 'delete')) {
    return 'drop';
  }
  if (error?.statusCode === 409) return 'surface';
  if (error?.statusCode >= 400 && error?.statusCode < 500) return 'surface'; // a real validation rejection, not transient
  return 'retry';
}

function resolveConflict(entityType, operation, error) {
  const resolver = resolvers.get(entityType);
  return (resolver ?? defaultResolve)(operation, error);
}

export { registerConflictResolver, resolveConflict };
