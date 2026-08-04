import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { shoppingListApi } from '../api/shoppingList.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const shoppingListKeys = {
  all: (householdId) => ['shoppingLists', householdId],
  lists: (householdId, params) => [...shoppingListKeys.all(householdId), 'lists', params],
  detail: (householdId, id) => [...shoppingListKeys.all(householdId), 'detail', id],
};

function invalidate(queryClient, householdId) {
  queryClient.invalidateQueries({ queryKey: shoppingListKeys.all(householdId) });
  queryClient.invalidateQueries({ queryKey: ['family', householdId, 'dashboard'] });
}

export function useShoppingLists(householdId, params) {
  return useQuery({
    queryKey: shoppingListKeys.lists(householdId, params),
    queryFn: () => shoppingListApi.listLists(householdId, params),
    enabled: Boolean(householdId),
  });
}

export function useShoppingList(householdId, id) {
  return useQuery({
    queryKey: shoppingListKeys.detail(householdId, id),
    queryFn: () => shoppingListApi.getList(householdId, id),
    enabled: Boolean(householdId && id),
  });
}

export function useCreateShoppingList(householdId) {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'shoppingList', opType: 'create', method: 'POST', buildUrl: () => `/family/${householdId}/shopping-lists`,
    apiCall: (payload) => shoppingListApi.createList(householdId, payload),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useUpdateShoppingList(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => shoppingListApi.updateList(householdId, id, payload),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useDeleteShoppingList(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => shoppingListApi.deleteList(householdId, id),
    onSuccess: () => invalidate(queryClient, householdId),
  });
}

export function useAddShoppingItem(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, payload }) => shoppingListApi.addItem(householdId, listId, payload),
    onSuccess: (_, { listId }) => queryClient.invalidateQueries({ queryKey: shoppingListKeys.detail(householdId, listId) }),
  });
}

export function useUpdateShoppingItem(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, itemId, payload }) => shoppingListApi.updateItem(householdId, listId, itemId, payload),
    onSuccess: (_, { listId }) => {
      queryClient.invalidateQueries({ queryKey: shoppingListKeys.detail(householdId, listId) });
      queryClient.invalidateQueries({ queryKey: ['family', householdId, 'dashboard'] });
    },
  });
}

export function useDeleteShoppingItem(householdId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, itemId }) => shoppingListApi.deleteItem(householdId, listId, itemId),
    onSuccess: (_, { listId }) => queryClient.invalidateQueries({ queryKey: shoppingListKeys.detail(householdId, listId) }),
  });
}
