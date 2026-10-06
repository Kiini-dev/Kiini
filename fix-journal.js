import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read all migration files
const migrationsDir = path.join(__dirname, 'drizzle', 'migrations');
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(f => f.match(/^\d{4}_.*\.sql$/))
  .sort();

console.log(`Found ${migrationFiles.length} migration files`);

// Build the migration tags from filenames
const entries = migrationFiles.map((file, idx) => {
  // Remove .sql extension and extract the tag
  const tag = file.replace('.sql', '');
  return {
    idx,
    version: '7',
    when: 1700000000000 + (idx * 1000),
    tag,
    breakpoints: true
  };
});

// Create journal object
const journal = {
  version: '7',
  dialect: 'mysql',
  entries
};

// Write journal file
const journalPath = path.join(migrationsDir, 'meta', '_journal.json');
fs.writeFileSync(journalPath, JSON.stringify(journal, null, 2));

console.log(`✅ Updated journal with ${entries.length} entries`);
console.log(`Last entry: idx=${entries[entries.length-1].idx}, tag=${entries[entries.length-1].tag}`);
