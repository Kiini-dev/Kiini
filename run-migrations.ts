import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const DATABASE_URL = process.env.DATABASE_URL;

function parseDatabaseUrl(url: string) {
  let parsed: URL;
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

function getMigrationFiles() {
  const migrationsPath = path.join(__dirname, 'drizzle', 'migrations');
  if (!fs.existsSync(migrationsPath)) {
    console.log(`⚠️  Migrations directory not found: ${migrationsPath}`);
    return [];
  }
  
  const files = fs.readdirSync(migrationsPath)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  return files;
}

function readMigrationFile(filename: string) {
  const filepath = path.join(__dirname, 'drizzle', 'migrations', filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(`Migration file not found: ${filepath}`);
  }
  return fs.readFileSync(filepath, 'utf8');
}

async function runMigrations() {
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
    
    // 2. Run migrations from drizzle/migrations dir
    const migrations = getMigrationFiles();
    if (migrations.length === 0) {
      console.log('⚠️  No migration files found!');
      await connection.end();
      return;
    }
    
    console.log(`📁 Found ${migrations.length} migration file(s):`);
    for (const mig of migrations) {
      console.log(`   - ${mig}`);
    }
    console.log('');
    
    let applied = 0;
    for (const migrationFile of migrations) {
      console.log(`⏳ Running ${migrationFile}...`);
      const sql = readMigrationFile(migrationFile);
      
      try {
        // Execute the full SQL content
        await connection.query(sql);
        console.log(`✅ ${migrationFile} applied\n`);
        applied++;
      } catch (err: any) {
        console.error(`⚠️  Error applying ${migrationFile}:`);
        console.error(`   ${err.message}\n`);
        // Continue with next migration
      }
    }
    
    // 3. Also run root level migrations if they exist
    const rootMigrationsPath = path.join(__dirname, 'migrations');
    if (fs.existsSync(rootMigrationsPath)) {
      const rootMigrations = fs.readdirSync(rootMigrationsPath)
        .filter(f => f.endsWith('.sql'))
        .sort();
      
      if (rootMigrations.length > 0) {
        console.log(`📁 Found ${rootMigrations.length} additional migration file(s) in /migrations:`);
        for (const mig of rootMigrations) {
          console.log(`   - ${mig}`);
        }
        console.log('');
        
        for (const migrationFile of rootMigrations) {
          console.log(`⏳ Running ${migrationFile}...`);
          const filepath = path.join(rootMigrationsPath, migrationFile);
          const sql = fs.readFileSync(filepath, 'utf8');
          
          try {
            await connection.query(sql);
            console.log(`✅ ${migrationFile} applied\n`);
            applied++;
          } catch (err: any) {
            console.error(`⚠️  Error applying ${migrationFile}:`);
            console.error(`   ${err.message}\n`);
          }
        }
      }
    }
    
    console.log('═'.repeat(60));
    console.log(`\n✅ Applied ${applied} migration(s)!\n`);
    
    await connection.end();
  } catch (error: any) {
    console.error('\n❌ Fatal error:');
    console.error(`   ${error.message}\n`);
    process.exit(1);
  }
}

runMigrations();
