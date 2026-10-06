import crypto from "node:crypto";
import mysql from "mysql2/promise";
import { FEATURE_ACCESS, ROLE_PERMISSIONS } from "../server/middleware/enhancedRbac";
import { PERMISSION_DEFINITIONS } from "../server/routers/permissions";

const DEFAULT_USER_ID = "user_1787163243748_g0ezs0lcw";

function permissionId(permission: string): string {
  return `perm_${crypto.createHash("sha1").update(permission).digest("hex").slice(0, 24)}`;
}

function getTargetUserId(): string {
  const userArgIndex = process.argv.indexOf("--user");
  return userArgIndex >= 0 && process.argv[userArgIndex + 1]
    ? process.argv[userArgIndex + 1]
    : DEFAULT_USER_ID;
}

function getLegacyPermissionIds(): string[] {
  return Object.values(PERMISSION_DEFINITIONS)
    .flatMap((category) => category.permissions.map((permission) => permission.id));
}

function splitPermission(permission: string): { resource: string; action: string } {
  const separatorIndex = permission.lastIndexOf(":");
  if (separatorIndex < 0) return { resource: permission, action: "access" };
  return {
    resource: permission.slice(0, separatorIndex),
    action: permission.slice(separatorIndex + 1),
  };
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");

  const userId = getTargetUserId();
  const canonicalPermissions = [
    ...Object.keys(FEATURE_ACCESS),
    ...Object.values(ROLE_PERMISSIONS).flat(),
  ];
  const legacyPermissions = getLegacyPermissionIds();
  const compatibilityPermissions = [
    "admin:settings",
    "chat:read",
    "chat:send",
    "chat:delete",
    "permissions:read",
    "permissions:manage",
  ];
  const allPermissions = [...new Set([
    ...canonicalPermissions,
    ...legacyPermissions,
    ...compatibilityPermissions,
  ])].sort();

  const pool = await mysql.createPool(databaseUrl);
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        name VARCHAR(100),
        permissionName VARCHAR(100),
        description TEXT,
        category VARCHAR(100),
        resource VARCHAR(100),
        action VARCHAR(50),
        isAdvanced TINYINT NOT NULL DEFAULT 0,
        createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_permissions_category (category),
        INDEX idx_permissions_resource (resource)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    for (const permission of allPermissions) {
      const { resource, action } = splitPermission(permission);
      const category = resource.split(":")[0];
      await pool.query(
        `INSERT INTO permissions
          (id, name, permissionName, description, category, resource, action, isAdvanced)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          name = VALUES(name), permissionName = VALUES(permissionName),
          category = VALUES(category), resource = VALUES(resource), action = VALUES(action)`,
        [
          permissionId(permission),
          permission,
          permission,
          `Application permission: ${permission}`,
          category,
          resource,
          action,
          /delete|approve|manage|edit|write|admin|security|backup|export/i.test(permission) ? 1 : 0,
        ],
      );
    }

    const [users] = await pool.query<mysql.RowDataPacket[]>(
      "SELECT id FROM users WHERE id = ? LIMIT 1",
      [userId],
    );
    if (!users.length) throw new Error(`User not found: ${userId}`);

    for (const permission of allPermissions) {
      await pool.query(
        `INSERT INTO userPermissions
          (id, userId, resource, action, granted, grantedBy, createdAt)
         VALUES (?, ?, ?, 'access', 1, 'permission-sync', NOW())
         ON DUPLICATE KEY UPDATE granted = 1, grantedBy = 'permission-sync'`,
        [`grant_${userId}_${permissionId(permission)}`, userId, permission],
      );
    }

    console.log(`Synced ${allPermissions.length} permissions and grants for ${userId}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Permission sync failed:", error);
  process.exitCode = 1;
});