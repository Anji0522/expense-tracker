import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import ApiError from '../utils/ApiError.js'
import { query } from '../config/db.js'

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication token missing or invalid format')
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      throw ApiError.unauthorized('Authentication token missing')
    }

    let decoded
    try {
      decoded = jwt.verify(token, env.jwtSecret)
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Token expired, please log in again')
      }
      throw ApiError.unauthorized('Invalid authentication token')
    }

    const result = await query(
      'SELECT id, name, email, currency, created_at FROM users WHERE id = $1',
      [decoded.id]
    )

    if (result.rows.length === 0) {
      throw ApiError.unauthorized('User not found or account deactivated')
    }

    req.user = result.rows[0]
    next()
  } catch (error) {
    next(error)
  }
}

export default authenticate
