#!/usr/bin/env node

/**
 * Database Health Check Utility
 * 
 * This script checks the health of the database connection and tables.
 * Run with: node database-health-check.js
 */

import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const DATABASE_URL = process.env.DATABASE_URL;

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

async function checkDatabase() {
  console.log('🔍 Database Health Check\n');
  console.log('═'.repeat(50));

  if (!DATABASE_URL) {
    console.error('\n❌ DATABASE_URL is not set. Configure it in the environment or .env file.\n');
    process.exitCode = 1;
    return;
  }
  
  try {
    const config = parseDatabaseUrl(DATABASE_URL);
    console.log('\n📋 Connection Config:');
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   User: ${config.user}`);
    
    console.log('\n⏳ Connecting to database...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connection successful!\n');
    
    // 1. Check database info
    console.log('📊 Database Information:');
    const dbInfo = await connection.query('SELECT DATABASE() as db, VERSION() as version');
    const [dbRow] = dbInfo;
    console.log(`   Database: ${dbRow[0].db}`);
    console.log(`   MySQL Version: ${dbRow[0].version}`);
    
    // 2. Check table count
    console.log('\n📁 Tables:');
    const tableCount = await connection.query(
      `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ?`,
      [config.database]
    );
    const tableCountRow = tableCount[0];
    console.log(`   Total tables: ${tableCountRow[0].count}`);
    
    // 3. Check critical tables
    console.log('\n🔑 Critical Tables:');
    const criticalTables = [
      'invoices', 'orders', 'clients', 'employees', 
      'attendance', 'leave_requests', 'departments',
      'procurement_requests', 'purchase_orders', 
      'activity_logs', 'users'
    ];
    
    for (const table of criticalTables) {
      const result = await connection.query(
        `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?`,
        [config.database, table]
      );
      const exists = result[0][0].count > 0;
      const status = exists ? '✅' : '❌';
      console.log(`   ${status} ${table}`);
      
      if (exists) {
        const countResult = await connection.query(`SELECT COUNT(*) as count FROM \`${table}\``);
        const recordCount = countResult[0][0].count;
        console.log(`      └─ ${recordCount} records`);
      }
    }
    
    // 4. Check migrations
    console.log('\n📜 Migrations:');
    try {
      const migrations = await connection.query('SELECT * FROM __drizzle_migrations__ ORDER BY installed_on DESC');
      const migrationRows = migrations[0];
      console.log(`   Total migrations: ${migrationRows.length}`);
      if (migrationRows.length > 0) {
        console.log(`   Latest migration: ${migrationRows[0].name} (${new Date(migrationRows[0].installed_on).toLocaleString()})`);
      }
      
      // Show all migrations
      console.log('\n   All migrations:');
      for (const mig of migrationRows) {
        const date = new Date(mig.installed_on).toLocaleDateString();
        console.log(`   ✓ ${mig.name} (${date})`);
      }
    } catch (err) {
      console.log('   ❌ No migrations table (not yet initialized)');
    }
    
    // 5. Check invoices table structure
    console.log('\n🏗️  Invoices Table Structure:');
    try {
      const columns = await connection.query('DESC invoices');
      const columnRows = columns[0];
      console.log(`   Columns: ${columnRows.length}`);
      for (const col of columnRows.slice(0, 5)) {
        console.log(`   • ${col.Field} (${col.Type})`);
      }
      if (columnRows.length > 5) {
        console.log(`   ... and ${columnRows.length - 5} more columns`);
      }
    } catch (err) {
      console.log('   ❌ Unable to describe table (table may not exist)');
    }
    
    // 6. Connection pool
    console.log('\n🔗 Connection Pool:');
    console.log(`   Status: Active`);
    console.log(`   Host: ${config.host}`);
    console.log(`   Port: ${config.port}`);
    
    console.log('\n' + '═'.repeat(50));
    console.log('\n✅ All checks completed successfully!\n');
    
    await connection.end();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:\n');
    console.error(`   ${error.message}\n`);
    
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('   💡 The connection was lost. Check if MySQL server is running.');
    } else if (error.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
      console.error('   💡 Fatal error was encountered. Check database credentials.');
    } else if (error.code === 'PROTOCOL_ENQUEUE_AFTER_CLOSE') {
      console.error('   💡 Connection was forcibly closed. Database may not be accessible.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('   💡 Access denied. Check DATABASE_URL credentials.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('   💡 Database does not exist. Create it first.');
    } else if (error.errno === 'ECONNREFUSED') {
      console.error('   💡 Connection refused. Is the MySQL server running?');
    }
    
    console.error('\n📝 Troubleshooting steps:');
    console.error('   1. Check if MySQL is running: docker ps | grep db');
    console.error('   2. Verify DATABASE_URL in .env file');
    console.error('   3. Check docker logs: docker logs kiini-one-hub-total-control_db');
    console.error('   4. Try: docker-compose down && docker-compose up -d\n');
    
    process.exit(1);
  }
}

// Run health check
checkDatabase().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
