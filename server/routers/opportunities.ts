import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { clients, opportunities, users } from "../../drizzle/schema";
import { quotes, lineItems } from "../../drizzle/schema-extended";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { triggerEventNotification } from "./emailNotifications";

export const opportunitiesRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      console.log('[Opportunities.list] Called. User:', ctx.user?.email || 'NO USER', 'Input:', input);
      const db = await getDb();
      if (!db) return [];
      const orgId = ctx.user.organizationId;
      let query: any = db.select({ opportunity: opportunities, client: clients, assignee: users })
        .from(opportunities)
        .leftJoin(clients, eq(opportunities.clientId, clients.id))
        .leftJoin(users, eq(opportunities.assignedTo, users.id));
      if (orgId) query = query.where(eq(opportunities.organizationId, orgId));
      const rows = await query.limit(input?.limit || 50).offset(input?.offset || 0);
      return rows.map(({ opportunity: r, client, assignee }: any) => ({
        ...r,
        clientName: client?.companyName || client?.contactPerson || "",
        clientEmail: client?.email || "",
        clientPhone: client?.phone || "",
        assignedToName: assignee?.name || assignee?.email || "",
        // Back-compat aliases expected by frontend
        proposalNumber: (r as any).proposalNumber || r.id,
        amount: (r as any).value ?? (r as any).total ?? 0,
        validUntil: (r as any).expectedCloseDate || (r as any).expiryDate || null,
        status: (r as any).stage || (r as any).status,
      }));
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(opportunities.id, input), eq(opportunities.organizationId, orgId)) : eq(opportunities.id, input);
      const result = await db.select({ opportunity: opportunities, client: clients, assignee: users })
        .from(opportunities)
        .leftJoin(clients, eq(opportunities.clientId, clients.id))
        .leftJoin(users, eq(opportunities.assignedTo, users.id))
        .where(where)
        .limit(1);
      const resultRow = result[0];
      if (!resultRow) return null;
      const { opportunity: row, client, assignee } = resultRow;
      return {
        ...row,
        clientName: client?.companyName || client?.contactPerson || "",
        clientEmail: client?.email || "",
        clientPhone: client?.phone || "",
        assignedToName: assignee?.name || assignee?.email || "",
        proposalNumber: (row as any).proposalNumber || row.id,
        amount: (row as any).value ?? (row as any).total ?? 0,
        validUntil: (row as any).expectedCloseDate || (row as any).expiryDate || null,
        status: (row as any).stage || (row as any).status,
      };
    }),

  byClient: protectedProcedure
    .input(z.object({ clientId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(opportunities.clientId, input.clientId), eq(opportunities.organizationId, orgId)) : eq(opportunities.clientId, input.clientId);
      const result = await db.select().from(opportunities).where(where);
      return result;
    }),

  convertToQuote: createFeatureRestrictedProcedure("quotes:create")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const orgId = ctx.user.organizationId;
      const opportunityWhere = orgId
        ? and(eq(opportunities.id, input.id), eq(opportunities.organizationId, orgId))
        : eq(opportunities.id, input.id);
      const result = await db.select().from(opportunities).where(opportunityWhere).limit(1);
      const opportunity = result[0] as any;
      if (!opportunity) throw new Error("Opportunity not found");

      const existing = await db.select({ id: quotes.id }).from(quotes).where(
        and(
          eq(quotes.clientId, opportunity.clientId),
          eq(quotes.subject, opportunity.title || "Opportunity quote"),
          orgId ? eq(quotes.organizationId, orgId) : eq(quotes.organizationId, opportunity.organizationId)
        )
      ).limit(1);
      if (existing[0]) return { id: existing[0].id, created: false };

      const quoteId = uuidv4();
      const quoteNumber = `QT-${Date.now()}`;
      const now = new Date().toISOString().replace("T", " ").substring(0, 19);
      const value = Number(opportunity.value || 0);
      const expirationDate = opportunity.expectedCloseDate || new Date(Date.now() + 30 * 86400000).toISOString().replace("T", " ").substring(0, 19);

      await db.insert(quotes).values({
        id: quoteId,
        quoteNumber,
        clientId: opportunity.clientId,
        subject: opportunity.title || "Opportunity quote",
        description: opportunity.description || null,
        status: "draft",
        subtotal: value,
        taxAmount: 0,
        total: value,
        notes: opportunity.notes || null,
        expirationDate,
        createdBy: ctx.user.id,
        organizationId: orgId ?? opportunity.organizationId ?? null,
        createdAt: now,
        updatedAt: now,
      } as any);

      await db.insert(lineItems).values({
        id: uuidv4(),
        quoteId,
        description: opportunity.title || "Opportunity value",
        quantity: 1,
        unitPrice: value,
        taxRate: 0,
        total: value,
        createdAt: now,
      } as any);

      await db.update(opportunities).set({
        stage: "proposal",
        updatedAt: now,
      } as any).where(eq(opportunities.id, input.id));

      return { id: quoteId, quoteNumber, created: true };
    }),

  create: createFeatureRestrictedProcedure("opportunities:create")
    .input(z.object({
      // Accept frontend-friendly fields and map them to DB columns
      clientId: z.string().optional().default(""),
      name: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      amount: z.number().optional(),
      value: z.number().optional(),
      validUntil: z.string().optional(),
      stage: z.enum(["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]).optional(),
      // Accept status for frontend compatibility and map to stage
      status: z.string().optional(),
      probability: z.number().optional(),
      expectedCloseDate: z.coerce.date().optional(),
      assignedTo: z.string().optional(),
      source: z.string().optional(),
      notes: z.string().optional(),
      winReason: z.string().optional(),
      lossReason: z.string().optional(),
      actualCloseDate: z.coerce.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const id = uuidv4();
      const insertData: any = {
        ...input,
        // Support both `name` and `title` fields from different callers
        title: input.title || (input as any).name || "Untitled",
        clientId: input.clientId || "",
        // Map frontend-friendly fields to DB columns
        value: input.amount ?? input.value ?? 0,
        expectedCloseDate: input.expectedCloseDate ? input.expectedCloseDate.toISOString() : (input.validUntil || undefined),
        actualCloseDate: input.actualCloseDate ? input.actualCloseDate.toISOString() : undefined,
      };
      delete (insertData as any).name;

      if (input.status) {
        insertData.stage = input.status;
        delete insertData.status;
      }

      await db.insert(opportunities).values({
        id,
        organizationId: ctx.user.organizationId ?? null,
        ...insertData,
        createdBy: ctx.user.id,
      });

      // Email notification
      try {
        if (ctx.user.email) {
          const title = insertData.title || "Untitled";
          await triggerEventNotification({
            userId: ctx.user.id,
            eventType: "opportunity_created",
            recipientEmail: ctx.user.email,
            recipientName: ctx.user.name,
            subject: `New Opportunity: ${title}`,
            htmlContent: `<h2>New Opportunity Created</h2><p>Opportunity <strong>${title}</strong> has been created.</p>${insertData.value ? `<p><strong>Value:</strong> KES ${insertData.value.toLocaleString()}</p>` : ''}<p><a href="/opportunities/${id}">View Opportunity</a></p>`,
            entityType: "opportunity",
            entityId: id,
            actionUrl: `/opportunities/${id}`,
          });
        }
      } catch (notifError) {
        console.error("[Opportunities] Failed to send email notification:", notifError);
      }

      return { id };
    }),

  update: createFeatureRestrictedProcedure("opportunities:edit")
    .input(z.object({
      id: z.string(),
      proposalNumber: z.string().optional(),
      clientId: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      // Accept frontend-friendly fields
      amount: z.number().optional(),
      value: z.number().optional(),
      validUntil: z.string().optional(),
      // Accept frontend `status` (maps to stage)
      status: z.string().optional(),
      stage: z.enum(["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]).optional(),
      probability: z.number().optional(),
      expectedCloseDate: z.coerce.date().optional(),
      actualCloseDate: z.coerce.date().optional(),
      assignedTo: z.string().optional(),
      source: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      const existing = await db.select().from(opportunities).where(eq(opportunities.id, id)).limit(1);
      const oldStage = existing[0]?.stage;
      const updateData: any = {
        ...data,
        // Map frontend-friendly fields
        value: (data as any).amount ?? (data as any).value,
        expectedCloseDate: (data as any).expectedCloseDate ? (data as any).expectedCloseDate.toISOString() : (data as any).validUntil || undefined,
        actualCloseDate: (data as any).actualCloseDate ? (data as any).actualCloseDate.toISOString() : undefined,
      };

      if ((data as any).status !== undefined) {
        updateData.stage = (data as any).status;
        delete updateData.status;
      }

      if ((data as any).proposalNumber !== undefined) updateData.proposalNumber = (data as any).proposalNumber;

      // Remove frontend-only keys to avoid DB errors
      delete updateData.amount;
      delete updateData.validUntil;

      const orgId = ctx.user.organizationId;
      const updateWhere = orgId ? and(eq(opportunities.id, id), eq(opportunities.organizationId, orgId)) : eq(opportunities.id, id);
      await db.update(opportunities).set(updateData).where(updateWhere);

      // If stage changed, trigger workflows
      const newStage = updateData.stage;
      if (newStage && oldStage !== newStage) {
        try {
          await (await import('../workflows/triggerEngine')).workflowTriggerEngine.trigger({
            triggerType: 'opportunity_moved',
            entityType: 'opportunity',
            entityId: id,
            data: { oldStage, newStage },
            userId: ctx.user?.id,
          });
        } catch (err) {
          console.error('Workflow trigger (opportunity_moved) failed:', err);
        }
      }

      return { success: true };
    }),

  delete: createFeatureRestrictedProcedure("opportunities:delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const orgId = ctx.user.organizationId;
      const deleteWhere = orgId ? and(eq(opportunities.id, input), eq(opportunities.organizationId, orgId)) : eq(opportunities.id, input);
      await db.delete(opportunities).where(deleteWhere);
      return { success: true };
    }),

  byStage: protectedProcedure
    .input(z.object({ stage: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(opportunities.stage, input.stage as any), eq(opportunities.organizationId, orgId)) : eq(opportunities.stage, input.stage as any);
      const result = await db.select().from(opportunities).where(where);
      return result;
    }),
});

