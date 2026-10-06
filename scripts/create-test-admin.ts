import "dotenv/config";
import { initDb, getDb } from "../server/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

async function createTestAdmin() {
  try {
    console.log("Initializing database connection...");
    await initDb();
    const db = getDb();
    
    const testEmail = "admin@kiini.africa";
    const testPassword = "Admin@123";
    
    console.log("Checking if test admin already exists...");
    const existingUsers = await db.select().from(users).where(eq(users.email, testEmail));
    
    if (existingUsers.length > 0) {
      console.log("Test admin user already exists!");
      console.log("Email:", testEmail);
      console.log("Password:", testPassword);
      console.log("Role:", existingUsers[0].role);
      return;
    }
    
    console.log("Creating test super admin user...");
    const userId = nanoid();
    const passwordHash = await bcrypt.hash(testPassword, 10);
    
    await db.insert(users).values({
      id: userId,
      name: "Super Admin",
      email: testEmail,
      passwordHash: passwordHash,
      role: "super_admin",
      department: "Administration",
      isActive: 1,
      loginMethod: "local",
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      lastSignedIn: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });
    
    console.log("\n✅ Test super admin user created successfully!");
    console.log("═══════════════════════════════════════");
    console.log("Email:", testEmail);
    console.log("Password:", testPassword);
    console.log("Role: super_admin");
    console.log("═══════════════════════════════════════\n");
    
  } catch (error) {
    console.error("Error creating test admin:", error);
    process.exit(1);
  }
}

createTestAdmin();
