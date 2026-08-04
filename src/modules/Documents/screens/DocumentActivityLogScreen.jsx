import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useDocumentTimeline } from '../hooks/useDocumentActivityLog';

const ACTION_ICON = {
  create: 'add-circle-outline',
  update: 'create-outline',
  delete: 'trash-outline',
  restore: 'refresh-outline',
  archive: 'archive-outline',
  unarchive: 'archive-outline',
  rename: 'text-outline',
  move: 'folder-outline',
  copy: 'copy-outline',
  upload_version: 'cloud-upload-outline',
  restore_version: 'git-branch-outline',
  download: 'download-outline',
  open: 'eye-outline',
  share: 'share-social-outline',
  unshare: 'close-circle-outline',
  lock: 'lock-closed-outline',
  unlock: 'lock-open-outline',
  favorite: 'heart-outline',
  pin: 'pin-outline',
};

export function DocumentActivityLogScreen() {
  const navigate = useNavigate();
  const { data: entries, isLoading } = useDocumentTimeline({});

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="ml-3 text-lg font-bold text-gray-900 dark:text-white">Activity Timeline</p>
        </div>

        {!isLoading && (entries ?? []).length === 0 ? (
          <EmptyState icon="time-outline" title="No activity yet" description="Every create, edit, share, and download shows up here." />
        ) : (
          (entries ?? []).map((entry) => (
            <div key={entry._id} className="mb-2 flex flex-row items-center rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-900">
              <Icon name={ACTION_ICON[entry.action] ?? 'ellipse-outline'} size={18} color="#2563eb" />
              <div className="ml-3 flex-1">
                <p className="text-sm text-gray-900 dark:text-white">{entry.summary}</p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{new Date(entry.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))
        )}
      </PageContainer>
    </Screen>
  );
}
