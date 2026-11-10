import { z } from 'zod'

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be at most 80 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address')
    .max(254, 'Email must be at most 254 characters'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be at most 128 characters'),
  currency: z
    .string()
    .length(3, 'Currency code must be exactly 3 uppercase letters')
    .regex(/^[A-Z]{3}$/, 'Currency must be 3 uppercase letters')
    .optional()
    .default('INR'),
})

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
})

export const updateCurrencySchema = z.object({
  currency: z
    .string({ required_error: 'Currency is required' })
    .length(3, 'Currency code must be exactly 3 uppercase letters')
    .regex(/^[A-Z]{3}$/, 'Currency must be 3 uppercase letters'),
})
