import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { INTERVIEW_RESULT } from '../constants/careerConstants';
import { useCreateInterview, useUpdateInterview, useDeleteInterview } from '../hooks/useInterviews';

function toLocalInput(date) {
  return date ? new Date(date).toISOString().slice(0, 16) : '';
}

function defaultFormState(interview) {
  if (!interview) return { company: '', round: '', scheduledAt: '', interviewer: '', platform: '', result: 'pending' };
  return {
    company: interview.company, round: interview.round ?? '', scheduledAt: toLocalInput(interview.scheduledAt),
    interviewer: interview.interviewer ?? '', platform: interview.platform ?? '', result: interview.result,
  };
}

export function InterviewFormSheet({ visible, onClose, interview }) {
  const [form, setForm] = useState(() => defaultFormState(interview));
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);
  const createInterview = useCreateInterview();
  const updateInterview = useUpdateInterview();
  const deleteInterview = useDeleteInterview();

  useEffect(() => {
    if (visible) { setForm(defaultFormState(interview)); setSaveError(null); }
  }, [visible, interview]);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!form.company.trim() || !form.scheduledAt) return setSaveError('Company and date/time are required');
    isSubmittingRef.current = true;
    setSaveError(null);
    try {
      const payload = { ...form, scheduledAt: new Date(form.scheduledAt).toISOString() };
      if (interview) await updateInterview.mutateAsync({ id: interview._id, ...payload });
      else await createInterview.mutateAsync(payload);
      onClose();
    } catch (error) {
      setSaveError(error?.message || 'Failed to save interview');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={interview ? 'Edit Interview' : 'Schedule Interview'}>
      {saveError ? <ErrorBanner message={saveError} /> : null}
      <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company *" aria-label="Company" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.round} onChange={(e) => setForm({ ...form, round: e.target.value })} placeholder="Round (e.g. Technical, HR)" aria-label="Round (e.g. Technical, HR)" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} placeholder="Date & time (YYYY-MM-DDTHH:mm) *" aria-label="Date & time (YYYY-MM-DDTHH:mm)" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.interviewer} onChange={(e) => setForm({ ...form, interviewer: e.target.value })} placeholder="Interviewer" aria-label="Interviewer" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="Platform / Location" aria-label="Platform / Location" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />

      <div className="mb-3 flex flex-row overflow-x-auto">
        {INTERVIEW_RESULT.map((result) => {
          const isSelected = form.result === result;
          return (
            <button type="button" key={result} onClick={() => setForm({ ...form, result })} className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-sm font-medium capitalize ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{result}</span>
            </button>
          );
        })}
      </div>

      {interview ? (
        <button type="button" onClick={() => deleteInterview.mutate(interview._id, { onSuccess: onClose })} className="mt-1 flex w-full items-center justify-center rounded-xl border border-red-200 py-3 dark:border-red-900">
          <span className="text-sm font-semibold text-danger">Delete</span>
        </button>
      ) : null}
    </Modal>
  );
}
