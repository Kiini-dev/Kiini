import { TRPCError } from "@trpc/server";
import { getPool } from "../db";
import { sdk } from "../_core/sdk";
import { getDefaultHeadRole } from "./department-head-mapping";
import { notifyUser } from "../sse";

export async function promoteDepartmentHead(
  userId: string | null | undefined,
  departmentName: string,
) {
  const role = getDefaultHeadRole(departmentName);
  if (!role) return false;
  if (!userId) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "The department head is not linked to a user account" });
  }

  const pool = getPool();
  if (!pool) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
  }

  const [users] = await pool.query("SELECT id FROM users WHERE id = ? LIMIT 1", [userId]);
  if (!(users as any[])?.length) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Department head user account not found" });
  }

  await pool.query("UPDATE users SET role = ?, customRoleId = NULL WHERE id = ?", [role, userId]);
  sdk.invalidateLocalUserCache(userId);
  notifyUser(userId, {
    id: `department-head-role-${userId}-${Date.now()}`,
    type: "info",
    title: "Department Head Assignment",
    body: `Your role has been updated to ${role} for ${departmentName}`,
    timestamp: new Date().toISOString(),
  });
  return true;
}
