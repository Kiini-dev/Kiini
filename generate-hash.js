import crypto from 'crypto';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 100000;
  const keylen = 32;
  const digest = 'sha256';

  const hash = crypto
    .pbkdf2Sync(password, salt, iterations, keylen, digest)
    .toString('hex');

  return `${salt}:${hash}:${iterations}`;
}

const hash = hashPassword('password123');
console.log('PBKDF2 Hash for password123:');
console.log(hash);
