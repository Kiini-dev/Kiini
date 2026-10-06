#!/usr/bin/env node
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required');
  
  try {
    console.log('🔄 Connecting to database...');
    const connection = await mysql.createConnection(databaseUrl);
    console.log('✅ Connected successfully');
    
    // Read and execute the migration
    const migrationPath = path.join(process.cwd(), 'drizzle', 'migrations', '0037_create_service_templates.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('📝 Executing migration...');
    await connection.query(sql);
    console.log('✅ Migration executed successfully');
    
    // Verify tables were created
    const [tables] = await connection.query(`SHOW TABLES LIKE 'serviceTemplates'`);
    if (tables.length > 0) {
      console.log('✅ serviceTemplates table created successfully');
    }
    
    await connection.end();
    console.log('✅ Done');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

runMigration();
