import { getDb } from './server/db.js';

async function checkTables() {
  console.log('Checking tables...');
  const db = await getDb();
  if (!db) {
    console.log('Database connection failed');
    return;
  }

  try {
    const result = await db.execute('SHOW TABLES LIKE "budgetAllocations"');
    console.log('budgetAllocations exists:', result.length > 0);
  } catch (e) {
    console.log('budgetAllocations error:', e.message);
  }
  try {
    const result = await db.execute('SHOW TABLES LIKE "lpos"');
    console.log('lpos exists:', result.length > 0);
  } catch (e) {
    console.log('lpos error:', e.message);
  }
  try {
    const result = await db.execute('SHOW TABLES LIKE "lpoLineItems"');
    console.log('lpoLineItems exists:', result.length > 0);
  } catch (e) {
    console.log('lpoLineItems error:', e.message);
  }
}

checkTables().catch(console.error);