import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Screen } from '../../../components/ui/Screen';
import { Icon } from '../../../components/ui/Icon';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useDailyNote, useUpdateJournalEntry } from '../hooks/useJournal';
import { useLinksForOwner } from '../hooks/useKnowledgeLinks';
import { LinkPickerSheet } from '../components/LinkPickerSheet';
import { MOOD, MOOD_ORDER } from '../constants/noteConstants';

const AUTOSAVE_DELAY_MS = 900;

function StringListEditor({ label, items, onChange, placeholder }) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const value = draft.trim();
    if (!value) return;
    onChange([...items, value]);
    setDraft('');
  };

  return (
    <div className="mb-5">
      <p className="mb-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">{label}</p>
      {items.map((item, i) => (
        <div key={i} className="mb-1.5 flex flex-row items-center rounded-xl border border-gray-100 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
          <span className="flex-1 text-sm text-gray-800 dark:text-gray-200">{item}</span>
          <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))} aria-label="Remove">
            <Icon name="close-circle" size={18} color="#cbd5e1" />
          </button>
        </div>
      ))}
      <div className="flex flex-row items-center rounded-xl border border-dashed border-gray-300 px-3 py-2 dark:border-gray-700">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') add();
          }}
          placeholder={placeholder}
          aria-label={label}
          className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-300"
        />
        <button type="button" onClick={add} aria-label="Add">
          <Icon name="add-circle" size={20} color="#2563eb" />
        </button>
      </div>
    </div>
  );
}

export function DailyNoteScreen() {
  const navigate = useNavigate();
  const [date, setDate] = useState(() => dayjs().format('YYYY-MM-DD'));
  const { data: entry, isLoading } = useDailyNote(date);
  const updateEntry = useUpdateJournalEntry();
  const [showLinkPicker, setShowLinkPicker] = useState(false);

  const [form, setForm] = useState(null);
  const hydratedRef = useRef(null);
  const saveTimerRef = useRef(null);

  const { data: links } = useLinksForOwner('journalEntry', entry?._id);

  useEffect(() => {
    if (entry && hydratedRef.current !== entry._id) {
      setForm({
        mood: entry.mood ?? null,
        morningPlan: entry.morningPlan ?? '',
        eveningReflection: entry.eveningReflection ?? '',
        gratitude: entry.gratitude ?? [],
        achievements: entry.achievements ?? [],
        mistakes: entry.mistakes ?? [],
        content: entry.content ?? '',
      });
      hydratedRef.current = entry._id;
    }
  }, [entry]);

  useEffect(() => {
    if (!form || !entry) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      updateEntry.mutate({ id: entry._id, payload: form });
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(saveTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const shiftDate = (days) => setDate(dayjs(date).add(days, 'day').format('YYYY-MM-DD'));
  const isToday = date === dayjs().format('YYYY-MM-DD');

  if (isLoading || !form) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" />
        </div>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-5xl">
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" onClick={() => navigate(-1)} aria-label="Back">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <div className="flex flex-row items-center">
          <button type="button" onClick={() => shiftDate(-1)} className="mr-3" aria-label="Previous day">
            <Icon name="chevron-back-circle-outline" size={22} color="#64748b" />
          </button>
          <span className="text-base font-bold text-gray-900 dark:text-white">
            {isToday ? 'Today' : dayjs(date).format('MMM D, YYYY')}
          </span>
          <button type="button" onClick={() => shiftDate(1)} className="ml-3" disabled={isToday} aria-label="Next day">
            <Icon name="chevron-forward-circle-outline" size={22} color={isToday ? '#e5e7eb' : '#64748b'} />
          </button>
        </div>
        <button type="button" onClick={() => setShowLinkPicker(true)} aria-label="Link items">
          <Icon name="link-outline" size={20} color="#2563eb" />
        </button>
      </div>

      <div className="px-4 pb-8 pt-2">
        <div className="mb-5">
          <p className="mb-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">Mood</p>
          <div className="flex flex-row justify-between">
            {MOOD_ORDER.map((key) => {
              const m = MOOD[key];
              const isSelected = form.mood === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => set({ mood: isSelected ? null : key })}
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${isSelected ? 'bg-primary-100 dark:bg-primary-900' : ''}`}
                >
                  <span style={{ fontSize: isSelected ? 26 : 22 }}>{m.emoji}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-5">
          <p className="mb-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">Morning Planning</p>
          <textarea
            value={form.morningPlan}
            onChange={(e) => set({ morningPlan: e.target.value })}
            placeholder="What do you want to get done today?"
            aria-label="Morning Planning"
            className="min-h-[70px] w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:border-gray-800 dark:text-white"
          />
        </div>

        <StringListEditor label="Gratitude" items={form.gratitude} onChange={(gratitude) => set({ gratitude })} placeholder="I'm grateful for…" />
        <StringListEditor label="Wins" items={form.achievements} onChange={(achievements) => set({ achievements })} placeholder="What went well?" />
        <StringListEditor label="Lessons" items={form.mistakes} onChange={(mistakes) => set({ mistakes })} placeholder="What would you do differently?" />

        <div className="mb-5">
          <p className="mb-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">Evening Reflection</p>
          <textarea
            value={form.eveningReflection}
            onChange={(e) => set({ eveningReflection: e.target.value })}
            placeholder="How did today go?"
            aria-label="Evening Reflection"
            className="min-h-[70px] w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:border-gray-800 dark:text-white"
          />
        </div>

        <div className="mb-2">
          <p className="mb-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">Journal</p>
          <textarea
            value={form.content}
            onChange={(e) => set({ content: e.target.value })}
            placeholder="Anything else on your mind…"
            aria-label="Journal"
            className="min-h-[120px] w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2.5 text-base text-gray-900 outline-none placeholder:text-gray-400 dark:border-gray-800 dark:text-white"
          />
        </div>

        {links?.length > 0 ? (
          <div className="mt-3">
            <p className="mb-1.5 text-sm font-bold text-gray-700 dark:text-gray-300">Linked</p>
            {links.map((link) => (
              <div key={link._id} className="mb-1.5 flex flex-row items-center rounded-xl border border-gray-100 bg-white px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900">
                <Icon name="link-outline" size={14} color="#64748b" />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{link.linkedType}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      </div>
      </PageContainer>

      {entry ? (
        <LinkPickerSheet visible={showLinkPicker} ownerType="journalEntry" ownerId={entry._id} onClose={() => setShowLinkPicker(false)} />
      ) : null}
    </Screen>
  );
}
