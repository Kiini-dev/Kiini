import "dotenv/config";
import * as bcrypt from "bcryptjs";
import { getUserByEmail } from "./server/db-users";
import { setUserPassword } from "./server/db";

async function resetAdminPassword() {
  const defaultEmail = "admin@kiini.com";
  const defaultPassword = "password123";

  console.log(`[Reset] Attempting to reset password for: ${defaultEmail}`);

  try {
    // 1. Find the user
    const user = await getUserByEmail(defaultEmail);

    if (!user) {
      console.error(`[Reset] ❌ User ${defaultEmail} not found.`);
      return;
    }

    console.log(`[Reset] ✅ User found: ${user.id}`);

    // 2. Hash the password
    console.log("[Reset] 🔑 Hashing new password...");
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // 3. Set the new password hash
    await setUserPassword(user.id, passwordHash);

    console.log(`[Reset] ✨ Password successfully reset for ${defaultEmail}.`);
    console.log(`[Reset] New password: ${defaultPassword}`);
  } catch (error) {
    console.error("[Reset] 💥 Failed to reset password:", error);
    process.exit(1);
  }
}

resetAdminPassword()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("[Reset] 💥 Script execution failed:", error);
    process.exit(1);
  });
