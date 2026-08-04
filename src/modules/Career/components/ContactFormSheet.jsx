import { useEffect, useRef, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { CONTACT_RELATIONSHIP } from '../constants/careerConstants';
import { useCreateContact, useUpdateContact, useDeleteContact } from '../hooks/useContacts';

function defaultFormState(contact) {
  if (!contact) return { name: '', relationship: 'colleague', company: '', email: '', phone: '', followUpDate: '' };
  return {
    name: contact.name, relationship: contact.relationship, company: contact.company ?? '',
    email: contact.email ?? '', phone: contact.phone ?? '', followUpDate: contact.followUpDate?.slice(0, 10) ?? '',
  };
}

export function ContactFormSheet({ visible, onClose, contact }) {
  const [form, setForm] = useState(() => defaultFormState(contact));
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  useEffect(() => {
    if (visible) { setForm(defaultFormState(contact)); setSaveError(null); }
  }, [visible, contact]);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
    if (!form.name.trim()) return setSaveError('Name is required');
    isSubmittingRef.current = true;
    setSaveError(null);
    try {
      const payload = { ...form, followUpDate: form.followUpDate || null };
      if (contact) await updateContact.mutateAsync({ id: contact._id, ...payload });
      else await createContact.mutateAsync(payload);
      onClose();
    } catch (error) {
      setSaveError(error?.message || 'Failed to save contact');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={contact ? 'Edit Contact' : 'Add Contact'}>
      {saveError ? <ErrorBanner message={saveError} /> : null}
      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name *" aria-label="Name" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company" aria-label="Company" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" aria-label="Email" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" aria-label="Phone" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
      <input value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} placeholder="Follow up (YYYY-MM-DD)" aria-label="Follow up (YYYY-MM-DD)" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />

      <div className="mb-3 flex flex-row overflow-x-auto">
        {CONTACT_RELATIONSHIP.map((rel) => {
          const isSelected = form.relationship === rel;
          return (
            <button type="button" key={rel} onClick={() => setForm({ ...form, relationship: rel })} className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-sm font-medium capitalize ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{rel}</span>
            </button>
          );
        })}
      </div>

      {contact ? (
        <button type="button" onClick={() => deleteContact.mutate(contact._id, { onSuccess: onClose })} className="mt-1 flex w-full items-center justify-center rounded-xl border border-red-200 py-3 dark:border-red-900">
          <span className="text-sm font-semibold text-danger">Delete</span>
        </button>
      ) : null}
    </Modal>
  );
}
