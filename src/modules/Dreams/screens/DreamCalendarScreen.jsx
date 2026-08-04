import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Screen } from '../../../components/ui/Screen';
import { Icon } from '../../../components/ui/Icon';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useDreamTrend } from '../hooks/useDreams';
import { DreamHeatmapGrid } from '../components/DreamHeatmapGrid';

const WINDOW_DAYS = 182;

function buildHeatmapData(trend, from, to) {
  const byDate = new Map(trend.map((t) => [t.date, t]));
  const days = [];
  let cursor = dayjs(from);
  const end = dayjs(to);
  while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
    const dateKey = cursor.format('YYYY-MM-DD');
    const entry = byDate.get(dateKey);
    days.push({ date: dateKey, hasEntry: Boolean(entry), isLucid: Boolean(entry?.isLucid), isNightmare: Boolean(entry?.isNightmare) });
    cursor = cursor.add(1, 'day');
  }
  return days;
}

export function DreamCalendarScreen() {
  const navigate = useNavigate();
  const { from, to } = useMemo(
    () => ({ from: dayjs().subtract(WINDOW_DAYS - 1, 'day').format('YYYY-MM-DD'), to: dayjs().format('YYYY-MM-DD') }),
    []
  );
  const { data: trend } = useDreamTrend({ from, to });
  const heatmapData = useMemo(() => buildHeatmapData(trend ?? [], from, to), [trend, from, to]);

  const monthGroups = useMemo(() => {
    const groups = new Map();
    for (const entry of trend ?? []) {
      const monthKey = dayjs(entry.date).format('MMMM YYYY');
      if (!groups.has(monthKey)) groups.set(monthKey, []);
      groups.get(monthKey).push(entry);
    }
    return Array.from(groups.entries()).reverse();
  }, [trend]);

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="ml-3 text-lg font-bold text-gray-900 dark:text-white">Dream Calendar</p>
        </div>

        <DreamHeatmapGrid data={heatmapData} />

        <div className="mt-6">
          {monthGroups.length === 0 ? (
            <p className="mt-4 text-center text-sm text-gray-400 dark:text-gray-500">No dreams logged in this period yet.</p>
          ) : (
            monthGroups.map(([month, entries]) => (
              <div key={month} className="mb-5">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{month}</p>
                <div className="flex flex-row items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-900">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{entries.length} dream{entries.length === 1 ? '' : 's'}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {entries.filter((e) => e.isLucid).length} lucid · {entries.filter((e) => e.isNightmare).length} nightmares
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </PageContainer>
    </Screen>
  );
}
