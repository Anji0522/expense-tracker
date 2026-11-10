import React, { useState, useEffect } from 'react'
import { Plus, Download } from 'lucide-react'
import useExpenses from '../hooks/useExpenses'
import categoryApi from '../api/category.api'
import expenseApi from '../api/expense.api'
import analyticsApi from '../api/analytics.api'
import useDebounce from '../hooks/useDebounce'
import ExpenseRow from '../components/expenses/ExpenseRow'
import FilterBar from '../components/expenses/FilterBar'
import Modal from '../components/ui/Modal'
import ExpenseForm from '../components/expenses/ExpenseForm'
import Button from '../components/ui/Button'

export const Expenses = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [categories, setCategories] = useState([])
  const [currentPage, setCurrentPage] = useState(1)

  // Edit / Add modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)

  const debouncedSearch = useDebounce(searchTerm, 350)

  const { expenses, pagination, loading, setParams, refetch } = useExpenses({
    page: 1,
    limit: 10,
  })

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoryApi.getAll()
        setCategories(res.categories || [])
      } catch (err) {
        console.error('Failed to load categories:', err)
      }
    }
    loadCategories()
  }, [])

  useEffect(() => {
    setParams({
      search: debouncedSearch || undefined,
      categoryId: selectedCategory || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page: currentPage,
      limit: 10,
    })
  }, [debouncedSearch, selectedCategory, startDate, endDate, currentPage, setParams])

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setStartDate('')
    setEndDate('')
    setCurrentPage(1)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return
    try {
      await expenseApi.delete(id)
      refetch()
      window.dispatchEvent(new CustomEvent('expense:updated'))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete expense')
    }
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setModalOpen(true)
  }

  const handleAdd = () => {
    setEditingExpense(null)
    setModalOpen(true)
  }

  const handleFormSuccess = () => {
    setModalOpen(false)
    setEditingExpense(null)
    refetch()
    window.dispatchEvent(new CustomEvent('expense:updated'))
  }

  return (
    <div className="expenses-page">
      <div className="page-header-row">
        <div>
          <h2>Expense Management</h2>
          <p className="subtitle">Search, filter, edit, and organize all your transactions</p>
        </div>
        <div className="header-actions">
          <a
            href={analyticsApi.exportCsvUrl({
              search: debouncedSearch || undefined,
              categoryId: selectedCategory || undefined,
              startDate: startDate || undefined,
              endDate: endDate || undefined,
            })}
            className="btn btn-secondary btn-md"
            download
          >
            <Download size={18} />
            <span>Export CSV</span>
          </a>
          <Button variant="primary" icon={Plus} onClick={handleAdd}>
            Add Expense
          </Button>
        </div>
      </div>

      <FilterBar
        search={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val)
          setCurrentPage(1)
        }}
        categoryId={selectedCategory}
        onCategoryChange={(val) => {
          setSelectedCategory(val)
          setCurrentPage(1)
        }}
        startDate={startDate}
        onStartDateChange={(val) => {
          setStartDate(val)
          setCurrentPage(1)
        }}
        endDate={endDate}
        onEndDateChange={(val) => {
          setEndDate(val)
          setCurrentPage(1)
        }}
        categories={categories}
        onClearFilters={handleClearFilters}
      />

      <div className="panel table-panel">
        <div className="panel-body table-responsive">
          {loading ? (
            <p className="table-loading">Loading expenses...</p>
          ) : expenses.length === 0 ? (
            <div className="empty-state">
              <p>No matching expenses found.</p>
              <Button variant="secondary" size="sm" onClick={handleAdd}>
                Create an Expense
              </Button>
            </div>
          ) : (
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="pagination-bar">
            <span className="pagination-info">
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </span>
            <div className="pagination-buttons">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage >= pagination.totalPages}
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
      >
        <ExpenseForm
          initialData={editingExpense}
          onSuccess={handleFormSuccess}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

export default Expenses
