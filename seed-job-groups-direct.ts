import mysql from 'mysql2/promise';

async function seedJobGroups() {
  try {
    const connection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3307,
      user: 'kiini_user',
      password: 'tjwzT9pW;NGYq1QxSq0B',
      database: 'kiini-one-hub-total-control',
      multipleStatements: true,
    });

    console.log('✅ Connected to database\n');

    // 1. Create jobGroups table if doesn't exist
    console.log('⏳ Ensuring jobGroups table exists...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS jobGroups (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        minimumGrossSalary INT NOT NULL,
        maximumGrossSalary INT NOT NULL,
        description TEXT NULL,
        isActive TINYINT DEFAULT 1 NOT NULL,
        createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX job_group_name_idx (name),
        INDEX is_active_idx (isActive)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ jobGroups table ready\n');

    // 2. Check if job groups already exist
    const [existing] = await connection.query('SELECT COUNT(*) as count FROM jobGroups');
    console.log(`📊 Found ${existing[0].count} existing job groups\n`);

    if (existing[0].count === 0) {
      // 3. Insert default job groups
      console.log('⏳ Seeding default job groups...');
      const jobGroups = [
        { id: 'jg-001', name: 'Junior Staff', min: 25000, max: 50000, desc: 'Entry-level position' },
        { id: 'jg-002', name: 'Senior Staff', min: 50000, max: 100000, desc: 'Mid-level position with responsibilities' },
        { id: 'jg-003', name: 'Supervisor', min: 100000, max: 150000, desc: 'Team leadership role' },
        { id: 'jg-004', name: 'Manager', min: 150000, max: 250000, desc: 'Department manager' },
        { id: 'jg-005', name: 'Executive', min: 250000, max: 500000, desc: 'Executive position' },
      ];

      for (const group of jobGroups) {
        await connection.query(
          'INSERT IGNORE INTO jobGroups (id, name, minimumGrossSalary, maximumGrossSalary, description, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())',
          [group.id, group.name, group.min, group.max, group.desc]
        );
        console.log(`✅ Created: ${group.id} - ${group.name}`);
      }
      console.log('');
    }

    // 4. Verify job groups
    const [final] = await connection.query('SELECT id, name FROM jobGroups ORDER BY id');
    console.log(`\n📋 Final job groups in database (${final.length} total):`);
    final.forEach((row: any) => {
      console.log(`   - ${row.id}: ${row.name}`);
    });

    // 5. Add job group FK to employees if needed
    console.log('\n⏳ Checking employees table structure...');
    try {
      const [tableInfo] = await connection.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'employees' AND COLUMN_NAME = 'jobGroupId'"
      );
      
      if (tableInfo.length === 0) {
        console.log('⚠️  jobGroupId column missing from employees,adding it...');
        await connection.query(`
          ALTER TABLE employees ADD COLUMN jobGroupId VARCHAR(64) AFTER position;
        `);
      }
      
      // Check if FK constraint exists
      const [constraints] = await connection.query(
        "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'employees' AND COLUMN_NAME = 'jobGroupId' AND REFERENCED_TABLE_NAME = 'jobGroups'"
      );
      
      if (constraints.length === 0 && tableInfo.length > 0) {
        console.log('📍 Adding foreign key constraint...');
        try {
          await connection.query(`
            ALTER TABLE employees ADD CONSTRAINT fk_employees_jobGroupId 
            FOREIGN KEY (jobGroupId) REFERENCES jobGroups(id) ON DELETE RESTRICT;
          `);
        } catch (err: any) {
          if (err.message.includes('fk_employees_jobGroupId')) {
            console.log('ℹ️  Foreign key constraint already exists');
          } else {
            throw err;
          }
        }
      }
    } catch (err: any) {
      console.log(`⚠️  ${err.message}`);
    }

    console.log('\n✅ Job groups setup complete!\n');
    await connection.end();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedJobGroups();
