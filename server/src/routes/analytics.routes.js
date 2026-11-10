import { Router } from 'express'
import AnalyticsController from '../controllers/analytics.controller.js'
import authenticate from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/summary', AnalyticsController.getSummary)
router.get('/category-summary', AnalyticsController.getCategorySummary)
router.get('/monthly-trend', AnalyticsController.getMonthlyTrend)
router.get('/daily-heatmap', AnalyticsController.getDailyHeatmap)

export default router
