import { useNavigate } from 'react-router-dom';
import { Screen } from '../../../components/ui/Screen';
import { Icon } from '../../../components/ui/Icon';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useDreamOverview, useDreamScore, useTopDreamPeople, useTopDreamSymbols } from '../hooks/useDreams';
import { DreamScoreRing } from '../components/DreamScoreRing';

const SUBSCORE_LABELS = {
  recall: 'Recall',
  consistency: 'Consistency',
  dreamLength: 'Dream Length',
  emotionAwareness: 'Emotion Awareness',
  reflection: 'Reflection',
  lucidProgress: 'Lucid Progress',
  nightmareRecovery: 'Nightmare Recovery',
  sleepQuality: 'Sleep Quality',
};

// Same hand-rolled horizontal bar as mobile — no charting library exists in
// this app either (grepped webapp's package.json, confirmed empty).
function Bar({ label, value }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="mb-3">
      <div className="mb-1 flex flex-row items-center justify-between">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{label}</span>
        <span className="text-xs font-semibold text-gray-900 dark:text-white">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        <div className="h-2 rounded-full bg-primary-600" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

function RegistryRow({ name, frequencyCount }) {
  return (
    <div className="flex flex-row items-center justify-between border-b border-gray-100 py-2.5 dark:border-gray-800">
      <span className="text-sm capitalize text-gray-900 dark:text-white">{name}</span>
      <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{frequencyCount}×</span>
    </div>
  );
}

export function DreamAnalyticsScreen() {
  const navigate = useNavigate();
  const { data: score } = useDreamScore();
  const { data: overview } = useDreamOverview({});
  const { data: topSymbols } = useTopDreamSymbols();
  const { data: topPeople } = useTopDreamPeople();

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-3xl">
        <div className="flex flex-row items-center pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="ml-3 text-lg font-bold text-gray-900 dark:text-white">Dream Analytics</p>
        </div>

        <div className="mb-6 flex flex-col items-center rounded-2xl bg-gray-50 py-6 dark:bg-gray-900">
          <DreamScoreRing score={score?.overallScore ?? 0} size={120} strokeWidth={10} />
          {score?.strengths?.length > 0 ? (
            <p className="mt-4 px-6 text-center text-xs text-gray-500 dark:text-gray-400">
              Strongest: {score.strengths.map((k) => SUBSCORE_LABELS[k] ?? k).join(', ')}
            </p>
          ) : null}
        </div>

        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Score Breakdown</p>
        {score ? Object.entries(score.subscores).map(([key, value]) => <Bar key={key} label={SUBSCORE_LABELS[key] ?? key} value={value} />) : null}

        <div className="my-5 flex flex-row items-center justify-between rounded-2xl bg-gray-50 px-4 py-4 dark:bg-gray-900">
          <div className="flex flex-1 flex-col items-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{overview?.lucidPercentage ?? 0}%</p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Lucid</p>
          </div>
          <div className="flex flex-1 flex-col items-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{overview?.nightmarePercentage ?? 0}%</p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Nightmare</p>
          </div>
          <div className="flex flex-1 flex-col items-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{overview?.averageImportance ?? 0}</p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Avg. Importance</p>
          </div>
        </div>

        {overview?.mostCommonEmotions?.length > 0 ? (
          <div className="mb-5">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Most Common Emotions</p>
            {overview.mostCommonEmotions.map((e) => <Bar key={e.key} label={e.key} value={Math.round((e.count / overview.totalEntries) * 100)} />)}
          </div>
        ) : null}

        {topSymbols?.length > 0 ? (
          <div className="mb-5">
            <button type="button" onClick={() => navigate('/dreams/registry/symbol')} className="mb-1 flex w-full flex-row items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Most Common Symbols</span>
              <Icon name="chevron-forward" size={16} color="#94a3b8" />
            </button>
            {topSymbols.map((s) => <RegistryRow key={s._id} name={s.name} frequencyCount={s.frequencyCount} />)}
          </div>
        ) : null}

        {topPeople?.length > 0 ? (
          <div className="mb-5">
            <button type="button" onClick={() => navigate('/dreams/registry/person')} className="mb-1 flex w-full flex-row items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Most Common People</span>
              <Icon name="chevron-forward" size={16} color="#94a3b8" />
            </button>
            {topPeople.map((p) => <RegistryRow key={p._id} name={p.name} frequencyCount={p.frequencyCount} />)}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => navigate('/dreams/registry/place')}
          className="mb-5 flex w-full flex-row items-center justify-between rounded-2xl bg-gray-50 px-4 py-3.5 dark:bg-gray-900"
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dream Places</span>
          <Icon name="chevron-forward" size={16} color="#94a3b8" />
        </button>
      </PageContainer>
    </Screen>
  );
}
