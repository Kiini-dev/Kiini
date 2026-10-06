import { createFeatureRestrictedProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { reminders, scheduledReminders } from "../../drizzle/schema";
import { and, asc, desc, eq, lte } from "drizzle-orm";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { createNotification } from "../_core/notification";
import { TRPCError } from "@trpc/server";

const listInput = z.object({
  status: z.enum(["pending", "sent", "failed", "cancelled", "due"]).optional(),
  reminderId: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  includeDueOnly: z.boolean().optional(),
});

export async function processDueReminders(): Promise<{ delivered: number; processed: number }> {
  const db = await getDb();
  if (!db) return { delivered: 0, processed: 0 };
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  const due = await db.select({ scheduled: scheduledReminders, reminder: reminders }).from(scheduledReminders).leftJoin(reminders, eq(reminders.id, scheduledReminders.reminderId)).where(and(eq(scheduledReminders.status, "pending"), lte(scheduledReminders.scheduledFor, now)));
  let delivered = 0;
  for (const item of due) {
    if (!item.reminder) continue;
    const ok = await createNotification({ userId: item.scheduled.recipientId, title: item.reminder.name, message: item.reminder.emailTemplate || `Reminder: ${item.reminder.name}`, type: "reminder", category: "reminder", entityType: item.scheduled.referenceType, entityId: item.scheduled.referenceId, actionUrl: `/${item.scheduled.referenceType}s/${item.scheduled.referenceId}`, priority: "normal" });
    await db.update(scheduledReminders).set({ status: ok ? "sent" : "failed", sentAt: ok ? new Date().toISOString().slice(0, 19).replace("T", " ") : null, error: ok ? null : "Notification delivery failed" }).where(eq(scheduledReminders.id, item.scheduled.id));
    if (ok) delivered++;
  }
  return { delivered, processed: due.length };
}

export const remindersRouter = router({
  definitions: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(reminders).orderBy(desc(reminders.createdAt));
  }),

  create: createFeatureRestrictedProcedure("tools:automation")
    .input(z.object({
      name: z.string().min(1).max(255),
      type: z.enum(["invoice_due", "estimate_expiry", "project_milestone", "payment_overdue", "custom"]),
      frequency: z.enum(["once", "daily", "weekly", "monthly", "custom"]),
      customDays: z.number().int().min(1).max(365).optional(),
      timing: z.enum(["before", "on", "after"]),
      emailEnabled: z.boolean().default(true),
      smsEnabled: z.boolean().default(false),
      emailTemplate: z.string().optional(),
      smsTemplate: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const id = uuidv4();
      await db.insert(reminders).values({ id, ...input, isActive: 1, emailEnabled: input.emailEnabled ? 1 : 0, smsEnabled: input.smsEnabled ? 1 : 0, createdBy: ctx.user.id, createdAt: new Date(), updatedAt: new Date() } as any);
      return { id };
    }),

  update: createFeatureRestrictedProcedure("tools:automation")
    .input(z.object({ id: z.string(), name: z.string().min(1).max(255).optional(), type: z.enum(["invoice_due", "estimate_expiry", "project_milestone", "payment_overdue", "custom"]).optional(), frequency: z.enum(["once", "daily", "weekly", "monthly", "custom"]).optional(), customDays: z.number().int().min(1).max(365).nullable().optional(), timing: z.enum(["before", "on", "after"]).optional(), isActive: z.boolean().optional(), emailEnabled: z.boolean().optional(), smsEnabled: z.boolean().optional(), emailTemplate: z.string().optional(), smsTemplate: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, isActive, emailEnabled, smsEnabled, ...data } = input;
      await db.update(reminders).set({ ...data, ...(isActive === undefined ? {} : { isActive: isActive ? 1 : 0 }), ...(emailEnabled === undefined ? {} : { emailEnabled: emailEnabled ? 1 : 0 }), ...(smsEnabled === undefined ? {} : { smsEnabled: smsEnabled ? 1 : 0 }), updatedAt: new Date() } as any).where(eq(reminders.id, id));
      return { success: true };
    }),

  delete: createFeatureRestrictedProcedure("tools:automation").input(z.string()).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(scheduledReminders).set({ status: "cancelled" }).where(and(eq(scheduledReminders.reminderId, input), eq(scheduledReminders.status, "pending")));
    await db.delete(reminders).where(eq(reminders.id, input));
    return { success: true };
  }),

  schedule: createFeatureRestrictedProcedure("tools:automation")
    .input(z.object({ reminderId: z.string(), referenceType: z.string().min(1).max(50), referenceId: z.string().min(1), recipientId: z.string().min(1), recipientType: z.enum(["user", "client"]), scheduledFor: z.coerce.date() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const id = uuidv4();
      await db.insert(scheduledReminders).values({ id, reminderId: input.reminderId, referenceType: input.referenceType, referenceId: input.referenceId, recipientId: input.recipientId, recipientType: input.recipientType, scheduledFor: input.scheduledFor.toISOString().slice(0, 19).replace("T", " "), status: "pending", createdAt: new Date() } as any);
      return { id };
    }),

  cancel: createFeatureRestrictedProcedure("tools:automation").input(z.object({ id: z.string() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(scheduledReminders).set({ status: "cancelled" }).where(eq(scheduledReminders.id, input.id));
    return { success: true };
  }),

  deliverDue: createFeatureRestrictedProcedure("tools:automation").mutation(async () => processDueReminders()),

  list: protectedProcedure
    .input(listInput.optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable while listing reminders" });
      const now = new Date().toISOString().slice(0, 19).replace("T", " ");
      const conditions = [
        input?.status && input.status !== "due" ? eq(scheduledReminders.status, input.status) : undefined,
        input?.status === "due" ? and(eq(scheduledReminders.status, "pending"), lte(scheduledReminders.scheduledFor, now)) : undefined,
        input?.reminderId ? eq(scheduledReminders.reminderId, input.reminderId) : undefined,
        input?.includeDueOnly ? lte(scheduledReminders.scheduledFor, now) : undefined,
      ].filter(Boolean) as any[];

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const rows = await db
        .select({
          id: scheduledReminders.id,
          scheduledFor: scheduledReminders.scheduledFor,
          status: scheduledReminders.status,
          referenceType: scheduledReminders.referenceType,
          referenceId: scheduledReminders.referenceId,
          reminderId: reminders.id,
          title: reminders.name,
          type: reminders.type,
        })
        .from(scheduledReminders)
        .leftJoin(reminders, eq(reminders.id, scheduledReminders.reminderId))
        .where(whereClause)
        .orderBy(asc(scheduledReminders.scheduledFor))
        .limit(input?.limit ?? 20);

      return rows;
    }),
});
