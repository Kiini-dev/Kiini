import { router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { v4 as uuidv4 } from "uuid";
import { getDb, getNextDocumentNumber } from "../db";
import { contracts } from "../../drizzle/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { scheduleDocumentAutomation } from "../services/jobScheduler";
import { renderContractTemplate } from "../utils/template-renderer";
import { createSignatureWorkflow } from "../services/signatureWorkflow";
import { getOrCreateSignedDocumentPdf } from "../services/documentPdf";

// Permission-restricted procedures
const viewProcedure = createFeatureRestrictedProcedure("contracts:view");
const createProcedure = createFeatureRestrictedProcedure("contracts:create");
const editProcedure = createFeatureRestrictedProcedure("contracts:edit");
const deleteProcedure = createFeatureRestrictedProcedure("contracts:delete");

export const contractsRouter = router({
  render: viewProcedure
    .input(z.object({ id: z.string(), templateId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const rendered = await renderContractTemplate(input.id, ctx.user.organizationId, input.templateId);
      if (!rendered) throw new TRPCError({ code: "NOT_FOUND", message: "Contract template or contract not found" });
      return rendered;
    }),

  list: viewProcedure
    .input(z.object({ 
      limit: z.number().optional(), 
      offset: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const orgId = ctx.user.organizationId;
        const statusFilter = input?.status ? eq(contracts.status, input.status as any) : undefined;
        const where = orgId && statusFilter ? and(eq(contracts.organizationId, orgId), statusFilter) : orgId ? eq(contracts.organizationId, orgId) : statusFilter;
        const limit = input?.limit || 50;
        const offset = input?.offset || 0;

        const [rows, countResult] = await Promise.all([
          db.select().from(contracts).where(where).orderBy(desc(contracts.createdAt)).limit(limit).offset(offset),
          db.select({ count: sql<number>`count(*)` }).from(contracts).where(where),
        ]);

        return {
          data: rows,
          total: countResult[0]?.count ?? 0,
        };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch contracts" });
      }
    }),

  getById: viewProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const orgId = ctx.user.organizationId;
        const where = orgId ? and(eq(contracts.id, input), eq(contracts.organizationId, orgId)) : eq(contracts.id, input);
        const rows = await db.select().from(contracts).where(where);
        if (!rows.length) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
        }
        return rows[0];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch contract" });
      }
    }),

  downloadSignedPdf: viewProcedure
    .input(z.string().min(1))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const organizationId = ctx.user.organizationId ?? null;
      const ownerFilter = organizationId
        ? and(eq(contracts.id, input), eq(contracts.organizationId, organizationId))
        : and(eq(contracts.id, input), sql`${contracts.organizationId} IS NULL`);
      const rows = await db.select({
        id: contracts.id,
        contractNumber: contracts.contractNumber,
        signingStatus: contracts.signingStatus,
        signingWorkflowId: contracts.signingWorkflowId,
        signedDocumentHtml: contracts.signedDocumentHtml,
        signedDocumentHash: contracts.signedDocumentHash,
      }).from(contracts).where(ownerFilter).limit(1);
      const contract = rows[0];
      if (!contract) throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      if (contract.signingStatus !== "signed" || !contract.signingWorkflowId || !contract.signedDocumentHtml || !contract.signedDocumentHash) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "The contract has not been fully signed" });
      }
      const pdf = await getOrCreateSignedDocumentPdf({
        organizationId,
        workflowId: contract.signingWorkflowId,
        documentType: "contract",
        documentId: contract.id,
        documentHash: contract.signedDocumentHash,
        signedHtml: contract.signedDocumentHtml,
      });
      const filename = (contract.contractNumber || contract.id).replace(/[^a-zA-Z0-9_-]+/g, "_");
      return { filename: `${filename}-signed.pdf`, pdfBase64: pdf.toString("base64") };
    }),

  create: createProcedure
    .input(z.object({
      name: z.string().min(1),
      vendor: z.string().min(1),
      startDate: z.string(),
      endDate: z.string(),
      value: z.number().positive(),
      status: z.enum(["draft", "active", "expired"]).default("draft"),
      contractType: z.string().optional(),
      description: z.string().optional(),
      notes: z.string().optional(),
      counterpartyContactName: z.string().max(255).optional(),
      counterpartyEmail: z.string().email().optional(),
      counterpartyAddress: z.string().optional(),
      counterpartyRegistrationNumber: z.string().max(100).optional(),
      governingLaw: z.string().max(100).default("Kenya"),
      currency: z.string().length(3).default("KES"),
      paymentTerms: z.string().optional(),
      terminationTerms: z.string().optional(),
      confidentialityTerms: z.string().optional(),
      disputeResolution: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const id = uuidv4();
        const contractNumber = await getNextDocumentNumber('contract');
        const organizationId = ctx.user.organizationId || null;
        const record = {
          id,
          contractNumber,
          name: input.name,
          vendor: input.vendor,
          startDate: input.startDate,
          endDate: input.endDate,
          value: Math.round(input.value * 100),
          status: input.status,
          contractType: input.contractType ?? null,
          description: input.description ?? null,
          notes: input.notes ?? null,
          counterpartyContactName: input.counterpartyContactName ?? null,
          counterpartyEmail: input.counterpartyEmail?.toLowerCase() ?? null,
          counterpartyAddress: input.counterpartyAddress ?? null,
          counterpartyRegistrationNumber: input.counterpartyRegistrationNumber ?? null,
          governingLaw: input.governingLaw,
          currency: input.currency.toUpperCase(),
          paymentTerms: input.paymentTerms ?? null,
          terminationTerms: input.terminationTerms ?? null,
          confidentialityTerms: input.confidentialityTerms ?? null,
          disputeResolution: input.disputeResolution ?? null,
          createdBy: ctx.user.id,
          organizationId,
        };
        await db.insert(contracts).values(record);
        await scheduleDocumentAutomation({
          documentType: "contract",
          documentId: id,
          organizationId,
          createdBy: ctx.user.id,
        }).catch((error) => console.error("Failed to schedule contract automation:", error));
        const rows = await db.select().from(contracts).where(eq(contracts.id, id));
        return rows[0];
      } catch (error) {
        console.error("[Contracts Create Error]", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create contract: ${error instanceof Error ? error.message : String(error)}`,
          cause: error,
        });
      }
    }),

  update: editProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      vendor: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      value: z.number().positive().optional(),
      status: z.enum(["draft", "active", "expired"]).optional(),
      contractType: z.string().optional(),
      description: z.string().optional(),
      notes: z.string().optional(),
      counterpartyContactName: z.string().max(255).optional(),
      counterpartyEmail: z.string().email().optional(),
      counterpartyAddress: z.string().optional(),
      counterpartyRegistrationNumber: z.string().max(100).optional(),
      governingLaw: z.string().max(100).optional(),
      currency: z.string().length(3).optional(),
      paymentTerms: z.string().optional(),
      terminationTerms: z.string().optional(),
      confidentialityTerms: z.string().optional(),
      disputeResolution: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const orgId = ctx.user.organizationId;
        const ownerCheck = orgId ? and(eq(contracts.id, input.id), eq(contracts.organizationId, orgId)) : eq(contracts.id, input.id);
        const existing = await db.select().from(contracts).where(ownerCheck);
        if (!existing.length) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
        }
        if (existing[0].signingStatus && existing[0].signingStatus !== "not_sent") {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A contract in a signing workflow cannot be edited" });
        }
        if (existing[0].status === "terminated") {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A terminated contract cannot be edited" });
        }

        const { id, ...updates } = input;
        const setValues: Record<string, any> = {};
        if (updates.name !== undefined) setValues.name = updates.name;
        if (updates.vendor !== undefined) setValues.vendor = updates.vendor;
        if (updates.startDate !== undefined) setValues.startDate = updates.startDate;
        if (updates.endDate !== undefined) setValues.endDate = updates.endDate;
        if (updates.value !== undefined) setValues.value = Math.round(updates.value * 100);
        if (updates.status !== undefined) setValues.status = updates.status;
        if (updates.contractType !== undefined) setValues.contractType = updates.contractType;
        if (updates.description !== undefined) setValues.description = updates.description;
        if (updates.notes !== undefined) setValues.notes = updates.notes;
        if (updates.counterpartyContactName !== undefined) setValues.counterpartyContactName = updates.counterpartyContactName;
        if (updates.counterpartyEmail !== undefined) setValues.counterpartyEmail = updates.counterpartyEmail.toLowerCase();
        if (updates.counterpartyAddress !== undefined) setValues.counterpartyAddress = updates.counterpartyAddress;
        if (updates.counterpartyRegistrationNumber !== undefined) setValues.counterpartyRegistrationNumber = updates.counterpartyRegistrationNumber;
        if (updates.governingLaw !== undefined) setValues.governingLaw = updates.governingLaw;
        if (updates.currency !== undefined) setValues.currency = updates.currency.toUpperCase();
        if (updates.paymentTerms !== undefined) setValues.paymentTerms = updates.paymentTerms;
        if (updates.terminationTerms !== undefined) setValues.terminationTerms = updates.terminationTerms;
        if (updates.confidentialityTerms !== undefined) setValues.confidentialityTerms = updates.confidentialityTerms;
        if (updates.disputeResolution !== undefined) setValues.disputeResolution = updates.disputeResolution;

        if (Object.keys(setValues).length > 0) {
          await db.update(contracts).set(setValues).where(eq(contracts.id, id));
        }

        const rows = await db.select().from(contracts).where(eq(contracts.id, id));
        return rows[0];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update contract" });
      }
    }),

  sendForSignature: editProcedure
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
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const orgId = ctx.user.organizationId;
      const ownerCheck = orgId
        ? and(eq(contracts.id, input.id), eq(contracts.organizationId, orgId))
        : and(eq(contracts.id, input.id), sql`${contracts.organizationId} IS NULL`);
      const rows = await db.select().from(contracts).where(ownerCheck).limit(1);
      const contract = rows[0];
      if (!contract) throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      if (contract.status === "terminated") {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A terminated contract cannot be sent for signature" });
      }
      if (contract.signingStatus && contract.signingStatus !== "not_sent") {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "This contract already has a signing workflow" });
      }
      const rendered = await renderContractTemplate(contract.id, orgId, input.templateId);
      if (!rendered?.html) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A contract template could not be rendered. Add a contract template before requesting signatures." });
      }
      const workflow = await createSignatureWorkflow(db, {
        organizationId: orgId ?? null,
        createdBy: ctx.user.id,
        senderName: ctx.user.name || ctx.user.email || "A Kiini user",
        title: contract.name,
        documentType: "contract",
        documentId: contract.id,
        documentHtml: rendered.html,
        signers: input.signers,
      });
      await db.update(contracts).set({
        signingStatus: "pending_signature",
        signingWorkflowId: workflow.workflowId,
      }).where(ownerCheck);
      return { workflowId: workflow.workflowId, signerCount: workflow.requestIds.length };
    }),

  terminate: editProcedure
    .input(z.object({
      id: z.string().min(1),
      effectiveDate: z.string().date(),
      reason: z.string().trim().min(1).max(5000),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const organizationId = ctx.user.organizationId ?? null;
      const ownerCheck = organizationId
        ? and(eq(contracts.id, input.id), eq(contracts.organizationId, organizationId))
        : and(eq(contracts.id, input.id), sql`${contracts.organizationId} IS NULL`);
      const rows = await db.select().from(contracts).where(ownerCheck).limit(1);
      const contract = rows[0];
      if (!contract) throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
      if (contract.status !== "active") {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Only active contracts can be terminated" });
      }
      if (contract.signingStatus && !["not_sent", "signed"].includes(contract.signingStatus)) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A contract with signatures still pending cannot be terminated" });
      }

      await db.update(contracts).set({
        status: "terminated",
        terminatedAt: new Date(`${input.effectiveDate}T00:00:00.000Z`).toISOString(),
        terminationReason: input.reason.trim(),
        terminatedBy: ctx.user.id,
      }).where(ownerCheck);
      return { success: true };
    }),

  delete: deleteProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const orgId = ctx.user.organizationId;
        const where = orgId ? and(eq(contracts.id, input), eq(contracts.organizationId, orgId)) : eq(contracts.id, input);
        const existing = await db.select().from(contracts).where(where);
        if (!existing.length) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found" });
        }
        if (existing[0].signingStatus && existing[0].signingStatus !== "not_sent") {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A contract in a signing workflow cannot be deleted" });
        }
        if (existing[0].status === "terminated") {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A terminated contract cannot be deleted because its termination record is part of the audit history" });
        }
        await db.delete(contracts).where(where);
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete contract" });
      }
    }),
});
