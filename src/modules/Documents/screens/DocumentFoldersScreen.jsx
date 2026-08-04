import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useDocumentFolders, useDocumentFolder, useCreateDocumentFolder, useSetFolderPinned } from '../hooks/useDocumentFolders';
import { useDocuments } from '../hooks/useDocuments';
import { FolderCard } from '../components/FolderCard';
import { DocumentCard } from '../components/DocumentCard';

const FOLDER_COLORS = ['blue', 'green', 'amber', 'red', 'violet', 'teal', 'pink', 'gray'];

function FolderFormModal({ visible, onClose, parentId }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('blue');
  const [error, setError] = useState(null);
  const createFolder = useCreateDocumentFolder();

  const handleSubmit = () => {
    if (!name.trim()) return setError('Folder name is required');
    createFolder.mutate(
      { name: name.trim(), color, parent: parentId ?? null },
      { onSuccess: () => { onClose(); setName(''); setError(null); }, onError: (e) => setError(e?.message) }
    );
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title="New Folder">
      <ErrorBanner message={error} />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Folder name *"
        className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
      <div className="flex flex-row flex-wrap" style={{ gap: 8 }}>
        {FOLDER_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            aria-label={c}
            className={`h-8 w-8 rounded-full ${color === c ? 'ring-2 ring-gray-900 dark:ring-white' : ''}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </Modal>
  );
}

export function DocumentFoldersScreen() {
  const navigate = useNavigate();
  const { parentId } = useParams();

  const { data: currentFolder } = useDocumentFolder(parentId);
  const { data: folders, isLoading: loadingFolders } = useDocumentFolders({ parent: parentId ?? null });
  const { data: docsResult, isLoading: loadingDocs } = useDocuments({ folder: parentId ?? '' });
  const setPinned = useSetFolderPinned();
  const [showForm, setShowForm] = useState(false);

  const documents = docsResult?.items ?? [];
  const isLoading = loadingFolders || loadingDocs;
  const isEmpty = (folders ?? []).length === 0 && documents.length === 0;
  const folderName = parentId ? currentFolder?.name ?? '…' : 'Documents';

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="truncate text-lg font-bold text-gray-900 dark:text-white">{folderName}</p>
          <button type="button" onClick={() => setShowForm(true)} aria-label="New folder">
            <Icon name="folder-open-outline" size={24} color="#2563eb" />
          </button>
        </div>

        {!isLoading && isEmpty ? (
          <EmptyState icon="folder-open-outline" title="Empty folder" description="Create a subfolder or upload a document here." ctaLabel="New folder" onCtaPress={() => setShowForm(true)} />
        ) : (
          <>
            {(folders ?? []).map((folder) => (
              <FolderCard
                key={folder._id}
                folder={folder}
                onPress={(f) => navigate(`/documents/folders/${f._id}`)}
                onLongPress={(f) => setPinned.mutate({ id: f._id, value: !f.isPinned })}
              />
            ))}
            {documents.map((doc) => (
              <DocumentCard key={doc._id} document={doc} onPress={(d) => navigate(`/documents/${d._id}`)} />
            ))}
          </>
        )}
      </PageContainer>

      <FolderFormModal visible={showForm} onClose={() => setShowForm(false)} parentId={parentId} />
    </Screen>
  );
}
