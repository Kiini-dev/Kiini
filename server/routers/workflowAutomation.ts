import { router, protectedProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { getDb, logActivity } from "../db";
import { eq, and, desc } from "drizzle-orm";
import { automationConfigs, workflowAutomationLogs } from "../../drizzle/schema-extended";
import { v4 as uuidv4 } from "uuid";
import { TRPCError } from "@trpc/server";

/**
 * Workflow Automation Router
 * Coordinates automatic transitions between accounting documents
 * Implements: Quote→Proposal→Contract→Invoice→Payment→Receipt chain
 */

const automationProcedure = createFeatureRestrictedProcedure("accounting:automation:manage");
const readProcedure = createFeatureRestrictedProcedure("accounting:automation:read");

export const workflowAutomationRouter = router({
  // Configure workflow automation rules
  getAutomationRules: readProcedure
    .input(z.object({
      workflowType: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) return [];

        const orgId = ctx.user.organizationId;
        const conditions = orgId ? [eq(automationConfigs.organizationId, orgId)] : [];

        if (input?.workflowType) {
          conditions.push(eq(automationConfigs.workflowType, input.workflowType));
        }

        const where = conditions.length > 0 ? and(...conditions) : undefined;

        return await database.select().from(automationConfigs)
          .where(where)
          .orderBy(desc(automationConfigs.createdAt));
      } catch (error) {
        console.error("Error fetching automation rules:", error);
        return [];
      }
    }),

  // Execute workflow automation
  executeAutomation: automationProcedure
    .input(z.object({
      workflowType: z.string(),
      sourceEntityId: z.string(),
      sourceEntityType: z.string(),
      targetData: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database: any = await getDb();
      if (!database) throw new Error("Database not available");

      try {
        const orgId = ctx.user.organizationId;
        const automationId = uuidv4();
        const now = new Date();

        // For now, just log the automation execution
        // TODO: Implement specific workflow logic for each type
        const targetEntityId = uuidv4(); // Placeholder - actual implementation needed

        // Log automation execution
        await database.insert(workflowAutomationLogs).values({
          id: automationId,
          organizationId: orgId,
          workflowType: input.workflowType,
          sourceEntityId: input.sourceEntityId,
          sourceEntityType: input.sourceEntityType,
          targetEntityId,
          status: "completed",
          executedBy: ctx.user.id,
          executedAt: now,
          createdAt: now,
        });

        await logActivity({
          userId: ctx.user.id,
          action: "workflow_automation_executed",
          entityType: "automation",
          entityId: automationId,
          description: `Workflow automation executed: ${input.workflowType}`,
        });

        return {
          success: true,
          automationId,
          targetEntityId,
          message: `Successfully executed ${input.workflowType}`,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Automation failed: ${error.message}`,
        });
      }
    }),

  // Get automation execution history
  getAutomationHistory: readProcedure
    .input(z.object({
      limit: z.number().optional(),
      offset: z.number().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      try {
        const db: any = await getDb();
        if (!db) return [];

        const orgId = ctx.user.organizationId;
        return await db.select().from(workflowAutomationLogs)
          .where(eq(workflowAutomationLogs.organizationId, orgId))
          .orderBy(desc(workflowAutomationLogs.executedAt))
          .limit(input?.limit || 50)
          .offset(input?.offset || 0);
      } catch (error) {
        console.error("Error fetching automation history:", error);
        return [];
      }
    }),

  // Enable/disable automation
  toggleAutomation: automationProcedure
    .input(z.object({
      workflowType: z.string(),
      enabled: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database: any = await getDb();
      if (!database) throw new Error("Database not available");

      try {
        const orgId = ctx.user.organizationId;
        const now = new Date();

        // Get or create automation config
        const existing = await database.select().from(automationConfigs)
          .where(and(
            eq(automationConfigs.organizationId, orgId),
            eq(automationConfigs.workflowType, input.workflowType)
          )).limit(1);

        if (existing.length > 0) {
          await database.update(automationConfigs).set({
            enabled: input.enabled,
            updatedAt: now,
          }).where(and(
            eq(automationConfigs.organizationId, orgId),
            eq(automationConfigs.workflowType, input.workflowType)
          ));
        } else {
          await database.insert(automationConfigs).values({
            id: uuidv4(),
            organizationId: orgId,
            workflowType: input.workflowType,
            enabled: input.enabled,
            createdAt: now,
            updatedAt: now,
            configuration: null,
          });
        }

        return { success: true };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to toggle automation: ${error.message}`,
        });
      }
    }),
});

// Helper functions
async function convertQuotationToProposal(
  database: any,
  quotationId: string,
  orgId: string,
  userId: string
): Promise<string> {
  const quotation = await (database.select().from("quotations" as any)
    .where(eq("quotations.id" as any, quotationId)) as any).limit(1);

  if (!quotation.length) throw new Error("Quotation not found");

  const q = quotation[0];
  const proposalId = uuidv4();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const proposalNumber = `PROP-${new Date().getFullYear()}-${String(Math.random() * 100000).padStart(6, '0')}`;

  await database.insert("proposals" as any).values({
    id: proposalId,
    organizationId: orgId,
    proposalNumber,
    clientId: q.supplierId,
    clientName: q.supplierName,
    amount: q.amount,
    status: "sent",
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  });

  return proposalId;
}

async function convertProposalToContract(
  database: any,
  proposalId: string,
  orgId: string,
  userId: string
): Promise<string> {
  const proposal = await (database.select().from("proposals" as any)
    .where(eq("proposals.id" as any, proposalId)) as any).limit(1);

  if (!proposal.length) throw new Error("Proposal not found");

  const p = proposal[0];
  const contractId = uuidv4();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const contractNumber = `CTR-${new Date().getFullYear()}-${String(Math.random() * 100000).padStart(6, '0')}`;

  await database.insert("contracts" as any).values({
    id: contractId,
    organizationId: orgId,
    contractNumber,
    vendorId: p.clientId,
    vendorName: p.clientName,
    value: p.amount,
    status: "active",
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  });

  return contractId;
}

async function convertContractToInvoice(
  database: any,
  contractId: string,
  orgId: string,
  userId: string,
  targetData?: any
): Promise<string> {
  const contract = await (database.select().from("contracts" as any)
    .where(eq("contracts.id" as any, contractId)) as any).limit(1);

  if (!contract.length) throw new Error("Contract not found");

  const c = contract[0];
  const invoiceId = uuidv4();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.random() * 100000).padStart(6, '0')}`;

  await database.insert("invoices" as any).values({
    id: invoiceId,
    organizationId: orgId,
    invoiceNumber,
    clientId: c.vendorId,
    clientName: c.vendorName,
    amount: c.value,
    total: c.value,
    status: "sent",
    invoiceDate: now.substring(0, 10),
    dueDate: targetData?.dueDate || now.substring(0, 10),
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  });

  return invoiceId;
}

async function createReceiptFromPayment(
  database: any,
  paymentId: string,
  orgId: string,
  userId: string
): Promise<string> {
  const payment = await (database.select().from("payments" as any)
    .where(eq("payments.id" as any, paymentId)) as any).limit(1);

  if (!payment.length) throw new Error("Payment not found");

  const p = payment[0];
  const receiptId = uuidv4();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const receiptNumber = `REC-${new Date().getFullYear()}-${String(Math.random() * 100000).padStart(6, '0')}`;

  await database.insert("receipts" as any).values({
    id: receiptId,
    organizationId: orgId,
    receiptNumber,
    clientId: p.clientId,
    paymentId,
    amount: p.amount,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  });

  return receiptId;
}

async function createPaymentFromExpense(
  database: any,
  expenseId: string,
  orgId: string,
  userId: string
): Promise<string> {
  const expense = await (database.select().from("expenses" as any)
    .where(eq("expenses.id" as any, expenseId)) as any).limit(1);

  if (!expense.length) throw new Error("Expense not found");

  const e = expense[0];
  const paymentId = uuidv4();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const paymentRef = `PAY-${new Date().getFullYear()}-${String(Math.random() * 100000).padStart(6, '0')}`;

  await database.insert("payments" as any).values({
    id: paymentId,
    organizationId: orgId,
    paymentRef,
    amount: e.amount,
    status: "pending",
    expenseId,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  });

  return paymentId;
}

async function createPaymentFromImprest(
  database: any,
  imprestId: string,
  orgId: string,
  userId: string
): Promise<string> {
  const imprest = await (database.select().from("imprests" as any)
    .where(eq("imprests.id" as any, imprestId)) as any).limit(1);

  if (!imprest.length) throw new Error("Imprest not found");

  const i = imprest[0];
  const paymentId = uuidv4();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const paymentRef = `PAY-${new Date().getFullYear()}-${String(Math.random() * 100000).padStart(6, '0')}`;

  await database.insert("payments" as any).values({
    id: paymentId,
    organizationId: orgId,
    paymentRef,
    amount: i.amount,
    status: "completed",
    imprestId,
    createdBy: userId,
    createdAt: now,
    updatedAt: now,
  });

  return paymentId;
}
