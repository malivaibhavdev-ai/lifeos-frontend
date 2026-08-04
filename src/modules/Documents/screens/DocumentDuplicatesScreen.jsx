import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useDocumentDuplicates } from '../hooks/useDocuments';
import { formatBytes } from '../utils/formatBytes';

export function DocumentDuplicatesScreen() {
  const navigate = useNavigate();
  const { data: groups, isLoading } = useDocumentDuplicates();

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="ml-3 text-lg font-bold text-gray-900 dark:text-white">Duplicate Files</p>
        </div>

        {!isLoading && (groups ?? []).length === 0 ? (
          <EmptyState icon="copy-outline" title="No duplicates found" description="Byte-identical files are grouped here so you can clean them up." />
        ) : (
          (groups ?? []).map((group) => (
            <div key={group.checksum} className="mb-4 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                {group.count} identical files
              </p>
              {group.documents.map((doc) => (
                <button
                  key={doc._id}
                  type="button"
                  onClick={() => navigate(`/documents/${doc._id}`)}
                  className="flex w-full flex-row items-center justify-between border-b border-gray-100 py-2.5 text-left dark:border-gray-800"
                >
                  <span className="flex-1 truncate text-sm text-gray-900 dark:text-white">{doc.title}</span>
                  <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">{formatBytes(doc.sizeBytes)}</span>
                </button>
              ))}
            </div>
          ))
        )}
      </PageContainer>
    </Screen>
  );
}
