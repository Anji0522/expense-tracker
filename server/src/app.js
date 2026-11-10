import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { env } from './config/env.js'
import apiRoutes from './routes/index.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()

// Allowed frontend origins.
// CLIENT_URL can contain multiple comma-separated URLs.
const allowedOrigins = env.clientUrl
  .split(',')
  .map(origin => origin.trim().replace(/\/$/, ''))
  .filter(Boolean)

app.use(helmet({ crossOriginResourcePolicy: false }))

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true)
      
      // Allow localhost, 127.0.0.1, Vercel deployments, or custom CLIENT_URL
      const isLocal = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      const isVercel = /\.vercel\.app$/.test(new URL(origin).hostname)
      const isAllowed = allowedOrigins.includes(origin)

      if (isLocal || isVercel || isAllowed || env.nodeEnv === 'development') {
        return callback(null, true)
      }
      return callback(null, false)
    },
    credentials: true,
  }),
)

app.use(express.json({ limit: '10kb' }))

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
})

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Expense Tracker API',
  })
})

app.use('/api', apiLimiter, apiRoutes)

// Unknown routes
app.use(notFound)

// Central error handler — keep this last
app.use(errorHandler)

export default app
