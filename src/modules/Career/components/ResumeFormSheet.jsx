import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { useCreateResume, useUpdateResume, useDeleteResume, useUploadResumeFile } from '../hooks/useResumes';

function defaultFormState(resume) {
  if (!resume) return { name: '', targetJob: '', targetIndustry: '', fileName: null, fileUrl: null, mimeType: null, sizeBytes: null };
  return {
    name: resume.name, targetJob: resume.targetJob ?? '', targetIndustry: resume.targetIndustry ?? '',
    fileName: resume.fileName ?? null, fileUrl: resume.fileUrl ?? null, mimeType: resume.mimeType ?? null, sizeBytes: resume.sizeBytes ?? null,
  };
}

export function ResumeFormSheet({ visible, onClose, resume }) {
  const [form, setForm] = useState(() => defaultFormState(resume));
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);
  const createResume = useCreateResume();
  const updateResume = useUpdateResume();
  const deleteResume = useDeleteResume();
  const uploadFile = useUploadResumeFile();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (visible) { setForm(defaultFormState(resume)); setSaveError(null); }
  }, [visible, resume]);

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const uploaded = await uploadFile.mutateAsync(formData);
      setForm((f) => ({ ...f, fileName: uploaded.fileName, fileUrl: uploaded.fileUrl, mimeType: uploaded.mimeType, sizeBytes: uploaded.sizeBytes }));
    } catch (error) {
      setSaveError(error?.message || 'Failed to upload file');
    } finally {
      e.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!form.name.trim()) return setSaveError('Resume name is required');
    isSubmittingRef.current = true;
    setSaveError(null);
    try {
      if (resume) await updateResume.mutateAsync({ id: resume._id, ...form });
      else await createResume.mutateAsync(form);
      onClose();
    } catch (error) {
      setSaveError(error?.message || 'Failed to save resume');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={resume ? 'Edit Resume' : 'Add Resume'}>
      {saveError ? <ErrorBanner message={saveError} /> : null}
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Resume name *" aria-label="Resume name" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.targetJob} onChange={(e) => setForm({ ...form, targetJob: e.target.value })} placeholder="Target job" aria-label="Target job" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.targetIndustry} onChange={(e) => setForm({ ...form, targetIndustry: e.target.value })} placeholder="Target industry" aria-label="Target industry" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />

      <label htmlFor="resume-file-input" className="sr-only">Upload resume PDF</label>
      <input id="resume-file-input" ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="sr-only" />
      <button type="button" onClick={handlePickFile} className="mb-3 flex w-full flex-row items-center justify-center rounded-xl border border-dashed border-gray-300 py-4 dark:border-gray-700">
        <span className="text-sm font-semibold text-primary-600">{form.fileName ? `📄 ${form.fileName}` : 'Upload PDF'}</span>
      </button>

      {resume ? (
        <button type="button" onClick={() => deleteResume.mutate(resume._id, { onSuccess: onClose })} className="mt-1 flex w-full items-center justify-center rounded-xl border border-red-200 py-3 dark:border-red-900">
          <span className="text-sm font-semibold text-danger">Delete</span>
        </button>
      ) : null}
    </Modal>
  );
}
