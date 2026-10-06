/**
 * Test Utilities & Helpers
 * Common functions for unit, integration, and e2e tests
 */

import { vi } from "vitest";

/**
 * Mock database connection
 */
export const createMockDbConnection = () => ({
  query: vi.fn(),
  execute: vi.fn(),
  transaction: vi.fn(),
  close: vi.fn(),
});

/**
 * Mock tRPC caller
 */
export const createMockTrpcCaller = (procedures: Record<string, any> = {}) => {
  return {
    auth: {
      login: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
    },
    users: {
      list: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    ...procedures,
  };
};

/**
 * Mock authentication context
 */
export const createMockAuthContext = (overrides = {}) => ({
  user: {
    id: "test-user-1",
    email: "test@example.com",
    role: "user",
    organizationId: "org-1",
    permissions: ["read", "write"],
    ...overrides,
  },
  isAuthenticated: true,
  isLoading: false,
  login: vi.fn(),
  logout: vi.fn(),
});

/**
 * Create mock API response
 */
export const createMockApiResponse = (data: any, status = 200) => ({
  data,
  status,
  ok: status >= 200 && status < 300,
  headers: new Headers(),
  json: vi.fn().mockResolvedValue(data),
  text: vi.fn().mockResolvedValue(JSON.stringify(data)),
});

/**
 * Create test user
 */
export const createTestUser = (overrides = {}) => ({
  id: "user-test-" + Math.random().toString(36).substr(2, 9),
  email: "test-" + Math.random().toString(36).substr(2, 9) + "@example.com",
  firstName: "Test",
  lastName: "User",
  role: "user",
  organizationId: "org-test-1",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Create test organization
 */
export const createTestOrganization = (overrides = {}) => ({
  id: "org-test-" + Math.random().toString(36).substr(2, 9),
  name: "Test Organization",
  slug: "test-org-" + Math.random().toString(36).substr(2, 9),
  tier: "professional",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Test database seeding utility
 */
export const seedTestDatabase = async (db: any, data: Record<string, any[]>) => {
  for (const [table, records] of Object.entries(data)) {
    for (const record of records) {
      await db.query(
        `INSERT INTO ${table} SET ?`,
        record
      );
    }
  }
};

/**
 * Clean up test data
 */
export const cleanupTestDatabase = async (
  db: any,
  tables: string[]
) => {
  for (const table of tables) {
    await db.query(`TRUNCATE TABLE ${table}`);
  }
};

/**
 * Wait for async operation
 */
export const waitFor = (
  callback: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const timer = setInterval(async () => {
      try {
        const result = await callback();
        if (result) {
          clearInterval(timer);
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(timer);
          reject(new Error(`Timeout waiting for condition after ${timeout}ms`));
        }
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          clearInterval(timer);
          reject(error);
        }
      }
    }, interval);
  });
};

/**
 * Mock localStorage
 */
export const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  return {
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
};

/**
 * Assert API error response
 */
export const assertApiError = (response: any, expectedStatus: number, expectedCode?: string) => {
  expect(response.status).toBe(expectedStatus);
  if (expectedCode) {
    expect(response.data?.code).toBe(expectedCode);
  }
};

/**
 * Mock permission context
 */
export const createMockPermissionContext = (permissions: string[] = []) => ({
  hasPermission: vi.fn((perm: string) =>
    permissions.includes("*") || permissions.includes(perm)
  ),
  hasAnyPermission: vi.fn((perms: string[]) =>
    permissions.includes("*") || perms.some((p) => permissions.includes(p))
  ),
  hasAllPermissions: vi.fn((perms: string[]) =>
    permissions.includes("*") || perms.every((p) => permissions.includes(p))
  ),
  permissions,
});
