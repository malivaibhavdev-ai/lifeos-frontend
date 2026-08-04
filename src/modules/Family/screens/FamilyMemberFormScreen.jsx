import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { PageContainer } from '../../../components/ui/PageContainer';
import { TagChipInput } from '../components/TagChipInput';
import { useActiveHousehold } from '../hooks/useHousehold';
import { useFamilyMember, useCreateFamilyMember, useUpdateFamilyMember, useDeleteFamilyMember } from '../hooks/useFamily';

const MEMBER_TYPES = ['adult', 'child', 'elder', 'pet', 'guardian', 'other'];

function defaultFormState() {
  return {
    name: '', nickname: '', memberType: 'adult', relationship: '', gender: 'unspecified', dob: '', bloodGroup: '',
    email: '', phone: '', address: '', isEmergencyContact: false,
    medical: { allergies: [], conditions: [], medications: [], insuranceProvider: '', notes: '' },
    personal: { favoriteFood: '', favoriteColor: '', hobbies: [], languages: [], personality: '' },
    tags: [], notes: '',
  };
}

function memberToFormState(member) {
  const base = defaultFormState();
  return { ...base, ...member, medical: { ...base.medical, ...member.medical }, personal: { ...base.personal, ...member.personal } };
}

function Collapsible({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full flex-row items-center justify-between py-2">
        <span className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{title}</span>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#94a3b8" />
      </button>
      {open ? <div className="mt-1">{children}</div> : null}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div className="mb-4">
      <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
    </div>
  );
}

export function FamilyMemberFormScreen() {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const { householdId } = useActiveHousehold();

  const { data: existingMember } = useFamilyMember(householdId, memberId);
  const [form, setForm] = useState(defaultFormState);
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (existingMember) setForm(memberToFormState(existingMember));
  }, [existingMember]);

  const createMember = useCreateFamilyMember(householdId);
  const updateMember = useUpdateFamilyMember(householdId);
  const deleteMember = useDeleteFamilyMember(householdId);
  const isSaving = createMember.isPending || updateMember.isPending;

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    if (saveError) setSaveError(null);
  };

  const handleSubmit = () => {
    if (isSubmittingRef.current || isSaving || !form.name.trim()) return;
    isSubmittingRef.current = true;
    setSaveError(null);
    const handleSuccess = () => { isSubmittingRef.current = false; navigate(-1); };
    const handleError = (error) => { isSubmittingRef.current = false; setSaveError(error?.message ?? 'Could not save this family member.'); };
    if (memberId) {
      updateMember.mutate({ id: memberId, payload: form }, { onSuccess: handleSuccess, onError: handleError });
    } else {
      createMember.mutate(form, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  const handleDelete = () => {
    if (!memberId) return;
    deleteMember.mutate(memberId, { onSuccess: () => navigate(-1) });
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-base font-semibold text-gray-900 dark:text-white">{memberId ? 'Edit Member' : 'New Member'}</p>
          <button type="button" onClick={handleSubmit} disabled={isSaving}>
            <span className="text-base font-semibold text-primary-600">{isSaving ? 'Saving…' : 'Save'}</span>
          </button>
        </div>

        <ErrorBanner message={saveError} />

        <input
          value={form.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="Name *"
          className="mb-4 w-full border-0 bg-transparent text-2xl font-bold text-gray-900 outline-none dark:text-white"
        />

        <div className="mb-4">
          <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Member Type</p>
          <div className="flex flex-row flex-wrap" style={{ gap: 8 }}>
            {MEMBER_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => set({ memberType: type })}
                className={`rounded-full border px-3.5 py-2 ${form.memberType === type ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span className={`text-xs font-medium capitalize ${form.memberType === type ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{type}</span>
              </button>
            ))}
          </div>
        </div>

        <Field label="Nickname" value={form.nickname} onChange={(nickname) => set({ nickname })} placeholder="Optional nickname" />
        <Field label="Relationship" value={form.relationship} onChange={(relationship) => set({ relationship })} placeholder="e.g. father, daughter, friend" />
        <Field label="Date of birth" value={form.dob ? String(form.dob).slice(0, 10) : ''} onChange={(dob) => set({ dob })} placeholder="YYYY-MM-DD" />

        <Collapsible title="Contact & Personal">
          <Field label="Blood group" value={form.bloodGroup} onChange={(bloodGroup) => set({ bloodGroup })} placeholder="e.g. O+" />
          <Field label="Email" value={form.email} onChange={(email) => set({ email })} placeholder="email@example.com" />
          <Field label="Phone" value={form.phone} onChange={(phone) => set({ phone })} placeholder="Phone number" />
          <Field label="Address" value={form.address} onChange={(address) => set({ address })} placeholder="Home address" />
          <Field label="Favorite food" value={form.personal.favoriteFood} onChange={(favoriteFood) => set({ personal: { ...form.personal, favoriteFood } })} />
          <Field label="Favorite color" value={form.personal.favoriteColor} onChange={(favoriteColor) => set({ personal: { ...form.personal, favoriteColor } })} />
          <TagChipInput label="Hobbies" value={form.personal.hobbies} onChange={(hobbies) => set({ personal: { ...form.personal, hobbies } })} />
          <TagChipInput label="Languages" value={form.personal.languages} onChange={(languages) => set({ personal: { ...form.personal, languages } })} />
        </Collapsible>

        <Collapsible title="Medical">
          <TagChipInput label="Allergies" value={form.medical.allergies} onChange={(allergies) => set({ medical: { ...form.medical, allergies } })} />
          <TagChipInput label="Conditions" value={form.medical.conditions} onChange={(conditions) => set({ medical: { ...form.medical, conditions } })} />
          <TagChipInput label="Medications" value={form.medical.medications} onChange={(medications) => set({ medical: { ...form.medical, medications } })} />
          <Field label="Insurance provider" value={form.medical.insuranceProvider} onChange={(insuranceProvider) => set({ medical: { ...form.medical, insuranceProvider } })} />
        </Collapsible>

        <TagChipInput label="Tags" value={form.tags} onChange={(tags) => set({ tags })} />

        <label className="mb-4 flex flex-row items-center justify-between rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
          <span className="text-sm text-gray-700 dark:text-gray-300">Emergency contact</span>
          <input type="checkbox" checked={form.isEmergencyContact} onChange={(e) => set({ isEmergencyContact: e.target.checked })} className="h-5 w-5 accent-primary-600" />
        </label>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving || !form.name.trim()}
          className="h-12 w-full rounded-xl bg-primary-600 text-base font-semibold text-white disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Save Member'}
        </button>

        {memberId ? (
          <button type="button" onClick={handleDelete} disabled={deleteMember.isPending} className="mt-4 w-full py-2 text-center text-sm font-medium text-danger">
            {deleteMember.isPending ? 'Removing…' : 'Remove Member'}
          </button>
        ) : null}
      </PageContainer>
    </Screen>
  );
}
