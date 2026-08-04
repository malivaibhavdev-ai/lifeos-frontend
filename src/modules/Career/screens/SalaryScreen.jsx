import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { useSalaryRecordList } from '../hooks/useSalaryRecords';
import { usePredictedSalary } from '../hooks/useCareerHub';
import { SalaryRecordFormSheet } from '../components/SalaryRecordFormSheet';

export function SalaryScreen() {
  const navigate = useNavigate();
  const { data: records } = useSalaryRecordList();
  const { data: prediction } = usePredictedSalary();
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const items = records ?? EMPTY_ARRAY;

  return (
    <Screen>
      <PageContainer maxWidth="max-w-5xl" className="flex flex-1 min-h-0 flex-col">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} className="p-1" aria-label="Go back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Salary</p>
          <button type="button" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600" aria-label="Add salary record">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>

        {prediction?.predictedNextAmount ? (
          <div className="mb-3 rounded-xl bg-primary-50 px-4 py-3 dark:bg-primary-950">
            <p className="text-sm font-semibold text-primary-700 dark:text-primary-300">
              Projected next: {prediction.predictedNextAmount.toLocaleString()} ({prediction.confidence} confidence)
            </p>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto pb-6">
          {items.length === 0 ? (
            <EmptyState icon="cash-outline" title="No salary history yet" description="Track your salary changes over time." ctaLabel="Add Salary Record" onCtaPress={() => setShowForm(true)} />
          ) : (
            <div className="sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
              {items.map((record) => (
                <button type="button" key={record._id} onClick={() => setEditingRecord(record)} className="mb-2 flex w-full flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900 sm:mb-0">
                  <div>
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">{record.currency} {record.amount.toLocaleString()}</span>
                    <span className="mt-0.5 block text-xs text-gray-400 dark:text-gray-500">{record.date?.slice(0, 10)}</span>
                  </div>
                  {record.isPromotion ? <Icon name="trending-up" size={16} color="#22c55e" /> : null}
                </button>
              ))}
            </div>
          )}
        </div>

        <SalaryRecordFormSheet visible={showForm || Boolean(editingRecord)} onClose={() => { setShowForm(false); setEditingRecord(null); }} record={editingRecord} />
      </PageContainer>
    </Screen>
  );
}
