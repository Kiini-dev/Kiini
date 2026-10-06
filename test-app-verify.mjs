import crypto from "crypto";

// Simulating the exact app's verifyPassword function
function verifyPassword(password, hash) {
  try {
    const [salt, storedHash, iterations] = hash.split(":");
    const keylen = 32;
    const digest = "sha256";

    const computedHash = crypto
      .pbkdf2Sync(password, salt, parseInt(iterations, 10), keylen, digest)
      .toString("hex");

    console.log("[DEBUG] Salt:", salt);
    console.log("[DEBUG] Stored Hash:", storedHash);
    console.log("[DEBUG] Computed Hash:", computedHash);
    console.log("[DEBUG] Iterations:", iterations);
    console.log("[DEBUG] Match:", computedHash === storedHash);

    return computedHash === storedHash;
  } catch (error) {
    console.error("[Auth] Password verification failed:", error);
    return false;
  }
}

// Test with the exact hash from database
const password = "password123";
const hash = "40adead6c61fb473e3f7a1d03fdd863d:759eb8cfe3e0fd05241bbe90026c4f4e9248365410e8959a1dbcaeb99834d95b:100000";

console.log("\n=== PASSWORD VERIFICATION TEST ===");
console.log("Password:", password);
console.log("Stored Hash:", hash);
console.log("");

const result = verifyPassword(password, hash);
console.log("");
console.log("RESULT:", result ? "✅ PASSWORD VALID" : "❌ PASSWORD INVALID");
