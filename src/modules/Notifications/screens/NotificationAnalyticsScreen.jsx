import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useNotificationAnalyticsSummary, useNotificationEventCounts } from '../hooks/useNotificationAnalytics';
import { useGenerateNotificationDigest } from '../hooks/useNotificationDigest';
import { MetricTile } from '../components/MetricTile';
import { PRIORITY_LABEL, DIGEST_PERIODS } from '../constants/notificationConstants';

const EVENT_LABEL = {
  sent: 'Sent', delivered: 'Delivered', opened: 'Opened', dismissed: 'Dismissed',
  clicked: 'Clicked', ignored: 'Ignored', expired: 'Expired', snoozed: 'Snoozed', archived: 'Archived',
};

export function NotificationAnalyticsScreen() {
  const navigate = useNavigate();
  const { data: summary, isLoading } = useNotificationAnalyticsSummary();
  const { data: events } = useNotificationEventCounts();
  const generateDigest = useGenerateNotificationDigest();

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Analytics</p>
          <div style={{ width: 26 }} />
        </div>

        {!isLoading && summary?.total === 0 ? (
          <p className="text-center text-sm text-gray-400 dark:text-gray-500">No notification data yet.</p>
        ) : (
          <>
            <div className="flex flex-row flex-wrap" style={{ gap: 10 }}>
              <MetricTile label="Total" value={summary?.total} color="#2563eb" />
              <MetricTile label="Delivery Rate" value={summary?.deliveryRate} suffix="%" color="#22c55e" />
              <MetricTile label="Open Rate" value={summary?.openRate} suffix="%" color="#f59e0b" />
            </div>
            <div className="mt-2.5 flex flex-row flex-wrap" style={{ gap: 10 }}>
              <MetricTile label="Response Rate" value={summary?.responseRate} suffix="%" color="#a855f7" />
              <MetricTile label="Median Response" value={summary?.medianResponseSeconds} suffix="s" color="#0ea5e9" />
            </div>

            {summary?.byPriority ? (
              <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">By Priority</p>
                {Object.entries(summary.byPriority).map(([priority, count]) => (
                  <div key={priority} className="flex flex-row items-center justify-between py-1">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{PRIORITY_LABEL[priority] ?? priority}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {events ? (
              <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Event Counts</p>
                {Object.entries(events).map(([eventType, count]) => (
                  <div key={eventType} className="flex flex-row items-center justify-between py-1">
                    <span className="text-sm text-gray-600 dark:text-gray-300">{EVENT_LABEL[eventType] ?? eventType}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        )}

        <p className="mb-2 mt-6 text-sm font-semibold text-gray-500 dark:text-gray-400">Generate Digest</p>
        <div className="flex flex-row flex-wrap" style={{ gap: 8 }}>
          {DIGEST_PERIODS.map((period) => (
            <button
              key={period.key}
              type="button"
              onClick={() => generateDigest.mutate(period.key)}
              className="rounded-full border border-gray-200 px-3.5 py-2 text-xs font-medium text-gray-700 dark:border-gray-700 dark:text-gray-300"
            >
              {period.label}
            </button>
          ))}
        </div>
      </PageContainer>
    </Screen>
  );
}
