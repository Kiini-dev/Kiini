/**
 * GDPR Consent Management Service
 * Handles user consent tracking and management
 */

import { v4 as uuid } from "uuid";
import { mysqlTable, varchar, boolean, datetime, text, index } from "drizzle-orm/mysql-core";
import { eq, desc, and } from "drizzle-orm";
import { getDb } from "../../db";

/**
 * Consent Types
 */
export enum ConsentType {
  MARKETING = "marketing",
  ANALYTICS = "analytics",
  ESSENTIAL = "essential",
  THIRD_PARTY = "third_party",
  DATA_PROCESSING = "data_processing",
}

/**
 * Consent Record Schema
 */
export const consentRecords = mysqlTable("consentRecords", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("userId", { length: 36 }).notNull(),
  organizationId: varchar("organizationId", { length: 36 }),
  consentType: varchar("consentType", { length: 50 }).notNull(),
  granted: boolean("granted").notNull(),
  consentVersion: varchar("consentVersion", { length: 20 }).notNull(),
  ipAddress: varchar("ipAddress", { length: 50 }),
  userAgent: text("userAgent"),
  createdAt: datetime("createdAt").notNull(),
  expiresAt: datetime("expiresAt"),
  revokedAt: datetime("revokedAt"),
}, (table) => ({
  userIdx: index("consent_user_idx").on(table.userId),
  typeIdx: index("consent_type_idx").on(table.consentType),
}));

/**
 * Record user consent
 */
export async function recordConsent(
  userId: string,
  consentType: ConsentType,
  granted: boolean,
  options?: {
    organizationId?: string;
    ipAddress?: string;
    userAgent?: string;
    expirationDays?: number;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("Database not available for consent recording");
    return;
  }

  try {
    const expiresAt = options?.expirationDays
      ? new Date(Date.now() + options.expirationDays * 24 * 60 * 60 * 1000)
      : null;

    await db.insert(consentRecords).values({
      id: uuid(),
      userId,
      organizationId: options?.organizationId ?? null,
      consentType,
      granted,
      consentVersion: "1.0",
      ipAddress: options?.ipAddress ?? null,
      userAgent: options?.userAgent ?? null,
      createdAt: new Date(),
      expiresAt,
      revokedAt: null,
    });
  } catch (error) {
    console.error("Error recording consent:", error);
  }
}

/**
 * Get user consent status
 */
export async function getUserConsent(
  userId: string,
  consentType?: ConsentType
): Promise<any[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    let query = db
      .select()
      .from(consentRecords)
      .where(eq(consentRecords.userId, userId));

    if (consentType) {
      query = query.where(eq(consentRecords.consentType, consentType));
    }

    return await query.orderBy(desc(consentRecords.createdAt));
  } catch (error) {
    console.error("Error retrieving consent:", error);
    return [];
  }
}

/**
 * Revoke consent
 */
export async function revokeConsent(
  userId: string,
  consentType: ConsentType
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("Database not available for consent revocation");
    return;
  }

  try {
    await db
      .update(consentRecords)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(consentRecords.userId, userId),
          eq(consentRecords.consentType, consentType)
        )
      );
  } catch (error) {
    console.error("Error revoking consent:", error);
  }
}
