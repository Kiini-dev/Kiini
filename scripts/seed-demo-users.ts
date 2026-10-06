/**
 * Demo User Seeding Script
 * Creates demo user accounts for testing all roles
 * Run with: npx ts-node scripts/seed-demo-users.ts
 */

import { getDb } from "../server/db";
import { users, userRoles } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

const demoUsers = [
  {
    email: "admin@demo.kiini",
    password: "Demo@123",
    name: "Demo Admin",
    role: "admin",
    initials: "DA",
  },
  {
    email: "accountant@demo.kiini",
    password: "Demo@123",
    name: "Demo Accountant",
    role: "accountant",
    initials: "DA",
  },
  {
    email: "hr@demo.kiini",
    password: "Demo@123",
    name: "Demo HR Manager",
    role: "hr",
    initials: "DHM",
  },
  {
    email: "pm@demo.kiini",
    password: "Demo@123",
    name: "Demo Project Manager",
    role: "project_manager",
    initials: "DPM",
  },
  {
    email: "staff@demo.kiini",
    password: "Demo@123",
    name: "Demo Staff Member",
    role: "staff",
    initials: "DS",
  },
  {
    email: "client@demo.kiini",
    password: "Demo@123",
    name: "Demo Client",
    role: "client",
    initials: "DC",
  },
];

async function seedDemoUsers() {
  try {
    const db = await getDb();
    if (!db) {
      console.error("❌ Failed to connect to database");
      process.exit(1);
    }

    console.log("🌱 Seeding demo users...\n");

    for (const demoUser of demoUsers) {
      // Check if user already exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, demoUser.email))
        .limit(1);

      if (existing.length > 0) {
        console.log(`⏭️  Skipping ${demoUser.email} (already exists)`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(demoUser.password, 10);

      // Create user
      await db.insert(users).values({
        id: `demo_${demoUser.role}_${Date.now()}`,
        email: demoUser.email,
        name: demoUser.name,
        passwordHash: hashedPassword,
        role: demoUser.role as any,
        isActive: true,
        createdAt: new Date().toISOString(),
      });

      console.log(
        `✅ Created demo user: ${demoUser.name} (${demoUser.email})\n   Password: ${demoUser.password}`
      );
    }

    console.log("\n🎉 Demo users seeded successfully!");
    console.log("\nDemo Accounts:");
    demoUsers.forEach((user) => {
      console.log(`  📧 ${user.email} / Password: ${user.password}`);
    });
  } catch (error) {
    console.error("❌ Error seeding demo users:", error);
    process.exit(1);
  }
}

seedDemoUsers();
