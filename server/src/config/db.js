import pg from 'pg'
import { env } from './env.js'

const { Pool } = pg

let postgresReady = false

const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 4000,
})

pool.on('error', error => {
  console.error('PostgreSQL pool background error:', error.message)
})

export const isPostgresAvailable = () => postgresReady

export const query = (text, params = []) => {
  return pool.query(text, params)
}

export const checkDatabaseConnection = async () => {
  try {
    const result = await pool.query(`
      SELECT NOW() AS current_time,
             CURRENT_DATABASE() AS database_name,
             CURRENT_USER AS database_user
    `)
    postgresReady = true
    return result.rows[0]
  } catch (err) {
    postgresReady = false
    throw err
  }
}

export const closeDatabase = async () => {
  try {
    await pool.end()
  } catch (err) {
    // Ignore shutdown errors
  }
}

export default pool
