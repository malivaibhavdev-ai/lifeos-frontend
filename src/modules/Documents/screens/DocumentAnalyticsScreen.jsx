import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { DocumentScoreRing } from '../components/DocumentScoreRing';
import {
  useDocumentScore, useDocumentStorageUsage, useDocumentCategoriesBreakdown,
  useDocumentLargestFiles, useDocumentRetentionAnalytics,
} from '../hooks/useDocumentAnalytics';
import { formatBytes } from '../utils/formatBytes';

const SUBSCORE_LABELS = {
  organization: 'Organization',
  metadataCompleteness: 'Metadata Completeness',
  ocrCoverage: 'OCR Coverage',
  tagCoverage: 'Tag Coverage',
  securityCoverage: 'Security',
  versioningCoverage: 'Versioning',
  duplicatesHealth: 'Duplicates',
  renewalsHealth: 'Renewals',
};

function Bar({ label, value }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="mb-3">
      <div className="mb-1 flex flex-row items-center justify-between">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{label}</span>
        <span className="text-xs font-semibold text-gray-900 dark:text-white">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div className="h-2 rounded-full bg-primary-600" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export function DocumentAnalyticsScreen() {
  const navigate = useNavigate();
  const { data: score } = useDocumentScore();
  const { data: storage } = useDocumentStorageUsage();
  const { data: categories } = useDocumentCategoriesBreakdown();
  const { data: largestFiles } = useDocumentLargestFiles(5);
  const { data: retention } = useDocumentRetentionAnalytics();

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="ml-3 text-lg font-bold text-gray-900 dark:text-white">Document Analytics</p>
        </div>

        <div className="mb-6 flex flex-col items-center rounded-2xl bg-gray-50 py-6 dark:bg-gray-900">
          <DocumentScoreRing score={score?.overallScore ?? 0} size={120} strokeWidth={10} />
          {score?.strengths?.length > 0 ? (
            <p className="mt-4 px-6 text-center text-xs text-gray-500 dark:text-gray-400">
              Strongest: {score.strengths.map((k) => SUBSCORE_LABELS[k] ?? k).join(', ')}
            </p>
          ) : null}
        </div>

        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Score Breakdown</p>
        {score ? Object.entries(score.subscores).map(([key, value]) => <Bar key={key} label={SUBSCORE_LABELS[key] ?? key} value={value} />) : null}

        {storage ? (
          <div className="my-5 flex flex-row items-center justify-between rounded-2xl bg-gray-50 px-4 py-4 dark:bg-gray-900">
            <div className="flex flex-1 flex-col items-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatBytes(storage.totalSizeBytes)}</p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Storage Used</p>
            </div>
            <div className="flex flex-1 flex-col items-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{storage.documentCount}</p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Documents</p>
            </div>
          </div>
        ) : null}

        {retention ? (
          <div className="mb-5 rounded-2xl bg-gray-50 px-4 py-4 dark:bg-gray-900">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Retention</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{retention.expiringSoon} expiring in 30 days</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{retention.expired} already expired</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{retention.pendingReview} pending review</p>
          </div>
        ) : null}

        {categories?.length > 0 ? (
          <div className="mb-5">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Categories</p>
            {categories.map((c) => (
              <div key={c.category} className="flex flex-row items-center justify-between border-b border-gray-100 py-2.5 dark:border-gray-800">
                <span className="text-sm capitalize text-gray-900 dark:text-white">{c.category.replace(/_/g, ' ')}</span>
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{c.count} · {formatBytes(c.totalSizeBytes)}</span>
              </div>
            ))}
          </div>
        ) : null}

        {largestFiles?.length > 0 ? (
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Largest Files</p>
            {largestFiles.map((doc) => (
              <button
                key={doc._id}
                type="button"
                onClick={() => navigate(`/documents/${doc._id}`)}
                className="flex w-full flex-row items-center justify-between border-b border-gray-100 py-2.5 text-left dark:border-gray-800"
              >
                <span className="flex-1 truncate text-sm text-gray-900 dark:text-white">{doc.title}</span>
                <span className="ml-2 text-xs font-medium text-gray-400 dark:text-gray-500">{formatBytes(doc.sizeBytes)}</span>
              </button>
            ))}
          </div>
        ) : null}
      </PageContainer>
    </Screen>
  );
}
