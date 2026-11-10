import React, { useState, useEffect } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  CreditCard,
  Calendar,
  TrendingDown,
  TrendingUp,
  Target,
  ArrowRight,
  Plus,
} from 'lucide-react'
import useAnalytics from '../hooks/useAnalytics'
import expenseApi from '../api/expense.api'
import { formatCurrency } from '../utils/formatCurrency'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/ui/StatCard'
import CategoryDonut from '../components/charts/CategoryDonut'
import TrendLine from '../components/charts/TrendLine'
import ExpenseRow from '../components/expenses/ExpenseRow'
import Button from '../components/ui/Button'

export const Dashboard = () => {
  const { user } = useAuth()
  const { openAddExpense } = useOutletContext() || {}
  const { summary, categorySummary, monthlyTrend, loading, refetch } = useAnalytics()
  const [recentExpenses, setRecentExpenses] = useState([])
  const [expensesLoading, setExpensesLoading] = useState(true)

  const loadRecentExpenses = async () => {
    setExpensesLoading(true)
    try {
      const res = await expenseApi.getAll({ page: 1, limit: 5 })
      setRecentExpenses(res.expenses || [])
    } catch (err) {
      console.error('Failed to load recent expenses:', err)
    } finally {
      setExpensesLoading(false)
    }
  }

  useEffect(() => {
    loadRecentExpenses()

    const handleUpdate = () => {
      refetch()
      loadRecentExpenses()
    }

    window.addEventListener('expense:updated', handleUpdate)
    return () => window.removeEventListener('expense:updated', handleUpdate)
  }, [refetch])

  return (
    <div className="dashboard-page">
      <div className="welcome-banner">
        <div>
          <h2>Hello, {user?.name || 'Investor'} 👋</h2>
          <p className="welcome-subtitle">
            Here's a snapshot of your spending and financial health this month.
          </p>
        </div>
        {openAddExpense && (
          <Button variant="primary" icon={Plus} onClick={openAddExpense}>
            Record Expense
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <StatCard
          title="Spent This Month"
          value={formatCurrency(summary?.thisMonthSpent || 0, user?.currency)}
          subtitle={`${summary?.thisMonthTransactions || 0} transactions`}
          icon={Calendar}
          color="#6366F1"
          trend={summary?.monthChangePercentage}
        />
        <StatCard
          title="Current Month Budget"
          value={
            summary?.currentBudget
              ? formatCurrency(summary.currentBudget, user?.currency)
              : 'No Limit Set'
          }
          subtitle={
            summary?.currentBudget
              ? `${formatCurrency(summary.budgetRemaining, user?.currency)} remaining`
              : 'Set limits in Budgets tab'
          }
          icon={Target}
          color="#10B981"
        />
        <StatCard
          title="Lifetime Expenses"
          value={formatCurrency(summary?.totalSpent || 0, user?.currency)}
          subtitle={`${summary?.totalTransactions || 0} total entries`}
          icon={CreditCard}
          color="#EC4899"
        />
        <StatCard
          title="Last Month Spending"
          value={formatCurrency(summary?.lastMonthSpent || 0, user?.currency)}
          subtitle="Previous calendar month"
          icon={summary?.monthChangePercentage >= 0 ? TrendingUp : TrendingDown}
          color="#F59E0B"
        />
      </div>

      {/* Charts Section */}
      <div className="dashboard-charts-grid">
        <div className="panel chart-panel">
          <div className="panel-header">
            <h3>Monthly Spending Trend</h3>
            <span className="badge">Last 6 Months</span>
          </div>
          <div className="panel-body">
            {loading ? (
              <div className="skeleton-chart" />
            ) : (
              <TrendLine data={monthlyTrend} />
            )}
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="panel-header">
            <h3>Top Expense Categories</h3>
            <span className="badge">Distribution</span>
          </div>
          <div className="panel-body">
            {loading ? (
              <div className="skeleton-chart" />
            ) : (
              <CategoryDonut data={categorySummary} />
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="panel recent-transactions-panel">
        <div className="panel-header">
          <h3>Recent Transactions</h3>
          <Link to="/expenses" className="panel-link">
            <span>View All</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="panel-body table-responsive">
          {expensesLoading ? (
            <p className="table-loading">Loading recent transactions...</p>
          ) : recentExpenses.length === 0 ? (
            <div className="empty-state">
              <p>No expenses recorded yet.</p>
              {openAddExpense && (
                <Button variant="secondary" size="sm" onClick={openAddExpense}>
                  Add Your First Expense
                </Button>
              )}
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map((expense) => (
                  <ExpenseRow key={expense.id} expense={expense} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
