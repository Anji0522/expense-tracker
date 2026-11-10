import { z } from 'zod'

export const createExpenseSchema = z.object({
  amount: z
    .number({ required_error: 'Amount is required' })
    .positive('Amount must be greater than zero')
    .max(100000000, 'Amount must be less than 100,000,000'),
  categoryId: z
    .number({ required_error: 'Category is required' })
    .int('Category ID must be an integer')
    .positive('Invalid Category ID'),
  description: z
    .string()
    .trim()
    .max(200, 'Description cannot exceed 200 characters')
    .optional()
    .nullable(),
  expenseDate: z
    .string({ required_error: 'Expense date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
})

export const updateExpenseSchema = createExpenseSchema.partial()

export const categorySchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code like #6366F1')
    .optional()
    .default('#6366F1'),
  icon: z
    .string()
    .max(30, 'Icon identifier cannot exceed 30 characters')
    .optional()
    .default('wallet'),
})

export const budgetSchema = z.object({
  categoryId: z
    .number({ required_error: 'Category is required' })
    .int()
    .positive(),
  month: z
    .string({ required_error: 'Month is required' })
    .regex(/^\d{4}-\d{2}-01$/, 'Month must be in YYYY-MM-01 format'),
  limitAmount: z
    .number({ required_error: 'Budget limit amount is required' })
    .positive('Budget limit must be greater than zero')
    .max(100000000, 'Limit must be less than 100,000,000'),
})
