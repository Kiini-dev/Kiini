import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), process.env.NODE_ENV === "production" ? ".env.production" : ".env") });
config({ path: resolve(process.cwd(), ".env") });

const email = process.env.DEFAULT_USER_EMAIL || "info@kiini.africa";
const password = process.env.DEFAULT_USER_PASSWORD || "K1in1@@26!!";
const name = process.env.DEFAULT_USER_NAME || "Kiini Admin";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  const passwordHash = await bcrypt.hash(password, 10);
  const [result] = await connection.execute(
    `UPDATE users
      SET name = ?, passwordHash = ?, role = 'super_admin', isActive = 1, loginMethod = 'local', requiresPasswordChange = 0,
          emailVerificationRequired = 0, failedLoginAttempts = 0, lockedUntil = NULL, lockoutCount = 0
     WHERE email = ?`,
    [name, passwordHash, email],
  );

  if (result.affectedRows === 0) {
    await connection.execute(
      `INSERT INTO users
       (id, name, email, passwordHash, role, isActive, loginMethod, requiresPasswordChange, emailVerificationRequired)
       VALUES (UUID(), ?, ?, ?, 'super_admin', 1, 'local', 0, 0)`,
      [name, email, passwordHash],
    );
  }

  const [rows] = await connection.execute(
    "SELECT passwordHash, isActive, role FROM users WHERE email = ? LIMIT 1",
    [email],
  );
  const storedUser = rows[0];
  const passwordMatches = storedUser?.passwordHash
    ? await bcrypt.compare(password, storedUser.passwordHash)
    : false;

  console.log(JSON.stringify({
    email,
    updatedRows: result.affectedRows,
    hashLength: storedUser?.passwordHash?.length || 0,
    passwordMatches,
    isActive: storedUser?.isActive,
    role: storedUser?.role,
  }));
} finally {
  await connection.end();
}