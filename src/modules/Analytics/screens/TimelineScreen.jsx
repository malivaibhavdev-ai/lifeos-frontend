import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useAnalyticsTimeline } from '../hooks/useAnalyticsTimeline';

const SOURCE_ICON = { career: 'briefcase-outline', documents: 'document-outline', family: 'people-outline', goals: 'flag-outline', milestones: 'trophy-outline' };
const SOURCE_COLOR = { career: '#2563eb', documents: '#7c3aed', family: '#0d9488', goals: '#f59e0b', milestones: '#22c55e' };

export function TimelineScreen() {
  const navigate = useNavigate();
  const { data: entries, isLoading } = useAnalyticsTimeline({});

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-2xl">
        <div className="flex flex-row items-center pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="ml-3 text-lg font-bold text-gray-900 dark:text-white">Life Timeline</p>
        </div>

        {!isLoading && (entries ?? []).length === 0 ? (
          <EmptyState icon="time-outline" title="Nothing here yet" description="Career, document, family, and goal milestones show up here chronologically." />
        ) : (
          (entries ?? []).map((entry, i) => (
            <div key={i} className="mb-3 flex flex-row">
              <div className="mr-3 flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `${SOURCE_COLOR[entry.source] ?? '#94a3b8'}20` }}>
                  <Icon name={SOURCE_ICON[entry.source] ?? 'ellipse-outline'} size={16} color={SOURCE_COLOR[entry.source] ?? '#94a3b8'} />
                </div>
                {i < entries.length - 1 ? <div className="mt-1 w-px flex-1 bg-gray-200 dark:bg-gray-700" /> : null}
              </div>
              <div className="flex-1 pb-3">
                <p className="text-sm text-gray-900 dark:text-white">{entry.summary}</p>
                <p className="mt-0.5 text-[10px] capitalize text-gray-400 dark:text-gray-500">
                  {entry.source} · {new Date(entry.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </PageContainer>
    </Screen>
  );
}
