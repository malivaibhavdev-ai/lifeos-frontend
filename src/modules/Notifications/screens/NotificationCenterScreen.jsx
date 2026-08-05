import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkNotificationUnread,
  useMarkAllNotificationsRead,
  useDeleteNotification,
  useBulkUpdateNotifications,
  useBulkDeleteNotifications,
} from '../hooks/useNotifications';
import { useNotificationStore } from '../store/notificationStore';
import { NotificationCard } from '../components/NotificationCard';
import { FilterChipsBar } from '../components/FilterChipsBar';

const FILTER_TO_PARAMS = {
  all: {},
  unread: { unreadOnly: 'true' },
  pinned: { pinned: 'true' },
  favorites: { favorite: 'true' },
  archived: { archived: 'true' },
};

export function NotificationCenterScreen() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  const params = useMemo(() => ({ ...FILTER_TO_PARAMS[activeFilter], limit: 50 }), [activeFilter]);
  const { data, isLoading } = useNotifications(params);
  const isSocketConnected = useNotificationStore((s) => s.isSocketConnected);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const markRead = useMarkNotificationRead();
  const markUnread = useMarkNotificationUnread();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteOne = useDeleteNotification();
  const bulkUpdate = useBulkUpdateNotifications();
  const bulkDelete = useBulkDeleteNotifications();

  const notifications = data?.items ?? [];
  const isSelecting = selectedIds.length > 0;

  const toggleSelect = (n) => {
    setSelectedIds((prev) => (prev.includes(n._id) ? prev.filter((id) => id !== n._id) : [...prev, n._id]));
  };

  const handleToggleRead = (n) => (n.isRead ? markUnread.mutate(n._id) : markRead.mutate(n._id));

  const handlePress = (n) => {
    if (isSelecting) return toggleSelect(n);
    if (!n.isRead) markRead.mutate(n._id);
    navigate(`/notifications/${n._id}`);
  };

  // Keyboard shortcuts: "r" marks everything read, Escape exits selection
  // mode — ignored while focus is inside a text input/textarea so typing
  // elsewhere in the app never triggers them by accident.
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape' && isSelecting) setSelectedIds([]);
      else if (e.key === 'r' && !isSelecting && unreadCount > 0) markAllRead.mutate();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelecting, unreadCount, markAllRead]);

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <div className="flex flex-row items-center">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{isSelecting ? `${selectedIds.length} selected` : 'Notifications'}</p>
            <span
              className="ml-2 h-2 w-2 rounded-full"
              style={{ backgroundColor: isSocketConnected ? '#22c55e' : '#cbd5e1' }}
              title={isSocketConnected ? 'Live' : 'Offline'}
            />
          </div>
          {isSelecting ? (
            <button type="button" onClick={() => setSelectedIds([])} className="text-sm font-medium text-primary-600">
              Cancel
            </button>
          ) : (
            <div className="flex flex-row items-center" style={{ gap: 16 }}>
              <button type="button" onClick={() => navigate('/notifications/search')} aria-label="Search">
                <Icon name="search-outline" size={22} color="#2563eb" />
              </button>
              {unreadCount > 0 ? (
                <button type="button" onClick={() => markAllRead.mutate()} aria-label="Mark all read" title="Mark all read (r)">
                  <Icon name="checkmark-done-outline" size={22} color="#2563eb" />
                </button>
              ) : null}
              <button type="button" onClick={() => navigate('/notifications/dashboard')} aria-label="Dashboard">
                <Icon name="grid-outline" size={22} color="#2563eb" />
              </button>
            </div>
          )}
        </div>

        <div className="pb-3">
          <FilterChipsBar active={activeFilter} onChange={setActiveFilter} />
        </div>

        {!isLoading && notifications.length === 0 ? (
          <EmptyState icon="notifications-off-outline" title="No notifications" description="You're all caught up." />
        ) : (
          notifications.map((n) => (
            <NotificationCard
              key={n._id}
              notification={n}
              isSelectionMode={isSelecting}
              isSelected={selectedIds.includes(n._id)}
              onPress={handlePress}
              onToggleRead={handleToggleRead}
              onDelete={(item) => deleteOne.mutate(item._id)}
              onToggleSelect={toggleSelect}
            />
          ))
        )}

        {isSelecting ? (
          <div className="fixed inset-x-0 bottom-0 z-10 flex flex-row items-center justify-around border-t border-gray-100 bg-white py-3 dark:border-gray-800 dark:bg-gray-900">
            <button
              type="button"
              onClick={() => { bulkUpdate.mutate({ ids: selectedIds, payload: { isRead: true } }); setSelectedIds([]); }}
              className="flex flex-col items-center"
            >
              <Icon name="checkmark-done-outline" size={20} color="#2563eb" />
              <span className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-300">Read</span>
            </button>
            <button
              type="button"
              onClick={() => { bulkUpdate.mutate({ ids: selectedIds, payload: { isArchived: true } }); setSelectedIds([]); }}
              className="flex flex-col items-center"
            >
              <Icon name="archive-outline" size={20} color="#2563eb" />
              <span className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-300">Archive</span>
            </button>
            <button
              type="button"
              onClick={() => { bulkDelete.mutate(selectedIds); setSelectedIds([]); }}
              className="flex flex-col items-center"
            >
              <Icon name="trash-outline" size={20} color="#ef4444" />
              <span className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-300">Delete</span>
            </button>
          </div>
        ) : null}
      </PageContainer>
    </Screen>
  );
}
