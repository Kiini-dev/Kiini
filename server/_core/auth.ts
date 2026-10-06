import crypto from "crypto";

/**
 * Hash a password using PBKDF2 (Node.js built-in, no external dependencies)
 * This is a simple but secure password hashing implementation
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 100000;
  const keylen = 32;
  const digest = "sha256";

  const hash = crypto
    .pbkdf2Sync(password, salt, iterations, keylen, digest)
    .toString("hex");

  // Return salt:hash:iterations for verification
  return `${salt}:${hash}:${iterations}`;
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  try {
    const [salt, storedHash, iterations] = hash.split(":");
    const keylen = 32;
    const digest = "sha256";

    const computedHash = crypto
      .pbkdf2Sync(password, salt, parseInt(iterations, 10), keylen, digest)
      .toString("hex");

    return computedHash === storedHash;
  } catch (error) {
    console.error("[Auth] Password verification failed:", error);
    return false;
  }
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate username format
 */
export function validateUsername(username: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (username.length < 3) {
    errors.push("Username must be at least 3 characters long");
  }

  if (username.length > 100) {
    errors.push("Username must not exceed 100 characters");
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push("Username can only contain letters, numbers, underscores, and hyphens");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a password reset token
 */
export function generatePasswordResetToken(): {
  token: string;
  expiresAt: Date;
} {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return { token, expiresAt };
}

/**
 * Hash a password reset token for storage
 */
export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Verify a password reset token
 */
export function verifyResetToken(token: string, hashedToken: string): boolean {
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  return hash === hashedToken;
}
