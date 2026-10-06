import crypto from "crypto";

// The hash we generated and stored in the database
const storedHash = "40adead6c61fb473e3f7a1d03fdd863d:759eb8cfe3e0fd05241bbe90026c4f4e9248365410e8959a1dbcaeb99834d95b:100000";
const password = "password123";

// Verification function (same as in the app)
function verifyPassword(password, hash) {
  try {
    const [salt, storedHashPart, iterations] = hash.split(":");
    console.log("Salt:", salt);
    console.log("Stored Hash:", storedHashPart);
    console.log("Iterations:", iterations);
    
    const keylen = 32;
    const digest = "sha256";

    const computedHash = crypto
      .pbkdf2Sync(password, salt, parseInt(iterations, 10), keylen, digest)
      .toString("hex");

    console.log("Computed Hash:", computedHash);
    console.log("Match:", computedHash === storedHashPart);

    return computedHash === storedHashPart;
  } catch (error) {
    console.error("Password verification failed:", error);
    return false;
  }
}

console.log("Testing password verification...");
console.log("Password:", password);
console.log("Stored Hash:", storedHash);
console.log("---");
const result = verifyPassword(password, storedHash);
console.log("---");
console.log("Verification Result:", result);
