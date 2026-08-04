import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { useJobApplicationList, useJobApplicationFunnel } from '../hooks/useJobApplications';
import { JOB_APPLICATION_STATUS } from '../constants/careerConstants';
import { JobApplicationFormSheet } from '../components/JobApplicationFormSheet';

export function JobApplicationsScreen() {
  const navigate = useNavigate();
  const { data } = useJobApplicationList();
  const { data: funnel } = useJobApplicationFunnel();
  const [showForm, setShowForm] = useState(false);
  const [editingApp, setEditingApp] = useState(null);

  const items = data?.items ?? data ?? EMPTY_ARRAY;

  return (
    <Screen>
      <PageContainer maxWidth="max-w-5xl" className="flex flex-1 min-h-0 flex-col">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} className="p-1" aria-label="Go back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Job Search</p>
          <button type="button" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600" aria-label="Add job application">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>

        {funnel ? (
          <div className="flex flex-row overflow-x-auto pb-3">
            {Object.entries(funnel.byStatus).map(([status, count]) => (
              <div key={status} className="mr-2 flex flex-col items-center rounded-xl border border-gray-100 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
                <span className="text-base font-bold text-gray-900 dark:text-white">{count}</span>
                <span className="text-[10px] text-gray-400">{JOB_APPLICATION_STATUS[status]?.label ?? status}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto pb-6">
          {items.length === 0 ? (
            <EmptyState icon="search-outline" title="No applications yet" description="Track roles you've applied to or are interested in." ctaLabel="Add Application" onCtaPress={() => setShowForm(true)} />
          ) : (
            <div className="sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
              {items.map((app) => (
                <button type="button" key={app._id} onClick={() => setEditingApp(app)} className="mb-2 flex w-full flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900 sm:mb-0">
                  <div>
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">{app.role}</span>
                    <span className="mt-0.5 block text-xs text-gray-400 dark:text-gray-500">{app.company} · {app.location}</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: JOB_APPLICATION_STATUS[app.status]?.color }}>
                    {JOB_APPLICATION_STATUS[app.status]?.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <JobApplicationFormSheet visible={showForm || Boolean(editingApp)} onClose={() => { setShowForm(false); setEditingApp(null); }} application={editingApp} />
      </PageContainer>
    </Screen>
  );
}
