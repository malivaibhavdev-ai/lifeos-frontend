import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useAnalyticsAlerts, useMarkAlertRead, useMarkAllAlertsRead } from '../hooks/useAnalyticsAlerts';
import { AlertCard } from '../components/AlertCard';

export function AlertsScreen() {
  const navigate = useNavigate();
  const { data: alerts, isLoading } = useAnalyticsAlerts({});
  const markRead = useMarkAlertRead();
  const markAllRead = useMarkAllAlertsRead();

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Alerts</p>
          <button type="button" onClick={() => markAllRead.mutate()}>
            <span className="text-xs font-medium text-primary-600">Mark all read</span>
          </button>
        </div>

        {!isLoading && (alerts ?? []).length === 0 ? (
          <EmptyState icon="notifications-outline" title="No alerts yet" description="Smart alerts for trends, streaks, and burnout risk show up here." />
        ) : (
          (alerts ?? []).map((alert) => (
            <AlertCard key={alert._id} alert={alert} onPress={(a) => !a.isRead && markRead.mutate(a._id)} />
          ))
        )}
      </PageContainer>
    </Screen>
  );
}
