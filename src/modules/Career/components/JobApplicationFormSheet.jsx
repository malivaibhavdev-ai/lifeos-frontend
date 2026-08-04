import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { JOB_APPLICATION_STATUS, JOB_APPLICATION_STATUS_ORDER } from '../constants/careerConstants';
import { useCreateJobApplication, useUpdateJobApplication, useDeleteJobApplication } from '../hooks/useJobApplications';

function defaultFormState(app) {
  if (!app) return { company: '', role: '', salary: '', location: '', platform: '', status: 'wishlist', deadline: '' };
  return {
    company: app.company, role: app.role, salary: app.salary != null ? String(app.salary) : '',
    location: app.location ?? '', platform: app.platform ?? '', status: app.status, deadline: app.deadline?.slice(0, 10) ?? '',
  };
}

export function JobApplicationFormSheet({ visible, onClose, application }) {
  const [form, setForm] = useState(() => defaultFormState(application));
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);
  const createApp = useCreateJobApplication();
  const updateApp = useUpdateJobApplication();
  const deleteApp = useDeleteJobApplication();

  useEffect(() => {
    if (visible) { setForm(defaultFormState(application)); setSaveError(null); }
  }, [visible, application]);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!form.company.trim() || !form.role.trim()) return setSaveError('Company and role are required');
    isSubmittingRef.current = true;
    setSaveError(null);
    try {
      const payload = { ...form, salary: form.salary ? Number(form.salary) : undefined, deadline: form.deadline || null };
      if (application) await updateApp.mutateAsync({ id: application._id, ...payload });
      else await createApp.mutateAsync(payload);
      onClose();
    } catch (error) {
      setSaveError(error?.message || 'Failed to save application');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={application ? 'Edit Application' : 'Add Application'}>
      {saveError ? <ErrorBanner message={saveError} /> : null}
      <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company *" aria-label="Company" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role *" aria-label="Role" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" aria-label="Location" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} placeholder="Platform (LinkedIn, referral, ...)" aria-label="Platform (LinkedIn, referral, ...)" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value.replace(/[^0-9.]/g, '') })} placeholder="Salary" aria-label="Salary" inputMode="decimal" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} placeholder="Deadline (YYYY-MM-DD)" aria-label="Deadline (YYYY-MM-DD)" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />

      <div className="mb-3 flex flex-row overflow-x-auto">
        {JOB_APPLICATION_STATUS_ORDER.map((key) => {
          const isSelected = form.status === key;
          return (
            <button type="button" key={key} onClick={() => setForm({ ...form, status: key })} className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{JOB_APPLICATION_STATUS[key].label}</span>
            </button>
          );
        })}
      </div>

      {application ? (
        <button type="button" onClick={() => deleteApp.mutate(application._id, { onSuccess: onClose })} className="mt-1 flex w-full items-center justify-center rounded-xl border border-red-200 py-3 dark:border-red-900">
          <span className="text-sm font-semibold text-danger">Delete</span>
        </button>
      ) : null}
    </Modal>
  );
}
