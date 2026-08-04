import { useMutation } from '@tanstack/react-query';
import { syncQueue } from './syncQueue';
import { requestSync } from './syncManager';

// A drop-in replacement for React Query's useMutation: same onMutate/
// onSuccess/onError/onSettled options work exactly as normal (so optimistic
// UI updates are still just standard React Query, not a new pattern to
// learn), but a network-unreachable failure (toApiError's statusCode: 0 —
// the request never reached the server at all, as opposed to a real 4xx/5xx
// response) queues the operation for later replay instead of rejecting.
//
// `apiCall` is the module's normal api function (e.g. habitApi.create) used
// for the online path. `method`/`buildUrl` describe how to replay the same
// call later via a raw HTTP request — required separately because a queued
// operation must be fully serializable (stored in SQLite, survives app
// restarts), so it can't just be "the same JS closure, called again later".
export function useOfflineMutation({ entityType, opType, method, buildUrl, apiCall, ...mutationOptions }) {
  const mutationFn = async (variables) => {
    try {
      return await apiCall(variables);
    } catch (error) {
      if (error?.statusCode === 0) {
        await syncQueue.enqueue({ entityType, opType, method, url: buildUrl(variables), payload: variables });
        requestSync();
        return { queued: true };
      }
      throw error;
    }
  };

  return useMutation({ mutationFn, ...mutationOptions });
}
