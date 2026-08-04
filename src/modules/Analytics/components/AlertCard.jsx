import { Icon } from '../../../components/ui/Icon';

const SEVERITY_COLOR = { info: '#2563eb', warning: '#f59e0b', critical: '#ef4444' };
const TYPE_ICON = {
  negative_trend: 'trending-down-outline',
  positive_trend: 'trending-up',
  habit_broken: 'flame-outline',
  health_decline: 'medkit-outline',
  financial_risk: 'cash-outline',
  burnout_risk: 'alert-circle-outline',
  missed_goal: 'flag-outline',
  milestone: 'trophy-outline',
  achievement: 'ribbon-outline',
  custom_rule: 'notifications-outline',
};

export function AlertCard({ alert, onPress }) {
  const color = SEVERITY_COLOR[alert.severity] ?? '#2563eb';
  return (
    <button
      type="button"
      onClick={() => onPress?.(alert)}
      className={`mb-2 flex w-full flex-row items-center rounded-2xl border p-4 text-left ${alert.isRead ? 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900' : 'border-primary-200 bg-primary-50 dark:border-primary-900 dark:bg-primary-950'}`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${color}20` }}>
        <Icon name={TYPE_ICON[alert.type] ?? 'notifications-outline'} size={18} color={color} />
      </div>
      <div className="ml-3 flex-1 overflow-hidden">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{alert.title}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{alert.message}</p>
        <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">{new Date(alert.createdAt).toLocaleString()}</p>
      </div>
      {!alert.isRead ? <div className="h-2 w-2 rounded-full bg-primary-600" /> : null}
    </button>
  );
}
