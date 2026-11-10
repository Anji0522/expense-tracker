import React, { useState, useEffect } from 'react'
import { Download, Printer, Calendar, Award, TrendingUp, Layers } from 'lucide-react'
import analyticsApi from '../api/analytics.api'
import { formatCurrency } from '../utils/formatCurrency'
import { getCurrentMonth, getMonthName, formatDate } from '../utils/dates'
import { useAuth } from '../context/AuthContext'
import StatCard from '../components/ui/StatCard'
import Button from '../components/ui/Button'

export const Reports = () => {
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadReport = async () => {
    setLoading(true)
    try {
      const res = await analyticsApi.getMonthlyReport(selectedMonth)
      setReport(res)
    } catch (err) {
      console.error('Failed to load monthly report:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
  }, [selectedMonth])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="reports-page">
      <div className="page-header-row no-print">
        <div>
          <h2>Financial Reports</h2>
          <p className="subtitle">
            Generate printable monthly accounting summaries and export raw spreadsheet records
          </p>
        </div>
        <div className="header-actions">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="filter-date-input month-picker"
          />
          <Button variant="secondary" icon={Printer} onClick={handlePrint}>
            Print Report
          </Button>
          <a
            href={analyticsApi.exportCsvUrl({
              startDate: `${selectedMonth}-01`,
              endDate: `${selectedMonth}-31`,
            })}
            className="btn btn-primary"
            download
          >
            <Download size={18} />
            <span>Export Month CSV</span>
          </a>
        </div>
      </div>

      <div className="report-printable-area">
        <div className="report-print-header">
          <h2>Monthly Statement — {getMonthName(selectedMonth)}</h2>
          <p>Generated for {user?.name} ({user?.email})</p>
        </div>

        {/* Summary Cards */}
        <div className="stats-grid">
          <StatCard
            title="Total Monthly Spend"
            value={formatCurrency(report?.summary?.total_spent || 0, user?.currency)}
            icon={Calendar}
            color="#6366F1"
          />
          <StatCard
            title="Total Transactions"
            value={report?.summary?.total_count || 0}
            icon={Layers}
            color="#10B981"
          />
          <StatCard
            title="Average Expense"
            value={formatCurrency(report?.summary?.avg_expense || 0, user?.currency)}
            icon={TrendingUp}
            color="#3B82F6"
          />
          <StatCard
            title="Largest Single Expense"
            value={formatCurrency(report?.summary?.max_expense || 0, user?.currency)}
            icon={Award}
            color="#F59E0B"
          />
        </div>

        {/* Category Breakdown */}
        <div className="panel report-section">
          <div className="panel-header">
            <h3>Category Breakdown for {getMonthName(selectedMonth)}</h3>
          </div>
          <div className="panel-body table-responsive">
            {loading ? (
              <p className="table-loading">Generating category figures...</p>
            ) : !report?.categoryBreakdown || report.categoryBreakdown.length === 0 ? (
              <p className="empty-state-text">No category spending recorded for this month.</p>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Transactions</th>
                    <th>Amount Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {report.categoryBreakdown.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="category-cell">
                          <span
                            className="category-color-dot"
                            style={{ backgroundColor: item.color || '#6366F1' }}
                          />
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td>{item.count}</td>
                      <td>
                        <strong>{formatCurrency(item.spent, user?.currency)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top 5 Transactions */}
        <div className="panel report-section">
          <div className="panel-header">
            <h3>Top 5 Highest Expenses in {getMonthName(selectedMonth)}</h3>
          </div>
          <div className="panel-body table-responsive">
            {loading ? (
              <p className="table-loading">Loading top items...</p>
            ) : !report?.topExpenses || report.topExpenses.length === 0 ? (
              <p className="empty-state-text">No expenses found for this statement period.</p>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {report.topExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>{formatDate(expense.expense_date)}</td>
                      <td>
                        <span
                          className="category-badge"
                          style={{
                            backgroundColor: `${expense.category_color || '#6366F1'}20`,
                            color: expense.category_color || '#6366F1',
                            borderColor: `${expense.category_color || '#6366F1'}40`,
                          }}
                        >
                          {expense.category_name}
                        </span>
                      </td>
                      <td>{expense.description || '—'}</td>
                      <td>
                        <strong className="text-primary">
                          {formatCurrency(expense.amount, user?.currency)}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
