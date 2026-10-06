import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb, createNotification } from "../db";
import { payments, invoices, estimates, receipts, invoiceItems, lineItems, clients } from "../../drizzle/schema";
import { invoicePayments } from "../../drizzle/schema-extended";
import { eq, desc, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import * as db from "../db";
import { TRPCError } from "@trpc/server";
import { triggerEventNotification } from "./emailNotifications";
import { workflowTriggerEngine } from "../workflows/triggerEngine";
import { createFeatureRestrictedProcedure, createRoleRestrictedProcedure } from "../middleware/enhancedRbac";
import { combineOrgFilters, validateOwnership, auditLogSensitiveOperation } from "../middleware/organizationIsolationEnforcer";
import { generateReceiptPDF } from "../utils/receipt-pdf-generator";
import { adjustChartOfAccountBalance, getChartOfAccountBalanceDelta, getChartOfAccountNormalSide, reconcileChartOfAccountBalance } from "../utils/chartOfAccountBalance";
import { paymentModeSchema } from "../utils/payment-modes";

// Permission-restricted procedure instances
const viewProcedure = createFeatureRestrictedProcedure("accounting:payments:view");
const createProcedure = createFeatureRestrictedProcedure("accounting:payments:create");
const approveProcedure = createFeatureRestrictedProcedure("accounting:payments:approve");
const deleteProcedure = createRoleRestrictedProcedure(["super_admin", "admin"]);

// Helper function to generate next payment reference number in format PAY-000000
async function generateNextPaymentReferenceNumber(database: any): Promise<string> {
  try {
    const result = await database.select({ payNum: payments.referenceNumber })
      .from(payments)
      .orderBy(desc(payments.referenceNumber))
      .limit(1);
    
    let maxSequence = 0;
    
    if (result && result.length > 0 && result[0].payNum) {
      const match = result[0].payNum.match(/(\d+)$/);
      if (match) {
        maxSequence = parseInt(match[1]);
      }
    }

    const nextSequence = maxSequence + 1;
    return `PAY-${String(nextSequence).padStart(6, '0')}`;
  } catch (err) {
    console.warn("Error generating payment reference number, using default:", err);
    return `PAY-000001`;
  }
}

export function normalizeDateValue(value: unknown): Date | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

export function convertToMySQLDateTime(date?: unknown): string | undefined {
  const normalized = normalizeDateValue(date);
  if (!normalized) return undefined;
  return normalized.toISOString().replace("T", " ").substring(0, 19);
}

// Helper function to send payment notifications
async function sendPaymentNotification(
  database: any,
  userId: string,
  action: "recorded" | "approved",
  amount: number,
  invoiceNumber: string,
  paymentId: string
) {
  try {
    const amountFormatted = (amount / 100).toLocaleString("en-KE", {
      style: "currency",
      currency: "KES",
    });

    const messages = {
      recorded: `Payment of ${amountFormatted} received for invoice ${invoiceNumber}`,
      approved: `Payment of ${amountFormatted} for invoice ${invoiceNumber} has been approved`,
    };

    const titles = {
      recorded: "Payment Recorded",
      approved: "Payment Approved",
    };

    await createNotification({
      userId,
      title: titles[action],
      message: messages[action],
      type: "success",
      category: "payment",
      entityType: "payment",
      entityId: paymentId,
      actionUrl: `/payments/${paymentId}`,
      priority: "normal",
    });
  } catch (err) {
    console.warn("Failed to create payment notification:", err);
  }
}

export const paymentsRouter = router({
  list: viewProcedure
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) return [];
        const orgId = ctx.user.organizationId;
        const query = orgId
          ? database.select().from(payments).where(eq(payments.organizationId, orgId))
          : database.select().from(payments);
        return await (query as any).limit(input?.limit || 50).offset(input?.offset || 0);
      } catch (error) {
        console.error("Error fetching payments list:", error);
        return [];
      }
    }),

  getNextPaymentReferenceNumber: viewProcedure
    .query(async () => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const nextNumber = await generateNextPaymentReferenceNumber(database);
      return { referenceNumber: nextNumber };
    }),

  getById: viewProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) return null;
      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(payments.id, input), eq(payments.organizationId, orgId)) : eq(payments.id, input);
      const result = await database.select().from(payments).where(where).limit(1);
      return result[0] || null;
    }),

  byInvoice: viewProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) return [];
      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(payments.invoiceId, input), eq(payments.organizationId, orgId)) : eq(payments.invoiceId, input);
      const result = await database.select().from(payments).where(where);
      return result;
    }),

  byClient: viewProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) return [];
      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(payments.clientId, input), eq(payments.organizationId, orgId)) : eq(payments.clientId, input);
      const result = await database.select().from(payments).where(where);
      return result;
    }),

  create: createProcedure
    .input(z.object({
      invoiceId: z.string(),
      clientId: z.string(),
      amount: z.number(),
      paymentDate: z.union([z.string(), z.date(), z.number()]),
      paymentMethod: paymentModeSchema,
      referenceNumber: z.string().optional(),
      notes: z.string().optional(),
      status: z.enum(["pending", "completed", "failed", "cancelled"]).optional(),
      estimateId: z.string().optional(),
      receiptId: z.string().optional(),
      chartOfAccountId: z.string().nullable().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      // Auto-generate payment reference number if not provided
      let referenceNumber = input.referenceNumber;
      if (!referenceNumber) {
        referenceNumber = await generateNextPaymentReferenceNumber(database);
      }

      const normalizedPaymentDate = normalizeDateValue(input.paymentDate);
      const paymentDateForStorage = normalizedPaymentDate ? convertToMySQLDateTime(normalizedPaymentDate) : undefined;
      
      const id = uuidv4();
      const { estimateId, receiptId, ...paymentData } = input;
      const chartOfAccountType = await getChartOfAccountNormalSide(database, input.chartOfAccountId, ctx.user.organizationId);
      const invoiceWhere = ctx.user.organizationId
        ? and(eq(invoices.id, input.invoiceId), eq(invoices.organizationId, ctx.user.organizationId))
        : eq(invoices.id, input.invoiceId);
      const invoiceResult = await database.select().from(invoices).where(invoiceWhere).limit(1);
      const invoice = invoiceResult[0];
      if (!invoice) throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      if (invoice.clientId !== input.clientId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Payment client does not match invoice client" });
      }
      
      // Convert paymentDate to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
      try {
        // Create payment record
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        await database.insert(payments).values({
          id,
          organizationId: ctx.user.organizationId ?? null,
          invoiceId: paymentData.invoiceId,
          clientId: paymentData.clientId,
          accountId: null,  // Default null - will be set during payment processing
          amount: paymentData.amount,
          paymentDate: paymentDateForStorage ?? now,
          paymentMethod: paymentData.paymentMethod,
          referenceNumber,
          chartOfAccountType,
          chartOfAccountId: input.chartOfAccountId || null, // Link to Chart of Accounts
          notes: paymentData.notes || null,
          status: input.status || "pending",
          approvedBy: null,
          approvedAt: null,
          createdBy: ctx.user.id,
          createdAt: now,
        } as any);
        if (input.chartOfAccountId) {
          await adjustChartOfAccountBalance(database, input.chartOfAccountId, getChartOfAccountBalanceDelta(input.amount, chartOfAccountType), ctx.user.organizationId);
        }

        // Mirror the payment in the invoice-specific history used by invoice tabs.
        await database.insert(invoicePayments).values({
          id,
          invoiceId: input.invoiceId,
          paymentAmount: input.amount,
          paymentDate: paymentDateForStorage ?? now,
          paymentMethod: paymentData.paymentMethod,
          reference: referenceNumber || null,
          notes: paymentData.notes || null,
          receiptId: receiptId || null,
          recordedBy: ctx.user.id,
          createdAt: now,
          updatedAt: now,
        } as any);

        // Update invoice status and paid amount
        {
          const currentPaidAmount = invoice.paidAmount || 0;
          const newPaidAmount = currentPaidAmount + input.amount;
          const invoiceTotal = invoice.total || 0;

          let newInvoiceStatus: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled' = invoice.status as any;
          
          if (newPaidAmount >= invoiceTotal) {
            newInvoiceStatus = 'paid';
          } else if (newPaidAmount > 0) {
            newInvoiceStatus = 'partial';
          }

          await database.update(invoices).set({
            paidAmount: newPaidAmount,
            status: newInvoiceStatus,
          }).where(invoiceWhere);

          const receiptFromInvoice = await db.createReceiptFromInvoice(input.invoiceId, {
            paymentId: id,
            paymentMethod: paymentData.paymentMethod,
            amount: input.amount,
            receiptDate: normalizedPaymentDate || new Date(),
          });

          if (receiptFromInvoice) {
            await database.update(receipts).set({ paymentId: id }).where(eq(receipts.id, receiptFromInvoice.id));
          }

          await db.logActivity({
            userId: ctx.user.id,
            action: "payment_created",
            entityType: "payment",
            entityId: id,
            description: `Created payment of Ksh ${input.amount / 100} for invoice: ${invoice.invoiceNumber}. Invoice status updated to ${newInvoiceStatus}`,
          });
        }

        if (estimateId) {
          const estimateResult = await database.select().from(estimates).where(eq(estimates.id, estimateId)).limit(1);
          const estimate = estimateResult[0];

          if (estimate && estimate.status === 'accepted') {
            await database.update(estimates).set({
              status: 'completed' as any,
            }).where(eq(estimates.id, estimateId));

            await db.logActivity({
              userId: ctx.user.id,
              action: "estimate_completed",
              entityType: "estimate",
              entityId: estimateId,
              description: `Estimate ${estimate.estimateNumber} marked as completed due to payment received`,
            });
          }
        }

        if (receiptId) {
          const receiptResult = await database.select().from(receipts).where(eq(receipts.id, receiptId)).limit(1);
          const receipt = receiptResult[0];

          if (receipt) {
            await database.update(receipts).set({
              paymentId: id,
            }).where(eq(receipts.id, receiptId));

            await db.logActivity({
              userId: ctx.user.id,
              action: "receipt_linked",
              entityType: "receipt",
              entityId: receiptId,
              description: `Receipt ${receipt.receiptNumber} linked to payment ${id}`,
            });
          }
        }

        // Send notification
        if (invoice) {
          await sendPaymentNotification(database, ctx.user.id, "recorded", input.amount, invoice.invoiceNumber, id);
          
          // Send email notification for payment received
          try {
            const client = (await database.select().from(clients).where(eq(clients.id, invoice.clientId)).limit(1))[0];
            const receipt = (await database.select().from(receipts).where(eq(receipts.paymentId, id)).limit(1))[0];
            if (client?.email && receipt) await triggerEventNotification({
              userId: ctx.user.id,
              eventType: "payment_received",
              recipientEmail: client.email,
              recipientName: client.contactPerson || client.companyName || "Client",
              subject: `Payment Received - Invoice ${invoice.invoiceNumber}`,
              htmlContent: `<p>Thank you. Your payment for invoice ${invoice.invoiceNumber} has been received.</p>`,
              templateId: "payment_received",
              templateContext: {
                organizationId: ctx.user.organizationId,
                recipient_name: client.contactPerson || client.companyName || "Client",
                amount_paid: `KES ${(input.amount / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`,
                payment_date: input.paymentDate instanceof Date ? input.paymentDate.toLocaleDateString() : new Date(input.paymentDate).toLocaleDateString(),
                payment_method: paymentData.paymentMethod,
                transaction_reference: referenceNumber || "See receipt",
                invoice_number: invoice.invoiceNumber,
                receipt_pdf_filename: `receipt-${receipt.receiptNumber}.pdf`,
                receipt_url: `/invoices/${input.invoiceId}`,
              },
              entityType: "payment",
              entityId: id,
              actionUrl: `/invoices/${input.invoiceId}`,
              attachments: [{ filename: `receipt-${receipt.receiptNumber}.pdf`, content: await generateReceiptPDF(receipt.id), contentType: "application/pdf" }],
            });
          } catch (err) {
            console.error("Failed to send payment received email:", err);
          }

          // Trigger workflows for payment_received
          try {
            await workflowTriggerEngine.trigger({
              triggerType: "payment_received",
              entityType: "payment",
              entityId: id,
              data: { paymentId: id, invoiceId: input.invoiceId, amount: input.amount },
              userId: ctx.user.id,
            });
          } catch (err) {
            console.error("Workflow trigger (payment_received) failed:", err);
          }
        }

        return { 
          id,
          invoiceStatus: invoice?.status,
          message: "Payment recorded successfully and documents updated"
        };
      } catch (error: any) {
        console.error("Error creating payment:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to record payment: ${error.message}`,
        });
      }
    }),

  update: createProcedure
    .input(z.object({
      id: z.string(),
      invoiceId: z.string().optional(),
      clientId: z.string().optional(),
      amount: z.number().optional(),
      paymentDate: z.union([z.string(), z.date(), z.number()]).optional().nullable(),
      paymentMethod: paymentModeSchema.optional(),
      referenceNumber: z.string().optional(),
      notes: z.string().optional(),
      status: z.enum(["pending", "completed", "failed", "cancelled"]).optional(),
      chartOfAccountId: z.string().nullable().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const { id, ...updateData } = input;
      const normalizedPaymentDate = updateData.paymentDate === undefined || updateData.paymentDate === null
        ? undefined
        : convertToMySQLDateTime(updateData.paymentDate);
      const formattedData: any = { ...updateData };
      if ("paymentDate" in formattedData) {
        delete formattedData.paymentDate;
      }
      if (normalizedPaymentDate) {
        formattedData.paymentDate = normalizedPaymentDate;
      }

      // Get the current payment to check what's being updated
      const orgId = ctx.user.organizationId;
      const ownerCheck = orgId ? and(eq(payments.id, id), eq(payments.organizationId, orgId)) : eq(payments.id, id);
      const currentPayment = await database.select().from(payments).where(ownerCheck).limit(1);
      if (!currentPayment.length) throw new Error("Payment not found");
      const payment = currentPayment[0];

      await database.update(payments).set(formattedData).where(eq(payments.id, id));
      await reconcileChartOfAccountBalance(
        database,
        payment.chartOfAccountId,
        Number(payment.amount || 0),
        payment.chartOfAccountType === "credit" ? "credit" : "debit",
        updateData.chartOfAccountId !== undefined ? updateData.chartOfAccountId : payment.chartOfAccountId,
        updateData.amount !== undefined ? updateData.amount : Number(payment.amount || 0),
        payment.chartOfAccountType === "credit" ? "credit" : "debit",
        ctx.user.organizationId,
      );

      if (payment.invoiceId) {
        const invoicePaymentUpdates: any = {};
        if (updateData.amount !== undefined) invoicePaymentUpdates.paymentAmount = updateData.amount;
        if (updateData.paymentDate !== undefined) invoicePaymentUpdates.paymentDate = formattedData.paymentDate;
        if (updateData.paymentMethod !== undefined) {
          invoicePaymentUpdates.paymentMethod = updateData.paymentMethod;
        }
        if (updateData.referenceNumber !== undefined) invoicePaymentUpdates.reference = updateData.referenceNumber;
        if (updateData.notes !== undefined) invoicePaymentUpdates.notes = updateData.notes;
        if (Object.keys(invoicePaymentUpdates).length) {
          await database.update(invoicePayments).set(invoicePaymentUpdates).where(eq(invoicePayments.id, id));
        }
      }

      // Recalculate the invoice whenever a linked payment changes.
      if (payment?.invoiceId) {
        try {
          const invoiceResult = await database.select().from(invoices).where(eq(invoices.id, payment.invoiceId)).limit(1);
          const invoice = invoiceResult[0];

          if (invoice) {
            // Calculate total paid amount for this invoice (all completed payments)
            const paidPayments = await database.select({ total: invoicePayments.paymentAmount })
              .from(invoicePayments).where(eq(invoicePayments.invoiceId, payment.invoiceId));
            const totalPaid = paidPayments.reduce((sum, p) => sum + (p.total || 0), 0);
            const invoiceTotal = invoice.total || 0;

            // Determine new invoice status
            let newInvoiceStatus: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled' = invoice.status as any;
            
            if (totalPaid >= invoiceTotal) {
              newInvoiceStatus = 'paid';
            } else if (totalPaid > 0) {
              newInvoiceStatus = 'partial';
            }

            // Update invoice with new paid amount and status
            await database.update(invoices).set({
              paidAmount: totalPaid,
              status: newInvoiceStatus,
            }).where(eq(invoices.id, payment.invoiceId));

            await db.logActivity({
              userId: ctx.user.id,
              action: "invoice_updated_via_payment",
              entityType: "invoice",
              entityId: payment.invoiceId,
              description: `Invoice status updated to ${newInvoiceStatus} with paid amount: Ksh ${totalPaid / 100}`,
            });

            try {
              await workflowTriggerEngine.trigger({
                triggerType: "payment_received",
                entityType: "payment",
                entityId: id,
                data: {
                  paymentId: id,
                  invoiceId: payment.invoiceId,
                  amount: payment.amount,
                  invoiceStatus: newInvoiceStatus,
                },
                userId: ctx.user.id,
              });
            } catch (err) {
              console.error("Workflow trigger (payment_received) failed during payment update:", err);
            }

            if (newInvoiceStatus === "paid") {
              try {
                await workflowTriggerEngine.trigger({
                  triggerType: "invoice_paid",
                  entityType: "invoice",
                  entityId: invoice.id,
                  data: {
                    invoiceId: invoice.id,
                    invoiceNumber: invoice.invoiceNumber,
                    paidAmount: totalPaid,
                  },
                  userId: ctx.user.id,
                });
              } catch (err) {
                console.error("Workflow trigger (invoice_paid) failed during payment update:", err);
              }
            }
          }
        } catch (err) {
          console.error("Error updating invoice from payment:", err);
        }
      }

      await db.logActivity({
        userId: ctx.user.id,
        action: "payment_updated",
        entityType: "payment",
        entityId: id,
        description: `Updated payment: ${id}. New status: ${updateData.status || 'unchanged'}`,
      });

      return { success: true };
    }),

  generateReceipt: createProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const orgId = ctx.user.organizationId;
      const paymentWhere = orgId
        ? and(eq(payments.id, input.id), eq(payments.organizationId, orgId))
        : eq(payments.id, input.id);
      const paymentResult = await database.select().from(payments).where(paymentWhere).limit(1);
      const payment = paymentResult[0];
      if (!payment) throw new Error("Payment not found");

      const existing = await database.select({ id: receipts.id }).from(receipts).where(eq(receipts.paymentId, payment.id)).limit(1);
      if (existing[0]) return { id: existing[0].id, created: false };

      if (payment.invoiceId) {
        const generated = await db.createReceiptFromInvoice(payment.invoiceId, {
          paymentId: payment.id,
          paymentMethod: payment.paymentMethod,
          amount: payment.amount,
          receiptDate: payment.paymentDate,
        });
        if (generated) return { id: generated.id, created: true };
      }

      const receiptId = uuidv4();
      const latestReceipt = await database
        .select({ receiptNumber: receipts.receiptNumber })
        .from(receipts)
        .orderBy(desc(receipts.receiptNumber))
        .limit(1);
      const latestSequence = latestReceipt[0]?.receiptNumber?.match(/(\d+)$/)?.[1];
      const receiptNumber = `REC-${String((latestSequence ? Number(latestSequence) : 0) + 1).padStart(6, "0")}`;
      const now = new Date().toISOString().replace("T", " ").substring(0, 19);
      await database.insert(receipts).values({
        id: receiptId,
        organizationId: orgId ?? null,
        receiptNumber,
        clientId: payment.clientId,
        paymentId: payment.id,
        amount: payment.amount,
        subtotal: payment.amount,
        taxAmount: 0,
        discountAmount: 0,
        paymentMethod: payment.paymentMethod,
        receiptDate: new Date(payment.paymentDate || now),
        notes: payment.notes || `Receipt generated from payment ${payment.referenceNumber}`,
        createdBy: ctx.user.id,
        createdAt: now,
      } as any);
      await database.insert(lineItems).values({
        id: uuidv4(),
        documentId: receiptId,
        documentType: "receipt",
        description: `Payment ${payment.referenceNumber}`,
        quantity: 1,
        rate: payment.amount,
        amount: payment.amount,
        taxRate: 0,
        lineNumber: 1,
        createdBy: ctx.user.id,
        createdAt: now,
      } as any);

      return { id: receiptId, receiptNumber, created: true };
    }),

  delete: deleteProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(payments.id, input), eq(payments.organizationId, orgId)) : eq(payments.id, input);
      const [payment] = await database.select().from(payments).where(where).limit(1);
      if (payment?.chartOfAccountId) {
        const balanceDelta = getChartOfAccountBalanceDelta(Number(payment.amount || 0), payment.chartOfAccountType === "credit" ? "credit" : "debit");
        await adjustChartOfAccountBalance(database, payment.chartOfAccountId, -balanceDelta, ctx.user.organizationId);
      }
      await database.delete(payments).where(where);
      if (payment?.invoiceId) {
        await database.delete(invoicePayments).where(eq(invoicePayments.id, input));
        const paidPayments = await database.select({ total: invoicePayments.paymentAmount })
          .from(invoicePayments).where(eq(invoicePayments.invoiceId, payment.invoiceId));
        const totalPaid = paidPayments.reduce((sum, row) => sum + Number(row.total || 0), 0);
        const [invoice] = await database.select({ total: invoices.total }).from(invoices).where(eq(invoices.id, payment.invoiceId)).limit(1);
        if (invoice) {
          await database.update(invoices).set({
            paidAmount: totalPaid,
            status: totalPaid >= Number(invoice.total || 0) ? "paid" : totalPaid > 0 ? "partial" : "sent",
          } as any).where(eq(invoices.id, payment.invoiceId));
        }
      }

      await db.logActivity({
        userId: ctx.user.id,
        action: "payment_deleted",
        entityType: "payment",
        entityId: input,
        description: `Deleted payment: ${input}`,
      });

      return { success: true };
    }),

  recordPayment: approveProcedure
    .input(z.object({
      invoiceId: z.string(),
      clientId: z.string(),
      amount: z.number(),
      paymentDate: z.coerce.date(),
      paymentMethod: paymentModeSchema,
      referenceNumber: z.string().optional(),
      notes: z.string().optional(),
      chartOfAccountId: z.string().nullable().optional(),
      autoMatch: z.boolean().optional().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      
      const paymentId = uuidv4();
      const { autoMatch, ...paymentData } = input;
      const chartOfAccountType = await getChartOfAccountNormalSide(database, input.chartOfAccountId, ctx.user.organizationId);

      // Convert dates to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
      const convertToMySQLDateTime = (date?: Date | string | null): string => {
        if (!date) return new Date().toISOString().replace('T', ' ').substring(0, 19);
        if (typeof date === 'string') return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
        if (date instanceof Date) return date.toISOString().replace('T', ' ').substring(0, 19);
        return new Date().toISOString().replace('T', ' ').substring(0, 19);
      };

      try {
        await database.insert(payments).values({
          id: paymentId,
          organizationId: ctx.user.organizationId ?? null,
          ...paymentData,
          paymentDate: convertToMySQLDateTime(input.paymentDate),
          chartOfAccountType,
          createdBy: ctx.user.id,
        } as any);
        if (input.chartOfAccountId) {
          await adjustChartOfAccountBalance(database, input.chartOfAccountId, getChartOfAccountBalanceDelta(input.amount, chartOfAccountType), ctx.user.organizationId);
        }

        const invoiceResult = await database.select().from(invoices).where(eq(invoices.id, input.invoiceId)).limit(1);
        const invoice = invoiceResult[0];

        if (!invoice) {
          throw new Error("Invoice not found");
        }

        const currentPaidAmount = invoice.paidAmount || 0;
        const newPaidAmount = currentPaidAmount + input.amount;
        const invoiceTotal = invoice.total || 0;

        let invoiceStatus: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled' = invoice.status as any;
        let isPaid = false;

        if (newPaidAmount >= invoiceTotal) {
          invoiceStatus = 'paid';
          isPaid = true;
        } else if (newPaidAmount > 0) {
          invoiceStatus = 'partial';
        }

        await database.update(invoices).set({
          paidAmount: newPaidAmount,
          status: invoiceStatus,
        }).where(eq(invoices.id, input.invoiceId));

        const generatedReceipt = await db.createReceiptFromInvoice(input.invoiceId, {
          paymentId,
          paymentMethod: input.paymentMethod,
          amount: input.amount,
          receiptDate: input.paymentDate,
        });

        let matchedDocuments: any = {
          invoice: {
            id: invoice.id,
            number: invoice.invoiceNumber,
            status: invoiceStatus,
            paidAmount: newPaidAmount,
            total: invoiceTotal,
          },
          estimates: [],
          receipts: [],
        };

        if (autoMatch && isPaid) {
          const relatedEstimates = await database.select().from(estimates).where(eq(estimates.clientId, input.clientId));
          
          for (const estimate of relatedEstimates) {
            if (estimate.status === 'accepted' && estimate.total === invoiceTotal) {
              await database.update(estimates).set({
                status: 'completed' as any,
              }).where(eq(estimates.id, estimate.id));

              matchedDocuments.estimates.push({
                id: estimate.id,
                number: estimate.estimateNumber,
                status: 'completed',
              });

              await db.logActivity({
                userId: ctx.user.id,
                action: "estimate_auto_matched",
                entityType: "estimate",
                entityId: estimate.id,
                description: `Estimate ${estimate.estimateNumber} auto-matched and marked as completed`,
              });
            }
          }

          if (generatedReceipt) matchedDocuments.receipts.push({
            id: generatedReceipt.id,
            number: generatedReceipt.receiptNumber,
            status: 'created',
          });

          await db.logActivity({
            userId: ctx.user.id,
            action: "receipt_auto_created",
            entityType: "receipt",
            entityId: generatedReceipt?.id,
            description: `Receipt automatically created for payment ${paymentId}`,
          });
        }

        await db.logActivity({
          userId: ctx.user.id,
          action: "payment_recorded",
          entityType: "payment",
          entityId: paymentId,
          description: `Recorded payment of Ksh ${input.amount / 100} for invoice ${invoice.invoiceNumber}`,
        });

        // Send notification
        await sendPaymentNotification(database, ctx.user.id, "recorded", input.amount, invoice.invoiceNumber, paymentId);

        const referenceNumber = input.referenceNumber ?? (invoice as any).referenceNumber ?? "See receipt";

        // Trigger payment notification workflow and email
        try {
          const client = (await database.select().from(clients).where(eq(clients.id, invoice.clientId)).limit(1))[0];
          const receipt = (await database.select().from(receipts).where(eq(receipts.paymentId, paymentId)).limit(1))[0];
          if (client?.email && receipt) await triggerEventNotification({
            userId: ctx.user.id,
            eventType: "payment_received",
            recipientEmail: client.email,
            recipientName: client.contactPerson || client.companyName || "Client",
            subject: `Payment Received - Invoice ${invoice.invoiceNumber}`,
            htmlContent: `<p>Thank you. Your payment for invoice ${invoice.invoiceNumber} has been received.</p>`,
            templateId: "payment_received",
            templateContext: {
              organizationId: ctx.user.organizationId,
              recipient_name: client.contactPerson || client.companyName || "Client",
              amount_paid: `KES ${(input.amount / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`,
              payment_date: input.paymentDate instanceof Date ? input.paymentDate.toLocaleDateString() : new Date(input.paymentDate).toLocaleDateString(),
              payment_method: paymentData.paymentMethod,
              transaction_reference: referenceNumber || "See receipt",
              invoice_number: invoice.invoiceNumber,
              receipt_pdf_filename: `receipt-${receipt.receiptNumber}.pdf`,
              receipt_url: `/invoices/${input.invoiceId}`,
            },
            entityType: "payment",
            entityId: paymentId,
            actionUrl: `/invoices/${input.invoiceId}`,
            attachments: [{ filename: `receipt-${receipt.receiptNumber}.pdf`, content: await generateReceiptPDF(receipt.id), contentType: "application/pdf" }],
          });
        } catch (err) {
          console.error("Failed to send payment received email:", err);
        }

        try {
          await workflowTriggerEngine.trigger({
            triggerType: "payment_received",
            entityType: "payment",
            entityId: paymentId,
            data: {
              paymentId,
              invoiceId: input.invoiceId,
              amount: input.amount,
              referenceNumber,
              invoiceStatus,
            },
            userId: ctx.user.id,
          });
        } catch (err) {
          console.error("Workflow trigger (payment_received) failed:", err);
        }

        if (isPaid) {
          try {
            await workflowTriggerEngine.trigger({
              triggerType: "invoice_paid",
              entityType: "invoice",
              entityId: invoice.id,
              data: {
                invoiceId: invoice.id,
                invoiceNumber: invoice.invoiceNumber,
                paidAmount: newPaidAmount,
              },
              userId: ctx.user.id,
            });
          } catch (err) {
            console.error("Workflow trigger (invoice_paid) failed:", err);
          }
        }

        return {
          paymentId,
          matchedDocuments,
          message: "Payment recorded and documents matched successfully",
        };
      } catch (error: any) {
        console.error("Error recording payment:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to record payment: ${error.message}`,
        });
      }
    }),
});
