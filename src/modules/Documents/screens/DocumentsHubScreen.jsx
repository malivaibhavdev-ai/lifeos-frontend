import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useDocumentDashboard } from '../hooks/useDocumentDashboard';
import { DocumentScoreRing } from '../components/DocumentScoreRing';
import { DocumentCard } from '../components/DocumentCard';
import { formatBytes } from '../utils/formatBytes';

function QuickAction({ icon, label, onClick }) {
  return (
    <button type="button" onClick={onClick} className="mr-3 flex flex-col items-center" style={{ width: 76 }}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950">
        <Icon name={icon} size={22} color="#2563eb" />
      </div>
      <span className="mt-1.5 text-center text-[11px] font-medium text-gray-600 dark:text-gray-300">{label}</span>
    </button>
  );
}

function SectionHeader({ title, onSeeAll }) {
  return (
    <div className="mb-2 mt-5 flex flex-row items-center justify-between">
      <p className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{title}</p>
      {onSeeAll ? (
        <button type="button" onClick={onSeeAll} className="text-xs font-medium text-primary-600">See all</button>
      ) : null}
    </div>
  );
}

function SmartCollectionChip({ collection, onClick }) {
  return (
    <button type="button" onClick={onClick} className="mr-2 flex flex-row items-center rounded-full border border-gray-200 px-3.5 py-2 dark:border-gray-700">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{collection.label}</span>
      <span className="ml-1.5 rounded-full bg-primary-100 px-1.5 dark:bg-primary-900">
        <span className="text-[11px] font-semibold text-primary-700 dark:text-primary-300">{collection.count}</span>
      </span>
    </button>
  );
}

export function DocumentsHubScreen() {
  const navigate = useNavigate();
  const { data: dashboard, isLoading } = useDocumentDashboard();

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">Documents</p>
          <div className="flex flex-row" style={{ gap: 14 }}>
            <button type="button" onClick={() => navigate('/documents/search')} aria-label="Search">
              <Icon name="search-outline" size={24} color="#2563eb" />
            </button>
            <button type="button" onClick={() => navigate('/documents/upload')} aria-label="Upload">
              <Icon name="add-circle" size={26} color="#2563eb" />
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center py-6">
          <DocumentScoreRing score={dashboard?.documentHealth?.overallScore ?? 0} size={128} strokeWidth={11} />
        </div>

        <div className="flex flex-row overflow-x-auto pb-2">
          <QuickAction icon="cloud-upload-outline" label="Upload" onClick={() => navigate('/documents/upload')} />
          <QuickAction icon="folder-outline" label="Folders" onClick={() => navigate('/documents/folders')} />
          <QuickAction icon="search-outline" label="Search" onClick={() => navigate('/documents/search')} />
          <QuickAction icon="trash-outline" label="Trash" onClick={() => navigate('/documents/trash')} />
          <QuickAction icon="copy-outline" label="Duplicates" onClick={() => navigate('/documents/duplicates')} />
          <QuickAction icon="stats-chart-outline" label="Analytics" onClick={() => navigate('/documents/analytics')} />
          <QuickAction icon="flash-outline" label="Automation" onClick={() => navigate('/documents/automation-rules')} />
          <QuickAction icon="people-outline" label="Shared" onClick={() => navigate('/documents/shared-with-me')} />
          <QuickAction icon="time-outline" label="Activity" onClick={() => navigate('/documents/activity-log')} />
        </div>

        {dashboard?.storageUsage ? (
          <div className="mt-5 flex flex-row items-center justify-between rounded-2xl bg-gray-50 px-4 py-4 dark:bg-gray-900">
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatBytes(dashboard.storageUsage.totalSizeBytes)}</p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{dashboard.storageUsage.documentCount} documents · {dashboard.folderStats?.folderCount ?? 0} folders</p>
            </div>
            <Icon name="server-outline" size={28} color="#94a3b8" />
          </div>
        ) : null}

        {dashboard?.smartCollections?.length > 0 ? (
          <>
            <SectionHeader title="Smart Collections" />
            <div className="flex flex-row overflow-x-auto pb-2">
              {dashboard.smartCollections.map((c) => (
                <SmartCollectionChip
                  key={c.key}
                  collection={c}
                  onClick={() => {
                    if (c.key === 'duplicates') navigate('/documents/duplicates');
                    else navigate(`/documents/list?filter=${c.key}`);
                  }}
                />
              ))}
            </div>
          </>
        ) : null}

        {dashboard?.recent?.length > 0 ? (
          <>
            <SectionHeader title="Recent Documents" onSeeAll={() => navigate('/documents/list')} />
            {dashboard.recent.map((doc) => (
              <DocumentCard key={doc._id} document={doc} onPress={(d) => navigate(`/documents/${d._id}`)} />
            ))}
          </>
        ) : null}

        {dashboard?.favorites?.length > 0 ? (
          <>
            <SectionHeader title="Favorites" onSeeAll={() => navigate('/documents/list?filter=favorites')} />
            {dashboard.favorites.map((doc) => (
              <DocumentCard key={doc._id} document={doc} onPress={(d) => navigate(`/documents/${d._id}`)} />
            ))}
          </>
        ) : null}

        {dashboard?.expiring?.length > 0 ? (
          <>
            <SectionHeader title="Expiring Soon" />
            {dashboard.expiring.map((doc) => (
              <DocumentCard key={doc._id} document={doc} onPress={(d) => navigate(`/documents/${d._id}`)} />
            ))}
          </>
        ) : null}

        {!isLoading && !dashboard?.recent?.length ? (
          <div className="mt-10 flex items-center px-10">
            <p className="text-center text-sm text-gray-400 dark:text-gray-500">Upload your first document to get started.</p>
          </div>
        ) : null}
      </PageContainer>
    </Screen>
  );
}
