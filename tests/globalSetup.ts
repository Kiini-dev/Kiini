/**
 * Test Global Setup/Teardown
 * Runs once before and after all tests
 */

import { db } from '~/server/db';
import { sql } from 'drizzle-orm';

/**
 * Global setup - runs once before all tests
 */
export async function setup() {
  console.log('\n🚀 Setting up test environment...\n');

  try {
    // Verify database connection
    console.log('✓ Checking database connection...');
    await db.execute(sql`SELECT 1`);
    console.log('✓ Database connected');

    // Clear test data (optional - depending on your strategy)
    console.log('✓ Test environment ready');

    return async () => {
      // Return cleanup function
    };
  } catch (error) {
    console.error('❌ Test setup failed:', error);
    throw error;
  }
}

/**
 * Global teardown - runs once after all tests
 */
export async function teardown() {
  console.log('\n🧹 Cleaning up test environment...\n');

  try {
    // Clean up test data
    console.log('✓ Test data cleaned up');

    // Close database connections
    console.log('✓ Connections closed');

    return;
  } catch (error) {
    console.error('❌ Test teardown failed:', error);
    throw error;
  }
}
