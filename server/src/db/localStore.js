import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_FILE = path.resolve(__dirname, 'local-db.json')

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Food', color: '#F97316', icon: 'utensils' },
  { id: 2, name: 'Shopping', color: '#EC4899', icon: 'shopping-bag' },
  { id: 3, name: 'Travel', color: '#3B82F6', icon: 'plane' },
  { id: 4, name: 'Transportation', color: '#06B6D4', icon: 'car' },
  { id: 5, name: 'Bills & Utilities', color: '#EAB308', icon: 'receipt' },
  { id: 6, name: 'Education', color: '#8B5CF6', icon: 'graduation-cap' },
  { id: 7, name: 'Healthcare', color: '#EF4444', icon: 'heart-pulse' },
  { id: 8, name: 'Entertainment', color: '#A855F7', icon: 'clapperboard' },
  { id: 9, name: 'Groceries', color: '#22C55E', icon: 'shopping-cart' },
  { id: 10, name: 'Personal Care', color: '#14B8A6', icon: 'sparkles' },
  { id: 11, name: 'Rent', color: '#64748B', icon: 'house' },
  { id: 12, name: 'Other', color: '#6366F1', icon: 'wallet' },
]

const initialData = {
  users: [],
  categories: [],
  expenses: [],
  budgets: [],
  sequences: {
    users: 1,
    categories: 1,
    expenses: 1,
    budgets: 1,
  },
}

const readData = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeData(initialData)
      return initialData
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    console.error('Failed to read local-db.json, recreating:', err.message)
    writeData(initialData)
    return initialData
  }
}

const writeData = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8')
  } catch (err) {
    console.error('Failed to write local-db.json:', err.message)
  }
}

export const localStore = {
  // Users
  createUser({ name, email, passwordHash, currency = 'INR' }) {
    const data = readData()
    const id = data.sequences.users++
    const user = {
      id,
      name,
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      currency,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    data.users.push(user)

    // Seed user's categories
    DEFAULT_CATEGORIES.forEach((cat) => {
      data.categories.push({
        id: data.sequences.categories++,
        user_id: id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    })

    writeData(data)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      created_at: user.created_at,
    }
  },

  findUserByEmail(email) {
    const data = readData()
    return data.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null
  },

  findUserById(id) {
    const data = readData()
    const user = data.users.find((u) => u.id === Number(id))
    if (!user) return null
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }
  },

  updateUserCurrency(id, currency) {
    const data = readData()
    const user = data.users.find((u) => u.id === Number(id))
    if (!user) return null
    user.currency = currency
    user.updated_at = new Date().toISOString()
    writeData(data)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      updated_at: user.updated_at,
    }
  },

  // Categories
  getCategories(userId) {
    const data = readData()
    const userCats = data.categories.filter((c) => c.user_id === Number(userId))
    return userCats.map((cat) => {
      const expenses = data.expenses.filter(
        (e) => e.user_id === Number(userId) && e.category_id === cat.id
      )
      const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
      return {
        ...cat,
        total_spent: totalSpent.toFixed(2),
        transaction_count: expenses.length,
      }
    })
  },

  getCategoryById(id, userId) {
    const data = readData()
    return (
      data.categories.find(
        (c) => c.id === Number(id) && c.user_id === Number(userId)
      ) || null
    )
  },

  createCategory({ userId, name, color = '#6366F1', icon = 'wallet' }) {
    const data = readData()
    const existing = data.categories.find(
      (c) => c.user_id === Number(userId) && c.name.toLowerCase() === name.toLowerCase().trim()
    )
    if (existing) {
      const err = new Error('Category with this name already exists')
      err.code = '23505'
      throw err
    }

    const cat = {
      id: data.sequences.categories++,
      user_id: Number(userId),
      name: name.trim(),
      color,
      icon,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    data.categories.push(cat)
    writeData(data)
    return cat
  },

  updateCategory(id, userId, { name, color, icon }) {
    const data = readData()
    const cat = data.categories.find(
      (c) => c.id === Number(id) && c.user_id === Number(userId)
    )
    if (!cat) return null
    if (name) cat.name = name.trim()
    if (color) cat.color = color
    if (icon) cat.icon = icon
    cat.updated_at = new Date().toISOString()
    writeData(data)
    return cat
  },

  deleteCategory(id, userId) {
    const data = readData()
    const initialLen = data.categories.length
    data.categories = data.categories.filter(
      (c) => !(c.id === Number(id) && c.user_id === Number(userId))
    )
    if (data.categories.length !== initialLen) {
      // Set expenses category_id to null
      data.expenses.forEach((e) => {
        if (e.category_id === Number(id) && e.user_id === Number(userId)) {
          e.category_id = null
        }
      })
      writeData(data)
      return true
    }
    return false
  },

  // Expenses
  getExpenses(userId, { search, categoryId, startDate, endDate, sortBy = 'expense_date', order = 'DESC', page = 1, limit = 10 } = {}) {
    const data = readData()
    let items = data.expenses.filter((e) => e.user_id === Number(userId))

    if (search && search.trim()) {
      const q = search.toLowerCase().trim()
      items = items.filter((e) => (e.description || '').toLowerCase().includes(q))
    }

    if (categoryId) {
      items = items.filter((e) => e.category_id === Number(categoryId))
    }

    if (startDate) {
      items = items.filter((e) => e.expense_date >= startDate)
    }

    if (endDate) {
      items = items.filter((e) => e.expense_date <= endDate)
    }

    const total = items.length

    // Sort
    items.sort((a, b) => {
      let valA = a[sortBy] || a.expense_date
      let valB = b[sortBy] || b.expense_date
      if (sortBy === 'amount') {
        valA = Number(valA)
        valB = Number(valB)
      }
      if (order.toUpperCase() === 'ASC') {
        return valA > valB ? 1 : -1
      }
      return valA < valB ? 1 : -1
    })

    const pageNum = Math.max(1, Number(page))
    const limitNum = Math.max(1, Number(limit))
    const offset = (pageNum - 1) * limitNum
    const paginated = items.slice(offset, offset + limitNum)

    // Populate category info
    const populated = paginated.map((exp) => {
      const cat = data.categories.find((c) => c.id === exp.category_id)
      return {
        ...exp,
        category_name: cat?.name || 'Uncategorized',
        category_color: cat?.color || '#6366F1',
        category_icon: cat?.icon || 'wallet',
      }
    })

    return {
      expenses: populated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    }
  },

  getExpenseById(id, userId) {
    const data = readData()
    const exp = data.expenses.find(
      (e) => e.id === Number(id) && e.user_id === Number(userId)
    )
    if (!exp) return null
    const cat = data.categories.find((c) => c.id === exp.category_id)
    return {
      ...exp,
      category_name: cat?.name || 'Uncategorized',
      category_color: cat?.color || '#6366F1',
      category_icon: cat?.icon || 'wallet',
    }
  },

  createExpense({ userId, categoryId, amount, description, expenseDate }) {
    const data = readData()
    const cat = data.categories.find((c) => c.id === Number(categoryId))
    const exp = {
      id: data.sequences.expenses++,
      user_id: Number(userId),
      category_id: Number(categoryId),
      amount: Number(amount),
      description: description || null,
      expense_date: expenseDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category_name: cat?.name || 'Uncategorized',
      category_color: cat?.color || '#6366F1',
      category_icon: cat?.icon || 'wallet',
    }
    data.expenses.push(exp)
    writeData(data)
    return exp
  },

  updateExpense(id, userId, { categoryId, amount, description, expenseDate }) {
    const data = readData()
    const exp = data.expenses.find(
      (e) => e.id === Number(id) && e.user_id === Number(userId)
    )
    if (!exp) return null
    if (categoryId !== undefined) exp.category_id = Number(categoryId)
    if (amount !== undefined) exp.amount = Number(amount)
    if (description !== undefined) exp.description = description
    if (expenseDate !== undefined) exp.expense_date = expenseDate
    exp.updated_at = new Date().toISOString()

    const cat = data.categories.find((c) => c.id === exp.category_id)
    exp.category_name = cat?.name || 'Uncategorized'
    exp.category_color = cat?.color || '#6366F1'
    exp.category_icon = cat?.icon || 'wallet'

    writeData(data)
    return exp
  },

  deleteExpense(id, userId) {
    const data = readData()
    const len = data.expenses.length
    data.expenses = data.expenses.filter(
      (e) => !(e.id === Number(id) && e.user_id === Number(userId))
    )
    if (data.expenses.length !== len) {
      writeData(data)
      return true
    }
    return false
  },

  // Budgets
  getBudgets(userId, monthDate) {
    const data = readData()
    const userBudgets = data.budgets.filter(
      (b) => b.user_id === Number(userId) && b.month === monthDate
    )

    return userBudgets.map((b) => {
      const cat = data.categories.find((c) => c.id === b.category_id)
      const monthPrefix = monthDate.substring(0, 7) // 'YYYY-MM'
      const spent = data.expenses
        .filter(
          (e) =>
            e.user_id === Number(userId) &&
            e.category_id === b.category_id &&
            e.expense_date.startsWith(monthPrefix)
        )
        .reduce((sum, e) => sum + Number(e.amount), 0)

      const remaining = Number(b.limit_amount) - spent
      const pct = b.limit_amount > 0 ? Math.round((spent / Number(b.limit_amount)) * 100) : 0

      return {
        id: b.id,
        user_id: b.user_id,
        category_id: b.category_id,
        month: b.month,
        limit_amount: b.limit_amount,
        category_name: cat?.name || 'Uncategorized',
        category_color: cat?.color || '#6366F1',
        category_icon: cat?.icon || 'wallet',
        spent_amount: spent.toFixed(2),
        remaining_amount: remaining.toFixed(2),
        percentage_spent: pct,
      }
    })
  },

  upsertBudget({ userId, categoryId, month, limitAmount }) {
    const data = readData()
    let budget = data.budgets.find(
      (b) =>
        b.user_id === Number(userId) &&
        b.category_id === Number(categoryId) &&
        b.month === month
    )

    if (budget) {
      budget.limit_amount = Number(limitAmount)
      budget.updated_at = new Date().toISOString()
    } else {
      budget = {
        id: data.sequences.budgets++,
        user_id: Number(userId),
        category_id: Number(categoryId),
        month,
        limit_amount: Number(limitAmount),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      data.budgets.push(budget)
    }

    writeData(data)
    return budget
  },

  deleteBudget(id, userId) {
    const data = readData()
    const len = data.budgets.length
    data.budgets = data.budgets.filter(
      (b) => !(b.id === Number(id) && b.user_id === Number(userId))
    )
    if (data.budgets.length !== len) {
      writeData(data)
      return true
    }
    return false
  },

  // Analytics Helpers
  getAnalyticsSummary(userId) {
    const data = readData()
    const userExpenses = data.expenses.filter((e) => e.user_id === Number(userId))
    const now = new Date()
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthPrefix = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`

    const totalSpent = userExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const thisMonthExpenses = userExpenses.filter((e) => e.expense_date.startsWith(currentMonthPrefix))
    const lastMonthExpenses = userExpenses.filter((e) => e.expense_date.startsWith(lastMonthPrefix))

    const thisMonthSpent = thisMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const lastMonthSpent = lastMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0)

    let monthChangePercentage = 0
    if (lastMonthSpent > 0) {
      monthChangePercentage = Math.round(((thisMonthSpent - lastMonthSpent) / lastMonthSpent) * 100)
    }

    const currentBudgets = data.budgets.filter(
      (b) => b.user_id === Number(userId) && b.month.startsWith(currentMonthPrefix)
    )
    const currentBudget = currentBudgets.reduce((sum, b) => sum + Number(b.limit_amount), 0)

    return {
      totalSpent,
      totalTransactions: userExpenses.length,
      thisMonthSpent,
      thisMonthTransactions: thisMonthExpenses.length,
      lastMonthSpent,
      monthChangePercentage,
      currentBudget,
      budgetRemaining: currentBudget > 0 ? currentBudget - thisMonthSpent : 0,
    }
  },

  getCategorySummary(userId, { startDate, endDate } = {}) {
    const data = readData()
    let expenses = data.expenses.filter((e) => e.user_id === Number(userId))
    if (startDate) expenses = expenses.filter((e) => e.expense_date >= startDate)
    if (endDate) expenses = expenses.filter((e) => e.expense_date <= endDate)

    const map = new Map()
    expenses.forEach((e) => {
      const cat = data.categories.find((c) => c.id === e.category_id)
      const name = cat?.name || 'Uncategorized'
      const color = cat?.color || '#6366F1'
      const icon = cat?.icon || 'wallet'
      const current = map.get(name) || { id: e.category_id, name, color, icon, amount: 0, count: 0 }
      current.amount += Number(e.amount)
      current.count += 1
      map.set(name, current)
    })

    const list = Array.from(map.values())
    const totalAmount = list.reduce((sum, c) => sum + c.amount, 0)
    const categories = list.map((c) => ({
      ...c,
      percentage: totalAmount > 0 ? Math.round((c.amount / totalAmount) * 100) : 0,
    }))

    return { totalAmount, categories }
  },

  getMonthlyTrend(userId) {
    const data = readData()
    const expenses = data.expenses.filter((e) => e.user_id === Number(userId))
    const map = new Map()

    expenses.forEach((e) => {
      const month = e.expense_date.substring(0, 7) // 'YYYY-MM'
      const current = map.get(month) || { month, total_amount: 0, count: 0 }
      current.total_amount += Number(e.amount)
      current.count += 1
      map.set(month, current)
    })

    const trend = Array.from(map.values())
      .sort((a, b) => (a.month > b.month ? 1 : -1))
      .map((item) => {
        const [y, m] = item.month.split('-')
        const d = new Date(y, Number(m) - 1, 1)
        const label = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(d)
        return {
          month: item.month,
          label,
          total_amount: item.total_amount,
          count: item.count,
        }
      })

    return trend
  },

  getDailyHeatmap(userId) {
    const data = readData()
    const expenses = data.expenses.filter((e) => e.user_id === Number(userId))
    const map = new Map()

    expenses.forEach((e) => {
      const date = e.expense_date
      const current = map.get(date) || { date, amount: 0, count: 0 }
      current.amount += Number(e.amount)
      current.count += 1
      map.set(date, current)
    })

    return Array.from(map.values()).sort((a, b) => (a.date > b.date ? 1 : -1))
  },

  getMonthlyReport(userId, month) {
    const data = readData()
    const monthPrefix = month.substring(0, 7)
    const monthExpenses = data.expenses.filter(
      (e) => e.user_id === Number(userId) && e.expense_date.startsWith(monthPrefix)
    )

    const totalSpent = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
    const maxExpense = monthExpenses.reduce((max, e) => Math.max(max, Number(e.amount)), 0)
    const avgExpense = monthExpenses.length > 0 ? totalSpent / monthExpenses.length : 0

    const catMap = new Map()
    monthExpenses.forEach((e) => {
      const cat = data.categories.find((c) => c.id === e.category_id)
      const name = cat?.name || 'Uncategorized'
      const color = cat?.color || '#6366F1'
      const cur = catMap.get(name) || { id: e.category_id, name, color, spent: 0, count: 0 }
      cur.spent += Number(e.amount)
      cur.count += 1
      catMap.set(name, cur)
    })

    const topExpenses = [...monthExpenses]
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 5)
      .map((e) => {
        const cat = data.categories.find((c) => c.id === e.category_id)
        return {
          id: e.id,
          amount: e.amount,
          description: e.description,
          expense_date: e.expense_date,
          category_name: cat?.name || 'Uncategorized',
          category_color: cat?.color || '#6366F1',
        }
      })

    return {
      success: true,
      month,
      summary: {
        total_spent: totalSpent.toFixed(2),
        total_count: monthExpenses.length,
        avg_expense: avgExpense.toFixed(2),
        max_expense: maxExpense.toFixed(2),
      },
      categoryBreakdown: Array.from(catMap.values()),
      topExpenses,
    }
  },

  exportCsvRows(userId, { startDate, endDate, categoryId } = {}) {
    const data = readData()
    let items = data.expenses.filter((e) => e.user_id === Number(userId))

    if (startDate) items = items.filter((e) => e.expense_date >= startDate)
    if (endDate) items = items.filter((e) => e.expense_date <= endDate)
    if (categoryId) items = items.filter((e) => e.category_id === Number(categoryId))

    items.sort((a, b) => (a.expense_date < b.expense_date ? 1 : -1))

    return items.map((e) => {
      const cat = data.categories.find((c) => c.id === e.category_id)
      return {
        id: e.id,
        expense_date: e.expense_date,
        category: cat?.name || 'Uncategorized',
        amount: e.amount,
        description: e.description || '',
      }
    })
  },
}

export default localStore
