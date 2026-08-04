import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useDocumentTrash, useRestoreDocument, usePermanentlyDeleteDocument } from '../hooks/useDocuments';
import { formatBytes } from '../utils/formatBytes';

export function DocumentTrashScreen() {
  const navigate = useNavigate();
  const { data, isLoading } = useDocumentTrash();
  const restoreDocument = useRestoreDocument();
  const permanentlyDelete = usePermanentlyDeleteDocument();

  const documents = data?.items ?? [];

  const handlePermanentDelete = (doc) => {
    if (!window.confirm(`Permanently delete "${doc.title}"? This cannot be undone.`)) return;
    permanentlyDelete.mutate(doc._id);
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="ml-3 text-lg font-bold text-gray-900 dark:text-white">Trash</p>
        </div>

        {!isLoading && documents.length === 0 ? (
          <EmptyState icon="trash-outline" title="Trash is empty" description="Deleted documents appear here for recovery." />
        ) : (
          documents.map((doc) => (
            <div key={doc._id} className="mb-3 flex flex-row items-center rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{doc.title}</p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{formatBytes(doc.sizeBytes)}</p>
              </div>
              <button type="button" onClick={() => restoreDocument.mutate(doc._id)} className="mr-3" aria-label="Restore">
                <Icon name="refresh-outline" size={20} color="#2563eb" />
              </button>
              <button type="button" onClick={() => handlePermanentDelete(doc)} aria-label="Delete forever">
                <Icon name="trash-outline" size={20} color="#ef4444" />
              </button>
            </div>
          ))
        )}
      </PageContainer>
    </Screen>
  );
}
