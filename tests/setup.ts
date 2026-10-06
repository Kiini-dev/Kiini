/**
 * Test Setup File
 * Runs before each test suite to configure environment
 */

import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { getDb } from '../server/db';
import { createMockLocalStorage } from './utils/testHelpers';

/**
 * Configure test environment
 */
beforeAll(async () => {
  console.log('\n📋 Initializing test suite...\n');

  // Set test environment variable
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error'; // Suppress logs during tests

  // Provide a consistent localStorage mock for browser-like tests.
  globalThis.localStorage = createMockLocalStorage() as any;

  if (process.env.DATABASE_URL) {
    try {
      const initializedDb = await getDb();
      if (initializedDb) {
        console.log('✓ Test database initialized');
      } else {
        console.warn('⚠️ Test database not available; continuing with mocks');
      }
    } catch (error) {
      console.warn('⚠️ Test database initialization skipped:', error);
    }
  }
});

/**
 * Clean up after each test
 */
afterEach(async () => {
  // Clear all mocks
  vi.clearAllMocks();

  // Reset module state if needed
  vi.resetModules();
});

/**
 * Final cleanup after all tests
 */
afterAll(async () => {
  console.log('\n✅ Test suite completed\n');

  // Close connections if needed
  try {
    // Add any cleanup here
  } catch (error) {
    console.error('⚠️ Cleanup warning:', error);
  }
});

/**
 * Mock implementations for test environment
 */

// Mock Stripe if needed
vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    paymentIntents: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
    invoices: {
      create: vi.fn(),
      sendInvoice: vi.fn(),
    },
  })),
}));

// Mock email service if needed
vi.mock('~/server/services/email', () => ({
  sendEmail: vi.fn(async () => ({ success: true })),
  sendTrialExpiringEmail: vi.fn(async () => ({ success: true })),
  sendPaymentFailedEmail: vi.fn(async () => ({ success: true })),
}));

// Mock logger
vi.mock('~/server/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

/**
 * Test utilities
 */

export async function seedTestData() {
  // Seed initial test data if needed
  console.log('🌱 Seeding test data...');
}

export async function clearTestData() {
  // Clear test data after each test
  console.log('🧹 Clearing test data...');
}

export function setupMockStripe() {
  return {
    paymentIntents: {
      create: vi.fn(async () => ({
        id: 'pi_test123',
        status: 'succeeded',
        amount: 9999,
      })),
    },
  };
}

export function setupMockMailer() {
  return {
    sendEmail: vi.fn(async () => ({ success: true })),
  };
}
