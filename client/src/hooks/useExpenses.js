import { useState, useEffect, useCallback } from 'react'
import expenseApi from '../api/expense.api'

export const useExpenses = (initialParams = {}) => {
  const [expenses, setExpenses] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [params, setParams] = useState(initialParams)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await expenseApi.getAll(params)
      setExpenses(res.expenses || [])
      setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch expenses')
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  return {
    expenses,
    pagination,
    loading,
    error,
    params,
    setParams,
    refetch: fetchExpenses,
  }
}

export default useExpenses
