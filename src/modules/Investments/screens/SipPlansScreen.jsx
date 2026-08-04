import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useSipPlanList, useDeleteSipPlan } from '../hooks/useInvestments';
import { formatMoney } from '../../Finance/constants/financeConstants';
import { SipFormSheet } from '../components/SipFormSheet';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const SipPlanRow = memo(function SipPlanRow({ plan, onDelete }) {
  return (
    <div
      onContextMenu={(e) => { e.preventDefault(); onDelete(plan._id); }}
      className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900"
    >
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{plan.asset?.symbol || plan.asset?.name}</p>
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{plan.portfolio?.name} · {plan.recurrence?.freq?.toLowerCase()}</p>
      </div>
      <div className="flex flex-row items-center gap-2">
        <span className="text-sm font-bold text-gray-900 dark:text-white">{formatMoney(plan.amountPerInstallment, plan.currency)}</span>
        <button type="button" aria-label="Delete SIP plan" onClick={() => onDelete(plan._id)} className="p-1">
          <Icon name="trash-outline" size={16} color="#ef4444" />
        </button>
      </div>
    </div>
  );
});

export function SipPlansScreen() {
  const navigate = useNavigate();
  const { data: plans } = useSipPlanList();
  const deleteSipPlan = useDeleteSipPlan();
  const [showForm, setShowForm] = useState(false);

  const items = plans ?? EMPTY_ARRAY;

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)} className="p-1">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">SIP Plans</p>
        <button type="button" aria-label="Add SIP plan" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 pt-2">
        {items.length === 0 ? (
          <EmptyState icon="repeat-outline" title="No SIP plans yet" description="Set up a recurring investment plan and get reminders for each installment." ctaLabel="Add SIP Plan" onCtaPress={() => setShowForm(true)} />
        ) : (
          items.map((plan) => <SipPlanRow key={plan._id} plan={plan} onDelete={deleteSipPlan.mutate} />)
        )}
      </div>
      </PageContainer>

      <SipFormSheet visible={showForm} onClose={() => setShowForm(false)} />
    </Screen>
  );
}
