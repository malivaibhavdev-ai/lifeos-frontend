import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useNotificationDashboard } from '../hooks/useNotifications';
import { NotificationCard } from '../components/NotificationCard';
import { MetricTile } from '../components/MetricTile';

const MENU_ITEMS = [
  { key: 'search', label: 'Search', icon: 'search-outline', route: '/notifications/search' },
  { key: 'rules', label: 'Rules', icon: 'options-outline', route: '/notifications/rules' },
  { key: 'preferences', label: 'Preferences', icon: 'notifications-outline', route: '/notifications/preferences' },
  { key: 'devices', label: 'Devices', icon: 'phone-portrait-outline', route: '/notifications/devices' },
  { key: 'analytics', label: 'Analytics', icon: 'stats-chart-outline', route: '/notifications/analytics' },
];

function Section({ title, items, navigate }) {
  if (!items?.length) return null;
  return (
    <div className="mt-5">
      <p className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</p>
      {items.slice(0, 5).map((n) => (
        <NotificationCard
          key={n._id}
          notification={n}
          onPress={(item) => navigate(`/notifications/${item._id}`)}
          onToggleRead={() => {}}
          onDelete={() => {}}
        />
      ))}
    </div>
  );
}

export function NotificationDashboardScreen() {
  const navigate = useNavigate();
  const { data, isLoading } = useNotificationDashboard();
  const analytics = data?.analytics;

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Dashboard</p>
          <div style={{ width: 26 }} />
        </div>

        <div className="flex flex-row flex-wrap" style={{ gap: 10 }}>
          <MetricTile label="Delivery Rate" value={analytics?.deliveryRate} suffix="%" color="#22c55e" />
          <MetricTile label="Open Rate" value={analytics?.openRate} suffix="%" color="#2563eb" />
          <MetricTile label="Response Rate" value={analytics?.responseRate} suffix="%" color="#f59e0b" />
        </div>

        <div className="mt-4 flex flex-row flex-wrap" style={{ gap: 8 }}>
          {MENU_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => navigate(item.route)}
              className="flex flex-row items-center rounded-full border border-gray-200 px-3.5 py-2 dark:border-gray-700"
            >
              <Icon name={item.icon} size={15} color="#2563eb" />
              <span className="ml-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
            </button>
          ))}
        </div>

        {!isLoading && !data?.today?.length && !data?.unread?.length && !data?.upcoming?.length ? (
          <EmptyState icon="notifications-off-outline" title="All quiet" description="Nothing to show on your dashboard yet." />
        ) : (
          <>
            <Section title={`Critical (${data?.critical?.length ?? 0})`} items={data?.critical} navigate={navigate} />
            <Section title="Today" items={data?.today} navigate={navigate} />
            <Section title="Unread" items={data?.unread} navigate={navigate} />
            <Section title="Upcoming" items={data?.upcoming} navigate={navigate} />
            <Section title="Recent" items={data?.recent} navigate={navigate} />
          </>
        )}
      </PageContainer>
    </Screen>
  );
}
