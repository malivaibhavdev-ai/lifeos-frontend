import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const noteApi = {
  // List responses carry pagination metadata alongside the array, same as
  // Tasks — bypasses the generic unwrap() to keep both.
  list: async (params) => {
    try {
      const res = await apiClient.get('/notes', { params });
      return { items: res.data.data, pagination: res.data.pagination };
    } catch (error) {
      throw toApiError(error);
    }
  },
  meta: () => call(apiClient.get('/notes/meta')),
  getById: (id) => call(apiClient.get(`/notes/${id}`)),
  create: (payload) => call(apiClient.post('/notes', payload)),
  update: (id, payload) => call(apiClient.patch(`/notes/${id}`, payload)),
  trash: (id) => call(apiClient.patch(`/notes/${id}/trash`)),
  restore: (id) => call(apiClient.patch(`/notes/${id}/restore`)),
  destroy: (id) => call(apiClient.delete(`/notes/${id}`)),

  // multipart upload — returns {fileName, fileUrl, mimeType, sizeBytes},
  // to be appended into a note's `attachments` array by the caller. Web
  // has a real File object from <input type="file">, so this builds
  // FormData from that directly instead of RN's {uri,name,type} shape.
  uploadAttachment: async (file) => {
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await apiClient.post('/notes/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res.data.data;
    } catch (error) {
      throw toApiError(error);
    }
  },
};
