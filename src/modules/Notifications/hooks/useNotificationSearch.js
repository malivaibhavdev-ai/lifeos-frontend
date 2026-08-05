import { useQuery } from '@tanstack/react-query';
import { notificationSearchApi } from '../api/notificationSearch.api';

export const notificationSearchKeys = {
  all: ['notificationSearch'],
  results: (params) => [...notificationSearchKeys.all, params],
};

// The search endpoint requires at least one of query/category/priority/
// module/status — enabled mirrors that.
export function useNotificationSearch(params) {
  const hasCriteria = Boolean(
    params?.query?.trim() || params?.category || params?.priority || params?.module || params?.status
  );
  return useQuery({
    queryKey: notificationSearchKeys.results(params),
    queryFn: () => notificationSearchApi.search(params),
    enabled: hasCriteria,
  });
}
