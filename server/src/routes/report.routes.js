import { Router } from 'express'
import ReportController from '../controllers/report.controller.js'
import authenticate from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/monthly', ReportController.getMonthlyReport)
router.get('/export.csv', ReportController.exportCsv)

export default router
