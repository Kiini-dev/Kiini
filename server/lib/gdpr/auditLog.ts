/**
 * GDPR Audit & Compliance Logger
 * Tracks all data processing activities for compliance
 */

import { v4 as uuid } from "uuid";
import { mysqlTable, varchar, text, datetime, index } from "drizzle-orm/mysql-core";
import { eq, gte, lte, desc } from "drizzle-orm";
import { getDb } from "../../db";

/**
 * Data Processing Activity Schema
 */
export const dataProcessingLog = mysqlTable(
  "dataProcessingLog",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("userId", { length: 36 }).notNull(),
    organizationId: varchar("organizationId", { length: 36 }).notNull(),
    activityType: varchar("activityType", { length: 50 }).notNull(), // export, deletion, access, etc.
    dataCategories: text("dataCategories"), // JSON array of data types accessed
    purpose: text("purpose"),
    processor: varchar("processor", { length: 255 }), // User name or system name
    completedAt: datetime("completedAt"),
    status: varchar("status", { length: 20 }).notNull(), // pending, completed, failed
    notes: text("notes"),
    createdAt: datetime("createdAt").notNull(),
  },
  (table) => ({
    userIdx: index("dpl_user_idx").on(table.userId),
    orgIdx: index("dpl_org_idx").on(table.organizationId),
    typeIdx: index("dpl_type_idx").on(table.activityType),
    createdAtIdx: index("dpl_created_idx").on(table.createdAt),
  })
);

/**
 * Log data processing activity
 */
export async function logDataProcessing(
  userId: string,
  organizationId: string,
  activityType: string,
  options?: {
    dataCategories?: string[];
    purpose?: string;
    processor?: string;
    notes?: string;
  }
): Promise<string> {
  const activityId = uuid();
  const db = await getDb();

  if (!db) {
    console.warn("GDPR audit logger: no database available");
    return activityId;
  }

  try {
    await db.insert(dataProcessingLog).values({
      id: activityId,
      userId,
      organizationId,
      activityType,
      dataCategories: JSON.stringify(options?.dataCategories || []),
      purpose: options?.purpose ?? null,
      processor: options?.processor ?? null,
      completedAt: new Date(),
      status: "completed",
      notes: options?.notes ?? null,
      createdAt: new Date(),
    });

    return activityId;
  } catch (error) {
    console.error("Error logging data processing activity:", error);
    return activityId;
  }
}

/**
 * Get compliance audit trail
 */
export async function getComplianceAuditTrail(
  organizationId: string,
  options?: {
    startDate?: Date;
    endDate?: Date;
    activityType?: string;
  }
): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    let query = db
      .select()
      .from(dataProcessingLog)
      .where(eq(dataProcessingLog.organizationId, organizationId));

    if (options?.activityType) {
      query = query.where(eq(dataProcessingLog.activityType, options.activityType));
    }

    if (options?.startDate) {
      query = query.where(gte(dataProcessingLog.createdAt, options.startDate));
    }

    if (options?.endDate) {
      query = query.where(lte(dataProcessingLog.createdAt, options.endDate));
    }

    return await query.orderBy(desc(dataProcessingLog.createdAt));
  } catch (error) {
    console.error("Error retrieving audit trail:", error);
    return [];
  }
}

/**
 * Generate GDPR compliance report
 */
export function generateComplianceReport(
  organizationId: string,
  auditTrail: any[]
): {
  organizationId: string;
  generatedAt: string;
  activitiesLogged: number;
  dataExports: number;
  dataDeletions: number;
  consentRecords: number;
} {
  return {
    organizationId,
    generatedAt: new Date().toISOString(),
    activitiesLogged: auditTrail.length,
    dataExports: auditTrail.filter((a) => a.activityType === "export").length,
    dataDeletions: auditTrail.filter((a) =>
      a.activityType === "deletion"
    ).length,
    consentRecords: auditTrail.filter((a) => a.activityType === "consent").length,
  };
}
