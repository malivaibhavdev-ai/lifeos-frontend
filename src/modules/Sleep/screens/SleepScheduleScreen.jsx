import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { Icon } from '../../../components/ui/Icon';
import { useSleepSchedule, useUpdateSleepSchedule } from '../hooks/useSleep';

export function SleepScheduleScreen() {
  const navigate = useNavigate();
  const { data: schedule, isLoading } = useSleepSchedule();
  const updateSchedule = useUpdateSleepSchedule();

  const [targetBedtime, setTargetBedtime] = useState('22:30');
  const [targetWaketime, setTargetWaketime] = useState('06:30');
  const [targetHours, setTargetHours] = useState('8');
  const [reminderEnabled, setReminderEnabled] = useState(false);

  useEffect(() => {
    if (schedule) {
      setTargetBedtime(schedule.targetBedtime);
      setTargetWaketime(schedule.targetWaketime);
      setTargetHours(String(schedule.targetHours));
      setReminderEnabled(schedule.bedtimeReminderEnabled);
    }
  }, [schedule]);

  const handleSave = () => {
    updateSchedule.mutate({
      targetBedtime,
      targetWaketime,
      targetHours: Number(targetHours) || 8,
      bedtimeReminderEnabled: reminderEnabled,
    });
  };

  if (isLoading) return null;

  return (
    <Screen scroll>
      <PageContainer>
      <div className="flex flex-row items-center px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)} className="mr-3">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">Sleep Schedule</p>
      </div>

      <div className="px-4 pt-2">
        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Target bedtime (HH:mm)</p>
          <input
            value={targetBedtime}
            onChange={(e) => setTargetBedtime(e.target.value)}
            placeholder="22:30"
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base text-gray-900 dark:border-gray-700 dark:text-white"
          />
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Target wake time (HH:mm)</p>
          <input
            value={targetWaketime}
            onChange={(e) => setTargetWaketime(e.target.value)}
            placeholder="06:30"
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base text-gray-900 dark:border-gray-700 dark:text-white"
          />
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Target hours</p>
          <input
            value={targetHours}
            onChange={(e) => setTargetHours(e.target.value.replace(/[^0-9.]/g, ''))}
            inputMode="decimal"
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-base text-gray-900 dark:border-gray-700 dark:text-white"
          />
        </div>

        <div className="mb-6 flex flex-row items-center justify-between">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Bedtime reminder</p>
          <button
            type="button"
            role="switch"
            aria-checked={reminderEnabled}
            aria-label="Bedtime reminder"
            onClick={() => setReminderEnabled((v) => !v)}
            className={`h-7 w-12 rounded-full p-1 ${reminderEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            <div className={`h-5 w-5 rounded-full bg-white transition-transform ${reminderEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        <button type="button" onClick={handleSave} className="flex w-full items-center justify-center rounded-xl bg-primary-600 py-3.5">
          <span className="text-base font-semibold text-white">Save Schedule</span>
        </button>
      </div>
      </PageContainer>
    </Screen>
  );
}
