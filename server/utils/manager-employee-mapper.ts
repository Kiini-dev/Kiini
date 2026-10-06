/**
 * Manager to Employee Auto-Mapping Utility
 * Automatically creates employee records when users are assigned manager roles
 */
import { getPool } from "../db";
import { v4 as uuidv4 } from "uuid";
import { TRPCError } from "@trpc/server";

interface ManagerEmployeeInput {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  organizationId: string;
  phone?: string;
  department?: string;
  position?: string;
}

/**
 * Automatically create or update employee record for a manager
 * Called when manager/department_head role is assigned
 */
export async function autoCreateManagerEmployee(input: ManagerEmployeeInput) {
  const pool = getPool();
  if (!pool) {
    console.error("Database pool not available");
    return null;
  }

  try {
    // Check if employee already exists for this user
    const [existingRows] = await pool.query(
      `SELECT id FROM employees WHERE userId = ? AND organizationId = ? LIMIT 1`,
      [input.userId, input.organizationId]
    );

    if (existingRows && (existingRows as any[]).length > 0) {
      // Employee already exists, return it
      return (existingRows as any[])[0];
    }

    // Create new employee record for manager
    const employeeId = uuidv4();
    const now = new Date();

    await pool.query(
      `INSERT INTO employees (
        id, userId, organizationId, firstName, lastName, email, phone,
        department, position, employmentType, status, hireDate, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employeeId,
        input.userId,
        input.organizationId,
        input.firstName,
        input.lastName,
        input.email,
        input.phone || null,
        input.department || "Management",
        input.position || "Manager",
        "permanent",
        "active",
        now,
        now,
        now,
      ]
    );

    console.log(
      `[MANAGER-MAPPER] Auto-created employee record ${employeeId} for manager ${input.email}`
    );

    return { id: employeeId, userId: input.userId, email: input.email };
  } catch (error: any) {
    console.error("[MANAGER-MAPPER] Error creating employee record:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to create employee record: ${error?.message}`,
    });
  }
}

/**
 * Verify or create employee record for a user with manager role
 * Returns employee ID if successful
 */
export async function ensureManagerHasEmployeeRecord(
  userId: string,
  organizationId: string,
  userEmail: string,
  firstName: string,
  lastName: string
): Promise<string | null> {
  try {
    const result = await autoCreateManagerEmployee({
      userId,
      firstName,
      lastName,
      email: userEmail,
      organizationId,
      department: "Management",
      position: "Manager",
    });

    return result?.id || null;
  } catch (error) {
    console.error("[MANAGER-MAPPER] Failed to ensure employee record:", error);
    return null;
  }
}
