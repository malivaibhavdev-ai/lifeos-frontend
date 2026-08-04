import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useDashboards, useCreateDashboard } from '../hooks/useDashboards';

function DashboardFormModal({ visible, onClose }) {
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const createDashboard = useCreateDashboard();

  const handleSubmit = () => {
    if (!name.trim()) return setError('Dashboard name is required');
    createDashboard.mutate(
      { name: name.trim() },
      { onSuccess: () => { onClose(); setName(''); setError(null); }, onError: (e) => setError(e?.message) }
    );
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title="New Dashboard">
      <ErrorBanner message={error} />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Dashboard name *"
        className="h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
    </Modal>
  );
}

export function DashboardListScreen() {
  const navigate = useNavigate();
  const { data: dashboards, isLoading } = useDashboards();
  const [showForm, setShowForm] = useState(false);

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Dashboards</p>
          <button type="button" onClick={() => setShowForm(true)} aria-label="New dashboard">
            <Icon name="add" size={24} color="#2563eb" />
          </button>
        </div>

        {!isLoading && (dashboards ?? []).length === 0 ? (
          <EmptyState icon="grid-outline" title="No dashboards yet" description="Build a custom dashboard with the widgets that matter to you." ctaLabel="New dashboard" onCtaPress={() => setShowForm(true)} />
        ) : (
          (dashboards ?? []).map((dashboard) => (
            <button
              key={dashboard._id}
              type="button"
              onClick={() => navigate(`/analytics/dashboards/${dashboard._id}`, { state: { name: dashboard.name } })}
              className="mb-3 flex w-full flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 text-left dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex flex-row items-center">
                <Icon name={dashboard.icon || 'stats-chart-outline'} size={20} color="#2563eb" />
                <span className="ml-3 text-sm font-semibold text-gray-900 dark:text-white">{dashboard.name}</span>
                {dashboard.isDefault ? (
                  <span className="ml-2 rounded-full bg-primary-100 px-2 py-0.5 dark:bg-primary-900">
                    <span className="text-[10px] font-semibold text-primary-700 dark:text-primary-300">Default</span>
                  </span>
                ) : null}
              </div>
              <Icon name="chevron-forward" size={18} color="#94a3b8" />
            </button>
          ))
        )}
      </PageContainer>

      <DashboardFormModal visible={showForm} onClose={() => setShowForm(false)} />
    </Screen>
  );
}
