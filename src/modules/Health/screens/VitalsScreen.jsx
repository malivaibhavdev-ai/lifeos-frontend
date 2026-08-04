import { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { Icon } from '../../../components/ui/Icon';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { useCreateVitals, useDeleteVitals, useLatestVitals, useVitalsList } from '../hooks/useVitals';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const VitalsRow = memo(function VitalsRow({ item, onDelete }) {
  return (
    <div className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900">
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500">{dayjs(item.date).format('MMM D, YYYY')}</p>
        <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">
          {item.bloodPressureSystolic ? `BP ${item.bloodPressureSystolic}/${item.bloodPressureDiastolic}  ` : ''}
          {item.heartRate ? `HR ${item.heartRate}bpm` : ''}
        </p>
      </div>
      <button type="button" aria-label="Delete vitals entry" onContextMenu={(e) => { e.preventDefault(); onDelete(item._id); }} onClick={() => onDelete(item._id)} className="p-1">
        <Icon name="trash-outline" size={16} color="#ef4444" />
      </button>
    </div>
  );
});

function Field({ label, value, onChangeText, placeholder }) {
  return (
    <div className="mb-4 flex-1">
      <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
      <input
        value={value}
        onChange={(e) => onChangeText(e.target.value.replace(/[^0-9.]/g, ''))}
        placeholder={placeholder}
        inputMode="decimal"
        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base text-gray-900 dark:border-gray-700 dark:text-white"
      />
    </div>
  );
}

export function VitalsScreen() {
  const navigate = useNavigate();
  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const { data: latest } = useLatestVitals();
  const { data: history } = useVitalsList({ limit: 30 });
  const createVitals = useCreateVitals();
  const deleteVitals = useDeleteVitals();
  const [showForm, setShowForm] = useState(false);
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');

  const items = history?.items ?? EMPTY_ARRAY;

  const handleSave = () => {
    createVitals.mutate(
      {
        date: today,
        bloodPressureSystolic: systolic ? Number(systolic) : null,
        bloodPressureDiastolic: diastolic ? Number(diastolic) : null,
        heartRate: heartRate ? Number(heartRate) : null,
        bloodSugar: bloodSugar ? Number(bloodSugar) : null,
      },
      { onSuccess: () => { setShowForm(false); setSystolic(''); setDiastolic(''); setHeartRate(''); setBloodSugar(''); } }
    );
  };

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)}>
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Vitals</p>
        <button type="button" aria-label="Log vitals" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      {latest ? (
        <div className="mx-4 mb-4 flex flex-row flex-wrap justify-between rounded-2xl bg-white p-4 dark:bg-gray-900">
          {latest.bloodPressureSystolic ? (
            <div className="flex w-1/2 flex-col items-center py-2">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{latest.bloodPressureSystolic}/{latest.bloodPressureDiastolic}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Blood Pressure</p>
            </div>
          ) : null}
          {latest.heartRate ? (
            <div className="flex w-1/2 flex-col items-center py-2">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{latest.heartRate} bpm</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Heart Rate</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto pb-6">
        {items.length === 0 ? (
          <EmptyState icon="pulse-outline" title="No vitals recorded yet" description="Log blood pressure, heart rate, and more." />
        ) : (
          items.map((item) => <VitalsRow key={item._id} item={item} onDelete={deleteVitals.mutate} />)
        )}
      </div>
      </PageContainer>

      <Modal visible={showForm} onClose={() => setShowForm(false)} onDone={handleSave} title="Log Vitals">
        <div className="flex flex-row gap-3">
          <Field label="Systolic" value={systolic} onChangeText={setSystolic} placeholder="120" />
          <Field label="Diastolic" value={diastolic} onChangeText={setDiastolic} placeholder="80" />
        </div>
        <div className="flex flex-row gap-3">
          <Field label="Heart Rate" value={heartRate} onChangeText={setHeartRate} placeholder="72" />
          <Field label="Blood Sugar" value={bloodSugar} onChangeText={setBloodSugar} placeholder="90" />
        </div>
      </Modal>
    </Screen>
  );
}
