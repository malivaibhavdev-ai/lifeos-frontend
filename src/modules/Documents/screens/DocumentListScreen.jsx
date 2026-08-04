import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useDocuments, useBulkArchiveDocuments, useBulkDeleteDocuments } from '../hooks/useDocuments';
import { DocumentCard } from '../components/DocumentCard';

const FILTER_TO_PARAMS = {
  favorites: { isFavorite: true },
  needsReview: {},
  unfiled: { folder: '' },
  expiringSoon: {},
};

export function DocumentListScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');
  const params = filter ? FILTER_TO_PARAMS[filter] ?? {} : {};

  const { data, isLoading } = useDocuments(params);
  const bulkArchive = useBulkArchiveDocuments();
  const bulkDelete = useBulkDeleteDocuments();
  const [selectedIds, setSelectedIds] = useState([]);

  const documents = data?.items ?? [];
  const isSelecting = selectedIds.length > 0;

  const toggleSelect = (doc) => {
    setSelectedIds((prev) => (prev.includes(doc._id) ? prev.filter((id) => id !== doc._id) : [...prev, doc._id]));
  };

  const title = useMemo(() => {
    if (filter === 'favorites') return 'Favorites';
    if (filter === 'expiringSoon') return 'Expiring Soon';
    if (filter === 'needsReview') return 'Needs Review';
    if (filter === 'unfiled') return 'Unfiled';
    return 'All Documents';
  }, [filter]);

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{isSelecting ? `${selectedIds.length} selected` : title}</p>
          {isSelecting ? (
            <button type="button" onClick={() => setSelectedIds([])}>
              <span className="text-sm font-medium text-primary-600">Cancel</span>
            </button>
          ) : (
            <div style={{ width: 26 }} />
          )}
        </div>

        {!isLoading && documents.length === 0 ? (
          <EmptyState icon="document-outline" title="No documents" description="Nothing here yet." />
        ) : (
          documents.map((doc) => (
            <DocumentCard
              key={doc._id}
              document={doc}
              selected={selectedIds.includes(doc._id)}
              onPress={(d) => (isSelecting ? toggleSelect(d) : navigate(`/documents/${d._id}`))}
              onLongPress={toggleSelect}
            />
          ))
        )}

        {isSelecting ? (
          <div className="fixed inset-x-0 bottom-0 z-10 flex flex-row items-center justify-around border-t border-gray-100 bg-white py-3 dark:border-gray-800 dark:bg-gray-900">
            <button
              type="button"
              onClick={() => { bulkArchive.mutate({ ids: selectedIds, isArchived: true }); setSelectedIds([]); }}
              className="flex flex-col items-center"
            >
              <Icon name="archive-outline" size={20} color="#2563eb" />
              <span className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-300">Archive</span>
            </button>
            <button
              type="button"
              onClick={() => { bulkDelete.mutate(selectedIds); setSelectedIds([]); }}
              className="flex flex-col items-center"
            >
              <Icon name="trash-outline" size={20} color="#ef4444" />
              <span className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-300">Delete</span>
            </button>
          </div>
        ) : null}
      </PageContainer>
    </Screen>
  );
}
