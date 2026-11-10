import React from 'react'
import useAnalytics from '../hooks/useAnalytics'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/dates'
import { useAuth } from '../context/AuthContext'
import CategoryDonut from '../components/charts/CategoryDonut'
import TrendLine from '../components/charts/TrendLine'
import StatCard from '../components/ui/StatCard'
import { PieChart, TrendingUp, Calendar, Zap } from 'lucide-react'

export const Analytics = () => {
  const { user } = useAuth()
  const {
    summary,
    categorySummary,
    monthlyTrend,
    dailyHeatmap,
    loading,
  } = useAnalytics()

  const highestCategory =
    categorySummary && categorySummary.length > 0 ? categorySummary[0] : null

  // Calculate daily average for this month
  const today = new Date().getDate()
  const dailyAverageThisMonth =
    summary?.thisMonthSpent && today > 0
      ? (summary.thisMonthSpent / today).toFixed(2)
      : 0

  return (
    <div className="analytics-page">
      <div className="page-header-row">
        <div>
          <h2>Analytics & Financial Insights</h2>
          <p className="subtitle">
            Understand where your money goes with visual breakdowns and daily patterns
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Top Expense Category"
          value={highestCategory?.name || 'None yet'}
          subtitle={
            highestCategory
              ? `${formatCurrency(highestCategory.amount, user?.currency)} (${highestCategory.percentage}%)`
              : 'Add expenses to see rank'
          }
          icon={PieChart}
          color="#EC4899"
        />
        <StatCard
          title="Average Spend / Day"
          value={formatCurrency(dailyAverageThisMonth, user?.currency)}
          subtitle="Based on current month days passed"
          icon={Calendar}
          color="#6366F1"
        />
        <StatCard
          title="Total Transactions"
          value={summary?.totalTransactions || 0}
          subtitle={`${summary?.thisMonthTransactions || 0} logged this month`}
          icon={TrendingUp}
          color="#10B981"
        />
        <StatCard
          title="Month-over-Month Shift"
          value={`${summary?.monthChangePercentage || 0}%`}
          subtitle="Compared to previous month"
          icon={Zap}
          color="#F59E0B"
        />
      </div>

      <div className="dashboard-charts-grid">
        <div className="panel chart-panel">
          <div className="panel-header">
            <h3>Spending Distribution</h3>
            <span className="badge">By Category</span>
          </div>
          <div className="panel-body">
            {loading ? <div className="skeleton-chart" /> : <CategoryDonut data={categorySummary} />}
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="panel-header">
            <h3>Monthly Spending Trajectory</h3>
            <span className="badge">Trend Analysis</span>
          </div>
          <div className="panel-body">
            {loading ? <div className="skeleton-chart" /> : <TrendLine data={monthlyTrend} />}
          </div>
        </div>
      </div>

      {/* Daily Activity Heatmap Table */}
      <div className="panel">
        <div className="panel-header">
          <h3>Daily Spending Activity (Last 90 Days)</h3>
          <span className="badge">{dailyHeatmap.length} active spending days</span>
        </div>
        <div className="panel-body">
          {dailyHeatmap.length === 0 ? (
            <p className="empty-state-text">No daily spending records within the last 90 days.</p>
          ) : (
            <div className="heatmap-container">
              <div className="heatmap-grid">
                {dailyHeatmap.map((item) => (
                  <div
                    key={item.date}
                    className="heatmap-cell"
                    title={`${formatDate(item.date)}: ${formatCurrency(item.amount, user?.currency)} (${item.count} items)`}
                    style={{
                      backgroundColor:
                        Number(item.amount) > 5000
                          ? '#4F46E5'
                          : Number(item.amount) > 2000
                          ? '#6366F1'
                          : Number(item.amount) > 500
                          ? '#818CF8'
                          : '#C7D2FE',
                    }}
                  >
                    <span className="cell-date">{new Date(item.date).getDate()}</span>
                  </div>
                ))}
              </div>
              <div className="heatmap-legend">
                <span>Less</span>
                <span className="legend-box" style={{ background: '#C7D2FE' }} />
                <span className="legend-box" style={{ background: '#818CF8' }} />
                <span className="legend-box" style={{ background: '#6366F1' }} />
                <span className="legend-box" style={{ background: '#4F46E5' }} />
                <span>More</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown Details */}
      <div className="panel">
        <div className="panel-header">
          <h3>Category Breakdown Details</h3>
        </div>
        <div className="panel-body table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Transactions</th>
                <th>Total Spent</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {categorySummary.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <div className="category-cell">
                      <span
                        className="category-color-dot"
                        style={{ backgroundColor: cat.color || '#6366F1' }}
                      />
                      <span>{cat.name}</span>
                    </div>
                  </td>
                  <td>{cat.count}</td>
                  <td>
                    <strong>{formatCurrency(cat.amount, user?.currency)}</strong>
                  </td>
                  <td>
                    <div className="percentage-bar-wrap">
                      <div className="percentage-track">
                        <div
                          className="percentage-fill"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color || '#6366F1',
                          }}
                        />
                      </div>
                      <span className="percentage-number">{cat.percentage}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Analytics
