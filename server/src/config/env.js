import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const currentDirectory = dirname(fileURLToPath(import.meta.url))
const envFilePath = resolve(currentDirectory, '../../.env')

dotenv.config({ path: envFilePath })

const nodeEnv = process.env.NODE_ENV || 'development'
if (!['development', 'production', 'test'].includes(nodeEnv)) {
  throw new Error('NODE_ENV must be development, production, or test')
}

const port = Number(process.env.PORT || 5000)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be a valid port number')
}

let databaseUrl = process.env.DATABASE_URL?.trim() || ''

if (nodeEnv === 'test' || !databaseUrl || databaseUrl.includes('PASTE_YOUR_NEON')) {
  databaseUrl = 'postgresql://placeholder:placeholder@localhost:5432/expense_tracker'
} else {
  try {
    const parsed = new URL(databaseUrl)
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
      throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL')
    }
  } catch (err) {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL')
  }
}

export const env = {
  port,
  nodeEnv,
  databaseUrl,
  jwtSecret: process.env.JWT_SECRET || 'temporary_secret_for_development_replace_in_production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
}

export default env
