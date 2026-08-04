import dayjs from 'dayjs';
import { Icon } from '../../../components/ui/Icon';
import { REMINDER_PRESETS } from '../constants/taskConstants';
import { formatReminderOffset } from '../utils/dateFormat';
import { ESCALATION_LEVEL_ORDER, getEscalationPolicy } from '../../../constants/reminderPolicies';

const DEFAULT_ESCALATION = 'normal';

function EscalationSelector({ value, onChange }) {
  return (
    <div className="mt-2 flex flex-row gap-1.5">
      {ESCALATION_LEVEL_ORDER.map((level) => {
        const policy = getEscalationPolicy(level);
        const isSelected = (value ?? DEFAULT_ESCALATION) === level;
        return (
          <button
            type="button"
            key={level}
            onClick={() => onChange(level)}
            aria-label={`${policy.label} escalation`}
            aria-pressed={isSelected}
            className={`rounded-full border px-2.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
              isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300 dark:border-gray-700'
            }`}
          >
            <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
              {policy.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ReminderPicker({ value = [], onChange, dueDate }) {
  const hasOffset = (offsetMinutes) => value.some((r) => r.offsetMinutes === offsetMinutes);

  const togglePreset = (offsetMinutes) => {
    if (hasOffset(offsetMinutes)) {
      onChange(value.filter((r) => r.offsetMinutes !== offsetMinutes));
    } else {
      onChange([...value, { offsetMinutes, escalation: DEFAULT_ESCALATION }]);
    }
  };

  const removeReminder = (index) => onChange(value.filter((_, i) => i !== index));

  const setEscalation = (index, escalation) => {
    onChange(value.map((r, i) => (i === index ? { ...r, escalation } : r)));
  };

  return (
    <div>
      {!dueDate ? (
        <div className="mb-3 flex flex-row items-center rounded-xl bg-amber-50 px-3 py-2 dark:bg-amber-950">
          <Icon name="information-circle-outline" size={16} color="#f59e0b" />
          <span className="ml-2 flex-1 text-xs text-amber-700 dark:text-amber-300">
            Set a due date to enable relative reminders like "15 minutes before".
          </span>
        </div>
      ) : null}

      <div className="flex flex-row flex-wrap gap-2">
        {REMINDER_PRESETS.map((preset) => {
          const isSelected = hasOffset(preset.offsetMinutes);
          return (
            <button
              type="button"
              key={preset.key}
              disabled={!dueDate}
              onClick={() => togglePreset(preset.offsetMinutes)}
              aria-pressed={isSelected}
              className={`rounded-full border px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300 dark:border-gray-700'
              } ${!dueDate ? 'opacity-40' : ''}`}
            >
              <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                {preset.label}
              </span>
            </button>
          );
        })}
      </div>

      {value.length > 0 ? (
        <div className="mt-4">
          {value.map((reminder, index) => (
            <div
              key={reminder._id ?? `${reminder.offsetMinutes}-${index}`}
              className="mb-2 rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-gray-800"
            >
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center">
                  <Icon name="notifications-outline" size={16} color="#64748b" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {reminder.offsetMinutes != null
                      ? formatReminderOffset(reminder.offsetMinutes)
                      : dayjs(reminder.remindAt).format('MMM D, h:mm A')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeReminder(index)}
                  aria-label="Remove reminder"
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
                >
                  <Icon name="close" size={16} color="#94a3b8" />
                </button>
              </div>
              <EscalationSelector value={reminder.escalation} onChange={(level) => setEscalation(index, level)} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
