import mysql from 'mysql2/promise';

const conn = await mysql.createConnection({
  host: 'localhost', port: 3307,
  user: 'kiini_user', password: 'tjwzT9pW;NGYq1QxSq0B',
  database: 'kiini-one-hub-total-control'
});

// Check all indexes on employees table
const [indexes] = await conn.query("SHOW INDEX FROM employees");
console.log('Employees indexes:');
indexes.forEach(i => console.log(`  Key: ${i.Key_name}, Col: ${i.Column_name}, NonUnique: ${i.Non_unique}`));

// Check the existing employee linked to that email
const [emp] = await conn.query("SELECT id, userId, email, employeeNumber FROM employees WHERE email = 'eliakimmwaniki@gmail.com'");
console.log('\nExisting employee:', emp[0]);

// Check what user that userId maps to
if (emp.length > 0 && emp[0].userId) {
  const [usr] = await conn.query("SELECT id, name, email FROM users WHERE id = ?", [emp[0].userId]);
  console.log('Linked user:', usr[0] || 'not found');
}

// Check users table for that email
const [usr2] = await conn.query("SELECT id, name, email FROM users WHERE email = 'eliakimmwaniki@gmail.com'");
console.log('\nUser with that email:', usr2[0] || 'not found');

await conn.end();

// Test insert with a large photo (~500KB base64 = ~375KB binary)
const largePhoto = 'data:image/jpeg;base64,' + 'A'.repeat(500000);
const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
try {
  await conn.execute(
    'INSERT INTO employees (id, employeeNumber, firstName, lastName, hireDate, jobGroupId, employmentType, status, photoUrl, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
    ['test-photo-001', 'EMP-PHOTO-001', 'Test', 'User', '2026-03-21 00:00:00', 'jg-005', 'full_time', 'active', largePhoto, now, now]
  );
  console.log('Large photo insert (500KB): OK');
  await conn.query("DELETE FROM employees WHERE id = 'test-photo-001'");
} catch (e) {
  console.log('Large photo insert failed:', e.message.substring(0, 200), 'Code:', e.code);
}

// Check if employee number uniqueness is the problem - maybe EMP-1774031510454 already exists
const [existing] = await conn.query("SELECT id, employeeNumber FROM employees WHERE employeeNumber = 'EMP-1774031510454'");
console.log('EMP-1774031510454 exists:', existing.length > 0 ? existing[0] : 'no');

// Check if email uniqueness is the problem
const [byEmail] = await conn.query("SELECT id, email FROM employees WHERE email = 'eliakimmwaniki@gmail.com'");
console.log('Email eliakimmwaniki@gmail.com exists:', byEmail.length > 0 ? byEmail[0] : 'no');

await conn.end();

// Check if users table has a record we can use as userId
const [users] = await conn.query('SELECT id FROM users LIMIT 1');
const testUserId = users.length > 0 ? users[0].id : null;
console.log('Test userId:', testUserId);

// Try a minimal insert
try {
  await conn.query(`
    INSERT INTO employees (id, userId, employeeNumber, firstName, lastName, hireDate, jobGroupId, employmentType, status, createdBy, createdAt, updatedAt)
    VALUES ('test-diag-001', ?, 'EMP-TEST-001', 'Test', 'User', '2026-03-21 00:00:00', 'jg-005', 'full_time', 'active', 'system', NOW(), NOW())
  `, [testUserId]);
  console.log('Minimal insert: OK');
  await conn.query("DELETE FROM employees WHERE id = 'test-diag-001'");
} catch (e) {
  console.log('Minimal insert failed:', e.message, 'Code:', e.code, 'Errno:', e.errno);
}

// Try insert with dateOfBirth (timestamp column)
try {
  await conn.query(`
    INSERT INTO employees (id, userId, employeeNumber, firstName, lastName, dateOfBirth, hireDate, jobGroupId, employmentType, status, createdBy, createdAt, updatedAt)
    VALUES ('test-diag-002', ?, 'EMP-TEST-002', 'Test', 'User', '1996-11-13 00:00:00', '2026-03-21 00:00:00', 'jg-005', 'full_time', 'active', 'system', NOW(), NOW())
  `, [testUserId]);
  console.log('Insert with dateOfBirth: OK');
  await conn.query("DELETE FROM employees WHERE id = 'test-diag-002'");
} catch (e) {
  console.log('Insert with dateOfBirth failed:', e.message, 'Code:', e.code);
}

// Test full Drizzle-style insert with all 40 columns (no photo)
try {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  await conn.execute(`
    INSERT INTO employees (id, userId, employeeNumber, firstName, lastName, email, phone,
      dateOfBirth, hireDate, department, position, jobGroupId, salary, employmentType, status,
      address, emergencyContact, bankAccountNumber, taxId, nationalId, photoUrl,
      bloodType, maritalStatus, nextOfKinName, nextOfKinPhone, nextOfKinRelationship,
      contractEndDate, probationEndDate, lastPromotionDate, performanceRating,
      pfNumber, nssf, healthInsurance, membershipNumber, bankBranch, directManager,
      professionalCertifications, createdBy, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'test-full-001', testUserId, 'EMP-FULL-001', 'Eliakim', 'Mwaniki',
    'eliakimmwaniki@gmail.com', '+254705974879',
    '1996-11-13 00:00:00', '2026-03-20 00:00:00',
    'Operations', 'Director', 'jg-005', 275000, 'full_time', 'active',
    'P.O Box 85845-00200 Nairobi,Kenya', 'Nixon - 0726623145',
    '1267010363', 'A011066821I', '33284139', null,
    null, null, null, null, null,
    null, null, null, null,
    null, null, null, null, null, null,
    null, 'system', now, now
  ]);
  console.log('Full 40-col insert (no photo): OK');
  await conn.query("DELETE FROM employees WHERE id = 'test-full-001'");
} catch (e) {
  console.log('Full 40-col insert failed:', e.message, 'Code:', e.code, 'Errno:', e.errno, 'SQLState:', e.sqlState);
}

// Now check if jobGroupId is NOT NULL - maybe router's values() call fails on null jobGroupId  
// The schema says notNull() but DB says DEFAULT NULL
const [empCols] = await conn.query(`
  SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT, DATA_TYPE, COLUMN_TYPE, EXTRA
  FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA='kiini-one-hub-total-control' AND TABLE_NAME='employees'
  ORDER BY ORDINAL_POSITION
`);
console.log('\nColumn details:');
empCols.forEach(c => console.log(`  ${c.COLUMN_NAME}: nullable=${c.IS_NULLABLE} default=${c.COLUMN_DEFAULT} type=${c.DATA_TYPE}`));

await conn.end();
