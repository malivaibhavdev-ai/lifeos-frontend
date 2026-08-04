import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { PageContainer } from '../../../components/ui/PageContainer';
import { resolveFileUrl } from '../utils/fileUrl';
import {
  useDocument, useSetDocumentFavorite, useSetDocumentPinned, useSetDocumentArchived,
  useDeleteDocument, useRecordDocumentDownload, useSetDocumentLock, useVerifyDocumentLock,
} from '../hooks/useDocuments';
import { formatBytes } from '../utils/formatBytes';

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-row items-center justify-between border-b border-gray-100 py-2.5 dark:border-gray-800">
      <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

function ActionButton({ icon, label, onClick, color = '#2563eb', active }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center" style={{ width: 68 }}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${active ? 'bg-primary-600' : 'bg-gray-100 dark:bg-gray-800'}`}>
        <Icon name={icon} size={20} color={active ? '#fff' : color} />
      </div>
      <span className="mt-1 text-center text-[11px] font-medium text-gray-600 dark:text-gray-300">{label}</span>
    </button>
  );
}

function LockModal({ visible, onClose, documentId, isLocked }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const setLock = useSetDocumentLock();

  const handleSubmit = () => {
    if (!isLocked && password.length < 4) return setError('Password must be at least 4 characters');
    setLock.mutate(
      { id: documentId, password: isLocked ? null : password },
      { onSuccess: () => { onClose(); setPassword(''); setError(null); }, onError: (e) => setError(e?.message) }
    );
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title={isLocked ? 'Unlock Document' : 'Lock Document'}>
      <ErrorBanner message={error} />
      {!isLocked ? (
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Set a password"
          type="password"
          className="h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-300">This will remove password protection from this document.</p>
      )}
    </Modal>
  );
}

export function DocumentDetailScreen() {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const { data: document, isLoading } = useDocument(documentId);
  const setFavorite = useSetDocumentFavorite();
  const setPinned = useSetDocumentPinned();
  const setArchived = useSetDocumentArchived();
  const deleteDocument = useDeleteDocument();
  const recordDownload = useRecordDocumentDownload();
  const verifyLock = useVerifyDocumentLock();
  const [showLockModal, setShowLockModal] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState(null);

  if (isLoading || !document) {
    return (
      <Screen scroll>
        <PageContainer maxWidth="max-w-2xl">
          <p className="py-10 text-center text-sm text-gray-400">Loading…</p>
        </PageContainer>
      </Screen>
    );
  }

  const handleDelete = () => {
    if (!window.confirm(`Move "${document.title}" to trash?`)) return;
    deleteDocument.mutate(document._id);
    navigate(-1);
  };

  const handleOpenFile = async () => {
    await recordDownload.mutateAsync(document._id);
    window.open(resolveFileUrl(document.fileUrl), '_blank', 'noopener,noreferrer');
  };

  const handleVerifyUnlock = () => {
    verifyLock.mutate(
      { id: document._id, password: unlockPassword },
      { onSuccess: () => setUnlocked(true), onError: (e) => setUnlockError(e?.message ?? 'Incorrect password') }
    );
  };

  if (document.isLocked && !unlocked) {
    return (
      <Screen scroll>
        <PageContainer maxWidth="max-w-md">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back" className="pb-2 pt-1">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <div className="flex flex-col items-center py-10">
            <Icon name="lock-closed" size={40} color="#94a3b8" />
            <p className="mt-4 text-base font-semibold text-gray-900 dark:text-white">This document is locked</p>
            <ErrorBanner message={unlockError} />
            <input
              value={unlockPassword}
              onChange={(e) => setUnlockPassword(e.target.value)}
              placeholder="Enter password"
              type="password"
              className="mt-4 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
            />
            <button type="button" onClick={handleVerifyUnlock} className="mt-4 h-12 w-full rounded-xl bg-primary-600 text-base font-semibold text-white">
              Unlock
            </button>
          </div>
        </PageContainer>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-2xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <button type="button" onClick={() => navigate(`/documents/${documentId}/edit`)}>
            <span className="text-base font-semibold text-primary-600">Edit</span>
          </button>
        </div>

        <p className="text-xl font-bold text-gray-900 dark:text-white">{document.title}</p>
        {document.description ? <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{document.description}</p> : null}

        <div className="flex flex-row overflow-x-auto py-4">
          <ActionButton icon="heart" label="Favorite" active={document.isFavorite} onClick={() => setFavorite.mutate({ id: document._id, value: !document.isFavorite })} />
          <ActionButton icon="pin" label="Pin" active={document.isPinned} onClick={() => setPinned.mutate({ id: document._id, value: !document.isPinned })} />
          <ActionButton icon="download-outline" label="Download" onClick={handleOpenFile} />
          <ActionButton icon="share-social-outline" label="Share" onClick={() => navigate(`/documents/${documentId}/shares`)} />
          <ActionButton icon="git-branch-outline" label="Versions" onClick={() => navigate(`/documents/${documentId}/versions`)} />
          <ActionButton icon={document.isLocked ? 'lock-open-outline' : 'lock-closed-outline'} label={document.isLocked ? 'Unlock' : 'Lock'} onClick={() => setShowLockModal(true)} />
          <ActionButton icon="archive-outline" label={document.isArchived ? 'Unarchive' : 'Archive'} active={document.isArchived} onClick={() => setArchived.mutate({ id: document._id, value: !document.isArchived })} />
          <ActionButton icon="trash-outline" label="Delete" color="#ef4444" onClick={handleDelete} />
        </div>

        <div className="rounded-2xl bg-gray-50 px-4 dark:bg-gray-900">
          <InfoRow label="Category" value={document.category?.replace(/_/g, ' ')} />
          <InfoRow label="File size" value={formatBytes(document.sizeBytes)} />
          <InfoRow label="Type" value={document.mimeType} />
          <InfoRow label="Version" value={`v${document.currentVersion}`} />
          <InfoRow label="Document number" value={document.documentNumber} />
          <InfoRow label="Issue date" value={document.issueDate?.slice(0, 10)} />
          <InfoRow label="Expiry date" value={document.expiryDate?.slice(0, 10)} />
          <InfoRow label="Renewal date" value={document.renewalDate?.slice(0, 10)} />
          <InfoRow label="Priority" value={document.priority} />
          <InfoRow label="Confidentiality" value={document.confidentiality} />
          <InfoRow label="Views" value={String(document.viewCount)} />
          <InfoRow label="Downloads" value={String(document.downloadCount)} />
        </div>

        {document.tags?.length > 0 ? (
          <div className="mt-4 flex flex-row flex-wrap" style={{ gap: 6 }}>
            {document.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-primary-50 px-3 py-1 dark:bg-primary-950">
                <span className="text-xs font-medium text-primary-600">{tag}</span>
              </span>
            ))}
          </div>
        ) : null}

        {document.ocr?.status === 'completed' && document.ocr.text ? (
          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Extracted Text (OCR)</p>
            <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
              <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{document.ocr.text}</p>
            </div>
          </div>
        ) : null}

        {document.notes ? (
          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Notes</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{document.notes}</p>
          </div>
        ) : null}
      </PageContainer>

      <LockModal visible={showLockModal} onClose={() => setShowLockModal(false)} documentId={document._id} isLocked={document.isLocked} />
    </Screen>
  );
}
