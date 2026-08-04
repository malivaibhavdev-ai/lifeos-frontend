import { Icon } from '../../../components/ui/Icon';
import { useSetKeyResultValue } from '../hooks/useGoals';

export function KeyResultRow({ goalId, keyResult }) {
  const setValue = useSetKeyResultValue();
  const target = keyResult.targetValue ?? 0;
  const current = keyResult.currentValue ?? 0;
  const ratio = target > 0 ? Math.max(0, Math.min(1, current / target)) : 0;

  const step = Math.max(1, Math.round(target / 10) || 1);
  const adjust = (delta) => {
    const next = Math.max(0, current + delta);
    setValue.mutate({ id: goalId, keyResultId: keyResult._id, currentValue: next });
  };

  return (
    <div className="mb-3 rounded-xl border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <p className="mb-1.5 truncate text-sm font-semibold text-gray-900 dark:text-white">{keyResult.title}</p>
      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div className="h-1.5 rounded-full bg-primary-600" style={{ width: `${Math.round(ratio * 100)}%` }} />
      </div>
      <div className="flex flex-row items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {current}
          {keyResult.unit ? ` ${keyResult.unit}` : ''} / {target}
          {keyResult.unit ? ` ${keyResult.unit}` : ''}
        </span>
        <div className="flex flex-row items-center rounded-lg border border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => adjust(-step)}
            disabled={setValue.isPending}
            aria-label={`Decrease ${keyResult.title}`}
            className="p-2"
          >
            <Icon name="remove" size={16} color="#2563eb" />
          </button>
          <button
            type="button"
            onClick={() => adjust(step)}
            disabled={setValue.isPending}
            aria-label={`Increase ${keyResult.title}`}
            className="p-2"
          >
            <Icon name="add" size={16} color="#2563eb" />
          </button>
        </div>
      </div>
    </div>
  );
}
