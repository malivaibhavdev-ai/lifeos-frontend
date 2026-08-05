import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { PageContainer } from '../../../components/ui/PageContainer';
import {
  useNotification,
  useSetNotificationArchived,
  useSetNotificationPinned,
  useSetNotificationFavorite,
  useExecuteNotificationAction,
  useDeleteNotification,
} from '../hooks/useNotifications';
import { ActionButtonsRow } from '../components/ActionButtonsRow';
import { SnoozeModal } from '../components/SnoozeModal';
import { TYPE_ICON, PRIORITY_COLOR, PRIORITY_LABEL, CHANNEL_LABEL } from '../constants/notificationConstants';
import { navigateToNotificationEntity } from '../utils/navigateToNotificationEntity';

function InfoRow({ label, value }) {
  if (value == null) return null;
  return (
    <div className="flex flex-row items-center justify-between py-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

export function NotificationDetailScreen() {
  const navigate = useNavigate();
  const { notificationId } = useParams();
  const [snoozeVisible, setSnoozeVisible] = useState(false);

  const { data: notification, isLoading, error } = useNotification(notificationId);
  const setArchived = useSetNotificationArchived();
  const setPinned = useSetNotificationPinned();
  const setFavorite = useSetNotificationFavorite();
  const executeAction = useExecuteNotificationAction();
  const deleteOne = useDeleteNotification();

  if (isLoading || !notification) {
    return (
      <Screen scroll>
        <PageContainer maxWidth="max-w-2xl">
          <ErrorBanner message={error?.message} />
        </PageContainer>
      </Screen>
    );
  }

  const icon = TYPE_ICON[notification.type] ?? 'notifications-outline';
  const priorityColor = PRIORITY_COLOR[notification.priority] ?? PRIORITY_COLOR.normal;

  const runAction = (actionKey, payload) => {
    executeAction.mutate({ id: notificationId, actionKey, payload });
    if (actionKey === 'open' && notification.relatedType) {
      navigateToNotificationEntity(notification.relatedType, notification.relatedId);
    }
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-2xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <div className="flex flex-row items-center" style={{ gap: 18 }}>
            <button type="button" onClick={() => setPinned.mutate({ id: notificationId, value: !notification.isPinned })} aria-label="Pin">
              <Icon name={notification.isPinned ? 'pin' : 'pin-outline'} size={20} color={notification.isPinned ? '#f59e0b' : '#94a3b8'} />
            </button>
            <button type="button" onClick={() => setFavorite.mutate({ id: notificationId, value: !notification.isFavorite })} aria-label="Favorite">
              <Icon name={notification.isFavorite ? 'heart' : 'heart-outline'} size={20} color={notification.isFavorite ? '#ef4444' : '#94a3b8'} />
            </button>
            <button
              type="button"
              onClick={() => {
                deleteOne.mutate(notificationId);
                navigate(-1);
              }}
              aria-label="Delete"
            >
              <Icon name="trash-outline" size={20} color="#ef4444" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center py-4">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950">
            <Icon name={icon} size={30} color={priorityColor} />
          </div>
          <p className="text-center text-xl font-bold text-gray-900 dark:text-white">{notification.title}</p>
          {notification.body ? (
            <p className="mt-2 text-center text-[15px] text-gray-600 dark:text-gray-300">{notification.body}</p>
          ) : null}
        </div>

        <ActionButtonsRow
          actions={notification.actions}
          onAction={(key) => runAction(key)}
          onSnoozePress={() => setSnoozeVisible(true)}
        />

        <div className="mt-6 rounded-2xl border border-gray-100 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
          <InfoRow label="Priority" value={PRIORITY_LABEL[notification.priority]} />
          <InfoRow label="Category" value={notification.category} />
          <InfoRow label="Module" value={notification.module} />
          <InfoRow label="Created" value={new Date(notification.createdAt).toLocaleString()} />
          <InfoRow label="Delivered" value={notification.deliveredAt ? new Date(notification.deliveredAt).toLocaleString() : 'Not yet'} />
          <InfoRow label="Status" value={notification.isRead ? 'Read' : 'Unread'} />
          {notification.groupCount > 1 ? <InfoRow label="Grouped" value={`${notification.groupCount} notifications`} /> : null}
        </div>

        {notification.channels?.length ? (
          <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">Delivery Channels</p>
            {notification.channels.map((channel) => {
              const result = notification.channelResults?.[channel];
              const delivered = result?.delivered;
              return (
                <div key={channel} className="flex flex-row items-center justify-between py-1.5">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{CHANNEL_LABEL[channel] ?? channel}</span>
                  <div className="flex flex-row items-center" style={{ gap: 6 }}>
                    <Icon name={delivered ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={delivered ? '#22c55e' : '#94a3b8'} />
                    <span className="text-xs text-gray-400 dark:text-gray-500">{delivered ? 'Delivered' : result?.reason ?? 'Pending'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setArchived.mutate({ id: notificationId, value: !notification.isArchived })}
          className="mt-4 flex w-full flex-row items-center justify-center rounded-full border border-gray-200 py-3 dark:border-gray-700"
        >
          <Icon name={notification.isArchived ? 'arrow-undo-outline' : 'archive-outline'} size={16} color="#2563eb" />
          <span className="ml-2 text-sm font-semibold text-primary-600">{notification.isArchived ? 'Unarchive' : 'Archive'}</span>
        </button>
      </PageContainer>

      <SnoozeModal
        visible={snoozeVisible}
        onClose={() => setSnoozeVisible(false)}
        onSelect={(preset) => {
          runAction('snooze', { preset });
          setSnoozeVisible(false);
          navigate(-1);
        }}
      />
    </Screen>
  );
}
