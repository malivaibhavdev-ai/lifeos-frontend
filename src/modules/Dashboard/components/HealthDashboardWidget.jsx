import { useNavigate } from 'react-router-dom';
import { useHealthSummary } from '../../Health/hooks/useHealthHub';
import { MOOD } from '../../Health/constants/healthConstants';
import { ProgressRing } from '../../Habits/components/ProgressRing';
import { AnimatedNumber } from '../../../components/ui/AnimatedNumber';
import { Icon } from '../../../components/ui/Icon';

export function HealthDashboardWidget() {
  const navigate = useNavigate();
  const { data: summary } = useHealthSummary();

  if (!summary) return null;

  const waterMl = summary.water?.entries?.reduce((s, e) => s + e.amountMl, 0) ?? 0;
  const waterTarget = summary.water?.targetMl ?? 2000;
  const waterRatio = waterTarget > 0 ? Math.min(waterMl / waterTarget, 1) : 0;
  const moodMeta = summary.mood?.mood ? MOOD[summary.mood.mood] : null;
  const pendingDoses = summary.medicineLogs?.filter((l) => l.status === 'pending').length ?? 0;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-900">
      <button type="button" onClick={() => navigate('/health')} className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-row items-center">
          <div className="mr-2.5 h-8 w-8 flex items-center justify-center rounded-full" style={{ backgroundColor: '#ec489920' }}>
            <Icon name="heart" size={16} color="#ec4899" />
          </div>
          <p className="text-base font-bold text-gray-900 dark:text-white">Health</p>
        </div>
        <Icon name="chevron-forward" size={18} color="#94a3b8" />
      </button>

      <div className="mt-3 flex flex-row items-center">
        <ProgressRing size={52} strokeWidth={4} progress={waterRatio} color="#3b82f6">
          <AnimatedNumber value={waterRatio * 100} formatter={(n) => `${Math.round(n)}%`} className="text-xs font-bold text-gray-900 dark:text-white" />
        </ProgressRing>
        <div className="ml-4 flex flex-1 flex-row flex-wrap justify-around">
          <div className="flex flex-col items-center px-1">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{summary.sleep?.totalHours ?? '—'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Sleep (h)</p>
          </div>
          <div className="flex flex-col items-center px-1">
            <p className="text-lg">{moodMeta?.emoji ?? '—'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Mood</p>
          </div>
          <div className="flex flex-col items-center px-1">
            <p className={`text-lg font-bold ${pendingDoses > 0 ? 'text-amber-500' : 'text-success'}`}>{pendingDoses}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Doses due</p>
          </div>
        </div>
      </div>
    </div>
  );
}
