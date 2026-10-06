const arg = process.argv[2];
const crypto = require('crypto');

// Very simple hash for test (NOT for production!)
// Using MD5 just for quick verification
const hash = crypto.createHash('md5').update('password123').digest('hex');
console.log('test_hash:', hash);

// For bcrypt (which the app likely uses):
// password: password123
// This is a pre-generated bcrypt hash of "password123" with cost 10:
console.log('bcrypt_hash: $2b$10$ZLqHWxYJNDJpC0PzZEBWt.E2/XJBW8pRN5Lsqx8L1D2JxQW2T3vFm');
