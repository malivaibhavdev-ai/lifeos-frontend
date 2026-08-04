import { Icon } from '../../../components/ui/Icon';
import { selectionAsync } from '../../../services/haptics';
import { SMART_LISTS } from '../constants/taskConstants';

const COUNT_KEYS = {
  today: 'today',
  overdue: 'overdue',
  upcoming: 'upcoming',
  inbox: 'inbox',
  flagged: 'flagged',
  highPriority: 'highPriority',
  completed: 'completed',
};

export function SmartListTabs({ activeKey, onChange, counts }) {
  const handlePress = (key) => {
    selectionAsync();
    onChange(key);
  };

  return (
    <div className="h-11 overflow-x-auto">
      <div className="flex h-11 flex-row items-center gap-2 px-4" role="tablist">
        {SMART_LISTS.map((list) => {
          const isActive = list.key === activeKey;
          const count = counts?.[COUNT_KEYS[list.key]];

          return (
            <button
              type="button"
              key={list.key}
              onClick={() => handlePress(list.key)}
              role="tab"
              aria-selected={isActive}
              aria-label={count > 0 ? `${list.label}, ${count} tasks` : list.label}
              style={{ height: 36 }}
              className={`flex flex-shrink-0 flex-row items-center rounded-full border px-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                isActive ? 'border-primary-600 bg-primary-600' : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
              }`}
            >
              <Icon name={list.icon} size={15} color={isActive ? '#fff' : '#64748b'} />
              <span className={`ml-1.5 text-sm font-medium ${isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                {list.label}
              </span>
              {count > 0 ? (
                <span
                  className={`ml-1.5 min-w-[18px] rounded-full px-1.5 text-center ${
                    isActive ? 'bg-white/25' : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <span className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                    {count}
                  </span>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
