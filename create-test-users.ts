/**
 * Create Test Users Script
 * Creates test users for all dashboard roles
 * 
 * Usage: npx tsx create-test-users.ts
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { getUserByEmail, createUser } from "./server/db-users.js";
import { setUserPassword } from "./server/db.js";

const testUsers = [
  {
    email: "info@kiini.africa",
    password: "Kiinis@@21",
    name: "Super Admin User",
    role: "super-admin" as const,
  },
  {
    email: "dev@kiini.africa",
    password: "Kiinis@@21",
    name: "Admin User",
    role: "admin" as const,
  },
  {
    email: "accounts@kiini.africa",
    password: "Kiinis@@21",
    name: "Accountant User",
    role: "accountant" as const,
  },
  {
    email: "sales@kiini.africa",
    password: "Kiinis@@21",
    name: "HR Manager",
    role: "hr" as const,
  },
  {
    email: "enjuki@kiini.africa",
    password: "Kiinis@@21",
    name: "Staff Member",
    role: "staff" as const,
  },
  {
    email: "kiinidev@gmail.com",
    password: "Kiinis@@21",
    name: "Client User",
    role: "client" as const,
  },
];

async function createTestUsers() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("[Create Users] ❌ DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  console.log("[Create Users] 🔄 Creating test users...");
  console.log("[Create Users] 📍 Database URL:", databaseUrl.replace(/:[^@]*@/, ":***@"));
  
  let connection;
  try {
    // Create connection
    console.log("[Create Users] 🔗 Connecting to database...");
    connection = await mysql.createConnection(databaseUrl);

    console.log("[Create Users] ✅ Connection successful");
    
    for (const testUser of testUsers) {
      console.log(`\n[Create Users] Processing: ${testUser.email}`);
      
      // Check if user already exists
      const existingUser = await getUserByEmail(testUser.email);
      
      if (existingUser) {
        console.log(`[Create Users] ⚠️  User ${testUser.email} already exists. Updating password...`);
        
        // Update password for existing user
        const passwordHash = await bcrypt.hash(testUser.password, 10);
        await setUserPassword(existingUser.id, passwordHash);
        console.log(`[Create Users] ✅ Password updated for ${testUser.email}`);
      } else {
        console.log(`[Create Users] ➕ Creating new user: ${testUser.email}`);
        
        // Hash the password
        const passwordHash = await bcrypt.hash(testUser.password, 10);
        
        // Create the user record
        const userId = nanoid(16);
        const user = await createUser({
          id: userId,
          name: testUser.name,
          email: testUser.email,
          role: testUser.role,
          loginMethod: "local",
          isActive: true,
        });
        
        if (user) {
          // Set the password hash
          await setUserPassword(user.id, passwordHash);
          console.log(`[Create Users] ✅ User ${testUser.email} created successfully`);
        } else {
          console.error(`[Create Users] ❌ Failed to create user ${testUser.email}`);
        }
      }
    }
    
    console.log("\n[Create Users] ✨ All test users processed successfully!");
    console.log("\n[Create Users] 📋 Test User Credentials:");
    console.log("=" .repeat(60));
    testUsers.forEach(user => {
      console.log(`Email: ${user.email.padEnd(30)} | Password: ${user.password}`);
      console.log(`Role:  ${user.role.padEnd(30)} | Name: ${user.name}`);
      console.log("-".repeat(60));
    });
    console.log("=" .repeat(60));
    
    return true;
  } catch (error) {
    console.error("[Create Users] ❌ Failed:", error);
    if (error instanceof Error) {
      console.error("[Create Users] Error details:", error.message);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("\n[Create Users] 🔌 Connection closed");
    }
  }
}

// Run the script
console.log("[Create Users] Starting test user creation...");
createTestUsers()
  .then(() => {
    console.log("[Create Users] ✨ Complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("[Create Users] 💥 Failed:", error);
    process.exit(1);
  });
