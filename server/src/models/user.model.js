import { query } from '../config/db.js'

export const UserModel = {
  async create({ name, email, passwordHash, currency = 'INR' }) {
    // Transactional creation: create user and seed user's own categories
    const userRes = await query(
      `INSERT INTO users (name, email, password_hash, currency)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, currency, created_at`,
      [name, email.toLowerCase().trim(), passwordHash, currency]
    )
    const user = userRes.rows[0]

    // Populate user's categories from default_categories
    await query(
      `INSERT INTO categories (user_id, name, color, icon)
       SELECT $1, name, color, icon FROM default_categories
       ON CONFLICT (user_id, name) DO NOTHING`,
      [user.id]
    )

    return user
  },

  async findByEmail(email) {
    const result = await query(
      `SELECT id, name, email, password_hash, currency, created_at, updated_at
       FROM users
       WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    )
    return result.rows[0] || null
  },

  async findById(id) {
    const result = await query(
      `SELECT id, name, email, currency, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    )
    return result.rows[0] || null
  },

  async updateCurrency(id, currency) {
    const result = await query(
      `UPDATE users
       SET currency = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, email, currency, updated_at`,
      [currency, id]
    )
    return result.rows[0] || null
  },
}

export default UserModel
