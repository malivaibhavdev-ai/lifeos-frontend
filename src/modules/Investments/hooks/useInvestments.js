import { useQuery, useQueryClient } from '@tanstack/react-query';
import { investmentsApi } from '../api/investments.api';
import { useOfflineMutation } from '../../../services/offlineSync';

export const investmentKeys = {
  all: ['investments'],
  portfolios: (params) => ['investments', 'portfolios', params],
  portfolio: (id) => ['investments', 'portfolios', id],
  assets: (params) => ['investments', 'assets', params],
  asset: (id) => ['investments', 'assets', id],
  prices: (id) => ['investments', 'assets', id, 'prices'],
  transactions: (params) => ['investments', 'transactions', params],
  holdings: (portfolioId) => ['investments', 'holdings', portfolioId],
  summary: (portfolioId) => ['investments', 'summary', portfolioId],
  allocations: (params) => ['investments', 'allocations', params],
  rebalance: (portfolioId) => ['investments', 'rebalance', portfolioId],
  sipPlans: (params) => ['investments', 'sipPlans', params],
};

function invalidateInvestments(queryClient) {
  queryClient.invalidateQueries({ queryKey: investmentKeys.all });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['calendarEngine'] });
  queryClient.invalidateQueries({ queryKey: ['netWorth'] });
}

// Portfolios
export function usePortfolioList(params) {
  return useQuery({ queryKey: investmentKeys.portfolios(params), queryFn: () => investmentsApi.listPortfolios(params) });
}
export function usePortfolio(id) {
  return useQuery({ queryKey: investmentKeys.portfolio(id), queryFn: () => investmentsApi.getPortfolio(id), enabled: Boolean(id) });
}
export function useCreatePortfolio() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'investmentPortfolio', opType: 'create', method: 'POST', buildUrl: () => '/investments/portfolios',
    apiCall: (payload) => investmentsApi.createPortfolio(payload), onSuccess: () => invalidateInvestments(queryClient),
  });
}
export function useUpdatePortfolio() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'investmentPortfolio', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/investments/portfolios/${id}`,
    apiCall: ({ id, ...payload }) => investmentsApi.updatePortfolio(id, payload), onSuccess: () => invalidateInvestments(queryClient),
  });
}
export function useDeletePortfolio() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'investmentPortfolio', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/investments/portfolios/${id}`,
    apiCall: (id) => investmentsApi.deletePortfolio(id), onSuccess: () => invalidateInvestments(queryClient),
  });
}

// Assets
export function useAssetList(params) {
  return useQuery({ queryKey: investmentKeys.assets(params), queryFn: () => investmentsApi.listAssets(params) });
}
export function useAsset(id) {
  return useQuery({ queryKey: investmentKeys.asset(id), queryFn: () => investmentsApi.getAsset(id), enabled: Boolean(id) });
}
export function useAssetPrices(id) {
  return useQuery({ queryKey: investmentKeys.prices(id), queryFn: () => investmentsApi.listPriceSnapshots(id), enabled: Boolean(id) });
}
export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'investmentAsset', opType: 'create', method: 'POST', buildUrl: () => '/investments/assets',
    apiCall: (payload) => investmentsApi.createAsset(payload), onSuccess: () => invalidateInvestments(queryClient),
  });
}
export function useUpdateAsset() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'investmentAsset', opType: 'update', method: 'PATCH', buildUrl: ({ id }) => `/investments/assets/${id}`,
    apiCall: ({ id, ...payload }) => investmentsApi.updateAsset(id, payload), onSuccess: () => invalidateInvestments(queryClient),
  });
}
export function useAddPriceSnapshot() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'priceSnapshot', opType: 'create', method: 'POST', buildUrl: ({ id }) => `/investments/assets/${id}/prices`,
    apiCall: ({ id, ...payload }) => investmentsApi.addPriceSnapshot(id, payload), onSuccess: () => invalidateInvestments(queryClient),
  });
}

// Transactions
export function useInvestmentTransactionList(params) {
  return useQuery({ queryKey: investmentKeys.transactions(params), queryFn: () => investmentsApi.listTransactions(params) });
}
export function useRecordInvestmentTransaction() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'investmentTransaction', opType: 'create', method: 'POST', buildUrl: () => '/investments/transactions',
    apiCall: (payload) => investmentsApi.recordTransaction(payload), onSuccess: () => invalidateInvestments(queryClient),
  });
}
export function useDeleteInvestmentTransaction() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'investmentTransaction', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/investments/transactions/${id}`,
    apiCall: (id) => investmentsApi.deleteTransaction(id), onSuccess: () => invalidateInvestments(queryClient),
  });
}

// Holdings / allocation / rebalance
export function useHoldings(portfolioId) {
  return useQuery({ queryKey: investmentKeys.holdings(portfolioId), queryFn: () => investmentsApi.getHoldings(portfolioId), enabled: Boolean(portfolioId) });
}
export function usePortfolioSummary(portfolioId) {
  return useQuery({ queryKey: investmentKeys.summary(portfolioId), queryFn: () => investmentsApi.getPortfolioSummary(portfolioId), enabled: Boolean(portfolioId) });
}
export function useAllocations(params) {
  return useQuery({ queryKey: investmentKeys.allocations(params), queryFn: () => investmentsApi.getAllocations(params) });
}
export function useRebalance(portfolioId) {
  return useQuery({ queryKey: investmentKeys.rebalance(portfolioId), queryFn: () => investmentsApi.getRebalance(portfolioId), enabled: Boolean(portfolioId) });
}

// SIP plans
export function useSipPlanList(params) {
  return useQuery({ queryKey: investmentKeys.sipPlans(params), queryFn: () => investmentsApi.listSipPlans(params) });
}
export function useCreateSipPlan() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'sipPlan', opType: 'create', method: 'POST', buildUrl: () => '/investments/sip-plans',
    apiCall: (payload) => investmentsApi.createSipPlan(payload), onSuccess: () => invalidateInvestments(queryClient),
  });
}
export function useDeleteSipPlan() {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    entityType: 'sipPlan', opType: 'delete', method: 'DELETE', buildUrl: (id) => `/investments/sip-plans/${id}`,
    apiCall: (id) => investmentsApi.deleteSipPlan(id), onSuccess: () => invalidateInvestments(queryClient),
  });
}
