import { useNavigate } from 'react-router-dom';
import { useNetWorthCurrent, useNetWorthTrend } from '../../Finance/hooks/useNetWorth';
import { formatMoney } from '../../Finance/constants/financeConstants';
import { AnimatedNumber } from '../../../components/ui/AnimatedNumber';
import { Icon } from '../../../components/ui/Icon';
import { MiniTrendChart } from './MiniTrendChart';

export function FinanceDashboardWidget() {
  const navigate = useNavigate();
  const { data: netWorth } = useNetWorthCurrent();
  const { data: trend } = useNetWorthTrend();

  if (!netWorth) return null;

  return (
    <button
      type="button"
      onClick={() => navigate('/finance')}
      className="block w-full rounded-2xl bg-white p-4 text-left shadow-sm dark:bg-gray-900"
    >
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center">
          <div className="mr-2.5 h-8 w-8 flex items-center justify-center rounded-full" style={{ backgroundColor: '#22c55e20' }}>
            <Icon name="wallet" size={16} color="#22c55e" />
          </div>
          <p className="text-base font-bold text-gray-900 dark:text-white">Net Worth</p>
        </div>
        <Icon name="chevron-forward" size={18} color="#94a3b8" />
      </div>

      <AnimatedNumber
        value={netWorth.netWorthBase}
        formatter={(n) => formatMoney(n, netWorth.baseCurrency)}
        className="mt-2 block text-2xl font-bold text-gray-900 dark:text-white"
      />

      <MiniTrendChart trend={trend} />

      <div className="mt-3 flex flex-row justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Assets</p>
          <p className="text-sm font-semibold text-success">{formatMoney(netWorth.assetsBase, netWorth.baseCurrency)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Liabilities</p>
          <p className="text-sm font-semibold text-danger">{formatMoney(netWorth.liabilitiesBase, netWorth.baseCurrency)}</p>
        </div>
      </div>
    </button>
  );
}
