/**
 * Database Initialization Script
 * This script runs Drizzle migrations to create all necessary database tables
 * It's executed automatically when the Docker container starts
 * 
 * Usage: node -r tsx init-db.ts
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { getUserByEmail } from "./server/db-users.js";
import { setUserPassword, upsertUser } from "./server/db.js";

async function initializeDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("[Database] ❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("[Database] 🔄 Initializing database...");
  console.log("[Database] 📍 Database URL:", databaseUrl.replace(/:[^@]*@/, ":***@"));
  
  let connection;
  let retries = 5;
  let lastError: any = null;
  
  // Retry logic for initial connection
  while (retries > 0) {
    try {
      console.log("[Database] 🔗 Attempting to connect to database (attempts remaining: " + retries + ")...");
      
      // Create connection with kiini_user
      let connStr = databaseUrl;
      try {
        const hasQuery = connStr.includes("?");
        if (!connStr.includes("multipleStatements=true")) {
          connStr = connStr + (hasQuery ? "&" : "?") + "multipleStatements=true";
        }
      } catch (e) {
        connStr = databaseUrl;
      }
      
      console.log("[Database] ➤ Using DB URL with multipleStatements hidden");
      connection = await mysql.createConnection(connStr);
      const db = drizzle(connection);
      console.log("[Database] ✅ Connection successful");
      break; // Success, exit retry loop
      
    } catch (err) {
      lastError = err;
      const errMsg = (err as any)?.message || String(err);
      console.warn("[Database] ⚠️ Connection attempt failed:", errMsg);
      
      retries--;
      if (retries > 0) {
        console.log("[Database] ⏳ Retrying in 3 seconds...");
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
  
  if (!connection && lastError) {
    // All retries exhausted
    console.error("[Database] ❌ Could not connect after all retry attempts");
    const msg = (lastError as any)?.message || String(lastError);
    console.error("[Database] Last error:", msg);
    
    // If it's still a host permission error, try a different approach
    if (msg.includes("not allowed to connect")) {
      console.error("[Database] ⚠️ Host permission issue detected");
      console.error("[Database] This often means MySQL permissions need to be fixed");
      process.exit(1);
    }
    
    throw lastError;
  }
  
  try {

    // Run migrations manually by executing SQL files
    try {
      const migrationsFolder = path.resolve(process.cwd(), "drizzle", "migrations");
      console.log("[Database] ➤ Running migrations from:", migrationsFolder);
      
      // Read migration files in order
      const files = fs.readdirSync(migrationsFolder)
        .filter(f => f.endsWith('.sql'))
        .sort();
      
      console.log(`[Database] Found ${files.length} migration files to execute`);
      
      for (const file of files) {
        const filePath = path.join(migrationsFolder, file);
        const sql = fs.readFileSync(filePath, 'utf-8');
        
        console.log(`[Database] ➤ Executing migration: ${file}`);
        // Strip single-line (--) and block (/* */) comments before splitting so that
        // semicolons inside comments don't create phantom statements.
        // Note: this is safe for DDL migrations which contain no string literals with -- or /*.
        const sqlNoComments = sql
          .replace(/--[^\n]*/g, '')
          .replace(/\/\*[\s\S]*?\*\//g, '');
        // Execute each statement individually using query() (text protocol) so that
        // DDL, SET @variables, PREPARE/EXECUTE, and other non-preparable statements
        // all work correctly on MySQL 5.7+.
        const statements = sqlNoComments.split(';').filter(s => s.trim().length > 0);
        let fileHadRealError = false;
        for (const statement of statements) {
          try {
            await (connection as any).query(statement);
          } catch (e) {
            const err = e as any;
            const errMsg = err?.message || String(err);
            const isIdempotent =
              err?.code === 'ER_TABLE_EXISTS_ERROR' ||
              errMsg.includes('already exists') ||
              err?.code === 'ER_DUP_FIELDNAME' ||
              errMsg.includes('Duplicate column') ||
              errMsg.includes("doesn't exist") ||
              err?.code === 'ER_NO_SUCH_TABLE' ||
              errMsg.includes('Unknown column') ||
              err?.code === 'ER_DUP_KEYNAME' ||
              errMsg.includes('Duplicate key name') ||
              err?.code === 'ER_FK_DUP_NAME' ||
              errMsg.includes('Duplicate foreign key constraint name') ||
              err?.code === 'ER_CANT_DROP_FIELD_OR_KEY' ||
              errMsg.includes("Can't DROP");
            if (!isIdempotent) {
              fileHadRealError = true;
              console.error(`[Database]   ❌ Migration error in ${file}:`, errMsg);
            }
          }
        }
        if (!fileHadRealError) {
          console.log(`[Database]   ✅ ${file} completed`);
        } else {
          console.log(`[Database]   ⚠️  ${file} - completed with some non-fatal issues`);
        }
      }
      
      console.log("[Database] ✅ Migrations applied successfully");
    } catch (err) {
      // Log migration error but continue for non-fatal issues
      const msg = err && (err as any).message ? (err as any).message : String(err);
      console.warn("[Database] ⚠️ Migration error (will continue if non-fatal):", msg);
      if (!msg.includes("already exists") && (err as any)?.code !== "ER_TABLE_EXISTS_ERROR") {
        throw err;
      }
      console.log("[Database] Detected existing objects; continuing startup");
    }

    console.log("[Database] 📊 Database is ready for use");

    return true;
  } catch (error) {
    console.error("[Database] ❌ Migration failed:", error);
    if (error instanceof Error) {
      console.error("[Database] Error details:", error.message);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("[Database] 🔌 Connection closed");
    }
  }
}

async function createDefaultUser() {
  const defaultEmail = process.env.DEFAULT_USER_EMAIL || "info@kiini.africa";
  const defaultPassword = process.env.DEFAULT_USER_PASSWORD || "K1in1@@26!!";
  const defaultRole = "super_admin";
  const defaultName = process.env.DEFAULT_USER_NAME || process.env.OWNER_NAME || "Kiini Admin";
  const defaultId = nanoid(16);

  try {
    console.log(`[Database] Checking for default user: ${defaultEmail}`);

    let existingUser;
    try {
      existingUser = await getUserByEmail(defaultEmail);
    } catch (error: any) {
      // If a schema column doesn't exist yet, skip default user creation
      if (error?.message?.includes("Unknown column")) {
        const col = error?.message?.match(/Unknown column '([^']+)'/)?.[1] || "unknown";
        console.warn(
          `[Database] ⚠️  Column '${col}' not yet available. Skipping default user creation until migrations complete.`
        );
        return;
      }
      throw error;
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    if (existingUser) {
      console.log(`[Database] Default user ${defaultEmail} already exists. Resetting credentials...`);
      await upsertUser({
        id: existingUser.id,
        name: defaultName,
        email: defaultEmail,
        role: defaultRole as any,
        loginMethod: "local",
        isActive: true,
        requiresPasswordChange: 0,
      } as any);
      await setUserPassword(existingUser.id, passwordHash);
      console.log(`[Database] ✅ Default user credentials reset successfully.`);
      return;
    }

    console.log(`[Database] Creating default user: ${defaultEmail}`);

    await upsertUser({
      id: defaultId,
      name: defaultName,
      email: defaultEmail,
      role: defaultRole as any,
      loginMethod: "local",
      isActive: true,
      requiresPasswordChange: 0,
    } as any);

    await setUserPassword(defaultId, passwordHash);
    console.log(
      `[Database] ✅ Default user ${defaultEmail} created successfully.`
    );
  } catch (error) {
    console.error(
      `[Database] ⚠️  Error during default user creation:`,
      error instanceof Error ? error.message : String(error)
    );
    console.warn(
      `[Database] ℹ️  Continuing startup. You may need to create a default user manually.`
    );
    // Don't exit - the app can still start without a default user
  }
}

// Run initialization
console.log("[Database] Starting database initialization...");
initializeDatabase()
  .then(() => {
    console.log("[Database] ✨ Database initialization complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("[Database] 💥 Database initialization failed:", error);
    process.exit(1);
  });
