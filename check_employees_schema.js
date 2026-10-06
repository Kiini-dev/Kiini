import mysql from 'mysql2/promise';

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'kiini_user',
    password: 'kiini_pass',
    database: 'kiini-one-hub-total-control',
  });

  try {
    const [rows] = await connection.query('DESC employees');
    console.log('=== EMPLOYEES TABLE SCHEMA ===');
    console.table(rows);
    
    // Check if all expected columns exist
    const expectedColumns = [
      'id', 'userId', 'employeeNumber', 'firstName', 'lastName', 'email', 'phone',
      'dateOfBirth', 'hireDate', 'department', 'position', 'jobGroupId', 'salary',
      'employmentType', 'status', 'address', 'emergencyContact', 'bankAccountNumber',
      'taxId', 'nationalId', 'photoUrl', 'bloodType', 'maritalStatus', 'nextOfKinName',
      'nextOfKinPhone', 'nextOfKinRelationship', 'contractEndDate', 'probationEndDate',
      'lastPromotionDate', 'performanceRating', 'pfNumber', 'nssf', 'healthInsurance',
      'membershipNumber', 'bankBranch', 'directManager', 'professionalCertifications',
      'createdBy', 'createdAt', 'updatedAt'
    ];
    
    const actualColumns = rows.map(r => r.Field);
    const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
    const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col));
    
    console.log('\n=== COLUMN ANALYSIS ===');
    console.log('Missing columns:', missingColumns.length > 0 ? missingColumns : 'None');
    console.log('Extra columns:', extraColumns.length > 0 ? extraColumns : 'None');
    
    // Check foreign keys
    const [fks] = await connection.query(`
      SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_NAME = 'employees' AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    console.log('\n=== FOREIGN KEY CONSTRAINTS ===');
    console.table(fks);
    
  } finally {
    await connection.end();
  }
}

checkSchema().catch(console.error);
