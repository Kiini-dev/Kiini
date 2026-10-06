import { eq, desc, and, gte, lte, sql, or, like, inArray, isNotNull, isNull, count, sum } from "drizzle-orm";
import { drizzle as drizzleMySql } from "drizzle-orm/mysql2";
import { migrate as drizzleMigrate } from "drizzle-orm/mysql2/migrator";
import * as mysql from "mysql2/promise";

// sqlite support for tests will be dynamically imported below when needed
import {
  users,
  clients,
  products,
  services,
  estimates,
  estimateItems,
  invoices,
  invoiceItems,
  receipts,
  payments,
  paymentMethods,
  billingNotifications,
  billingUsageMetrics,
  dunningPolicies,
  paymentRetries,
  dunningEvents,
  smsQueue,
  smsTemplates,
  smsAutomationRules,
  smsDeliveryEvents,
  integrationConfigs,
  expenses,
  accounts,
  journalEntries,
  journalEntryLines,
  lineItems,
  bankAccounts,
  bankTransactions,
  employees,
  leaveRequests,
  payroll,
  opportunities,
  templates,
  activityLog,
  settings,
  projects,
  projectTasks,
  notifications,
  documentNumberFormats,
  defaultSettings,
  rolePermissions,
  permissions,
  userRoles,
  userPermissions,
  permissionMetadata,
  departments,
  budgets,
  subscriptions,
  pricingPlans,
  organizations,
  organizationFeatures,
  tenantMessages,
  pricingTierFeatures,
  exportJobs,
  organizationUsers,
} from "../drizzle/schema";
import { organizationMembers } from "../drizzle/schema-extended";
import { v4 } from "uuid";
import { resolveDbConnectionLimit } from "./utils/databasePoolConfig";

// Insert/DTO types are not exported from generated schema in this repo.
// Provide local aliases to `any` to allow iterative type fixing.
type InsertUser = any;
type InsertClient = any;
type InsertProduct = any;
type InsertService = any;
type InsertEstimate = any;
type InsertEstimateItem = any;
type InsertInvoice = any;
type InsertInvoiceItem = any;
type InsertPayment = any;
type InsertExpense = any;
type InsertAccount = any;
type InsertJournalEntry = any;
type InsertJournalEntryLine = any;
type InsertBankAccount = any;
type InsertBankTransaction = any;
type InsertEmployee = any;
type InsertLeaveRequest = any;
type InsertPayroll = any;
type InsertOpportunity = any;
type InsertTemplate = any;
type InsertActivityLog = any;
type InsertSetting = any;
type InsertProject = any;
type InsertProjectTask = any;
type InsertNotification = any;
type InsertDocumentNumberFormat = any;
type InsertDefaultSetting = any;
type InsertRolePermission = any;
type InsertPermission = any;
type InsertUserRole = any;
import { ENV } from './_core/env';
import { DEFAULT_TIER_FEATURES, DEFAULT_TIER_PRICING, parseTierPricingOverrides, resolveTierPricingEntry } from './services/tierPricing';
import { getMissingColumnsForTable, getMissingTableDefinitions, getRuntimeSchemaCheckTargets } from './utils/legacySchemaCompatibility';

let _db: any = null;
let _pool: mysql.Pool | null = null;
let _migrationsRun = false;
let _dbInitialization: Promise<any> | null = null;
const DB_CONNECTION_LIMIT = resolveDbConnectionLimit(process.env.DB_CONNECTION_LIMIT);

// Getter for the drizzle db instance (for files that need sync access after initialization)
export function getDbInstance() {
  return _db;
}

function createLegacyDbCompat(instance: any = {}) {
  return new Proxy(instance, {
    get(target: any, prop: string | symbol, receiver: any) {
      if (typeof prop === 'symbol') {
        return Reflect.get(target, prop, receiver);
      }

      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }

      const propName = String(prop);

      if (propName === 'raw') {
        return async (query: string, params: any[] = []) => {
          if (!_pool) {
            return [];
          }
          try {
            const [rows] = await _pool.execute(query, params as any);
            return rows;
          } catch (error) {
            console.warn('[Database compat] raw query failed:', error);
            return [];
          }
        };
      }

      // Prevent the compatibility proxy from being treated as a Promise by await.
      if (propName === 'then') {
        return undefined;
      }

      if (propName === 'collection') {
        return (tableName: string) => {
          const builder: any = {
            tableName,
            where: (..._args: any[]) => builder,
            orderBy: (..._args: any[]) => builder,
            limit: (..._args: any[]) => builder,
            offset: (..._args: any[]) => builder,
            then: (resolve: any, reject?: any) => Promise.resolve([]).then(resolve, reject),
            catch: (reject: any) => Promise.resolve([]).catch(reject),
          };
          return builder;
        };
      }

      if (propName === 'logActivity') {
        return logActivity;
      }

      return (..._args: any[]) => {
        console.warn(`[Database compat] Unsupported legacy DB method "${propName}" called. Returning empty result.`);
        return Promise.resolve([]);
      };
    },
  });
}

// Export db for compatibility with code expecting direct access
export const db = createLegacyDbCompat();

// helpers used in unit tests to override or reset database instance
export function __setDbForTests(dbInstance: any) {
  _db = createLegacyDbCompat(dbInstance);
}

export function __resetDbForTests() {
  _db = null;
  _dbInitialization = null;
  _pool = null;
}

/** Expose the underlying mysql2 pool for raw SQL queries */
export function getPool() {
  return _pool;
}

export async function getRawPool(): Promise<mysql.Pool | null> {
  if (_pool) return _pool;
  if (!process.env.DATABASE_URL) return null;
  await getDb();
  return _pool;
}

// Lazily create the drizzle instance so local tooling can run without a DB.
async function initializeDb(): Promise<any> {
  // primary path: MySQL via DATABASE_URL
  if (!_db && process.env.DATABASE_URL) {
    try {
      console.log("[Database] Attempting to create drizzle connection...");
      if (!_pool) {
        _pool = await mysql.createPool({
          uri: process.env.DATABASE_URL,
          waitForConnections: true,
          connectionLimit: DB_CONNECTION_LIMIT,
          queueLimit: 100,
          connectTimeout: 5000,
          multipleStatements: true,
        });

        // Validate the production connection before exposing it to requests.
        // Without this, a broken MySQL connection can leave every API query
        // waiting in the pool until the hosting proxy returns HTML 504.
        const connection = await Promise.race([
          _pool.getConnection(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Database connection validation timed out')), 5000),
          ),
        ]);
        try {
          await connection.ping();
        } finally {
          connection.release();
        }
      }
      _db = createLegacyDbCompat(drizzleMySql(_pool) as any);
      console.log("[Database] ✅ Drizzle connection created successfully");

      // Production instances should self-heal schema drift unless a deployment explicitly opts out.
      const shouldRunRuntimeMigrations = process.env.NODE_ENV !== 'production' || process.env.RUN_DRIZZLE_MIGRATIONS !== 'false';
      console.log("[Database] Runtime migrations enabled:", shouldRunRuntimeMigrations);

      if (!shouldRunRuntimeMigrations && process.env.RUN_RUNTIME_SCHEMA_CHECKS !== 'true') {
        _migrationsRun = true;
        console.log('[Database] Fast production initialization: migrations and schema checks disabled');
        return _db;
      }

      // Run migrations automatically on first connection (unless explicitly skipped)
      if (!_migrationsRun && _db && process.env.NODE_ENV !== 'test') {
        if (shouldRunRuntimeMigrations) {
          try {
            console.log("[Database] Running migrations...");
            await drizzleMigrate(_db, { migrationsFolder: "./drizzle/migrations" });
            _migrationsRun = true;
            console.log("[Database] ✅ Migrations completed successfully");
          } catch (migrationError) {
            console.error("[Database] ❌ Migration failed:",
              migrationError instanceof Error ? migrationError.message : migrationError);
            _migrationsRun = true;
            console.warn('[Database] Keeping the validated database connection and continuing with runtime schema compatibility checks');
          }
        } else {
          _migrationsRun = true;
          console.log("[Database] Skipping runtime drizzle migrations in production");
        }

        const shouldRunRuntimeSchemaChecks = process.env.NODE_ENV !== 'production' || process.env.RUN_RUNTIME_SCHEMA_CHECKS !== 'false';

        if (!shouldRunRuntimeSchemaChecks) {
          console.log('[Database] Skipping runtime schema compatibility checks in production');
        }

        if (shouldRunRuntimeSchemaChecks) {
        const legacyTablesToCheck = getRuntimeSchemaCheckTargets();

        try {
          const [tableList] = await _pool!.query('SHOW TABLES' as string);
          const tableNames = Array.isArray(tableList)
            ? tableList.map((row: any) => {
                const value = Object.values(row)[0];
                return String(value ?? '').toLowerCase();
              })
            : [];

          const missingTables = getMissingTableDefinitions(tableNames);
          if (missingTables.length > 0) {
            console.warn('[Database] Missing legacy tables detected, creating compatibility tables:', missingTables.map((table) => table.name));
            for (const table of missingTables) {
              await _pool!.query(table.createSql as string);
              console.log(`[Database] ✅ ${table.name} table compatibility table created`);
            }
          }
        } catch (schemaError) {
          console.warn('[Database] Could not verify/create missing legacy tables:', schemaError instanceof Error ? schemaError.message : schemaError);
        }

        for (const tableName of legacyTablesToCheck) {
          try {
            const [tableResults] = await _pool!.query(`SHOW COLUMNS FROM ${tableName}` as string);
            const tableColumns = Array.isArray(tableResults)
              ? tableResults.map((row: any) => String(row.Field || row.field || "").toLowerCase())
              : [];
            const missingColumns = getMissingColumnsForTable(tableName, tableColumns);

            if (missingColumns.length > 0) {
              console.warn(`[Database] ${tableName} table missing columns, applying compatibility patch:`, missingColumns.map((column) => column.name));
              for (const column of missingColumns) {
                await _pool!.query(`ALTER TABLE ${tableName} ADD COLUMN ${column.name} ${column.definition}` as string);
              }
              console.log(`[Database] ✅ ${tableName} table compatibility patch completed`);
            }
          } catch (schemaError) {
            console.warn(`[Database] Could not verify/patch ${tableName} schema:`, schemaError instanceof Error ? schemaError.message : schemaError);
          }
        }

        try {
          await _pool!.query('ALTER TABLE onboardingChecklists MODIFY COLUMN jobGroupId varchar(64) NULL' as string);
          await _pool!.query('ALTER TABLE trainingEnrollments MODIFY COLUMN courseId varchar(64) NULL, MODIFY COLUMN enrollmentDate datetime NULL' as string);
          await _pool!.query("ALTER TABLE organizations MODIFY COLUMN urlMode enum('path','subdomain') NOT NULL DEFAULT 'subdomain'" as string);
          await _pool!.query('ALTER TABLE expenses MODIFY COLUMN chartOfAccountId varchar(64) NULL' as string);
          await _pool!.query('ALTER TABLE payments MODIFY COLUMN chartOfAccountId varchar(64) NULL' as string);
          await _pool!.query('ALTER TABLE recurringExpenses MODIFY COLUMN chartOfAccountId varchar(64) NULL' as string);
        } catch (schemaError) {
          console.warn('[Database] Could not align onboarding/training compatibility columns:', schemaError instanceof Error ? schemaError.message : schemaError);
        }

        for (const tableName of ['expenses', 'recurringExpenses']) {
          try {
            await _pool!.query(`ALTER TABLE ${tableName} MODIFY COLUMN paymentMethod ENUM('cash','bank_transfer','cheque','card','mpesa','other') NULL DEFAULT NULL` as string);
          } catch (schemaError) {
            console.warn(`[Database] Could not standardize ${tableName}.paymentMethod:`, schemaError instanceof Error ? schemaError.message : schemaError);
          }
        }

        try {
          await _pool!.query("ALTER TABLE invoicePayments MODIFY COLUMN paymentMethod ENUM('cash','bank_transfer','check','mobile_money','credit_card','cheque','mpesa','card','other') NOT NULL" as string);
          await _pool!.query("UPDATE invoicePayments SET paymentMethod = 'cheque' WHERE paymentMethod = 'check'" as string);
          await _pool!.query("UPDATE invoicePayments SET paymentMethod = 'mpesa' WHERE paymentMethod = 'mobile_money'" as string);
          await _pool!.query("UPDATE invoicePayments SET paymentMethod = 'card' WHERE paymentMethod = 'credit_card'" as string);
          await _pool!.query("ALTER TABLE invoicePayments MODIFY COLUMN paymentMethod ENUM('cash','bank_transfer','cheque','mpesa','card','other') NOT NULL" as string);
        } catch (schemaError) {
          console.warn('[Database] Could not standardize invoicePayments.paymentMethod:', schemaError instanceof Error ? schemaError.message : schemaError);
        }

        try {
          await _pool!.query('ALTER TABLE employees MODIFY COLUMN photoUrl LONGTEXT NULL' as string);
          console.log('[Database] ✅ employees.photoUrl is compatible with inline employee photos');
        } catch (schemaError) {
          console.warn('[Database] Could not expand employees.photoUrl:', schemaError instanceof Error ? schemaError.message : schemaError);
        }
        }
      }
    } catch (error) {
      console.error("[Database] ❌ Failed to connect:", error instanceof Error ? error.message : error);
      _db = null;
      _pool = null;
    }
  }

  // fallback for tests: use sqlite in-memory when DATABASE_URL missing
  if (!_db && process.env.NODE_ENV === "test") {
    try {
      console.log("[Database] Creating sqlite in-memory DB for tests...");
      // dynamic import to avoid requiring sqlite native bindings in production
      // use a variable string so that bundlers cannot statically
      // resolve the subpath and complain about package exports.
      const sqlitePkg = "drizzle-orm/better-sqlite3";
      const betterSqlitePkg = "better-sqlite3";
      const [{ drizzle: drizzleSqlite }, BetterSqlite3] = await Promise.all([
        import(sqlitePkg),
        import(betterSqlitePkg),
      ] as any);
      const conn = new BetterSqlite3.default(":memory:");
      _db = createLegacyDbCompat(drizzleSqlite(conn as any));
      // Note: migrations should be applied externally if needed; tests skip if tables absent.
    } catch (err) {
      console.warn("[Database] sqlite memory init failed", err);
      _db = null;
    }
  }

  if (!_db && !process.env.DATABASE_URL) {
    console.warn("[Database] DATABASE_URL not set");
  }
  return _db;
}

// Concurrent requests during startup must share one initialization attempt.
// Otherwise each request can create its own pool and wait on the same database.
export async function getDb(): Promise<any> {
  if (_db) return _db;
  if (!_dbInitialization) {
    _dbInitialization = initializeDb().finally(() => {
      if (!_db) _dbInitialization = null;
    });
  }
  return _dbInitialization;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = [
      "name",
      "email",
      "loginMethod",
      "department",
      "clientId",
      "permissions",
      "passwordResetToken",
      "twoFactorSecret",
      "phone",
      "company",
      "position",
      "address",
      "city",
      "country",
      "photoUrl",
      "organizationId",
      "customRoleId",
    ] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.isActive !== undefined) {
      const activeValue = typeof user.isActive === 'boolean' ? (user.isActive ? 1 : 0) : user.isActive;
      values.isActive = activeValue;
      updateSet.isActive = activeValue;
    }

    if (user.passwordHash !== undefined) {
      values.passwordHash = user.passwordHash;
      updateSet.passwordHash = user.passwordHash;
    }

    if (user.requiresPasswordChange !== undefined) {
      const requiresPasswordChangeValue = typeof user.requiresPasswordChange === 'boolean' ? (user.requiresPasswordChange ? 1 : 0) : user.requiresPasswordChange;
      values.requiresPasswordChange = requiresPasswordChangeValue;
      updateSet.requiresPasswordChange = requiresPasswordChangeValue;
    }

    if ((user as any).failedLoginAttempts !== undefined) {
      values.failedLoginAttempts = (user as any).failedLoginAttempts;
      updateSet.failedLoginAttempts = (user as any).failedLoginAttempts;
    }

    if ((user as any).lockedUntil !== undefined) {
      values.lockedUntil = (user as any).lockedUntil;
      updateSet.lockedUntil = (user as any).lockedUntil;
    }

    if ((user as any).lockoutCount !== undefined) {
      values.lockoutCount = (user as any).lockoutCount;
      updateSet.lockoutCount = (user as any).lockoutCount;
    }

    if ((user as any).emailVerificationRequired !== undefined) {
      const verificationRequired = typeof (user as any).emailVerificationRequired === 'boolean'
        ? ((user as any).emailVerificationRequired ? 1 : 0)
        : (user as any).emailVerificationRequired;
      values.emailVerificationRequired = verificationRequired;
      updateSet.emailVerificationRequired = verificationRequired;
    } else if (user.passwordHash !== undefined && user.loginMethod === 'local' && user.id !== ENV.platformOwnerId) {
      values.emailVerificationRequired = 1;
      updateSet.emailVerificationRequired = 1;
    }

    if ((user as any).twoFactorEnabled !== undefined) {
      values.twoFactorEnabled = typeof (user as any).twoFactorEnabled === 'boolean' ? ((user as any).twoFactorEnabled ? 1 : 0) : (user as any).twoFactorEnabled;
      updateSet.twoFactorEnabled = values.twoFactorEnabled;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }

    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.id === ENV.platformOwnerId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (values.email === undefined || values.email === null || values.email === "") {
      const placeholder = `${user.id}@no-email.local`;
      values.email = placeholder;
    }
    if (values.name === undefined || values.name === null) {
      values.name = "";
    }
    if (values.loginMethod === undefined || values.loginMethod === null) {
      values.loginMethod = "local";
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const pool = getPool() || await getRawPool();
  if (pool) {
    try {
      const [rows] = await pool.execute("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
      const user = (rows as any[])[0];
      if (user) return user;
    } catch (error) {
      console.warn("[Database] Raw user-id lookup failed; using Drizzle:", error);
    }
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: string) {
  return getUser(id);
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUser(id: string, data: Partial<InsertUser> & { isActive?: boolean | number; department?: string | null; passwordHash?: string | null }) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  try {
    const updateSet: Record<string, unknown> = {};
    
    if (data.name !== undefined) updateSet.name = data.name;
    if (data.email !== undefined) updateSet.email = data.email;
    if (data.loginMethod !== undefined) updateSet.loginMethod = data.loginMethod;
    if (data.role !== undefined) updateSet.role = data.role;
    if (data.lastSignedIn !== undefined) updateSet.lastSignedIn = data.lastSignedIn;
    if (data.department !== undefined) updateSet.department = data.department;
    if (data.isActive !== undefined) updateSet.isActive = typeof data.isActive === 'boolean' ? (data.isActive ? 1 : 0) : data.isActive;
    if (data.passwordHash !== undefined) updateSet.passwordHash = data.passwordHash;
    if (data.phone !== undefined) updateSet.phone = data.phone;
    if (data.company !== undefined) updateSet.company = data.company;
    if (data.position !== undefined) updateSet.position = data.position;
    if (data.photoUrl !== undefined) updateSet.photoUrl = data.photoUrl;
    if ((data as any).twoFactorEnabled !== undefined) updateSet.twoFactorEnabled = typeof (data as any).twoFactorEnabled === 'boolean' ? ((data as any).twoFactorEnabled ? 1 : 0) : (data as any).twoFactorEnabled;
    if ((data as any).twoFactorSecret !== undefined) updateSet.twoFactorSecret = (data as any).twoFactorSecret;
    
    if (Object.keys(updateSet).length === 0) {
      return getUser(id); // Nothing to update, return current user
    }
    
    await db.update(users).set(updateSet).where(eq(users.id, id));
    const updated = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return updated[0] ?? null;
  } catch (error) {
    console.error("[Database] Failed to update user:", error);
    throw error;
  }
}

// ============= USER PASSWORD MANAGEMENT =============

export async function setUserPassword(userId: string, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));
}

export async function getUserPassword(userId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0].passwordHash : null;
}

// ============= NOTIFICATIONS =============

export async function createNotification(notification: Omit<InsertNotification, 'id'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const notificationData = { ...(notification as any), id } as any;
  
  await db.insert(notifications).values(notificationData);

  // Backward-compatible websocket broadcast (no-op if websocket server is not wired).
  try {
    const { broadcastNotification } = await import("../server/websocket/notificationBroadcaster");
    await broadcastNotification(notification.userId, notificationData as any);
  } catch (error) {
    console.warn("Could not broadcast notification, websocket may not be available:", error);
  }

  // Primary real-time channel: SSE broadcast to org/user stream.
  try {
    const { notifyOrg, notifyUser } = await import("./sse");
    const [targetUser] = await db
      .select({ id: users.id, organizationId: users.organizationId })
      .from(users)
      .where(eq(users.id, notification.userId))
      .limit(1);

    const event = {
      id,
      type: "info" as const,
      title: (notification as any).title || "Notification",
      body: (notification as any).message || "You have a new update",
      href: (notification as any).actionUrl || undefined,
      timestamp: new Date().toISOString(),
    };

    if (targetUser?.organizationId) {
      notifyOrg(targetUser.organizationId, event);
    } else {
      notifyUser(notification.userId, event);
    }
  } catch (error) {
    console.warn("Could not broadcast notification over SSE:", error);
  }
  
  return id;
}

export async function getUserNotifications(userId: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadNotifications(userId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, 0)
    ))
    .orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(notificationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(notifications)
    .set({ readAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
    .where(eq(notifications.id, notificationId));
}

export async function markAllNotificationsAsRead(userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(notifications)
    .set({ readAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
    .where(and(
      eq(notifications.userId, userId),
      isNull(notifications.readAt)
    ));
}

export async function deleteNotification(notificationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(notifications).where(eq(notifications.id, notificationId));
}

// ============= PROJECTS =============

export async function createProject(project: Omit<InsertProject, 'id'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(projects).values({ ...(project as any), id } as any);
  return id;
}

export async function getProject(id: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllProjects() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(projects).orderBy(desc(projects.createdAt));
}

export async function getProjectsByClient(clientId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(projects)
    .where(eq(projects.clientId, clientId))
    .orderBy(desc(projects.createdAt));
}

export async function getProjectsByStatus(status: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(projects)
    .where(eq(projects.status, status as any))
    .orderBy(desc(projects.createdAt));
}

export async function updateProject(id: string, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
  .update(projects)
  .set({ ...data, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
  .where(eq(projects.id, id));
}

export async function deleteProject(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(projects).where(eq(projects.id, id));
}

// ============= PROJECT TASKS =============

export async function createProjectTask(task: Omit<InsertProjectTask, 'id'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(projectTasks).values({ ...(task as any), id } as any);
  return id;
}

export async function getProjectTasks(projectId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(projectTasks)
    .where(eq(projectTasks.projectId, projectId))
    .orderBy(projectTasks.order, desc(projectTasks.createdAt));
}

export async function updateProjectTask(id: string, data: Partial<InsertProjectTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
  .update(projectTasks)
  .set({ ...data, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
  .where(eq(projectTasks.id, id));
}

export async function deleteProjectTask(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(projectTasks).where(eq(projectTasks.id, id));
}

// ============= CLIENTS =============

export async function createClient(client: Omit<InsertClient, 'id'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(clients).values({ ...(client as any), id } as any);
  return id;
}

export async function getClient(id: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getClientById(id: string) {
  return getClient(id);
}

export async function getAllClients() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(clients).orderBy(desc(clients.createdAt));
}

export async function updateClient(id: string, data: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(clients)
    .set({ ...data, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
    .where(eq(clients.id, id));
}

export async function deleteClient(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(clients).where(eq(clients.id, id));
}

// ============= INVOICES =============

export async function createInvoice(invoice: Omit<InsertInvoice, 'id'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(invoices).values({ ...(invoice as any), id } as any);
  return id;
}

export async function getInvoice(id: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllInvoices() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
}

export async function getInvoicesByClient(clientId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(invoices)
    .where(eq(invoices.clientId, clientId))
    .orderBy(desc(invoices.createdAt));
}

export async function getClientInvoices(clientId: string, status?: string) {
  const list = await getInvoicesByClient(clientId);
  if (!status) return list;
  return list.filter((invoice: any) => invoice?.status === status);
}

export async function getInvoiceById(id: string) {
  return getInvoice(id);
}

export async function updateInvoice(id: string, data: Partial<InsertInvoice>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(invoices)
    .set({ ...data, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
    .where(eq(invoices.id, id));
}

// ============= ESTIMATES =============

export async function createEstimate(estimate: Omit<InsertEstimate, 'id'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `est_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(estimates).values({ ...(estimate as any), id } as any);
  return id;
}

export async function getEstimate(id: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(estimates).where(eq(estimates.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllEstimates() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(estimates).orderBy(desc(estimates.createdAt));
}

export async function getEstimatesByClient(clientId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(estimates)
    .where(eq(estimates.clientId, clientId))
    .orderBy(desc(estimates.createdAt));
}

export async function updateEstimate(id: string, data: Partial<InsertEstimate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(estimates)
    .set({ ...data, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
    .where(eq(estimates.id, id));
}

// ============= PAYMENTS =============

export async function createPayment(payment: Omit<InsertPayment, 'id'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(payments).values({ ...(payment as any), id } as any);
  return id;
}

export async function getPaymentsByInvoice(invoiceId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(payments)
    .where(eq(payments.invoiceId, invoiceId))
    .orderBy(desc(payments.paymentDate));
}

export async function getPaymentMethods(clientId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(paymentMethods)
    .where(and(eq(paymentMethods.clientId, clientId), eq(paymentMethods.isActive, 1)))
    .orderBy(desc(paymentMethods.createdAt));
}

export async function createPaymentMethod(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(paymentMethods).values(data);
  return data;
}

export function buildReceiptFromInvoicePayload(invoice: any, paymentId?: string, items: any[] = [], paymentAmount?: number) {
  const subtotal = Number(invoice?.subtotal ?? 0);
  const taxAmount = Number(invoice?.taxAmount ?? 0);
  const discountAmount = Number(invoice?.discountAmount ?? 0);
  const total = Number(invoice?.total ?? (subtotal + taxAmount - discountAmount));

  return {
    organizationId: invoice?.organizationId ?? null,
    receiptNumber: `REC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`,
    clientId: invoice?.clientId,
    paymentId: paymentId ?? null,
    amount: Number(paymentAmount ?? invoice?.total ?? total ?? 0),
    subtotal,
    taxAmount,
    discountAmount,
    paymentMethod: 'other',
    receiptDate: invoice?.issueDate ?? new Date().toISOString(),
    notes: `Auto-generated from invoice ${invoice?.invoiceNumber ?? invoice?.id ?? 'unknown'}`,
    createdBy: invoice?.createdBy ?? null,
    lineItems: (items || []).map((item: any, index: number) => ({
      description: item?.description || item?.itemDescription || item?.name || `Item ${index + 1}`,
      quantity: Number(item?.quantity ?? item?.qty ?? 1),
      unitPrice: Number(item?.unitPrice ?? item?.rate ?? 0),
      taxRate: Number(item?.taxRate ?? item?.tax ?? 0),
      total: Number(item?.total ?? item?.amount ?? 0),
    })),
  };
}

export async function createReceiptFromInvoice(invoiceId: string, context?: { paymentId?: string; paymentMethod?: string; amount?: number; receiptDate?: string | Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const invoice = await getInvoice(invoiceId);
  if (!invoice) return null;

  const invoiceItemsList = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  const payload = buildReceiptFromInvoicePayload(invoice, context?.paymentId, invoiceItemsList, context?.amount);
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const receiptId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const receiptRow: any = {
    id: receiptId,
    organizationId: payload.organizationId,
    receiptNumber: payload.receiptNumber,
    clientId: payload.clientId,
    paymentId: payload.paymentId,
    amount: Number(payload.amount ?? 0),
    subtotal: Number(payload.subtotal ?? 0),
    taxAmount: Number(payload.taxAmount ?? 0),
    discountAmount: Number(payload.discountAmount ?? 0),
    paymentMethod: (context?.paymentMethod || payload.paymentMethod || 'other') as any,
    receiptDate: context?.receiptDate ? new Date(context.receiptDate) : new Date(payload.receiptDate || now),
    notes: payload.notes,
    createdBy: payload.createdBy,
    createdAt: now,
  };

  await db.insert(receipts).values(receiptRow);

  if (payload.lineItems.length) {
    for (const [index, item] of payload.lineItems.entries()) {
      await db.insert(lineItems).values({
        id: `li_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 6)}`,
        documentId: receiptId,
        documentType: 'receipt',
        description: item.description,
        quantity: Number(item.quantity ?? 1),
        rate: Number(item.unitPrice ?? 0),
        amount: Number(item.total ?? 0),
        taxRate: Number(item.taxRate ?? 0),
        lineNumber: index + 1,
        createdBy: payload.createdBy,
        createdAt: now,
      } as any);
    }
  }

  return { ...receiptRow, id: receiptId, lineItems: payload.lineItems };
}

// ============= ACTIVITY LOG =============

export async function logActivity(activity: Omit<InsertActivityLog, 'id'>) {
  const db = await getDb();
  if (!db) return;
  
  const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Convert to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
  const mysqlDateTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  // Ensure all fields have safe defaults to avoid NOT NULL errors
  const logEntry = {
    id,
    userId: activity.userId,
    action: activity.action,
    entityType: activity.entityType || null,
    entityId: activity.entityId || null,
    description: activity.description || null,
    metadata: activity.metadata || null,
    ipAddress: activity.ipAddress || null,
    createdAt: mysqlDateTime,
  };
  
  try {
    await db.insert(activityLog).values(logEntry as any);
  } catch (error: any) {
    // Log detailed error but do not re-throw to prevent failing the calling operation
    console.error('Failed to insert activityLog entry:', {
      error: error?.message || error,
      code: error?.code,
      entry: logEntry,
    });
    // Graceful fallback: skip logging to DB when it fails
    return;
  }
}



// ============= SETTINGS =============

export async function getSetting(key: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(settings)
    .where(eq(settings.key, key))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getSettingsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(settings)
    .where(eq(settings.category, category))
    .orderBy(settings.key);
}

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(settings)
    .orderBy(settings.category, settings.key);
}

export async function setSetting(
  key: string,
  value: string,
  category?: string,
  description?: string,
  updatedBy?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Try to update first
  const existing = await getSetting(key);
  
  if (existing) {
    await db
      .update(settings)
      .set({
        value,
        category: category || existing.category,
        description: description || existing.description,
        updatedBy,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      })
      .where(eq(settings.key, key));
    
    return existing.id;
  } else {
    // Insert new setting
    await db.insert(settings).values({
      id,
      key,
      value,
      category,
      description,
      updatedBy,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    } as any);
    
    return id;
  }
}

export async function deleteSetting(key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(settings).where(eq(settings.key, key));
}

// ============= DOCUMENT NUMBER AUTO-INCREMENT =============

/**
 * Get the next document number for a given document type
 * Supports: invoice, estimate, receipt, proposal, expense
 */
export async function getNextDocumentNumber(documentType: string): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Use the new formatted numbering system
  return getNextDocumentNumberWithFormat(documentType);
}

function getDefaultPrefix(documentType: string): string {
  const prefixes: Record<string, string> = {
    invoice: 'INV-',
    estimate: 'EST-',
    receipt: 'REC-',
    proposal: 'PROP-',
    expense: 'EXP-',
    payment: 'PAY-',
    project: 'PROJ-',
    contract: 'CON-',
    quotation: 'QUO-',
    purchase_order: 'LPO-',
    credit_note: 'CN-',
    debit_note: 'DN-',
  };
  
  return prefixes[documentType] || 'DOC-';
}

/**
 * Reset document number counter for a given document type
 */
export async function resetDocumentNumberCounter(documentType: string, startNumber: number = 1) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const nextKey = `${documentType}_next`;
  await setSetting(nextKey, String(startNumber), 'document_numbering');
}

/**
 * Get all document numbering settings
 */
export async function getDocumentNumberingSettings() {
  const db = await getDb();
  if (!db) return {};
  
  const settings_list = await getSettingsByCategory('document_numbering');
  const result: Record<string, string> = {};

  settings_list.forEach((setting: { key: string; value?: string | null }) => {
    result[setting.key] = setting.value || '';
  });
  
  return result;
}



// ============= DOCUMENT NUMBER FORMATTING =============

export async function getDocumentNumberFormat(documentType: string) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db
      .select()
      .from(documentNumberFormats)
      .where(eq(documentNumberFormats.documentType, documentType as any))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error: any) {
    // If table doesn't exist, return null (graceful fallback)
    const code = error?.code || error?.errno || '';
    const msg = error?.message || '';
    if (code === 'ER_NO_SUCH_TABLE' || code === '42S02' || msg.includes("doesn't exist")) {
      console.warn('[Database] documentNumberFormats table missing - returning null');
      return null;
    }
    throw error;
  }
}

export async function updateDocumentNumberFormat(
  documentType: string,
  format: {
    prefix?: string;
    padding?: number;
    separator?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const existing = await getDocumentNumberFormat(documentType);
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    if (existing) {
      await db
        .update(documentNumberFormats)
        .set({
          prefix: format.prefix !== undefined ? format.prefix : existing.prefix,
          padding: format.padding !== undefined ? format.padding : existing.padding,
          separator: format.separator !== undefined ? format.separator : existing.separator,
          updatedAt: now,
        })
        .where(eq(documentNumberFormats.documentType, documentType as any));
      
      return existing.id;
    } else {
      const id = `dnf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(documentNumberFormats).values({
        id,
        documentType: documentType as any,
        prefix: format.prefix || '',
        padding: format.padding || 6,
        separator: format.separator || '-',
        currentNumber: 1,
        createdAt: now,
        updatedAt: now,
      } as any);
      return id;
    }
  } catch (error: any) {
    if (error?.code === 'ER_NO_SUCH_TABLE') {
      console.warn('[Database] documentNumberFormats table not available');
      return `dnf_${Date.now()}`;
    }
    throw error;
  }
}

export async function getNextDocumentNumberWithFormat(documentType: string): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let format = await getDocumentNumberFormat(documentType);
  
  // if we found a format, sanitize it by removing any trailing four-digit year
  if (format && format.prefix) {
    const yearMatch = format.prefix.match(/(.+)-\d{4}$/);
    if (yearMatch) {
      const newPrefix = yearMatch[1];
      format.prefix = newPrefix;
      // persist sanitized prefix so future generations don't contain the year
      try {
        await db.update(documentNumberFormats)
          .set({ prefix: newPrefix, updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ') })
          .where(eq(documentNumberFormats.documentType, documentType as any));
        console.log(`[DB] removed year from prefix for ${documentType}, new prefix='${newPrefix}'`);
      } catch (err) {
        console.warn(`[DB] failed to sanitize prefix for ${documentType}`, err);
      }
    }
  }

  // If format doesn't exist, create it with default settings
  if (!format) {
    const id = v4();
    const prefix = getDefaultPrefix(documentType).replace('-', ''); // INV, EST, REC, etc.
    
    try {
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await db.insert(documentNumberFormats).values({
        id,
        documentType: documentType as any,
        prefix,
        padding: 6,
        separator: '-',
        currentNumber: 1,
        createdAt: now,
        updatedAt: now,
      }).onDuplicateKeyUpdate({
        set: {
          currentNumber: 1,
          updatedAt: now,
        },
      });
    } catch (error: any) {
      const code = error?.code || error?.errno || '';
      const msg = error?.message || '';
      if (code === 'ER_NO_SUCH_TABLE' || code === '42S02' || msg.includes("doesn't exist")) {
        console.warn('[Database] documentNumberFormats table still missing during insert, attempting to create.');
        // attempt to create table manually
        await db.execute(`
          CREATE TABLE IF NOT EXISTS documentNumberFormats (
            id VARCHAR(64) PRIMARY KEY,
            documentType ENUM('invoice','estimate','receipt','proposal','expense','payment','contract','quotation','purchase_order','project','credit_note','debit_note') NOT NULL,
            prefix VARCHAR(50) NOT NULL DEFAULT '',
            padding INT NOT NULL DEFAULT 6,
            separator VARCHAR(5) DEFAULT '-',
            currentNumber INT NOT NULL DEFAULT 1,
            createdAt TIMESTAMP,
            updatedAt TIMESTAMP
          )
        `);
        // retry insert once more
        const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await db.insert(documentNumberFormats).values({
          id,
          documentType: documentType as any,
          prefix,
          padding: 6,
          separator: '-',
          currentNumber: 1,
          createdAt: now,
          updatedAt: now,
        });
      } else {
        throw error;
      }
    }
    
    format = await getDocumentNumberFormat(documentType);
    if (!format) throw new Error("Failed to create document format");
  }
  
  const prefix = format.prefix || '';
  const padding = format.padding || 6;
  const separator = format.separator || '-';
  const nextNum = format.currentNumber || 1;
  
  // Generate the document number (e.g., INV-000001)
  const paddedNumber = String(nextNum).padStart(padding, '0');
  const documentNumber = prefix ? `${prefix}${separator}${paddedNumber}` : paddedNumber;
  
  // Increment and save the next number
  await db
    .update(documentNumberFormats)
    .set({
      currentNumber: nextNum + 1,
      updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    })
    .where(eq(documentNumberFormats.documentType, documentType as any));
  
  return documentNumber;
}

function generateFormatExample(prefix: string, padding: number, separator: string, exampleNumber: number = 1): string {
  const paddedNumber = String(exampleNumber).padStart(padding, '0');
  return prefix ? `${prefix}${separator}${paddedNumber}` : paddedNumber;
}

export async function resetDocumentNumberFormatCounter(documentType: string, startNumber: number = 1) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(documentNumberFormats)
    .set({
      currentNumber: startNumber,
      updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    })
    .where(eq(documentNumberFormats.documentType, documentType as any));
}

// ============= DEFAULT SETTINGS =============

export async function getDefaultSetting(category: string, key: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(defaultSettings)
    .where(and(
      eq(defaultSettings.category, category),
      eq(defaultSettings.key, key)
    ))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getDefaultSettingsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(defaultSettings)
    .where(eq(defaultSettings.category, category))
    .orderBy(defaultSettings.key);
}

export async function setDefaultSetting(
  category: string,
  key: string,
  defaultValue: string,
  description?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `dset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const existing = await getDefaultSetting(category, key);

  if (existing) {
    await db
      .update(defaultSettings)
      .set({
        value: defaultValue,
        description: description || existing.description,
      })
      .where(and(
        eq(defaultSettings.category, category),
        eq(defaultSettings.key, key)
      ));

    return existing.id;
  } else {
    await db.insert(defaultSettings).values({
      id,
      category,
      key,
      value: defaultValue,
      description,
    });
    return id;
  }
}

export async function resetSettingToDefault(key: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Find the default value
  const allDefaults = await db.select().from(defaultSettings);
  const defaultSetting = allDefaults.find((d: { key: string; value?: string | null; category?: string }) => d.key === key);
  
  if (defaultSetting) {
    // Reset the setting to its default value
    await setSetting(key, defaultSetting.value, defaultSetting.category);
  }
}

export async function resetCategoryToDefaults(category: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const defaults = await getDefaultSettingsByCategory(category);
  
  for (const defaultSetting of defaults) {
    if (defaultSetting.value) {
      await setSetting(defaultSetting.key, defaultSetting.value, category);
    }
  }
}

// ============= ROLES & PERMISSIONS =============

export async function getRoles() {
  try {
    const db = await getDb();
    if (!db) return getDefaultRoles();
    
    // Get custom roles from userRoles table
    const customRoles = await db
      .select()
      .from(userRoles)
      .where(isNull(userRoles.userId))
      .orderBy(userRoles.roleName);
    
    // Add system roles flag to custom roles
    const rolesWithFlag = customRoles.map((r: any) => ({
      ...r,
      isSystem: 0,
      displayName: r.roleName
    }));
    
    // Combine with system roles
    return [...getSystemRoles(), ...rolesWithFlag];
  } catch (error) {
    console.error("Error fetching roles:", error);
    return getDefaultRoles();
  }
}

function getSystemRoles() {
  const systemRoleList = [
    { id: "sys_1", userId: null, role: 'super_admin', roleName: "Super Admin", displayName: "Super Admin", description: "Platform super administrator with full system access", isActive: 1, isSystem: 1, assignedBy: null, createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
    { id: "sys_2", userId: null, role: 'admin', roleName: "Admin", displayName: "Administrator", description: "Administrator role with elevated permissions", isActive: 1, isSystem: 1, assignedBy: null, createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
    { id: "sys_3", userId: null, role: 'staff', roleName: "Staff", displayName: "Staff", description: "Standard staff member role", isActive: 1, isSystem: 1, assignedBy: null, createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
    { id: "sys_4", userId: null, role: 'accountant', roleName: "Accountant", displayName: "Accountant", description: "Accounting and finance staff", isActive: 1, isSystem: 1, assignedBy: null, createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
    { id: "sys_5", userId: null, role: 'client', roleName: "Client", displayName: "Client", description: "Client role with limited permissions", isActive: 1, isSystem: 1, assignedBy: null, createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
    { id: "sys_6", userId: null, role: 'project_manager', roleName: "Project Manager", displayName: "Project Manager", description: "Project management role", isActive: 1, isSystem: 1, assignedBy: null, createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
    { id: "sys_7", userId: null, role: 'hr', roleName: "HR Manager", displayName: "HR Manager", description: "Human resources management role", isActive: 1, isSystem: 1, assignedBy: null, createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
    { id: "sys_8", userId: null, role: 'ict_manager', roleName: "ICT Manager", displayName: "ICT Manager", description: "Information and communications technology management", isActive: 1, isSystem: 1, assignedBy: null, createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
    { id: "sys_9", userId: null, role: 'procurement_manager', roleName: "Procurement Manager", displayName: "Procurement Manager", description: "Procurement and supplier management", isActive: 1, isSystem: 1, assignedBy: null, createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
    { id: "sys_10", userId: null, role: 'sales_manager', roleName: "Sales Manager", displayName: "Sales Manager", description: "Sales and client management role", isActive: 1, isSystem: 1, assignedBy: null, createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
  ];
  return systemRoleList;
}

function getDefaultRoles() {
  return [
    ...getSystemRoles(),
  ];
}

export async function getPermissions() {
  try {
    const db = await getDb();
    if (!db) return getDefaultPermissions();
    
    // Get permissions with categories from database
    const perms = await db.select().from(permissions).limit(1000);
    
    if (perms.length === 0) {
      // Return categorized default permissions
      return getDefaultPermissions();
    }
    
    return perms;
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return getDefaultPermissions();
  }
}

function getDefaultPermissions() {
  return {
    hr_management: {
      category: "HR Management",
      permissions: [
        { id: "hr_1", permissionName: "view_employees", label: "View Employees", description: "View employee records and data", category: "HR Management", resource: "employees", action: "view", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
        { id: "hr_2", permissionName: "create_employees", label: "Create Employees", description: "Create and add new employee records", category: "HR Management", resource: "employees", action: "create", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
        { id: "hr_3", permissionName: "edit_employees", label: "Edit Employees", description: "Modify existing employee records", category: "HR Management", resource: "employees", action: "edit", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
        { id: "hr_4", permissionName: "delete_employees", label: "Delete Employees", description: "Delete employee records from system", category: "HR Management", resource: "employees", action: "delete", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
        { id: "hr_5", permissionName: "manage_payroll", label: "Manage Payroll", description: "Manage payroll, salaries and compensation", category: "HR Management", resource: "payroll", action: "manage", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
        { id: "hr_6", permissionName: "manage_leave", label: "Manage Leave", description: "Manage leave requests and approvals", category: "HR Management", resource: "leave", action: "manage", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
      ]
    },
    procurement_suppliers: {
      category: "Procurement - Suppliers",
      permissions: [
        { id: "proc_s_1", permissionName: "view_suppliers", label: "View Suppliers", description: "View supplier profiles and information", category: "Procurement - Suppliers", resource: "suppliers", action: "view", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
        { id: "proc_s_2", permissionName: "create_suppliers", label: "Create Suppliers", description: "Add new suppliers to the system", category: "Procurement - Suppliers", resource: "suppliers", action: "create", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
        { id: "proc_s_3", permissionName: "edit_suppliers", label: "Edit Suppliers", description: "Modify supplier information", category: "Procurement - Suppliers", resource: "suppliers", action: "edit", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
        { id: "proc_s_4", permissionName: "delete_suppliers", label: "Delete Suppliers", description: "Remove suppliers from the system", category: "Procurement - Suppliers", resource: "suppliers", action: "delete", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
      ]
    },
    organization_departments: {
      category: "Organization - Departments",
      permissions: [
        { id: "org_d_1", permissionName: "view_departments", label: "View Departments", description: "View organizational departments", category: "Organization - Departments", resource: "departments", action: "view", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
        { id: "org_d_2", permissionName: "create_departments", label: "Create Departments", description: "Create new organizational departments", category: "Organization - Departments", resource: "departments", action: "create", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
        { id: "org_d_3", permissionName: "edit_departments", label: "Edit Departments", description: "Modify department information", category: "Organization - Departments", resource: "departments", action: "edit", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
        { id: "org_d_4", permissionName: "delete_departments", label: "Delete Departments", description: "Remove departments from organization", category: "Organization - Departments", resource: "departments", action: "delete", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
      ]
    },
    procurement_budgets: {
      category: "Procurement - Budgets",
      permissions: [
        { id: "proc_b_1", permissionName: "view_budgets", label: "View Budgets", description: "View budget allocations and tracking", category: "Procurement - Budgets", resource: "budgets", action: "view", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
        { id: "proc_b_2", permissionName: "create_budgets", label: "Create Budgets", description: "Create new budget allocations", category: "Procurement - Budgets", resource: "budgets", action: "create", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
        { id: "proc_b_3", permissionName: "edit_budgets", label: "Edit Budgets", description: "Modify budget amounts and details", category: "Procurement - Budgets", resource: "budgets", action: "edit", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
        { id: "proc_b_4", permissionName: "approve_budgets", label: "Approve Budgets", description: "Approve and authorize budget allocations", category: "Procurement - Budgets", resource: "budgets", action: "approve", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
      ]
    },
    general: {
      category: "General",
      permissions: [
        { id: "gen_1", permissionName: "view", label: "View", description: "View and access records", category: "General", resource: "*", action: "view", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
        { id: "gen_2", permissionName: "create", label: "Create", description: "Create new records and entries", category: "General", resource: "*", action: "create", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
        { id: "gen_3", permissionName: "edit", label: "Edit", description: "Modify and update existing records", category: "General", resource: "*", action: "edit", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
        { id: "gen_4", permissionName: "delete", label: "Delete", description: "Remove records from system", category: "General", resource: "*", action: "delete", createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) },
      ]
    }
  };
}

export async function getRolePermissions(roleId: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select({
      permissionId: rolePermissions.permissionId,
      permissionName: permissions.permissionName,
      description: permissions.description,
      category: permissions.category,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(rolePermissions.roleId, roleId))
    .orderBy(permissions.category, permissions.permissionName);
}

export async function assignPermissionToRole(roleId: string, permissionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if already assigned
  const existing = await db
    .select()
    .from(rolePermissions)
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionId, permissionId)
      )
    )
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0].id;
  }
  
  const id = `rp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(rolePermissions).values({
    id,
    roleId,
    permissionId,
  });
  
  return id;
}

export async function removePermissionFromRole(roleId: string, permissionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(rolePermissions)
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionId, permissionId)
      )
    );
}

export async function createRole(roleName: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
  await db.insert(userRoles).values({
    id,
    userId: null,
    role: roleName,
    roleName,
    description: description || null,
    isActive: 1,
    assignedBy: null,
    createdAt: now,
  } as any);
  
  return id;
}

export async function createPermission(permissionName: string, description?: string, category?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(permissions).values({
    id,
    permissionName,
    description,
    category,
  });
  
  return id;
}


/**
 * Set password reset token for a user
 */
export async function setPasswordResetToken(userId: string, token: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    // Set token with 1 hour expiration
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
    
    await db.update(users)
      .set({ 
        passwordResetToken: token,
        passwordResetExpiresAt: expiresAt.toISOString().replace('T', ' ').substring(0, 19)
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to set password reset token:", error);
    throw error;
  }
}

/**
 * Get password reset token for a user
 */
export async function getPasswordResetToken(userId: string): Promise<string | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (result.length === 0) return null;
    
    const user = result[0];
    
    // Check if token is expired
    if (user.passwordResetExpiresAt) {
      const expiresAt = new Date(user.passwordResetExpiresAt);
      if (expiresAt < new Date()) {
        // Token expired, clear it
        await clearPasswordResetToken(userId);
        return null;
      }
    }
    
    return user.passwordResetToken || null;
  } catch (error) {
    console.error("[Database] Failed to get password reset token:", error);
    throw error;
  }
}

/**
 * Clear password reset token for a user
 */
export async function clearPasswordResetToken(userId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.update(users)
      .set({ 
        passwordResetToken: null,
        passwordResetExpiresAt: null
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to clear password reset token:", error);
    throw error;
  }
}

// ============= SUBSCRIPTION UTILITIES =============

export async function getAvailablePlans(tier?: string) {
  const db = await getDb();
  if (!db) return [];

  let baseRows: any[] = [];
  try {
    baseRows = await db
      .select()
      .from(pricingPlans)
      .where(eq(pricingPlans.isActive, 1))
      .orderBy(pricingPlans.displayOrder, pricingPlans.planName);
  } catch (error) {
    console.warn("[Database] Pricing plans unavailable; using empty plan list:", error instanceof Error ? error.message : error);
  }

  let pricingOverrides: Record<string, Record<string, unknown>> = {};
  try {
    const [setting] = await db.select().from(settings).where(eq(settings.key, 'plan_prices')).limit(1);
    pricingOverrides = parseTierPricingOverrides(setting?.value);
  } catch (error) {
    console.warn('[Database] Tier pricing overrides unavailable:', error instanceof Error ? error.message : error);
  }

  const featureOverrides: Record<string, Record<string, boolean>> = {};
  try {
    const featureRows = await db.select().from(pricingTierFeatures);
    for (const feature of featureRows as any[]) {
      if (!featureOverrides[feature.tier]) featureOverrides[feature.tier] = {};
      featureOverrides[feature.tier][feature.featureKey] = Boolean(feature.isEnabled);
    }
  } catch (error) {
    console.warn('[Database] Tier feature overrides unavailable:', error instanceof Error ? error.message : error);
  }

  const asFeatureMap = (value: unknown): Record<string, boolean> => {
    if (typeof value === 'string') {
      try { value = JSON.parse(value); } catch { return {}; }
    }
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, boolean>
      : {};
  };

  const defaults = DEFAULT_TIER_PRICING as Record<string, Record<string, unknown>>;
  const configuredRows = baseRows.map((plan: any) => {
    const key = String(plan.planSlug || plan.id).toLowerCase();
    const defaultsForTier = defaults[key] || {};
    const overrides = resolveTierPricingEntry(key, pricingOverrides);
    return {
      ...plan,
      tier: key in defaults ? key : plan.tier,
      planName: overrides.label ?? defaultsForTier.label ?? plan.planName,
      description: overrides.description ?? defaultsForTier.description ?? plan.description,
      monthlyPrice: overrides.monthlyKes ?? defaultsForTier.monthlyKes ?? plan.monthlyPrice,
      annualPrice: overrides.annualKes ?? defaultsForTier.annualKes ?? plan.annualPrice,
      maxUsers: overrides.maxUsers ?? defaultsForTier.maxUsers ?? plan.maxUsers,
      trialDays: overrides.trialDays ?? defaultsForTier.trialDays,
      features: {
        ...(DEFAULT_TIER_FEATURES[key] || {}),
        ...asFeatureMap(plan.features),
        ...(featureOverrides[key] || {}),
      },
    };
  });

  const existingKeys = new Set(configuredRows.map((plan: any) => String(plan.planSlug || plan.id).toLowerCase()));
  const catalog = DEFAULT_TIER_PRICING as Record<string, Record<string, unknown>>;
  for (const [key, defaultsForTier] of Object.entries(catalog)) {
    if (existingKeys.has(key)) continue;
    const overrides = resolveTierPricingEntry(key, pricingOverrides);
    configuredRows.push({
      id: key,
      planSlug: key,
      planName: overrides.label ?? defaultsForTier.label,
      tier: key,
      description: overrides.description ?? defaultsForTier.description,
      monthlyPrice: overrides.monthlyKes ?? defaultsForTier.monthlyKes,
      annualPrice: overrides.annualKes ?? defaultsForTier.annualKes,
      maxUsers: overrides.maxUsers ?? defaultsForTier.maxUsers,
      trialDays: overrides.trialDays ?? defaultsForTier.trialDays,
      maxProjects: -1,
      maxStorageGB: -1,
      supportLevel: 'email',
      features: { ...(DEFAULT_TIER_FEATURES[key] || {}), ...(featureOverrides[key] || {}) },
      isActive: 1,
      displayOrder: configuredRows.length,
    });
  }

  for (const [key, config] of Object.entries(pricingOverrides)) {
    if (existingKeys.has(key) || key in catalog || !config || typeof config !== 'object') continue;
    configuredRows.push({
      id: key,
      planSlug: key,
      planName: config.label ?? key,
      tier: key,
      description: config.description ?? '',
      monthlyPrice: config.monthlyKes ?? 0,
      annualPrice: config.annualKes ?? 0,
      maxUsers: config.maxUsers ?? 0,
      trialDays: config.trialDays ?? 0,
      maxProjects: -1,
      maxStorageGB: -1,
      supportLevel: 'email',
      features: { ...asFeatureMap(config.features), ...(featureOverrides[key] || {}) },
      isActive: 1,
      displayOrder: configuredRows.length,
    });
  }

  if (!tier) return configuredRows;
  return configuredRows.filter((plan: any) => plan?.tier === tier);
}

export async function getPricingPlan(id: string) {
  const plans = await getAvailablePlans();
  return plans.find((plan: any) => plan.id === id || plan.planSlug === id) ?? null;
}

export async function createSubscription(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(subscriptions).values(data);
  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, data.id))
    .limit(1);

  return result.length > 0 ? result[0] : data;
}

/**
 * Get client created by a specific user
 * Used for subscription status checks during login
 */
export async function getClientByCreatedBy(userId: string) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db
      .select()
      .from(clients)
      .where(eq(clients.createdBy, userId))
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get client by created by:", error);
    return null;
  }
}

/**
 * Get active subscription for a client
 * Used to check subscription status during login and operations
 */
export async function getClientSubscription(clientId: string) {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.clientId, clientId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get client subscription:", error);
    return null;
  }
}

export async function getSubscriptionById(id: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateSubscription(id: string, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(subscriptions)
    .set({ ...(data as any), updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
    .where(eq(subscriptions.id, id));

  return getSubscriptionById(id);
}

export async function getAllSubscriptions() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(subscriptions)
    .orderBy(desc(subscriptions.createdAt));
}

export async function getOrganizationSubscription(organizationId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.organizationId, organizationId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createBillingNotification(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(billingNotifications).values(data);
  return data;
}

export async function createBillingUsageMetric(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(billingUsageMetrics).values(data);
  return data;
}

export async function createExportJob(job: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(exportJobs).values(job);
  return job;
}

export async function getBillingUsageMetrics(
  subscriptionId: string,
  startDate?: string,
  endDate?: string,
  limit = 100
) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [eq(billingUsageMetrics.subscriptionId, subscriptionId)];
  if (startDate) conditions.push(gte(billingUsageMetrics.metricDate, startDate));
  if (endDate) conditions.push(lte(billingUsageMetrics.metricDate, endDate));

  return await db
    .select()
    .from(billingUsageMetrics)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(billingUsageMetrics.metricDate))
    .limit(limit);
}

export async function getBillingUsageSummary(
  subscriptionId: string,
  startDate?: string,
  endDate?: string
) {
  const db = await getDb();
  if (!db) return { totalUsers: 0, totalProjects: 0, totalTasks: 0, totalDocuments: 0, totalStorageMB: 0, totalApiCalls: 0, totalEmails: 0, sampleCount: 0 };

  const conditions: any[] = [eq(billingUsageMetrics.subscriptionId, subscriptionId)];
  if (startDate) conditions.push(gte(billingUsageMetrics.metricDate, startDate));
  if (endDate) conditions.push(lte(billingUsageMetrics.metricDate, endDate));

  const [summary] = await db
    .select({
      totalUsers: sum(billingUsageMetrics.usersCount).as('totalUsers'),
      totalProjects: sum(billingUsageMetrics.projectsCount).as('totalProjects'),
      totalTasks: sum(billingUsageMetrics.tasksCount).as('totalTasks'),
      totalDocuments: sum(billingUsageMetrics.documentsCount).as('totalDocuments'),
      totalStorageMB: sum(billingUsageMetrics.storageUsedMB).as('totalStorageMB'),
      totalApiCalls: sum(billingUsageMetrics.apiCallsCount).as('totalApiCalls'),
      totalEmails: sum(billingUsageMetrics.emailsSent).as('totalEmails'),
      sampleCount: count().as('sampleCount'),
    })
    .from(billingUsageMetrics)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(1);

  return {
    totalUsers: Number(summary?.totalUsers || 0),
    totalProjects: Number(summary?.totalProjects || 0),
    totalTasks: Number(summary?.totalTasks || 0),
    totalDocuments: Number(summary?.totalDocuments || 0),
    totalStorageMB: Number(summary?.totalStorageMB || 0),
    totalApiCalls: Number(summary?.totalApiCalls || 0),
    totalEmails: Number(summary?.totalEmails || 0),
    sampleCount: Number(summary?.sampleCount || 0),
    avgUsers: summary?.sampleCount ? Number(summary?.totalUsers || 0) / Number(summary?.sampleCount || 1) : 0,
    avgProjects: summary?.sampleCount ? Number(summary?.totalProjects || 0) / Number(summary?.sampleCount || 1) : 0,
    avgApiCalls: summary?.sampleCount ? Number(summary?.totalApiCalls || 0) / Number(summary?.sampleCount || 1) : 0,
  };
}

export async function createDunningPolicy(policy: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(dunningPolicies).values(policy);
  return policy;
}

export async function getDunningPolicies(organizationId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(dunningPolicies)
    .where(eq(dunningPolicies.organizationId, organizationId))
    .orderBy(desc(dunningPolicies.createdAt));
}

export async function getDunningPolicy(id: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(dunningPolicies)
    .where(eq(dunningPolicies.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getActiveDunningPolicy(organizationId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(dunningPolicies)
    .where(and(eq(dunningPolicies.organizationId, organizationId), eq(dunningPolicies.isActive, 1)))
    .orderBy(desc(dunningPolicies.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function recordPaymentRetry(retry: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(paymentRetries).values(retry);
  return retry;
}

export async function getRetryHistory(invoiceId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(paymentRetries)
    .where(eq(paymentRetries.invoiceId, invoiceId))
    .orderBy(desc(paymentRetries.createdAt));
}

export async function logDunningEvent(event: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(dunningEvents).values(event);
  return event;
}

export async function getDunningEvents(subscriptionId: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(dunningEvents)
    .where(eq(dunningEvents.subscriptionId, subscriptionId))
    .orderBy(desc(dunningEvents.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getDunningStatus(subscriptionId: string) {
  const db = await getDb();
  if (!db) return null;

  const retries = await db
    .select()
    .from(paymentRetries)
    .where(eq(paymentRetries.subscriptionId, subscriptionId))
    .orderBy(desc(paymentRetries.createdAt));

  const events = await db
    .select()
    .from(dunningEvents)
    .where(eq(dunningEvents.subscriptionId, subscriptionId))
    .orderBy(desc(dunningEvents.createdAt))
    .limit(50);

  const retryCount = retries.length;
  const latestRetry = retries[0] || null;
  const isDunning = retries.some((retry: any) => ['pending', 'processing', 'failed'].includes(retry.status));
  const nextRetryAt = latestRetry?.nextRetryAt ?? null;
  const overdueDays = latestRetry?.attemptedAt
    ? Math.max(0, Math.floor((Date.now() - new Date(latestRetry.attemptedAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const dunningPhase = !isDunning
    ? 'none'
    : latestRetry?.status === 'pending'
      ? 'early'
      : latestRetry?.status === 'failed'
        ? 'late'
        : 'late';

  return {
    subscriptionId,
    isDunning,
    overdueDays,
    retryCount,
    nextRetryAt,
    dunningPhase,
    events,
  };
}

export async function saveIntegrationConfig(config: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(integrationConfigs).values(config);
  return config;
}

export async function getEnabledIntegrations(createdBy: string) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(integrationConfigs)
    .where(and(eq(integrationConfigs.createdBy, createdBy), eq(integrationConfigs.isActive, 1)))
    .orderBy(desc(integrationConfigs.createdAt));
}

export async function disableIntegration(integrationId: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(integrationConfigs).set({ status: 'inactive', isActive: 0, updatedAt: new Date().toISOString() }).where(eq(integrationConfigs.id, integrationId));
}

export async function queueSmsMessage(sms: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(smsQueue).values(sms);
  return sms;
}

export async function createSmsTemplate(template: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(smsTemplates).values(template);
  return template;
}

export async function getSmsTemplate(templateId: string, organizationId?: string) {
  const db = await getDb();
  if (!db) return null;
  const conditions = [eq(smsTemplates.id, templateId)];
  if (organizationId) {
    conditions.push(eq(smsTemplates.organizationId, organizationId));
  }
  const [template] = await db.select().from(smsTemplates).where(and(...conditions)).limit(1);
  return template ?? null;
}

export async function getSmsTemplates(organizationId: string, category?: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return { templates: [], total: 0 };
  const filter = category
    ? and(eq(smsTemplates.organizationId, organizationId), eq(smsTemplates.category, category as any))
    : eq(smsTemplates.organizationId, organizationId);
  const [countResult] = await db.select({ total: count() }).from(smsTemplates).where(filter);
  const templates = await db.select().from(smsTemplates).where(filter).orderBy(desc(smsTemplates.createdAt)).limit(limit).offset(offset);
  return {
    templates,
    total: Number(countResult?.total ?? 0),
  };
}

export async function updateSmsTemplate(templateId: string, organizationId: string, updatedData: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(smsTemplates).set({ ...updatedData, updatedAt: new Date().toISOString() }).where(and(eq(smsTemplates.id, templateId), eq(smsTemplates.organizationId, organizationId)));
  const [template] = await db.select().from(smsTemplates).where(and(eq(smsTemplates.id, templateId), eq(smsTemplates.organizationId, organizationId))).limit(1);
  return template ?? null;
}

export async function deleteSmsTemplate(templateId: string, organizationId: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(smsTemplates).where(and(eq(smsTemplates.id, templateId), eq(smsTemplates.organizationId, organizationId)));
}

export async function createSmsAutomationRule(rule: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(smsAutomationRules).values(rule);
  return rule;
}

export async function getSmsAutomationRules(organizationId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(smsAutomationRules).where(eq(smsAutomationRules.organizationId, organizationId));
}

// ============= ORGANIZATION / MULTI-TENANCY HELPERS =============

export async function getAllOrganizations() {
  const db = await getDb();
  const readOrganizationsFromRawPool = async () => {
    const pool = getPool() || await getRawPool();
    if (!pool) return [];
    const [rows] = await pool.query("SELECT * FROM `organizations` LIMIT 500");
    return (rows as any[]).map((organization) => ({
      ...organization,
      urlMode: organization.urlMode === 'subdomain' ? 'subdomain' : 'path',
      isArchived: organization.isArchived ?? 0,
    }));
  };

  if (!db) return readOrganizationsFromRawPool();
  try {
    const organizationsFromOrm = await db.select().from(organizations).limit(500);
    if (organizationsFromOrm.length > 0) return organizationsFromOrm;
    return readOrganizationsFromRawPool();
  } catch (error) {
    try {
      return await readOrganizationsFromRawPool();
    } catch (fallbackError) {
      console.warn('[db.getAllOrganizations] Legacy schema fallback failed; returning empty list:', fallbackError);
      return [];
    }
  }
}

export async function getOrganization(id: string) {
  const db = await getDb();
  if (!db) return null;
  let org;
  try {
    [org] = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  } catch (error) {
    const pool = getPool() || await getRawPool();
    if (!pool) return null;
    const [rows] = await pool.query("SELECT * FROM `organizations` WHERE `id` = ? LIMIT 1", [id]);
    const legacyOrg = (rows as any[])[0];
    org = legacyOrg ? { ...legacyOrg, urlMode: legacyOrg.urlMode === 'subdomain' ? 'subdomain' : 'path', isArchived: legacyOrg.isArchived ?? 0 } : null;
  }
  return org ?? null;
}

export async function getOrganizationBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;

  const fallbackSelect = {
    id: organizations.id,
    name: organizations.name,
    slug: organizations.slug,
    plan: organizations.plan,
    isActive: organizations.isActive,
    isArchived: organizations.isArchived,
    archivedAt: organizations.archivedAt,
    archivedBy: organizations.archivedBy,
    maxUsers: organizations.maxUsers,
    settings: organizations.settings,
    logoUrl: organizations.logoUrl,
    domain: organizations.domain,
    contactEmail: organizations.contactEmail,
    contactPhone: organizations.contactPhone,
    address: organizations.address,
    country: organizations.country,
    industry: organizations.industry,
    website: organizations.website,
    taxId: organizations.taxId,
    billingEmail: organizations.billingEmail,
    timezone: organizations.timezone,
    currency: organizations.currency,
    description: organizations.description,
    employeeCount: organizations.employeeCount,
    registrationNumber: organizations.registrationNumber,
    paymentMethod: organizations.paymentMethod,
    createdAt: organizations.createdAt,
    updatedAt: organizations.updatedAt,
  } as const;

  try {
    const [org] = await db.select().from(organizations).where(eq(organizations.slug, slug)).limit(1);
    return org ?? null;
  } catch (error) {
    try {
      const pool = getPool() || await getRawPool();
      if (!pool) return null;
      const [rows] = await pool.query("SELECT * FROM `organizations` WHERE `slug` = ? LIMIT 1", [slug]);
      const legacyOrg = (rows as any[])[0];
      return legacyOrg ? { ...legacyOrg, urlMode: legacyOrg.urlMode === 'subdomain' ? 'subdomain' : 'path', isArchived: legacyOrg.isArchived ?? 0 } : null;
    } catch (fallbackError) {
      console.warn('[db.getOrganizationBySlug] Legacy schema fallback failed for slug:', slug, fallbackError);
      return null;
    }
  }
}

export async function getOrganizationIdBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  try {
    const [organization] = await db
      .select({ id: organizations.id, slug: organizations.slug })
      .from(organizations)
      .where(eq(organizations.slug, slug))
      .limit(1);
    return organization ?? null;
  } catch (error) {
    console.warn('[db.getOrganizationIdBySlug] Slug lookup failed:', slug, error);
    return null;
  }
}

export async function createOrganization(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  try {
    await db.insert(organizations).values(data);
  } catch (error) {
    // Older production databases may not have all columns from the current schema.
    // Retry with only columns that exist so creation remains compatible while
    // migrations are applied. The ORM driver can wrap the real schema error in
    // a generic "Failed query" message, so this fallback must not depend on the
    // driver's error wording.
    try {
      const pool = getPool() || await getRawPool();
      if (!pool) throw error;
      const [columnRows] = await pool.query(
        "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'organizations'",
      );
      const availableColumns = new Set((columnRows as Array<{ COLUMN_NAME: string }>).map((row) => row.COLUMN_NAME));
      const entries = Object.entries(data).filter(([key, value]) => availableColumns.has(key) && value !== undefined);
      if (!entries.length) throw error;

      const columns = entries.map(([key]) => `\`${key}\``).join(', ');
      const placeholders = entries.map(() => '?').join(', ');
      const values = entries.map(([, value]) =>
        value !== null && typeof value === 'object' ? JSON.stringify(value) : value,
      );
      await (pool as any).execute(`INSERT INTO \`organizations\` (${columns}) VALUES (${placeholders})`, values);
    } catch (fallbackError) {
      console.warn('[Database] Organization compatibility insert failed:', fallbackError);
      throw error;
    }
  }
  return data;
}

export async function updateOrganization(id: string, data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(organizations).set(data).where(eq(organizations.id, id));
  return getOrganization(id);
}

export async function getOrganizationSettings(id: string) {
  const org = await getOrganization(id);
  return (org?.settings as any) || {};
}

export async function updateOrganizationSettings(id: string, settingsUpdate: any) {
  const currentSettings = await getOrganizationSettings(id);
  const mergedSettings = {
    ...currentSettings,
    ...settingsUpdate,
    enterprise: {
      ...(currentSettings.enterprise || {}),
      ...(settingsUpdate.enterprise || {}),
    },
  };
  return updateOrganization(id, { settings: mergedSettings });
}

export async function deleteOrganization(id: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.delete(organizationFeatures).where(eq(organizationFeatures.organizationId, id));
  try {
    await db.delete(organizationMembers).where(eq(organizationMembers.organizationId, id));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/organizationMembers|doesn't exist|unknown table/i.test(message)) throw error;
    console.warn('[Database] organizationMembers table is unavailable; continuing organization deletion');
  }
  await db.delete(organizationUsers).where(eq(organizationUsers.organizationId, id));
  await db.delete(users).where(eq(users.organizationId, id));
  await db.delete(organizations).where(eq(organizations.id, id));
}

export async function getOrganizationFeatures(orgId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(organizationFeatures).where(eq(organizationFeatures.organizationId, orgId));
}

export async function setOrganizationFeature(organizationId: string, featureKey: string, isEnabled: boolean, config?: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const existing = await db.select().from(organizationFeatures)
    .where(and(eq(organizationFeatures.organizationId, organizationId), eq(organizationFeatures.featureKey, featureKey)))
    .limit(1);
  if (existing.length > 0) {
    const updateSet: any = { isEnabled: isEnabled ? 1 : 0 };
    if (config !== undefined && config !== null) updateSet.config = config;
    await db.update(organizationFeatures).set(updateSet)
      .where(and(eq(organizationFeatures.organizationId, organizationId), eq(organizationFeatures.featureKey, featureKey)));
  } else {
    const insertValues: any = {
      id: `orgfeat_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      organizationId,
      featureKey,
      isEnabled: isEnabled ? 1 : 0,
    };
    if (config !== undefined && config !== null) insertValues.config = config;
    await db.insert(organizationFeatures).values(insertValues);
  }
}

export async function getUsersByOrganization(orgId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).where(eq(users.organizationId, orgId)).limit(500);
}

export async function assignUserToOrganization(userId: string, orgId: string | null) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(users).set({ organizationId: orgId } as any).where(eq(users.id, userId));

  // Keep dedicated org-members table in sync for admin management.
  if (orgId) {
    const [u] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    await db.insert(organizationMembers).values({
      id: `om_${userId}`,
      organizationId: orgId,
      userId,
      role: u?.role || "user",
      status: "active",
      isActive: true,
      joinedAt: new Date(),
    } as any).onDuplicateKeyUpdate({
      set: {
        organizationId: orgId,
        role: u?.role || "user",
        status: "active",
        isActive: true,
        leftAt: null,
        updatedAt: new Date(),
      },
    });
  } else {
    await db
      .update(organizationMembers)
      .set({ status: "removed", isActive: false, leftAt: new Date(), updatedAt: new Date() } as any)
      .where(eq(organizationMembers.userId, userId));
  }
}

export async function getAllTenantSuperAdmins() {
  const db = await getDb();
  if (!db) return [];
  // Only return org-scoped super_admins — exclude Kiini platform admins (no organizationId)
  return db.select().from(users)
    .where(and(eq(users.role, 'super_admin'), isNotNull(users.organizationId)))
    .limit(100);
}

export async function getPricingTierFeatures(tier: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pricingTierFeatures).where(eq(pricingTierFeatures.tier, tier));
}

export async function getAllPricingTierFeatures() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pricingTierFeatures).limit(1000);
}

export async function setPricingTierFeature(tier: string, featureKey: string, isEnabled: boolean) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const existing = await db.select().from(pricingTierFeatures)
    .where(and(eq(pricingTierFeatures.tier, tier), eq(pricingTierFeatures.featureKey, featureKey)))
    .limit(1);
  if (existing.length > 0) {
    await db.update(pricingTierFeatures).set({ isEnabled: isEnabled ? 1 : 0 })
      .where(and(eq(pricingTierFeatures.tier, tier), eq(pricingTierFeatures.featureKey, featureKey)));
  } else {
    await db.insert(pricingTierFeatures).values({
      id: `ptf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      tier, featureKey, isEnabled: isEnabled ? 1 : 0,
    });
  }
}

export async function bulkSetPricingTierFeatures(tier: string, features: Record<string, boolean>) {
  await Promise.all(Object.entries(features).map(([key, enabled]) => setPricingTierFeature(tier, key, enabled)));
}

export async function createTenantMessage(data: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(tenantMessages).values(data);
  return data;
}

export async function getTenantMessages(filters?: any) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tenantMessages).orderBy(desc(tenantMessages.createdAt)).limit(filters?.limit ?? 100);
}

export async function markTenantMessageRead(messageId: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(tenantMessages).set({ isRead: 1 }).where(eq(tenantMessages.id, messageId));
}


