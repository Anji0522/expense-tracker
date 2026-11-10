import api from './axios'

export const authApi = {
  register: async (userData) => {
    const res = await api.post('/auth/register', userData)
    return res.data
  },

  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials)
    return res.data
  },

  getMe: async () => {
    const res = await api.get('/auth/me')
    return res.data
  },

  updateCurrency: async (currency) => {
    const res = await api.patch('/auth/currency', { currency })
    return res.data
  },
}

export default authApi
