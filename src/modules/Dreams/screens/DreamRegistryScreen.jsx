import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Screen } from '../../../components/ui/Screen';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Icon } from '../../../components/ui/Icon';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useDreamRegistryList, useUpdateDreamRegistryItem } from '../hooks/useDreamRegistries';

const KIND_META = {
  symbol: { title: 'Dream Symbols', icon: 'sparkles-outline', empty: 'Symbols you mention in dreams will appear here.' },
  person: { title: 'Dream People', icon: 'people-outline', empty: 'People who recur in your dreams will appear here.' },
  place: { title: 'Dream Places', icon: 'map-outline', empty: 'Places you dream about will appear here.' },
};

function SymbolFields({ draft, setDraft }) {
  return (
    <>
      <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Personal meaning</p>
      <textarea
        value={draft.personalMeaning}
        onChange={(e) => setDraft({ ...draft, personalMeaning: e.target.value })}
        placeholder="What does this symbol mean to you?"
        rows={2}
        className="mb-3 w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
      <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Traditional meaning</p>
      <textarea
        value={draft.traditionalMeaning}
        onChange={(e) => setDraft({ ...draft, traditionalMeaning: e.target.value })}
        placeholder="Common/traditional interpretation"
        rows={2}
        className="mb-3 w-full rounded-xl border border-gray-300 p-2.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
    </>
  );
}

function PersonFields({ draft, setDraft }) {
  return (
    <>
      <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Relationship</p>
      <input
        value={draft.relationship}
        onChange={(e) => setDraft({ ...draft, relationship: e.target.value })}
        placeholder="family, friend, partner, coworker..."
        className="mb-3 h-11 w-full rounded-xl border border-gray-300 px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
      <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Role in dreams</p>
      <input
        value={draft.role}
        onChange={(e) => setDraft({ ...draft, role: e.target.value })}
        placeholder="guide, protector, stranger..."
        className="mb-3 h-11 w-full rounded-xl border border-gray-300 px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
    </>
  );
}

function PlaceFields({ draft, setDraft }) {
  return (
    <>
      <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Kind of place</p>
      <input
        value={draft.kind}
        onChange={(e) => setDraft({ ...draft, kind: e.target.value })}
        placeholder="home, school, fantasy world..."
        className="mb-3 h-11 w-full rounded-xl border border-gray-300 px-3 text-sm text-gray-900 dark:border-gray-700 dark:bg-transparent dark:text-white"
      />
    </>
  );
}

const FIELD_COMPONENTS = { symbol: SymbolFields, person: PersonFields, place: PlaceFields };

function RegistryItem({ kind, item }) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(item);
  const updateItem = useUpdateDreamRegistryItem(kind);
  const FieldsComponent = FIELD_COMPONENTS[kind];

  return (
    <div className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <button type="button" onClick={() => setExpanded((e) => !e)} className="flex w-full flex-row items-center justify-between text-left">
        <div>
          <p className="text-base font-semibold capitalize text-gray-900 dark:text-white">{item.name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Appears in {item.frequencyCount} dream{item.frequencyCount === 1 ? '' : 's'}</p>
        </div>
        <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#94a3b8" />
      </button>

      {expanded ? (
        <div className="mt-3">
          <FieldsComponent item={item} draft={draft} setDraft={setDraft} />
          <button
            type="button"
            onClick={() => updateItem.mutate({ id: item._id, payload: draft })}
            className="mt-1 w-full rounded-xl bg-primary-600 py-2 text-center"
          >
            <span className="text-sm font-semibold text-white">Save</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function DreamRegistryScreen() {
  const navigate = useNavigate();
  const { kind: kindParam } = useParams();
  const kind = kindParam ?? 'symbol';
  const meta = KIND_META[kind] ?? KIND_META.symbol;

  const { data: items, isLoading } = useDreamRegistryList(kind, {});

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="ml-3 text-lg font-bold text-gray-900 dark:text-white">{meta.title}</p>
        </div>

        {!isLoading && (items ?? []).length === 0 ? (
          <EmptyState icon={meta.icon} title={`No ${meta.title.toLowerCase()} yet`} description={meta.empty} />
        ) : (
          (items ?? []).map((item) => <RegistryItem key={item._id} kind={kind} item={item} />)
        )}
      </PageContainer>
    </Screen>
  );
}
