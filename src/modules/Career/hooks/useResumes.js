import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { resumeApi } from '../api/resume.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const resumeKeys = { all: ['resumes'], list: () => [...resumeKeys.all, 'list'] };

function invalidateResumes(queryClient) {
  queryClient.invalidateQueries({ queryKey: resumeKeys.all });
  queryClient.invalidateQueries({ queryKey: ['careerHub'] });
}

export function useResumeList() {
  return useQuery({ queryKey: resumeKeys.list(), queryFn: () => resumeApi.list() });
}
export function useCreateResume() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'resume', opType: 'create', method: 'POST', buildUrl: () => '/resumes',
    apiCall: (payload) => resumeApi.create(payload),
    onSuccess: () => invalidateResumes(queryClient),
  });
}
export function useUpdateResume() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'resume', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/resumes/${id}`,
    apiCall: ({ id, ...payload }) => resumeApi.update(id, payload),
    onSuccess: () => invalidateResumes(queryClient),
  });
}
export function useDeleteResume() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'resume', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/resumes/${id}`,
    apiCall: (id) => resumeApi.delete(id),
    onSuccess: () => invalidateResumes(queryClient),
  });
}
export function useRecordResumeDownload() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'resume', opType: 'update', method: 'PATCH', buildUrl: (id) => `/resumes/${id}/download`,
    apiCall: (id) => resumeApi.recordDownload(id),
    onSuccess: () => invalidateResumes(queryClient),
  });
}
// File uploads can't be offline-queued (the binary payload wouldn't survive
// a serialized sync-queue entry) — same constraint as Notes' own file
// upload, so this is a plain online-only mutation.
export function useUploadResumeFile() {
  return useMutation({ mutationFn: (formData) => resumeApi.upload(formData) });
}
