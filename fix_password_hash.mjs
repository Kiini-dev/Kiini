import mysql from 'mysql2/promise';
import bcryptjs from 'bcryptjs';

async function updatePassword() {
  const connection = await mysql.createConnection({
    host: 'db',
    user: 'kiini_user',
    password: 'tjwzT9pW;NGYq1QxSq0B',
    database: 'kiini-one-hub-total-control',
  });

  try {
    // Generate correct hash
    const password = 'Kiinis@@21';
    const hash = await bcryptjs.hash(password, 10);
    console.log('Generated hash:', hash);

    // Verify immediately
    const matches = await bcryptjs.compare(password, hash);
    console.log('Hash matches password:', matches);

    // Update database
    const query = 'UPDATE users SET passwordHash = ? WHERE email = ?';
    const [result] = await connection.execute(query, [hash, 'info@kiini.africa']);
    console.log('Update result:', result);

    // Verify
    const [rows] = await connection.execute(
      'SELECT email, CHAR_LENGTH(passwordHash) as hashLen FROM users WHERE email = ?',
      ['info@kiini.africa']
    );
    console.log('Stored hash info:', rows[0]);
  } finally {
    await connection.end();
  }
}

updatePassword().catch(console.error);
