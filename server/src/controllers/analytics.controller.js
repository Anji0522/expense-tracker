import { query } from '../config/db.js'

export const AnalyticsController = {
  async getSummary(req, res, next) {
    try {
      const userId = req.user.id

      // Current month date bounds
      const now = new Date()
      const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthStart = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}-01`
      const lastMonthEnd = currentMonthStart

      // Total lifetime expenses
      const totalRes = await query(
        `SELECT COALESCE(SUM(amount), 0)::NUMERIC(12, 2) AS total_amount,
                COUNT(*)::INT AS total_count
         FROM expenses
         WHERE user_id = $1`,
        [userId]
      )

      // Current month expenses
      const thisMonthRes = await query(
        `SELECT COALESCE(SUM(amount), 0)::NUMERIC(12, 2) AS this_month_amount,
                COUNT(*)::INT AS this_month_count
         FROM expenses
         WHERE user_id = $1 AND expense_date >= $2`,
        [userId, currentMonthStart]
      )

      // Last month expenses
      const lastMonthRes = await query(
        `SELECT COALESCE(SUM(amount), 0)::NUMERIC(12, 2) AS last_month_amount
         FROM expenses
         WHERE user_id = $1 AND expense_date >= $2 AND expense_date < $3`,
        [userId, lastMonthStart, lastMonthEnd]
      )

      // Budget limit for current month
      const budgetRes = await query(
        `SELECT COALESCE(SUM(limit_amount), 0)::NUMERIC(12, 2) AS current_budget
         FROM budgets
         WHERE user_id = $1 AND month = $2`,
        [userId, currentMonthStart]
      )

      const totalSpent = Number(totalRes.rows[0].total_amount)
      const thisMonthSpent = Number(thisMonthRes.rows[0].this_month_amount)
      const lastMonthSpent = Number(lastMonthRes.rows[0].last_month_amount)
      const currentBudget = Number(budgetRes.rows[0].current_budget)

      let monthChangePercentage = 0
      if (lastMonthSpent > 0) {
        monthChangePercentage = Math.round(((thisMonthSpent - lastMonthSpent) / lastMonthSpent) * 100)
      }

      return res.status(200).json({
        success: true,
        summary: {
          totalSpent,
          totalTransactions: totalRes.rows[0].total_count,
          thisMonthSpent,
          thisMonthTransactions: thisMonthRes.rows[0].this_month_count,
          lastMonthSpent,
          monthChangePercentage,
          currentBudget,
          budgetRemaining: currentBudget > 0 ? currentBudget - thisMonthSpent : 0,
        },
      })
    } catch (error) {
      next(error)
    }
  },

  async getCategorySummary(req, res, next) {
    try {
      const userId = req.user.id
      const { startDate, endDate } = req.query

      let dateFilter = ''
      const params = [userId]
      let index = 2

      if (startDate) {
        dateFilter += ` AND e.expense_date >= $${index++}`
        params.push(startDate)
      }
      if (endDate) {
        dateFilter += ` AND e.expense_date <= $${index++}`
        params.push(endDate)
      }

      const result = await query(
        `SELECT c.id, c.name, c.color, c.icon,
                COALESCE(SUM(e.amount), 0)::NUMERIC(12, 2) AS amount,
                COUNT(e.id)::INT AS count
         FROM categories c
         JOIN expenses e ON e.category_id = c.id AND e.user_id = c.user_id
         WHERE c.user_id = $1 ${dateFilter}
         GROUP BY c.id
         HAVING SUM(e.amount) > 0
         ORDER BY amount DESC`,
        params
      )

      const totalAmount = result.rows.reduce((sum, r) => sum + Number(r.amount), 0)
      const categories = result.rows.map(cat => ({
        ...cat,
        percentage: totalAmount > 0 ? Math.round((Number(cat.amount) / totalAmount) * 100) : 0,
      }))

      return res.status(200).json({
        success: true,
        totalAmount,
        categories,
      })
    } catch (error) {
      next(error)
    }
  },

  async getMonthlyTrend(req, res, next) {
    try {
      const userId = req.user.id

      const result = await query(
        `SELECT TO_CHAR(DATE_TRUNC('month', expense_date), 'YYYY-MM') AS month,
                TO_CHAR(DATE_TRUNC('month', expense_date), 'Mon YYYY') AS label,
                COALESCE(SUM(amount), 0)::NUMERIC(12, 2) AS total_amount,
                COUNT(*)::INT AS count
         FROM expenses
         WHERE user_id = $1 AND expense_date >= CURRENT_DATE - INTERVAL '6 months'
         GROUP BY DATE_TRUNC('month', expense_date)
         ORDER BY DATE_TRUNC('month', expense_date) ASC`,
        [userId]
      )

      return res.status(200).json({
        success: true,
        trend: result.rows,
      })
    } catch (error) {
      next(error)
    }
  },

  async getDailyHeatmap(req, res, next) {
    try {
      const userId = req.user.id

      const result = await query(
        `SELECT expense_date::TEXT AS date,
                COALESCE(SUM(amount), 0)::NUMERIC(12, 2) AS amount,
                COUNT(*)::INT AS count
         FROM expenses
         WHERE user_id = $1 AND expense_date >= CURRENT_DATE - INTERVAL '90 days'
         GROUP BY expense_date
         ORDER BY expense_date ASC`,
        [userId]
      )

      return res.status(200).json({
        success: true,
        heatmap: result.rows,
      })
    } catch (error) {
      next(error)
    }
  },
}

export default AnalyticsController
