import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'localhost', port: 3307,
  user: 'kiini_user', password: 'tjwzT9pW;NGYq1QxSq0B',
  database: 'kiini-one-hub-total-control'
});
const [rows] = await conn.query('SHOW TABLES');
console.log('Tables:', rows.map(r => Object.values(r)[0]).sort().join(', '));

// Check columns of key tables
for (const tbl of ['invoices', 'clients', 'services', 'invoiceItems']) {
  try {
    const [cols] = await conn.query(`SHOW COLUMNS FROM \`${tbl}\``);
    console.log(`\n${tbl} columns: ${cols.map(c => c.Field).join(', ')}`);
  } catch (e) {
    console.log(`\n${tbl}: MISSING - ${e.message}`);
  }
}
await conn.end();
