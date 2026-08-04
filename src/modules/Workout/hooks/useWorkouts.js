import { useQuery, useQueryClient } from '@tanstack/react-query';
import { workoutApi } from '../api/workout.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const workoutKeys = {
  all: ['workouts'],
  list: (params) => [...workoutKeys.all, 'list', params],
  streak: () => [...workoutKeys.all, 'streak'],
  templates: () => [...workoutKeys.all, 'templates'],
};

function invalidateWorkouts(queryClient) {
  queryClient.invalidateQueries({ queryKey: workoutKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['calendarEngine'] });
}

export function useWorkoutList(params) {
  return useQuery({ queryKey: workoutKeys.list(params), queryFn: () => workoutApi.list(params) });
}

export function useWorkoutStreak() {
  return useQuery({ queryKey: workoutKeys.streak(), queryFn: () => workoutApi.streak() });
}

export function useWorkoutTemplateList() {
  return useQuery({ queryKey: workoutKeys.templates(), queryFn: () => workoutApi.listTemplates() });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'workout', opType: 'create', method: 'POST', buildUrl: () => '/workout',
    apiCall: (payload) => workoutApi.create(payload),
    onSuccess: () => invalidateWorkouts(queryClient),
  });
}

export function useUpdateWorkout() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'workout', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/workout/${id}`,
    apiCall: ({ id, payload }) => workoutApi.update(id, payload),
    onSuccess: () => invalidateWorkouts(queryClient),
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'workout', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/workout/${id}`,
    apiCall: (id) => workoutApi.delete(id),
    onSuccess: () => invalidateWorkouts(queryClient),
  });
}

export function useCreateWorkoutTemplate() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'workoutTemplate', opType: 'create', method: 'POST', buildUrl: () => '/workout/templates',
    apiCall: (payload) => workoutApi.createTemplate(payload),
    onSuccess: () => invalidateWorkouts(queryClient),
  });
}

export function useDeleteWorkoutTemplate() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'workoutTemplate', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/workout/templates/${id}`,
    apiCall: (id) => workoutApi.deleteTemplate(id),
    onSuccess: () => invalidateWorkouts(queryClient),
  });
}
