import { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { Icon } from '../../../components/ui/Icon';
import { EmptyState } from '../../../components/ui/EmptyState';
import { MEDICINE_LOG_STATUS } from '../constants/healthConstants';
import { useMarkDoseSkipped, useMarkDoseTaken, useMedicineList, useMedicineLogsForDate } from '../hooks/useMedicine';
import { MedicineFormSheet } from '../components/MedicineFormSheet';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const MedicineLogRow = memo(function MedicineLogRow({ log, onSkip, onTaken }) {
  const statusMeta = MEDICINE_LOG_STATUS[log.status];
  return (
    <div className="mx-4 mb-2 flex flex-row items-center rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: `${statusMeta.color}20` }}>
        <Icon name="medkit-outline" size={16} color={statusMeta.color} />
      </div>
      <div className="ml-3 min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{log.medicine?.name ?? 'Medicine'}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {log.doseTime} · {log.medicine?.dosage} · {statusMeta.label}
        </p>
      </div>
      {log.status === 'pending' ? (
        <div className="flex flex-row items-center gap-2">
          <button type="button" aria-label="Skip dose" onClick={() => onSkip(log._id)}>
            <Icon name="close-circle-outline" size={24} color="#f59e0b" />
          </button>
          <button type="button" aria-label="Mark dose taken" onClick={() => onTaken(log._id)}>
            <Icon name="checkmark-circle" size={24} color="#22c55e" />
          </button>
        </div>
      ) : null}
    </div>
  );
});

const MedicineRow = memo(function MedicineRow({ medicine, onEdit }) {
  return (
    <button
      type="button"
      onClick={() => onEdit(medicine)}
      className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-row items-center rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900"
    >
      <p className="flex-1 text-sm font-semibold text-gray-900 dark:text-white">{medicine.name}</p>
      <span className="text-xs text-gray-400 dark:text-gray-500">{medicine.doseTimes.join(', ')}</span>
      <Icon name="chevron-forward" size={16} color="#cbd5e1" style={{ marginLeft: 8 }} />
    </button>
  );
});

export function MedicineScreen() {
  const navigate = useNavigate();
  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const { data: logs } = useMedicineLogsForDate(today);
  const { data: medicines } = useMedicineList({});
  const markTaken = useMarkDoseTaken();
  const markSkipped = useMarkDoseSkipped();
  const [showForm, setShowForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  const todaysLogs = logs ?? EMPTY_ARRAY;
  const activeMedicines = medicines ?? EMPTY_ARRAY;

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)}>
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Medicine</p>
        <button type="button" aria-label="Add medicine" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        <p className="mb-2 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Today's Doses</p>
        {todaysLogs.length === 0 ? (
          <p className="mb-4 px-4 text-xs text-gray-400 dark:text-gray-500">No doses scheduled today.</p>
        ) : (
          todaysLogs.map((log) => (
            <MedicineLogRow key={log._id} log={log} onSkip={markSkipped.mutate} onTaken={markTaken.mutate} />
          ))
        )}

        <p className="mb-2 mt-5 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Manage Medicines</p>
        {activeMedicines.length === 0 ? (
          <EmptyState icon="medkit-outline" title="No medicines yet" description="Add a medicine to start tracking doses." ctaLabel="Add Medicine" onCtaPress={() => setShowForm(true)} />
        ) : (
          activeMedicines.map((medicine) => (
            <MedicineRow key={medicine._id} medicine={medicine} onEdit={setEditingMedicine} />
          ))
        )}
      </div>
      </PageContainer>

      <MedicineFormSheet visible={showForm || Boolean(editingMedicine)} medicine={editingMedicine} onClose={() => { setShowForm(false); setEditingMedicine(null); }} />
    </Screen>
  );
}
