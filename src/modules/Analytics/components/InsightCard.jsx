import { Icon } from '../../../components/ui/Icon';

export function InsightCard({ metric }) {
  const isImprovement = metric.direction === 'improvement';
  return (
    <div className="mb-2 flex flex-row items-center justify-between rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-900">
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{metric.label}</p>
        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
          {metric.previousValue} → {metric.currentValue}{metric.unit ? ` ${metric.unit}` : ''}
        </p>
      </div>
      <div className={`flex flex-row items-center rounded-full px-2.5 py-1 ${isImprovement ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
        <Icon name={isImprovement ? 'trending-up' : 'trending-down-outline'} size={13} color={isImprovement ? '#22c55e' : '#ef4444'} />
        <span className={`ml-1 text-xs font-semibold ${isImprovement ? 'text-green-600' : 'text-red-600'}`}>
          {metric.percentChange > 0 ? '+' : ''}{metric.percentChange}%
        </span>
      </div>
    </div>
  );
}
