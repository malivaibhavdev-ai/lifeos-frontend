import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useReport, useExportReportCSV, useExportReportMarkdown } from '../hooks/useReports';

function downloadText(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportDetailScreen() {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const location = useLocation();
  const name = location.state?.name;
  const { data: report, isLoading } = useReport(reportId);
  const exportCSV = useExportReportCSV();
  const exportMarkdown = useExportReportMarkdown();

  const handleExportMarkdown = async () => {
    const markdown = await exportMarkdown.mutateAsync(reportId);
    downloadText(markdown, `${name ?? 'report'}.md`, 'text/markdown');
  };

  const handleExportCSV = async () => {
    const csv = await exportCSV.mutateAsync(reportId);
    downloadText(csv, `${name ?? 'report'}.csv`, 'text/csv');
  };

  const data = report?.generatedData;

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-2xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="truncate text-lg font-bold text-gray-900 dark:text-white">{name}</p>
          <div className="flex flex-row" style={{ gap: 14 }}>
            <button type="button" onClick={handleExportCSV} aria-label="Export CSV">
              <Icon name="download-outline" size={22} color="#2563eb" />
            </button>
            <button type="button" onClick={handleExportMarkdown} aria-label="Export Markdown">
              <Icon name="share-social-outline" size={22} color="#2563eb" />
            </button>
          </div>
        </div>

        {!isLoading && data ? (
          <>
            {data.lifeScore ? (
              <div className="mb-5 rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Life Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.lifeScore.overallScore}/100</p>
                {Object.entries(data.lifeScore.subscores).filter(([, v]) => v !== null).map(([key, value]) => (
                  <div key={key} className="mt-2 flex flex-row items-center justify-between">
                    <span className="text-xs capitalize text-gray-600 dark:text-gray-300">{key}</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {data.insights ? (
              <div className="mb-5">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Top Improvements</p>
                {data.insights.topImprovements.map((m) => (
                  <p key={m.key} className="mb-1 text-sm text-gray-700 dark:text-gray-300">• {m.label}: +{m.percentChange}%</p>
                ))}
                <p className="mb-2 mt-3 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Top Declines</p>
                {data.insights.topDeclines.map((m) => (
                  <p key={m.key} className="mb-1 text-sm text-gray-700 dark:text-gray-300">• {m.label}: {m.percentChange}%</p>
                ))}
              </div>
            ) : null}

            {data.trends ? (
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Trends</p>
                {data.trends.map((t) => (
                  <div key={t.metricKey} className="mb-2 flex flex-row items-center justify-between border-b border-gray-100 py-2 dark:border-gray-800">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t.label}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      growth {t.growthRatePercent !== null ? `${t.growthRatePercent}%` : 'n/a'} · consistency {t.consistencyScore ?? 'n/a'}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </PageContainer>
    </Screen>
  );
}
