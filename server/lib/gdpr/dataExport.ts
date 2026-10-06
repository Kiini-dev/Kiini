/**
 * GDPR Compliance Data Export Service
 * Handles user data export for GDPR compliance
 */

import { eq, inArray } from "drizzle-orm";
import { users, organizations, invoices, projects } from "../../../drizzle/schema";
import { organizationMembers } from "../../../drizzle/schema-extended";
import { getDb } from "../../db";

interface UserDataExport {
  user: any;
  organizations: any[];
  invoices: any[];
  projects: any[];
  activityLog: any[];
  exportDate: string;
}

export async function getUserDataExport(userId: string): Promise<UserDataExport> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection required for data export");
  }

  try {
    // Get user data
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .then((results) => results[0]);

    if (!user) {
      throw new Error("User not found");
    }

    // Get organizations where user is a member
    const userOrganizations = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, userId));

    const orgIds = userOrganizations.map((m: any) => m.organizationId);

    // Get organization details
    const orgs = orgIds.length
      ? await db
          .select()
          .from(organizations)
          .where(inArray(organizations.id, orgIds))
      : [];

    // Get invoices
    const userInvoices = orgIds.length
      ? await db
          .select()
          .from(invoices)
          .where(inArray(invoices.organizationId, orgIds))
      : [];

    // Get projects
    const userProjects = orgIds.length
      ? await db
          .select()
          .from(projects)
          .where(inArray(projects.organizationId, orgIds))
      : [];

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      organizations: orgs.map((org: any) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        tier: org.tier,
      })),
      invoices: userInvoices.map((inv: any) => ({
        id: inv.id,
        number: inv.invoiceNo,
        date: inv.invoiceDate,
        amount: inv.total,
      })),
      projects: userProjects.map((proj: any) => ({
        id: proj.id,
        name: proj.name,
        status: proj.status,
        createdAt: proj.createdAt,
      })),
      activityLog: [],
      exportDate: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error exporting user data:", error);
    throw error;
  }
}

/**
 * Generate downloadable export file
 */
export function generateExportFile(data: UserDataExport): {
  content: string;
  filename: string;
} {
  const filename = `data-export-${data.user.id}-${Date.now()}.json`;
  const content = JSON.stringify(data, null, 2);

  return { content, filename };
}
