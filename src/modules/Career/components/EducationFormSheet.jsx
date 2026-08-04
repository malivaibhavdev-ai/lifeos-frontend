import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { useCreateEducation, useUpdateEducation, useDeleteEducation } from '../hooks/useEducation';

function defaultFormState(entry) {
  if (!entry) return { institution: '', degree: '', specialization: '', cgpa: '', passingYear: '' };
  return {
    institution: entry.institution, degree: entry.degree ?? '', specialization: entry.specialization ?? '',
    cgpa: entry.cgpa != null ? String(entry.cgpa) : '', passingYear: entry.passingYear != null ? String(entry.passingYear) : '',
  };
}

export function EducationFormSheet({ visible, onClose, entry }) {
  const [form, setForm] = useState(() => defaultFormState(entry));
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);
  const createEntry = useCreateEducation();
  const updateEntry = useUpdateEducation();
  const deleteEntry = useDeleteEducation();

  useEffect(() => {
    if (visible) { setForm(defaultFormState(entry)); setSaveError(null); }
  }, [visible, entry]);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!form.institution.trim()) return setSaveError('Institution is required');
    isSubmittingRef.current = true;
    setSaveError(null);
    try {
      const payload = {
        institution: form.institution, degree: form.degree, specialization: form.specialization,
        cgpa: form.cgpa ? Number(form.cgpa) : undefined, passingYear: form.passingYear ? Number(form.passingYear) : undefined,
      };
      if (entry) await updateEntry.mutateAsync({ id: entry._id, ...payload });
      else await createEntry.mutateAsync(payload);
      onClose();
    } catch (error) {
      setSaveError(error?.message || 'Failed to save entry');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={entry ? 'Edit Education' : 'Add Education'}>
      {saveError ? <ErrorBanner message={saveError} /> : null}
      <input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="Institution *" aria-label="Institution" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} placeholder="Degree" aria-label="Degree" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="Specialization" aria-label="Specialization" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value.replace(/[^0-9.]/g, '') })} placeholder="CGPA" aria-label="CGPA" inputMode="decimal" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.passingYear} onChange={(e) => setForm({ ...form, passingYear: e.target.value.replace(/[^0-9]/g, '') })} placeholder="Passing Year" aria-label="Passing Year" inputMode="numeric" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      {entry ? (
        <button type="button" onClick={() => deleteEntry.mutate(entry._id, { onSuccess: onClose })} className="mt-1 flex w-full items-center justify-center rounded-xl border border-red-200 py-3 dark:border-red-900">
          <span className="text-sm font-semibold text-danger">Delete</span>
        </button>
      ) : null}
    </Modal>
  );
}
