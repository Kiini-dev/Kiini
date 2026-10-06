import bcrypt from 'bcryptjs';

const password = "password123";
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);

console.log("BCrypt Hash for 'password123':");
console.log(hash);
console.log("");
console.log("Use this to update test users in database with:");
console.log(`UPDATE users SET passwordHash = '${hash}' WHERE email LIKE 'test.%@kiini.local';`);
