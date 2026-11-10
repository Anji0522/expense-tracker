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
    let dbStatus = 'local-storage'
    try {
      await query('SELECT 1')
      dbStatus = 'postgresql-connected'
    } catch {
      dbStatus = 'local-storage-fallback'
    }

    return res.status(200).json({
      success: true,
      status: 'healthy',
      message: 'Expense Tracker API is running',
      database: dbStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return res.status(200).json({
      success: true,
      status: 'healthy',
      message: 'Expense Tracker API is running (local mode)',
      database: 'local-storage',
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
