import { Router } from 'express'
import { query } from '../config/db.js'
import authRoutes from './auth.routes.js'
import categoryRoutes from './category.routes.js'
import expenseRoutes from './expense.routes.js'
import budgetRoutes from './budget.routes.js'
import analyticsRoutes from './analytics.routes.js'
import reportRoutes from './report.routes.js'

const router = Router()

// Health check
router.get('/health', async (req, res) => {
  try {
    await query('SELECT 1')
    return res.status(200).json({
      success: true,
      status: 'healthy',
      message: 'Expense Tracker API is running',
      database: 'connected',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Health check failed:', error.message)
    return res.status(503).json({
      success: false,
      status: 'unhealthy',
      message: 'API is running, but the database is unavailable',
      database: 'disconnected',
    })
  }
})

// Sub-routes
router.use('/auth', authRoutes)
router.use('/categories', categoryRoutes)
router.use('/expenses', expenseRoutes)
router.use('/budgets', budgetRoutes)
router.use('/analytics', analyticsRoutes)
router.use('/reports', reportRoutes)

export default router
