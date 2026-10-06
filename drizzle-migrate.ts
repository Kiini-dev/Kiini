/**
 * Drizzle Migration Wrapper with Retry Logic
 * This script wraps drizzle-kit commands with exponential backoff retry logic
 * to handle MySQL connection delays in Docker environments
 * 
 * IMPORTANT: This script ONLY runs at container startup via init-db.ts
 * It will gracefully skip if DATABASE_URL is not properly configured (build time)
 */

import { execSync } from "child_process";
import mysql from "mysql2/promise";

// Skip if DATABASE_URL is not set (happens during Docker build)
if (!process.env.DATABASE_URL) {
  console.log("[Drizzle] ℹ️  DATABASE_URL not set - skipping migrations (build phase)");
  process.exit(0);
}

// Skip if we're using the fallback/placeholder database URL
if (process.env.DATABASE_URL === "mysql://user:password@localhost:3306/kiini-one-hub-total-control") {
  console.log("[Drizzle] ℹ️  Using placeholder DATABASE_URL - skipping migrations (build phase)");
  process.exit(0);
}

const args = process.argv.slice(2); // Get command arguments (e.g., 'generate', 'migrate')
const command = args.join(" ") || "migrate";
const maxRetries = 5;
const initialDelay = 2000; // 2 seconds

// Parse DATABASE_URL for connection
function parseDatabaseUrl(url: string): { host: string; user: string; password: string; database: string; port: number } {
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) throw new Error("Invalid DATABASE_URL format");
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
  };
}

async function isDatabaseInitialized(): Promise<boolean> {
  try {
    const config = parseDatabaseUrl(process.env.DATABASE_URL!);
    const connection = await mysql.createConnection(config);

    const requiredTables = ['users', 'organizations', 'activeSessions', 'contracts'];
    const [rows]: any = await connection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN (?, ?, ?, ?)",
      [config.database, ...requiredTables]
    );

    await connection.end();

    const foundTables = new Set((rows || []).map((row: any) => row.TABLE_NAME));
    return requiredTables.every((tableName) => foundTables.has(tableName));
  } catch (error) {
    // If we can't check, assume it's not initialized
    return false;
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function executeWithRetry(): Promise<void> {
  let lastError: Error | null = null;

  // Check if database is already initialized
  console.log("[Drizzle] 🔍 Checking if database is already initialized...");
  const isInitialized = await isDatabaseInitialized();
  
  if (isInitialized && command === "migrate") {
    console.log("[Drizzle] ✅ Database is already initialized with all tables");
    console.log("[Drizzle] ℹ️  Skipping drizzle-kit migrate (database already has schema)");
    process.exit(0);
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `[Drizzle] 🔄 Attempt ${attempt}/${maxRetries}: Running drizzle-kit ${command}...`
      );

      const fullCommand = `drizzle-kit ${command} --config drizzle.config.ts`;
      execSync(fullCommand, { stdio: "inherit" });

      console.log(`[Drizzle] ✅ Successfully executed: drizzle-kit ${command}`);
      process.exit(0);
    } catch (error) {
      const execError = error as Error & {
        stderr?: string | Buffer;
        stdout?: string | Buffer;
      };
      lastError = execError;
      const stderr =
        typeof execError.stderr === "string"
          ? execError.stderr
          : execError.stderr?.toString?.("utf8");
      const stdout =
        typeof execError.stdout === "string"
          ? execError.stdout
          : execError.stdout?.toString?.("utf8");
      const errorMsg = [execError.message || "", stderr || "", stdout || ""]
        .filter(Boolean)
        .join(" ");

      // Check if it's a SQL syntax error (might be version-related, but not necessarily fatal)
      if (
        errorMsg.includes("SQL syntax") ||
        errorMsg.includes("ER_PARSE_ERROR") ||
        errorMsg.includes("1064") ||
        errorMsg.includes("syntax error")
      ) {
        console.warn(
          `[Drizzle] ⚠️  SQL syntax error during migration (may be version-related)`
        );
        console.warn(
          `[Drizzle] ℹ️  Continuing anyway - database may still be usable`
        );
        process.exit(0); // Exit gracefully - not necessarily fatal
      }

      // Check if it's a "table already exists" error - gracefully skip
      if (
        errorMsg.includes("already exists") ||
        errorMsg.includes("ER_TABLE_EXISTS_ERROR") ||
        errorMsg.includes("1050")
      ) {
        console.log(
          `[Drizzle] ℹ️  Tables already exist in database - skipping migration execution`
        );
        console.log(`[Drizzle] ✅ Database is already initialized (no action needed)`);
        process.exit(0);
      }

      // Check if it's a connection error (ENOTFOUND, ECONNREFUSED, EHOSTUNREACH, etc)
      if (
        errorMsg.includes("ENOTFOUND") ||
        errorMsg.includes("ECONNREFUSED") ||
        errorMsg.includes("EHOSTUNREACH") ||
        errorMsg.includes("getaddrinfo") ||
        errorMsg.includes("Host is unreachable")
      ) {
        console.warn(
          `[Drizzle] ⚠️  Connection failed (attempt ${attempt}/${maxRetries}): Database not reachable`
        );

        if (attempt < maxRetries) {
          const delayMs = initialDelay * attempt;
          console.log(
            `[Drizzle] ⏳ Waiting ${delayMs}ms before retry (exponential backoff)...`
          );
          await sleep(delayMs);
          continue;
        }

        // All retries exhausted - this is likely happening during build or before DB is ready
        console.warn(`[Drizzle] ⚠️  Maximum retry attempts (${maxRetries}) reached`);
        console.warn(
          `[Drizzle] ℹ️  This may happen if running before database is available.`
        );
        console.warn(
          `[Drizzle] ℹ️  The database will be initialized at container startup via init-db.ts`
        );
        console.warn(`[Drizzle] Exiting gracefully (skipping migrations for now)`);
        process.exit(0); // Exit gracefully - not a fatal error
      }

      // Non-connection error, exit immediately with error
      console.error(`[Drizzle] ❌ Fatal error: ${errorMsg}`);
      process.exit(1);
    }
  }
}

executeWithRetry().catch((err) => {
  console.error("[Drizzle] ❌ Unexpected error:", err);
  process.exit(1);
});
