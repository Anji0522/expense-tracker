import pg from 'pg'
import { env } from './env.js'

const { Pool } = pg

const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

pool.on('error', error => {
  console.error('Unexpected PostgreSQL pool error:', error.message)
})

export const query = (text, params = []) => {
  return pool.query(text, params)
}

export const checkDatabaseConnection = async () => {
  const result = await pool.query(`
    SELECT NOW() AS current_time,
           CURRENT_DATABASE() AS database_name,
           CURRENT_USER AS database_user
  `)
  return result.rows[0]
}

export const closeDatabase = async () => {
  await pool.end()
}

export default pool
