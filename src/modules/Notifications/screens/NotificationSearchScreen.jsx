import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useNotificationSearch } from '../hooks/useNotificationSearch';
import { NotificationCard } from '../components/NotificationCard';
import { PRIORITY_LEVELS, PRIORITY_LABEL } from '../constants/notificationConstants';

export function NotificationSearchScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [priority, setPriority] = useState(null);
  const [status, setStatus] = useState(null);

  const { data, isFetching } = useNotificationSearch({ query, priority: priority ?? undefined, status: status ?? undefined, limit: 50 });
  const results = data ?? [];

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center pb-2 pt-1" style={{ gap: 10 }}>
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <div className="flex flex-1 flex-row items-center rounded-full bg-gray-100 px-3.5 py-2.5 dark:bg-gray-800">
            <Icon name="search-outline" size={16} color="#94a3b8" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notifications..."
              autoFocus
              className="ml-2 flex-1 bg-transparent text-[15px] text-gray-900 outline-none dark:text-white"
            />
            {!isFetching && query ? (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear">
                <Icon name="close-circle" size={16} color="#94a3b8" />
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex flex-row flex-wrap pb-3" style={{ gap: 8 }}>
          {['all', 'unread', 'archived', 'pinned'].map((s) => {
            const key = s === 'all' ? null : s;
            const isSelected = status === key;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize ${
                  isSelected ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300'
                }`}
              >
                {s}
              </button>
            );
          })}
          {PRIORITY_LEVELS.map((p) => {
            const isSelected = priority === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(isSelected ? null : p)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  isSelected ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300'
                }`}
              >
                {PRIORITY_LABEL[p]}
              </button>
            );
          })}
        </div>

        {!query && !priority && !status ? (
          <EmptyState icon="search-outline" title="Search your notifications" description="Type a keyword or pick a filter above." />
        ) : results.length === 0 && !isFetching ? (
          <EmptyState icon="search-outline" title="No results" description="Try a different keyword or filter." />
        ) : (
          results.map((n) => (
            <NotificationCard
              key={n._id}
              notification={n}
              onPress={(item) => navigate(`/notifications/${item._id}`)}
              onToggleRead={() => {}}
              onDelete={() => {}}
            />
          ))
        )}
      </PageContainer>
    </Screen>
  );
}
