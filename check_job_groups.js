const mysql = require('mysql2/promise');

async function checkJobGroups() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'kiini-one-hub-total-control',
      port: 3306,
    });

    const [rows] = await connection.execute(
      'SELECT id, name, minimumGrossSalary, maximumGrossSalary FROM jobGroups ORDER BY id'
    );

    console.log('=== Job Groups in Database ===');
    if (rows.length === 0) {
      console.log('No job groups found!');
    } else {
      rows.forEach(row => {
        console.log(`${row.id}: ${row.name} (${row.minimumGrossSalary} - ${row.maximumGrossSalary})`);
      });
    }

    console.log(`\nTotal: ${rows.length} job groups`);

    // Check if jg-005 exists
    const [result] = await connection.execute(
      'SELECT COUNT(*) as count FROM jobGroups WHERE id = ?',
      ['jg-005']
    );

    console.log(`\njg-005 exists: ${result[0].count > 0 ? 'YES' : 'NO'}`);

    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkJobGroups();
