// Mirrors the backend's constants/currencies.js list — kept in sync
// manually since mobile can't import backend code, but the values (used
// only for labels/symbols/decimals, never conversion math) rarely change.
export const CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalDigits: 2 },
  { code: 'USD', name: 'US Dollar', symbol: '$', decimalDigits: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', decimalDigits: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', decimalDigits: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalDigits: 0 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimalDigits: 2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimalDigits: 2 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimalDigits: 2 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimalDigits: 2 },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimalDigits: 2 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimalDigits: 2 },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimalDigits: 2 },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimalDigits: 2 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimalDigits: 2 },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimalDigits: 2 },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimalDigits: 2 },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', decimalDigits: 2 },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', decimalDigits: 2 },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', decimalDigits: 2 },
  { code: 'BTC', name: 'Bitcoin', symbol: '₿', decimalDigits: 8 },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', decimalDigits: 8 },
  { code: 'USDT', name: 'Tether', symbol: 'USDT', decimalDigits: 6 },
];
export const CURRENCY_BY_CODE = Object.fromEntries(CURRENCIES.map((c) => [c.code, c]));

export const ACCOUNT_TYPES = {
  bank: { key: 'bank', label: 'Bank', icon: 'business-outline' },
  cash: { key: 'cash', label: 'Cash', icon: 'cash-outline' },
  credit_card: { key: 'credit_card', label: 'Credit Card', icon: 'card-outline' },
  wallet: { key: 'wallet', label: 'Wallet', icon: 'wallet-outline' },
  loan: { key: 'loan', label: 'Loan', icon: 'trending-down-outline' },
  investment: { key: 'investment', label: 'Investment', icon: 'trending-up-outline' },
  other: { key: 'other', label: 'Other', icon: 'ellipsis-horizontal-circle-outline' },
};
export const ACCOUNT_TYPE_ORDER = ['bank', 'cash', 'wallet', 'credit_card', 'loan', 'investment', 'other'];

export const TRANSACTION_TYPES = {
  income: { key: 'income', label: 'Income', color: '#22c55e', icon: 'arrow-down-circle-outline' },
  expense: { key: 'expense', label: 'Expense', color: '#ef4444', icon: 'arrow-up-circle-outline' },
  transfer: { key: 'transfer', label: 'Transfer', color: '#3b82f6', icon: 'swap-horizontal-outline' },
};

export const PERIOD_TYPES = {
  monthly: { key: 'monthly', label: 'Monthly' },
  weekly: { key: 'weekly', label: 'Weekly' },
  custom: { key: 'custom', label: 'Custom' },
};
export const PERIOD_TYPE_ORDER = ['monthly', 'weekly', 'custom'];

export const DEBT_TYPES = {
  loan: { key: 'loan', label: 'Loan' },
  credit_card: { key: 'credit_card', label: 'Credit Card' },
  mortgage: { key: 'mortgage', label: 'Mortgage' },
  personal: { key: 'personal', label: 'Personal' },
  other: { key: 'other', label: 'Other' },
};
export const DEBT_TYPE_ORDER = ['loan', 'credit_card', 'mortgage', 'personal', 'other'];

export const ASSET_CLASSES = {
  stock: { key: 'stock', label: 'Stock' },
  etf: { key: 'etf', label: 'ETF' },
  mutual_fund: { key: 'mutual_fund', label: 'Mutual Fund' },
  bond: { key: 'bond', label: 'Bond' },
  fixed_deposit: { key: 'fixed_deposit', label: 'Fixed Deposit' },
  gold: { key: 'gold', label: 'Gold' },
  silver: { key: 'silver', label: 'Silver' },
  real_estate: { key: 'real_estate', label: 'Real Estate' },
  crypto: { key: 'crypto', label: 'Crypto' },
  epf: { key: 'epf', label: 'EPF' },
  ppf: { key: 'ppf', label: 'PPF' },
  nps: { key: 'nps', label: 'NPS' },
  retirement_account: { key: 'retirement_account', label: 'Retirement Account' },
  rsu_esop: { key: 'rsu_esop', label: 'RSU / ESOP' },
  private_investment: { key: 'private_investment', label: 'Private Investment' },
  cash_equivalent: { key: 'cash_equivalent', label: 'Cash Equivalent' },
  custom: { key: 'custom', label: 'Custom' },
};
export const ASSET_CLASS_ORDER = [
  'stock', 'etf', 'mutual_fund', 'bond', 'fixed_deposit', 'gold', 'silver',
  'real_estate', 'crypto', 'epf', 'ppf', 'nps', 'retirement_account',
  'rsu_esop', 'private_investment', 'cash_equivalent', 'custom',
];

export const INVESTMENT_TXN_TYPES = {
  buy: { key: 'buy', label: 'Buy' },
  sell: { key: 'sell', label: 'Sell' },
  dividend: { key: 'dividend', label: 'Dividend' },
  interest: { key: 'interest', label: 'Interest' },
  split: { key: 'split', label: 'Split' },
  bonus: { key: 'bonus', label: 'Bonus' },
  merger: { key: 'merger', label: 'Merger' },
  fee: { key: 'fee', label: 'Fee' },
};
export const INVESTMENT_TXN_TYPE_ORDER = ['buy', 'sell', 'dividend', 'interest', 'split', 'bonus', 'merger', 'fee'];

export const COST_BASIS_METHODS = ['FIFO', 'LIFO', 'AVERAGE'];

export const FINANCE_COLORS = ['#2563eb', '#22c55e', '#ef4444', '#f97316', '#3b82f6', '#a855f7', '#eab308', '#14b8a6'];

export function formatMoney(amount, currencyCode = 'INR') {
  const meta = CURRENCY_BY_CODE[currencyCode] || { symbol: currencyCode, decimalDigits: 2 };
  const value = Number(amount ?? 0);
  const formatted = value.toLocaleString('en-IN', { minimumFractionDigits: meta.decimalDigits, maximumFractionDigits: meta.decimalDigits });
  return `${meta.symbol}${formatted}`;
}
