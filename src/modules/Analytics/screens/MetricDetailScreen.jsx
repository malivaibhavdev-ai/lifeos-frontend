import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { useTrend, useForecast } from '../hooks/useTrend';
import { LineChart } from '../components/LineChart';

function StatCard({ label, value, unit }) {
  return (
    <div className="flex-1 rounded-2xl bg-gray-50 py-3 text-center dark:bg-gray-900">
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value ?? '—'}{unit ?? ''}</p>
      <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">{label}</p>
    </div>
  );
}

export function MetricDetailScreen() {
  const navigate = useNavigate();
  const { metricKey } = useParams();
  const location = useLocation();
  const label = location.state?.label;
  const { data: trend, isLoading } = useTrend(metricKey, {});
  const { data: forecast } = useForecast(metricKey, { periodsAhead: 7 });

  return (
    <Screen scroll>
      <PageContainer maxWidth="max-w-2xl">
        <div className="flex flex-row items-center pb-2 pt-1">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <Icon name="chevron-back" size={26} color="#2563eb" />
          </button>
          <p className="ml-3 text-lg font-bold text-gray-900 dark:text-white">{label ?? trend?.label}</p>
        </div>

        {!isLoading && trend ? (
          <>
            <LineChart data={trend.series} showArea />

            <div className="mt-5 flex flex-row" style={{ gap: 8 }}>
              <StatCard label="Growth" value={trend.growthRatePercent} unit="%" />
              <StatCard label="Velocity" value={trend.velocity} />
              <StatCard label="Consistency" value={trend.consistencyScore} />
            </div>

            <p className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">7-Day Moving Average</p>
            <LineChart data={trend.movingAverage} color="#0d9488" showArea={false} />

            {forecast?.forecast?.length > 0 ? (
              <>
                <p className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  Forecast (statistical projection)
                </p>
                <div className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
                  {forecast.forecast.map((f) => (
                    <div key={f.step} className="flex flex-row items-center justify-between border-b border-gray-100 py-2 dark:border-gray-800">
                      <span className="text-sm text-gray-600 dark:text-gray-300">+{f.step} day{f.step === 1 ? '' : 's'}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{f.value} {trend.unit}</span>
                    </div>
                  ))}
                  <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500">
                    Linear regression based on {forecast.basedOnPoints} data points — a statistical projection, not an AI prediction.
                  </p>
                </div>
              </>
            ) : null}
          </>
        ) : null}
      </PageContainer>
    </Screen>
  );
}
