import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useDocumentVersions, useUploadDocumentVersion, useRestoreVersion, useCompareVersions } from '../hooks/useDocuments';
import { formatBytes } from '../utils/formatBytes';

export function DocumentVersionsScreen() {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const { data: versions, isLoading } = useDocumentVersions(documentId);
  const uploadVersion = useUploadDocumentVersion();
  const restoreVersion = useRestoreVersion();
  const [compareSelection, setCompareSelection] = useState([]);
  const fileInputRef = useRef(null);

  const compareIds = compareSelection.length === 2 ? compareSelection : [null, null];
  const { data: comparison } = useCompareVersions(documentId, compareIds[0], compareIds[1]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    uploadVersion.mutate({ id: documentId, formData });
    e.target.value = '';
  };

  const handleRestore = (versionNumber) => {
    if (!window.confirm(`Restore to version ${versionNumber}? This creates a new version with that file.`)) return;
    restoreVersion.mutate({ id: documentId, versionNumber });
  };

  const toggleCompare = (versionNumber) => {
    setCompareSelection((prev) => {
      if (prev.includes(versionNumber)) return prev.filter((v) => v !== versionNumber);
      if (prev.length >= 2) return [prev[1], versionNumber];
      return [...prev, versionNumber];
    });
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Version History</p>
          <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Upload new version">
            <Icon name="cloud-upload-outline" size={22} color="#2563eb" />
          </button>
        </div>

        {compareSelection.length === 2 && comparison ? (
          <div className="mb-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Comparing v{comparison.versionA} → v{comparison.versionB}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Size {comparison.metaDiff.sizeDelta >= 0 ? '+' : ''}{comparison.metaDiff.sizeDelta} bytes
              {comparison.metaDiff.checksumChanged ? ' · content changed' : ' · content identical'}
            </p>
            {comparison.textDiff ? (
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{comparison.textDiff.changedLineCount} line(s) changed</p>
            ) : null}
          </div>
        ) : null}

        {!isLoading && (versions ?? []).length === 0 ? (
          <EmptyState icon="git-branch-outline" title="No version history" />
        ) : (
          (versions ?? []).map((v) => (
            <div
              key={v._id}
              className={`mb-3 flex flex-row items-center justify-between rounded-2xl border p-4 ${compareSelection.includes(v.versionNumber) ? 'border-primary-600 bg-primary-50 dark:bg-primary-950' : 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900'}`}
            >
              <button type="button" onClick={() => toggleCompare(v.versionNumber)} className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Version {v.versionNumber}</p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{v.note || 'No note'} · {formatBytes(v.sizeBytes)}</p>
              </button>
              <button type="button" onClick={() => handleRestore(v.versionNumber)} aria-label="Restore this version">
                <Icon name="refresh-outline" size={18} color="#2563eb" />
              </button>
            </div>
          ))
        )}
      </PageContainer>
    </Screen>
  );
}
