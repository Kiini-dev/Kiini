const bcrypt = require('bcryptjs');

const password = 'password123';

bcrypt.hash(password, 10).then(hash => {
  console.log('Hashed password:');
  console.log(hash);
  console.log('\nSQL UPDATE:');
  console.log(`UPDATE users SET passwordHash = '${hash}' WHERE email = 'info@kiini.africa';`);
  process.exit(0);
});
