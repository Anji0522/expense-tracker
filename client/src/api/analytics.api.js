import api from './axios'

export const analyticsApi = {
  getSummary: async () => {
    const res = await api.get('/analytics/summary')
    return res.data
  },

  getCategorySummary: async (params = {}) => {
    const res = await api.get('/analytics/category-summary', { params })
    return res.data
  },

  getMonthlyTrend: async () => {
    const res = await api.get('/analytics/monthly-trend')
    return res.data
  },

  getDailyHeatmap: async () => {
    const res = await api.get('/analytics/daily-heatmap')
    return res.data
  },

  getMonthlyReport: async (month) => {
    const res = await api.get('/reports/monthly', { params: { month } })
    return res.data
  },

  exportCsvUrl: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    return `${baseUrl}/reports/export.csv${query ? '?' + query : ''}`
  },
}

export default analyticsApi
