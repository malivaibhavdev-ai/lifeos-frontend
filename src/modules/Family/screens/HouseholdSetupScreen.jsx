import { useState } from 'react';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useCreateHousehold, useMyHouseholds, useAcceptInvitation, useDeclineInvitation } from '../hooks/useHousehold';
import { useActiveHouseholdStore } from '../store/activeHouseholdStore';

export function HouseholdSetupScreen() {
  const { data: households } = useMyHouseholds();
  const setActiveHouseholdId = useActiveHouseholdStore((s) => s.setActiveHouseholdId);
  const [name, setName] = useState('');
  const [inviteToken, setInviteToken] = useState('');
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('create');

  const createHousehold = useCreateHousehold();
  const acceptInvitation = useAcceptInvitation();
  const declineInvitation = useDeclineInvitation();

  const handleCreate = () => {
    if (!name.trim()) return;
    setError(null);
    createHousehold.mutate({ name: name.trim() }, { onError: (e) => setError(e?.message ?? 'Could not create household') });
  };

  const handleAccept = () => {
    if (!inviteToken.trim()) return;
    setError(null);
    acceptInvitation.mutate(inviteToken.trim(), { onError: (e) => setError(e?.message ?? 'Could not accept invitation') });
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-lg">
        <div className="flex min-h-[70vh] flex-col items-center justify-center py-10">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900">
            <Icon name="home-outline" size={40} color="#2563eb" />
          </div>
          <p className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Welcome to Family</p>
          <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Create a household to start managing your family together, or join one you've been invited to.
          </p>

          <div className="mb-6 flex flex-row rounded-xl bg-gray-100 p-1 dark:bg-gray-900">
            {['create', 'join'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className={`rounded-lg px-5 py-2 ${mode === key ? 'bg-white dark:bg-gray-800' : ''}`}
              >
                <span className={`text-sm font-semibold capitalize ${mode === key ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  {key} household
                </span>
              </button>
            ))}
          </div>

          <ErrorBanner message={error} />

          {mode === 'create' ? (
            <div className="w-full">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Household name (e.g. 'The Smiths')"
                className="mb-4 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
              />
              <button
                type="button"
                onClick={handleCreate}
                disabled={createHousehold.isPending || !name.trim()}
                className="h-12 w-full rounded-xl bg-primary-600 text-base font-semibold text-white disabled:opacity-50"
              >
                {createHousehold.isPending ? 'Creating…' : 'Create Household'}
              </button>
            </div>
          ) : (
            <div className="w-full">
              <input
                value={inviteToken}
                onChange={(e) => setInviteToken(e.target.value)}
                placeholder="Paste your invitation token"
                className="mb-4 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
              />
              <button
                type="button"
                onClick={handleAccept}
                disabled={acceptInvitation.isPending || !inviteToken.trim()}
                className="h-12 w-full rounded-xl bg-primary-600 text-base font-semibold text-white disabled:opacity-50"
              >
                {acceptInvitation.isPending ? 'Accepting…' : 'Accept Invitation'}
              </button>
              <button
                type="button"
                onClick={() => declineInvitation.mutate(inviteToken.trim())}
                disabled={!inviteToken.trim()}
                className="mt-3 w-full py-2 text-sm font-medium text-gray-500 dark:text-gray-400"
              >
                Decline instead
              </button>
            </div>
          )}

          {households?.length > 0 ? (
            <div className="mt-8 w-full">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Your households</p>
              {households.map((h) => (
                <button
                  key={h._id}
                  type="button"
                  onClick={() => setActiveHouseholdId(h._id)}
                  className="mb-2 flex w-full flex-row items-center justify-between rounded-xl border border-gray-200 px-4 py-3 dark:border-gray-700"
                >
                  <span className="text-base text-gray-900 dark:text-white">{h.name}</span>
                  <span className="text-xs capitalize text-gray-400 dark:text-gray-500">{h.myRole}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </PageContainer>
    </Screen>
  );
}
