import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useWidgets, useDeleteWidget } from '../hooks/useDashboards';
import { WidgetRenderer } from '../components/WidgetRenderer';

export function DashboardScreen() {
  const navigate = useNavigate();
  const { dashboardId } = useParams();
  const location = useLocation();
  const name = location.state?.name;
  const { data: widgets, isLoading } = useWidgets(dashboardId);
  const deleteWidget = useDeleteWidget(dashboardId);

  const handleDeleteWidget = (widget) => {
    if (!window.confirm(`Remove "${widget.title}" from this dashboard?`)) return;
    deleteWidget.mutate(widget._id);
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-4xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="truncate text-lg font-bold text-gray-900 dark:text-white">{name ?? 'Dashboard'}</p>
          <button type="button" onClick={() => navigate(`/analytics/dashboards/${dashboardId}/widgets/new`)} aria-label="Add widget">
            <Icon name="add" size={24} color="#2563eb" />
          </button>
        </div>

        {!isLoading && (widgets ?? []).length === 0 ? (
          <EmptyState
            icon="apps-outline"
            title="No widgets yet"
            description="Add a chart, KPI, or insight card to build your dashboard."
            ctaLabel="Add widget"
            onCtaPress={() => navigate(`/analytics/dashboards/${dashboardId}/widgets/new`)}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(widgets ?? []).map((widget) => (
              <div key={widget._id} className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-3 flex flex-row items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{widget.title}</p>
                  <button type="button" onClick={() => handleDeleteWidget(widget)} aria-label="Remove widget">
                    <Icon name="close" size={16} color="#94a3b8" />
                  </button>
                </div>
                <WidgetRenderer widget={widget} />
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </Screen>
  );
}
