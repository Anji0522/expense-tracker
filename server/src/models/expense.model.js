import { query, isPostgresAvailable } from '../config/db.js'
import localStore from '../db/localStore.js'

export const ExpenseModel = {
  async findWithFilters(userId, options = {}) {
    if (!isPostgresAvailable()) {
      return localStore.getExpenses(userId, options)
    }

    try {
      const {
        search,
        categoryId,
        startDate,
        endDate,
        sortBy = 'expense_date',
        order = 'DESC',
        page = 1,
        limit = 10,
      } = options

      const conditions = ['e.user_id = $1']
      const params = [userId]
      let index = 2

      if (search && search.trim()) {
        conditions.push(`e.description ILIKE $${index++}`)
        params.push(`%${search.trim()}%`)
      }

      if (categoryId) {
        conditions.push(`e.category_id = $${index++}`)
        params.push(categoryId)
      }

      if (startDate) {
        conditions.push(`e.expense_date >= $${index++}`)
        params.push(startDate)
      }

      if (endDate) {
        conditions.push(`e.expense_date <= $${index++}`)
        params.push(endDate)
      }

      const whereClause = conditions.join(' AND ')

      const countResult = await query(
        `SELECT COUNT(*)::INT AS total FROM expenses e WHERE ${whereClause}`,
        params
      )
      const total = countResult.rows[0].total

      const allowedSort = {
        expense_date: 'e.expense_date',
        amount: 'e.amount',
        created_at: 'e.created_at',
      }
      const sortCol = allowedSort[sortBy] || 'e.expense_date'
      const sortDir = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'

      const pageNum = Math.max(1, Number(page))
      const limitNum = Math.min(100, Math.max(1, Number(limit)))
      const offset = (pageNum - 1) * limitNum

      const dataParams = [...params, limitNum, offset]
      const limitIndex = index++
      const offsetIndex = index++

      const dataResult = await query(
        `SELECT e.id, e.user_id, e.category_id, e.amount, e.description,
                e.expense_date, e.created_at, e.updated_at,
                c.name AS category_name, c.color AS category_color, c.icon AS category_icon
         FROM expenses e
         LEFT JOIN categories c ON c.id = e.category_id AND c.user_id = e.user_id
         WHERE ${whereClause}
         ORDER BY ${sortCol} ${sortDir}, e.id DESC
         LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
        dataParams
      )

      return {
        expenses: dataResult.rows,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      }
    } catch (err) {
      console.warn('PostgreSQL query error, falling back to local storage:', err.message)
      return localStore.getExpenses(userId, options)
    }
  },

  async findByIdAndUser(id, userId) {
    if (!isPostgresAvailable()) {
      return localStore.getExpenseById(id, userId)
    }

    try {
      const result = await query(
        `SELECT e.id, e.user_id, e.category_id, e.amount, e.description,
                e.expense_date, e.created_at, e.updated_at,
                c.name AS category_name, c.color AS category_color, c.icon AS category_icon
         FROM expenses e
         LEFT JOIN categories c ON c.id = e.category_id AND c.user_id = e.user_id
         WHERE e.id = $1 AND e.user_id = $2`,
        [id, userId]
      )
      return result.rows[0] || null
    } catch (err) {
      console.warn('PostgreSQL query error, falling back to local storage:', err.message)
      return localStore.getExpenseById(id, userId)
    }
  },

  async create({ userId, categoryId, amount, description, expenseDate }) {
    if (!isPostgresAvailable()) {
      return localStore.createExpense({ userId, categoryId, amount, description, expenseDate })
    }

    try {
      const result = await query(
        `INSERT INTO expenses (user_id, category_id, amount, description, expense_date)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, category_id, amount, description, expense_date, created_at`,
        [userId, categoryId, amount, description || null, expenseDate]
      )
      return result.rows[0]
    } catch (err) {
      console.warn('PostgreSQL query error, falling back to local storage:', err.message)
      return localStore.createExpense({ userId, categoryId, amount, description, expenseDate })
    }
  },

  async update(id, userId, { categoryId, amount, description, expenseDate }) {
    if (!isPostgresAvailable()) {
      return localStore.updateExpense(id, userId, { categoryId, amount, description, expenseDate })
    }

    try {
      const fields = []
      const params = [id, userId]
      let index = 3

      if (categoryId !== undefined) {
        fields.push(`category_id = $${index++}`)
        params.push(categoryId)
      }
      if (amount !== undefined) {
        fields.push(`amount = $${index++}`)
        params.push(amount)
      }
      if (description !== undefined) {
        fields.push(`description = $${index++}`)
        params.push(description)
      }
      if (expenseDate !== undefined) {
        fields.push(`expense_date = $${index++}`)
        params.push(expenseDate)
      }

      if (fields.length === 0) return this.findByIdAndUser(id, userId)

      fields.push('updated_at = NOW()')

      const result = await query(
        `UPDATE expenses
         SET ${fields.join(', ')}
         WHERE id = $1 AND user_id = $2
         RETURNING id, user_id, category_id, amount, description, expense_date, created_at, updated_at`,
        params
      )
      return result.rows[0] || null
    } catch (err) {
      console.warn('PostgreSQL query error, falling back to local storage:', err.message)
      return localStore.updateExpense(id, userId, { categoryId, amount, description, expenseDate })
    }
  },

  async delete(id, userId) {
    if (!isPostgresAvailable()) {
      return localStore.deleteExpense(id, userId)
    }

    try {
      const result = await query(
        `DELETE FROM expenses
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [id, userId]
      )
      return result.rows.length > 0
    } catch (err) {
      console.warn('PostgreSQL query error, falling back to local storage:', err.message)
      return localStore.deleteExpense(id, userId)
    }
  },
}

export default ExpenseModel
