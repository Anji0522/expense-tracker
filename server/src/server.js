import app from './app.js'
import { env } from './config/env.js'
import {
  checkDatabaseConnection,
  closeDatabase,
} from './config/db.js'

const startServer = async () => {
  try {
    // Verify the database before accepting requests.
    const databaseInfo = await checkDatabaseConnection()
    console.log('PostgreSQL connected successfully')
    console.log(`Database: ${databaseInfo.database_name}`)

    const server = app.listen(env.port, () => {
      console.log('')
      console.log('====================================')
      console.log('Expense Tracker API started')
      console.log(`Environment: ${env.nodeEnv}`)
      console.log(`Port: ${env.port}`)
      console.log(`API: http://localhost:${env.port}`)
      console.log(`Health: http://localhost:${env.port}/api/health`)
      console.log('====================================')
    })

    let isShuttingDown = false

    const shutdown = signal => {
      if (isShuttingDown) return
      isShuttingDown = true

      console.log(`\n${signal} received. Shutting down...`)
      server.close(async error => {
        if (error) {
          console.error('HTTP server shutdown error:', error.message)
          process.exitCode = 1
        }

        try {
          await closeDatabase()
          console.log('Database connections closed.')
        } catch (databaseError) {
          console.error(
            'Database shutdown error:',
            databaseError.message,
          )
          process.exitCode = 1
        }

        console.log('Server shutdown complete.')
      })
    }

    process.once('SIGINT', () => shutdown('SIGINT'))
    process.once('SIGTERM', () => shutdown('SIGTERM'))
  } catch (error) {
    console.error('Failed to start Expense Tracker API:')
    console.error(error.message)
    try {
      await closeDatabase()
    } catch (closeError) {
      console.error('Database cleanup failed:', closeError.message)
    }
    process.exitCode = 1
  }
}

startServer()
