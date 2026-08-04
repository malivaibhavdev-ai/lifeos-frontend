import { memo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../../components/ui/Icon';
import { Screen } from '../../../components/ui/Screen';
import { PageContainer } from '../../../components/ui/PageContainer';
import { Modal } from '../../../components/ui/Modal';
import { ErrorBanner } from '../../../components/ui/ErrorBanner';
import {
  useDebt,
  useDebtOutstandingBalance,
  useDebtPayoffProjection,
  useDebtPayments,
  useRecordDebtPayment,
} from '../hooks/useDebts';
import { formatMoney } from '../constants/financeConstants';
import { EMPTY_ARRAY } from '../../../utils/emptyArray';

const PaymentRow = memo(function PaymentRow({ payment }) {
  return (
    <div className="mx-4 mb-2 flex flex-row items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
      <span className="text-xs text-gray-400">{new Date(payment.date).toLocaleDateString()}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatMoney(payment.amount, payment.currency)}</span>
    </div>
  );
});

export function DebtDetailScreen() {
  const navigate = useNavigate();
  const { debtId } = useParams();
  const { data: debt } = useDebt(debtId);
  const { data: outstanding } = useDebtOutstandingBalance(debtId);
  const { data: payoff } = useDebtPayoffProjection(debtId, {});
  const { data: payments } = useDebtPayments(debtId);
  const recordPayment = useRecordDebtPayment();

  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [principalPortion, setPrincipalPortion] = useState('');
  const [interestPortion, setInterestPortion] = useState('');
  const [saveError, setSaveError] = useState(null);

  if (!debt) return null;

  const handleSave = () => {
    if (!amount || !principalPortion || !interestPortion) {
      setSaveError('All fields are required');
      return;
    }
    recordPayment.mutate(
      { id: debtId, amount: Number(amount), currency: debt.currency, principalPortion: Number(principalPortion), interestPortion: Number(interestPortion) },
      { onSuccess: () => { setShowForm(false); setAmount(''); setPrincipalPortion(''); setInterestPortion(''); setSaveError(null); }, onError: (e) => setSaveError(e?.message) }
    );
  };

  return (
    <Screen>
      <PageContainer className="flex flex-1 min-h-0 flex-col">
      <div className="flex flex-row items-center justify-between px-4 pb-2 pt-1">
        <button type="button" aria-label="Go back" onClick={() => navigate(-1)} className="p-1">
          <Icon name="chevron-back" size={26} color="#2563eb" />
        </button>
        <p className="text-lg font-bold text-gray-900 dark:text-white">{debt.name}</p>
        <button type="button" aria-label="Record payment" onClick={() => setShowForm(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600">
          <Icon name="add" size={20} color="#fff" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 pt-2">
        <div className="mx-4 mb-4 rounded-2xl bg-primary-600 p-5">
          <p className="text-sm font-medium text-primary-100">Outstanding Balance</p>
          <p className="mt-1 text-3xl font-bold text-white">
            {outstanding ? formatMoney(outstanding.outstandingBalance, debt.currency) : '—'}
          </p>
          <p className="mt-2 text-xs text-primary-100">
            of {formatMoney(debt.principal, debt.currency)} principal · {debt.interestRateAnnualPercent}% APR
          </p>
        </div>

        {payoff && !payoff.willNeverPayOff ? (
          <div className="mx-4 mb-4 rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <p className="text-xs font-semibold uppercase text-gray-400">Payoff Projection</p>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {payoff.monthsToPayoff} months remaining · {formatMoney(payoff.totalInterest, debt.currency)} total interest
            </p>
          </div>
        ) : null}

        <p className="mx-4 mb-2 text-xs font-semibold uppercase text-gray-400">Payment History</p>
        {(payments ?? EMPTY_ARRAY).length === 0 ? (
          <p className="mx-4 text-sm text-gray-400">No payments recorded yet.</p>
        ) : (
          (payments ?? EMPTY_ARRAY).map((p) => <PaymentRow key={p._id} payment={p} />)
        )}
      </div>
      </PageContainer>

      <Modal visible={showForm} onClose={() => setShowForm(false)} onDone={handleSave} title="Record Payment">
        {saveError ? <ErrorBanner message={saveError} /> : null}
        <div className="mb-4">
          <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="Total amount *" inputMode="decimal" className="h-12 w-full rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
        </div>
        <div className="mb-4 flex flex-row">
          <input value={principalPortion} onChange={(e) => setPrincipalPortion(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="Principal portion *" inputMode="decimal" className="mr-2 h-12 flex-1 rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
          <input value={interestPortion} onChange={(e) => setInterestPortion(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="Interest portion *" inputMode="decimal" className="h-12 flex-1 rounded-xl border border-gray-300 px-4 text-base text-gray-900 outline-none dark:border-gray-700 dark:text-white" />
        </div>
      </Modal>
    </Screen>
  );
}
