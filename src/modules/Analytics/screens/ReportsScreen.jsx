import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useReports, useGenerateReport } from '../hooks/useReports';

const REPORT_TYPES = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
const TYPE_TO_DAYS = { daily: 1, weekly: 7, monthly: 30, quarterly: 90, yearly: 365 };

function GenerateReportModal({ visible, onClose }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('weekly');
  const [error, setError] = useState(null);
  const generateReport = useGenerateReport();

  const handleSubmit = () => {
    if (!name.trim()) return setError('Report name is required');
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - TYPE_TO_DAYS[type]);
    generateReport.mutate(
      { name: name.trim(), type, from: from.toISOString(), to: to.toISOString(), sections: ['lifeScore', 'insights', 'trends'] },
      { onSuccess: () => { onClose(); setName(''); }, onError: (e) => setError(e?.message) }
    );
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title="Generate Report">
      <ErrorBanner message={error} />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Report name *"
        className="mb-4 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
      <div className="flex flex-row flex-wrap" style={{ gap: 8 }}>
        {REPORT_TYPES.map((t) => (
          <button key={t} type="button" onClick={() => setType(t)} className={`rounded-full border px-3.5 py-2 ${type === t ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
            <span className={`text-sm font-medium capitalize ${type === t ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{t}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

export function ReportsScreen() {
  const navigate = useNavigate();
  const { data: reports, isLoading } = useReports();
  const [showForm, setShowForm] = useState(false);

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Reports</p>
          <button type="button" onClick={() => setShowForm(true)} aria-label="Generate report">
            <Icon name="add" size={24} color="#2563eb" />
          </button>
        </div>

        {!isLoading && (reports ?? []).length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No reports yet"
            description="Generate a daily, weekly, monthly, or custom report with your Life Score, insights, and trends."
            ctaLabel="Generate report"
            onCtaPress={() => setShowForm(true)}
          />
        ) : (
          (reports ?? []).map((report) => (
            <button
              key={report._id}
              type="button"
              onClick={() => navigate(`/analytics/reports/${report._id}`, { state: { name: report.name } })}
              className="mb-3 flex w-full flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 text-left dark:border-gray-800 dark:bg-gray-900"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{report.name}</p>
                <p className="mt-0.5 text-xs capitalize text-gray-400 dark:text-gray-500">{report.type} · {new Date(report.createdAt).toLocaleDateString()}</p>
              </div>
              <Icon name="chevron-forward" size={18} color="#94a3b8" />
            </button>
          ))
        )}
      </PageContainer>

      <GenerateReportModal visible={showForm} onClose={() => setShowForm(false)} />
    </Screen>
  );
}
