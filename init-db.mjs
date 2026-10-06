import mysql from 'mysql2/promise';

const pool = await mysql.createPool({
  host: 'db',
  port: 3306,
  user: 'kiini_user',
  password: 'tjwzT9pW;NGYq1QxSq0B',
  database: 'kiini-one-hub-total-control'
});

const connection = await pool.getConnection();

try {
  // Create migrations table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS \`__drizzle_migrations\` (
      id INT PRIMARY KEY AUTO_INCREMENT,
      hash TEXT NOT NULL,
      created_at BIGINT
    )
  `);
  console.log('✅ Migrations table created');

  // Show tables to verify
  const [tables] = await connection.execute('SHOW TABLES');
  console.log('📋 Database tables:', tables.length > 0 ? 'Some tables exist' : 'No tables');
} catch (err) {
  console.error('❌ Error:', err.message);
} finally {
  await connection.end();
  await pool.end();
}
