import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Screen } from '../../../components/ui/Screen';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import { Icon } from '../../../components/ui/Icon';
import { PageContainer } from '../../../components/ui/PageContainer';
import { TagChipInput } from '../components/TagChipInput';
import { EmotionPicker } from '../components/EmotionPicker';
import { useDream, useCreateDream, useDeleteDream, useUpdateDream } from '../hooks/useDreams';

const SLEEP_QUALITY_OPTIONS = ['poor', 'fair', 'good', 'excellent'];

function defaultFormState() {
  return {
    date: dayjs().format('YYYY-MM-DD'),
    title: '',
    description: '',
    sleepQuality: null,
    location: '',
    categories: [],
    symbols: [],
    people: [],
    places: [],
    animals: [],
    objects: [],
    colors: [],
    sounds: [],
    smells: [],
    tastes: [],
    sensations: [],
    tags: [],
    emotions: [],
    isLucid: false,
    isNightmare: false,
    isRecurring: false,
    hasFalseAwakening: false,
    hasSleepParalysis: false,
    lucid: { awarenessLevel: 3, controlLevel: 3, techniques: [], stability: 3, durationMinutes: null },
    nightmare: { intensity: 3, triggers: [], recoveryTimeMinutes: null, resolutionNotes: '' },
    importance: 3,
    isFavorite: false,
    isPinned: false,
    isLocked: false,
  };
}

function dreamToFormState(dream) {
  return { ...defaultFormState(), ...dream, lucid: { ...defaultFormState().lucid, ...dream.lucid }, nightmare: { ...defaultFormState().nightmare, ...dream.nightmare } };
}

function SectionHeader({ label }) {
  return <p className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>;
}

function Collapsible({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full flex-row items-center justify-between py-2">
        <span className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{title}</span>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#94a3b8" />
      </button>
      {open ? <div className="mt-1">{children}</div> : null}
    </div>
  );
}

function FlagRow({ label, value, onChange }) {
  return (
    <label className="mb-3 flex flex-row items-center justify-between">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-primary-600" />
    </label>
  );
}

export function DreamEntryFormScreen() {
  const navigate = useNavigate();
  const { dreamId } = useParams();

  const { data: existingDream } = useDream(dreamId);
  const [form, setForm] = useState(defaultFormState);
  const [saveError, setSaveError] = useState(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (existingDream) setForm(dreamToFormState(existingDream));
  }, [existingDream]);

  const createDream = useCreateDream();
  const updateDream = useUpdateDream();
  const deleteDream = useDeleteDream();
  const isSaving = createDream.isPending || updateDream.isPending;

  const set = (patch) => {
    setForm((f) => ({ ...f, ...patch }));
    if (saveError) setSaveError(null);
  };

  const handleSubmit = () => {
    if (isSubmittingRef.current || isSaving) return;
    isSubmittingRef.current = true;
    setSaveError(null);

    const handleSuccess = () => {
      isSubmittingRef.current = false;
      navigate(-1);
    };
    const handleError = (error) => {
      isSubmittingRef.current = false;
      setSaveError(error?.message ?? 'Could not save this dream. Please try again.');
    };

    if (dreamId) {
      updateDream.mutate({ id: dreamId, payload: form }, { onSuccess: handleSuccess, onError: handleError });
    } else {
      createDream.mutate(form, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  const handleDelete = () => {
    if (!dreamId) return;
    deleteDream.mutate(dreamId, { onSuccess: () => navigate('/dreams') });
  };

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="text-base font-semibold text-gray-900 dark:text-white">{dreamId ? 'Edit Dream' : 'New Dream'}</p>
          <button type="button" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" role="status" aria-label="Saving" />
            ) : (
              <span className="text-base font-semibold text-primary-600">Save</span>
            )}
          </button>
        </div>

        <ErrorBanner message={saveError} />

        <input
          value={form.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Dream title"
          className="mb-4 w-full border-0 bg-transparent text-2xl font-bold text-gray-900 outline-none dark:text-white"
        />

        <textarea
          value={form.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="What happened in the dream?"
          rows={5}
          className="mb-4 w-full rounded-xl border border-gray-300 p-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
        />

        <div className="mb-4 flex flex-row" style={{ gap: 12 }}>
          <div className="flex-1">
            <SectionHeader label="Date" />
            <input
              value={form.date}
              onChange={(e) => set({ date: e.target.value })}
              placeholder="YYYY-MM-DD"
              className="h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
            />
          </div>
        </div>

        <div className="mb-4">
          <SectionHeader label="Sleep quality" />
          <div className="flex flex-row" style={{ gap: 8 }}>
            {SLEEP_QUALITY_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => set({ sleepQuality: form.sleepQuality === option ? null : option })}
                className={`rounded-full border px-3.5 py-2 ${form.sleepQuality === option ? 'border-primary-600 bg-primary-600' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span className={`text-xs font-medium capitalize ${form.sleepQuality === option ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                  {option}
                </span>
              </button>
            ))}
          </div>
        </div>

        <TagChipInput label="Categories" value={form.categories} onChange={(categories) => set({ categories })} placeholder="flying, adventure, stress-related..." />
        <TagChipInput label="Symbols" value={form.symbols} onChange={(symbols) => set({ symbols })} placeholder="ocean, snake, door..." />
        <TagChipInput label="People" value={form.people} onChange={(people) => set({ people })} placeholder="Mom, a stranger..." />
        <TagChipInput label="Places" value={form.places} onChange={(places) => set({ places })} placeholder="childhood home, a temple..." />

        <EmotionPicker value={form.emotions} onChange={(emotions) => set({ emotions })} />

        <Collapsible title="More details">
          <TagChipInput label="Animals" value={form.animals} onChange={(animals) => set({ animals })} />
          <TagChipInput label="Objects" value={form.objects} onChange={(objects) => set({ objects })} />
          <TagChipInput label="Colors" value={form.colors} onChange={(colors) => set({ colors })} />
          <TagChipInput label="Sounds" value={form.sounds} onChange={(sounds) => set({ sounds })} />
          <TagChipInput label="Smells" value={form.smells} onChange={(smells) => set({ smells })} />
          <TagChipInput label="Tastes" value={form.tastes} onChange={(tastes) => set({ tastes })} />
          <TagChipInput label="Physical sensations" value={form.sensations} onChange={(sensations) => set({ sensations })} />
          <TagChipInput label="Tags" value={form.tags} onChange={(tags) => set({ tags })} />
          <div>
            <SectionHeader label="Location" />
            <input
              value={form.location}
              onChange={(e) => set({ location: e.target.value })}
              placeholder="Where you slept, if relevant"
              className="mb-4 h-11 w-full rounded-xl border border-gray-300 px-3 text-base text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
            />
          </div>
        </Collapsible>

        <div className="mb-2 rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
          <FlagRow label="Lucid dream" value={form.isLucid} onChange={(isLucid) => set({ isLucid })} />
          <FlagRow label="Nightmare" value={form.isNightmare} onChange={(isNightmare) => set({ isNightmare })} />
          <FlagRow label="Recurring dream" value={form.isRecurring} onChange={(isRecurring) => set({ isRecurring })} />
          <FlagRow label="False awakening" value={form.hasFalseAwakening} onChange={(hasFalseAwakening) => set({ hasFalseAwakening })} />
          <FlagRow label="Sleep paralysis" value={form.hasSleepParalysis} onChange={(hasSleepParalysis) => set({ hasSleepParalysis })} />
        </div>

        {form.isLucid ? (
          <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
            <p className="mb-3 text-sm font-semibold text-green-700 dark:text-green-400">Lucid dream details</p>
            <TagChipInput
              label="Techniques used"
              value={form.lucid.techniques}
              onChange={(techniques) => set({ lucid: { ...form.lucid, techniques } })}
              placeholder="reality check, WBTB..."
            />
          </div>
        ) : null}

        {form.isNightmare ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
            <p className="mb-3 text-sm font-semibold text-red-700 dark:text-red-400">Nightmare details</p>
            <TagChipInput
              label="Triggers"
              value={form.nightmare.triggers}
              onChange={(triggers) => set({ nightmare: { ...form.nightmare, triggers } })}
              placeholder="stress, a specific fear..."
            />
            <textarea
              value={form.nightmare.resolutionNotes}
              onChange={(e) => set({ nightmare: { ...form.nightmare, resolutionNotes: e.target.value } })}
              placeholder="How did you recover / resolve it?"
              rows={3}
              className="w-full rounded-xl border border-red-200 bg-white p-3 text-sm text-gray-900 dark:border-red-900 dark:bg-gray-900 dark:text-white"
            />
          </div>
        ) : null}

        <div className="mb-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
          <SectionHeader label="Importance" />
          <div className="mb-3 flex flex-row" style={{ gap: 6 }}>
            {[1, 2, 3, 4, 5].map((level) => (
              <button key={level} type="button" onClick={() => set({ importance: level })} aria-label={`Set importance to ${level}`}>
                <Icon name={level <= form.importance ? 'star' : 'star-outline'} size={22} color={level <= form.importance ? '#f59e0b' : '#cbd5e1'} />
              </button>
            ))}
          </div>
          <FlagRow label="Favorite" value={form.isFavorite} onChange={(isFavorite) => set({ isFavorite })} />
          <FlagRow label="Pinned" value={form.isPinned} onChange={(isPinned) => set({ isPinned })} />
          <FlagRow label="Locked (require re-auth to view)" value={form.isLocked} onChange={(isLocked) => set({ isLocked })} />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className={`h-12 w-full items-center justify-center rounded-xl bg-primary-600 ${isSaving ? 'opacity-50' : ''}`}
        >
          <span className="text-base font-semibold text-white">{isSaving ? 'Saving…' : 'Save Dream'}</span>
        </button>

        {dreamId ? (
          <button type="button" onClick={handleDelete} disabled={deleteDream.isPending} className="mt-4 w-full py-2 text-center">
            <span className="text-sm font-medium text-danger">{deleteDream.isPending ? 'Deleting…' : 'Delete Dream'}</span>
          </button>
        ) : null}
      </PageContainer>
    </Screen>
  );
}
