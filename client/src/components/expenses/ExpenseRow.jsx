import React from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/dates'
import { useAuth } from '../../context/AuthContext'

export const ExpenseRow = ({ expense, onEdit, onDelete }) => {
  const { user } = useAuth()

  return (
    <tr className="expense-row">
      <td className="expense-date-col">
        {formatDate(expense.expense_date)}
      </td>
      <td className="expense-category-col">
        <span
          className="category-badge"
          style={{
            backgroundColor: `${expense.category_color || '#6366F1'}20`,
            color: expense.category_color || '#6366F1',
            borderColor: `${expense.category_color || '#6366F1'}40`,
          }}
        >
          {expense.category_name || 'Uncategorized'}
        </span>
      </td>
      <td className="expense-desc-col">
        {expense.description || <span className="text-muted">—</span>}
      </td>
      <td className="expense-amount-col">
        <span className="expense-amount">
          {formatCurrency(expense.amount, user?.currency)}
        </span>
      </td>
      <td className="expense-actions-col">
        <div className="table-actions">
          {onEdit && (
            <button
              className="action-btn edit-btn"
              onClick={() => onEdit(expense)}
              title="Edit expense"
            >
              <Edit2 size={16} />
            </button>
          )}
          {onDelete && (
            <button
              className="action-btn delete-btn"
              onClick={() => onDelete(expense.id)}
              title="Delete expense"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

export default ExpenseRow
