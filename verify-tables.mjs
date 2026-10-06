import mysql from 'mysql2/promise';

const pool = await mysql.createPool({
  host: 'kiini-one-hub-total-control_db',
  user: 'root',
  password: 'admin123',
  database: 'kiini-one-hub-total-control',
  port: 3306,
});

try {
  // Check if tables exist
  const [result1] = await pool.query('SHOW TABLES LIKE "budgetAllocations"');
  console.log('budgetAllocations:', result1.length > 0 ? 'EXISTS' : 'MISSING');
  
  const [result2] = await pool.query('SHOW TABLES LIKE "lpos"');
  console.log('lpos:', result2.length > 0 ? 'EXISTS' : 'MISSING');
  
  const [result3] = await pool.query('SHOW TABLES LIKE "lpoLineItems"');
  console.log('lpoLineItems:', result3.length > 0 ? 'EXISTS' : 'MISSING');
  
  // Try to query each table
  try {
    const [data1] = await pool.query('SELECT COUNT(*) as count FROM budgetAllocations');
    console.log('budgetAllocations count:', data1[0].count);
  } catch (e) {
    console.log('budgetAllocations query error:', e.message);
  }
  
  try {
    const [data2] = await pool.query('SELECT COUNT(*) as count FROM lpos');
    console.log('lpos count:', data2[0].count);
  } catch (e) {
    console.log('lpos query error:', e.message);
  }
  
  try {
    const [data3] = await pool.query('SELECT COUNT(*) as count FROM lpoLineItems');
    console.log('lpoLineItems count:', data3[0].count);;
  } catch (e) {
    console.log('lpoLineItems query error:', e.message);
  }
} finally {
  await pool.end();
}