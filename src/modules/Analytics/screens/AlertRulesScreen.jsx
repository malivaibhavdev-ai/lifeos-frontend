import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useAlertRules, useUpdateAlertRule, useDeleteAlertRule, useEvaluateAlertRulesNow } from '../hooks/useAnalyticsAlerts';

export function AlertRulesScreen() {
  const navigate = useNavigate();
  const { data: rules, isLoading } = useAlertRules();
  const updateRule = useUpdateAlertRule();
  const deleteRule = useDeleteAlertRule();
  const evaluateNow = useEvaluateAlertRulesNow();

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Alert Rules</p>
          <button type="button" onClick={() => navigate('/analytics/alert-rules/new')} aria-label="New rule">
            <Icon name="add" size={24} color="#2563eb" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => evaluateNow.mutate()}
          className="mb-4 flex w-full flex-row items-center justify-center rounded-xl border border-dashed border-gray-300 py-2.5 dark:border-gray-700"
        >
          <Icon name="refresh-outline" size={16} color="#2563eb" />
          <span className="ml-2 text-sm font-semibold text-primary-600">{evaluateNow.isPending ? 'Checking…' : 'Check rules now'}</span>
        </button>

        {!isLoading && (rules ?? []).length === 0 ? (
          <EmptyState icon="notifications-outline" title="No alert rules yet" description="Get notified when a metric crosses a threshold you care about." ctaLabel="New rule" onCtaPress={() => navigate('/analytics/alert-rules/new')} />
        ) : (
          (rules ?? []).map((rule) => (
            <div key={rule._id} className="mb-3 flex flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{rule.name}</p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">Triggered {rule.triggerCount} time{rule.triggerCount === 1 ? '' : 's'}</p>
              </div>
              <button
                type="button"
                onClick={() => updateRule.mutate({ id: rule._id, payload: { isActive: !rule.isActive } })}
                className={`mr-3 rounded-full border px-3 py-1 ${rule.isActive ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span className={`text-xs font-medium ${rule.isActive ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{rule.isActive ? 'Active' : 'Off'}</span>
              </button>
              <button type="button" onClick={() => deleteRule.mutate(rule._id)} aria-label="Delete rule">
                <Icon name="trash-outline" size={18} color="#94a3b8" />
              </button>
            </div>
          ))
        )}
      </PageContainer>
    </Screen>
  );
}
