/**
 * Communications Hub Router
 * Handles emails, internal messaging, SMS, templates, calendar events, and recurring invoice management
 */

import { z } from "zod";
import { optionalEmail } from "../utils/validation";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import * as db from "../db";
import { getPool } from "../db";
import { sendEmail as sendCoreEmail } from "../_core/mail";
import { v4 as uuidv4 } from "uuid";
import { communicationLogs, emailLog, organizationSettings, settings } from "../../drizzle/schema";
import { eq, and, desc, like, sql } from "drizzle-orm";

// Feature-based procedures
const readProcedure = createFeatureRestrictedProcedure("communications:read");

function createCommunicationScopeFilter(id: string, organizationId?: string | null) {
  const idFilter = eq(communicationLogs.id, id);
  if (!organizationId) return idFilter;
  return and(idFilter, eq(communicationLogs.organizationId, organizationId));
}

// Email Templates
const sendEmailSchema = z.object({
  to: z.string().email().optional(),
  recipientId: z.string().optional(),
  subject: z.string(),
  body: z.string(),
  templateId: z.string().optional(),
  cc: optionalEmail(),
  bcc: optionalEmail(),
});

const createEmailTemplateSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  body: z.string().min(1),
  category: z.enum(['invoice', 'estimate', 'payment', 'general', 'notification']),
  variables: z.array(z.string()).optional(),
});

const updateEmailTemplateSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  category: z.string().optional(),
});

// Internal Messaging
const internalMessageSchema = z.object({
  recipientId: z.string(),
  content: z.string().min(1),
  subject: z.string().optional(),
  attachmentUrl: z.string().optional(),
});

// SMS
const sendSmsSchema = z.object({
  phoneNumber: z.string(),
  message: z.string().min(1),
  recipientId: z.string().optional(),
});

// Calendar Events
const createCalendarEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string(), // ISO date
  eventType: z.enum(['invoice_due', 'estimate_due', 'payment_due', 'meeting', 'reminder', 'task']),
  linkedEntityId: z.string().optional(),
  linkedEntityType: z.enum(['invoice', 'estimate', 'payment', 'task']).optional(),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'annually']).optional(),
  recurringEndDate: z.string().optional(),
  assignedTo: z.array(z.string()).optional(),
});

// Recurring Invoices
const createRecurringInvoiceSchema = z.object({
  baseInvoiceId: z.string(),
  frequency: z.enum(['weekly', 'bi-weekly', 'monthly', 'quarterly', 'annually']),
  startDate: z.string(), // ISO date
  endDate: z.string().optional(),
  noOfRecurrences: z.number().optional(),
  isActive: z.boolean().default(true),
});

const updateRecurringInvoiceSchema = z.object({
  id: z.string(),
  isActive: z.boolean().optional(),
  endDate: z.string().optional(),
  noOfRecurrences: z.number().optional(),
});

/**
 * Send email using configured SMTP service
 */
async function sendEmailViaSmtp(
  to: string,
  subject: string,
  body: string,
  cc?: string,
  bcc?: string
): Promise<boolean> {
  // Delegate to shared mail module which reads SMTP config from env vars AND DB settings
  await sendCoreEmail({ to, subject, html: body, cc, bcc });
  return true;
}

async function insertCommunicationLog(values: Record<string, unknown>) {
  const pool = getPool();
  if (!pool) throw new Error("Database pool unavailable");
  const [rows] = await pool.query("SHOW COLUMNS FROM `communicationLogs`");
  const liveColumns = new Set((Array.isArray(rows) ? rows : []).map((row: any) => String(row.Field || row.field || "")));
  const entries = Object.entries(values).filter(([column]) => liveColumns.has(column));
  if (!entries.length) throw new Error("communicationLogs table has no compatible columns");
  const columns = entries.map(([column]) => `\`${column}\``).join(", ");
  const placeholders = entries.map(() => "?").join(", ");
  await pool.query(
    `INSERT INTO \`communicationLogs\` (${columns}) VALUES (${placeholders})`,
    entries.map(([, value]) => value)
  );
}

export const communicationsRouter = router({
  // ==================== COMMUNICATION LOGS ====================
  /**
   * Get all communication logs with filtering
   */
  list: createFeatureRestrictedProcedure("communications:read")
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        type: z.enum(['email', 'sms']).optional(),
        status: z.enum(['pending', 'sent', 'failed']).optional(),
        referenceId: z.string().optional(),
        referenceType: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const pool = getPool();
        if (!pool) {
          return {
            communications: [],
            total: 0,
            limit: input.limit,
            offset: input.offset,
          };
        }

        const [columnRows] = await pool.query("SHOW COLUMNS FROM `communicationLogs`");
        const columns = new Set((Array.isArray(columnRows) ? columnRows : []).map((row: any) => String(row.Field || row.field || "")));
        if (!columns.size) return { communications: [], total: 0, limit: input.limit, offset: input.offset };
        const conditions: string[] = [];
        const params: unknown[] = [];
        const addFilter = (column: string, value: unknown) => {
          if (value !== undefined && columns.has(column)) {
            conditions.push(`\`${column}\` = ?`);
            params.push(value);
          }
        };
        addFilter("organizationId", ctx.user.organizationId);
        addFilter("type", input.type);
        addFilter("status", input.status);
        addFilter("referenceType", input.referenceType);
        addFilter("referenceId", input.referenceId);
        const whereSql = conditions.length ? ` WHERE ${conditions.join(" AND ")}` : "";
        const orderSql = columns.has("createdAt") ? " ORDER BY `createdAt` DESC" : "";
        const [result] = await pool.query(
          `SELECT * FROM \`communicationLogs\`${whereSql}${orderSql} LIMIT ? OFFSET ?`,
          [...params, input.limit, input.offset]
        );
        const [countRows] = await pool.query(
          `SELECT COUNT(*) AS total FROM \`communicationLogs\`${whereSql}`,
          params
        );
        const total = Number((countRows as any[])[0]?.total || 0);

        return {
          communications: Array.isArray(result) ? result : [],
          total,
          limit: input.limit,
          offset: input.offset,
        };
      } catch (error: any) {
        console.error('List communications error:', error?.message || error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve communication logs',
        });
      }
    }),

  create: createFeatureRestrictedProcedure("communications:send")
    .input(z.object({
      type: z.enum(["email", "sms"]),
      recipient: z.string().min(1),
      subject: z.string().optional(),
      body: z.string().min(1),
      status: z.enum(["pending", "sent", "failed"]).default("pending"),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await db.getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const id = uuidv4();
      await database.insert(communicationLogs).values({
        id,
        organizationId: ctx.user.organizationId ?? null,
        type: input.type,
        recipient: input.recipient,
        subject: input.subject || null,
        body: input.body,
        status: input.status,
        createdBy: ctx.user.id,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      } as any);
      return { id, success: true };
    }),

  update: createFeatureRestrictedProcedure("communications:send")
    .input(z.object({
      id: z.string(),
      recipient: z.string().min(1).optional(),
      subject: z.string().optional(),
      body: z.string().min(1).optional(),
      status: z.enum(["pending", "sent", "failed"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await db.getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const updates: any = {};
      for (const field of ["recipient", "subject", "body", "status"] as const) {
        if (input[field] !== undefined) updates[field] = input[field];
      }
      await database.update(communicationLogs).set(updates).where(
        createCommunicationScopeFilter(input.id, ctx.user.organizationId)
      );
      return { success: true };
    }),

  delete: createFeatureRestrictedProcedure("communications:send")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const database = await db.getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await database.delete(communicationLogs).where(
        createCommunicationScopeFilter(input.id, ctx.user.organizationId)
      );
      return { success: true };
    }),

  /**
   * Get a single communication log by ID
   */
  getById: createFeatureRestrictedProcedure("communications:read")
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const connection = (await db.getDb()) as any;
        const orgId = ctx.user.organizationId;

        const result = await connection.raw(
          orgId
            ? `
              SELECT * FROM communicationLogs WHERE id = ? AND organizationId = ?
            `
            : `
              SELECT * FROM communicationLogs WHERE id = ?
            `,
          orgId ? [input.id, orgId] : [input.id]
        );

        if (!Array.isArray(result) || result.length === 0) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Communication log not found',
          });
        }

        return result[0];
      } catch (error: any) {
        console.error('Get communication log error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve communication log',
        });
      }
    }),

  // ==================== EMAIL TEMPLATES ====================
  /**
   * Get all email templates
   */
  getAllEmailTemplates: protectedProcedure.query(async ({ ctx }) => {
    try {
      const database = await db.getDb();
      if (!database) return { templates: [] };

      const globalRows = await database.select().from(settings).where(like(settings.category, "email_template:%"));
      const organizationRows = ctx.user.organizationId
        ? await database.select().from(organizationSettings).where(and(
          eq(organizationSettings.organizationId, ctx.user.organizationId),
          like(organizationSettings.category, "email_template:%"),
        ))
        : [];
      const rowsByScope = new Map<string, typeof globalRows[number]>();
      globalRows.forEach((row) => rowsByScope.set(`${row.category}:${row.key}`, row));
      organizationRows.forEach((row) => rowsByScope.set(`${row.category}:${row.key}`, row));
      const rows = Array.from(rowsByScope.values());
      const byTemplate = new Map<string, Record<string, string>>();
      for (const row of rows) {
        const templateId = (row.category || "").substring("email_template:".length);
        const values = byTemplate.get(templateId) || {};
        values[row.key] = row.value || "";
        byTemplate.set(templateId, values);
      }

      const settingTemplates = Array.from(byTemplate, ([id, values]) => ({
          id,
          name: id.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
          subject: values.subject || "",
          body: values.body || "",
          category: "general",
        })).filter((template) => template.subject || template.body);
      const pool = getPool();
      const [storedTemplates] = pool
        ? ctx.user.organizationId
          ? await pool.query("SELECT id, name, subject, htmlContent AS body, category, createdAt FROM emailTemplates WHERE organizationId = ? OR organizationId IS NULL ORDER BY createdAt DESC", [ctx.user.organizationId])
          : await pool.query("SELECT id, name, subject, htmlContent AS body, category, createdAt FROM emailTemplates ORDER BY createdAt DESC")
        : [[]];

      return { templates: [...settingTemplates, ...(storedTemplates as any[])] };
    } catch (error: any) {
      console.error('Get templates error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve email templates',
      });
    }
  }),

  /**
   * Create a new email template
   */
  createEmailTemplate: createFeatureRestrictedProcedure("communications:manage")
    .input(createEmailTemplateSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const pool = getPool();
        if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const templateId = uuidv4();
        const organizationId = ctx.user.organizationId || null;
        await pool.query(
          `INSERT INTO emailTemplates (id, name, subject, htmlContent, plainTextContent, category, variables, createdBy, organizationId)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [templateId, input.name, input.subject, input.body, input.body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(), input.category, JSON.stringify(input.variables || []), ctx.user.id, organizationId],
        );
        await db.logActivity({
          userId: ctx.user.id,
          action: 'email_template_created',
          entityType: 'email_template',
          entityId: templateId,
          description: `Created email template: ${input.name}`,
        });

        return { id: templateId, ...input, createdAt: new Date().toISOString().replace("T", " ").substring(0, 19) };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error('Create template error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create email template',
        });
      }
    }),

  /**
   * Update an email template
   */
  updateEmailTemplate: createFeatureRestrictedProcedure("communications:manage")
    .input(updateEmailTemplateSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const pool = getPool();
        if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const [existing] = ctx.user.organizationId
          ? await pool.query("SELECT id FROM emailTemplates WHERE id = ? AND organizationId = ? LIMIT 1", [input.id, ctx.user.organizationId])
          : await pool.query("SELECT id FROM emailTemplates WHERE id = ? AND organizationId IS NULL LIMIT 1", [input.id]);
        if (!(existing as any[]).length) throw new TRPCError({ code: "NOT_FOUND", message: "Email template not found" });
        const set: string[] = [];
        const values: unknown[] = [];
        if (input.name !== undefined) { set.push("name = ?"); values.push(input.name); }
        if (input.subject !== undefined) { set.push("subject = ?"); values.push(input.subject); }
        if (input.body !== undefined) {
          set.push("htmlContent = ?", "plainTextContent = ?");
          values.push(input.body, input.body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
        }
        if (input.category !== undefined) { set.push("category = ?"); values.push(input.category); }
        if (set.length) {
          values.push(input.id);
          if (ctx.user.organizationId) {
            values.push(ctx.user.organizationId);
            await pool.query(`UPDATE emailTemplates SET ${set.join(", ")} WHERE id = ? AND organizationId = ?`, values);
          } else {
            await pool.query(`UPDATE emailTemplates SET ${set.join(", ")} WHERE id = ? AND organizationId IS NULL`, values);
          }
        }
        await db.logActivity({
          userId: ctx.user.id,
          action: 'email_template_updated',
          entityType: 'email_template',
          entityId: input.id,
          description: `Updated email template`,
        });

        const [rows] = await pool.query("SELECT id, name, subject, htmlContent AS body, category, createdAt, updatedAt FROM emailTemplates WHERE id = ? LIMIT 1", [input.id]);
        return (rows as any[])[0];
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error('Update template error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update email template',
        });
      }
    }),

  /**
   * Delete an email template
   */
  deleteEmailTemplate: createFeatureRestrictedProcedure("communications:manage")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const pool = getPool();
        if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        const [result] = ctx.user.organizationId
          ? await pool.query("DELETE FROM emailTemplates WHERE id = ? AND organizationId = ?", [input.id, ctx.user.organizationId])
          : await pool.query("DELETE FROM emailTemplates WHERE id = ? AND organizationId IS NULL", [input.id]);
        if (!(result as any).affectedRows) throw new TRPCError({ code: "NOT_FOUND", message: "Email template not found" });
        await db.logActivity({
          userId: ctx.user.id,
          action: 'email_template_deleted',
          entityType: 'email_template',
          entityId: input.id,
          description: 'Deleted email template',
        });

        return {
          success: true,
          message: 'Email template deleted successfully',
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        console.error('Delete template error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete email template',
        });
      }
    }),

  // ==================== EMAIL SENDING ====================
  /**
   * Send email using template or custom body
   */
  sendEmail: createFeatureRestrictedProcedure("communications:send")
    .input(sendEmailSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await db.getDb();
        let emailBody = input.body;
        let recipient = input.to;

        if (!recipient && input.recipientId && database) {
          const result = await database.execute(sql`
            SELECT email, phone FROM clients WHERE id = ${input.recipientId}
            UNION ALL SELECT email, NULL AS phone FROM users WHERE id = ${input.recipientId}
            UNION ALL SELECT email, phone FROM employees WHERE id = ${input.recipientId}
            LIMIT 1
          `);
          const row = (result as any)?.[0]?.[0];
          recipient = row?.email || row?.phone;
        }

        // If template is provided, load and use the persisted settings template.
        if (input.templateId) {
          const category = `email_template:${input.templateId}`;
          const globalTemplateRows = await database?.select().from(settings).where(eq(settings.category, category));
          let savedBody = globalTemplateRows?.find((row) => row.key === "body")?.value;
          if (database && ctx.user.organizationId) {
            const organizationTemplateRows = await database.select().from(organizationSettings).where(and(
              eq(organizationSettings.organizationId, ctx.user.organizationId),
              eq(organizationSettings.category, category),
            ));
            const organizationBody = organizationTemplateRows.find((row) => row.key === "body");
            if (organizationBody) savedBody = organizationBody.value;
          }
          if (savedBody) emailBody = savedBody;
        }

        // Send via SMTP
        if (!recipient) throw new TRPCError({ code: "BAD_REQUEST", message: "A recipient email is required" });
        await sendEmailViaSmtp(recipient, input.subject, emailBody, input.cc, input.bcc);

        // Persist to communication logs so it appears in communications modules.
        if (database) {
          const logId = uuidv4();
          await insertCommunicationLog({
            id: logId,
            organizationId: ctx.user.organizationId ?? null,
            type: 'email',
            recipient,
            subject: input.subject,
            body: emailBody,
            status: 'sent',
            sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            createdBy: ctx.user.id,
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          });
          await database.insert(emailLog).values({
            id: uuidv4(),
            queueId: null,
            recipientEmail: recipient,
            subject: input.subject,
            eventType: "communication",
            status: "sent",
            sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          });
        }

        // Log email activity
        await db.logActivity({
          userId: ctx.user.id,
          action: 'email_sent',
          entityType: 'email',
          entityId: uuidv4(),
          description: `Sent email to ${input.to}: ${input.subject}`,
        });

        return {
          success: true,
          message: 'Email sent successfully',
        };
      } catch (error: any) {
        console.error('Send email error:', error);
        try {
          const failedDatabase = await db.getDb();
          if (failedDatabase && (input.to || input.recipientId)) {
            const failedRecipient = input.to || input.recipientId!;
            await insertCommunicationLog({
              id: uuidv4(), organizationId: ctx.user.organizationId ?? null, type: "email",
              recipient: failedRecipient, subject: input.subject, body: input.body, status: "failed",
              error: error?.message || "Failed to send email", createdBy: ctx.user.id,
              createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            });
            await failedDatabase.insert(emailLog).values({
              id: uuidv4(), queueId: null, recipientEmail: failedRecipient, subject: input.subject,
              eventType: "communication", status: "failed", errorMessage: error?.message || "Failed to send email",
              sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            });
          }
        } catch (logError) { console.error("Failed to persist email error log:", logError); }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to send email: ${error.message}`,
        });
      }
    }),

  // ==================== INTERNAL MESSAGING (INTRANET) ====================
  /**
   * Send internal message to staff member
   */
  sendInternalMessage: createFeatureRestrictedProcedure("communications:messaging")
    .input(internalMessageSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const messageId = uuidv4();

        // Store message in database
        // await db.createInternalMessage({...})

        await db.logActivity({
          userId: ctx.user.id,
          action: 'internal_message_sent',
          entityType: 'internal_message',
          entityId: messageId,
          description: `Sent message to user: ${input.recipientId}`,
        });

        return {
          id: messageId,
          ...input,
          senderId: ctx.user.id,
          sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          isRead: false,
        };
      } catch (error: any) {
        console.error('Send internal message error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send internal message',
        });
      }
    }),

  /**
   * Get internal messages for current user
   */
  getInternalMessages: createFeatureRestrictedProcedure("communications:messaging")
    .input(
      z.object({
        conversationWith: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // Fetch messages for this user from database
        // Filter by recipient and optionally by sender
        return {
          messages: [],
          total: 0,
        };
      } catch (error: any) {
        console.error('Get messages error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve messages',
        });
      }
    }),

  /**
   * Mark internal message as read
   */
  markMessageAsRead: createFeatureRestrictedProcedure("communications:messaging")
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        return {
          success: true,
          message: 'Message marked as read',
        };
      } catch (error: any) {
        console.error('Mark as read error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to mark message as read',
        });
      }
    }),

  /**
   * Get list of staff for messaging
   */
  getStaffList: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Fetch all active staff members
      return {
        staff: [],
      };
    } catch (error: any) {
      console.error('Get staff list error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve staff list',
      });
    }
  }),

  // ==================== SMS COMMUNICATION ====================
  /**
   * Send SMS message
   */
  sendSms: createFeatureRestrictedProcedure("communications:send")
    .input(sendSmsSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const smsId = uuidv4();

        // In production, integrate with SMS provider like Twilio, Nexmo, etc.
        // For now, just logging the intent
        console.log(`[SMS] Sending to ${input.phoneNumber}: ${input.message}`);

        const database = await db.getDb();
        if (database) {
          await database.insert(communicationLogs).values({
            id: smsId,
            organizationId: ctx.user.organizationId ?? null,
            type: "sms",
            recipient: input.phoneNumber,
            body: input.message,
            status: "sent",
            sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            createdBy: ctx.user.id,
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          } as any);
        }

        await db.logActivity({
          userId: ctx.user.id,
          action: 'sms_sent',
          entityType: 'sms',
          entityId: smsId,
          description: `Sent SMS to ${input.phoneNumber}`,
        });

        return {
          id: smsId,
          success: true,
          message: 'SMS sent successfully',
          phoneNumber: input.phoneNumber,
        };
      } catch (error: any) {
        console.error('Send SMS error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send SMS',
        });
      }
    }),

  /**
   * Get SMS history
   */
  getSmsHistory: createFeatureRestrictedProcedure("communications:read")
    .input(
      z.object({
        recipientId: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        return {
          messages: [],
          total: 0,
        };
      } catch (error: any) {
        console.error('Get SMS history error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve SMS history',
        });
      }
    }),

  // ==================== CALENDAR EVENTS ====================
  /**
   * Create calendar event
   */
  createCalendarEvent: createFeatureRestrictedProcedure("communications:calendar")
    .input(createCalendarEventSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const eventId = uuidv4();

        // Handle recurring events
        const events: any[] = [
          {
            id: eventId,
            title: input.title,
            description: input.description,
            dueDate: input.dueDate,
            eventType: input.eventType,
            linkedEntityId: input.linkedEntityId,
            linkedEntityType: input.linkedEntityType,
            isRecurring: input.isRecurring,
            assignedTo: input.assignedTo || [ctx.user.id],
            createdBy: ctx.user.id,
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          },
        ];

        // If recurring, generate additional events based on frequency
        if (input.isRecurring && input.recurringInterval) {
          const startDate = new Date(input.dueDate);
          let currentDate = new Date(startDate);
          const endDate = input.recurringEndDate ? new Date(input.recurringEndDate) : null;

          while (true) {
            // Add interval to date
            switch (input.recurringInterval) {
              case 'daily':
                currentDate.setDate(currentDate.getDate() + 1);
                break;
              case 'weekly':
                currentDate.setDate(currentDate.getDate() + 7);
                break;
              case 'monthly':
                currentDate.setMonth(currentDate.getMonth() + 1);
                break;
              case 'quarterly':
                currentDate.setMonth(currentDate.getMonth() + 3);
                break;
              case 'annually':
                currentDate.setFullYear(currentDate.getFullYear() + 1);
                break;
            }

            // Check if we've exceeded the end date
            if (endDate && currentDate > endDate) break;

            // Create event for this date
            events.push({
              id: uuidv4(),
              title: input.title,
              description: input.description,
              dueDate: currentDate.toISOString().replace('T', ' ').substring(0, 19).split('T')[0],
              eventType: input.eventType,
              linkedEntityId: input.linkedEntityId,
              linkedEntityType: input.linkedEntityType,
              isRecurring: true,
              assignedTo: input.assignedTo || [ctx.user.id],
              createdBy: ctx.user.id,
              createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            });
          }
        }

        await db.logActivity({
          userId: ctx.user.id,
          action: 'calendar_event_created',
          entityType: 'calendar_event',
          entityId: eventId,
          description: `Created calendar event: ${input.title}`,
        });

        return {
          success: true,
          eventId,
          eventsCreated: events.length,
          message: `Created ${events.length} calendar event(s)`,
        };
      } catch (error: any) {
        console.error('Create calendar event error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create calendar event',
        });
      }
    }),

  /**
   * Get calendar events
   */
  getCalendarEvents: createFeatureRestrictedProcedure("communications:read")
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        eventType: z.string().optional(),
        limit: z.number().default(100),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // Fetch events for the current user from database
        return {
          events: [],
          total: 0,
        };
      } catch (error: any) {
        console.error('Get calendar events error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve calendar events',
        });
      }
    }),

  /**
   * Update calendar event
   */
  updateCalendarEvent: createFeatureRestrictedProcedure("communications:calendar")
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        dueDate: z.string().optional(),
        description: z.string().optional(),
        isCompleted: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await db.logActivity({
          userId: ctx.user.id,
          action: 'calendar_event_updated',
          entityType: 'calendar_event',
          entityId: input.id,
          description: 'Updated calendar event',
        });

        return {
          success: true,
          message: 'Calendar event updated successfully',
        };
      } catch (error: any) {
        console.error('Update calendar event error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update calendar event',
        });
      }
    }),

  /**
   * Delete calendar event
   */
  deleteCalendarEvent: createFeatureRestrictedProcedure("communications:calendar")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await db.logActivity({
          userId: ctx.user.id,
          action: 'calendar_event_deleted',
          entityType: 'calendar_event',
          entityId: input.id,
          description: 'Deleted calendar event',
        });

        return {
          success: true,
          message: 'Calendar event deleted successfully',
        };
      } catch (error: any) {
        console.error('Delete calendar event error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete calendar event',
        });
      }
    }),

  // ==================== RECURRING INVOICES ====================
  /**
   * Create recurring invoice
   */
  createRecurringInvoice: createFeatureRestrictedProcedure("communications:invoices")
    .input(createRecurringInvoiceSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const recurringId = uuidv4();

        // Create recurring invoice record
        // This will be used by a scheduled job to generate invoices

        await db.logActivity({
          userId: ctx.user.id,
          action: 'recurring_invoice_created',
          entityType: 'recurring_invoice',
          entityId: recurringId,
          description: `Created recurring invoice from base invoice: ${input.baseInvoiceId}`,
        });

        return {
          id: recurringId,
          ...input,
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          success: true,
          message: 'Recurring invoice created successfully',
        };
      } catch (error: any) {
        console.error('Create recurring invoice error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create recurring invoice',
        });
      }
    }),

  /**
   * Get recurring invoices
   */
  getRecurringInvoices: createFeatureRestrictedProcedure("communications:read")
    .input(
      z.object({
        isActive: z.boolean().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        return {
          recurringInvoices: [],
          total: 0,
        };
      } catch (error: any) {
        console.error('Get recurring invoices error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve recurring invoices',
        });
      }
    }),

  /**
   * Update recurring invoice
   */
  updateRecurringInvoice: createFeatureRestrictedProcedure("communications:invoices")
    .input(updateRecurringInvoiceSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        await db.logActivity({
          userId: ctx.user.id,
          action: 'recurring_invoice_updated',
          entityType: 'recurring_invoice',
          entityId: input.id,
          description: 'Updated recurring invoice',
        });

        return {
          success: true,
          message: 'Recurring invoice updated successfully',
        };
      } catch (error: any) {
        console.error('Update recurring invoice error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update recurring invoice',
        });
      }
    }),

  /**
   * Stop recurring invoice
   */
  stopRecurringInvoice: createFeatureRestrictedProcedure("communications:invoices")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await db.logActivity({
          userId: ctx.user.id,
          action: 'recurring_invoice_stopped',
          entityType: 'recurring_invoice',
          entityId: input.id,
          description: 'Stopped recurring invoice',
        });

        return {
          success: true,
          message: 'Recurring invoice stopped successfully',
        };
      } catch (error: any) {
        console.error('Stop recurring invoice error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to stop recurring invoice',
        });
      }
    }),

  /**
   * Get recurring invoice history (generated invoices)
   */
  getRecurringInvoiceHistory: readProcedure
    .input(
      z.object({
        recurringInvoiceId: z.string(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        return {
          invoices: [],
          total: 0,
        };
      } catch (error: any) {
        console.error('Get recurring invoice history error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve recurring invoice history',
        });
      }
    }),

  /**
   * Get communication hub dashboard data
   */
  getCommunicationsHubStatus: readProcedure.query(async ({ ctx }) => {
    try {
      return {
        unreadMessages: 0,
        upcomingEvents: 0,
        pendingRecurringInvoices: 0,
        recentCommunications: [],
      };
    } catch (error: any) {
      console.error('Get hub status error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve communications hub status',
      });
    }
  }),
});
