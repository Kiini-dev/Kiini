import { getDb } from './server/db.ts';
import fs from 'fs';

async function runPricingPlansMigration() {
  try {
    console.log('Connecting to database...');
    const db = await getDb();

    if (!db) {
      throw new Error('Failed to connect to database');
    }

    console.log('Reading SQL file...');
    const sqlContent = fs.readFileSync('insert_pricing_plans.sql', 'utf8');

    console.log('Executing SQL...');
    // Split SQL into individual statements and execute them
    const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 50) + '...');
        await db.execute(statement.trim());
      }
    }

    console.log('✅ Pricing plans migration completed successfully!');
  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  }
}

runPricingPlansMigration();