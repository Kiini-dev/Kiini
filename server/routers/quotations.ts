import { router } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { scheduleDocumentAutomation } from "../services/jobScheduler";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db";
import { quotations } from "../../drizzle/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { generateNextDocumentNumber } from "../utils/document-numbering";

const viewProcedure = createFeatureRestrictedProcedure("quotations:view");
const createProcedure = createFeatureRestrictedProcedure("quotations:create");
const editProcedure = createFeatureRestrictedProcedure("quotations:edit");
const deleteProcedure = createFeatureRestrictedProcedure("quotations:delete");

const quotationFields = {
  rfqNo: z.string().max(50).optional(),
  supplier: z.string().max(200).optional(),
  description: z.string().optional(),
  amount: z.number().nonnegative().optional(),
  dueDate: z.string().optional(),
  buyerCompanyName: z.string().max(200).optional(),
  buyerDepartment: z.string().max(200).optional(),
  buyerContactName: z.string().max(255).optional(),
  buyerContactTitle: z.string().max(150).optional(),
  buyerEmail: z.string().email().optional().or(z.literal("")),
  buyerPhone: z.string().max(50).optional(),
  deliveryAddress: z.string().optional(),
  issueDate: z.string().optional(),
  submissionDeadline: z.string().optional(),
  targetDeliveryDate: z.string().optional(),
  bidderLegalName: z.string().max(200).optional(),
  bidderRegistrationNumber: z.string().max(100).optional(),
  bidderContactName: z.string().max(255).optional(),
  bidderEmail: z.string().email().optional().or(z.literal("")),
  bidderPhone: z.string().max(50).optional(),
  quoteValidityDays: z.number().int().positive().max(3650).optional(),
  quoteValidUntil: z.string().optional(),
  leadTime: z.string().max(200).optional(),
  lineItems: z.array(z.object({
    partNumber: z.string().max(100).optional(),
    description: z.string().min(1).max(1000),
    quantity: z.number().positive(),
    unitPrice: z.number().nonnegative().optional(),
  })).max(100).optional(),
  currency: z.string().length(3).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  shippingAmount: z.number().nonnegative().optional(),
  submissionFormat: z.string().max(200).optional(),
  submissionMethod: z.string().max(100).optional(),
  submissionEmail: z.string().email().optional().or(z.literal("")),
  emailSubjectProtocol: z.string().optional(),
  mandatoryAttachments: z.string().optional(),
  costWeight: z.number().int().min(0).max(100).optional(),
  complianceWeight: z.number().int().min(0).max(100).optional(),
  deliveryWeight: z.number().int().min(0).max(100).optional(),
  nonBindingTerms: z.string().optional(),
  incoterms: z.string().max(100).optional(),
  paymentTerms: z.string().optional(),
  settlementDays: z.number().int().nonnegative().max(3650).optional(),
  buyerSignatoryName: z.string().max(255).optional(),
  buyerSignatoryTitle: z.string().max(150).optional(),
  bidderSignatoryName: z.string().max(255).optional(),
  bidderSignatoryTitle: z.string().max(150).optional(),
};
const quotationPayloadSchema = z.object(quotationFields);

function evaluationWeightsAreValid(input: {
  costWeight?: number;
  complianceWeight?: number;
  deliveryWeight?: number;
}) {
  const weights = [input.costWeight, input.complianceWeight, input.deliveryWeight];
  return weights.some((weight) => weight === undefined)
    || weights.reduce<number>((sum, weight) => sum + (weight ?? 0), 0) === 100;
}

function normalizeLineItems(
  items: NonNullable<z.infer<typeof quotationPayloadSchema>["lineItems"]> = [],
) {
  return items.map((item) => {
    const unitPrice = item.unitPrice === undefined ? null : Math.round(item.unitPrice * 100);
    return {
      partNumber: item.partNumber || "",
      description: item.description,
      quantity: item.quantity,
      unitPrice,
      total: unitPrice === null ? null : Math.round(item.quantity * unitPrice),
    };
  });
}

function calculatePricing(input: z.infer<typeof quotationPayloadSchema>, existingAmount = 0) {
  const items = normalizeLineItems(input.lineItems);
  const subtotal = items.reduce((sum, item) => sum + (item.total ?? 0), 0);
  const taxRate = input.taxRate ?? 0;
  const taxAmount = Math.round(subtotal * taxRate / 100);
  const shippingAmount = Math.round((input.shippingAmount ?? 0) * 100);
  const amount = input.lineItems !== undefined
    ? subtotal + taxAmount + shippingAmount
    : input.amount !== undefined
      ? Math.round(input.amount * 100)
      : existingAmount;
  return { items, subtotal, taxAmount, shippingAmount, amount };
}

export const quotationsRouter = router({
  list: viewProcedure
    .input(z.object({
      limit: z.number().optional(),
      offset: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      try {
        const conditions: any[] = [];
        const orgId = ctx.user.organizationId;
        if (orgId) conditions.push(eq(quotations.organizationId, orgId));
        if (input?.status) conditions.push(eq(quotations.status, input.status as any));

        const whereClause = conditions.length === 1 ? conditions[0] : conditions.length > 1 ? and(...conditions) : undefined;

        const all = await db.select().from(quotations)
          .where(whereClause)
          .orderBy(desc(quotations.createdAt))
          .limit(input?.limit || 50)
          .offset(input?.offset || 0);

        const countResult = await db.select({ count: sql<number>`count(*)` }).from(quotations)
          .where(whereClause);

        return { data: all, total: countResult[0]?.count || 0 };
      } catch (error) {
        console.error("Error listing quotations:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch quotations" });
      }
    }),

  getById: viewProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      try {
        const orgId = ctx.user.organizationId;
        const where = orgId ? and(eq(quotations.id, input), eq(quotations.organizationId, orgId)) : eq(quotations.id, input);
        const result = await db.select().from(quotations).where(where);
        if (!result.length) throw new TRPCError({ code: "NOT_FOUND", message: "Quotation not found" });
        return result[0];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch quotation" });
      }
    }),

  create: createProcedure
    .input(quotationPayloadSchema.extend({
      buyerCompanyName: z.string().min(1).max(200),
      status: z.enum(["draft", "submitted", "under_review", "approved", "rejected"]).default("draft"),
    }).refine(evaluationWeightsAreValid, { message: "Evaluation weights must add up to 100%" }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      try {
        const id = uuidv4();
        const rfqNo = input.rfqNo || await generateNextDocumentNumber(db, "quotation");
        const pricing = calculatePricing(input);
        await db.insert(quotations).values({
          id,
          organizationId: ctx.user?.organizationId ?? null,
          rfqNo,
          supplier: input.supplier || input.bidderLegalName || "Open solicitation",
          description: input.description || null,
          amount: pricing.amount,
          dueDate: input.submissionDeadline || input.dueDate || null,
          buyerCompanyName: input.buyerCompanyName,
          buyerDepartment: input.buyerDepartment || null,
          buyerContactName: input.buyerContactName || null,
          buyerContactTitle: input.buyerContactTitle || null,
          buyerEmail: input.buyerEmail || null,
          buyerPhone: input.buyerPhone || null,
          deliveryAddress: input.deliveryAddress || null,
          issueDate: input.issueDate || null,
          submissionDeadline: input.submissionDeadline || input.dueDate || null,
          targetDeliveryDate: input.targetDeliveryDate || null,
          bidderLegalName: input.bidderLegalName || null,
          bidderRegistrationNumber: input.bidderRegistrationNumber || null,
          bidderContactName: input.bidderContactName || null,
          bidderEmail: input.bidderEmail || null,
          bidderPhone: input.bidderPhone || null,
          quoteValidityDays: input.quoteValidityDays ?? 60,
          quoteValidUntil: input.quoteValidUntil || null,
          leadTime: input.leadTime || null,
          lineItems: pricing.items,
          currency: (input.currency || "KES").toUpperCase(),
          taxRate: String(input.taxRate ?? 0),
          shippingAmount: pricing.shippingAmount,
          subtotal: pricing.subtotal,
          taxAmount: pricing.taxAmount,
          submissionFormat: input.submissionFormat || null,
          submissionMethod: input.submissionMethod || null,
          submissionEmail: input.submissionEmail || null,
          emailSubjectProtocol: input.emailSubjectProtocol || null,
          mandatoryAttachments: input.mandatoryAttachments || null,
          costWeight: input.costWeight ?? 50,
          complianceWeight: input.complianceWeight ?? 30,
          deliveryWeight: input.deliveryWeight ?? 20,
          nonBindingTerms: input.nonBindingTerms || null,
          incoterms: input.incoterms || null,
          paymentTerms: input.paymentTerms || null,
          settlementDays: input.settlementDays ?? null,
          buyerSignatoryName: input.buyerSignatoryName || null,
          buyerSignatoryTitle: input.buyerSignatoryTitle || null,
          bidderSignatoryName: input.bidderSignatoryName || null,
          bidderSignatoryTitle: input.bidderSignatoryTitle || null,
          status: input.status,
          createdBy: ctx.user?.id || "",
        });
        await scheduleDocumentAutomation({ documentType: "quotation", documentId: id, organizationId: ctx.user.organizationId, createdBy: ctx.user.id }).catch((error) => console.error("Failed to schedule quotation automation:", error));
        const created = await db.select().from(quotations).where(eq(quotations.id, id));
        return created[0] || { id, ...input };
      } catch (error) {
        console.error("Error creating quotation:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create quotation" });
      }
    }),

  update: editProcedure
    .input(z.object({
      id: z.string(),
      ...quotationPayloadSchema.shape,
      status: z.enum(["draft", "submitted", "under_review", "approved", "rejected"]).optional(),
    }).refine(evaluationWeightsAreValid, { message: "Evaluation weights must add up to 100%" }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      try {
        const orgId = ctx.user.organizationId;
        const ownerCheck = orgId ? and(eq(quotations.id, input.id), eq(quotations.organizationId, orgId)) : eq(quotations.id, input.id);
        const existing = await db.select().from(quotations).where(ownerCheck);
        if (!existing.length) throw new TRPCError({ code: "NOT_FOUND", message: "Quotation not found" });

        const { id, ...updates } = input;
        const pricing = calculatePricing(updates, Number(existing[0].amount || 0));
        const setObj: Record<string, unknown> = {
          supplier: updates.supplier ?? updates.bidderLegalName ?? existing[0].supplier ?? "Open solicitation",
          amount: updates.lineItems !== undefined
            ? pricing.amount
            : updates.amount !== undefined
              ? Math.round(updates.amount * 100)
              : existing[0].amount,
          lineItems: updates.lineItems !== undefined ? pricing.items : existing[0].lineItems,
          currency: (updates.currency || existing[0].currency || "KES").toUpperCase(),
          taxRate: String(updates.taxRate ?? existing[0].taxRate ?? 0),
          shippingAmount: updates.shippingAmount === undefined
            ? existing[0].shippingAmount ?? 0
            : Math.round(updates.shippingAmount * 100),
          subtotal: updates.lineItems !== undefined ? pricing.subtotal : existing[0].subtotal ?? 0,
          taxAmount: updates.lineItems !== undefined ? pricing.taxAmount : existing[0].taxAmount ?? 0,
          quoteValidityDays: updates.quoteValidityDays ?? existing[0].quoteValidityDays ?? 60,
          costWeight: updates.costWeight ?? existing[0].costWeight ?? 50,
          complianceWeight: updates.complianceWeight ?? existing[0].complianceWeight ?? 30,
          deliveryWeight: updates.deliveryWeight ?? existing[0].deliveryWeight ?? 20,
          settlementDays: updates.settlementDays ?? null,
        };
        const optionalTextFields = [
          ["description", updates.description, existing[0].description],
          ["dueDate", updates.submissionDeadline ?? updates.dueDate, existing[0].dueDate],
          ["buyerCompanyName", updates.buyerCompanyName, existing[0].buyerCompanyName],
          ["buyerDepartment", updates.buyerDepartment, existing[0].buyerDepartment],
          ["buyerContactName", updates.buyerContactName, existing[0].buyerContactName],
          ["buyerContactTitle", updates.buyerContactTitle, existing[0].buyerContactTitle],
          ["buyerEmail", updates.buyerEmail, existing[0].buyerEmail],
          ["buyerPhone", updates.buyerPhone, existing[0].buyerPhone],
          ["deliveryAddress", updates.deliveryAddress, existing[0].deliveryAddress],
          ["issueDate", updates.issueDate, existing[0].issueDate],
          ["submissionDeadline", updates.submissionDeadline ?? updates.dueDate, existing[0].submissionDeadline],
          ["targetDeliveryDate", updates.targetDeliveryDate, existing[0].targetDeliveryDate],
          ["bidderLegalName", updates.bidderLegalName, existing[0].bidderLegalName],
          ["bidderRegistrationNumber", updates.bidderRegistrationNumber, existing[0].bidderRegistrationNumber],
          ["bidderContactName", updates.bidderContactName, existing[0].bidderContactName],
          ["bidderEmail", updates.bidderEmail, existing[0].bidderEmail],
          ["bidderPhone", updates.bidderPhone, existing[0].bidderPhone],
          ["quoteValidUntil", updates.quoteValidUntil, existing[0].quoteValidUntil],
          ["leadTime", updates.leadTime, existing[0].leadTime],
          ["submissionFormat", updates.submissionFormat, existing[0].submissionFormat],
          ["submissionMethod", updates.submissionMethod, existing[0].submissionMethod],
          ["submissionEmail", updates.submissionEmail, existing[0].submissionEmail],
          ["emailSubjectProtocol", updates.emailSubjectProtocol, existing[0].emailSubjectProtocol],
          ["mandatoryAttachments", updates.mandatoryAttachments, existing[0].mandatoryAttachments],
          ["nonBindingTerms", updates.nonBindingTerms, existing[0].nonBindingTerms],
          ["incoterms", updates.incoterms, existing[0].incoterms],
          ["paymentTerms", updates.paymentTerms, existing[0].paymentTerms],
          ["buyerSignatoryName", updates.buyerSignatoryName, existing[0].buyerSignatoryName],
          ["buyerSignatoryTitle", updates.buyerSignatoryTitle, existing[0].buyerSignatoryTitle],
          ["bidderSignatoryName", updates.bidderSignatoryName, existing[0].bidderSignatoryName],
          ["bidderSignatoryTitle", updates.bidderSignatoryTitle, existing[0].bidderSignatoryTitle],
        ] as const;
        for (const [key, value, previous] of optionalTextFields) {
          setObj[key] = value === undefined ? previous : value || null;
        }
        if (updates.rfqNo !== undefined) setObj.rfqNo = updates.rfqNo;
        if (updates.status !== undefined) setObj.status = updates.status;

        await db.update(quotations).set(setObj).where(ownerCheck);
        const updated = await db.select().from(quotations).where(ownerCheck);
        return updated[0];
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update quotation" });
      }
    }),

  delete: deleteProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      try {
        const orgId = ctx.user.organizationId;
        const where = orgId ? and(eq(quotations.id, input), eq(quotations.organizationId, orgId)) : eq(quotations.id, input);
        const existing = await db.select().from(quotations).where(where);
        if (!existing.length) throw new TRPCError({ code: "NOT_FOUND", message: "Quotation not found" });
        await db.delete(quotations).where(where);
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete quotation" });
      }
    }),
});
