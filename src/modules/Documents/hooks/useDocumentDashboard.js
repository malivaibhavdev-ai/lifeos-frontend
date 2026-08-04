import { useQuery } from '@tanstack/react-query';
import { documentDashboardApi } from '../api/documentDashboard.api';

export function useDocumentDashboard() {
  return useQuery({ queryKey: ['documentDashboard'], queryFn: () => documentDashboardApi.getDashboard() });
}
