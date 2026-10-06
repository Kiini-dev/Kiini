const mysql = require('mysql2/promise');
const fs = require('fs');

(async () => {
  try {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'kiini-one-hub-total-control'
    });
    
    console.log('Connected to kiini-one-hub-total-control');
    
    const sql = fs.readFileSync('./fix_collation_comprehensive.sql', 'utf8');
    const statements = sql.split(';').filter(s => s.trim() && !s.trim().startsWith('--') && !s.trim().startsWith('USE'));
    
    let count = 0;
    let skipped = 0;
    
    for (const stmt of statements) {
      if (stmt.trim()) {
        try {
          await connection.execute(stmt);
          count++;
          if (count % 10 === 0) console.log(`  Processed ${count} tables...`);
        } catch (e) {
          if (e.message.includes('not exist')) {
            skipped++;
          } else {
            console.error('Error:', e.message);
          }
        }
      }
    }
    
    console.log('\nCollation fix completed!');
    console.log(`  ${count} tables updated to utf8mb4_unicode_ci`);
    console.log(`  ${skipped} tables skipped (not found)`);
    
    // Verify
    const [rows] = await connection.execute(
      'SELECT COUNT(*) as total FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "kiini-one-hub-total-control" AND TABLE_COLLATION = "utf8mb4_unicode_ci"'
    );
    console.log(`  Total tables with utf8mb4_unicode_ci: ${rows[0].total}`);
    
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
