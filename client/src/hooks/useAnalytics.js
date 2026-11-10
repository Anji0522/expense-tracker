import { useState, useEffect, useCallback } from 'react'
import analyticsApi from '../api/analytics.api'

export const useAnalytics = () => {
  const [summary, setSummary] = useState(null)
  const [categorySummary, setCategorySummary] = useState([])
  const [monthlyTrend, setMonthlyTrend] = useState([])
  const [dailyHeatmap, setDailyHeatmap] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAnalytics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [sumRes, catRes, trendRes, heatRes] = await Promise.all([
        analyticsApi.getSummary(),
        analyticsApi.getCategorySummary(),
        analyticsApi.getMonthlyTrend(),
        analyticsApi.getDailyHeatmap(),
      ])

      setSummary(sumRes.summary)
      setCategorySummary(catRes.categories || [])
      setMonthlyTrend(trendRes.trend || [])
      setDailyHeatmap(heatRes.heatmap || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  return {
    summary,
    categorySummary,
    monthlyTrend,
    dailyHeatmap,
    loading,
    error,
    refetch: fetchAnalytics,
  }
}

export default useAnalytics
