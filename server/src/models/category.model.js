import { query } from '../config/db.js'

export const CategoryModel = {
  async findByUserId(userId) {
    const result = await query(
      `SELECT c.id, c.name, c.color, c.icon, c.created_at,
              COALESCE(SUM(e.amount), 0)::NUMERIC(12, 2) AS total_spent,
              COUNT(e.id)::INT AS transaction_count
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id AND e.user_id = c.user_id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.name ASC`,
      [userId]
    )
    return result.rows
  },

  async findByIdAndUser(id, userId) {
    const result = await query(
      `SELECT id, user_id, name, color, icon, created_at, updated_at
       FROM categories
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    )
    return result.rows[0] || null
  },

  async create({ userId, name, color = '#6366F1', icon = 'wallet' }) {
    const result = await query(
      `INSERT INTO categories (user_id, name, color, icon)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, name, color, icon, created_at`,
      [userId, name.trim(), color, icon]
    )
    return result.rows[0]
  },

  async update(id, userId, { name, color, icon }) {
    const fields = []
    const params = [id, userId]
    let index = 3

    if (name !== undefined) {
      fields.push(`name = $${index++}`)
      params.push(name.trim())
    }
    if (color !== undefined) {
      fields.push(`color = $${index++}`)
      params.push(color)
    }
    if (icon !== undefined) {
      fields.push(`icon = $${index++}`)
      params.push(icon)
    }

    if (fields.length === 0) return this.findByIdAndUser(id, userId)

    fields.push('updated_at = NOW()')

    const result = await query(
      `UPDATE categories
       SET ${fields.join(', ')}
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id, name, color, icon, created_at, updated_at`,
      params
    )
    return result.rows[0] || null
  },

  async delete(id, userId) {
    const result = await query(
      `DELETE FROM categories
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    )
    return result.rows.length > 0
  },
}

export default CategoryModel
