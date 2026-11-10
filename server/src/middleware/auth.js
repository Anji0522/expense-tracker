import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import ApiError from '../utils/ApiError.js'
import UserModel from '../models/user.model.js'

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

    const user = await UserModel.findById(decoded.id)

    if (!user) {
      throw ApiError.unauthorized('User not found or account deactivated')
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      created_at: user.created_at,
    }
    next()
  } catch (error) {
    next(error)
  }
}

export default authenticate
