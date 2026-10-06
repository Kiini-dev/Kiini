import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { router } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { getPool } from "../db";
import { queueEmail } from "./emailQueue";
import { renderMarketingCampaign } from "../services/emailMarketing";

const manageProcedure = createFeatureRestrictedProcedure("communications:manage");
const campaignInput = z.object({
  id: z.string().optional(),
  campaignName: z.string().trim().min(1).max(255),
  subject: z.string().trim().min(1).max(500),
  bodyHtml: z.string().min(1),
});

export const emailMarketingRouter = router({
  listCampaigns: manageProcedure.query(async ({ ctx }) => {
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [rows] = ctx.user.organizationId
      ? await pool.query("SELECT * FROM emailCampaigns WHERE organizationId = ? ORDER BY createdAt DESC", [ctx.user.organizationId])
      : await pool.query("SELECT * FROM emailCampaigns WHERE organizationId IS NULL ORDER BY createdAt DESC");
    return rows;
  }),

  saveDraft: manageProcedure.input(campaignInput).mutation(async ({ input, ctx }) => {
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const organizationId = ctx.user.organizationId || null;
    const [existing] = input.id
      ? organizationId
        ? await pool.query("SELECT id FROM emailCampaigns WHERE id = ? AND organizationId = ? AND status = 'draft'", [input.id, organizationId])
        : await pool.query("SELECT id FROM emailCampaigns WHERE id = ? AND organizationId IS NULL AND status = 'draft'", [input.id])
      : [[]];
    if (input.id && !(existing as unknown[]).length) throw new TRPCError({ code: "NOT_FOUND", message: "Editable draft campaign not found" });

    if (input.id) {
      const updateQuery = organizationId
        ? "UPDATE emailCampaigns SET campaignName = ?, subject = ?, bodyHtml = ?, bodyText = ? WHERE id = ? AND organizationId = ? AND status = 'draft'"
        : "UPDATE emailCampaigns SET campaignName = ?, subject = ?, bodyHtml = ?, bodyText = ? WHERE id = ? AND organizationId IS NULL AND status = 'draft'";
      const updateValues = [input.campaignName, input.subject, input.bodyHtml, input.bodyHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(), input.id];
      if (organizationId) {
        await pool.query(updateQuery, [...updateValues, organizationId]);
      } else {
        await pool.query(updateQuery, updateValues);
      }
      return { id: input.id, success: true };
    }

    const id = uuidv4();
    await pool.query(
      `INSERT INTO emailCampaigns (id, organizationId, campaignName, subject, bodyHtml, bodyText, fromEmail, fromName, status, createdBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?)`,
      [id, organizationId, input.campaignName, input.subject, input.bodyHtml, input.bodyHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim(), ctx.user.email || "info@kiini.africa", ctx.user.name || null, ctx.user.id],
    );
    return { id, success: true };
  }),

  sendNow: manageProcedure.input(z.object({ id: z.string(), confirm: z.literal(true) })).mutation(async ({ input, ctx }) => {
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [campaignRows] = ctx.user.organizationId
      ? await pool.query("SELECT * FROM emailCampaigns WHERE id = ? AND organizationId = ? AND status = 'draft' LIMIT 1", [input.id, ctx.user.organizationId])
      : await pool.query("SELECT * FROM emailCampaigns WHERE id = ? AND organizationId IS NULL AND status = 'draft' LIMIT 1", [input.id]);
    const campaign = (campaignRows as any[])[0];
    if (!campaign) throw new TRPCError({ code: "NOT_FOUND", message: "Draft campaign not found" });

    const [marketingSettings] = campaign.organizationId
      ? await pool.query("SELECT value FROM organizationSettings WHERE organizationId = ? AND category = 'emarketing_general' AND `key` = 'enabled' LIMIT 1", [campaign.organizationId])
      : await pool.query("SELECT value FROM settings WHERE category = 'emarketing_general' AND `key` = 'enabled' LIMIT 1");
    if (String((marketingSettings as Array<{ value?: string }>)[0]?.value || "").toLowerCase() !== "true") {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Enable email marketing in settings before sending a campaign" });
    }

    const orgFilter = campaign.organizationId ? "s.organizationId = ?" : "s.organizationId IS NULL";
    const parameters = campaign.organizationId ? [campaign.organizationId] : [];
    const [recipients] = await pool.query(
      `SELECT s.email, s.name, s.unsubscribeToken
       FROM emailMarketingSubscribers s
       WHERE ${orgFilter} AND s.optedIn = 1 AND s.unsubscribedAt IS NULL
         AND NOT EXISTS (SELECT 1 FROM emailUnsubscribes u WHERE LOWER(u.email) = LOWER(s.email))
       ORDER BY s.email`,
      parameters,
    );
    const eligible = recipients as Array<{ email: string; name: string | null; unsubscribeToken: string }>;
    if (!eligible.length) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "No opted-in, non-unsubscribed subscribers are eligible for this campaign" });

    const baseUrl = (process.env.PUBLIC_APP_URL || process.env.APP_URL || "https://kiini.africa").replace(/\/+$/, "");
    let companyName = "Kiini";
    if (campaign.organizationId) {
      const [organizationRows] = await pool.query("SELECT name FROM organizations WHERE id = ? LIMIT 1", [campaign.organizationId]);
      companyName = (organizationRows as Array<{ name: string }>)[0]?.name || companyName;
    }
    const [claimResult] = await pool.query(
      "UPDATE emailCampaigns SET status = 'sending', recipientCount = ?, sentCount = 0, failureCount = 0, startedAt = CURRENT_TIMESTAMP WHERE id = ? AND status = 'draft'",
      [eligible.length, campaign.id],
    );
    if (!(claimResult as any).affectedRows) throw new TRPCError({ code: "CONFLICT", message: "This campaign is already being sent or is no longer a draft" });

    let queued = 0;
    let failed = 0;
    try {
      for (const recipient of eligible) {
        const rendered = renderMarketingCampaign(campaign.bodyHtml, campaign.campaignName, recipient, baseUrl, companyName);
        const logId = uuidv4();
        await pool.query(
          `INSERT INTO emailLogs (id, campaignId, recipientEmail, userId, subject, status, provider)
           VALUES (?, ?, ?, ?, ?, 'pending', 'smtp')`,
          [logId, campaign.id, recipient.email, ctx.user.id, campaign.subject],
        );
        const result = await queueEmail({
          recipientEmail: recipient.email,
          recipientName: recipient.name || undefined,
          subject: campaign.subject,
          htmlContent: rendered,
          eventType: "marketing_campaign",
          entityType: "email_campaign",
          entityId: campaign.id,
          userId: ctx.user.id,
          organizationId: campaign.organizationId || undefined,
        });
        if (result.success) {
          await pool.query("UPDATE emailLogs SET metadata = ? WHERE id = ?", [JSON.stringify({ queueId: result.queueId }), logId]);
        } else {
          await pool.query("UPDATE emailLogs SET status = 'failed', failureReason = ? WHERE id = ?", [result.error || "Email queue failed", logId]);
        }
        if (result.success) queued++;
        else failed++;
      }
    } catch (error) {
      await pool.query("UPDATE emailCampaigns SET status = 'failed', failureCount = ?, completedAt = CURRENT_TIMESTAMP WHERE id = ?", [failed + 1, campaign.id]);
      throw error;
    }
    if (queued === 0) {
      await pool.query("UPDATE emailCampaigns SET status = 'failed', failureCount = ?, completedAt = CURRENT_TIMESTAMP WHERE id = ?", [failed, campaign.id]);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No campaign messages could be queued" });
    }
    if (failed) await pool.query("UPDATE emailCampaigns SET failureCount = ? WHERE id = ?", [failed, campaign.id]);
    return { success: true, recipients: eligible.length, queued, failed };
  }),

  listSubscribers: manageProcedure.query(async ({ ctx }) => {
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [rows] = ctx.user.organizationId
      ? await pool.query("SELECT id, email, name, optedIn, consentAt, consentSource, unsubscribedAt, createdAt FROM emailMarketingSubscribers WHERE organizationId = ? ORDER BY email", [ctx.user.organizationId])
      : await pool.query("SELECT id, email, name, optedIn, consentAt, consentSource, unsubscribedAt, createdAt FROM emailMarketingSubscribers WHERE organizationId IS NULL ORDER BY email");
    return rows;
  }),

  addSubscriber: manageProcedure.input(z.object({
    email: z.string().email().max(320),
    name: z.string().trim().max(255).optional(),
    consentConfirmed: z.literal(true),
  })).mutation(async ({ input, ctx }) => {
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    if (!ctx.user.organizationId) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "An organization is required to manage subscribers" });
    const email = input.email.trim().toLowerCase();
    await pool.query(
        `INSERT INTO emailMarketingSubscribers (id, organizationId, email, name, optedIn, consentAt, consentSource, unsubscribeToken)
         VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name), optedIn = 1, consentAt = CURRENT_TIMESTAMP,
           consentSource = VALUES(consentSource), unsubscribeToken = VALUES(unsubscribeToken), unsubscribedAt = NULL`,
        [uuidv4(), ctx.user.organizationId, email, input.name?.trim() || null, `Opt-in confirmed by ${ctx.user.email || ctx.user.id}`, uuidv4()],
      );
    await pool.query("DELETE FROM emailUnsubscribes WHERE LOWER(email) = LOWER(?)", [email]);
    return { success: true };
  }),

  removeSubscriber: manageProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [result] = ctx.user.organizationId
      ? await pool.query("UPDATE emailMarketingSubscribers SET optedIn = 0, unsubscribedAt = CURRENT_TIMESTAMP WHERE id = ? AND organizationId = ?", [input.id, ctx.user.organizationId])
      : await pool.query("UPDATE emailMarketingSubscribers SET optedIn = 0, unsubscribedAt = CURRENT_TIMESTAMP WHERE id = ? AND organizationId IS NULL", [input.id]);
    if (!(result as any).affectedRows) throw new TRPCError({ code: "NOT_FOUND", message: "Subscriber not found" });
    return { success: true };
  }),
});
