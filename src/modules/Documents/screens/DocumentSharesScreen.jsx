import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useDocumentShares, useCreateDocumentShare, useCreatePublicLink, useRevokeDocumentShare } from '../hooks/useDocumentShares';

const ROLES = ['view', 'comment', 'edit', 'admin'];

function ShareModal({ visible, onClose, documentId }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('view');
  const [error, setError] = useState(null);
  const createShare = useCreateDocumentShare(documentId);

  const handleSubmit = () => {
    setError(null);
    createShare.mutate(
      { sharedWithUserId: email.trim() || undefined, role },
      { onSuccess: () => { onClose(); setEmail(''); }, onError: (e) => setError(e?.message) }
    );
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title="Share Document">
      <ErrorBanner message={error} />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="User ID to share with"
        className="mb-4 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
      <div className="flex flex-row flex-wrap" style={{ gap: 8 }}>
        {ROLES.map((r) => (
          <button key={r} type="button" onClick={() => setRole(r)} className={`rounded-full border px-3.5 py-2 ${role === r ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
            <span className={`text-xs font-medium capitalize ${role === r ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{r}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

export function DocumentSharesScreen() {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const { data: shares, isLoading } = useDocumentShares(documentId);
  const createPublicLink = useCreatePublicLink(documentId);
  const revokeShare = useRevokeDocumentShare(documentId);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleCreatePublicLink = async () => {
    const { token } = await createPublicLink.mutateAsync({ role: 'view' });
    await navigator.clipboard?.writeText(token).catch(() => {});
    window.alert(`Share token copied to clipboard:\n${token}`);
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-2xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Sharing</p>
          <button type="button" onClick={() => setShowShareModal(true)} aria-label="Share with someone">
            <Icon name="person-add-outline" size={22} color="#2563eb" />
          </button>
        </div>

        <button type="button" onClick={handleCreatePublicLink} className="mb-4 flex w-full flex-row items-center rounded-2xl border border-dashed border-gray-300 p-4 dark:border-gray-700">
          <Icon name="link-outline" size={20} color="#2563eb" />
          <span className="ml-3 text-sm font-semibold text-primary-600">Create public link</span>
        </button>

        {!isLoading && (shares ?? []).length === 0 ? (
          <EmptyState icon="share-social-outline" title="Not shared yet" description="Invite people or create a link to share this document." />
        ) : (
          (shares ?? []).map((share) => (
            <div key={share._id} className="mb-2 flex flex-row items-center justify-between rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
              <div className="flex-1">
                <p className="text-sm font-semibold capitalize text-gray-900 dark:text-white">
                  {share.isPublicLink ? 'Public link' : 'Direct share'} · {share.role}
                </p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                  {share.accessCount} access{share.accessCount === 1 ? '' : 'es'}
                </p>
              </div>
              <button type="button" onClick={() => revokeShare.mutate(share._id)} aria-label="Revoke share">
                <Icon name="close-circle-outline" size={20} color="#94a3b8" />
              </button>
            </div>
          ))
        )}
      </PageContainer>

      <ShareModal visible={showShareModal} onClose={() => setShowShareModal(false)} documentId={documentId} />
    </Screen>
  );
}
