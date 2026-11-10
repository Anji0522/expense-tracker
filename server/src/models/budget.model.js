import { query } from '../config/db.js'

export const BudgetModel = {
  async findByUserAndMonth(userId, monthDate) {
    // monthDate format: 'YYYY-MM-01'
    const result = await query(
      `SELECT b.id, b.user_id, b.category_id, b.month, b.limit_amount,
              c.name AS category_name, c.color AS category_color, c.icon AS category_icon,
              COALESCE(SUM(e.amount), 0)::NUMERIC(12, 2) AS spent_amount,
              (b.limit_amount - COALESCE(SUM(e.amount), 0))::NUMERIC(12, 2) AS remaining_amount,
              CASE
                WHEN b.limit_amount > 0 THEN
                  ROUND((COALESCE(SUM(e.amount), 0) / b.limit_amount) * 100, 1)
                ELSE 0
              END AS percentage_spent
       FROM budgets b
       JOIN categories c ON c.id = b.category_id AND c.user_id = b.user_id
       LEFT JOIN expenses e ON e.category_id = b.category_id 
                            AND e.user_id = b.user_id 
                            AND e.expense_date >= b.month 
                            AND e.expense_date < (b.month + INTERVAL '1 month')
       WHERE b.user_id = $1 AND b.month = $2
       GROUP BY b.id, c.name, c.color, c.icon
       ORDER BY percentage_spent DESC`,
      [userId, monthDate]
    )
    return result.rows
  },

  async upsert({ userId, categoryId, month, limitAmount }) {
    const result = await query(
      `INSERT INTO budgets (user_id, category_id, month, limit_amount)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, category_id, month)
       DO UPDATE SET limit_amount = EXCLUDED.limit_amount, updated_at = NOW()
       RETURNING id, user_id, category_id, month, limit_amount, created_at, updated_at`,
      [userId, categoryId, month, limitAmount]
    )
    return result.rows[0]
  },

  async delete(id, userId) {
    const result = await query(
      `DELETE FROM budgets
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    )
    return result.rows.length > 0
  },
}

export default BudgetModel
