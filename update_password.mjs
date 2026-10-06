import bcryptjs from 'bcryptjs';

const password = 'password123';

const hash = await bcryptjs.hash(password, 10);
console.log('Hashed password:');
console.log(hash);
console.log('\nSQL UPDATE:');
console.log(`UPDATE users SET passwordHash = '${hash}' WHERE email = 'info@kiini.africa';`);
