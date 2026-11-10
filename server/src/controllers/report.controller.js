import { query } from '../config/db.js'
import generateCsv from '../utils/csv.js'
import ApiError from '../utils/ApiError.js'

export const ReportController = {
  async getMonthlyReport(req, res, next) {
    try {
      const userId = req.user.id
      let { month } = req.query

      if (!month) {
        const now = new Date()
        month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      }

      const monthStart = `${month}-01`

      // Total spent and count in month
      const totalRes = await query(
        `SELECT COALESCE(SUM(amount), 0)::NUMERIC(12, 2) AS total_spent,
                COUNT(*)::INT AS total_count,
                COALESCE(AVG(amount), 0)::NUMERIC(12, 2) AS avg_expense,
                COALESCE(MAX(amount), 0)::NUMERIC(12, 2) AS max_expense
         FROM expenses
         WHERE user_id = $1 
           AND expense_date >= $2 
           AND expense_date < ($2::DATE + INTERVAL '1 month')`,
        [userId, monthStart]
      )

      // Category breakdown
      const categoryRes = await query(
        `SELECT c.id, c.name, c.color, c.icon,
                COALESCE(SUM(e.amount), 0)::NUMERIC(12, 2) AS spent,
                COUNT(e.id)::INT AS count
         FROM categories c
         JOIN expenses e ON e.category_id = c.id AND e.user_id = c.user_id
         WHERE c.user_id = $1 
           AND e.expense_date >= $2 
           AND e.expense_date < ($2::DATE + INTERVAL '1 month')
         GROUP BY c.id
         ORDER BY spent DESC`,
        [userId, monthStart]
      )

      // Top 5 largest expenses
      const topExpensesRes = await query(
        `SELECT e.id, e.amount, e.description, e.expense_date,
                c.name AS category_name, c.color AS category_color
         FROM expenses e
         LEFT JOIN categories c ON c.id = e.category_id
         WHERE e.user_id = $1 
           AND e.expense_date >= $2 
           AND e.expense_date < ($2::DATE + INTERVAL '1 month')
         ORDER BY e.amount DESC
         LIMIT 5`,
        [userId, monthStart]
      )

      return res.status(200).json({
        success: true,
        month,
        summary: totalRes.rows[0],
        categoryBreakdown: categoryRes.rows,
        topExpenses: topExpensesRes.rows,
      })
    } catch (error) {
      next(error)
    }
  },

  async exportCsv(req, res, next) {
    try {
      const userId = req.user.id
      const { startDate, endDate, categoryId } = req.query

      const conditions = ['e.user_id = $1']
      const params = [userId]
      let index = 2

      if (startDate) {
        conditions.push(`e.expense_date >= $${index++}`)
        params.push(startDate)
      }
      if (endDate) {
        conditions.push(`e.expense_date <= $${index++}`)
        params.push(endDate)
      }
      if (categoryId) {
        conditions.push(`e.category_id = $${index++}`)
        params.push(categoryId)
      }

      const result = await query(
        `SELECT e.id, e.expense_date, e.amount, e.description,
                c.name AS category
         FROM expenses e
         LEFT JOIN categories c ON c.id = e.category_id
         WHERE ${conditions.join(' AND ')}
         ORDER BY e.expense_date DESC, e.id DESC`,
        params
      )

      const headers = [
        { key: 'id', label: 'ID' },
        { key: 'expense_date', label: 'Date' },
        { key: 'category', label: 'Category' },
        { key: 'amount', label: 'Amount' },
        { key: 'description', label: 'Description' },
      ]

      const csvContent = generateCsv(headers, result.rows)

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename=expenses-${Date.now()}.csv`)
      return res.status(200).send(csvContent)
    } catch (error) {
      next(error)
    }
  },
}

export default ReportController
