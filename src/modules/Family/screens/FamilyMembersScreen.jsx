import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useActiveHousehold } from '../hooks/useHousehold';
import { useFamilyMembers } from '../hooks/useFamily';
import { MemberCard } from '../components/MemberCard';

const FILTERS = [
  { key: null, label: 'All' },
  { key: 'adult', label: 'Adults' },
  { key: 'child', label: 'Children' },
  { key: 'elder', label: 'Elders' },
  { key: 'pet', label: 'Pets' },
];

export function FamilyMembersScreen() {
  const navigate = useNavigate();
  const { householdId } = useActiveHousehold();
  const [memberType, setMemberType] = useState(null);
  const { data: members, isLoading } = useFamilyMembers(householdId, memberType ? { memberType } : {});

  const handleOpenMember = (member) => navigate(`/family/members/${member._id}`);
  const handleNewMember = () => navigate('/family/members/new');

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Family Members</p>
          <button type="button" onClick={handleNewMember} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>

        <div className="mb-3 flex flex-row gap-2 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              type="button"
              onClick={() => setMemberType(f.key)}
              className={`rounded-full border px-3.5 py-1.5 ${memberType === f.key ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <span className={`text-xs font-medium ${memberType === f.key ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{f.label}</span>
            </button>
          ))}
        </div>

        {!isLoading && (members ?? []).length === 0 ? (
          <EmptyState icon="people-outline" title="No family members yet" description="Add your first family member to get started." ctaLabel="Add member" onCtaPress={handleNewMember} />
        ) : (
          (members ?? []).map((m) => <MemberCard key={m._id} member={m} onPress={handleOpenMember} />)
        )}
      </PageContainer>
    </Screen>
  );
}
