import { WEEKDAYS } from '../constants/taskConstants';

const FREQ_UNIT = { DAILY: 'day', WEEKLY: 'week', MONTHLY: 'month', YEARLY: 'year' };
const WEEKDAY_LABELS = Object.fromEntries(WEEKDAYS.map((w) => [w.key, w.label]));

// Converts the structured {freq, interval, byweekday, until} config the
// picker produces into a human-readable summary — entirely client-side, no
// need to round-trip through the server's RRULE string just to display it.
export function describeRecurrence(recurrence) {
  if (!recurrence?.freq) return 'Does not repeat';

  const { freq, interval = 1, byweekday, until, count } = recurrence;
  const unit = FREQ_UNIT[freq];
  const isWeekdaySet = freq === 'WEEKLY' && byweekday?.length;

  let base;
  if (isWeekdaySet && byweekday.length === 5 && ['MO', 'TU', 'WE', 'TH', 'FR'].every((d) => byweekday.includes(d))) {
    base = 'Every weekday';
  } else if (isWeekdaySet) {
    base = `Every ${byweekday.map((d) => WEEKDAY_LABELS[d] ?? d).join(', ')}`;
  } else if (interval === 1) {
    base = `Every ${unit}`;
  } else {
    base = `Every ${interval} ${unit}s`;
  }

  if (until) return `${base}, until ${new Date(until).toLocaleDateString()}`;
  if (count) return `${base}, ${count} times`;
  return base;
}
