import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { Modal } from '../../../components/ui/Modal';
import { PageContainer } from '../../../components/ui/PageContainer';
import { ToggleButton } from '../components/ToggleButton';
import {
  useNotificationPreferences,
  useUpsertGlobalNotificationPreference,
  useUpsertCategoryNotificationPreference,
  useDeleteCategoryNotificationPreference,
} from '../hooks/useNotificationPreferences';
import { ChannelToggleList } from '../components/ChannelToggleList';

const DEFAULT_CHANNELS = { in_app: true, push: true, web_push: true };

function CategoryModal({ visible, onClose, onSave }) {
  const [category, setCategory] = useState('');
  const [channels, setChannels] = useState(DEFAULT_CHANNELS);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (visible) {
      setCategory('');
      setChannels(DEFAULT_CHANNELS);
      setIsMuted(false);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title="New Category Override"
      onDone={() => {
        if (!category.trim()) return onClose();
        onSave(category.trim(), { channels, isMuted });
      }}
    >
      <input
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="e.g. bill, overdue, birthday"
        className="mb-3 h-12 w-full rounded-xl border border-gray-300 bg-transparent px-4 text-base text-gray-900 outline-none focus:border-primary-600 dark:border-gray-700 dark:text-white"
      />
      <ToggleButton label="Muted" value={isMuted} onChange={setIsMuted} />
      <ChannelToggleList channels={channels} onChange={(key, value) => setChannels((prev) => ({ ...prev, [key]: value }))} />
    </Modal>
  );
}

export function NotificationPreferencesScreen() {
  const navigate = useNavigate();
  const { data, isLoading } = useNotificationPreferences();
  const upsertGlobal = useUpsertGlobalNotificationPreference();
  const upsertCategory = useUpsertCategoryNotificationPreference();
  const deleteCategory = useDeleteCategoryNotificationPreference();
  const [modalVisible, setModalVisible] = useState(false);

  const preferences = data ?? [];
  const global = preferences.find((p) => !p.category) ?? { channels: DEFAULT_CHANNELS, isMuted: false, bypassQuietHours: false };
  const categoryOverrides = preferences.filter((p) => p.category);

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-2xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Preferences</p>
          <div style={{ width: 26 }} />
        </div>

        {!isLoading ? (
          <>
            <p className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">Global Defaults</p>
            <div className="mb-3 flex flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-2.5 dark:border-gray-800 dark:bg-gray-900">
              <span className="text-[15px] text-gray-900 dark:text-white">Mute all notifications</span>
              <ToggleButton value={global.isMuted} onChange={(value) => upsertGlobal.mutate({ isMuted: value })} />
            </div>
            <div className="mb-4 flex flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-2.5 dark:border-gray-800 dark:bg-gray-900">
              <span className="text-[15px] text-gray-900 dark:text-white">Bypass quiet hours</span>
              <ToggleButton value={global.bypassQuietHours} onChange={(value) => upsertGlobal.mutate({ bypassQuietHours: value })} />
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
              <ChannelToggleList
                channels={global.channels}
                onChange={(key, value) => upsertGlobal.mutate({ channels: { ...global.channels, [key]: value } })}
              />
            </div>

            <div className="mb-2 mt-6 flex flex-row items-center justify-between">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Category Overrides</p>
              <button type="button" onClick={() => setModalVisible(true)} aria-label="Add override">
                <Icon name="add-circle-outline" size={20} color="#2563eb" />
              </button>
            </div>

            {categoryOverrides.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">No per-category overrides yet.</p>
            ) : (
              categoryOverrides.map((pref) => (
                <div
                  key={pref._id}
                  className="mb-2 flex flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
                >
                  <div>
                    <p className="text-[15px] font-medium capitalize text-gray-900 dark:text-white">{pref.category}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{pref.isMuted ? 'Muted' : 'Active'}</p>
                  </div>
                  <button type="button" onClick={() => deleteCategory.mutate(pref.category)} aria-label="Delete override">
                    <Icon name="trash-outline" size={18} color="#ef4444" />
                  </button>
                </div>
              ))
            )}
          </>
        ) : null}
      </PageContainer>

      <CategoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={(category, payload) => {
          upsertCategory.mutate({ category, payload });
          setModalVisible(false);
        }}
      />
    </Screen>
  );
}
