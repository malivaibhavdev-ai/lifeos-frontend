import { apiClient, toApiError, unwrap } from '../../../api/client';

async function call(promise) {
  try {
    return await unwrap(promise);
  } catch (error) {
    throw toApiError(error);
  }
}

export const investmentsApi = {
  // Portfolios
  listPortfolios: (params) => call(apiClient.get('/investments/portfolios', { params })),
  getPortfolio: (id) => call(apiClient.get(`/investments/portfolios/${id}`)),
  createPortfolio: (payload) => call(apiClient.post('/investments/portfolios', payload)),
  updatePortfolio: (id, payload) => call(apiClient.patch(`/investments/portfolios/${id}`, payload)),
  deletePortfolio: (id) => call(apiClient.delete(`/investments/portfolios/${id}`)),

  // Assets
  listAssets: (params) => call(apiClient.get('/investments/assets', { params })),
  getAsset: (id) => call(apiClient.get(`/investments/assets/${id}`)),
  createAsset: (payload) => call(apiClient.post('/investments/assets', payload)),
  updateAsset: (id, payload) => call(apiClient.patch(`/investments/assets/${id}`, payload)),
  deleteAsset: (id) => call(apiClient.delete(`/investments/assets/${id}`)),
  addPriceSnapshot: (id, payload) => call(apiClient.post(`/investments/assets/${id}/prices`, payload)),
  listPriceSnapshots: (id) => call(apiClient.get(`/investments/assets/${id}/prices`)),

  // Transactions
  listTransactions: (params) => call(apiClient.get('/investments/transactions', { params })),
  recordTransaction: (payload) => call(apiClient.post('/investments/transactions', payload)),
  deleteTransaction: (id) => call(apiClient.delete(`/investments/transactions/${id}`)),

  // Holdings / allocation / rebalance
  getHoldings: (portfolioId) => call(apiClient.get(`/investments/holdings/${portfolioId}`)),
  getPortfolioSummary: (portfolioId) => call(apiClient.get(`/investments/portfolios/${portfolioId}/summary`)),
  getAllocations: (params) => call(apiClient.get('/investments/allocations', { params })),
  getRebalance: (portfolioId) => call(apiClient.get(`/investments/portfolios/${portfolioId}/rebalance`)),

  // SIP plans
  listSipPlans: (params) => call(apiClient.get('/investments/sip-plans', { params })),
  createSipPlan: (payload) => call(apiClient.post('/investments/sip-plans', payload)),
  updateSipPlan: (id, payload) => call(apiClient.patch(`/investments/sip-plans/${id}`, payload)),
  deleteSipPlan: (id) => call(apiClient.delete(`/investments/sip-plans/${id}`)),
};
