#!/usr/bin/env node

/**
 * Database Migration Runner
 * 
 * This script automatically runs all pending migrations.
 * Use when: npm run migrate fails or needs manual intervention
 * 
 * Run with: node setup-database.js
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const DATABASE_URL = process.env.DATABASE_URL;
const MIGRATIONS_DIR = path.join(__dirname, 'drizzle');

// Parse DATABASE_URL
function parseDatabaseUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('DATABASE_URL must be a valid MySQL connection URL');
  }
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
  if (parsed.protocol !== 'mysql:' || !parsed.hostname || !database) {
    throw new Error('DATABASE_URL must be a valid MySQL connection URL');
  }
  return {
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    database,
  };
}

// Get all migration files
function getMigrationFiles() {
  try {
    const migrationsPath = path.join(MIGRATIONS_DIR, 'migrations');
    if (!fs.existsSync(migrationsPath)) {
      throw new Error(`Migrations directory not found: ${migrationsPath}`);
    }
    
    const files = fs.readdirSync(migrationsPath)
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    return files;
  } catch (err) {
    console.error(`Error reading migrations: ${err.message}`);
    return [];
  }
}

// Read migration file
function readMigrationFile(filename) {
  const filepath = path.join(MIGRATIONS_DIR, 'migrations', filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(`Migration file not found: ${filepath}`);
  }
  return fs.readFileSync(filepath, 'utf8');
}

async function setupDatabase() {
  console.log('📝 Database Migration Runner\n');
  console.log('═'.repeat(60));
  if (!DATABASE_URL) {
    console.error('DATABASE_URL is required');
    process.exitCode = 1;
    return;
  }
  
  try {
    const config = parseDatabaseUrl(DATABASE_URL);
    console.log('\n📋 Configuration:');
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   User: ${config.user}\n`);
    
    // 1. Connect to database
    console.log('⏳ Connecting to database...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected!\n');
    
    // 2. Create migrations table if not exists
    console.log('📊 Checking migrations table...');
    try {
      await connection.query('SELECT 1 FROM __drizzle_migrations__ LIMIT 1');
      console.log('✅ Migrations table exists\n');
    } catch (err) {
      console.log('ℹ️  Creating migrations table...');
      await connection.query(`
        CREATE TABLE IF NOT EXISTS __drizzle_migrations__ (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL UNIQUE,
          installed_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Created\n');
    }
    
    // 3. Get applied migrations
    const [appliedRows] = await connection.query('SELECT name FROM __drizzle_migrations__');
    const appliedMigrations = new Set(appliedRows.map(r => r.name));
    console.log(`📜 Applied migrations: ${appliedMigrations.size}\n`);
    
    // 4. Get available migrations
    const migrations = getMigrationFiles();
    if (migrations.length === 0) {
      console.log('⚠️  No migration files found!\n');
      await connection.end();
      process.exit(1);
    }
    
    console.log(`📁 Available migrations: ${migrations.length}`);
    console.log('   Migrations to check:');
    for (const mig of migrations) {
      const status = appliedMigrations.has(mig) ? '✅' : '⏳';
      console.log(`   ${status} ${mig}`);
    }
    console.log('');
    
    // 5. Run pending migrations
    let applied = 0;
    for (const migrationFile of migrations) {
      if (appliedMigrations.has(migrationFile)) {
        console.log(`⏭️  Skipping ${migrationFile} (already applied)`);
        continue;
      }
      
      console.log(`⏳ Running ${migrationFile}...`);
      const sql = readMigrationFile(migrationFile);
      
      try {
        // Split SQL by statements and execute each
        const statements = sql.split(';').filter(s => s.trim());
        for (const statement of statements) {
          if (statement.trim()) {
            await connection.query(statement);
          }
        }
        
        // Record migration
        await connection.query(
          'INSERT INTO __drizzle_migrations__ (name) VALUES (?)',
          [migrationFile]
        );
        
        console.log(`✅ ${migrationFile} applied\n`);
        applied++;
      } catch (err) {
        console.error(`❌ Error applying ${migrationFile}:`);
        console.error(`   ${err.message}\n`);
        
        // Continue with other migrations
        console.log('   Continuing with next migration...\n');
      }
    }
    
    // 6. Verify tables
    console.log('🔍 Verifying tables...');
    const [tableRows] = await connection.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = ?
    `, [config.database]);
    
    const tableCount = tableRows[0].count;
    console.log(`✅ Found ${tableCount} tables\n`);
    
    // 7. Check critical tables
    const criticalTables = ['invoices', 'orders', 'clients', 'employees'];
    console.log('🔑 Critical tables:');
    for (const table of criticalTables) {
      const [result] = await connection.query(`
        SELECT COUNT(*) as count FROM information_schema.tables 
        WHERE table_schema = ? AND table_name = ?
      `, [config.database, table]);
      
      const exists = result[0].count > 0;
      console.log(`   ${exists ? '✅' : '❌'} ${table}`);
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log(`\n✅ Setup complete! Applied ${applied} migration(s).\n`);
    
    await connection.end();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Fatal error:\n');
    console.error(`   ${error.message}\n`);
    
    if (error.message.includes('Connection refused') || error.errno === 'ECONNREFUSED') {
      console.error('💡 Database is not accessible. Check:');
      console.error('   1. Is MySQL running? (docker ps | grep db)');
      console.error('   2. Is the host/port correct?');
      console.error('   3. Are credentials valid?\n');
    }
    
    if (error.message.includes('Access denied')) {
      console.error('💡 Database credentials are incorrect. Check DATABASE_URL in .env\n');
    }
    
    console.error('🔧 To fix:');
    console.error('   1. docker-compose down');
    console.error('   2. docker-compose up -d');
    console.error('   3. Wait 10 seconds for database to init');
    console.error('   4. npm run setup-db\n');
    
    process.exit(1);
  }
}

// Run setup
setupDatabase().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
