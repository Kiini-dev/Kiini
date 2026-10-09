import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { proposals } from "../../drizzle/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { generateNextDocumentNumber } from "../utils/document-numbering";
import { scheduleDocumentAutomation } from "../services/jobScheduler";
import { renderProposalTemplate } from "../utils/template-renderer";
import { createSignatureWorkflow } from "../services/signatureWorkflow";
import { getOrCreateSignedDocumentPdf } from "../services/documentPdf";

async function generateNextProposalNumber(db: any): Promise<string> {
  return generateNextDocumentNumber(db, "proposal");
}

const createProcedure = createFeatureRestrictedProcedure("proposals:create");
const readProcedure = createFeatureRestrictedProcedure("proposals:read");
const updateProcedure = createFeatureRestrictedProcedure("proposals:update");
const deleteProcedure = createFeatureRestrictedProcedure("proposals:delete");

export const proposalsRouter = router({
  render: readProcedure
    .input(z.object({ id: z.string(), templateId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const rendered = await renderProposalTemplate(input.id, ctx.user.organizationId, input.templateId);
      if (!rendered) throw new Error("Proposal template or proposal not found");
      return rendered;
    }),

  list: readProcedure
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const ownerFilter = ctx.user.organizationId
        ? eq(proposals.organizationId, ctx.user.organizationId)
        : isNull(proposals.organizationId);
      return await db
        .select()
        .from(proposals)
        .where(ownerFilter)
        .orderBy(desc(proposals.createdAt))
        .limit(input?.limit || 50)
        .offset(input?.offset || 0);
    }),

  getById: readProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const ownerFilter = ctx.user.organizationId
        ? eq(proposals.organizationId, ctx.user.organizationId)
        : isNull(proposals.organizationId);
      const result = await db.select().from(proposals)
        .where(and(eq(proposals.id, input), ownerFilter)).limit(1);
      return result[0] || null;
    }),

  downloadSignedPdf: readProcedure
    .input(z.string().min(1))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const organizationId = ctx.user.organizationId ?? null;
      const ownerFilter = organizationId
        ? eq(proposals.organizationId, organizationId)
        : isNull(proposals.organizationId);
      const rows = await db.select({
        id: proposals.id,
        proposalNumber: proposals.proposalNumber,
        signingStatus: proposals.signingStatus,
        signingWorkflowId: proposals.signingWorkflowId,
        signedDocumentHtml: proposals.signedDocumentHtml,
        signedDocumentHash: proposals.signedDocumentHash,
      }).from(proposals)
        .where(and(eq(proposals.id, input), ownerFilter))
        .limit(1);
      const proposal = rows[0];
      if (!proposal) throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found" });
      if (proposal.signingStatus !== "signed" || !proposal.signingWorkflowId || !proposal.signedDocumentHtml || !proposal.signedDocumentHash) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "The proposal has not been fully signed" });
      }
      const pdf = await getOrCreateSignedDocumentPdf({
        organizationId,
        workflowId: proposal.signingWorkflowId,
        documentType: "proposal",
        documentId: proposal.id,
        documentHash: proposal.signedDocumentHash,
        signedHtml: proposal.signedDocumentHtml,
      });
      const filename = proposal.proposalNumber.replace(/[^a-zA-Z0-9_-]+/g, "_");
      return { filename: `${filename}-signed.pdf`, pdfBase64: pdf.toString("base64") };
    }),

  getNextProposalNumber: readProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const nextNumber = await generateNextProposalNumber(db);
      return { proposalNumber: nextNumber };
    }),

  create: createProcedure
    .input(z.object({
      clientId: z.string(),
      title: z.string().optional(),
      status: z.enum(['draft', 'sent', 'accepted', 'rejected']).optional(),
      issueDate: z.string(),
      expiryDate: z.string().optional(),
      description: z.string().optional(),
      deliverables: z.string().optional(),
      timeline: z.string().optional(),
      assumptions: z.string().optional(),
      exclusions: z.string().optional(),
      terms: z.string().optional(),
      currency: z.string().length(3).default("KES"),
      lineItems: z.array(z.object({
        description: z.string().min(1).max(500),
        quantity: z.number().positive(),
        unitPrice: z.number().nonnegative(),
      })).max(100).default([]),
      subtotal: z.number(),
      taxAmount: z.number().optional(),
      discountAmount: z.number().optional(),
      total: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const id = uuidv4();
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const proposalNumber = await generateNextProposalNumber(db);

      await db.insert(proposals).values({
        id,
        proposalNumber,
        organizationId: ctx.user.organizationId ?? null,
        clientId: input.clientId,
        title: input.title || null,
        status: input.status || 'draft',
        issueDate: new Date(input.issueDate).toISOString().replace('T', ' ').substring(0, 19),
        expiryDate: input.expiryDate ? new Date(input.expiryDate).toISOString().replace('T', ' ').substring(0, 19) : null,
        description: input.description ?? null,
        deliverables: input.deliverables ?? null,
        timeline: input.timeline ?? null,
        assumptions: input.assumptions ?? null,
        exclusions: input.exclusions ?? null,
        terms: input.terms ?? null,
        currency: input.currency.toUpperCase(),
        lineItems: input.lineItems.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: Math.round(item.unitPrice * 100),
          total: Math.round(item.quantity * item.unitPrice * 100),
        })),
        subtotal: input.subtotal,
        taxAmount: input.taxAmount || 0,
        discountAmount: input.discountAmount || 0,
        total: input.total,
        notes: input.notes || null,
        createdBy: ctx.user.id,
        createdAt: now,
        updatedAt: now,
      });
      await scheduleDocumentAutomation({ documentType: "proposal", documentId: id, organizationId: ctx.user.organizationId, createdBy: ctx.user.id, createdAt: now }).catch((error) => console.error("Failed to schedule proposal automation:", error));

      return { id, proposalNumber };
    }),

  update: updateProcedure
    .input(z.object({
      id: z.string(),
      clientId: z.string().optional(),
      title: z.string().optional(),
      status: z.enum(['draft', 'sent', 'accepted', 'rejected']).optional(),
      issueDate: z.string().optional(),
      expiryDate: z.string().optional(),
      description: z.string().optional(),
      deliverables: z.string().optional(),
      timeline: z.string().optional(),
      assumptions: z.string().optional(),
      exclusions: z.string().optional(),
      terms: z.string().optional(),
      currency: z.string().length(3).optional(),
      lineItems: z.array(z.object({
        description: z.string().min(1).max(500),
        quantity: z.number().positive(),
        unitPrice: z.number().nonnegative(),
      })).max(100).optional(),
      subtotal: z.number().optional(),
      taxAmount: z.number().optional(),
      discountAmount: z.number().optional(),
      total: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const ownerFilter = ctx.user.organizationId
        ? eq(proposals.organizationId, ctx.user.organizationId)
        : isNull(proposals.organizationId);
      const existing = await db.select().from(proposals)
        .where(and(eq(proposals.id, input.id), ownerFilter)).limit(1);
      if (!existing[0]) throw new Error("Proposal not found");
      if (existing[0].signingStatus && existing[0].signingStatus !== "not_sent") {
        throw new Error("A proposal in a signing workflow cannot be edited");
      }
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) };

      if (data.clientId !== undefined) updateData.clientId = data.clientId;
      if (data.title !== undefined) updateData.title = data.title;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.issueDate !== undefined) updateData.issueDate = new Date(data.issueDate).toISOString().replace('T', ' ').substring(0, 19);
      if (data.expiryDate !== undefined) updateData.expiryDate = data.expiryDate ? new Date(data.expiryDate).toISOString().replace('T', ' ').substring(0, 19) : null;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.deliverables !== undefined) updateData.deliverables = data.deliverables;
      if (data.timeline !== undefined) updateData.timeline = data.timeline;
      if (data.assumptions !== undefined) updateData.assumptions = data.assumptions;
      if (data.exclusions !== undefined) updateData.exclusions = data.exclusions;
      if (data.terms !== undefined) updateData.terms = data.terms;
      if (data.currency !== undefined) updateData.currency = data.currency.toUpperCase();
      if (data.lineItems !== undefined) updateData.lineItems = data.lineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: Math.round(item.unitPrice * 100),
        total: Math.round(item.quantity * item.unitPrice * 100),
      }));
      if (data.subtotal !== undefined) updateData.subtotal = data.subtotal;
      if (data.taxAmount !== undefined) updateData.taxAmount = data.taxAmount;
      if (data.discountAmount !== undefined) updateData.discountAmount = data.discountAmount;
      if (data.total !== undefined) updateData.total = data.total;
      if (data.notes !== undefined) updateData.notes = data.notes;

      await db.update(proposals).set(updateData).where(and(eq(proposals.id, id), ownerFilter));
      return { id };
    }),

  sendForSignature: updateProcedure
    .input(z.object({
      id: z.string().min(1),
      templateId: z.string().optional(),
      signers: z.array(z.object({
        name: z.string().min(1).max(255),
        email: z.string().email(),
      })).min(1).max(10),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const ownerFilter = ctx.user.organizationId
        ? eq(proposals.organizationId, ctx.user.organizationId)
        : isNull(proposals.organizationId);
      const rows = await db.select().from(proposals)
        .where(and(eq(proposals.id, input.id), ownerFilter)).limit(1);
      const proposal = rows[0];
      if (!proposal) throw new Error("Proposal not found");
      if (proposal.signingStatus && proposal.signingStatus !== "not_sent") {
        throw new Error("This proposal already has a signing workflow");
      }
      const rendered = await renderProposalTemplate(proposal.id, ctx.user.organizationId, input.templateId);
      if (!rendered?.html) {
        throw new Error("A proposal template could not be rendered. Add a proposal template before requesting signatures.");
      }
      const workflow = await createSignatureWorkflow(db, {
        organizationId: ctx.user.organizationId ?? null,
        createdBy: ctx.user.id,
        senderName: ctx.user.name || ctx.user.email || "A Kiini user",
        title: proposal.title || proposal.proposalNumber,
        documentType: "proposal",
        documentId: proposal.id,
        documentHtml: rendered.html,
        signers: input.signers,
      });
      await db.update(proposals).set({
        signingStatus: "pending_signature",
        signingWorkflowId: workflow.workflowId,
        status: "sent",
      }).where(and(eq(proposals.id, proposal.id), ownerFilter));
      await scheduleDocumentAutomation({
        documentType: "proposal",
        documentId: proposal.id,
        organizationId: ctx.user.organizationId,
        createdBy: ctx.user.id,
        createdAt: proposal.createdAt || undefined,
      }).catch((error) => console.error("Failed to schedule proposal automation:", error));
      return { workflowId: workflow.workflowId, signerCount: workflow.requestIds.length };
    }),

  delete: deleteProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const ownerFilter = ctx.user.organizationId
        ? eq(proposals.organizationId, ctx.user.organizationId)
        : isNull(proposals.organizationId);
      const existing = await db.select().from(proposals)
        .where(and(eq(proposals.id, input), ownerFilter)).limit(1);
      if (!existing[0]) throw new Error("Proposal not found");
      if (existing[0].signingStatus && existing[0].signingStatus !== "not_sent") {
        throw new Error("A proposal in a signing workflow cannot be deleted");
      }
      await db.delete(proposals).where(and(eq(proposals.id, input), ownerFilter));
      return { success: true };
    }),
});
