import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { useInterviewList } from '../hooks/useInterviews';
import { InterviewFormSheet } from '../components/InterviewFormSheet';

const RESULT_COLOR = { pending: 'text-amber-500', passed: 'text-success', failed: 'text-danger', cancelled: 'text-gray-400' };

export function InterviewsScreen() {
  const navigate = useNavigate();
  const { data: interviews } = useInterviewList();
  const [showForm, setShowForm] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);

  const items = interviews ?? EMPTY_ARRAY;

  return (
    <Screen>
      <PageContainer maxWidth="max-w-5xl" className="flex flex-1 min-h-0 flex-col">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} className="p-1" aria-label="Go back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Interviews</p>
          <button type="button" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600" aria-label="Schedule interview">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-6 pt-2">
          {items.length === 0 ? (
            <EmptyState icon="people-outline" title="No interviews yet" description="Schedule an interview to get reminders and track prep." ctaLabel="Schedule Interview" onCtaPress={() => setShowForm(true)} />
          ) : (
            <div className="sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
              {items.map((interview) => (
                <button type="button" key={interview._id} onClick={() => setEditingInterview(interview)} className="mb-2 flex w-full flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900 sm:mb-0">
                  <div>
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">{interview.company}{interview.round ? ` · ${interview.round}` : ''}</span>
                    <span className="mt-0.5 block text-xs text-gray-400 dark:text-gray-500">{new Date(interview.scheduledAt).toLocaleString()}</span>
                  </div>
                  <span className={`text-xs font-semibold capitalize ${RESULT_COLOR[interview.result] ?? 'text-gray-400'}`}>{interview.result}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <InterviewFormSheet visible={showForm || Boolean(editingInterview)} onClose={() => { setShowForm(false); setEditingInterview(null); }} interview={editingInterview} />
      </PageContainer>
    </Screen>
  );
}
