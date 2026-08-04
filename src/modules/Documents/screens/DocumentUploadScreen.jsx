import { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useUploadDocument } from '../hooks/useDocuments';
import { TagChipInput } from '../components/TagChipInput';
import { CATEGORIES, PRIORITIES, CONFIDENTIALITY_LEVELS } from '../constants/documentConstants';

export function DocumentUploadScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const folderId = searchParams.get('folder');
  const uploadDocument = useUploadDocument();
  const fileInputRef = useRef(null);

  const [pickedFile, setPickedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('other');
  const [tags, setTags] = useState([]);
  const [priority, setPriority] = useState('medium');
  const [confidentiality, setConfidentiality] = useState('internal');
  const [documentNumber, setDocumentNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPickedFile(file);
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
  };

  const handleSubmit = async () => {
    if (!pickedFile) return setError('Please choose a file to upload');
    if (!title.trim()) return setError('Title is required');
    setError(null);

    const formData = new FormData();
    formData.append('file', pickedFile);
    formData.append('title', title.trim());
    formData.append('category', category);
    formData.append('priority', priority);
    formData.append('confidentiality', confidentiality);
    if (folderId) formData.append('folder', folderId);
    if (documentNumber.trim()) formData.append('documentNumber', documentNumber.trim());
    if (expiryDate.trim()) formData.append('expiryDate', new Date(expiryDate.trim()).toISOString());
    if (notes.trim()) formData.append('notes', notes.trim());
    tags.forEach((tag) => formData.append('tags[]', tag));

    try {
      const doc = await uploadDocument.mutateAsync(formData);
      navigate(`/documents/${doc._id}`, { replace: true });
    } catch (e) {
      setError(e?.message || 'Upload failed');
    }
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-2xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Cancel">
            <Icon name="close" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Upload Document</p>
          <button type="button" onClick={handleSubmit} disabled={uploadDocument.isPending}>
            <span className="text-base font-semibold text-primary-600">{uploadDocument.isPending ? 'Uploading…' : 'Save'}</span>
          </button>
        </div>

        <ErrorBanner message={error} />

        <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mb-4 flex w-full flex-col items-center rounded-xl border border-dashed border-gray-300 py-6 dark:border-gray-700"
        >
          <Icon name="cloud-upload-outline" size={28} color="#2563eb" />
          <span className="mt-2 text-sm font-semibold text-primary-600">{pickedFile ? pickedFile.name : 'Choose a file'}</span>
        </button>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title *"
          className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />

        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Category</p>
        <div className="mb-4 flex flex-row flex-wrap" style={{ gap: 8 }}>
          {CATEGORIES.map((c) => (
            <button key={c} type="button" onClick={() => setCategory(c)} className={`rounded-full border px-3.5 py-2 ${category === c ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-sm font-medium capitalize ${category === c ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{c.replace(/_/g, ' ')}</span>
            </button>
          ))}
        </div>

        <TagChipInput label="Tags" value={tags} onChange={setTags} />

        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Priority</p>
        <div className="mb-4 flex flex-row" style={{ gap: 8 }}>
          {PRIORITIES.map((p) => (
            <button key={p} type="button" onClick={() => setPriority(p)} className={`flex-1 rounded-xl border py-2 text-center ${priority === p ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-xs font-medium capitalize ${priority === p ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{p}</span>
            </button>
          ))}
        </div>

        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Confidentiality</p>
        <div className="mb-4 flex flex-row flex-wrap" style={{ gap: 8 }}>
          {CONFIDENTIALITY_LEVELS.map((c) => (
            <button key={c} type="button" onClick={() => setConfidentiality(c)} className={`rounded-full border px-3.5 py-2 ${confidentiality === c ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}>
              <span className={`text-xs font-medium capitalize ${confidentiality === c ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{c}</span>
            </button>
          ))}
        </div>

        <input
          value={documentNumber}
          onChange={(e) => setDocumentNumber(e.target.value)}
          placeholder="Document number (optional)"
          className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />
        <input
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          type="date"
          placeholder="Expiry date (optional)"
          className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          rows={3}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />
      </PageContainer>
    </Screen>
  );
}
