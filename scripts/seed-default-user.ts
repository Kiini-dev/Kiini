/**
 * Reset the default user using only production dependencies.
 * This script is included in the deployment package, which does not contain
 * the source server modules used by the development seed implementation.
 */

import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), process.env.NODE_ENV === "production" ? ".env.production" : ".env") });
config({ path: resolve(process.cwd(), ".env") });

// Default user credentials - customize as needed
const DEFAULT_USER = {
  email: process.env.DEFAULT_USER_EMAIL || "info@kiini.africa",
  password: process.env.DEFAULT_USER_PASSWORD || "K1in1@@26!!",
  name: process.env.DEFAULT_USER_NAME || "Kiini Admin",
  role: "super_admin" as const,
};

async function seedDefaultUser() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  const connection = await mysql.createConnection(databaseUrl);

  try {
    const hashedPassword = await bcrypt.hash(DEFAULT_USER.password, 10);
    const [result] = await connection.execute(
      `UPDATE users
       SET name = ?, passwordHash = ?, role = ?, isActive = 1, loginMethod = 'local'
       WHERE email = ?`,
      [DEFAULT_USER.name, hashedPassword, DEFAULT_USER.role, DEFAULT_USER.email],
    );

    const affectedRows = (result as { affectedRows: number }).affectedRows;
    if (affectedRows === 0) {
      await connection.execute(
        `INSERT INTO users
         (id, name, email, passwordHash, role, isActive, loginMethod, requiresPasswordChange, emailVerificationRequired)
         VALUES (UUID(), ?, ?, ?, ?, 1, 'local', 0, 0)`,
        [DEFAULT_USER.name, DEFAULT_USER.email, hashedPassword, DEFAULT_USER.role],
      );
      console.log(`Created ${DEFAULT_USER.email} in the configured database`);
      return;
    }

    console.log(`Reset ${DEFAULT_USER.email} in the configured database`);
    console.log(`Updated rows: ${affectedRows}`);

  } catch (error) {
    throw error;
  } finally {
    await connection.end();
  }
}

seedDefaultUser().catch((error) => {
  console.error("Failed to reset default user:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
