import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useUpcomingBills, useMarkBillPaid, useMarkBillSkipped, useBillList, useDeleteBill } from '../hooks/useBills';
import { formatMoney } from '../constants/financeConstants';
import { BillFormSheet } from '../components/BillFormSheet';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const UpcomingBillCard = memo(function UpcomingBillCard({ payment, onMarkPaid, onSkip }) {
  return (
    <div className="mx-4 mb-2 rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{payment.bill?.name ?? 'Bill'}</p>
          <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">Due {payment.dueDate}</p>
        </div>
        <span className="text-sm font-bold text-gray-900 dark:text-white">{formatMoney(payment.amountDue, payment.currency)}</span>
      </div>
      <div className="mt-2 flex flex-row">
        <button type="button" onClick={() => onMarkPaid(payment._id)} className="mr-2 flex-1 items-center rounded-lg bg-success py-2">
          <span className="text-xs font-semibold text-white">Mark Paid</span>
        </button>
        <button type="button" onClick={() => onSkip(payment._id)} className="flex-1 items-center rounded-lg border border-gray-200 py-2 dark:border-gray-700">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Skip</span>
        </button>
      </div>
    </div>
  );
});

const BillRow = memo(function BillRow({ bill, onDelete }) {
  return (
    <div
      onContextMenu={(e) => { e.preventDefault(); onDelete(bill._id); }}
      className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900"
    >
      <span className="text-sm text-gray-900 dark:text-white">{bill.name}</span>
      <div className="flex flex-row items-center gap-2">
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">{formatMoney(bill.amount, bill.currency)}</span>
        <button type="button" aria-label="Delete bill" onClick={() => onDelete(bill._id)} className="p-1">
          <Icon name="trash-outline" size={16} color="#ef4444" />
        </button>
      </div>
    </div>
  );
});

export function BillsScreen() {
  const navigate = useNavigate();
  const { data: upcoming } = useUpcomingBills({ days: 60 });
  const { data: bills } = useBillList();
  const markPaid = useMarkBillPaid();
  const markSkipped = useMarkBillSkipped();
  const deleteBill = useDeleteBill();
  const [showForm, setShowForm] = useState(false);

  const payments = upcoming ?? EMPTY_ARRAY;
  const billList = bills ?? EMPTY_ARRAY;

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)} className="p-1">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Bills</p>
        <button type="button" aria-label="Add bill" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 pt-2">
        {payments.length === 0 && billList.length === 0 ? (
          <EmptyState icon="receipt-outline" title="No bills yet" description="Add a recurring bill or subscription to track it and get reminders." ctaLabel="Add Bill" onCtaPress={() => setShowForm(true)} />
        ) : (
          <>
            <p className="mx-4 mb-2 text-xs font-semibold uppercase text-gray-400">Upcoming</p>
            {payments.map((p) => (
              <UpcomingBillCard key={p._id} payment={p} onMarkPaid={(id) => markPaid.mutate({ paymentId: id })} onSkip={(id) => markSkipped.mutate(id)} />
            ))}

            <p className="mx-4 mb-2 mt-4 text-xs font-semibold uppercase text-gray-400">All Bills</p>
            {billList.map((bill) => (
              <BillRow key={bill._id} bill={bill} onDelete={deleteBill.mutate} />
            ))}
          </>
        )}
      </div>
      </PageContainer>

      <BillFormSheet visible={showForm} onClose={() => setShowForm(false)} />
    </Screen>
  );
}
