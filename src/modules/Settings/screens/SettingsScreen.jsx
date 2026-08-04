import { useEffect, useState } from 'react';
import { Screen } from '../../../components/ui/Screen';
import { Icon } from '../../../components/ui/Icon';
import { PageContainer } from '../../../components/ui/PageContainer';
import { ESCALATION_LEVEL_ORDER, getEscalationPolicy } from '../../../constants/reminderPolicies';
import { useSettings, useUpdateSettings } from '../hooks/useSettings';

// Native <input type="time"> replaces the mobile app's spinner
// DateTimePicker — same idiom as components/ui/DateField, fastest to ship,
// picker chrome varies across browsers (fidelity gap, flagged same as
// DateField's own comment).
function TimeField({ label, value, onChange, disabled }) {
  return (
    <div className="flex-1">
      <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">{label}</label>
      <input
        type="time"
        value={value ?? '00:00'}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`h-11 w-full rounded-xl border border-gray-300 bg-transparent px-3 text-center text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white ${
          disabled ? 'opacity-40' : ''
        }`}
      />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{title}</p>
      {children}
    </div>
  );
}

export function SettingsScreen() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [reminderSettings, setReminderSettings] = useState(null);

  useEffect(() => {
    if (settings?.reminderSettings && !reminderSettings) {
      setReminderSettings(settings.reminderSettings);
    }
  }, [settings, reminderSettings]);

  const patch = (changes) => {
    const next = { ...reminderSettings, ...changes };
    setReminderSettings(next);
    updateSettings.mutate({ reminderSettings: next });
  };

  if (isLoading || !reminderSettings) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center">
          <div
            className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600"
            role="status"
            aria-label="Loading"
          />
        </div>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-2xl">
        <Section title="Quiet hours">
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Escalating reminders won't re-notify you during this window. Your first reminder still comes through — this
            only suppresses the follow-up nudges.
          </p>

          <button
            type="button"
            role="switch"
            aria-checked={reminderSettings.quietHoursEnabled}
            onClick={() => patch({ quietHoursEnabled: !reminderSettings.quietHoursEnabled })}
            className="mb-3 flex w-full flex-row items-center justify-between rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-800"
          >
            <span className="text-base text-gray-900 dark:text-white">Enable quiet hours</span>
            <Icon
              name={reminderSettings.quietHoursEnabled ? 'toggle' : 'toggle-outline'}
              size={30}
              color={reminderSettings.quietHoursEnabled ? '#2563eb' : '#94a3b8'}
            />
          </button>

          <div className="flex flex-row gap-3">
            <TimeField
              label="Starts"
              value={reminderSettings.quietHoursStart}
              onChange={(v) => patch({ quietHoursStart: v })}
              disabled={!reminderSettings.quietHoursEnabled}
            />
            <TimeField
              label="Ends"
              value={reminderSettings.quietHoursEnd}
              onChange={(v) => patch({ quietHoursEnd: v })}
              disabled={!reminderSettings.quietHoursEnabled}
            />
          </div>
        </Section>

        <Section title="Default reminder escalation">
          <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Used as the starting point whenever you add a new reminder — you can still change it per-reminder.
          </p>
          <div className="flex flex-row flex-wrap gap-2">
            {ESCALATION_LEVEL_ORDER.map((level) => {
              const policy = getEscalationPolicy(level);
              const isSelected = reminderSettings.defaultEscalation === level;
              return (
                <button
                  type="button"
                  key={level}
                  onClick={() => patch({ defaultEscalation: level })}
                  className={`rounded-2xl border px-4 py-3 text-left ${
                    isSelected ? 'border-primary-600 bg-primary-50 dark:bg-primary-900' : 'border-gray-200 dark:border-gray-700'
                  }`}
                  style={{ minWidth: 150 }}
                >
                  <p className={`text-sm font-semibold ${isSelected ? 'text-primary-700 dark:text-primary-200' : 'text-gray-900 dark:text-white'}`}>
                    {policy.label}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{policy.description}</p>
                </button>
              );
            })}
          </div>
        </Section>

        {updateSettings.isPending ? (
          <div className="flex flex-row items-center">
            <div
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-400"
              role="status"
              aria-label="Saving"
            />
            <span className="ml-1.5 text-xs text-gray-400">Saving…</span>
          </div>
        ) : null}
      </PageContainer>
    </Screen>
  );
}
