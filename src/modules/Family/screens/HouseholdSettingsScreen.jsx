import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { Modal } from '../../../components/ui/Modal';
import { PageContainer } from '../../../components/ui/PageContainer';
import {
  useActiveHousehold,
  useHouseholdMembers,
  usePendingInvitations,
  useInviteMember,
  useRevokeInvitation,
  useUpdateMemberRole,
  useRemoveMember,
  useLeaveHousehold,
} from '../hooks/useHousehold';

const ROLES = ['admin', 'member', 'child'];

function InviteModal({ visible, onClose, householdId }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const invite = useInviteMember();

  const handleSubmit = () => {
    if (!email.trim()) return;
    setError(null);
    invite.mutate({ id: householdId, payload: { email: email.trim(), role } }, { onSuccess: (data) => setResult(data), onError: (e) => setError(e?.message ?? 'Could not send invitation') });
  };

  return (
    <Modal visible={visible} onClose={() => { onClose(); setResult(null); setEmail(''); }} title="Invite Family Member">
      <ErrorBanner message={error} />
      {result ? (
        <div className="mb-4 rounded-xl bg-green-50 p-4 dark:bg-green-950">
          <p className="mb-1 text-sm font-semibold text-green-700 dark:text-green-400">Invitation created</p>
          <p className="text-xs text-green-700 dark:text-green-300">Share this token with them (no email delivery is configured):</p>
          <p className="mt-2 select-all font-mono text-xs text-green-800 dark:text-green-200">{result.inviteToken}</p>
        </div>
      ) : (
        <>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            type="email"
            className="mb-4 h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
          />
          <div className="mb-4 flex flex-row" style={{ gap: 8 }}>
            {ROLES.map((r) => (
              <button key={r} type="button" onClick={() => setRole(r)} className={`rounded-full border px-3.5 py-2 ${role === r ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
                <span className={`text-xs font-medium capitalize ${role === r ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{r}</span>
              </button>
            ))}
          </div>
          <button type="button" onClick={handleSubmit} disabled={invite.isPending || !email.trim()} className="h-12 w-full rounded-xl bg-primary-600 text-base font-semibold text-white disabled:opacity-50">
            {invite.isPending ? 'Sending…' : 'Send Invitation'}
          </button>
        </>
      )}
    </Modal>
  );
}

export function HouseholdSettingsScreen() {
  const navigate = useNavigate();
  const { householdId, household } = useActiveHousehold();
  const { data: members } = useHouseholdMembers(householdId);
  const { data: invitations } = usePendingInvitations(householdId);
  const revokeInvitation = useRevokeInvitation();
  const updateMemberRole = useUpdateMemberRole();
  const removeMember = useRemoveMember();
  const leaveHousehold = useLeaveHousehold();
  const [showInvite, setShowInvite] = useState(false);

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="ml-3 text-lg font-bold text-gray-900 dark:text-white">{household?.name ?? 'Household'} Settings</p>
        </div>

        <div className="mb-6 flex flex-row items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Members</p>
          <button type="button" onClick={() => setShowInvite(true)} className="flex flex-row items-center rounded-full bg-primary-600 px-3 py-1.5">
            <Icon name="person-add-outline" size={14} color="#fff" />
            <span className="ml-1.5 text-xs font-semibold text-white">Invite</span>
          </button>
        </div>

        {(members ?? []).map((m) => (
          <div key={m._id} className="mb-2 flex flex-row items-center justify-between rounded-2xl bg-gray-50 p-3 dark:bg-gray-900">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.user?.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{m.user?.email}</p>
            </div>
            <div className="flex flex-row items-center" style={{ gap: 8 }}>
              <div className="flex flex-row" style={{ gap: 4 }}>
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => updateMemberRole.mutate({ id: householdId, memberId: m._id, role: r })}
                    className={`rounded-full border px-2 py-1 ${m.role === r ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
                  >
                    <span className={`text-[10px] capitalize ${m.role === r ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>{r}</span>
                  </button>
                ))}
              </div>
              {m.role !== 'owner' ? (
                <button type="button" onClick={() => removeMember.mutate({ id: householdId, memberId: m._id })} aria-label="Remove member">
                  <Icon name="close-circle-outline" size={18} color="#94a3b8" />
                </button>
              ) : null}
            </div>
          </div>
        ))}

        {(invitations ?? []).length > 0 ? (
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Pending Invitations</p>
            {invitations.map((inv) => (
              <div key={inv._id} className="mb-2 flex flex-row items-center justify-between rounded-2xl bg-gray-50 p-3 dark:bg-gray-900">
                <span className="text-sm text-gray-900 dark:text-white">{inv.email}</span>
                <button type="button" onClick={() => revokeInvitation.mutate({ id: householdId, invitationId: inv._id })} aria-label="Revoke invitation">
                  <Icon name="close-circle-outline" size={18} color="#94a3b8" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => leaveHousehold.mutate(householdId, { onSuccess: () => navigate(-1) })}
          className="mt-8 w-full py-2 text-center text-sm font-medium text-danger"
        >
          Leave Household
        </button>
      </PageContainer>

      <InviteModal visible={showInvite} onClose={() => setShowInvite(false)} householdId={householdId} />
    </Screen>
  );
}
