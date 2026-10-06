import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'localhost', port: 3307,
  user: 'kiini_user', password: 'tjwzT9pW;NGYq1QxSq0B',
  database: 'kiini-one-hub-total-control'
});

const normalizeDateTime = (v) => (v instanceof Date ? v : new Date(v)).toISOString().replace('T', ' ').substring(0, 19);
const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

const userId = '4cc19870-878b-4ab7-8fc6-b06fda36b0ed';
const id = '07d44f7c-test-0001-0001-3bc1688a4607'; // unique test id
const employeeNumber = 'EMP-DIAG-TEST-001';
const hireDate = normalizeDateTime('2026-03-20');
const dateOfBirth = normalizeDateTime('1996-11-13');

// Test 1: small photo
try {
  await conn.execute(
    `INSERT INTO employees (id, userId, employeeNumber, firstName, lastName, email, phone,
     dateOfBirth, hireDate, department, position, jobGroupId, salary, employmentType, status,
     address, emergencyContact, bankAccountNumber, taxId, nationalId, photoUrl,
     bloodType, maritalStatus, nextOfKinName, nextOfKinPhone, nextOfKinRelationship,
     contractEndDate, probationEndDate, lastPromotionDate, performanceRating,
     pfNumber, nssf, healthInsurance, membershipNumber, bankBranch, directManager,
     professionalCertifications, createdBy, createdAt, updatedAt)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id, userId, employeeNumber, 'Eliakim', 'Mwaniki',
     'eliakimmwaniki@gmail.com', '+254705974879',
     dateOfBirth, hireDate, 'Operations', 'Director', 'jg-005',
     275000, 'full_time', 'active',
     'P.O Box 85845-00200 Nairobi,Kenya', 'Nixon - 0726623145',
     '1267010363', 'A011066821I', '33284139',
     'data:image/jpeg;base64,' + 'A'.repeat(50000), // 50KB
     null, null, null, null, null,
     null, null, null, null,
     null, null, null, null, null, null, null,
     'system', now, now]
  );
  console.log('Test 1 (small photo, duplicate email): OK');
  await conn.query(`DELETE FROM employees WHERE id = '${id}'`);
} catch(e) {
  console.log('Test 1 FAILED:', e.sqlMessage || e.message.substring(0, 200));
  console.log('MySQL code:', e.code, 'errno:', e.errno);
}

// Test 2: large photo (5MB)
const id2 = '07d44f7c-test-0002-0001-3bc1688a4607';
try {
  await conn.execute(
    `INSERT INTO employees (id, userId, employeeNumber, firstName, lastName,
     hireDate, jobGroupId, employmentType, status, photoUrl, createdAt, updatedAt)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [id2, userId, 'EMP-DIAG-TEST-002', 'Test', 'User',
     now, 'jg-005', 'full_time', 'active',
     'data:image/jpeg;base64,' + 'A'.repeat(5000000), // 5MB
     now, now]
  );
  console.log('Test 2 (5MB photo): OK');
  await conn.query(`DELETE FROM employees WHERE id = '${id2}'`);
} catch(e) {
  console.log('Test 2 FAILED (5MB photo):', e.sqlMessage || e.message.substring(0, 200));
  console.log('MySQL code:', e.code, 'errno:', e.errno);
}

// Test 3: check if users table insert would fail for the existing user  
console.log('\nChecking users table unique constraints...');
const [userIndexes] = await conn.query('SHOW INDEX FROM users');
userIndexes.forEach(i => console.log(`  users key: ${i.Key_name}, col: ${i.Column_name}, nonUnique: ${i.Non_unique}`));

await conn.end();
