import dayjs from 'dayjs';
import { Icon } from '../../../components/ui/Icon';
import { useGoalInsights } from '../hooks/useGoals';
import { GOAL_HEALTH, DEADLINE_RISK } from '../constants/goalConstants';

function Spinner({ size = 20 }) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-gray-300 border-t-primary-600"
      style={{ width: size, height: size }}
    />
  );
}

function InsightRow({ icon, color, label, value }) {
  return (
    <div className="flex flex-row items-center py-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: `${color}20` }}>
        <Icon name={icon} size={14} color={color} />
      </div>
      <span className="ml-2.5 flex-1 text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-semibold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

// "Smart features" per the Phase 6 spec — all plain, documented heuristics
// (see backend goalHealth.util.js), presented honestly as such rather than
// implying AI/ML analysis.
export function GoalInsightsCard({ goalId }) {
  const { data: insights, isLoading } = useGoalInsights(goalId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl bg-gray-50 py-6 dark:bg-gray-900">
        <Spinner />
      </div>
    );
  }
  if (!insights) return null;

  const health = GOAL_HEALTH[insights.health?.label] ?? GOAL_HEALTH.on_track;
  const risk = insights.deadlineRisk?.risk && insights.deadlineRisk.risk !== 'none' ? DEADLINE_RISK[insights.deadlineRisk.risk] : null;

  return (
    <div className="rounded-2xl bg-gray-50 px-4 py-1 dark:bg-gray-900">
      <InsightRow icon="pulse-outline" color={health.color} label="Health" value={health.label} />

      {risk ? (
        <InsightRow
          icon="warning-outline"
          color={risk.color}
          label="Deadline risk"
          value={`${risk.label} · ${insights.deadlineRisk.requiredDailyVelocity ?? 0}%/day needed`}
        />
      ) : null}

      {insights.predictedCompletionDate ? (
        <InsightRow
          icon="calendar-outline"
          color="#2563eb"
          label="Predicted completion"
          value={dayjs(insights.predictedCompletionDate).format('MMM D, YYYY')}
        />
      ) : null}

      {insights.isOverdue ? <InsightRow icon="alert-circle-outline" color="#ef4444" label="Status" value="Overdue" /> : null}

      {insights.suggestedNextAction ? (
        <InsightRow
          icon="arrow-forward-circle-outline"
          color="#2563eb"
          label={`Next: ${insights.suggestedNextAction.type === 'milestone' ? 'Milestone' : 'Task'}`}
          value={insights.suggestedNextAction.title}
        />
      ) : null}
    </div>
  );
}
