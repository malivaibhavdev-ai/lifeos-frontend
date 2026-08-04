import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useDocument, useUpdateDocument } from '../hooks/useDocuments';
import { TagChipInput } from '../components/TagChipInput';
import { CATEGORIES, PRIORITIES, CONFIDENTIALITY_LEVELS } from '../constants/documentConstants';

export function DocumentEditScreen() {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const { data: document } = useDocument(documentId);
  const updateDocument = useUpdateDocument();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [tags, setTags] = useState([]);
  const [priority, setPriority] = useState('medium');
  const [confidentiality, setConfidentiality] = useState('internal');
  const [documentNumber, setDocumentNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!document) return;
    setTitle(document.title ?? '');
    setDescription(document.description ?? '');
    setCategory(document.category ?? 'other');
    setTags(document.tags ?? []);
    setPriority(document.priority ?? 'medium');
    setConfidentiality(document.confidentiality ?? 'internal');
    setDocumentNumber(document.documentNumber ?? '');
    setExpiryDate(document.expiryDate ? document.expiryDate.slice(0, 10) : '');
    setNotes(document.notes ?? '');
  }, [document]);

  const handleSubmit = () => {
    if (!title.trim()) return setError('Title is required');
    updateDocument.mutate(
      {
        id: documentId,
        payload: {
          title: title.trim(),
          description: description.trim(),
          category,
          tags,
          priority,
          confidentiality,
          documentNumber: documentNumber.trim() || null,
          expiryDate: expiryDate.trim() ? new Date(expiryDate.trim()).toISOString() : null,
          notes: notes.trim(),
        },
      },
      { onSuccess: () => navigate(-1), onError: (e) => setError(e?.message) }
    );
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-2xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Cancel">
            <Icon name="close" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Edit Document</p>
          <button type="button" onClick={handleSubmit} disabled={updateDocument.isPending}>
            <span className="text-base font-semibold text-primary-600">Save</span>
          </button>
        </div>

        <ErrorBanner message={error} />

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title *"
          className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
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
          placeholder="Document number"
          className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />
        <input
          value={expiryDate}
          onChange={(e) => setExpiryDate(e.target.value)}
          type="date"
          className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          rows={3}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />
      </PageContainer>
    </Screen>
  );
}
