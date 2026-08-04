import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { CERTIFICATION_STATUS } from '../constants/careerConstants';
import { useCreateCertification, useUpdateCertification, useDeleteCertification } from '../hooks/useCertifications';

function defaultFormState(cert) {
  if (!cert) return { name: '', organization: '', issueDate: '', expiryDate: '', credentialId: '', status: 'active' };
  return {
    name: cert.name, organization: cert.organization ?? '', issueDate: cert.issueDate?.slice(0, 10) ?? '',
    expiryDate: cert.expiryDate?.slice(0, 10) ?? '', credentialId: cert.credentialId ?? '', status: cert.status,
  };
}

export function CertificationFormSheet({ visible, onClose, cert }) {
  const [form, setForm] = useState(() => defaultFormState(cert));
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);
  const createCert = useCreateCertification();
  const updateCert = useUpdateCertification();
  const deleteCert = useDeleteCertification();

  useEffect(() => {
    if (visible) { setForm(defaultFormState(cert)); setSaveError(null); }
  }, [visible, cert]);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!form.name.trim()) return setSaveError('Certification name is required');
    isSubmittingRef.current = true;
    setSaveError(null);
    try {
      const payload = { ...form, issueDate: form.issueDate || null, expiryDate: form.expiryDate || null };
      if (cert) await updateCert.mutateAsync({ id: cert._id, ...payload });
      else await createCert.mutateAsync(payload);
      onClose();
    } catch (error) {
      setSaveError(error?.message || 'Failed to save certification');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={cert ? 'Edit Certification' : 'Add Certification'}>
      {saveError ? <ErrorBanner message={saveError} /> : null}
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Certification name *" aria-label="Certification name" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} placeholder="Issuing organization" aria-label="Issuing organization" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.credentialId} onChange={(e) => setForm({ ...form, credentialId: e.target.value })} placeholder="Credential ID" aria-label="Credential ID" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} placeholder="Issue date (YYYY-MM-DD)" aria-label="Issue date (YYYY-MM-DD)" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} placeholder="Expiry date (YYYY-MM-DD)" aria-label="Expiry date (YYYY-MM-DD)" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />

      <div className="mb-3 flex flex-row overflow-x-auto">
        {CERTIFICATION_STATUS.map((status) => {
          const isSelected = form.status === status;
          return (
            <button type="button" key={status} onClick={() => setForm({ ...form, status })} className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-sm font-medium capitalize ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{status.replace('_', ' ')}</span>
            </button>
          );
        })}
      </div>

      {cert ? (
        <button type="button" onClick={() => deleteCert.mutate(cert._id, { onSuccess: onClose })} className="mt-1 flex w-full items-center justify-center rounded-xl border border-red-200 py-3 dark:border-red-900">
          <span className="text-sm font-semibold text-danger">Delete</span>
        </button>
      ) : null}
    </Modal>
  );
}
