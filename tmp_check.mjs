import mysql from 'mysql2/promise';
(async () => {
  console.log('DATABASE_URL=', process.env.DATABASE_URL);
  try {
    const conn = await mysql.createConnection(process.env.DATABASE_URL);
    const [rows] = await conn.execute("SHOW COLUMNS FROM payments LIKE 'organizationId'");
    console.log('ROWS=', JSON.stringify(rows));
    await conn.end();
  } catch (e) {
    console.error('ERR=', e.message);
    process.exit(1);
  }
})();
