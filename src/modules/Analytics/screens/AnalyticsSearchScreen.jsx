import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useAnalyticsSearch } from '../hooks/useAnalyticsSearch';

const TYPE_ICON = {
  dashboard: 'grid-outline', widget: 'apps-outline', report: 'document-text-outline',
  customMetric: 'calculator-outline', savedFilter: 'filter-outline', metric: 'analytics-outline',
};

export function AnalyticsSearchScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const { data: results, isFetching } = useAnalyticsSearch(submittedQuery);

  const handleResultPress = (result) => {
    if (result.type === 'dashboard') navigate(`/analytics/dashboards/${result.id}`, { state: { name: result.title } });
    else if (result.type === 'widget') navigate(`/analytics/dashboards/${result.dashboardId}`);
    else if (result.type === 'report') navigate(`/analytics/reports/${result.id}`, { state: { name: result.title } });
    else if (result.type === 'customMetric') navigate(`/analytics/custom-metrics/${result.id}`, { state: { name: result.title } });
    else if (result.type === 'metric') navigate(`/analytics/metrics/${result.id}`, { state: { label: result.title } });
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
              placeholder="Search dashboards, metrics, reports…"
              className="ml-2 h-11 flex-1 bg-transparent text-base text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {!submittedQuery ? (
          <EmptyState icon="search-outline" title="Search Analytics" description="Find dashboards, widgets, custom metrics, reports, and the metric catalog." />
        ) : !isFetching && (results ?? []).length === 0 ? (
          <EmptyState icon="search-outline" title="No results" description={`Nothing matched "${submittedQuery}"`} />
        ) : (
          (results ?? []).map((result, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleResultPress(result)}
              className="mb-2 flex w-full flex-row items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 text-left dark:bg-gray-900"
            >
              <div className="flex flex-row items-center">
                <Icon name={TYPE_ICON[result.type] ?? 'ellipse-outline'} size={16} color="#2563eb" />
                <span className="ml-3 text-sm text-gray-900 dark:text-white">{result.title}</span>
              </div>
              <span className="text-xs capitalize text-gray-400 dark:text-gray-500">{result.type}</span>
            </button>
          ))
        )}
      </PageContainer>
    </Screen>
  );
}
