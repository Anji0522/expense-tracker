import CategoryModel from '../models/category.model.js'
import ApiError from '../utils/ApiError.js'

export const CategoryController = {
  async listCategories(req, res, next) {
    try {
      const categories = await CategoryModel.findByUserId(req.user.id)
      return res.status(200).json({
        success: true,
        count: categories.length,
        categories,
      })
    } catch (error) {
      next(error)
    }
  },

  async createCategory(req, res, next) {
    try {
      const { name, color, icon } = req.body
      const category = await CategoryModel.create({
        userId: req.user.id,
        name,
        color,
        icon,
      })
      return res.status(201).json({
        success: true,
        message: 'Category created successfully',
        category,
      })
    } catch (error) {
      if (error.code === '23505') {
        return next(ApiError.conflict('Category with this name already exists'))
      }
      next(error)
    }
  },

  async updateCategory(req, res, next) {
    try {
      const categoryId = parseInt(req.params.id, 10)
      if (isNaN(categoryId)) {
        throw ApiError.badRequest('Invalid category ID')
      }

      const existing = await CategoryModel.findByIdAndUser(categoryId, req.user.id)
      if (!existing) {
        throw ApiError.notFound('Category not found')
      }

      const { name, color, icon } = req.body
      const updated = await CategoryModel.update(categoryId, req.user.id, {
        name,
        color,
        icon,
      })

      return res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        category: updated,
      })
    } catch (error) {
      if (error.code === '23505') {
        return next(ApiError.conflict('Category with this name already exists'))
      }
      next(error)
    }
  },

  async deleteCategory(req, res, next) {
    try {
      const categoryId = parseInt(req.params.id, 10)
      if (isNaN(categoryId)) {
        throw ApiError.badRequest('Invalid category ID')
      }

      const deleted = await CategoryModel.delete(categoryId, req.user.id)
      if (!deleted) {
        throw ApiError.notFound('Category not found')
      }

      return res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
      })
    } catch (error) {
      next(error)
    }
  },
}

export default CategoryController
