import { Router } from 'express'
import AuthController from '../controllers/auth.controller.js'
import authenticate from '../middleware/auth.js'
import validate from '../middleware/validate.js'
import {
  registerSchema,
  loginSchema,
  updateCurrencySchema,
} from '../validators/auth.schema.js'

const router = Router()

router.post('/register', validate(registerSchema), AuthController.register)
router.post('/login', validate(loginSchema), AuthController.login)
router.get('/me', authenticate, AuthController.getMe)
router.patch('/currency', authenticate, validate(updateCurrencySchema), AuthController.updateCurrency)

export default router
