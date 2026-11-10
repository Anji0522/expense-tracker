import api from './axios'

export const categoryApi = {
  getAll: async () => {
    const res = await api.get('/categories')
    return res.data
  },

  create: async (categoryData) => {
    const res = await api.post('/categories', categoryData)
    return res.data
  },

  update: async (id, categoryData) => {
    const res = await api.put(`/categories/${id}`, categoryData)
    return res.data
  },

  delete: async (id) => {
    const res = await api.delete(`/categories/${id}`)
    return res.data
  },
}

export default categoryApi
