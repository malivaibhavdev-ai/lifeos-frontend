import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useDevices, useRemoveDevice } from '../hooks/useDevices';
import { subscribeToWebPush, isWebPushSupported } from '../services/webPush';
import { timeAgo } from '../utils/timeAgo';

const PLATFORM_ICON = { ios: 'logo-apple', android: 'logo-android', web: 'globe-outline' };

export function DevicesScreen() {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useDevices();
  const removeDevice = useRemoveDevice();
  const [error, setError] = useState(null);
  const [subscribing, setSubscribing] = useState(false);

  const devices = data ?? [];

  const handleRegisterBrowser = async () => {
    setError(null);
    setSubscribing(true);
    try {
      await subscribeToWebPush();
      await refetch();
    } catch (e) {
      setError(e.message ?? 'Could not register this browser for push notifications');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-2xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Devices</p>
          <button type="button" onClick={handleRegisterBrowser} aria-label="Register this browser" disabled={subscribing || !isWebPushSupported()}>
            <Icon name="add-circle-outline" size={22} color="#2563eb" />
          </button>
        </div>

        <ErrorBanner message={error} />

        {!isWebPushSupported() ? (
          <p className="mb-3 text-xs text-gray-400 dark:text-gray-500">Web Push isn't supported in this browser.</p>
        ) : null}

        {!isLoading && devices.length === 0 ? (
          <EmptyState
            icon="phone-portrait-outline"
            title="No devices registered"
            description="Register this browser to receive Web Push notifications, or register a mobile device from the LifeOS app."
            ctaLabel={isWebPushSupported() ? 'Register this browser' : undefined}
            onCtaPress={isWebPushSupported() ? handleRegisterBrowser : undefined}
          />
        ) : (
          devices.map((device) => (
            <div
              key={device._id}
              className="mb-3 flex flex-row items-center rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950">
                <Icon name={PLATFORM_ICON[device.platform] ?? 'hardware-chip-outline'} size={20} color="#2563eb" />
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold text-gray-900 dark:text-white">
                  {device.deviceName ?? `${device.platform} device`}
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {device.isActive ? 'Active' : 'Inactive'} · Last seen {timeAgo(device.lastActiveAt)}
                </p>
                {device.lastDeliveryError ? (
                  <p className="mt-0.5 truncate text-xs text-danger">{device.lastDeliveryError}</p>
                ) : null}
              </div>
              <button type="button" onClick={() => removeDevice.mutate(device._id)} aria-label="Remove device">
                <Icon name="trash-outline" size={18} color="#ef4444" />
              </button>
            </div>
          ))
        )}
      </PageContainer>
    </Screen>
  );
}
