import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { emergencyContactApi } from '../api/emergencyContact.api';

export const emergencyContactKeys = {
  all: (householdId) => ['emergencyContacts', householdId],
  list: (householdId, params) => [...emergencyContactKeys.all(householdId), 'list', params],
  center: (householdId) => [...emergencyContactKeys.all(householdId), 'center'],
  medical: (householdId) => ['familyMedical', householdId],
};

function invalidate(queryClient, householdId) {
  queryClient.invalidateQueries({ queryKey: emergencyContactKeys.all(householdId) });
}

export function useEmergencyContacts(householdId, params) {
  return useQuery({
    queryKey: emergencyContactKeys.list(householdId, params),
    queryFn: () => emergencyContactApi.list(householdId, params),
    enabled: Boolean(householdId),
  });
}

export function useEmergencyCenter(householdId) {
  return useQuery({
    queryKey: emergencyContactKeys.center(householdId),
    queryFn: () => emergencyContactApi.getEmergencyCenter(householdId),
    enabled: Boolean(householdId),
  });
}

export function useMedicalOverview(householdId) {
  return useQuery({
    queryKey: emergencyContactKeys.medical(householdId),
    queryFn: () => emergencyContactApi.getMedicalOverview(householdId),
    enabled: Boolean(householdId),
  });
}

export function useCreateEmergencyContact(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => emergencyContactApi.create(householdId, payload),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useUpdateEmergencyContact(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => emergencyContactApi.update(householdId, id, payload),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useDeleteEmergencyContact(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => emergencyContactApi.delete(householdId, id),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}
