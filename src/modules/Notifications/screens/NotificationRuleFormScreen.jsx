import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { PageContainer } from '../../../components/ui/PageContainer';
import { ToggleButton } from '../components/ToggleButton';
import { useNotificationRule, useCreateNotificationRule, useUpdateNotificationRule } from '../hooks/useNotificationRules';
import { PRIORITY_LEVELS, PRIORITY_LABEL } from '../constants/notificationConstants';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Only exposes the conditions the Rule Engine actually evaluates
// server-side today (weekdaysOnly/weekendOnly/daysOfWeek/timeWindow/
// minPriority/modules — see notificationRule.util.js). Battery/location/
// driving-mode conditions from the spec aren't offered here since nothing
// in this backend collects that live device telemetry yet.
export function NotificationRuleFormScreen() {
  const navigate = useNavigate();
  const { ruleId } = useParams();
  const { data: existingRule } = useNotificationRule(ruleId);
  const createRule = useCreateNotificationRule();
  const updateRule = useUpdateNotificationRule();

  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [weekdaysOnly, setWeekdaysOnly] = useState(false);
  const [weekendOnly, setWeekendOnly] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [windowStart, setWindowStart] = useState('');
  const [windowEnd, setWindowEnd] = useState('');
  const [minPriority, setMinPriority] = useState(null);
  const [modulesText, setModulesText] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!existingRule) return;
    setName(existingRule.name ?? '');
    setIsActive(existingRule.isActive ?? true);
    const c = existingRule.conditions ?? {};
    setWeekdaysOnly(Boolean(c.weekdaysOnly));
    setWeekendOnly(Boolean(c.weekendOnly));
    setSelectedDays((c.daysOfWeek ?? []).map((d) => DAYS.find((full) => full.toLowerCase() === d) ?? d));
    setWindowStart(c.timeWindow?.start ?? '');
    setWindowEnd(c.timeWindow?.end ?? '');
    setMinPriority(c.minPriority ?? null);
    setModulesText((c.modules ?? []).join(', '));
  }, [existingRule]);

  const toggleDay = (day) => {
    setSelectedDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleSubmit = () => {
    if (!name.trim()) return setError('Rule name is required');

    const modules = modulesText.split(',').map((m) => m.trim()).filter(Boolean);
    const conditions = {
      ...(weekdaysOnly ? { weekdaysOnly: true } : {}),
      ...(weekendOnly ? { weekendOnly: true } : {}),
      ...(selectedDays.length ? { daysOfWeek: selectedDays.map((d) => d.toLowerCase()) } : {}),
      ...(windowStart.trim() && windowEnd.trim() ? { timeWindow: { start: windowStart.trim(), end: windowEnd.trim() } } : {}),
      ...(minPriority ? { minPriority } : {}),
      ...(modules.length ? { modules } : {}),
    };

    const payload = { name: name.trim(), isActive, conditions };
    const mutation = ruleId ? updateRule : createRule;
    const variables = ruleId ? { id: ruleId, payload } : payload;
    mutation.mutate(variables, { onSuccess: () => navigate('/notifications/rules'), onError: (e) => setError(e?.message) });
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-2xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Close">
            <Icon name="close" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{ruleId ? 'Edit Rule' : 'New Rule'}</p>
          <button type="button" onClick={handleSubmit} className="text-base font-semibold text-primary-600">
            Save
          </button>
        </div>

        <ErrorBanner message={error} />

        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Rule Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Weekends only"
          className="mb-4 h-12 w-full rounded-xl border border-gray-300 bg-transparent px-4 text-base text-gray-900 outline-none focus:border-primary-600 dark:border-gray-700 dark:text-white"
        />

        <ToggleButton label="Active" value={isActive} onChange={setIsActive} />
        <ToggleButton label="Weekdays only" value={weekdaysOnly} onChange={(v) => { setWeekdaysOnly(v); if (v) setWeekendOnly(false); }} />
        <ToggleButton label="Weekends only" value={weekendOnly} onChange={(v) => { setWeekendOnly(v); if (v) setWeekdaysOnly(false); }} />

        <p className="mb-2 mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">Specific days (optional)</p>
        <div className="flex flex-row flex-wrap" style={{ gap: 8 }}>
          {DAYS.map((day) => {
            const isSelected = selectedDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${isSelected ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300'}`}
              >
                {day.slice(0, 3)}
              </button>
            );
          })}
        </div>

        <p className="mb-2 mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">Time window (24h, optional)</p>
        <div className="flex flex-row items-center" style={{ gap: 10 }}>
          <input
            value={windowStart}
            onChange={(e) => setWindowStart(e.target.value)}
            placeholder="09:00"
            className="h-12 flex-1 rounded-xl border border-gray-300 bg-transparent px-4 text-base text-gray-900 outline-none focus:border-primary-600 dark:border-gray-700 dark:text-white"
          />
          <span className="text-gray-400">to</span>
          <input
            value={windowEnd}
            onChange={(e) => setWindowEnd(e.target.value)}
            placeholder="21:00"
            className="h-12 flex-1 rounded-xl border border-gray-300 bg-transparent px-4 text-base text-gray-900 outline-none focus:border-primary-600 dark:border-gray-700 dark:text-white"
          />
        </div>

        <p className="mb-2 mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">Minimum priority (optional)</p>
        <div className="flex flex-row flex-wrap" style={{ gap: 8 }}>
          {PRIORITY_LEVELS.map((p) => {
            const isSelected = minPriority === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setMinPriority(isSelected ? null : p)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${isSelected ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-200 text-gray-700 dark:border-gray-700 dark:text-gray-300'}`}
              >
                {PRIORITY_LABEL[p]}
              </button>
            );
          })}
        </div>

        <label className="mb-1.5 mt-4 block text-sm font-medium text-gray-700 dark:text-gray-300">Modules (optional, comma-separated)</label>
        <input
          value={modulesText}
          onChange={(e) => setModulesText(e.target.value)}
          placeholder="tasks, habits, finance"
          className="h-12 w-full rounded-xl border border-gray-300 bg-transparent px-4 text-base text-gray-900 outline-none focus:border-primary-600 dark:border-gray-700 dark:text-white"
        />
      </PageContainer>
    </Screen>
  );
}
