import pool, { closeDatabase } from '../config/db.js'

const testDatabase = async () => {
  const client = await pool.connect()
  try {
    console.log('\nConnecting to Neon PostgreSQL...\n')
    await client.query('BEGIN')

    // 1. Check PostgreSQL version
    const versionResult = await client.query('SELECT VERSION() AS version')
    console.log('1. PostgreSQL connection: SUCCESS')
    console.log(versionResult.rows[0].version)

    // 2. Check database name
    const databaseResult = await client.query(
      'SELECT CURRENT_DATABASE() AS database_name',
    )
    console.log('\n2. Database:', databaseResult.rows[0].database_name)

    // 3. Check tables
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)
    console.log('\n3. Database tables:')
    tablesResult.rows.forEach(table => {
      console.log('-', table.table_name)
    })

    // 4. Check default categories
    const categoriesResult = await client.query(
      'SELECT COUNT(*) FROM default_categories',
    )
    console.log('\n4. Default categories:', categoriesResult.rows[0].count)

    // 5. Test inserting a temporary user
    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email`,
      [
        'Database Test User',
        `db-test-${Date.now()}@example.com`,
        'temporary-test-hash',
      ],
    )
    const user = userResult.rows[0]
    console.log('\n5. User INSERT: SUCCESS')

    // 6. Test category insertion
    const categoryResult = await client.query(
      `INSERT INTO categories (user_id, name, color, icon)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [user.id, 'Test Food', '#F97316', 'utensils'],
    )
    const categoryId = categoryResult.rows[0].id
    console.log('6. Category INSERT: SUCCESS')

    // 7. Test expense insertion
    await client.query(
      `INSERT INTO expenses (user_id, category_id, amount, description, expense_date)
       VALUES ($1, $2, $3, $4, CURRENT_DATE)`,
      [user.id, categoryId, 250, 'Database connection test'],
    )
    console.log('7. Expense INSERT: SUCCESS')

    // 8. Test budget insertion
    const budgetResult = await client.query(
      `INSERT INTO budgets (user_id, category_id, month, limit_amount)
       VALUES (
         $1,
         $2,
         DATE_TRUNC('month', CURRENT_DATE)::DATE,
         $3
       )
       RETURNING id`,
      [user.id, categoryId, 5000],
    )
    console.log('8. Budget INSERT: SUCCESS')

    // 9. Verify inserted data
    const verifyResult = await client.query(
      `SELECT u.name, c.name AS category, e.amount, b.limit_amount
       FROM users u
       JOIN categories c ON c.user_id = u.id
       JOIN expenses e ON e.user_id = u.id
       JOIN budgets b ON b.user_id = u.id AND b.category_id = c.id
       WHERE u.id = $1`,
      [user.id],
    )
    console.log('\n9. Verified database record:')
    console.table(verifyResult.rows)

    // All test records are temporary.
    await client.query('ROLLBACK')
    console.log('\n10. Test records rolled back successfully.')
    console.log('\nDATABASE TEST PASSED!')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('\nDATABASE TEST FAILED:')
    console.error(error.message)
    process.exitCode = 1
  } finally {
    client.release()
    await closeDatabase()
  }
}

testDatabase()
