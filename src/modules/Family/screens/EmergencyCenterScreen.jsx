import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useActiveHousehold } from '../hooks/useHousehold';
import { useEmergencyCenter, useCreateEmergencyContact, useDeleteEmergencyContact } from '../hooks/useEmergencyContacts';
import { useAddEmergencyChecklistItem, useToggleEmergencyChecklistItem } from '../hooks/useHousehold';

const CONTACT_TYPES = ['doctor', 'hospital', 'police', 'fire', 'ambulance', 'insurance', 'blood_donor', 'other'];

export function EmergencyCenterScreen() {
  const navigate = useNavigate();
  const { householdId } = useActiveHousehold();
  const { data: center, isLoading } = useEmergencyCenter(householdId);
  const createContact = useCreateEmergencyContact(householdId);
  const deleteContact = useDeleteEmergencyContact(householdId);
  const addChecklistItem = useAddEmergencyChecklistItem();
  const toggleChecklistItem = useToggleEmergencyChecklistItem();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('doctor');
  const [phone, setPhone] = useState('');
  const [checklistDraft, setChecklistDraft] = useState('');

  const handleAddContact = () => {
    if (!name.trim()) return;
    createContact.mutate({ name: name.trim(), type, phone }, { onSuccess: () => { setShowForm(false); setName(''); setPhone(''); } });
  };

  const handleAddChecklistItem = () => {
    if (!checklistDraft.trim()) return;
    addChecklistItem.mutate({ id: householdId, label: checklistDraft.trim() }, { onSuccess: () => setChecklistDraft('') });
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Emergency Center</p>
          <button type="button" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>

        {isLoading ? (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
        ) : (
          <>
            {center?.emergencyAddress ? (
              <div className="mb-4 rounded-2xl bg-red-50 p-4 dark:bg-red-950">
                <p className="mb-1 text-xs font-semibold uppercase text-red-700 dark:text-red-400">Emergency Address</p>
                <p className="text-sm text-red-700 dark:text-red-300">{center.emergencyAddress}</p>
              </div>
            ) : null}

            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Emergency Contacts</p>
            {(center?.contacts ?? []).length === 0 ? (
              <EmptyState icon="call-outline" title="No emergency contacts" description="Add doctors, hospitals, or other emergency contacts." />
            ) : (
              (center.contacts ?? []).map((c) => (
                <div key={c._id} className="mb-2 flex flex-row items-center justify-between rounded-2xl bg-gray-50 p-3 dark:bg-gray-900">
                  <div>
                    <p className="text-sm font-semibold capitalize text-gray-900 dark:text-white">{c.name}</p>
                    <p className="text-xs capitalize text-gray-500 dark:text-gray-400">{c.type.replace('_', ' ')} · {c.phone}</p>
                  </div>
                  <button type="button" onClick={() => deleteContact.mutate(c._id)} aria-label="Delete contact">
                    <Icon name="trash-outline" size={18} color="#94a3b8" />
                  </button>
                </div>
              ))
            )}

            {(center?.emergencyContactMembers ?? []).length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Family Emergency Contacts</p>
                {center.emergencyContactMembers.map((m) => (
                  <div key={m._id} className="mb-2 rounded-2xl bg-gray-50 p-3 dark:bg-gray-900">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{m.phone} {m.bloodGroup ? `· ${m.bloodGroup}` : ''}</p>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Preparedness Checklist</p>
              {(center?.emergencyChecklist ?? []).map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => toggleChecklistItem.mutate({ id: householdId, itemId: item._id, isDone: !item.isDone })}
                  className="mb-2 flex w-full flex-row items-center rounded-xl bg-gray-50 px-3 py-2.5 text-left dark:bg-gray-900"
                >
                  <Icon name={item.isDone ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={item.isDone ? '#22c55e' : '#94a3b8'} />
                  <span className={`ml-2 text-sm ${item.isDone ? 'text-gray-400 line-through dark:text-gray-600' : 'text-gray-900 dark:text-white'}`}>{item.label}</span>
                </button>
              ))}
              <div className="mt-1 flex flex-row items-center">
                <input
                  value={checklistDraft}
                  onChange={(e) => setChecklistDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                  placeholder="Add checklist item..."
                  className="mr-2 h-10 flex-1 rounded-xl border border-gray-300 px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
                />
                <button type="button" onClick={handleAddChecklistItem} className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
                  <Icon name="add" size={18} color="#fff" />
                </button>
              </div>
            </div>
          </>
        )}
      </PageContainer>

      <Modal visible={showForm} onClose={() => setShowForm(false)} onDone={handleAddContact} title="Add Emergency Contact">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name *"
          className="mb-4 h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />
        <div className="mb-4 flex flex-row flex-wrap" style={{ gap: 6 }}>
          {CONTACT_TYPES.map((t) => (
            <button key={t} type="button" onClick={() => setType(t)} className={`rounded-full border px-3 py-1.5 ${type === t ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-xs capitalize ${type === t ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{t.replace('_', ' ')}</span>
            </button>
          ))}
        </div>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          className="mb-4 h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />
        <button type="button" onClick={handleAddContact} disabled={createContact.isPending || !name.trim()} className="h-12 w-full rounded-xl bg-primary-600 text-base font-semibold text-white disabled:opacity-50">
          {createContact.isPending ? 'Adding…' : 'Add Contact'}
        </button>
      </Modal>
    </Screen>
  );
}
