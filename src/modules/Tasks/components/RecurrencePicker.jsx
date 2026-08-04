import { RECURRENCE_PRESETS, WEEKDAYS } from '../constants/taskConstants';
import { describeRecurrence } from '../utils/recurrenceText';

// WEEKDAYS' single-letter labels ("M"/"T"/"W"/"T"/"F"/"S"/"S") are ambiguous
// on their own — this backs the accessible name for each day toggle so a
// screen reader announces "Tuesday" instead of just "T".
const WEEKDAY_FULL_NAMES = {
  MO: 'Monday',
  TU: 'Tuesday',
  WE: 'Wednesday',
  TH: 'Thursday',
  FR: 'Friday',
  SA: 'Saturday',
  SU: 'Sunday',
};

function presetKeyFor(recurrence) {
  if (!recurrence) return 'none';
  const match = RECURRENCE_PRESETS.find(
    (p) =>
      p.recurrence &&
      p.recurrence.freq === recurrence.freq &&
      p.recurrence.interval === recurrence.interval &&
      JSON.stringify(p.recurrence.byweekday ?? null) === JSON.stringify(recurrence.byweekday ?? null)
  );
  return match?.key ?? 'custom';
}

export function RecurrencePicker({ value, onChange }) {
  const activePreset = presetKeyFor(value);

  const selectPreset = (preset) => {
    if (preset.key === 'custom') {
      onChange(value?.freq ? value : { freq: 'WEEKLY', interval: 1, byweekday: [] });
      return;
    }
    onChange(preset.recurrence);
  };

  const toggleWeekday = (day) => {
    const current = value?.byweekday ?? [];
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    onChange({ ...value, freq: 'WEEKLY', byweekday: next });
  };

  const setInterval_ = (delta) => {
    const next = Math.max(1, (value?.interval ?? 1) + delta);
    onChange({ ...value, interval: next });
  };

  return (
    <div>
      <div className="flex flex-row flex-wrap gap-2">
        {RECURRENCE_PRESETS.map((preset) => {
          const isSelected = activePreset === preset.key;
          return (
            <button
              type="button"
              key={preset.key}
              onClick={() => selectPreset(preset)}
              aria-pressed={isSelected}
              className={`rounded-full border px-3 py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                {preset.label}
              </span>
            </button>
          );
        })}
      </div>

      {activePreset === 'custom' && value ? (
        <div className="mt-4 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <div className="flex flex-row items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Repeat every</span>
            <div className="flex flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => setInterval_(-1)}
                aria-label="Decrease interval"
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
              >
                <span className="text-xl text-primary-600">−</span>
              </button>
              <span className="text-base font-semibold text-gray-900 dark:text-white">{value.interval ?? 1}</span>
              <button
                type="button"
                onClick={() => setInterval_(1)}
                aria-label="Increase interval"
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-full"
              >
                <span className="text-xl text-primary-600">+</span>
              </button>
            </div>
          </div>

          {value.freq === 'WEEKLY' ? (
            <div className="mt-3 flex flex-row justify-between">
              {WEEKDAYS.map((day) => {
                const isSelected = value.byweekday?.includes(day.key);
                return (
                  <button
                    type="button"
                    key={day.key}
                    onClick={() => toggleWeekday(day.key)}
                    aria-label={WEEKDAY_FULL_NAMES[day.key] ?? day.label}
                    aria-pressed={Boolean(isSelected)}
                    className={`h-9 w-9 flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                      isSelected ? 'bg-primary-600' : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                  >
                    <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                      {day.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{describeRecurrence(value)}</p>
    </div>
  );
}
