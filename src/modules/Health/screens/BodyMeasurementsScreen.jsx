import { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { Icon } from '../../../components/ui/Icon';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { useCreateBodyMeasurement, useDeleteBodyMeasurement, useBodyMeasurementList, useLatestBodyMeasurement } from '../hooks/useBodyMeasurements';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const MeasurementRow = memo(function MeasurementRow({ item, onDelete }) {
  return (
    <div className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900">
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500">{dayjs(item.date).format('MMM D, YYYY')}</p>
        <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">
          {item.waistCm ? `Waist ${item.waistCm}cm  ` : ''}
          {item.chestCm ? `Chest ${item.chestCm}cm` : ''}
        </p>
      </div>
      <button type="button" aria-label="Delete measurement entry" onContextMenu={(e) => { e.preventDefault(); onDelete(item._id); }} onClick={() => onDelete(item._id)} className="p-1">
        <Icon name="trash-outline" size={16} color="#ef4444" />
      </button>
    </div>
  );
});

function Field({ label, value, onChangeText }) {
  return (
    <div className="mb-4 w-[48%]">
      <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
      <input
        value={value}
        onChange={(e) => onChangeText(e.target.value.replace(/[^0-9.]/g, ''))}
        placeholder="cm"
        inputMode="decimal"
        className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base text-gray-900 dark:border-gray-700 dark:text-white"
      />
    </div>
  );
}

export function BodyMeasurementsScreen() {
  const navigate = useNavigate();
  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const { data: latest } = useLatestBodyMeasurement();
  const { data: history } = useBodyMeasurementList({ limit: 30 });
  const createMeasurement = useCreateBodyMeasurement();
  const deleteMeasurement = useDeleteBodyMeasurement();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ chestCm: '', waistCm: '', hipsCm: '', bicepsCm: '', thighsCm: '' });

  const items = history?.items ?? EMPTY_ARRAY;
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSave = () => {
    const payload = { date: today };
    for (const key of Object.keys(form)) {
      if (form[key]) payload[key] = Number(form[key]);
    }
    createMeasurement.mutate(payload, {
      onSuccess: () => { setShowForm(false); setForm({ chestCm: '', waistCm: '', hipsCm: '', bicepsCm: '', thighsCm: '' }); },
    });
  };

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)}>
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Body Measurements</p>
        <button type="button" aria-label="Log measurements" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      {latest ? (
        <div className="mx-4 mb-4 flex flex-row flex-wrap justify-between rounded-2xl bg-white p-4 dark:bg-gray-900">
          {['chestCm', 'waistCm', 'hipsCm'].map((key) =>
            latest[key] ? (
              <div key={key} className="flex w-1/3 flex-col items-center py-2">
                <p className="text-base font-bold text-gray-900 dark:text-white">{latest[key]}cm</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{key.replace('Cm', '')}</p>
              </div>
            ) : null
          )}
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto pb-6">
        {items.length === 0 ? (
          <EmptyState icon="resize-outline" title="No measurements yet" description="Track chest, waist, hips, and more over time." />
        ) : (
          items.map((item) => <MeasurementRow key={item._id} item={item} onDelete={deleteMeasurement.mutate} />)
        )}
      </div>
      </PageContainer>

      <Modal visible={showForm} onClose={() => setShowForm(false)} onDone={handleSave} title="Log Measurements">
        <div className="flex flex-row flex-wrap justify-between">
          <Field label="Chest" value={form.chestCm} onChangeText={(v) => set({ chestCm: v })} />
          <Field label="Waist" value={form.waistCm} onChangeText={(v) => set({ waistCm: v })} />
          <Field label="Hips" value={form.hipsCm} onChangeText={(v) => set({ hipsCm: v })} />
          <Field label="Biceps" value={form.bicepsCm} onChangeText={(v) => set({ bicepsCm: v })} />
          <Field label="Thighs" value={form.thighsCm} onChangeText={(v) => set({ thighsCm: v })} />
        </div>
      </Modal>
    </Screen>
  );
}
