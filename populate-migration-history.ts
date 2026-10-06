import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname, 'drizzle', 'migrations');

async function calculateFileHash(filePath: string): Promise<string> {
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function populateMigrationHistory() {
  try {
    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3307'),
      user: process.env.DB_USER || 'kiini_user',
      password: process.env.DB_PASSWORD || 'kiini_password',
      database: process.env.DB_NAME || 'kiini-one-hub-total-control',
    });

    console.log('✅ Connected to database');

    // Create drizzle_migrations table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`drizzle_migrations\` (
        \`id\` SERIAL PRIMARY KEY,
        \`hash\` TEXT NOT NULL UNIQUE,
        \`created_at\` BIGINT NOT NULL
      )
    `);
    console.log('✅ Ensured drizzle_migrations table exists');

    // Get all migration files sorted by name
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📁 Found ${migrationFiles.length} migration files`);

    // Calculate hashes and insert
    const now = Date.now();
    let inserted = 0;
    let skipped = 0;

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const hash = await calculateFileHash(filePath);

      try {
        await connection.execute(
          `INSERT INTO \`drizzle_migrations\` (hash, created_at) VALUES (?, ?)`,
          [hash, now + inserted]
        );
        inserted++;
        console.log(`✅ ${file} → ${hash.substring(0, 12)}...`);
      } catch (err: any) {
        if (err.code === 'ER_DUP_ENTRY') {
          skipped++;
          console.log(`⏭️  ${file} (already exists)`);
        } else {
          throw err;
        }
      }
    }

    console.log(`\n✨ Migration history populated:`);
    console.log(`   - Inserted: ${inserted}`);
    console.log(`   - Skipped (already existed): ${skipped}`);
    console.log(`   - Total: ${inserted + skipped}`);

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

populateMigrationHistory();
