import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { useCareerTimeline } from '../hooks/useCareerHub';

const TYPE_ICON = {
  job: 'briefcase-outline', promotion: 'trending-up-outline', job_end: 'exit-outline',
  certificate: 'ribbon-outline', course: 'book-outline', interview: 'people-outline',
  offer: 'gift-outline', project: 'images-outline', review: 'clipboard-outline',
};

export function CareerTimelineScreen() {
  const navigate = useNavigate();
  const { data: events } = useCareerTimeline();

  const items = events ?? EMPTY_ARRAY;

  return (
    <Screen>
      <PageContainer maxWidth="max-w-3xl" className="flex flex-1 min-h-0 flex-col">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} className="p-1" aria-label="Go back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Career Timeline</p>
          <div className="h-9 w-9" />
        </div>

        <div className="flex-1 overflow-y-auto pb-6 pt-2">
          {items.length === 0 ? (
            <EmptyState icon="time-outline" title="Nothing here yet" description="Your career milestones will appear here as you add them." />
          ) : (
            items.map((event, i) => (
              <div key={`${event.type}-${event.entityId}-${i}`} className="mb-3 flex flex-row">
                <div className="mr-3 flex flex-col items-center">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-950">
                    <Icon name={TYPE_ICON[event.type] ?? 'ellipse-outline'} size={16} color="#2563eb" />
                  </div>
                  {i < items.length - 1 ? <div className="mt-1 w-px flex-1 bg-gray-200 dark:bg-gray-800" /> : null}
                </div>
                <div className="flex-1 pb-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{event.title}</p>
                  <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </PageContainer>
    </Screen>
  );
}
