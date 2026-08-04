import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Icon } from '../../../components/ui/Icon';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useSearch, useCreateSavedSearch, useDeleteSavedSearch, useSavedSearchList } from '../hooks/useSearch';
import { useNoteUiStore } from '../store/noteUiStore';

const TYPE_META = {
  note: { icon: 'document-text-outline', label: 'Note' },
  journalEntry: { icon: 'book-outline', label: 'Daily Note' },
  task: { icon: 'checkbox-outline', label: 'Task' },
};

export function SearchScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  const recentSearches = useNoteUiStore((s) => s.recentSearches);
  const addRecentSearch = useNoteUiStore((s) => s.addRecentSearch);
  const clearRecentSearches = useNoteUiStore((s) => s.clearRecentSearches);

  const { data: results, isFetching } = useSearch(submitted);
  const { data: savedSearches } = useSavedSearchList();
  const createSavedSearch = useCreateSavedSearch();
  const deleteSavedSearch = useDeleteSavedSearch();

  const runSearch = (term) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setSubmitted(trimmed);
    addRecentSearch(trimmed);
  };

  const handleResultPress = (result) => {
    if (result.type === 'note') navigate(`/notes/${result.id}`);
    else if (result.type === 'journalEntry') navigate('/notes/daily');
  };

  return (
    <Screen>
      <PageContainer maxWidth="max-w-5xl">
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      <div className="flex flex-row items-center px-4 pb-2 pt-1">
        <button type="button" onClick={() => navigate(-1)} className="mr-3" aria-label="Back">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <div className="flex flex-1 flex-row items-center rounded-xl bg-gray-100 px-3 dark:bg-gray-900">
          <Icon name="search-outline" size={16} color="#94a3b8" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') runSearch(query);
            }}
            placeholder="Search notes, journal, tasks…"
            aria-label="Search notes, journal, tasks"
            autoFocus
            className="ml-2 flex-1 bg-transparent py-2.5 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
          />
          {submitted ? (
            <button
              type="button"
              onClick={() => createSavedSearch.mutate({ name: submitted, query: submitted })}
              aria-label="Save this search"
            >
              <Icon name="bookmark-outline" size={18} color="#2563eb" />
            </button>
          ) : null}
        </div>
      </div>

      {!submitted ? (
        <div className="flex-1 overflow-y-auto px-4 pt-2">
          {savedSearches?.length > 0 ? (
            <div className="mb-5">
              <p className="mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">Saved Searches</p>
              {savedSearches.map((s) => (
                <div
                  key={s._id}
                  className="mb-1.5 flex flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900"
                >
                  <button type="button" onClick={() => runSearch(s.query)} className="flex flex-1 flex-row items-center">
                    <Icon name="bookmark" size={14} color="#2563eb" />
                    <span className="ml-2 text-sm text-gray-800 dark:text-gray-200">{s.name}</span>
                  </button>
                  <button type="button" onClick={() => deleteSavedSearch.mutate(s._id)} aria-label="Delete saved search">
                    <Icon name="close" size={16} color="#cbd5e1" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {recentSearches.length > 0 ? (
            <div>
              <div className="mb-2 flex flex-row items-center justify-between">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Recent</span>
                <button type="button" onClick={clearRecentSearches}>
                  <span className="text-xs text-gray-400">Clear</span>
                </button>
              </div>
              {recentSearches.map((term) => (
                <button type="button" key={term} onClick={() => runSearch(term)} className="flex w-full flex-row items-center py-2 text-left">
                  <Icon name="time-outline" size={15} color="#94a3b8" />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{term}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : isFetching ? (
        <div className="mt-10 flex justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
        </div>
      ) : !results || results.length === 0 ? (
        <EmptyState icon="search-outline" title="No results" description={`Nothing matched "${submitted}"`} />
      ) : (
        <div className="flex-1 overflow-y-auto px-4 pt-2">
          {results.map((result) => {
            const meta = TYPE_META[result.type] ?? TYPE_META.note;
            return (
              <button
                type="button"
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultPress(result)}
                className="mb-2 flex w-full flex-col rounded-xl border border-gray-100 bg-white p-3 text-left dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex flex-row items-center">
                  <Icon name={meta.icon} size={13} color="#94a3b8" />
                  <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">{meta.label}</span>
                  <span className="ml-2 text-xs text-gray-300 dark:text-gray-600">{dayjs(result.date).format('MMM D')}</span>
                </div>
                <p className="mt-1 truncate text-base font-semibold text-gray-900 dark:text-white">{result.title}</p>
                {result.snippet ? (
                  <p className="mt-0.5 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{result.snippet}</p>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
      </div>
      </PageContainer>
    </Screen>
  );
}
