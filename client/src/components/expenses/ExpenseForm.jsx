import React, { useState, useEffect } from 'react'
import expenseApi from '../../api/expense.api'
import categoryApi from '../../api/category.api'
import { getTodayString } from '../../utils/dates'
import Button from '../ui/Button'

export const ExpenseForm = ({ initialData, onSuccess, onCancel }) => {
  const [categories, setCategories] = useState([])
  const [amount, setAmount] = useState(initialData?.amount || '')
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [expenseDate, setExpenseDate] = useState(
    initialData?.expense_date
      ? new Date(initialData.expense_date).toISOString().split('T')[0]
      : getTodayString()
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryApi.getAll()
        setCategories(res.categories || [])
        if (!categoryId && res.categories && res.categories.length > 0) {
          setCategoryId(res.categories[0].id)
        }
      } catch (err) {
        console.error('Failed to load categories:', err)
      }
    }
    loadCategories()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount greater than 0')
      return
    }

    if (!categoryId) {
      setError('Please select a category')
      return
    }

    setLoading(true)
    try {
      const payload = {
        amount: Number(amount),
        categoryId: Number(categoryId),
        description: description.trim() || undefined,
        expenseDate,
      }

      if (initialData?.id) {
        await expenseApi.update(initialData.id, payload)
      } else {
        await expenseApi.create(payload)
      }

      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      {error && <div className="form-alert error">{error}</div>}

      <div className="form-group">
        <label className="form-label">Amount</label>
        <div className="input-prefix-wrapper">
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="form-select"
          required
        >
          <option value="" disabled>Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Date</label>
        <input
          type="date"
          required
          value={expenseDate}
          onChange={(e) => setExpenseDate(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Description (Optional)</label>
        <input
          type="text"
          maxLength={200}
          placeholder="e.g. Groceries at supermarket"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-actions">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving...' : initialData ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </form>
  )
}

export default ExpenseForm
