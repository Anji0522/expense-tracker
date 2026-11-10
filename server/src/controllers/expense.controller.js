import ExpenseModel from '../models/expense.model.js'
import CategoryModel from '../models/category.model.js'
import ApiError from '../utils/ApiError.js'

export const ExpenseController = {
  async listExpenses(req, res, next) {
    try {
      const {
        search,
        categoryId,
        startDate,
        endDate,
        sortBy,
        order,
        page,
        limit,
      } = req.query

      const result = await ExpenseModel.findWithFilters(req.user.id, {
        search,
        categoryId: categoryId ? parseInt(categoryId, 10) : undefined,
        startDate,
        endDate,
        sortBy,
        order,
        page,
        limit,
      })

      return res.status(200).json({
        success: true,
        ...result,
      })
    } catch (error) {
      next(error)
    }
  },

  async getExpenseById(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10)
      if (isNaN(id)) throw ApiError.badRequest('Invalid expense ID')

      const expense = await ExpenseModel.findByIdAndUser(id, req.user.id)
      if (!expense) throw ApiError.notFound('Expense not found')

      return res.status(200).json({
        success: true,
        expense,
      })
    } catch (error) {
      next(error)
    }
  },

  async createExpense(req, res, next) {
    try {
      const { amount, categoryId, description, expenseDate } = req.body

      // Verify category belongs to user
      const category = await CategoryModel.findByIdAndUser(categoryId, req.user.id)
      if (!category) {
        throw ApiError.badRequest('Invalid category selected or does not belong to you')
      }

      const expense = await ExpenseModel.create({
        userId: req.user.id,
        categoryId,
        amount,
        description,
        expenseDate,
      })

      return res.status(201).json({
        success: true,
        message: 'Expense created successfully',
        expense: {
          ...expense,
          category_name: category.name,
          category_color: category.color,
          category_icon: category.icon,
        },
      })
    } catch (error) {
      next(error)
    }
  },

  async updateExpense(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10)
      if (isNaN(id)) throw ApiError.badRequest('Invalid expense ID')

      const existing = await ExpenseModel.findByIdAndUser(id, req.user.id)
      if (!existing) throw ApiError.notFound('Expense not found')

      const { amount, categoryId, description, expenseDate } = req.body

      if (categoryId) {
        const category = await CategoryModel.findByIdAndUser(categoryId, req.user.id)
        if (!category) {
          throw ApiError.badRequest('Invalid category selected or does not belong to you')
        }
      }

      const updated = await ExpenseModel.update(id, req.user.id, {
        amount,
        categoryId,
        description,
        expenseDate,
      })

      return res.status(200).json({
        success: true,
        message: 'Expense updated successfully',
        expense: updated,
      })
    } catch (error) {
      next(error)
    }
  },

  async deleteExpense(req, res, next) {
    try {
      const id = parseInt(req.params.id, 10)
      if (isNaN(id)) throw ApiError.badRequest('Invalid expense ID')

      const deleted = await ExpenseModel.delete(id, req.user.id)
      if (!deleted) throw ApiError.notFound('Expense not found')

      return res.status(200).json({
        success: true,
        message: 'Expense deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  },
}

export default ExpenseController
