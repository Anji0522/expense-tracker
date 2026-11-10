import { Router } from 'express'
import ExpenseController from '../controllers/expense.controller.js'
import authenticate from '../middleware/auth.js'
import validate from '../middleware/validate.js'
import {
  createExpenseSchema,
  updateExpenseSchema,
} from '../validators/expense.schema.js'

const router = Router()

router.use(authenticate)

router.get('/', ExpenseController.listExpenses)
router.get('/:id', ExpenseController.getExpenseById)
router.post('/', validate(createExpenseSchema), ExpenseController.createExpense)
router.put('/:id', validate(updateExpenseSchema), ExpenseController.updateExpense)
router.delete('/:id', ExpenseController.deleteExpense)

export default router
