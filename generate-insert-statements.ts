import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDir = path.join(__dirname, 'drizzle', 'migrations');

function calculateFileHash(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function generateInsertStatements() {
  // Get all migration files sorted by name
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();

  console.log(`Found ${migrationFiles.length} migration files\n`);

  const now = Date.now();
  let sqlStatements: string[] = [];

  for (let i = 0; i < migrationFiles.length; i++) {
    const file = migrationFiles[i];
    const filePath = path.join(migrationsDir, file);
    const hash = calculateFileHash(filePath);
    const timestamp = now + i;

    sqlStatements.push(
      `INSERT INTO drizzle_migrations (hash, created_at) VALUES ('${hash}', ${timestamp});`
    );
    console.log(`${String(i + 1).padStart(2, '0')}. ${file.padEnd(40)} → ${hash.substring(0, 16)}...`);
  }

  // Write to SQL file
  const outputPath = path.join(__dirname, 'populate-migrations.sql');
  fs.writeFileSync(outputPath, sqlStatements.join('\n'));

  console.log(`\n✨ Generated ${sqlStatements.length} INSERT statements`);
  console.log(`📝 Written to: populate-migrations.sql`);
  console.log(`📊 Total size: ${(sqlStatements.join('\n').length / 1024).toFixed(2)} KB`);
}

generateInsertStatements().catch(console.error);
