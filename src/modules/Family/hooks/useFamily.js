import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { familyApi } from '../api/family.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const familyKeys = {
  all: (householdId) => ['family', householdId],
  list: (householdId, params) => [...familyKeys.all(householdId), 'list', params],
  detail: (householdId, id) => [...familyKeys.all(householdId), 'detail', id],
  tree: (householdId) => [...familyKeys.all(householdId), 'tree'],
  dashboard: (householdId) => [...familyKeys.all(householdId), 'dashboard'],
  birthdays: (householdId, days) => [...familyKeys.all(householdId), 'birthdays', days],
  activityLog: (householdId) => [...familyKeys.all(householdId), 'activityLog'],
};

function invalidateFamily(queryClient, householdId) {
  queryClient.invalidateQueries({ queryKey: familyKeys.all(householdId) });
  queryClient.invalidateQueries({ queryKey: ['calendarEngine'] });
}

export function useFamilyMembers(householdId, params) {
  return useQuery({
    queryKey: familyKeys.list(householdId, params),
    queryFn: () => familyApi.list(householdId, params),
    enabled: Boolean(householdId),
  });
}

export function useFamilyMember(householdId, id) {
  return useQuery({
    queryKey: familyKeys.detail(householdId, id),
    queryFn: () => familyApi.getById(householdId, id),
    enabled: Boolean(householdId && id),
  });
}

export function useFamilyTree(householdId) {
  return useQuery({ queryKey: familyKeys.tree(householdId), queryFn: () => familyApi.getTree(householdId), enabled: Boolean(householdId) });
}

export function useFamilyDashboard(householdId) {
  return useQuery({
    queryKey: familyKeys.dashboard(householdId),
    queryFn: () => familyApi.getDashboard(householdId),
    enabled: Boolean(householdId),
  });
}

export function useUpcomingBirthdays(householdId, days = 30) {
  return useQuery({
    queryKey: familyKeys.birthdays(householdId, days),
    queryFn: () => familyApi.upcomingBirthdays(householdId, days),
    enabled: Boolean(householdId),
  });
}

export function useFamilyActivityLog(householdId) {
  return useQuery({
    queryKey: familyKeys.activityLog(householdId),
    queryFn: () => familyApi.getActivityLog(householdId),
    enabled: Boolean(householdId),
  });
}

export function useCreateFamilyMember(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'familyMember', opType: 'create', method: 'POST', buildUrl: () => `/family/${householdId}/members`,
    apiCall: (payload) => familyApi.create(householdId, payload),
    onSuccess: () => invalidateFamily(queryClient, householdId),
  });
}

export function useUpdateFamilyMember(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'familyMember', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/family/${householdId}/members/${id}`,
    apiCall: ({ id, payload }) => familyApi.update(householdId, id, payload),
    onSuccess: () => invalidateFamily(queryClient, householdId),
  });
}

export function useDeleteFamilyMember(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'familyMember', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/family/${householdId}/members/${id}`,
    apiCall: (id) => familyApi.delete(householdId, id),
    onSuccess: () => invalidateFamily(queryClient, householdId),
  });
}

export function useAddGrowthEntry(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, entry }) => familyApi.addGrowthEntry(householdId, id, entry),
    onSuccess: () => invalidateFamily(queryClient, householdId),
  });
}

export function useUpdateElderCare(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, elderCare }) => familyApi.updateElderCare(householdId, id, elderCare),
    onSuccess: () => invalidateFamily(queryClient, householdId),
  });
}

export function useAddRelationship(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => familyApi.addRelationship(householdId, payload),
    onSuccess: () => invalidateFamily(queryClient, householdId),
  });
}

export function useRemoveRelationship(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (relationshipId) => familyApi.removeRelationship(householdId, relationshipId),
    onSuccess: () => invalidateFamily(queryClient, householdId),
  });
}

export function useExportFamilyData(householdId) {
  return useMutation({ mutationFn: () => familyApi.exportAll(householdId) });
}

export function useImportFamilyData(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => familyApi.importAll(householdId, payload),
    onSuccess: () => invalidateFamily(queryClient, householdId),
  });
}
