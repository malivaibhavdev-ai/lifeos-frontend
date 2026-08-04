import { useQuery, useQueryClient } from '@tanstack/react-query';
import { nutritionApi } from '../api/nutrition.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const nutritionKeys = {
  all: ['nutrition'],
  list: (params) => [...nutritionKeys.all, 'list', params],
  totals: (date) => [...nutritionKeys.all, 'totals', date],
};

function invalidateNutrition(queryClient) {
  queryClient.invalidateQueries({ queryKey: nutritionKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
}

export function useMealList(params) {
  return useQuery({ queryKey: nutritionKeys.list(params), queryFn: () => nutritionApi.list(params) });
}

export function useDailyNutritionTotals(date) {
  return useQuery({ queryKey: nutritionKeys.totals(date), queryFn: () => nutritionApi.getDailyTotals(date), enabled: Boolean(date) });
}

export function useCreateMeal() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'mealLog', opType: 'create', method: 'POST', buildUrl: () => '/nutrition',
    apiCall: (payload) => nutritionApi.create(payload),
    onSuccess: () => invalidateNutrition(queryClient),
  });
}

export function useUpdateMeal() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'mealLog', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/nutrition/${id}`,
    apiCall: ({ id, payload }) => nutritionApi.update(id, payload),
    onSuccess: () => invalidateNutrition(queryClient),
  });
}

export function useDeleteMeal() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'mealLog', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/nutrition/${id}`,
    apiCall: (id) => nutritionApi.delete(id),
    onSuccess: () => invalidateNutrition(queryClient),
  });
}
