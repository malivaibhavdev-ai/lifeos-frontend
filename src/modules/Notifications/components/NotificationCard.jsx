import { Icon } from '../../../components/ui/Icon';
import { TYPE_ICON, PRIORITY_COLOR } from '../constants/notificationConstants';
import { timeAgo } from '../utils/timeAgo';

// Web port of the mobile app's NotificationCard — no swipe gestures on
// desktop, so read/unread + delete are small icon buttons revealed on
// hover/focus instead (group-hover), keeping the row itself clean at rest.
export function NotificationCard({
  notification,
  onPress,
  onToggleRead,
  onDelete,
  isSelectionMode,
  isSelected,
  onToggleSelect,
}) {
  const icon = TYPE_ICON[notification.type] ?? 'notifications-outline';
  const priorityColor = PRIORITY_COLOR[notification.priority] ?? PRIORITY_COLOR.normal;
  const isUnread = !notification.isRead;

  return (
    <div
      className={`group mb-2.5 flex flex-row items-start rounded-2xl border px-3.5 py-3.5 ${
        isSelected ? 'border-primary-600 bg-primary-50 dark:bg-primary-900' : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'
      }`}
      style={{ borderLeftWidth: 3, borderLeftColor: isSelected ? undefined : priorityColor }}
    >
      {isSelectionMode ? (
        <button
          type="button"
          onClick={() => onToggleSelect(notification)}
          aria-label="Select"
          className="mr-3 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2"
          style={{ borderColor: '#2563eb', backgroundColor: isSelected ? '#2563eb' : 'transparent' }}
        >
          {isSelected ? <Icon name="checkmark" size={14} color="#fff" /> : null}
        </button>
      ) : (
        <div className="mr-3 mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950">
          <Icon name={icon} size={18} color={priorityColor} />
        </div>
      )}

      <button type="button" onClick={() => onPress(notification)} className="min-w-0 flex-1 text-left">
        <div className="flex flex-row items-center">
          <p className={`flex-1 truncate text-[15px] ${isUnread ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-600 dark:text-gray-300'}`}>
            {notification.title}
          </p>
          {notification.groupCount > 1 ? (
            <span className="ml-2 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              ×{notification.groupCount}
            </span>
          ) : null}
          {isUnread ? <span className="ml-2 h-2 w-2 shrink-0 rounded-full bg-primary-600" /> : null}
        </div>

        {notification.body ? (
          <p className="mt-0.5 line-clamp-2 text-[13px] text-gray-500 dark:text-gray-400">{notification.body}</p>
        ) : null}

        <div className="mt-1.5 flex flex-row items-center" style={{ gap: 8 }}>
          <span className="text-xs text-gray-400 dark:text-gray-500">{timeAgo(notification.createdAt)}</span>
          {notification.isPinned ? <Icon name="pin" size={12} color="#f59e0b" /> : null}
          {notification.isFavorite ? <Icon name="heart" size={12} color="#ef4444" /> : null}
          {notification.snoozedUntil ? <Icon name="alarm-outline" size={12} color="#94a3b8" /> : null}
        </div>
      </button>

      {!isSelectionMode ? (
        <div className="ml-2 flex flex-row items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100" style={{ gap: 4 }}>
          <button
            type="button"
            onClick={() => onToggleRead(notification)}
            aria-label={notification.isRead ? 'Mark unread' : 'Mark read'}
            className="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Icon name={notification.isRead ? 'ellipse-outline' : 'checkmark-done-outline'} size={16} color="#2563eb" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(notification)}
            aria-label="Delete"
            className="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Icon name="trash-outline" size={16} color="#ef4444" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
