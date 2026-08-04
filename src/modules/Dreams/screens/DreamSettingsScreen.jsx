import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen } from '../../../components/ui/Screen';
import { Icon } from '../../../components/ui/Icon';
import { PageContainer } from '../../../components/ui/PageContainer';
import { TagChipInput } from '../components/TagChipInput';
import { useDreamSettings, useUpdateDreamSettings } from '../hooks/useDreams';

function FlagRow({ label, value, onChange }) {
  return (
    <label className="mb-3 flex flex-row items-center justify-between">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-primary-600" />
    </label>
  );
}

function TimeField({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="HH:mm"
      className="mb-3 h-11 w-28 self-end rounded-xl border border-gray-300 px-3 text-center text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
    />
  );
}

export function DreamSettingsScreen() {
  const navigate = useNavigate();
  const { data: settings } = useDreamSettings();
  const updateSettings = useUpdateDreamSettings();
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  if (!form) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" role="status" aria-label="Loading" />
        </div>
      </Screen>
    );
  }

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const save = (patch) => {
    const next = { ...form, ...patch };
    setForm(next);
    updateSettings.mutate(patch);
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="ml-3 text-lg font-bold text-gray-900 dark:text-white">Dream Settings</p>
        </div>

        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Reminders</p>
        <div className="mb-5 rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
          <FlagRow
            label="Morning dream-log reminder"
            value={form.morningLogReminderEnabled}
            onChange={(morningLogReminderEnabled) => save({ morningLogReminderEnabled })}
          />
          {form.morningLogReminderEnabled ? (
            <TimeField value={form.morningLogReminderTime} onChange={(morningLogReminderTime) => set({ morningLogReminderTime })} />
          ) : null}

          <FlagRow
            label="Night journal reminder"
            value={form.nightJournalReminderEnabled}
            onChange={(nightJournalReminderEnabled) => save({ nightJournalReminderEnabled })}
          />
          {form.nightJournalReminderEnabled ? (
            <TimeField value={form.nightJournalReminderTime} onChange={(nightJournalReminderTime) => set({ nightJournalReminderTime })} />
          ) : null}

          <FlagRow
            label="Reality check reminders"
            value={form.realityCheckReminderEnabled}
            onChange={(realityCheckReminderEnabled) => save({ realityCheckReminderEnabled })}
          />
          {form.realityCheckReminderEnabled ? (
            <TagChipInput
              label="Reality check times"
              value={form.realityCheckTimes}
              onChange={(realityCheckTimes) => save({ realityCheckTimes })}
              placeholder="09:00, 13:00, 18:00..."
            />
          ) : null}

          <button
            type="button"
            onClick={() =>
              updateSettings.mutate({ morningLogReminderTime: form.morningLogReminderTime, nightJournalReminderTime: form.nightJournalReminderTime })
            }
            className="mt-2 w-full rounded-xl bg-primary-600 py-2.5 text-center"
          >
            <span className="text-sm font-semibold text-white">Save reminder times</span>
          </button>
        </div>

        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Customization</p>
        <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
          <TagChipInput label="Custom dream types" value={form.customDreamTypes} onChange={(customDreamTypes) => save({ customDreamTypes })} />
          <TagChipInput label="Custom categories" value={form.customCategories} onChange={(customCategories) => save({ customCategories })} />
          <TagChipInput label="Custom tags" value={form.customTags} onChange={(customTags) => save({ customTags })} />
        </div>
      </PageContainer>
    </Screen>
  );
}
