import { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { Icon } from '../../../components/ui/Icon';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { useCreateWeight, useDeleteWeight, useLatestWeight, useWeightList } from '../hooks/useWeight';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const WeightRow = memo(function WeightRow({ item, onDelete }) {
  return (
    <div className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
      <div>
        <span className="text-sm text-gray-500 dark:text-gray-400">{dayjs(item.date).format('MMM D, YYYY')}</span>
        <span className="ml-3 text-base font-semibold text-gray-900 dark:text-white">{item.weightKg}kg</span>
      </div>
      <button type="button" aria-label="Delete weight entry" onContextMenu={(e) => { e.preventDefault(); onDelete(item._id); }} onClick={() => onDelete(item._id)} className="p-1">
        <Icon name="trash-outline" size={16} color="#ef4444" />
      </button>
    </div>
  );
});

export function WeightScreen() {
  const navigate = useNavigate();
  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const { data: latest } = useLatestWeight();
  const { data: history } = useWeightList({ limit: 30 });
  const createWeight = useCreateWeight();
  const deleteWeight = useDeleteWeight();
  const [showForm, setShowForm] = useState(false);
  const [weightKg, setWeightKg] = useState('');
  const [bodyFatPercent, setBodyFatPercent] = useState('');
  const [error, setError] = useState(null);

  const items = history?.items ?? EMPTY_ARRAY;

  const handleSave = () => {
    const value = Number(weightKg);
    if (!value || value <= 0) {
      setError('Enter a valid weight');
      return;
    }
    createWeight.mutate(
      { date: today, weightKg: value, bodyFatPercent: bodyFatPercent ? Number(bodyFatPercent) : null },
      {
        onSuccess: () => {
          setShowForm(false);
          setWeightKg('');
          setBodyFatPercent('');
          setError(null);
        },
        onError: (e) => setError(e?.message ?? 'Could not save'),
      }
    );
  };

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)}>
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Weight</p>
        <button type="button" aria-label="Log weight" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      {latest ? (
        <div className="mx-4 mb-4 flex flex-col items-center rounded-2xl bg-white py-6 dark:bg-gray-900">
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{latest.weightKg}kg</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{dayjs(latest.date).format('MMM D, YYYY')}</p>
          {latest.bodyFatPercent ? <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{latest.bodyFatPercent}% body fat</p> : null}
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto pb-6">
        {items.length === 0 ? (
          <EmptyState icon="scale-outline" title="No weight entries yet" description="Log your weight to start tracking trends." />
        ) : (
          items.map((item) => <WeightRow key={item._id} item={item} onDelete={deleteWeight.mutate} />)
        )}
      </div>
      </PageContainer>

      <Modal visible={showForm} onClose={() => setShowForm(false)} onDone={handleSave} title="Log Weight">
        <ErrorBanner message={error} />
        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Weight (kg)</p>
          <input
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            inputMode="decimal"
            autoFocus
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base text-gray-900 dark:border-gray-700 dark:text-white"
          />
        </div>
        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Body fat % (optional)</p>
          <input
            value={bodyFatPercent}
            onChange={(e) => setBodyFatPercent(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base text-gray-900 dark:border-gray-700 dark:text-white"
          />
        </div>
      </Modal>
    </Screen>
  );
}
