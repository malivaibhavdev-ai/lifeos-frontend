import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Screen } from '../../../components/ui/Screen';
import { Icon } from '../../../components/ui/Icon';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useDream, useUpdateDream } from '../hooks/useDreams';

const TAG_GROUP_COLORS = {
  gray: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-300' },
  purple: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-300' },
  blue: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300' },
  amber: { bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-700 dark:text-amber-300' },
};

function TagGroup({ label, items, color = 'gray' }) {
  if (!items || items.length === 0) return null;
  const palette = TAG_GROUP_COLORS[color] ?? TAG_GROUP_COLORS.gray;
  return (
    <div className="mb-4">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</p>
      <div className="flex flex-row flex-wrap" style={{ gap: 6 }}>
        {items.map((item) => (
          <div key={item} className={`rounded-full px-3 py-1.5 ${palette.bg}`}>
            <span className={`text-xs font-medium capitalize ${palette.text}`}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DreamDetailScreen() {
  const navigate = useNavigate();
  const { dreamId } = useParams();
  const { data: dream } = useDream(dreamId);
  const updateDream = useUpdateDream();

  if (!dream) {
    return (
      <Screen>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600" role="status" aria-label="Loading" />
        </div>
      </Screen>
    );
  }

  const toggleFavorite = () => updateDream.mutate({ id: dreamId, payload: { isFavorite: !dream.isFavorite } });

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center justify-between pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <div className="flex flex-row items-center" style={{ gap: 16 }}>
            <button type="button" onClick={toggleFavorite} aria-label="Toggle favorite">
              <Icon name={dream.isFavorite ? 'star' : 'star-outline'} size={22} color="#f59e0b" />
            </button>
            <button type="button" onClick={() => navigate(`/dreams/${dreamId}/edit`)} aria-label="Edit dream">
              <Icon name="create-outline" size={22} color="#64748b" />
            </button>
          </div>
        </div>

        <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
          {dayjs(dream.date).format('dddd, MMMM D, YYYY')}
        </p>
        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{dream.title || 'Untitled dream'}</p>

        <div className="mb-4 mt-3 flex flex-row flex-wrap" style={{ gap: 6 }}>
          {dream.isLucid ? (
            <div className="flex flex-row items-center rounded-full bg-green-100 px-3 py-1.5 dark:bg-green-900">
              <Icon name="flash" size={12} color="#16a34a" />
              <span className="ml-1 text-xs font-semibold text-green-700 dark:text-green-300">Lucid</span>
            </div>
          ) : null}
          {dream.isNightmare ? (
            <div className="flex flex-row items-center rounded-full bg-red-100 px-3 py-1.5 dark:bg-red-900">
              <Icon name="thunderstorm" size={12} color="#dc2626" />
              <span className="ml-1 text-xs font-semibold text-red-700 dark:text-red-300">Nightmare</span>
            </div>
          ) : null}
          {dream.isRecurring ? (
            <div className="flex flex-row items-center rounded-full bg-blue-100 px-3 py-1.5 dark:bg-blue-900">
              <Icon name="repeat" size={12} color="#2563eb" />
              <span className="ml-1 text-xs font-semibold text-blue-700 dark:text-blue-300">Recurring</span>
            </div>
          ) : null}
        </div>

        {dream.description ? <p className="mb-5 whitespace-pre-wrap text-base leading-6 text-gray-700 dark:text-gray-300">{dream.description}</p> : null}

        {dream.emotions?.length > 0 ? (
          <div className="mb-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Emotions</p>
            <div className="flex flex-row flex-wrap" style={{ gap: 6 }}>
              {dream.emotions.map((emotion) => (
                <div key={emotion.name} className="flex flex-row items-center rounded-full bg-primary-50 px-3 py-1.5 dark:bg-primary-950">
                  <span className="text-xs font-medium capitalize text-primary-700 dark:text-primary-300">
                    {emotion.name} · {emotion.intensity}/5
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <TagGroup label="Categories" items={dream.categories} />
        <TagGroup label="Symbols" items={dream.symbols} color="purple" />
        <TagGroup label="People" items={dream.people} color="blue" />
        <TagGroup label="Places" items={dream.places} color="amber" />

        {dream.isLucid && dream.lucid?.techniques?.length > 0 ? (
          <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
            <p className="mb-2 text-sm font-semibold text-green-700 dark:text-green-400">Lucid techniques</p>
            <p className="text-sm text-green-700 dark:text-green-300">{dream.lucid.techniques.join(', ')}</p>
          </div>
        ) : null}

        {dream.isNightmare && dream.nightmare?.resolutionNotes ? (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
            <p className="mb-2 text-sm font-semibold text-red-700 dark:text-red-400">Resolution notes</p>
            <p className="text-sm text-red-700 dark:text-red-300">{dream.nightmare.resolutionNotes}</p>
          </div>
        ) : null}
      </PageContainer>
    </Screen>
  );
}
