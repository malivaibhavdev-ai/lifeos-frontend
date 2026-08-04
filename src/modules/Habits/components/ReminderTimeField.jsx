import { DateField } from '../../../components/ui/DateField';

// A habit's reminderTime is stored as a plain 'HH:mm' string (see backend
// Habit.model.js) rather than a Date — it's re-anchored to a different
// *date* every day server-side (see habitReminder.util.js), only the
// time-of-day is ever user-editable. DateField works in terms of a Date
// value (native <input type="time"> under mode="time"), so this is a thin
// conversion boundary rather than a whole separate picker.
function timeStringToDate(value) {
  const [hours, minutes] = (value ?? '09:00').split(':').map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export function ReminderTimeField({ label, value, onChange }) {
  const handleChange = (date) => {
    if (!date) {
      onChange(null);
      return;
    }
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    onChange(`${hh}:${mm}`);
  };

  return <DateField label={label} value={value ? timeStringToDate(value) : null} onChange={handleChange} mode="time" />;
}
