import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useActiveHousehold } from '../hooks/useHousehold';
import { useMedicalOverview } from '../hooks/useEmergencyContacts';

export function FamilyMedicalScreen() {
  const navigate = useNavigate();
  const { householdId } = useActiveHousehold();
  const { data: overview, isLoading } = useMedicalOverview(householdId);

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="ml-3 text-lg font-bold text-gray-900 dark:text-white">Medical Records</p>
        </div>

        {isLoading ? (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
        ) : !overview?.members?.length ? (
          <EmptyState icon="medkit-outline" title="No medical records yet" description="Add allergies, conditions, and medications to a family member's profile." />
        ) : (
          overview.members.map((m) => (
            <div key={m.id} className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-2 flex flex-row items-center justify-between">
                <p className="text-base font-semibold text-gray-900 dark:text-white">{m.name}</p>
                {m.bloodGroup ? <span className="text-xs text-gray-400 dark:text-gray-500">{m.bloodGroup}</span> : null}
              </div>
              {m.allergies?.length > 0 ? <p className="mb-1 text-sm text-red-600 dark:text-red-400">Allergies: {m.allergies.join(', ')}</p> : null}
              {m.conditions?.length > 0 ? <p className="mb-1 text-sm text-gray-600 dark:text-gray-300">Conditions: {m.conditions.join(', ')}</p> : null}
              {m.medications?.length > 0 ? <p className="text-sm text-gray-600 dark:text-gray-300">Medications: {m.medications.join(', ')}</p> : null}
              {m.latestGrowth ? (
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Latest growth ({m.latestGrowth.date}): {m.latestGrowth.heightCm}cm / {m.latestGrowth.weightKg}kg
                </p>
              ) : null}
            </div>
          ))
        )}
      </PageContainer>
    </Screen>
  );
}
