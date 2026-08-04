import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useActiveHousehold } from '../hooks/useHousehold';
import { useFamilyMember } from '../hooks/useFamily';

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="mb-3 flex flex-row justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

function TagGroup({ label, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-4">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</p>
      <div className="flex flex-row flex-wrap" style={{ gap: 6 }}>
        {items.map((item) => (
          <div key={item} className="rounded-full bg-gray-100 px-3 py-1.5 dark:bg-gray-800">
            <span className="text-xs font-medium capitalize text-gray-600 dark:text-gray-300">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FamilyMemberDetailScreen() {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const { householdId } = useActiveHousehold();
  const { data: member } = useFamilyMember(householdId, memberId);

  if (!member) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
        </div>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <button type="button" onClick={() => navigate(`/family/members/${memberId}/edit`)} aria-label="Edit">
            <Icon name="create-outline" size={22} color="#64748b" />
          </button>
        </div>

        <div className="flex flex-col items-center pb-6">
          <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-950">
            <Icon name="person" size={36} color="#2563eb" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{member.name}</p>
          <p className="text-sm capitalize text-gray-500 dark:text-gray-400">{member.relationship || member.memberType}</p>
        </div>

        <InfoRow label="Date of birth" value={member.dob ? dayjs(member.dob).format('MMM D, YYYY') : null} />
        <InfoRow label="Blood group" value={member.bloodGroup} />
        <InfoRow label="Phone" value={member.phone} />
        <InfoRow label="Email" value={member.email} />
        <InfoRow label="Address" value={member.address} />

        <TagGroup label="Allergies" items={member.medical?.allergies} />
        <TagGroup label="Medical conditions" items={member.medical?.conditions} />
        <TagGroup label="Medications" items={member.medical?.medications} />
        <TagGroup label="Hobbies" items={member.personal?.hobbies} />
        <TagGroup label="Languages" items={member.personal?.languages} />
        <TagGroup label="Tags" items={member.tags} />

        {member.memberType === 'child' && member.growthLog?.length > 0 ? (
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Growth Tracker</p>
            {member.growthLog.map((g, idx) => (
              <div key={idx} className="mb-1.5 flex flex-row justify-between rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-900">
                <span className="text-xs text-gray-500 dark:text-gray-400">{g.date}</span>
                <span className="text-xs text-gray-900 dark:text-white">{g.heightCm ? `${g.heightCm}cm` : ''} {g.weightKg ? `${g.weightKg}kg` : ''}</span>
              </div>
            ))}
          </div>
        ) : null}

        {member.memberType === 'elder' && member.elderCare?.medicineSchedule?.length > 0 ? (
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Medicine Schedule</p>
            {member.elderCare.medicineSchedule.map((m, idx) => (
              <div key={idx} className="mb-1.5 rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-900">
                <p className="text-sm text-gray-900 dark:text-white">{m.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{m.dosage} · {m.times?.join(', ')}</p>
              </div>
            ))}
          </div>
        ) : null}

        {member.notes ? (
          <div className="mb-8">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Notes</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{member.notes}</p>
          </div>
        ) : null}
      </PageContainer>
    </Screen>
  );
}
