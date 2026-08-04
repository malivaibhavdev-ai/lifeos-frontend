import { Screen } from '../../../components/ui/Screen';
import { Button } from '../../../components/ui/Button';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useAuth } from '../../Auth/hooks/useAuth';

export function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <Screen>
      <PageContainer maxWidth="max-w-2xl" className="flex flex-1 flex-col">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</p>
        <p className="mt-1 text-base text-gray-500 dark:text-gray-400">{user?.email}</p>

        <div className="mt-8">
          <Button title="Log out" variant="danger" loading={logout.isPending} onPress={() => logout.mutate()} />
        </div>
      </PageContainer>
    </Screen>
  );
}
