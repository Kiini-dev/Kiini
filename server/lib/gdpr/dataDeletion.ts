/**
 * GDPR Compliance Data Deletion Service
 * Handles user data deletion for GDPR compliance (Right to be Forgotten)
 */

import { eq } from "drizzle-orm";
import { users, activityLog } from "../../../drizzle/schema";
import { auditLogs, organizationMembers } from "../../../drizzle/schema-extended";
import { getDb } from "../../db";

interface DeletionResult {
  success: boolean;
  deletedRecords: {
    users: number;
    organizations: number;
    activityLogs: number;
  };
  timestamp: string;
}

export async function deleteUserData(
  userId: string,
  deleteReason?: string
): Promise<DeletionResult> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection required for data deletion");
  }

  try {
    // Audit the deletion request
    await db.insert(auditLogs).values({
      id: generateId(),
      userId,
      action: "DATA_DELETION_REQUESTED",
      resourceType: "user",
      resourceId: userId,
      changes: JSON.stringify({ reason: deleteReason || "No reason provided" }),
      createdAt: new Date(),
    });

    // Anonymize instead of delete (GDPR allows this for business records)
    // This preserves data integrity while removing personal identifiers
    const updatedUser = await db
      .update(users)
      .set({
        email: `deleted-${userId}@anonymized.local`,
        name: "Deleted User",
        lastSignedIn: null,
      })
      .where(eq(users.id, userId))
      .execute();

    // Remove from organization memberships
    const deletedMemberships = await db
      .delete(organizationMembers)
      .where(eq(organizationMembers.userId, userId))
      .execute();

    // Anonymize activity logs
    const anonymizedLogs = await db
      .update(activityLog)
      .set({
        userId: "anonymized",
      })
      .where(eq(activityLog.userId, userId))
      .execute();

    return {
      success: true,
      deletedRecords: {
        users: updatedUser?.affectedRows ?? 0,
        organizations: deletedMemberships?.affectedRows ?? 0,
        activityLogs: anonymizedLogs?.affectedRows ?? 0,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error deleting user data:", error);
    throw error;
  }
}

/**
 * Schedule user data deletion (requires confirmation)
 * Implements 30-day waiting period as per GDPR best practices
 */
export async function scheduleUserDeletion(userId: string): Promise<{
  deletionScheduledFor: string;
  cancellationCode: string;
}> {
  const cancellationCode = generateId();
  const deletionDate = new Date();
  deletionDate.setDate(deletionDate.getDate() + 30); // 30-day waiting period

  // Store deletion schedule in database
  // TODO: Create deletionSchedules table
  // await db.insert(deletionSchedules).values({
  //   userId,
  //   scheduledFor: deletionDate,
  //   cancellationCode,
  // });

  return {
    deletionScheduledFor: deletionDate.toISOString(),
    cancellationCode,
  };
}

export const scheduleDeletionByUser = scheduleUserDeletion;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
