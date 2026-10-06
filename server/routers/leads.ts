import { router, protectedProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { getDb } from "../db";
import { eq, and, desc } from "drizzle-orm";
import { leads } from "../../drizzle/schema-extended";
import { v4 as uuidv4 } from "uuid";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

/**
 * Leads Management Router
 * Handles sales leads and pipeline management
 * Africa-focused with multi-currency and channel tracking
 */

const viewProcedure = createFeatureRestrictedProcedure("sales:leads:view");
const createProcedure = createFeatureRestrictedProcedure("sales:leads:create");
const updateProcedure = createFeatureRestrictedProcedure("sales:leads:update");

export const leadsRouter = router({
  list: viewProcedure
    .input(z.object({
      limit: z.number().optional(),
      offset: z.number().optional(),
      status: z.string().optional(),
      source: z.string().optional(),
      assignedTo: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const orgId = ctx.user.organizationId;
        const conditions = [];
        
        if (orgId) conditions.push(eq(leads.organizationId, orgId));
        if (input?.status) conditions.push(eq(leads.status, input.status as any));
        if (input?.source) conditions.push(eq(leads.source, input.source as any));
        if (input?.assignedTo) conditions.push(eq(leads.assignedTo, input.assignedTo));

        const where = conditions.length > 0 ? and(...conditions) : undefined;

        return await db.select().from(leads)
          .where(where)
          .orderBy(desc(leads.createdAt))
          .limit(input?.limit || 50)
          .offset(input?.offset || 0);
      } catch (error) {
        console.error("Error listing leads:", error);
        return [];
      }
    }),

  getById: viewProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return null;

        const orgId = ctx.user.organizationId;
        const where = orgId
          ? and(eq(leads.id, input), eq(leads.organizationId, orgId))
          : eq(leads.id, input);

        const result = await db.select().from(leads).where(where).limit(1);
        return result[0] || null;
      } catch (error) {
        console.error("Error fetching lead:", error);
        return null;
      }
    }),

  create: createProcedure
    .input(z.object({
      companyName: z.string(),
      contactName: z.string(),
      email: z.string().email(),
      phone: z.string(),
      source: z.enum(["website", "referral", "social_media", "cold_outreach", "event", "trade_show", "other"]),
      estimatedValue: z.number().optional(),
      currency: z.string().default("KES"),
      status: z.enum(["new", "contacted", "qualified", "proposal_sent", "negotiating", "closed_won", "closed_lost"]).default("new"),
      country: z.string().default("KE"),
      industry: z.string().optional(),
      assignedTo: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      try {
        const id = uuidv4();
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const leadNo = `LEAD-${new Date().getFullYear()}-${String(Math.random() * 100000).padStart(6, '0')}`;

        await database.insert(leads).values({
          id,
          organizationId: ctx.user.organizationId ?? null,
          leadNo,
          companyName: input.companyName,
          contactName: input.contactName,
          email: input.email,
          phone: input.phone,
          source: input.source,
          estimatedValue: input.estimatedValue || 0,
          currency: input.currency,
          country: input.country,
          industry: input.industry || null,
          status: input.status,
          assignedTo: input.assignedTo || null,
          notes: input.notes || null,
          createdBy: ctx.user.id,
          createdAt: now,
          updatedAt: now,
        });

        await db.logActivity({
          userId: ctx.user.id,
          action: "lead_created",
          entityType: "lead",
          entityId: id,
          description: `New lead created: ${input.companyName} (${input.contactName}) from ${input.source}`,
        });

        return { id, leadNo };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create lead: ${error.message}`,
        });
      }
    }),

  update: updateProcedure
    .input(z.object({
      id: z.string(),
      status: z.string().optional(),
      estimatedValue: z.number().optional(),
      assignedTo: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      try {
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        
        const updates: any = { updatedAt: now };
        if (input.status) updates.status = input.status;
        if (input.estimatedValue !== undefined) updates.estimatedValue = input.estimatedValue;
        if (input.assignedTo) updates.assignedTo = input.assignedTo;
        if (input.notes) updates.notes = input.notes;

        await database.update(leads).set(updates).where(eq(leads.id, input.id));

        await db.logActivity({
          userId: ctx.user.id,
          action: "lead_updated",
          entityType: "lead",
          entityId: input.id,
          description: `Lead updated: ${JSON.stringify(input)}`,
        });

        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update lead: ${error.message}`,
        });
      }
    }),

  // Convert lead to opportunity/client
  convertToOpportunity: updateProcedure
    .input(z.string())
    .mutation(async ({ input: leadId, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      try {
        const result = await (database.select().from(leads).where(eq(leads.id, leadId)) as any).limit(1);
        if (!result.length) throw new Error("Lead not found");

        const lead = result[0];
        const opportunityId = uuidv4();
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

        // Create opportunity from lead
        await database.insert("opportunities" as any).values({
          id: opportunityId,
          organizationId: ctx.user.organizationId ?? null,
          leadId,
          clientName: lead.companyName,
          value: lead.estimatedValue || 0,
          currency: lead.currency,
          stage: "qualified",
          probability: 0.25,
          createdBy: ctx.user.id,
          createdAt: now,
        });

        // Update lead status
        await database.update(leads).set({
          status: "qualified",
          updatedAt: now,
        }).where(eq(leads.id, leadId));

        await db.logActivity({
          userId: ctx.user.id,
          action: "lead_converted",
          entityType: "lead",
          entityId: leadId,
          description: `Lead ${lead.leadNo} converted to opportunity ${opportunityId}`,
        });

        return { success: true, opportunityId };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to convert lead: ${error.message}`,
        });
      }
    }),
});
