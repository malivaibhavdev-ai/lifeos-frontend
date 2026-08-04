import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentExportApi } from '../api/documentExport.api';
import { documentKeys } from './useDocuments';
import { documentFolderKeys } from './useDocumentFolders';

export function useExportDocuments() {
  return useMutation({ mutationFn: () => documentExportApi.exportAll() });
}

export function useImportDocuments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => documentExportApi.importAll(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      queryClient.invalidateQueries({ queryKey: documentFolderKeys.all });
    },
  });
}
