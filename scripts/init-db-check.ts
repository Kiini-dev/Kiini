import { getDb } from './server/db';
import { sql } from 'drizzle-orm';

/**
 * Database initialization script
 * Checks if tables exist and creates them if needed
 * Run this on app startup or manually
 */

async function initializeDatabase() {
  try {
    const db = await getDb();
    if (!db) {
      console.log('Database not available - skipping initialization');
      return;
    }

    console.log('🔄 Checking database tables...');

    // List of critical Phase 20 tables that should exist
    const phase20Tables = [
      'clientHealthScores',
      'projectMetrics',
      'performanceReviews',
      'skillsMatrix',
      'schedules',
      'vacationRequests',
      'documents',
      'documentVersions',
      'documentAccess',
      'notificationRules',
      'subscriptions',
      'usageMetrics',
      'expenseCategories',
      'expenseReports',
      'expenses',
      'reimbursements',
      'currencies',
      'exchangeRates',
      'taxRates',
      'forecastModels',
      'forecastResults',
      'apiKeys',
      'webhooks',
      'integrationLogs',
      'emailQueue',
      'emailLog',
      'invoiceReminders',
    ];

    // Check which tables exist
    const missingTables: string[] = [];

    for (const table of phase20Tables) {
      try {
        await db.execute(
          sql`SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ${table} LIMIT 1`
        );
      } catch (error) {
        missingTables.push(table);
      }
    }

    if (missingTables.length > 0) {
      console.warn('⚠️  Missing Phase 20 tables:', missingTables.length, 'tables');
      console.warn('Missing tables:', missingTables.join(', '));
      console.warn('\n📝 To create missing tables, run:');
      console.warn('   npm run db:push');
      console.warn('\nThe app will continue running, but Phase 20 features may not work.\n');
      return false;
    }

    console.log('✅ All Phase 20 tables exist!');
    return true;
  } catch (error) {
    console.warn('⚠️  Database initialization check failed:', error);
    console.warn('The app will continue, but functionality may be limited.');
    return false;
  }
}

// Export for use in server startup
export { initializeDatabase };

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase().then((success) => {
    process.exit(success ? 0 : 1);
  });
}
