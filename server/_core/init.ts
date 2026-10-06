/**
 * Database Initialization Helper
 * Handles automatic seeding of default user and other initialization tasks
 */

import { getDb, upsertUser } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const formatMySqlTimestamp = (date: Date = new Date()) =>
  date.toISOString().replace("T", " ").substring(0, 19);

// Default user credentials - customize as needed
const DEFAULT_USER = {
  email: process.env.NODE_ENV === "production" ? "info@kiini.africa" : (process.env.DEFAULT_USER_EMAIL || "info@kiini.africa"),
  password: process.env.NODE_ENV === "production" ? "K1in1@@26!!" : (process.env.DEFAULT_USER_PASSWORD || "K1in1@@26!!"),
  name: process.env.DEFAULT_USER_NAME || "Kiini Admin",
  role: "super_admin" as const,
};

/**
 * Initialize default user if it doesn't exist
 * Called automatically during server startup
 */
export async function initializeDefaultUser() {
  try {
    // Skip if explicitly disabled
    if (process.env.SKIP_DEFAULT_USER_SEED === "true") {
      console.log("[Initialization] Skipping default user seed (SKIP_DEFAULT_USER_SEED=true)");
      return;
    }

    const db = await getDb();
    if (!db) {
      console.warn("[Initialization] Database not available, skipping default user initialization");
      return;
    }

    console.log("[Initialization] Checking for default user...");

    // Ensure the users table exists first
    let existingUsers: any[] = [];
    try {
      existingUsers = await db
        .select()
        .from(users)
        .limit(1);
    } catch (error: any) {
      // Table doesn't exist yet - migrations haven't run
      if (error?.code === "ER_NO_SUCH_TABLE" || error?.message?.includes("doesn't exist")) {
        console.log("[Initialization] ⚠️  Users table doesn't exist yet - migrations may not have completed");
        return;
      }
      throw error;
    }

    // The platform super admin is global and must not be assigned to an organization.
    const defaultUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, DEFAULT_USER.email))
      .limit(1);

    if (defaultUsers.length > 0) {
      const currentUser = defaultUsers[0] as any;
      console.log("[Initialization] ✅ Default user already exists. Resetting global credentials.");

      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.hash(DEFAULT_USER.password, 10);

      await upsertUser({
        id: currentUser.id,
        email: DEFAULT_USER.email,
        name: DEFAULT_USER.name,
        organizationId: null,
        passwordHash: hashedPassword,
        role: DEFAULT_USER.role,
        isActive: 1,
        loginMethod: "local",
        requiresPasswordChange: 0,
        emailVerificationRequired: 0,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lockoutCount: 0,
      } as any);

      console.log(`[Initialization] ✅ Default user credentials reset for existing user: ${DEFAULT_USER.email}`);
      if (process.env.NODE_ENV !== "production") {
        console.log(`[Initialization]    Password: ${DEFAULT_USER.password}`);
      }
      return;
    }

    // Create default user
    // Dynamically import bcryptjs to avoid bundling issues
    let hashedPassword: string;
    try {
      const bcrypt = await import("bcryptjs");
      hashedPassword = await bcrypt.hash(DEFAULT_USER.password, 10);
    } catch (bcryptError) {
      console.error("[Initialization] ⚠️  bcryptjs not available, skipping user creation");
      return;
    }
    const userId = `user_default_${Date.now()}`;

    await upsertUser({
      id: userId,
      email: DEFAULT_USER.email,
      name: DEFAULT_USER.name,
      organizationId: null,
      passwordHash: hashedPassword,
      role: DEFAULT_USER.role,
      isActive: 1,
      loginMethod: "local",
      lastSignedIn: formatMySqlTimestamp(),
      requiresPasswordChange: 0,
      emailVerificationRequired: 0,
      failedLoginAttempts: 0,
      lockedUntil: null,
      lockoutCount: 0,
    } as any);

    console.log(`[Initialization] ✅ Created global default user:`);
    console.log(`[Initialization]    Email: ${DEFAULT_USER.email}`);
    console.log(`[Initialization]    Role: ${DEFAULT_USER.role}`);
    console.log(`[Initialization]    Scope: Global platform administrator`);

    // Only log password in development
    if (process.env.NODE_ENV !== "production") {
      console.log(`[Initialization]    Password: ${DEFAULT_USER.password}`);
    }

  } catch (error) {
    console.warn(
      "[Initialization] ⚠️  Error initializing default user:",
      error instanceof Error ? error.message : error
    );
    // Don't fail startup if seeding fails - the user can manually seed if needed
  }
}
