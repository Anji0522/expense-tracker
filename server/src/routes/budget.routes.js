import { Router } from 'express'
import BudgetController from '../controllers/budget.controller.js'
import authenticate from '../middleware/auth.js'
import validate from '../middleware/validate.js'
import { budgetSchema } from '../validators/expense.schema.js'

const router = Router()

router.use(authenticate)

router.get('/', BudgetController.listBudgets)
router.post('/', validate(budgetSchema), BudgetController.setBudget)
router.delete('/:id', BudgetController.deleteBudget)

export default router
