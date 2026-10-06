import { router, protectedProcedure, createFeatureRestrictedProcedure, invalidateMaintenanceCache, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { sql } from "drizzle-orm";
import * as db from "../db";
import { getDb, getRawPool } from "../db";
import { settings, organizationSettings, systemSettings, invoices, expenses, payments, users, userRoles, rolePermissions, documentNumberFormats, defaultSettings } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { TRPCError } from "@trpc/server";

const settingsReadProcedure = createFeatureRestrictedProcedure("admin:settings");
const settingsWriteProcedure = createFeatureRestrictedProcedure("admin:settings");
const rolesManageProcedure = createFeatureRestrictedProcedure("admin:manage_roles");
const platformOnlySettingsCategories = new Set([
  "app_logo",
  "company_logos",
  "cron_general",
  "cron_jobs",
  "dunning_policy",
  "email",
  "global_tags",
  "maintenance",
  "product_guidance",
  "push_fcm",
  "recaptcha",
  "sms_settings",
  "tweak_settings",
]);

function assertTenantSettingsCategoryAccess(organizationId: string | null | undefined, category: string) {
  if (organizationId && platformOnlySettingsCategories.has(category)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "This setting is managed by the platform administrator" });
  }
}

async function getSettingsForScope(database: any, category: string, organizationId?: string | null) {
  if (organizationId) {
    return database.select().from(organizationSettings).where(and(
      eq(organizationSettings.organizationId, organizationId),
      eq(organizationSettings.category, category),
    ));
  }
  return database.select().from(settings).where(eq(settings.category, category));
}

async function upsertSettingForScope(
  database: any,
  ctx: { user: { id: string; organizationId?: string | null } },
  category: string,
  key: string,
  value: string,
  description = '',
) {
  const organizationId = ctx.user.organizationId;
  if (organizationId) {
    const existing = await database.select().from(organizationSettings).where(and(
      eq(organizationSettings.organizationId, organizationId),
      eq(organizationSettings.category, category),
      eq(organizationSettings.key, key),
    )).limit(1);
    if (existing.length > 0) {
      await database.update(organizationSettings)
        .set({ value, updatedBy: ctx.user.id })
        .where(and(eq(organizationSettings.id, existing[0].id), eq(organizationSettings.organizationId, organizationId)));
    } else {
      await database.insert(organizationSettings).values({
        id: uuidv4(),
        organizationId,
        category,
        key,
        value,
        description,
        updatedBy: ctx.user.id,
      });
    }
    return;
  }

  const existing = await database.select().from(settings)
    .where(and(eq(settings.category, category), eq(settings.key, key)))
    .limit(1);
  if (existing.length > 0) {
    await database.update(settings)
      .set({ value, updatedBy: ctx.user.id })
      .where(eq(settings.id, existing[0].id));
  } else {
    await database.insert(settings).values({
      id: uuidv4(),
      category,
      key,
      value,
      description,
      updatedBy: ctx.user.id,
    });
  }
}

const globalDunningProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "super_admin" || ctx.user.organizationId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only the global app super admin can manage dunning policies" });
  }
  return next({ ctx });
});

const defaultProductGuidance = {
  enabled: true,
  overlay: { enabled: true, opacity: 0.45, color: "#0f172a", closeOnOutsideClick: true },
  pointer: { type: "spotlight", color: "#f59e0b", thickness: 2, animated: true },
  tooltip: { type: "card", position: "bottom", showProgress: true },
  videoUrl: "https://www.youtube.com/embed/ScMzIvxBSi4",
  steps: [
    { id: "workspace", title: "Your workspace", description: "This is your main work area. Your dashboard and the page you open appear here.", target: "[data-tour=page-content]" },
    { id: "navigation", title: "Explore the navigation", description: "Use the navigation rail to open the modules available to your role, such as CRM, finance, HR, and reports.", target: "[data-tour=mobile-nav], [data-tour=sidebar]" },
    { id: "search", title: "Find things quickly", description: "Search for records and pages from the header. On smaller screens, use the search icon.", target: "[data-tour=global-search]" },
    { id: "favorites", title: "Keep important records close", description: "Open your starred records here so frequently used items are easy to get back to.", target: "[data-tour=favorites]" },
    { id: "profile", title: "Manage your profile", description: "Open your account menu to update your profile, security preferences, and account settings.", target: "[data-tour=user-menu]" },
    { id: "notifications", title: "Stay up to date", description: "Approvals, messages, and important workspace updates appear in notifications.", target: "[data-tour=notifications]" },
    { id: "calendar", title: "Plan your work", description: "Open your calendar to review upcoming events and scheduled work.", target: "[data-tour=calendar]" },
    { id: "messages", title: "Communicate with your team", description: "Use the messages or communications shortcut to reach your workspace conversations.", target: "[data-tour=messages]" },
    { id: "reminders", title: "Keep track of follow-ups", description: "Review due and pending reminders without leaving your current page.", target: "[data-tour=reminders]" },
    { id: "help", title: "Get help whenever you need it", description: "Reopen this walkthrough from the help icon at any time.", target: "[data-tour=help]" },
  ],
  tasks: [
    { id: "profile", title: "Complete your profile", description: "Add your name, photo, and contact details.", href: "/settings" },
    { id: "company", title: "Configure company details", description: "Set the organization identity used in documents and emails.", href: "/settings" },
    { id: "team", title: "Invite your team", description: "Create users and assign the right roles.", href: "/users" },
    { id: "templates", title: "Review document templates", description: "Make invoices, quotes, and reports match your business.", href: "/document-templates" },
  ],
  hotspots: { enabled: true, color: "#f59e0b", pulse: true, showUnreadBadges: true },
};

const productGuidanceInput = z.object({
  enabled: z.boolean(),
  overlay: z.object({ enabled: z.boolean(), opacity: z.number().min(0).max(0.9), color: z.string().min(4), closeOnOutsideClick: z.boolean() }),
  pointer: z.object({ type: z.enum(["spotlight", "arrow", "ring", "none"]), color: z.string().min(4), thickness: z.number().int().min(0).max(8), animated: z.boolean() }),
  tooltip: z.object({ type: z.enum(["card", "speech", "compact"]), position: z.enum(["top", "bottom", "left", "right"]), showProgress: z.boolean() }),
  videoUrl: z.string().url().or(z.literal("")),
  steps: z.array(z.object({ id: z.string().min(1), title: z.string().min(1), description: z.string().min(1), target: z.string().optional() })).max(20),
  tasks: z.array(z.object({ id: z.string().min(1), title: z.string().min(1), description: z.string().min(1), href: z.string().optional() })).max(30),
  hotspots: z.object({ enabled: z.boolean(), color: z.string().min(4), pulse: z.boolean(), showUnreadBadges: z.boolean() }),
});

export const settingsRouter = router({
  getDunningPolicy: globalDunningProcedure.query(async () => {
    const database = await getDb();
    if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const rows = await database.select().from(settings).where(eq(settings.category, "dunning_policy"));
    const values: Record<string, number | boolean> = {
      standardSuspendAfterDays: 5,
      multitenantSuspendAfterDays: 3,
      terminateAfterDays: 21,
      enabled: true,
    };
    for (const row of rows) {
      if (row.key === "enabled") values.enabled = row.value === "true" || row.value === "1";
      else if (row.key in values) values[row.key] = Number(row.value);
    }
    return values;
  }),

  getProductGuidance: publicProcedure.query(async () => {
    const pool = await getRawPool();
    if (pool) {
      const [rows] = await pool.execute("SELECT value FROM systemSettings WHERE category = ? AND `key` = ? LIMIT 1", ["product_guidance", "config"]);
      const value = (rows as any[])[0]?.value;
      if (!value) return defaultProductGuidance;
      try {
        return { ...defaultProductGuidance, ...JSON.parse(value) };
      } catch {
        return defaultProductGuidance;
      }
    }
    const database = await getDb();
    if (!database) return defaultProductGuidance;
    const rows = await database.select().from(systemSettings).where(and(eq(systemSettings.category, "product_guidance"), eq(systemSettings.key, "config"))).limit(1);
    if (!rows.length || !rows[0].value) return defaultProductGuidance;
    try {
      return { ...defaultProductGuidance, ...JSON.parse(rows[0].value) };
    } catch {
      return defaultProductGuidance;
    }
  }),

  updateProductGuidance: settingsWriteProcedure
    .input(productGuidanceInput)
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.organizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Product guidance is managed by the platform administrator" });
      }
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const value = JSON.stringify(input);
      const existing = await database.select().from(systemSettings).where(and(eq(systemSettings.category, "product_guidance"), eq(systemSettings.key, "config"))).limit(1);
      if (existing.length) {
        await database.update(systemSettings).set({ value, dataType: "json", updatedBy: ctx.user.id }).where(eq(systemSettings.id, existing[0].id));
      } else {
        await database.insert(systemSettings).values({ id: uuidv4(), category: "product_guidance", key: "config", value, dataType: "json", description: "Global product walkthrough, tooltip, hotspot, and tutorial settings", isPublic: 1, updatedBy: ctx.user.id });
      }
      return { success: true };
    }),


  updateDunningPolicy: globalDunningProcedure
    .input(z.object({
      standardSuspendAfterDays: z.number().int().min(0).max(365),
      multitenantSuspendAfterDays: z.number().int().min(0).max(365),
      terminateAfterDays: z.number().int().min(1).max(365),
      enabled: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      for (const [key, value] of Object.entries(input)) {
        const existing = await database.select().from(settings)
          .where(and(eq(settings.category, "dunning_policy"), eq(settings.key, key))).limit(1);
        const serialized = String(value);
        if (existing.length) await database.update(settings).set({ value: serialized, updatedBy: ctx.user.id }).where(eq(settings.id, existing[0].id));
        else await database.insert(settings).values({ id: uuidv4(), category: "dunning_policy", key, value: serialized, description: "Global subscription dunning policy", updatedBy: ctx.user.id });
      }
      return { success: true };
    }),
  // Public maintenance status — accessible without auth for maintenance page display
  getMaintenanceStatus: publicProcedure.query(async () => {
    const database = await getDb();
    if (!database) return { enabled: false, title: "", message: "", estimatedReturn: "", contactEmail: "" };
    const results = await database.select().from(settings).where(eq(settings.category, "maintenance"));
    const map: Record<string, string> = {};
    results.forEach(s => { if (s.key) map[s.key] = s.value ?? ""; });
    return {
      enabled: map.maintenance_mode === "true" || map.maintenance_mode === "1",
      title: map.maintenance_title || "Under Maintenance",
      message: map.maintenance_message || "The system is currently undergoing scheduled maintenance. Please check back shortly.",
      estimatedReturn: map.maintenance_estimated_return || "",
      contactEmail: map.maintenance_contact_email || "",
    };
  }),

  // Roles management
  listRoles: rolesManageProcedure.query(async () => {
    const roles = await db.getRoles();
    return Promise.all(roles.map(async (role: any) => ({
      ...role,
      permissions: (await db.getRolePermissions(role.id)).map((permission: any) => permission.permissionName || permission.name || permission.id),
    })));
  }),

  // Settings management
  getCompanyInfo: settingsReadProcedure.query(async () => {
    const database = await getDb();
    if (!database) return {};
    try {
      const results = await database.select().from(settings).where(eq(settings.category, 'company'));
      const map: any = {};
      results.forEach(s => map[s.key] = s.value);
      return map;
    } catch (error) {
      console.warn("[settings.getCompanyInfo] Failed to read company settings:", error);
      return {};
    }
  }),

  updateCompanyInfo: settingsWriteProcedure
    .input(z.any())
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("DB error");
      
      // Ensure we are processing all keys including companyLogo
      for (const [key, value] of Object.entries(input)) {
        if (value === undefined) continue;
        
        const stringValue = value === null ? "" : String(value);
        
        // Use a more robust check for existing keys
        const existing = await database.select().from(settings)
          .where(and(eq(settings.category, 'company'), eq(settings.key, key)))
          .limit(1);
          
        if (existing.length > 0) {
          await database.update(settings)
            .set({ 
              value: stringValue, 
              updatedBy: ctx.user.id
            })
            .where(eq(settings.id, existing[0].id));
        } else {
          await database.insert(settings).values({ 
            id: uuidv4(), 
            category: 'company', 
            key, 
            value: stringValue, 
            // some columns like description are text without a SQL default; explicitly
            // provide an empty string so the generated SQL doesn't try to use `DEFAULT`
            description: '',
            updatedBy: ctx.user.id,
            // updatedAt is a timestamp; letting SQL use its own default is fine but we
            // can also explicitly set to now() if desired. Omit to avoid `DEFAULT` on
            // text.
          });
        }
      }
      return { success: true };
    }),

  getBankDetails: settingsReadProcedure.query(async () => {
    const database = await getDb();
    if (!database) return {};
    const results = await database.select().from(settings).where(eq(settings.category, 'bank'));
    const map: any = {};
    results.forEach(s => map[s.key] = s.value);
    return map;
  }),

  updateBankDetails: settingsWriteProcedure
    .input(z.any())
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("DB error");
      for (const [key, value] of Object.entries(input)) {
        const existing = await database.select().from(settings).where(and(eq(settings.category, 'bank'), eq(settings.key, key))).limit(1);
        if (existing.length) await database.update(settings).set({ value: String(value), updatedBy: ctx.user.id }).where(eq(settings.key, key));
        else await database.insert(settings).values({
          id: uuidv4(),
          category: 'bank',
          key,
          value: String(value),
          description: '',
          updatedBy: ctx.user.id
        });
      }
      return { success: true };
    }),

  getDocumentNumberingSettings: settingsReadProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    if (!database) return {};
    const results = await getSettingsForScope(database, 'numbering', ctx.user.organizationId);
    const map: any = {};
    results.forEach(s => map[s.key] = s.value);
    return map;
  }),

  getNotificationPreferences: settingsReadProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    if (!database) return { invoiceDue: true, paymentReceived: true, newClient: false, companyAnnouncement: false };
    const results = await getSettingsForScope(database, 'notifications', ctx.user.organizationId);
    const map: any = {};
    results.forEach(s => map[s.key] = s.value === 'true');
    // provide defaults if missing
    return {
      invoiceDue: map.invoiceDue ?? true,
      paymentReceived: map.paymentReceived ?? true,
      newClient: map.newClient ?? false,
      companyAnnouncement: map.companyAnnouncement ?? false,
    };
  }),

  updateNotificationPreferences: settingsWriteProcedure
    .input(z.object({
      invoiceDue: z.boolean(),
      paymentReceived: z.boolean(),
      newClient: z.boolean(),
      companyAnnouncement: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("DB error");
      for (const [key, value] of Object.entries(input)) {
        const stringVal = value ? 'true' : 'false';
        await upsertSettingForScope(database, ctx, 'notifications', key, stringVal);
      }
      return { success: true };
    }),

  updateDocumentPrefix: settingsWriteProcedure
    .input(z.object({ documentType: z.string(), prefix: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("DB error");
      const key = `${input.documentType}_prefix`;
      await upsertSettingForScope(database, ctx, 'numbering', key, input.prefix);
      return { success: true };
    }),

  getSettings: protectedProcedure.query(async () => {
    const database = await getDb();
    if (!database) return { companyName: 'Kiini', currency: 'KSH' };
    const results = await database.select().from(settings).where(eq(settings.category, 'general'));
    const map: any = {};
    results.forEach(s => map[s.key] = s.value);
    return { companyName: map.companyName || 'Kiini', currency: map.currency || 'KSH' };
  }),

  // Returns all frontend-relevant settings for any user (public)
  getPublicSettings: publicProcedure.query(async () => {
    const database = await getDb();
    if (!database) return { general: {}, currency: {}, theme: {}, logos: {} };
    const categories = ['general', 'currency', 'theme_settings', 'app_logo'];
    const rows = await database.select().from(settings).where(
      sql`${settings.category} IN (${sql.join(categories.map(c => sql`${c}`), sql`, `)})`
    );
    const result: Record<string, Record<string, string>> = {};
    for (const cat of categories) result[cat] = {};
    for (const row of rows) {
      const category = String(row.category || '');
      if (category && result[category]) result[category][row.key] = row.value ?? '';
    }
    if (Object.keys(result['app_logo']).length === 0) {
      const legacyLogoRows = await database.select().from(settings).where(eq(settings.category, 'company_logos'));
      for (const row of legacyLogoRows) result['app_logo'][row.key] = row.value ?? '';
    }
    return {
      general: result['general'],
      currency: result['currency'],
      theme: result['theme_settings'],
      logos: result['app_logo'],
    };
  }),

  getBankReconciliation: settingsReadProcedure.query(async () => {
    const database = await getDb();
    if (!database) return { revenue: 0, expenses: 0, balance: 0, status: "Disconnected" };
    const allExpenses = await database.select().from(expenses);
    const allPayments = await database.select().from(payments);
    const totalRevenue = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalExpenses = allExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    return { revenue: totalRevenue / 100, expenses: totalExpenses / 100, balance: (totalRevenue - totalExpenses) / 100, status: "Records Match" };
  }),

  // Back-compat: client code expects a few document-numbering helpers by these names
  getDocumentNumberFormat: settingsReadProcedure
    .input(z.object({ documentType: z.string() }).optional())
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return {};
      const results = await database.select().from(settings).where(eq(settings.category, 'numbering'));
      const map: any = {};
      results.forEach(s => (map[s.key] = s.value));
      if (input && input.documentType) {
        const key = `${input.documentType}_prefix`;
        return map[key] || {};
      }
      return map;
    }),

  updateDocumentNumberFormat: settingsWriteProcedure
    .input(z.object({ documentType: z.string(), prefix: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Reuse existing document prefix update behavior
      const database = await getDb();
      if (!database) throw new Error("DB error");
      const key = `${input.documentType}_prefix`;
      const existing = await database.select().from(settings).where(and(eq(settings.category, 'numbering'), eq(settings.key, key))).limit(1);
      if (existing.length) await database.update(settings).set({ value: input.prefix, updatedBy: ctx.user.id }).where(eq(settings.id, existing[0].id));
      else await database.insert(settings).values({
        id: uuidv4(),
        category: 'numbering',
        key,
        value: input.prefix,
        description: '',
        updatedBy: ctx.user.id
      });
      return { success: true };
    }),

  resetDocumentNumberFormatCounter: settingsWriteProcedure
    .input(z.object({ documentType: z.string(), startNumber: z.number().int().min(1).default(1) }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("DB error");
      await database.update(documentNumberFormats)
        .set({ currentNumber: input.startNumber, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) })
        .where(eq(documentNumberFormats.documentType, input.documentType as any));
      return { success: true, documentType: input.documentType, currentNumber: input.startNumber };
    }),

  getNextDocumentNumber: settingsReadProcedure
    .input(z.object({ documentType: z.string() }))
    .mutation(async ({ input }) => {
      return { documentNumber: await db.getNextDocumentNumber(input.documentType) };
    }),

  // Get all settings
  getAll: settingsReadProcedure.query(async ({ ctx }) => {
    if (ctx.user.organizationId) return [];
    const database = await getDb();
    if (!database) return [];
    return await database.select().from(settings);
  }),

  // Get roles
  getRoles: rolesManageProcedure.query(async () => {
    return await db.getRoles();
  }),

  // Back-compat: simple role management aliases so older client callsites using
  // `trpc.settings.createRole` / `updateRole` / `deleteRole` continue to work.
  createRole: rolesManageProcedure
    .input(z.object({ name: z.string(), displayName: z.string().optional(), description: z.string().optional(), permissions: z.array(z.string()).optional() }))
    .mutation(async ({ input, ctx }) => {
      const id = await db.createRole(input.name, input.description);
      if (input.permissions && input.permissions.length) {
        const allPerms = (await db.getPermissions()) as unknown as any[];
        for (const pName of input.permissions) {
          const perm = allPerms.find((pp: any) => pp.permissionName === pName || pp.name === pName);
          if (perm && perm.id) await db.assignPermissionToRole(id, perm.id);
        }
      }
      await db.logActivity({ userId: ctx.user.id, action: 'role_created', entityType: 'role', entityId: id, description: `Created role: ${input.name}` });
      return { id, name: input.name, displayName: input.displayName || input.name, description: input.description };
    }),

  updateRole: rolesManageProcedure
    .input(z.object({ id: z.string(), displayName: z.string().optional(), description: z.string().optional(), permissions: z.array(z.string()).optional() }))
    .mutation(async ({ input, ctx }) => {
      const dbconn = await getDb();
      if (!dbconn) throw new Error('Database not available');

      const updateSet: any = {};
      if (input.displayName !== undefined) updateSet.roleName = input.displayName;
      if (input.description !== undefined) updateSet.description = input.description;
      if (Object.keys(updateSet).length > 0) {
        await dbconn.update(userRoles).set(updateSet).where(eq(userRoles.id, input.id));
      }

      if (input.permissions) {
        const existing = await db.getRolePermissions(input.id);
        for (const rp of existing) {
          if (rp.permissionId) await db.removePermissionFromRole(input.id, rp.permissionId);
        }
        const allPerms = (await db.getPermissions()) as unknown as any[];
        for (const pName of input.permissions) {
          const perm = allPerms.find((pp: any) => pp.permissionName === pName || pp.name === pName);
          if (perm && perm.id) await db.assignPermissionToRole(input.id, perm.id);
        }
      }

      await db.logActivity({ userId: ctx.user.id, action: 'role_updated', entityType: 'role', entityId: input.id, description: `Updated role: ${input.id}` });
      return { success: true };
    }),

  deleteRole: rolesManageProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const dbconn = await getDb();
      if (!dbconn) throw new Error('Database not available');

      const role = await dbconn.select().from(userRoles).where(eq(userRoles.id, input)).limit(1);
      if (role.length && role[0].roleName && ['super_admin', 'admin'].includes(role[0].roleName)) {
        throw new Error('Cannot delete system role');
      }

      await dbconn.delete(userRoles).where(eq(userRoles.id, input));

      await db.logActivity({ userId: ctx.user.id, action: 'role_deleted', entityType: 'role', entityId: input, description: `Deleted role: ${input}` });
      return { success: true };
    }),

  // Legacy list alias for roles
  list: settingsReadProcedure.query(async () => {
    return await db.getRoles();
  }),

  // Get permissions
  getPermissions: settingsReadProcedure.query(async () => {
    return await db.getPermissions();
  }),

  // Get user counts per role
  getUserCounts: settingsReadProcedure.query(async () => {
    const database = await getDb();
    if (!database) return {};
    
    const results = await database.select({
      role: users.role,
      count: sql<number>`count(*)`
    }).from(users).groupBy(users.role);
    
    const counts: Record<string, number> = {};
    results.forEach(r => {
      if (r.role) counts[r.role] = Number(r.count);
    });
    return counts;
  }),

  // Set a setting
  set: createFeatureRestrictedProcedure("admin:settings")
    .input(z.object({
      key: z.string(),
      value: z.string(),
      category: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      assertTenantSettingsCategoryAccess(ctx.user.organizationId, input.category);
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const existing = await database.select().from(settings)
        .where(and(eq(settings.category, input.category), eq(settings.key, input.key)))
        .limit(1);

      if (existing.length > 0) {
        await database.update(settings)
          .set({ 
            value: input.value, 
            updatedBy: ctx.user.id,
          })
          .where(eq(settings.id, existing[0].id));
      } else {
        await database.insert(settings).values({
          id: uuidv4(),
          category: input.category,
          key: input.key,
          value: input.value,
          description: input.description,
          updatedBy: ctx.user.id,
        });
      }

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "setting_updated",
        entityType: "setting",
        entityId: input.key,
        description: `Updated setting: ${input.key} = ${input.value}`,
      });

      return { success: true };
    }),

  

  // Create permission
  createPermission: rolesManageProcedure
    .input(z.object({
      permissionName: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const permissionId = await db.createPermission(
        input.permissionName,
        input.description,
        input.category
      );
      
      await db.logActivity({
        userId: ctx.user.id,
        action: "permission_created",
        entityType: "permission",
        entityId: permissionId,
        description: `Created permission: ${input.permissionName}`,
      });
      
      return { 
        id: permissionId, 
        permissionName: input.permissionName, 
        description: input.description,
        category: input.category 
      };
    }),

  // Back-compat bankReconciliation helpers (client expects bankReconciliation.getById / update / list)
  getById: settingsReadProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return null;
      const result = await database.select().from(settings).where(eq(settings.id, input)).limit(1);
      const row = result[0] || null;
      if (!row) return null;

      // If the stored value is JSON, return the parsed object so client-side
      // code (e.g. bank reconciliation) gets a structured object instead of
      // the raw settings row.
      try {
        if (row.value) {
          const parsed = JSON.parse(row.value);
          if (parsed && typeof parsed === 'object') return parsed;
        }
      } catch (e) {
        // ignore parse errors and fall back to returning raw row
      }

      return row;
    }),

  update: createFeatureRestrictedProcedure("settings:manage")
    .input(z.any())
    .mutation(async ({ input, ctx }) => {
      // Best-effort: update a bank reconciliation record stored in settings
      const database = await getDb();
      if (!database) throw new Error("DB error");
      for (const [key, value] of Object.entries(input)) {
        const existing = await database.select().from(settings).where(and(eq(settings.category, 'bank'), eq(settings.key, key))).limit(1);
        if (existing.length) await database.update(settings).set({ value: String(value), updatedBy: ctx.user.id }).where(eq(settings.id, existing[0].id));
        else await database.insert(settings).values({ id: uuidv4(), category: 'bank', key, value: String(value), updatedBy: ctx.user.id });
      }
      return { success: true };
    }),

  listBank: settingsReadProcedure.query(async () => {
    const database = await getDb();
    if (!database) return [];
    return await database.select().from(settings).where(eq(settings.category, 'bank'));
  }),

  // Assign permission to role
  assignPermissionToRole: rolesManageProcedure
    .input(z.object({
      roleId: z.string(),
      permissionId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.assignPermissionToRole(input.roleId, input.permissionId);
      
      await db.logActivity({
        userId: ctx.user.id,
        action: "permission_assigned",
        entityType: "role_permission",
        entityId: `${input.roleId}_${input.permissionId}`,
        description: `Assigned permission ${input.permissionId} to role ${input.roleId}`,
      });
      
      return { success: true };
    }),

  // Remove permission from role
  removePermissionFromRole: rolesManageProcedure
    .input(z.object({
      roleId: z.string(),
      permissionId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.removePermissionFromRole(input.roleId, input.permissionId);
      
      await db.logActivity({
        userId: ctx.user.id,
        action: "permission_removed",
        entityType: "role_permission",
        entityId: `${input.roleId}_${input.permissionId}`,
        description: `Removed permission ${input.permissionId} from role ${input.roleId}`,
      });
      
      return { success: true };
    }),

  // Get role permissions
  getRolePermissions: rolesManageProcedure
    .input(z.object({
      roleId: z.string(),
    }))
    .query(async ({ input }) => {
      return await db.getRolePermissions(input.roleId);
    }),

  // Back-compat: user preference helpers expected by older client code
  getUserPreferences: settingsReadProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    if (!database) return [];
    
    // Fetch all user preferences for the current user
    const userPrefixes = await database.select().from(settings)
      .where(and(eq(settings.category, 'user_pref')))
      .limit(100); // Reasonable limit for preferences
    
    // Filter to only this user's preferences
    const userIdPrefix = `user_pref:${ctx.user.id}:`;
    const userPrefs = userPrefixes.filter(s => s.key && s.key.startsWith(userIdPrefix));
    
    // Transform to frontend-friendly format
    return userPrefs.map(pref => ({
      key: pref.key,
      value: pref.value,
    }));
  }),

  setUserPreference: settingsWriteProcedure
    .input(z.object({ key: z.string(), value: z.union([z.string(), z.boolean(), z.number()]) }))
    .mutation(async ({ input, ctx }) => {
      // Store as a general setting under 'user_pref:{userId}:{key}'
      const database = await getDb();
      if (!database) throw new Error('DB error');
      const prefKey = `user_pref:${ctx.user.id}:${input.key}`;
      // Convert value to string for storage
      const valueStr = String(input.value);
      const existing = await database.select().from(settings).where(and(eq(settings.category, 'user_pref'), eq(settings.key, prefKey))).limit(1);
      if (existing.length) {
        await database.update(settings).set({ value: valueStr, updatedBy: ctx.user.id, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) }).where(eq(settings.id, existing[0].id));
      } else {
        await database.insert(settings).values({ id: uuidv4(), category: 'user_pref', key: prefKey, value: valueStr, description: `User preference: ${input.key}`, updatedBy: ctx.user.id });
      }
      return { success: true };
    }),

  resetSettingToDefault: settingsWriteProcedure
    .input(z.object({ key: z.string(), category: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.organizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Platform defaults cannot be changed from an organization workspace" });
      }
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const category = input.category || undefined;
      const defaults = category
        ? await db.getDefaultSettingsByCategory(category)
        : await database.select().from(defaultSettings).where(eq(defaultSettings.key, input.key)).limit(1);
      const defaultSetting = defaults.find((setting: any) => setting.key === input.key);
      if (!defaultSetting) throw new TRPCError({ code: "NOT_FOUND", message: "Default setting not found" });
      await db.setSetting(defaultSetting.key, defaultSetting.value, defaultSetting.category);
      return { success: true, key: defaultSetting.key, category: defaultSetting.category, value: defaultSetting.value };
    }),

  resetCategoryToDefaults: settingsWriteProcedure
    .input(z.object({ category: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.organizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Organization settings cannot reset platform defaults" });
      }
      assertTenantSettingsCategoryAccess(ctx.user.organizationId, input.category);
      const defaults = await db.getDefaultSettingsByCategory(input.category);
      if (!defaults.length) throw new TRPCError({ code: "NOT_FOUND", message: "Default settings not found" });
      await db.resetCategoryToDefaults(input.category);
      if (input.category === "maintenance" || input.category === "tweak_settings") invalidateMaintenanceCache();
      return { success: true, category: input.category, count: defaults.length };
    }),

  // Generic: get all settings for a given category as a key-value map
  getByCategory: settingsReadProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input, ctx }) => {
      assertTenantSettingsCategoryAccess(ctx.user.organizationId, input.category);
      if (input.category === "app_logo" && ctx.user.organizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "App logo settings are global-only" });
      }
      const database = await getDb();
      if (!database) return {};
      let results = await getSettingsForScope(database, input.category, ctx.user.organizationId);
      if (!ctx.user.organizationId && input.category === "app_logo" && results.length === 0) {
        results = await database.select().from(settings).where(eq(settings.category, "company_logos"));
      }
      const map: Record<string, string> = {};
      results.forEach(s => { if (s.key) map[s.key] = s.value ?? ""; });
      return map;
    }),

  // Generic: update multiple settings for a given category in one call
  updateByCategory: settingsWriteProcedure
    .input(z.object({
      category: z.string(),
      values: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
    }))
    .mutation(async ({ input, ctx }) => {
      assertTenantSettingsCategoryAccess(ctx.user.organizationId, input.category);
      if (input.category === "app_logo" && (ctx.user.organizationId || !["super_admin", "ict_manager"].includes(ctx.user.role))) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only global super-admins and ICT Managers can update the app logo" });
      }
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      for (const [key, value] of Object.entries(input.values)) {
        await upsertSettingForScope(database, ctx, input.category, key, String(value));
      }
      // Invalidate maintenance mode cache when maintenance settings change
      if (input.category === "maintenance" || input.category === "tweak_settings") {
        invalidateMaintenanceCache();
      }
      return { success: true };
    }),
});