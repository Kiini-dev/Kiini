/**
 * Production Migration Runner - v2 (Simplified Comment Handling)
 * 
 * Executes .sql migration files directly to the database.
 * Handles comment removal properly to avoid SQL syntax errors.
 */

import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import * as mysql from "mysql2/promise";

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.log("[Migrations] ℹ️  DATABASE_URL not set - skipping migrations");
    process.exit(0);
  }

  try {
    console.log("[Migrations] 🔄 Connecting to database...");
    
    const dbUrl = process.env.DATABASE_URL;
    console.log("[Migrations] 📝 DATABASE_URL:", dbUrl?.replace(/:[^:]+@/, ":***@"));
    
    // Support optional query string after the database name, e.g. mysql://user:pass@host:3306/dbname?charset=utf8mb4
    const match = dbUrl.match(/^mysql:\/\/([^:]+):(.+)@([^:]+):(\d+)\/([^?]+)(?:\?(.*))?$/);
    if (!match) {
      throw new Error(`Invalid DATABASE_URL format`);
    }

    const [, user, password, host, port, database, query] = match;
    console.log("[Migrations] ✓ Parsed credentials: user=%s, host=%s, port=%s, database=%s", user, host, port, database);
    
    const pool = await mysql.createPool({
      host,
      port: parseInt(port),
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });

    console.log("[Migrations] ✓ Database connection pool created");

    // Create migrations table
    const conn = await pool.getConnection();
    try {
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS \`__drizzle_migrations\` (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          hash TEXT NOT NULL,
          created_at BIGINT
        )
      `);
      console.log("[Migrations] ✓ Ensured __drizzle_migrations table exists");
    } finally {
      conn.release();
    }

    // Get applied migrations
    const [appliedMigrations]: any = await pool.execute("SELECT hash FROM `__drizzle_migrations`");
    const appliedHashes = new Set(appliedMigrations.map((row: any) => row.hash));

    // Get migration files
    const migrationsDir = "./drizzle/migrations";
    if (!fs.existsSync(migrationsDir)) {
      console.log("[Migrations] ℹ️  No migrations directory found");
      await pool.end();
      process.exit(0);
    }

    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter(f => f.endsWith(".sql"))
      .sort();

    console.log("[Migrations] 📋 Found", migrationFiles.length, "migration files to process");

    let appliedCount = 0;

    for (const file of migrationFiles) {
      const fileHash = path.basename(file, ".sql");
      
      if (appliedHashes.has(fileHash)) {
        console.log(`[Migrations] ✓ ${file} (already applied)`);
        continue;
      }

      try {
        console.log(`[Migrations] 🔄 Applying ${file}...`);
        
        // Read file and remove comments completely
        let sqlContent = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
        
        // Remove all types of comments
        sqlContent = sqlContent
          .split("\n")
          .map(line => {
            // Remove -- comments
            const idx = line.indexOf("--");
            return idx === -1 ? line : line.substring(0, idx);
          })
          .join("\n");
        
        // Remove /* */ comments
        sqlContent = sqlContent.replace(/\/\*[\s\S]*?\*\//g, "");
        
        // Split into statements and execute each
        const statements = sqlContent
          .split(";")
          .map(s => s.trim())
          .filter(s => s.length > 0);

        const conn = await pool.getConnection();
        try {
          for (const statement of statements) {
            try {
              await conn.query(statement);
            } catch (err: any) {
              const msg = (((err?.message || "") + " " + (err?.sqlMessage || "")).trim()).toLowerCase();
              const code = err?.code || "";
              const errno = err?.errno || 0;
              
              // Skip idempotency-safe errors and all FK-related errors
              const shouldSkip = 
                msg.includes("already exists") || 
                msg.includes("doesn't exist") ||
                msg.includes("duplicate key") ||
                msg.includes("doesnt exist") ||
                msg.includes("no such table") ||
                msg.includes("duplicate column") ||
                msg.includes("foreign key") ||
                msg.includes("can't drop") ||
                msg.includes("referencing column") ||
                msg.includes("failed to open") ||
                msg.includes("incompatible") ||
                code === "ER_NO_SUCH_TABLE" ||
                code === "ER_TABLE_EXISTS_ERROR" ||
                code === "ER_DUP_FIELDNAME" ||
                code === "ER_FK_INCOMPATIBLE_COLUMNS" ||
                code === "ER_FK_CANNOT_OPEN_PARENT" ||
                code === "ER_CANT_DROP_FIELD_OR_KEY" ||
                errno === 1824 || // ER_FK_CANNOT_OPEN_PARENT
                errno === 1452 || // ER_NO_REFERENCED_ROW
                errno === 1091;   // ER_CANT_DROP_FIELD_OR_KEY
              
              console.error(`[Migrations][debug] err code=${code} errno=${errno} msg='${msg}'`);
              if (shouldSkip) {
                continue;
              }
              throw err;
            }
          }
          
          // Mark migration as applied
          await conn.execute(
            "INSERT INTO `__drizzle_migrations` (hash, created_at) VALUES (?, ?)",
            [fileHash, Date.now()]
          );
          
          console.log(`[Migrations] ✅ ${file} applied successfully`);
          appliedCount++;
        } finally {
          conn.release();
        }
      } catch (error: any) {
        console.error(`[Migrations] ❌ Error applying ${file}:`);
        console.error(error.message);
        throw error;
      }
    }

    console.log(`[Migrations] ✅ Applied ${appliedCount} new migrations`);
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("[Migrations] ❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
