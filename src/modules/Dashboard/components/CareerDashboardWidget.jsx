import { useNavigate } from 'react-router-dom';
import { useCareerSummary } from '../../Career/hooks/useCareerHub';
import { ProgressRing } from '../../Habits/components/ProgressRing';
import { AnimatedNumber } from '../../../components/ui/AnimatedNumber';
import { Icon } from '../../../components/ui/Icon';

export function CareerDashboardWidget() {
  const navigate = useNavigate();
  const { data: summary } = useCareerSummary();

  if (!summary) return null;

  return (
    <button
      type="button"
      onClick={() => navigate('/career')}
      className="block w-full rounded-2xl bg-white p-4 text-left shadow-sm dark:bg-gray-900"
    >
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center">
          <div className="mr-2.5 h-8 w-8 flex items-center justify-center rounded-full" style={{ backgroundColor: '#2563eb20' }}>
            <Icon name="briefcase" size={16} color="#2563eb" />
          </div>
          <p className="text-base font-bold text-gray-900 dark:text-white">Career</p>
        </div>
        <Icon name="chevron-forward" size={18} color="#94a3b8" />
      </div>

      <div className="mt-3 flex flex-row items-center">
        <ProgressRing size={52} strokeWidth={4} progress={(summary.careerScore ?? 0) / 100} color="#2563eb">
          <AnimatedNumber value={summary.careerScore ?? 0} className="text-xs font-bold text-gray-900 dark:text-white" />
        </ProgressRing>
        <div className="ml-4 flex flex-1 flex-row flex-wrap justify-around">
          <div className="flex flex-col items-center px-1">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{summary.applications.total}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Applications</p>
          </div>
          <div className="flex flex-col items-center px-1">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{summary.upcomingInterviews.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Interviews</p>
          </div>
          <div className="flex flex-col items-center px-1">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{summary.learningHours}h</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Learning</p>
          </div>
        </div>
      </div>
    </button>
  );
}
