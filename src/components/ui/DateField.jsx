import dayjs from 'dayjs';
import { Icon } from './Icon';
import { COLORS } from '../../theme/colors';

// Web replacement for the mobile app's native spinner date/time picker.
// Uses the platform's native <input type="date"|"time"|"datetime-local">
// inside the same field chrome — fastest to ship, works everywhere, though
// picker chrome will look different across browsers (flagged fidelity gap).
const INPUT_TYPE = { date: 'date', time: 'time', datetime: 'datetime-local' };
const HTML_FORMAT = { date: 'YYYY-MM-DD', time: 'HH:mm', datetime: 'YYYY-MM-DDTHH:mm' };

export function DateField({ label, value, onChange, mode = 'datetime' }) {
  const inputType = INPUT_TYPE[mode];
  const htmlValue = value ? dayjs(value).format(HTML_FORMAT[mode]) : '';

  const handleChange = (e) => {
    const raw = e.target.value;
    if (!raw) {
      onChange(null);
      return;
    }
    // A bare "HH:mm" (mode="time") isn't a parseable date/time on its own —
    // anchor it to today so dayjs has a full ISO-ish string to parse.
    const parsed = mode === 'time' ? dayjs(`${dayjs().format('YYYY-MM-DD')}T${raw}`) : dayjs(raw);
    onChange(parsed.toDate());
  };

  return (
    <div className="mb-4">
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <div className="flex flex-row items-center gap-2">
        <div className="flex-1 flex flex-row items-center justify-between rounded-xl border border-gray-300 px-4 py-3 dark:border-gray-700">
          <input
            type={inputType}
            value={htmlValue}
            onChange={handleChange}
            className="w-full bg-transparent text-base text-gray-900 dark:text-white outline-none"
          />
          <Icon name="calendar-outline" size={18} color={COLORS.mutedDark} />
        </div>
        {value ? (
          <button type="button" onClick={() => onChange(null)} className="p-1">
            <Icon name="close-circle" size={22} color={COLORS.placeholderLight} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
