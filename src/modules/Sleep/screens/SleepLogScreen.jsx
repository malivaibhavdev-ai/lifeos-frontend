import { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { Icon } from '../../../components/ui/Icon';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { DateField } from '../../../components/ui/DateField';
import { SLEEP_QUALITY } from '../../Health/constants/healthConstants';
import { useCreateSleepLog, useDeleteSleepLog, useSleepDebt, useSleepList } from '../hooks/useSleep';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const SleepRow = memo(function SleepRow({ item, onDelete }) {
  const meta = item.quality ? SLEEP_QUALITY[item.quality] : null;
  return (
    <div className="mx-4 mb-2 flex w-[calc(100%-2rem)] flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900">
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {item.isNap ? 'Nap' : 'Sleep'} · {dayjs(item.date).format('MMM D')}
        </p>
        {meta ? <p className="text-xs" style={{ color: meta.color }}>{meta.label}</p> : null}
      </div>
      <div className="flex flex-row items-center gap-2">
        <span className="text-base font-bold text-primary-600">{item.totalHours}h</span>
        <button type="button" aria-label="Delete sleep entry" onContextMenu={(e) => { e.preventDefault(); onDelete(item._id); }} onClick={() => onDelete(item._id)} className="p-1">
          <Icon name="trash-outline" size={16} color="#ef4444" />
        </button>
      </div>
    </div>
  );
});

export function SleepLogScreen() {
  const navigate = useNavigate();
  const today = useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const { data: debt } = useSleepDebt();
  const { data: history } = useSleepList({ limit: 30 });
  const createSleepLog = useCreateSleepLog();
  const deleteSleepLog = useDeleteSleepLog();
  const [showForm, setShowForm] = useState(false);
  const [sleepTime, setSleepTime] = useState(dayjs().subtract(8, 'hour').toDate());
  const [wakeTime, setWakeTime] = useState(new Date());
  const [isNap, setIsNap] = useState(false);
  const [quality, setQuality] = useState('good');

  const items = history?.items ?? EMPTY_ARRAY;

  const handleSave = () => {
    const totalHours = Math.round(((wakeTime.getTime() - sleepTime.getTime()) / 3600000) * 10) / 10;
    if (totalHours <= 0) return;
    createSleepLog.mutate(
      { date: today, sleepTime: sleepTime.toISOString(), wakeTime: wakeTime.toISOString(), totalHours, quality, isNap },
      { onSuccess: () => setShowForm(false) }
    );
  };

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)}>
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Sleep</p>
        <div className="flex flex-row items-center">
          <button type="button" aria-label="Sleep schedule settings" onClick={() => navigate('/health/sleep-schedule')} className="mr-3">
            <Icon name="settings-outline" size={20} color="#64748b" />
          </button>
          <button type="button" aria-label="Log sleep" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>
      </div>

      {debt ? (
        <div className="mx-4 mb-4 flex flex-row justify-around rounded-2xl bg-white py-4 dark:bg-gray-900">
          <div className="flex flex-col items-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{debt.averageHours}h</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Avg / night</p>
          </div>
          <div className="flex flex-col items-center">
            <p className={`text-lg font-bold ${debt.debtHours > 0 ? 'text-danger' : 'text-success'}`}>{debt.debtHours}h</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Sleep debt</p>
          </div>
          <div className="flex flex-col items-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{debt.targetHours}h</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Target</p>
          </div>
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto pb-6">
        {items.length === 0 ? (
          <EmptyState icon="moon-outline" title="No sleep logged yet" description="Log your sleep to see trends and debt tracking." />
        ) : (
          items.map((item) => <SleepRow key={item._id} item={item} onDelete={deleteSleepLog.mutate} />)
        )}
      </div>
      </PageContainer>

      <Modal visible={showForm} onClose={() => setShowForm(false)} onDone={handleSave} title="Log Sleep">
        <div className="mb-2 flex flex-row items-center justify-between">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">This was a nap</p>
          <button
            type="button"
            role="switch"
            aria-checked={isNap}
            aria-label="This was a nap"
            onClick={() => setIsNap((v) => !v)}
            className={`h-7 w-12 rounded-full p-1 ${isNap ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            <div className={`h-5 w-5 rounded-full bg-white transition-transform ${isNap ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
        <DateField label="Sleep time" value={sleepTime} onChange={setSleepTime} mode="datetime" />
        <DateField label="Wake time" value={wakeTime} onChange={setWakeTime} mode="datetime" />
        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Quality</p>
          <div className="flex flex-row flex-wrap gap-1.5">
            {Object.keys(SLEEP_QUALITY).map((key) => {
              const meta = SLEEP_QUALITY[key];
              const isSelected = quality === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setQuality(key)}
                  className={`rounded-full border px-3 py-1.5 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300 dark:border-gray-700'}`}
                >
                  <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Modal>
    </Screen>
  );
}
