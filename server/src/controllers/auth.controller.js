import bcrypt from 'bcryptjs'
import UserModel from '../models/user.model.js'
import ApiError from '../utils/ApiError.js'
import generateToken from '../utils/generateToken.js'

export const AuthController = {
  async register(req, res, next) {
    try {
      const { name, email, password, currency } = req.body

      const existingUser = await UserModel.findByEmail(email)
      if (existingUser) {
        throw ApiError.conflict('An account with this email already exists')
      }

      const salt = await bcrypt.genSalt(10)
      const passwordHash = await bcrypt.hash(password, salt)

      const user = await UserModel.create({
        name,
        email,
        passwordHash,
        currency: currency || 'INR',
      })

      const token = generateToken({ id: user.id, email: user.email })

      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          currency: user.currency,
        },
        token,
      })
    } catch (error) {
      next(error)
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body

      const user = await UserModel.findByEmail(email)
      if (!user) {
        throw ApiError.unauthorized('Invalid email or password')
      }

      const isMatch = await bcrypt.compare(password, user.password_hash)
      if (!isMatch) {
        throw ApiError.unauthorized('Invalid email or password')
      }

      const token = generateToken({ id: user.id, email: user.email })

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          currency: user.currency,
        },
        token,
      })
    } catch (error) {
      next(error)
    }
  },

  async getMe(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        user: req.user,
      })
    } catch (error) {
      next(error)
    }
  },

  async updateCurrency(req, res, next) {
    try {
      const { currency } = req.body
      const updated = await UserModel.updateCurrency(req.user.id, currency)
      return res.status(200).json({
        success: true,
        message: 'Currency updated successfully',
        user: updated,
      })
    } catch (error) {
      next(error)
    }
  },
}

export default AuthController
