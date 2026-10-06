#!/usr/bin/env node
/**
 * apply-missing-migrations.mjs
 * Run this script to ensure all database migrations are applied.
 * It connects directly to MySQL and runs migration SQL as needed.
 */

import mysql from 'mysql2/promise';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse DATABASE_URL from .env file manually
function parseEnvFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const env = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx < 0) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      env[key] = value;
    }
    return env;
  } catch {
    return {};
  }
}

function parseDatabaseUrl(url) {
  // mysql://user:password@host:port/database
  const match = url.match(/mysql:\/\/([^:]+):(.+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error(`Cannot parse DATABASE_URL: ${url}`);
  }
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
  };
}

async function main() {
  const envFile = join(__dirname, '.env');
  const env = parseEnvFile(envFile);
  
  let dbUrl = process.env.DATABASE_URL || env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not found in environment or .env file');
    process.exit(1);
  }

  // If using 'db' hostname (Docker), try localhost instead for local execution
  if (dbUrl.includes('@db:')) {
    console.log('ℹ️  DATABASE_URL uses Docker hostname "db", trying localhost:3307...');
    dbUrl = dbUrl.replace('@db:', '@localhost:');
    // Also try port 3307 (common Docker mapping)
    if (dbUrl.includes(':3306/')) {
      dbUrl = dbUrl.replace(':3306/', ':3307/');
    }
  }
  
  console.log(`🔌 Connecting to database...`);
  
  let connConfig;
  try {
    connConfig = parseDatabaseUrl(dbUrl);
  } catch (e) {
    console.error('❌ Failed to parse DATABASE_URL:', e.message);
    process.exit(1);
  }

  let connection;
  try {
    connection = await mysql.createConnection(connConfig);
    console.log(`✅ Connected to MySQL at ${connConfig.host}:${connConfig.port}/${connConfig.database}`);
  } catch (err) {
    // Try alternative port
    if (connConfig.port === 3307) {
      console.log('⚠️  Port 3307 failed, trying 3306...');
      connConfig.port = 3306;
    } else {
      console.log('⚠️  Port 3306 failed, trying 3307...');
      connConfig.port = 3307;
    }
    try {
      connection = await mysql.createConnection(connConfig);
      console.log(`✅ Connected to MySQL at ${connConfig.host}:${connConfig.port}/${connConfig.database}`);
    } catch (err2) {
      console.error(`❌ Cannot connect to MySQL:`, err2.message);
      console.error('Make sure MySQL/Docker is running and the credentials are correct.');
      process.exit(1);
    }
  }

  try {
    // Run all checks and fixes
    await checkAndFixSchema(connection);
    await checkAndSeedJobGroups(connection);
    await checkAndCreateTicketsTables(connection);
    await checkAndFixExpenses(connection);
    await checkAndCreateCommunicationLogs(connection);
    await checkAndFixEmployeeBenefits(connection);
    await checkAndCreatePayroll(connection);
    await checkAndCreateBudgetAllocations(connection);
    await checkAndCreateLPOs(connection);
    await checkAndMigrateWorkflows(connection);
    await showTableStatus(connection);
    
  } finally {
    await connection.end();
  }
}

async function checkAndFixSchema(connection) {
  console.log('\n=== Checking Employee Table Schema ===');
  
  const [columns] = await connection.query('SHOW COLUMNS FROM employees');
  const columnNames = columns.map(c => c.Field);
  
  console.log(`Current columns (${columnNames.length}): ${columnNames.join(', ')}`);
  
  const requiredColumns = [
    { name: 'bloodType', def: 'VARCHAR(10)' },
    { name: 'maritalStatus', def: 'VARCHAR(20)' },
    { name: 'nextOfKinName', def: 'VARCHAR(200)' },
    { name: 'nextOfKinPhone', def: 'VARCHAR(50)' },
    { name: 'nextOfKinRelationship', def: 'VARCHAR(50)' },
    { name: 'contractEndDate', def: 'DATETIME' },
    { name: 'probationEndDate', def: 'DATETIME' },
    { name: 'lastPromotionDate', def: 'DATETIME' },
    { name: 'performanceRating', def: 'INT' },
    { name: 'pfNumber', def: 'VARCHAR(100)' },
    { name: 'nssf', def: 'VARCHAR(100)' },
    { name: 'healthInsurance', def: 'VARCHAR(100)' },
    { name: 'membershipNumber', def: 'VARCHAR(100)' },
    { name: 'bankBranch', def: 'VARCHAR(100)' },
    { name: 'directManager', def: 'VARCHAR(100)' },
    { name: 'professionalCertifications', def: 'TEXT' },
    { name: 'jobGroupId', def: 'VARCHAR(64)' },
  ];
  
  const missing = requiredColumns.filter(c => !columnNames.includes(c.name));
  
  if (missing.length === 0) {
    console.log('✅ All required columns exist');
  } else {
    console.log(`\n⚠️  Missing columns: ${missing.map(c => c.name).join(', ')}`);
    console.log('Adding missing columns...');
    
    for (const col of missing) {
      try {
        await connection.query(`ALTER TABLE employees ADD COLUMN IF NOT EXISTS \`${col.name}\` ${col.def}`);
        console.log(`  ✅ Added column: ${col.name}`);
      } catch (err) {
        // Try without IF NOT EXISTS (older MySQL might not support it)
        try {
          await connection.query(`ALTER TABLE employees ADD COLUMN \`${col.name}\` ${col.def}`);
          console.log(`  ✅ Added column: ${col.name} (without IF NOT EXISTS)`);
        } catch (err2) {
          if (err2.message.includes('Duplicate column')) {
            console.log(`  ⏭️  Column already exists: ${col.name}`);
          } else {
            console.error(`  ❌ Failed to add ${col.name}: ${err2.message}`);
          }
        }
      }
    }
  }
  
  // Check and fix photoUrl column
  const photoUrlCol = columns.find(c => c.Field === 'photoUrl');
  if (photoUrlCol && !photoUrlCol.Type.toLowerCase().includes('longtext')) {
    console.log(`\n⚠️  photoUrl column type is ${photoUrlCol.Type}, should be LONGTEXT`);
    try {
      await connection.query('ALTER TABLE employees MODIFY COLUMN photoUrl LONGTEXT');
      console.log('  ✅ photoUrl column updated to LONGTEXT');
    } catch (err) {
      console.error(`  ❌ Failed to update photoUrl: ${err.message}`);
    }
  } else if (photoUrlCol) {
    console.log(`✅ photoUrl column is ${photoUrlCol.Type}`);
  }
  
  // Check employmentType enum
  const empTypeCol = columns.find(c => c.Field === 'employmentType');
  if (empTypeCol) {
    console.log(`\nemploymentType column type: ${empTypeCol.Type}`);
    const needsExpansion = !empTypeCol.Type.includes('contractual');
    if (needsExpansion) {
      console.log('⚠️  employmentType enum missing new values, updating...');
      try {
        await connection.query(`ALTER TABLE employees MODIFY COLUMN employmentType ENUM('full_time','part_time','contract','intern','contractual','hourly','wage','temporary','seasonal') NOT NULL DEFAULT 'full_time'`);
        console.log('  ✅ employmentType enum updated');
      } catch (err) {
        console.error(`  ❌ Failed to update employmentType: ${err.message}`);
      }
    } else {
      console.log('✅ employmentType enum has all required values');
    }
  }
  
  // Check if dateOfBirth/hireDate are timestamp or datetime
  const dobCol = columns.find(c => c.Field === 'dateOfBirth');
  const hireDateCol = columns.find(c => c.Field === 'hireDate');
  if (dobCol) console.log(`\ndateOfBirth column type: ${dobCol.Type}`);
  if (hireDateCol) console.log(`hireDate column type: ${hireDateCol.Type}`);
}

async function checkAndSeedJobGroups(connection) {
  console.log('\n=== Checking Job Groups ===');
  
  // First ensure jobGroups table exists
  try {
    await connection.query('SHOW COLUMNS FROM jobGroups');
    console.log('✅ jobGroups table exists');
  } catch (err) {
    console.log('⚠️  jobGroups table missing, creating...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS jobGroups (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        minimumGrossSalary INT NOT NULL,
        maximumGrossSalary INT NOT NULL,
        description TEXT NULL,
        isActive TINYINT DEFAULT 1 NOT NULL,
        createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('  ✅ jobGroups table created');
  }
  
  const [groups] = await connection.query('SELECT id, name, minimumGrossSalary, maximumGrossSalary FROM jobGroups');
  console.log(`Found ${groups.length} job groups`);
  if (groups.length > 0) {
    groups.forEach(g => console.log(`  - ${g.id}: ${g.name} (${g.minimumGrossSalary} - ${g.maximumGrossSalary})`));
  }
  
  const defaultGroups = [
    { id: 'jg-001', name: 'Junior Staff', min: 25000, max: 50000, desc: 'Entry-level position' },
    { id: 'jg-002', name: 'Senior Staff', min: 50000, max: 100000, desc: 'Mid-level position' },
    { id: 'jg-003', name: 'Supervisor', min: 100000, max: 150000, desc: 'Team leadership role' },
    { id: 'jg-004', name: 'Manager', min: 150000, max: 250000, desc: 'Department manager' },
    { id: 'jg-005', name: 'Executive', min: 250000, max: 500000, desc: 'Executive position' },
  ];
  
  for (const group of defaultGroups) {
    const exists = groups.find(g => g.id === group.id);
    if (!exists) {
      try {
        await connection.query(
          `INSERT INTO jobGroups (id, name, minimumGrossSalary, maximumGrossSalary, description, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())`,
          [group.id, group.name, group.min, group.max, group.desc]
        );
        console.log(`  ✅ Inserted job group: ${group.id} - ${group.name}`);
      } catch (err) {
        console.error(`  ❌ Failed to insert ${group.id}: ${err.message}`);
      }
    } else {
      console.log(`  ✅ Job group exists: ${group.id} - ${group.name}`);
    }
  }
}

async function checkAndCreateTicketsTables(connection) {
  console.log('\n=== Checking Tickets Tables ===');

  // tickets
  const [ticketRows] = await connection.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'tickets'`
  );
  if (ticketRows[0].cnt === 0) {
    console.log('⚠️  tickets table missing, creating...');
    await connection.query(`
      CREATE TABLE \`tickets\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`clientId\` VARCHAR(64) NOT NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`description\` TEXT,
        \`category\` VARCHAR(100),
        \`priority\` ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
        \`status\` ENUM('new','open','in_progress','awaiting_client','completed','closed') NOT NULL DEFAULT 'new',
        \`requestedDueDate\` DATETIME,
        \`assignedTo\` VARCHAR(64),
        \`createdBy\` VARCHAR(64) NOT NULL,
        \`createdAt\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`ticket_client_idx\` (\`clientId\`),
        INDEX \`ticket_status_idx\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('  ✅ tickets table created');
  } else {
    console.log('✅ tickets table exists');
  }

  // ticket_comments
  const [commentRows] = await connection.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'ticket_comments'`
  );
  if (commentRows[0].cnt === 0) {
    console.log('⚠️  ticket_comments table missing, creating...');
    await connection.query(`
      CREATE TABLE \`ticket_comments\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`ticketId\` VARCHAR(64) NOT NULL,
        \`authorId\` VARCHAR(64) NOT NULL,
        \`body\` TEXT NOT NULL,
        \`createdAt\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX \`comment_ticket_idx\` (\`ticketId\`),
        INDEX \`comment_author_idx\` (\`authorId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('  ✅ ticket_comments table created');
  } else {
    console.log('✅ ticket_comments table exists');
  }

  // ticket_tasks
  const [taskRows] = await connection.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'ticket_tasks'`
  );
  if (taskRows[0].cnt === 0) {
    console.log('⚠️  ticket_tasks table missing, creating...');
    await connection.query(`
      CREATE TABLE \`ticket_tasks\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`ticketId\` VARCHAR(64) NOT NULL,
        \`serviceType\` VARCHAR(100) NOT NULL,
        \`details\` TEXT,
        \`budget\` INT,
        \`dueDate\` DATETIME,
        \`createdAt\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX \`task_ticket_idx\` (\`ticketId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('  ✅ ticket_tasks table created');
  } else {
    console.log('✅ ticket_tasks table exists');
  }
}

async function checkAndFixExpenses(connection) {
  console.log('\n=== Checking Expenses Table ===');

  const [columns] = await connection.query('SHOW COLUMNS FROM expenses').catch(() => [[]]);
  const columnNames = columns.map(c => c.Field);

  if (columnNames.length === 0) {
    console.log('⚠️  expenses table not found, skipping');
    return;
  }

  const requiredColumns = [
    { name: 'budgetLineId', def: 'VARCHAR(64) NULL' },
  ];

  for (const col of requiredColumns) {
    if (columnNames.includes(col.name)) {
      console.log(`✅ expenses.${col.name} column exists`);
    } else {
      console.log(`⚠️  expenses.${col.name} missing, adding...`);
      try {
        await connection.query(`ALTER TABLE expenses ADD COLUMN \`${col.name}\` ${col.def}`);
        console.log(`  ✅ Added expenses.${col.name}`);
      } catch (err) {
        if (err.message.includes('Duplicate column')) {
          console.log(`  ⏭️  Column already exists: expenses.${col.name}`);
        } else {
          console.error(`  ❌ Failed: ${err.message}`);
        }
      }
    }
  }
}

async function checkAndFixEmployeeBenefits(connection) {
  console.log('\n=== Checking employeeBenefits Table ===');

  const [columns] = await connection.query('SHOW COLUMNS FROM employeeBenefits').catch(() => [[]]);
  const columnNames = columns.map(c => c.Field);

  if (columnNames.length === 0) {
    console.log('⚠️  employeeBenefits table not found, skipping');
    return;
  }

  const requiredColumns = [
    { name: 'employerCost', def: 'INT NULL' },
    { name: 'notes', def: 'TEXT NULL' },
  ];

  for (const col of requiredColumns) {
    if (columnNames.includes(col.name)) {
      console.log(`✅ employeeBenefits.${col.name} column exists`);
    } else {
      console.log(`⚠️  employeeBenefits.${col.name} missing, adding...`);
      try {
        await connection.query(`ALTER TABLE employeeBenefits ADD COLUMN \`${col.name}\` ${col.def}`);
        console.log(`  ✅ Added employeeBenefits.${col.name}`);
      } catch (err) {
        if (err.message.includes('Duplicate column')) {
          console.log(`  ⏭️  Column already exists: employeeBenefits.${col.name}`);
        } else {
          console.error(`  ❌ Failed: ${err.message}`);
        }
      }
    }
  }
}

async function checkAndCreatePayroll(connection) {
  console.log('\n=== Checking payroll Table ===');

  const [rows] = await connection.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'payroll'`
  );
  if (rows[0].cnt > 0) {
    console.log('✅ payroll table exists');
    return;
  }

  console.log('⚠️  payroll table missing, creating...');
  await connection.query(`
    CREATE TABLE \`payroll\` (
      \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
      \`employeeId\` VARCHAR(64) NOT NULL,
      \`payPeriodStart\` DATETIME NOT NULL,
      \`payPeriodEnd\` DATETIME NOT NULL,
      \`basicSalary\` INT NOT NULL,
      \`allowances\` INT DEFAULT 0,
      \`deductions\` INT DEFAULT 0,
      \`tax\` INT DEFAULT 0,
      \`netSalary\` INT NOT NULL,
      \`status\` ENUM('draft','processed','paid') NOT NULL DEFAULT 'draft',
      \`paymentDate\` DATETIME NULL,
      \`paymentMethod\` VARCHAR(50) NULL,
      \`notes\` TEXT NULL,
      \`createdBy\` VARCHAR(64) NULL,
      \`createdAt\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX \`employee_idx\` (\`employeeId\`),
      INDEX \`pay_period_idx\` (\`payPeriodStart\`, \`payPeriodEnd\`),
      INDEX \`status_idx\` (\`status\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('  ✅ payroll table created');
}

async function checkAndCreateBudgetAllocations(connection) {
  console.log('\n=== Checking budgetAllocations Table ===');

  const [rows] = await connection.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'budgetAllocations'`
  );
  if (rows[0].cnt > 0) {
    console.log('✅ budgetAllocations table exists');
    return;
  }

  console.log('⚠️  budgetAllocations table missing, creating...');
  await connection.query(`
    CREATE TABLE \`budgetAllocations\` (
      \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
      \`budgetId\` VARCHAR(64) NOT NULL,
      \`categoryName\` VARCHAR(255) NOT NULL,
      \`allocatedAmount\` INT NOT NULL,
      \`spentAmount\` INT DEFAULT 0 NOT NULL,
      \`notes\` TEXT NULL,
      \`createdAt\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX \`allocation_budget_idx\` (\`budgetId\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('  ✅ budgetAllocations table created');
}

async function checkAndCreateLPOs(connection) {
  console.log('\n=== Checking lpos Table ===');

  const [rows] = await connection.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'lpos'`
  );
  if (rows[0].cnt > 0) {
    console.log('✅ lpos table exists');
    return;
  }

  console.log('⚠️  lpos table missing, creating...');
  await connection.query(`
    CREATE TABLE \`lpos\` (
      \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
      \`lpoNumber\` VARCHAR(50) NOT NULL,
      \`vendorId\` VARCHAR(64) NOT NULL,
      \`description\` TEXT NULL,
      \`amount\` INT NOT NULL,
      \`status\` ENUM('draft','submitted','approved','rejected','received') NOT NULL DEFAULT 'draft',
      \`createdBy\` VARCHAR(64) NULL,
      \`createdAt\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX \`vendor_idx\` (\`vendorId\`),
      INDEX \`status_idx\` (\`status\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('  ✅ lpos table created');
}

async function checkAndCreateCommunicationLogs(connection) {
  console.log('\n=== Checking communicationLogs Table ===');

  const [rows] = await connection.query(
    `SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'communicationLogs'`
  );
  if (rows[0].cnt > 0) {
    console.log('✅ communicationLogs table exists');
    return;
  }

  console.log('⚠️  communicationLogs table missing, creating...');
  await connection.query(`
    CREATE TABLE \`communicationLogs\` (
      \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
      \`type\` ENUM('email','sms') NOT NULL,
      \`recipient\` VARCHAR(320) NOT NULL,
      \`subject\` VARCHAR(500) NULL,
      \`body\` TEXT NULL,
      \`status\` ENUM('pending','sent','failed') NOT NULL DEFAULT 'pending',
      \`error\` TEXT NULL,
      \`referenceType\` VARCHAR(50) NULL,
      \`referenceId\` VARCHAR(64) NULL,
      \`sentAt\` DATETIME NULL,
      \`createdBy\` VARCHAR(64) NULL,
      \`createdAt\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX \`comm_log_status_idx\` (\`status\`),
      INDEX \`comm_log_ref_idx\` (\`referenceType\`, \`referenceId\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  console.log('  ✅ communicationLogs table created');
}

async function checkAndMigrateWorkflows(connection) {
  console.log('\n=== Checking/Updating workflows Table ===');

  const [columns] = await connection.query('SHOW COLUMNS FROM workflows').catch(() => [[]]);
  const columnNames = columns.map(c => c.Field);

  if (columnNames.length === 0) {
    console.log('⚠️  workflows table not found, creating data model...');
    await connection.query(`
      CREATE TABLE \`workflows\` (
        \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`description\` TEXT NULL,
        \`status\` ENUM('active','inactive','draft','archived') NOT NULL DEFAULT 'draft',
        \`triggerType\` ENUM('invoice_created','invoice_paid','invoice_overdue','payment_received','opportunity_moved','task_completed','project_milestone_reached','reminder_time') NOT NULL DEFAULT 'invoice_created',
        \`triggerCondition\` TEXT NULL,
        \`actionTypes\` TEXT NOT NULL,
        \`isRecurring\` TINYINT(1) NOT NULL DEFAULT 0,
        \`createdBy\` VARCHAR(64) NOT NULL,
        \`createdAt\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('  ✅ workflows table created');
    return;
  }

  const alterStatements = [];

  if (!columnNames.includes('status')) {
    alterStatements.push("ADD COLUMN `status` ENUM('active','inactive','draft','archived') NOT NULL DEFAULT 'draft'");
  } else {
    alterStatements.push("MODIFY COLUMN `status` ENUM('active','inactive','draft','archived') NOT NULL DEFAULT 'draft'");
  }
  if (!columnNames.includes('triggerType')) {
    alterStatements.push("ADD COLUMN `triggerType` ENUM('invoice_created','invoice_paid','invoice_overdue','payment_received','opportunity_moved','task_completed','project_milestone_reached','reminder_time') NOT NULL DEFAULT 'invoice_created'");
  }
  if (!columnNames.includes('triggerCondition')) {
    alterStatements.push("ADD COLUMN `triggerCondition` TEXT NULL");
  }
  if (!columnNames.includes('actionTypes')) {
    alterStatements.push("ADD COLUMN `actionTypes` TEXT NOT NULL");
  }
  if (!columnNames.includes('isRecurring')) {
    alterStatements.push("ADD COLUMN `isRecurring` TINYINT(1) NOT NULL DEFAULT 0");
  }

  if (alterStatements.length > 0) {
    const sql = `ALTER TABLE workflows ${alterStatements.join(', ')}`;
    try {
      await connection.query(sql);
      console.log('  ✅ workflows table schema updated');
    } catch (err) {
      console.error('  ❌ Unable to alter workflows:', err.message);
    }
  } else {
    console.log('✅ workflows table already up-to-date');
  }

  try {
    await connection.query(`UPDATE workflows SET triggerType='invoice_created' WHERE triggerType IS NULL`);
    await connection.query(`UPDATE workflows SET actionTypes='[]' WHERE actionTypes IS NULL`);
    await connection.query(`UPDATE workflows SET isRecurring=0 WHERE isRecurring IS NULL`);
  } catch (err) {
    // Non-fatal
  }
}

async function showTableStatus(connection) {
  console.log('\n=== Final Table Status ===');
  
  const [cols] = await connection.query('SHOW COLUMNS FROM employees');
  console.log(`employees table columns (${cols.length}):`);
  cols.forEach(c => console.log(`  - ${c.Field}: ${c.Type}`));
  
  const [groups] = await connection.query('SELECT id, name FROM jobGroups');
  console.log(`\njobGroups (${groups.length}):`);
  groups.forEach(g => console.log(`  - ${g.id}: ${g.name}`));
  
  console.log('\n✅ Database verification complete. Employee creation should now work.');
}

main().catch(err => {
  console.error('❌ Script failed:', err.message || err);
  process.exit(1);
});
