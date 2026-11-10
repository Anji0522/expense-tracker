import api from './axios'

export const budgetApi = {
  getAll: async (month) => {
    const res = await api.get('/budgets', { params: { month } })
    return res.data
  },

  setBudget: async (budgetData) => {
    const res = await api.post('/budgets', budgetData)
    return res.data
  },

  delete: async (id) => {
    const res = await api.delete(`/budgets/${id}`)
    return res.data
  },
}

export default budgetApi
