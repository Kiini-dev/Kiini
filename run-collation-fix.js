import mysql from 'mysql2/promise';
import fs from 'fs';
import { config } from 'dotenv';
import { resolve } from 'node:path';

config({ path: resolve(process.cwd(), process.env.NODE_ENV === 'production' ? '.env.production' : '.env') });
config({ path: resolve(process.cwd(), '.env') });

async function runCollationFix() {
  try {
    console.log('🔌 Attempting database connection...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set');
    }

    const dbUrl = new URL(process.env.DATABASE_URL);
    const connection = await mysql.createConnection({
      host: dbUrl.hostname,
      port: Number(dbUrl.port || 3306),
      user: decodeURIComponent(dbUrl.username),
      password: decodeURIComponent(dbUrl.password),
      database: decodeURIComponent(dbUrl.pathname.slice(1)),
      multipleStatements: true,
      supportBigNumbers: true,
      bigNumberStrings: true,
    });

    console.log('✅ Connected to database');

    // Read the SQL script
    console.log('📖 Reading collation fix script...');
    const sqlScript = fs.readFileSync('./fix_collation.sql', 'utf-8');
    console.log(`📄 Script size: ${sqlScript.length} bytes`);
    
    console.log('📝 Executing collation fix script...');
    console.log('⏳ This may take a few minutes...');
    
    // Execute the script
    const result = await connection.query(sqlScript);
    
    console.log('✅ Collation fix completed successfully');
    console.log(`📊 Affected statements: ${Array.isArray(result) ? result.length : 1}`);
    
    await connection.end();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    if (error.code) console.error('Code:', error.code);
    if (error.errno) console.error('Errno:', error.errno);
    if (error.sqlMessage) console.error('SQL Error:', error.sqlMessage);
    process.exit(1);
  }
}

runCollationFix();
