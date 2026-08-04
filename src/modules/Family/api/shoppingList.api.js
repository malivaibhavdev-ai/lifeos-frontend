import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const shoppingListApi = {
  listLists: (householdId, params) => call(apiClient.get(`/family/${householdId}/shopping-lists`, { params })),
  createList: (householdId, payload) => call(apiClient.post(`/family/${householdId}/shopping-lists`, payload)),
  getList: (householdId, id) => call(apiClient.get(`/family/${householdId}/shopping-lists/${id}`)),
  updateList: (householdId, id, payload) => call(apiClient.patch(`/family/${householdId}/shopping-lists/${id}`, payload)),
  deleteList: (householdId, id) => call(apiClient.delete(`/family/${householdId}/shopping-lists/${id}`)),

  addItem: (householdId, listId, payload) => call(apiClient.post(`/family/${householdId}/shopping-lists/${listId}/items`, payload)),
  updateItem: (householdId, listId, itemId, payload) =>
    call(apiClient.patch(`/family/${householdId}/shopping-lists/${listId}/items/${itemId}`, payload)),
  deleteItem: (householdId, listId, itemId) =>
    call(apiClient.delete(`/family/${householdId}/shopping-lists/${listId}/items/${itemId}`)),
};
