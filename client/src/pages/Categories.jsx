import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Tag } from 'lucide-react'
import categoryApi from '../api/category.api'
import { formatCurrency } from '../utils/formatCurrency'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'

const presetColors = [
  '#6366F1', '#EC4899', '#3B82F6', '#06B6D4',
  '#EAB308', '#8B5CF6', '#EF4444', '#A855F7',
  '#22C55E', '#14B8A6', '#64748B', '#F97316',
]

export const Categories = () => {
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  // Form inputs
  const [name, setName] = useState('')
  const [color, setColor] = useState('#6366F1')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const loadCategories = async () => {
    setLoading(true)
    try {
      const res = await categoryApi.getAll()
      setCategories(res.categories || [])
    } catch (err) {
      console.error('Failed to load categories:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleOpenAdd = () => {
    setEditingCategory(null)
    setName('')
    setColor('#6366F1')
    setFormError('')
    setModalOpen(true)
  }

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat)
    setName(cat.name)
    setColor(cat.color || '#6366F1')
    setFormError('')
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? Expenses in this category will become Uncategorized.')) return
    try {
      await categoryApi.delete(id)
      loadCategories()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!name.trim()) {
      setFormError('Category name is required')
      return
    }

    setFormLoading(true)
    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, { name: name.trim(), color })
      } else {
        await categoryApi.create({ name: name.trim(), color, icon: 'wallet' })
      }
      setModalOpen(false)
      loadCategories()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save category')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="categories-page">
      <div className="page-header-row">
        <div>
          <h2>Expense Categories</h2>
          <p className="subtitle">
            Manage your personal spending categories, color tags, and inspect totals
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAdd}>
          New Category
        </Button>
      </div>

      {loading ? (
        <p className="table-loading">Loading categories...</p>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <p>No categories found.</p>
          <Button variant="primary" onClick={handleOpenAdd}>
            Create Category
          </Button>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="category-card"
              style={{ borderLeftColor: cat.color || '#6366F1' }}
            >
              <div className="category-card-header">
                <div className="category-tag-info">
                  <span
                    className="category-color-dot"
                    style={{ backgroundColor: cat.color || '#6366F1' }}
                  />
                  <h4>{cat.name}</h4>
                </div>
                <div className="card-actions">
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleOpenEdit(cat)}
                    title="Edit category"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(cat.id)}
                    title="Delete category"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <div className="category-card-stats">
                <div>
                  <span className="stat-label">Total Spent</span>
                  <div className="stat-value">
                    {formatCurrency(cat.total_spent || 0, user?.currency)}
                  </div>
                </div>
                <div>
                  <span className="stat-label">Transactions</span>
                  <div className="stat-count">{cat.transaction_count || 0}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
      >
        <form onSubmit={handleSubmit} className="category-form">
          {formError && <div className="form-alert error">{formError}</div>}

          <div className="form-group">
            <label className="form-label">Category Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Subscriptions, Fitness"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Color Theme</label>
            <div className="color-palette">
              {presetColors.map((hex) => (
                <button
                  type="button"
                  key={hex}
                  className={`color-swatch ${color === hex ? 'active' : ''}`}
                  style={{ backgroundColor: hex }}
                  onClick={() => setColor(hex)}
                />
              ))}
            </div>
            <div className="custom-color-input">
              <span>Custom Hex:</span>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                maxLength={7}
                className="form-input color-hex-field"
              />
            </div>
          </div>

          <div className="form-actions">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={formLoading}>
              {formLoading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Categories
