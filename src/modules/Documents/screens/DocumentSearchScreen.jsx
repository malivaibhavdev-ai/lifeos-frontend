import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useDocumentSearch, useSavedSearches, useCreateSavedSearch, useDeleteSavedSearch } from '../hooks/useDocumentSearch';
import { DocumentCard } from '../components/DocumentCard';

export function DocumentSearchScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const { data: results, isFetching } = useDocumentSearch({ query: submittedQuery });
  const { data: savedSearches } = useSavedSearches();
  const createSavedSearch = useCreateSavedSearch();
  const deleteSavedSearch = useDeleteSavedSearch();

  const handleSaveSearch = () => {
    if (!submittedQuery.trim()) return;
    createSavedSearch.mutate({ name: submittedQuery.trim(), query: { query: submittedQuery.trim() } });
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center pb-2 pt-1" style={{ gap: 10 }}>
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <div className="flex flex-1 flex-row items-center rounded-xl bg-gray-100 px-3 dark:bg-gray-800">
            <Icon name="search-outline" size={18} color="#94a3b8" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setSubmittedQuery(query); }}
              placeholder="Search titles, tags, OCR text…"
              className="ml-2 h-11 flex-1 bg-transparent text-base text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {!submittedQuery ? (
          <>
            {savedSearches?.length > 0 ? (
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Saved Searches</p>
                {savedSearches.map((s) => (
                  <div key={s._id} className="mb-2 flex flex-row items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-900">
                    <button type="button" onClick={() => { setQuery(s.query?.query ?? ''); setSubmittedQuery(s.query?.query ?? ''); }} className="text-left">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</span>
                    </button>
                    <button type="button" onClick={() => deleteSavedSearch.mutate(s._id)} aria-label="Delete saved search">
                      <Icon name="close" size={16} color="#94a3b8" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon="search-outline" title="Search your documents" description="Search by title, tags, category, or OCR-extracted text." />
            )}
          </>
        ) : (
          <>
            <div className="mb-2 flex flex-row items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">{isFetching ? 'Searching…' : `${results?.length ?? 0} results`}</span>
              <button type="button" onClick={handleSaveSearch}>
                <span className="text-xs font-medium text-primary-600">Save search</span>
              </button>
            </div>
            {(results ?? []).map((doc) => (
              <DocumentCard key={doc._id} document={doc} onPress={(d) => navigate(`/documents/${d._id}`)} />
            ))}
          </>
        )}
      </PageContainer>
    </Screen>
  );
}
