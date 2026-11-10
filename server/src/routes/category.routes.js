import { Router } from 'express'
import CategoryController from '../controllers/category.controller.js'
import authenticate from '../middleware/auth.js'
import validate from '../middleware/validate.js'
import { categorySchema } from '../validators/expense.schema.js'

const router = Router()

router.use(authenticate)

router.get('/', CategoryController.listCategories)
router.post('/', validate(categorySchema), CategoryController.createCategory)
router.put('/:id', validate(categorySchema), CategoryController.updateCategory)
router.delete('/:id', CategoryController.deleteCategory)

export default router
