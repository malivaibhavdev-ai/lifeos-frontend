import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { reportApi } from '../api/report.api';

const key = ['analyticsReports'];

export function useReports() {
  return useQuery({ queryKey: key, queryFn: () => reportApi.list() });
}

export function useReport(id) {
  return useQuery({ queryKey: [...key, id], queryFn: () => reportApi.getById(id), enabled: Boolean(id) });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (payload) => reportApi.generate(payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: key }) });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id) => reportApi.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: key }) });
}

export function useExportReportCSV() {
  return useMutation({ mutationFn: (id) => reportApi.exportCSV(id) });
}

export function useExportReportMarkdown() {
  return useMutation({ mutationFn: (id) => reportApi.exportMarkdown(id) });
}
