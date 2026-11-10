import { query, isPostgresAvailable } from '../config/db.js'
import localStore from '../db/localStore.js'

export const UserModel = {
  async create({ name, email, passwordHash, currency = 'INR' }) {
    if (!isPostgresAvailable()) {
      return localStore.createUser({ name, email, passwordHash, currency })
    }

    try {
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
    } catch (err) {
      // Fallback to local store if unexpected DB failure happens during query
      console.warn('PostgreSQL query error, falling back to local storage:', err.message)
      return localStore.createUser({ name, email, passwordHash, currency })
    }
  },

  async findByEmail(email) {
    if (!isPostgresAvailable()) {
      return localStore.findUserByEmail(email)
    }

    try {
      const result = await query(
        `SELECT id, name, email, password_hash, currency, created_at, updated_at
         FROM users
         WHERE LOWER(email) = LOWER($1)`,
        [email.trim()]
      )
      return result.rows[0] || null
    } catch (err) {
      console.warn('PostgreSQL query error, falling back to local storage:', err.message)
      return localStore.findUserByEmail(email)
    }
  },

  async findById(id) {
    if (!isPostgresAvailable()) {
      return localStore.findUserById(id)
    }

    try {
      const result = await query(
        `SELECT id, name, email, currency, created_at, updated_at
         FROM users
         WHERE id = $1`,
        [id]
      )
      return result.rows[0] || null
    } catch (err) {
      console.warn('PostgreSQL query error, falling back to local storage:', err.message)
      return localStore.findUserById(id)
    }
  },

  async updateCurrency(id, currency) {
    if (!isPostgresAvailable()) {
      return localStore.updateUserCurrency(id, currency)
    }

    try {
      const result = await query(
        `UPDATE users
         SET currency = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id, name, email, currency, updated_at`,
        [currency, id]
      )
      return result.rows[0] || null
    } catch (err) {
      console.warn('PostgreSQL query error, falling back to local storage:', err.message)
      return localStore.updateUserCurrency(id, currency)
    }
  },
}

export default UserModel
