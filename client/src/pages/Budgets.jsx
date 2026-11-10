import React, { useState, useEffect } from 'react'
import { Plus, Target, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react'
import budgetApi from '../api/budget.api'
import categoryApi from '../api/category.api'
import { formatCurrency } from '../utils/formatCurrency'
import { getCurrentMonth, getMonthName } from '../utils/dates'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

export const Budgets = () => {
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth())
  const [budgets, setBudgets] = useState([])
  const [summary, setSummary] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [limitAmount, setLimitAmount] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const loadBudgets = async () => {
    setLoading(true)
    try {
      const res = await budgetApi.getAll(selectedMonth)
      setBudgets(res.budgets || [])
      setSummary(res.summary || null)
    } catch (err) {
      console.error('Failed to load budgets:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await categoryApi.getAll()
      setCategories(res.categories || [])
      if (res.categories && res.categories.length > 0) {
        setCategoryId(res.categories[0].id)
      }
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  useEffect(() => {
    loadBudgets()
  }, [selectedMonth])

  useEffect(() => {
    loadCategories()
  }, [])

  const handleOpenModal = () => {
    setLimitAmount('')
    setFormError('')
    setModalOpen(true)
  }

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Delete this budget limit?')) return
    try {
      await budgetApi.delete(id)
      loadBudgets()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove budget')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!limitAmount || Number(limitAmount) <= 0) {
      setFormError('Budget limit must be greater than zero')
      return
    }

    setFormLoading(true)
    try {
      await budgetApi.setBudget({
        categoryId: Number(categoryId),
        month: `${selectedMonth}-01`,
        limitAmount: Number(limitAmount),
      })
      setModalOpen(false)
      loadBudgets()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to set budget')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="budgets-page">
      <div className="page-header-row">
        <div>
          <h2>Monthly Budgets</h2>
          <p className="subtitle">
            Set spending targets per category and monitor allowances for {getMonthName(selectedMonth)}
          </p>
        </div>
        <div className="header-actions">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="filter-date-input month-picker"
          />
          <Button variant="primary" icon={Plus} onClick={handleOpenModal}>
            Set Category Budget
          </Button>
        </div>
      </div>

      {/* Overview Card */}
      {summary && (
        <div className="budget-summary-banner panel">
          <div className="summary-col">
            <span className="summary-title">Total Allocated Budget</span>
            <div className="summary-number">
              {formatCurrency(summary.totalBudget, user?.currency)}
            </div>
          </div>
          <div className="summary-col">
            <span className="summary-title">Total Spent This Month</span>
            <div className="summary-number">
              {formatCurrency(summary.totalSpent, user?.currency)}
            </div>
          </div>
          <div className="summary-col">
            <span className="summary-title">Remaining Cushion</span>
            <div
              className={`summary-number ${summary.remaining < 0 ? 'text-danger' : 'text-success'}`}
            >
              {formatCurrency(summary.remaining, user?.currency)}
            </div>
          </div>
          <div className="summary-col progress-col">
            <div className="progress-label-row">
              <span>Overall Utilization</span>
              <span>{summary.percentageSpent}%</span>
            </div>
            <div className="progress-bar-track">
              <div
                className={`progress-bar-fill ${
                  summary.percentageSpent > 100
                    ? 'fill-danger'
                    : summary.percentageSpent > 80
                    ? 'fill-warning'
                    : 'fill-primary'
                }`}
                style={{ width: `${Math.min(100, summary.percentageSpent)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="table-loading">Loading budget allocations...</p>
      ) : budgets.length === 0 ? (
        <div className="empty-state panel">
          <Target size={44} color="#6366F1" />
          <h3>No Budgets Set For {getMonthName(selectedMonth)}</h3>
          <p>
            Create targets for your categories to keep spending within your comfort zone.
          </p>
          <Button variant="primary" onClick={handleOpenModal}>
            Set Your First Budget
          </Button>
        </div>
      ) : (
        <div className="budgets-grid">
          {budgets.map((item) => {
            const pct = Number(item.percentage_spent)
            const isOver = pct > 100
            const isNear = pct >= 80 && !isOver

            return (
              <div key={item.id} className="budget-card panel">
                <div className="budget-card-header">
                  <div className="budget-category-info">
                    <span
                      className="category-color-dot"
                      style={{ backgroundColor: item.category_color || '#6366F1' }}
                    />
                    <h4>{item.category_name}</h4>
                  </div>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteBudget(item.id)}
                    title="Remove Budget Target"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="budget-numbers">
                  <div>
                    <span className="num-label">Spent</span>
                    <div className="num-value">
                      {formatCurrency(item.spent_amount, user?.currency)}
                    </div>
                  </div>
                  <div className="num-divider">/</div>
                  <div>
                    <span className="num-label">Limit</span>
                    <div className="num-value">
                      {formatCurrency(item.limit_amount, user?.currency)}
                    </div>
                  </div>
                </div>

                <div className="progress-bar-track">
                  <div
                    className={`progress-bar-fill ${
                      isOver ? 'fill-danger' : isNear ? 'fill-warning' : 'fill-primary'
                    }`}
                    style={{
                      width: `${Math.min(100, pct)}%`,
                      backgroundColor: item.category_color,
                    }}
                  />
                </div>

                <div className="budget-status-row">
                  <div className="status-indicator">
                    {isOver ? (
                      <>
                        <AlertTriangle size={15} className="text-danger" />
                        <span className="text-danger">
                          Over by {formatCurrency(Math.abs(item.remaining_amount), user?.currency)}
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={15} className="text-success" />
                        <span className="text-success">
                          {formatCurrency(item.remaining_amount, user?.currency)} left
                        </span>
                      </>
                    )}
                  </div>
                  <span className="percentage-tag">{pct}%</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Set Budget Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Set Budget Target (${getMonthName(selectedMonth)})`}
      >
        <form onSubmit={handleSubmit} className="budget-form">
          {formError && <div className="form-alert error">{formError}</div>}

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="form-select"
              required
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Monthly Spending Ceiling</label>
            <input
              type="number"
              step="0.01"
              min="1"
              required
              placeholder="e.g. 5000"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-actions">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={formLoading}>
              {formLoading ? 'Saving...' : 'Save Budget'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Budgets
