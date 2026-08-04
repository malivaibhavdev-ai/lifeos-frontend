import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { PageContainer } from '../../../components/ui/PageContainer';
import { TagChipInput } from '../components/TagChipInput';
import { useAutomationRule, useCreateAutomationRule, useUpdateAutomationRule } from '../hooks/useDocumentAutomation';
import { CATEGORIES } from '../constants/documentConstants';

export function AutomationRuleFormScreen() {
  const navigate = useNavigate();
  const { ruleId } = useParams();
  const { data: existingRule } = useAutomationRule(ruleId);
  const createRule = useCreateAutomationRule();
  const updateRule = useUpdateAutomationRule();

  const [name, setName] = useState('');
  const [mimeTypePrefix, setMimeTypePrefix] = useState('');
  const [filenameContains, setFilenameContains] = useState('');
  const [setCategory, setSetCategory] = useState(null);
  const [addTags, setAddTags] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!existingRule) return;
    setName(existingRule.name ?? '');
    setMimeTypePrefix(existingRule.conditions?.mimeTypePrefix ?? '');
    setFilenameContains(existingRule.conditions?.filenameContains ?? '');
    setSetCategory(existingRule.actions?.setCategory ?? null);
    setAddTags(existingRule.actions?.addTags ?? []);
  }, [existingRule]);

  const handleSubmit = () => {
    if (!name.trim()) return setError('Rule name is required');
    const payload = {
      name: name.trim(),
      conditions: {
        ...(mimeTypePrefix.trim() ? { mimeTypePrefix: mimeTypePrefix.trim() } : {}),
        ...(filenameContains.trim() ? { filenameContains: filenameContains.trim() } : {}),
      },
      actions: {
        ...(setCategory ? { setCategory } : {}),
        ...(addTags.length ? { addTags } : {}),
      },
    };

    const mutation = ruleId ? updateRule : createRule;
    const variables = ruleId ? { id: ruleId, payload } : payload;
    mutation.mutate(variables, { onSuccess: () => navigate(-1), onError: (e) => setError(e?.message) });
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-2xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Cancel">
            <Icon name="close" size={26} color="#2563eb" />
          </button>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{ruleId ? 'Edit Rule' : 'New Rule'}</p>
          <button type="button" onClick={handleSubmit}>
            <span className="text-base font-semibold text-primary-600">Save</span>
          </button>
        </div>

        <ErrorBanner message={error} />

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Rule name *"
          className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />

        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">When (conditions)</p>
        <input
          value={mimeTypePrefix}
          onChange={(e) => setMimeTypePrefix(e.target.value)}
          placeholder="File type starts with (e.g. image/)"
          className="mb-3 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />
        <input
          value={filenameContains}
          onChange={(e) => setFilenameContains(e.target.value)}
          placeholder="Filename contains (e.g. invoice)"
          className="mb-5 h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />

        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Then (actions)</p>
        <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">Set category</p>
        <div className="mb-4 flex flex-row flex-wrap" style={{ gap: 8 }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSetCategory(setCategory === c ? null : c)}
              className={`rounded-full border px-3.5 py-2 ${setCategory === c ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <span className={`text-sm font-medium capitalize ${setCategory === c ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{c.replace(/_/g, ' ')}</span>
            </button>
          ))}
        </div>

        <TagChipInput label="Add tags" value={addTags} onChange={setAddTags} />
      </PageContainer>
    </Screen>
  );
}
