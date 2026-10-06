/**
 * Super Admin Seed Script
 * Creates the global super admin user without creating an organization
 * Run with: npx ts-node scripts/seed-super-admin.ts
 */

import { getDb } from "../server/db";
import { users, userRoles } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const SUPER_ADMIN = {
  email: "info@kiini.africa",
  password: "K1in1@@26!!",
  name: "Kiini Admin",
  role: "super_admin" as const,
};

async function seedSuperAdmin() {
  try {
    const db = await getDb();
    if (!db) {
      console.error("❌ Failed to connect to database");
      process.exit(1);
    }

    console.log("🌱 Seeding super admin...\n");

    // Check if super admin user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, SUPER_ADMIN.email))
      .limit(1);

    if (existingUser.length > 0) {
      console.log(`⏭️  Super admin ${SUPER_ADMIN.email} already exists`);
    } else {
      const hashedPassword = await bcrypt.hash(SUPER_ADMIN.password, 10);
      const userId = `user_super_admin_${Date.now()}`;

      await db.insert(users).values({
        id: userId,
        email: SUPER_ADMIN.email,
        name: SUPER_ADMIN.name,
        passwordHash: hashedPassword,
        role: SUPER_ADMIN.role,
        organizationId: null,
        isActive: true,
        loginMethod: "local",
        createdAt: new Date().toISOString(),
      });

      // Also insert into userRoles for role-based access
      await db.insert(userRoles).values({
        id: `ur_super_admin_${Date.now()}`,
        userId: userId,
        role: "super_admin",
        roleName: "Super Administrator",
        description: "Full platform access",
        isActive: 1,
        createdAt: new Date().toISOString(),
      });

      console.log(`✅ Created super admin: ${SUPER_ADMIN.name} (${SUPER_ADMIN.email})`);
    }

    console.log("\n🎉 Super admin seed complete!");
    console.log(`\n  📧 Email:    ${SUPER_ADMIN.email}`);
    console.log(`  🔑 Password: ${SUPER_ADMIN.password}`);
    console.log("  🌐 Scope:    Global platform administrator");
  } catch (error) {
    console.error("❌ Error seeding super admin:", error);
    process.exit(1);
  }
}

seedSuperAdmin();
