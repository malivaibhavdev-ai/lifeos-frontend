import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useAutomationRules, useUpdateAutomationRule, useDeleteAutomationRule } from '../hooks/useDocumentAutomation';

export function AutomationRulesScreen() {
  const navigate = useNavigate();
  const { data: rules, isLoading } = useAutomationRules();
  const updateRule = useUpdateAutomationRule();
  const deleteRule = useDeleteAutomationRule();

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Automation Rules</p>
          <button type="button" onClick={() => navigate('/documents/automation-rules/new')} aria-label="New rule">
            <Icon name="add" size={24} color="#2563eb" />
          </button>
        </div>

        {!isLoading && (rules ?? []).length === 0 ? (
          <EmptyState
            icon="flash-outline"
            title="No automation rules"
            description="Auto-tag, auto-categorize, or auto-file documents as they're uploaded."
            ctaLabel="New rule"
            onCtaPress={() => navigate('/documents/automation-rules/new')}
          />
        ) : (
          (rules ?? []).map((rule) => (
            <div key={rule._id} className="mb-3 flex flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <button type="button" onClick={() => navigate(`/documents/automation-rules/${rule._id}`)} className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{rule.name}</p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">Matched {rule.matchCount} time{rule.matchCount === 1 ? '' : 's'}</p>
              </button>
              <button
                type="button"
                onClick={() => updateRule.mutate({ id: rule._id, payload: { isActive: !rule.isActive } })}
                aria-pressed={rule.isActive}
                aria-label="Toggle rule active"
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
