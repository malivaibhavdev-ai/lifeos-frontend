import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { useContactList } from '../hooks/useContacts';
import { ContactFormSheet } from '../components/ContactFormSheet';

export function ContactsScreen() {
  const navigate = useNavigate();
  const { data: contacts } = useContactList();
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const items = contacts ?? EMPTY_ARRAY;

  return (
    <Screen>
      <PageContainer maxWidth="max-w-5xl" className="flex flex-1 min-h-0 flex-col">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} className="p-1" aria-label="Go back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Networking</p>
          <button type="button" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600" aria-label="Add contact">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-6 pt-2">
          {items.length === 0 ? (
            <EmptyState icon="people-circle-outline" title="No contacts yet" description="Track mentors, recruiters, and professional connections." ctaLabel="Add Contact" onCtaPress={() => setShowForm(true)} />
          ) : (
            <div className="sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
              {items.map((contact) => (
                <button type="button" key={contact._id} onClick={() => setEditingContact(contact)} className="mb-2 flex w-full flex-col rounded-xl border border-gray-100 bg-white px-4 py-3 text-left dark:border-gray-800 dark:bg-gray-900 sm:mb-0">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{contact.name}</span>
                  <span className="mt-0.5 text-xs capitalize text-gray-400 dark:text-gray-500">
                    {contact.relationship}{contact.company ? ` · ${contact.company}` : ''}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <ContactFormSheet visible={showForm || Boolean(editingContact)} onClose={() => { setShowForm(false); setEditingContact(null); }} contact={editingContact} />
      </PageContainer>
    </Screen>
  );
}
