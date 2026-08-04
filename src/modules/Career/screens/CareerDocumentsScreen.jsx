import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { PageContainer } from '../../../components/ui/PageContainer';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';
import { useCareerDocumentList, useCreateCareerDocument, useDeleteCareerDocument, useUploadCareerDocumentFile } from '../hooks/useCareerDocuments';
import { CAREER_DOCUMENT_TYPES, CAREER_DOCUMENT_TYPE_ORDER } from '../constants/careerConstants';

export function CareerDocumentsScreen() {
  const navigate = useNavigate();
  const { data: documents } = useCareerDocumentList();
  const createDocument = useCreateCareerDocument();
  const deleteDocument = useDeleteCareerDocument();
  const uploadFile = useUploadCareerDocumentFile();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('other');
  const [file, setFile] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const fileInputRef = useRef(null);

  const items = documents ?? EMPTY_ARRAY;

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    const formData = new FormData();
    formData.append('file', picked);
    try {
      const uploaded = await uploadFile.mutateAsync(formData);
      setFile(uploaded);
    } catch (error) {
      setSaveError(error?.message || 'Failed to upload file');
    } finally {
      e.target.value = '';
    }
  };

  const handleSave = () => {
    if (!title.trim()) return setSaveError('Title is required');
    createDocument.mutate(
      { title: title.trim(), type, ...(file ?? {}) },
      { onSuccess: () => { setShowForm(false); setTitle(''); setType('other'); setFile(null); setSaveError(null); }, onError: (e) => setSaveError(e?.message) }
    );
  };

  return (
    <Screen>
      <PageContainer maxWidth="max-w-5xl" className="flex flex-1 min-h-0 flex-col">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} className="p-1" aria-label="Go back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Documents</p>
          <button type="button" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600" aria-label="Add document">
            <Icon name="add" size={20} color="#fff" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-6 pt-2">
          {items.length === 0 ? (
            <EmptyState icon="folder-outline" title="No documents yet" description="Securely store offer letters, payslips, and certificates." ctaLabel="Add Document" onCtaPress={() => setShowForm(true)} />
          ) : (
            <div className="sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
              {items.map((doc) => (
                <div
                  key={doc._id}
                  onContextMenu={(e) => { e.preventDefault(); deleteDocument.mutate(doc._id); }}
                  className="mb-2 flex w-full flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900 sm:mb-0"
                >
                  <div className="flex flex-row items-center">
                    <Icon name="document-outline" size={18} color="#94a3b8" />
                    <div className="ml-3">
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white">{doc.title}</span>
                      <span className="mt-0.5 block text-xs text-gray-400 dark:text-gray-500">{CAREER_DOCUMENT_TYPES[doc.type]}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteDocument.mutate(doc._id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    aria-label={`Delete ${doc.title}`}
                  >
                    <Icon name="trash-outline" size={16} color="#ef4444" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Modal visible={showForm} onClose={() => setShowForm(false)} onDone={handleSave} title="New Document">
          {saveError ? <ErrorBanner message={saveError} /> : null}
          <label htmlFor="career-document-title" className="sr-only">Title</label>
          <input id="career-document-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title *" className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
          <div className="mb-3 flex flex-row overflow-x-auto">
            {CAREER_DOCUMENT_TYPE_ORDER.map((key) => {
              const isSelected = type === key;
              return (
                <button type="button" key={key} onClick={() => setType(key)} aria-pressed={isSelected} className={`mr-2 whitespace-nowrap rounded-full border px-3.5 py-2 ${isSelected ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{CAREER_DOCUMENT_TYPES[key]}</span>
                </button>
              );
            })}
          </div>
          <label htmlFor="career-document-file" className="sr-only">Attach file</label>
          <input id="career-document-file" ref={fileInputRef} type="file" onChange={handleFileChange} className="sr-only" />
          <button type="button" onClick={handlePickFile} className="flex w-full items-center justify-center rounded-xl border border-dashed border-gray-300 py-4 dark:border-gray-700">
            <span className="text-sm font-semibold text-primary-600">{file ? `📎 ${file.fileName}` : 'Attach File'}</span>
          </button>
        </Modal>
      </PageContainer>
    </Screen>
  );
}
