import BudgetModel from '../models/budget.model.js'
import CategoryModel from '../models/category.model.js'
import ApiError from '../utils/ApiError.js'

export const BudgetController = {
  async listBudgets(req, res, next) {
    try {
      let { month } = req.query
      if (!month) {
        const now = new Date()
        const yyyy = now.getFullYear()
        const mm = String(now.getMonth() + 1).padStart(2, '0')
        month = `${yyyy}-${mm}-01`
      } else if (!/^\d{4}-\d{2}-01$/.test(month)) {
        if (/^\d{4}-\d{2}$/.test(month)) {
          month = `${month}-01`
        } else {
          throw ApiError.badRequest('Month must be in YYYY-MM or YYYY-MM-01 format')
        }
      }

      const budgets = await BudgetModel.findByUserAndMonth(req.user.id, month)

      const totalBudget = budgets.reduce((acc, b) => acc + Number(b.limit_amount), 0)
      const totalSpent = budgets.reduce((acc, b) => acc + Number(b.spent_amount), 0)

      return res.status(200).json({
        success: true,
        month,
        summary: {
          totalBudget,
          totalSpent,
          remaining: totalBudget - totalSpent,
          percentageSpent: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
        },
        budgets,
      })
    } catch (error) {
      next(error)
    }
  },

  async setBudget(req, res, next) {
    try {
      let { categoryId, month, limitAmount } = req.body

      if (/^\d{4}-\d{2}$/.test(month)) {
        month = `${month}-01`
      }

      // Check category ownership
      const category = await CategoryModel.findByIdAndUser(categoryId, req.user.id)
      if (!category) {
        throw ApiError.badRequest('Invalid category or does not belong to you')
      }

      const budget = await BudgetModel.upsert({
        userId: req.user.id,
        categoryId,
        month,
        limitAmount,
      })

      return res.status(200).json({
        success: true,
        message: 'Budget saved successfully',
        budget,
      })
    } catch (error) {
      next(error)
    }
  },

  async deleteBudget(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10)
      if (isNaN(id)) throw ApiError.badRequest('Invalid budget ID')

      const deleted = await BudgetModel.delete(id, req.user.id)
      if (!deleted) throw ApiError.notFound('Budget not found')

      return res.status(200).json({
        success: true,
        message: 'Budget deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  },
}

export default BudgetController
