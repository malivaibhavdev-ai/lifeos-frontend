import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { Modal } from '../../../components/ui/Modal';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useActiveHousehold } from '../hooks/useHousehold';
import { useFamilyDocuments, useUploadFamilyDocument, useDeleteFamilyDocument } from '../hooks/useFamilyDocuments';

const CATEGORIES = [
  'birth_certificate', 'passport', 'insurance', 'medical_report', 'school_record',
  'marriage_certificate', 'property_document', 'tax_document', 'identity_card', 'driving_license', 'other',
];

const CATEGORY_ICON = {
  passport: 'airplane-outline',
  insurance: 'shield-checkmark-outline',
  medical_report: 'medkit-outline',
  identity_card: 'card-outline',
  driving_license: 'car-outline',
};

function UploadModal({ visible, onClose, householdId }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('other');
  const [pickedFile, setPickedFile] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const upload = useUploadFamilyDocument(householdId);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setPickedFile(file);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !pickedFile) {
      setError('Please provide a title and choose a file');
      return;
    }
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('category', category);
    formData.append('file', pickedFile);
    try {
      await upload.mutateAsync(formData);
      onClose();
      setTitle('');
      setPickedFile(null);
    } catch (e) {
      setError(e?.message ?? 'Upload failed');
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} onDone={handleSubmit} title="Upload Document">
      <ErrorBanner message={error} />
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Document title *"
        className="mb-4 h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
      <div className="mb-4 flex flex-row flex-wrap" style={{ gap: 6 }}>
        {CATEGORIES.map((c) => (
          <button key={c} type="button" onClick={() => setCategory(c)} className={`rounded-full border px-3 py-1.5 ${category === c ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
            <span className={`text-xs capitalize ${category === c ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{c.replace(/_/g, ' ')}</span>
          </button>
        ))}
      </div>
      <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="mb-4 flex h-11 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700"
      >
        <span className="text-sm text-gray-600 dark:text-gray-300">{pickedFile ? pickedFile.name : 'Choose a file'}</span>
      </button>
      <button type="button" onClick={handleSubmit} disabled={upload.isPending} className="h-12 w-full rounded-xl bg-primary-600 text-base font-semibold text-white disabled:opacity-50">
        {upload.isPending ? 'Uploading…' : 'Upload'}
      </button>
    </Modal>
  );
}

export function FamilyDocumentsScreen() {
  const navigate = useNavigate();
  const { householdId } = useActiveHousehold();
  const { data: documents, isLoading } = useFamilyDocuments(householdId, {});
  const deleteDocument = useDeleteFamilyDocument(householdId);
  const [showUpload, setShowUpload] = useState(false);

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Document Vault</p>
          <button type="button" onClick={() => setShowUpload(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>

        {!isLoading && (documents ?? []).length === 0 ? (
          <EmptyState icon="folder-outline" title="No documents yet" description="Store birth certificates, passports, insurance, and more." ctaLabel="Upload document" onCtaPress={() => setShowUpload(true)} />
        ) : (
          (documents ?? []).map((d) => (
            <div key={d._id} className="mb-3 flex flex-row items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-1 flex-row items-center">
                <Icon name={CATEGORY_ICON[d.category] ?? 'document-outline'} size={22} color="#2563eb" />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{d.title}</p>
                  <p className="text-xs capitalize text-gray-500 dark:text-gray-400">{d.category.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <button type="button" onClick={() => deleteDocument.mutate(d._id)} aria-label="Delete document">
                <Icon name="trash-outline" size={18} color="#94a3b8" />
              </button>
            </div>
          ))
        )}
      </PageContainer>

      <UploadModal visible={showUpload} onClose={() => setShowUpload(false)} householdId={householdId} />
    </Screen>
  );
}
