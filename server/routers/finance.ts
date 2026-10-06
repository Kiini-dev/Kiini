import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { journalEntryReconciliations } from "../../drizzle/schema-extended";
import { receipts } from "../../drizzle/schema";
import { eq, like, desc } from "drizzle-orm";
import * as dbHelpers from "../db";
import { queueEmail } from "../services/emailService";
import { v4 as uuidv4 } from "uuid";

/**
 * Simple finance utilities: account mapping and reconciliation.
 * Mappings are stored as settings using keys:
 *   vendor_{vendorId}_expenseAccount
 *   vendor_{vendorId}_payableAccount
 * Falling back to general settings defaultExpenseAccount and accountsPayableAccount.
 */
export const financeRouter = router({
  setVendorAccounts: createFeatureRestrictedProcedure("finance:manage")
    .input(z.object({ vendorId: z.string(), expenseAccountId: z.string(), payableAccountId: z.string() }))
    .mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("DB not available");
      await dbHelpers.setSetting(`vendor_${input.vendorId}_expenseAccount`, input.expenseAccountId, 'accounting');
      await dbHelpers.setSetting(`vendor_${input.vendorId}_payableAccount`, input.payableAccountId, 'accounting');
      return { success: true };
    }),

  getVendorAccounts: createFeatureRestrictedProcedure("finance:read")
    .input(z.string()) // vendorId
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return { expense: null, payable: null };
      const exp = await dbHelpers.getSetting(`vendor_${input}_expenseAccount`);
      const pay = await dbHelpers.getSetting(`vendor_${input}_payableAccount`);
      return { expense: exp?.value || null, payable: pay?.value || null };
    }),

  reconcileEntry: createFeatureRestrictedProcedure("finance:reconcile")
    .input(z.object({ journalEntryId: z.string(), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("DB not available");
      const id = uuidv4();
      await database.insert(journalEntryReconciliations).values({
        id,
        journalEntryId: input.journalEntryId,
        reconciledBy: ctx.user.id,
        notes: input.notes || null,
      } as any);
      await dbHelpers.logActivity({ userId: ctx.user.id, action: 'entry_reconciled', entityType: 'journalEntry', entityId: input.journalEntryId, description: input.notes || '' });
      return { id };
    }),

  listReconciliations: createFeatureRestrictedProcedure("finance:read")
    .input(z.object({ journalEntryId: z.string().optional(), notesSearch: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];
      let q: any = database.select().from(journalEntryReconciliations);
      if (input?.journalEntryId) q = q.where(eq(journalEntryReconciliations.journalEntryId, input.journalEntryId));
      if (input?.notesSearch) q = q.where(like(journalEntryReconciliations.notes, `%${input.notesSearch}%`));
      return await q;
    }),

  exportReconciliations: createFeatureRestrictedProcedure("finance:export")
    .input(z.object({ journalEntryId: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return [];
      let q: any = database.select().from(journalEntryReconciliations);
      if (input?.journalEntryId) q = q.where(eq(journalEntryReconciliations.journalEntryId, input.journalEntryId));
      const rows = await q;
      // convert to CSV-like array of objects
      return rows.map((r: any) => ({
        id: r.id,
        journalEntryId: r.journalEntryId,
        reconciledBy: r.reconciledBy,
        reconciledAt: r.reconciledAt,
        notes: r.notes,
      }));
    }),

  updateReconciliation: createFeatureRestrictedProcedure("finance:reconcile")
    .input(z.object({ id: z.string(), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("DB not available");
      await database.update(journalEntryReconciliations)
        .set({ notes: input.notes || null })
        .where(eq(journalEntryReconciliations.id, input.id));
      await dbHelpers.logActivity({ userId: ctx.user.id, action: 'entry_reconciliation_updated', entityType: 'journalEntry', entityId: input.id, description: input.notes || '' });
      return { success: true };
    }),

  undoReconciliation: createFeatureRestrictedProcedure("finance:reconcile")
    .input(z.string()) // reconciliation id
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("DB not available");
      await database.delete(journalEntryReconciliations).where(eq(journalEntryReconciliations.id, input));
      await dbHelpers.logActivity({ userId: ctx.user.id, action: 'entry_reconciliation_undone', entityType: 'journalEntry', entityId: input, description: '' });
      return { success: true };
    }),

  // placeholder export function for accounting software integration
  exportVendorAccounts: createFeatureRestrictedProcedure("finance:export")
    .query(async () => {
      const database = await getDb();
      if (!database) return [];
      const settings = await dbHelpers.getSettingsByCategory('accounting');
      return settings.filter((s: any) => s.key.startsWith('vendor_'));
    }),

  autoPostFromModule: createFeatureRestrictedProcedure("finance:manage")
    .input(z.object({ module: z.string(), recordId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // placeholder: when another module wants to create a journal entry automatically
      const database = await getDb();
      if (!database) throw new Error('DB not ready');
      // real implementation would look at module and recordId and generate appropriate entry
      await dbHelpers.logActivity({ userId: ctx.user.id, action: 'auto_post', entityType: input.module, entityId: input.recordId, description: '' });
      return { success: true };
    }),

  // retrieve default account IDs stored in settings
  getDefaults: createFeatureRestrictedProcedure("finance:read")
    .query(async () => {
      const database = await getDb();
      if (!database) return { expense: null, payable: null };
      const exp = await dbHelpers.getDefaultSetting('accounting', 'defaultExpenseAccount');
      const pay = await dbHelpers.getDefaultSetting('accounting', 'accountsPayableAccount');
      return { expense: exp?.value || null, payable: pay?.value || null };
    }),

  // list all vendor-specific account mappings in the accounting category
  listVendorAccounts: createFeatureRestrictedProcedure("finance:read")
    .query(async () => {
      const database = await getDb();
      if (!database) return [];
      // use settings by category helper if available
      const settings = await dbHelpers.getSettingsByCategory('accounting');
      const result: Array<{ vendorId: string; expense: string | null; payable: string | null }> = [];
      const map: Record<string, { expense?: string; payable?: string }> = {};
      settings.forEach((s: any) => {
        if (s.key.startsWith('vendor_')) {
          const m = s.key.match(/^vendor_(.+?)_(expense|payable)Account$/);
          if (m) {
            const vid = m[1];
            const type = m[2];
            map[vid] = map[vid] || {};
            map[vid][type === 'expense' ? 'expense' : 'payable'] = s.value;
          }
        }
      });
      Object.entries(map).forEach(([vid, v]) => {
        result.push({ vendorId: vid, expense: v.expense || null, payable: v.payable || null });
      });
      return result;
    }),

  /**
   * AUTO-GENERATE RECEIPT: Called when invoice is marked as PAID
   * Creates receipt immediately and notifies customer
   */
  generateReceiptFromInvoice: createFeatureRestrictedProcedure("finance:manage")
    .input(z.string()) // invoiceId
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("DB not available");

        // Get invoice
        const invoice = await dbHelpers.getInvoice(input);
        if (!invoice) {
          throw new Error("Invoice not found");
        }

        const receipt = await dbHelpers.createReceiptFromInvoice(input, { paymentMethod: "other" });
        if (!receipt) throw new Error("Receipt could not be generated");
        const receiptId = receipt.id;
        const receiptNumber = receipt.receiptNumber;

        // Log activity
        await dbHelpers.logActivity({
          userId: "system",
          action: "receipt_auto_generated",
          entityType: "receipt",
          entityId: receiptId,
          description: `Receipt #${receiptNumber} automatically generated for Invoice #${(invoice as any).invoiceNumber}`,
        });

        // Queue email notification (async)
        try {
          await queueEmail({
            toEmail: (invoice as any).clientEmail || process.env.COMPANY_EMAIL || "",
            subject: `Receipt #${receiptNumber} - Payment Confirmation`,
            plainTextContent: `Your payment has been received successfully. Receipt #${receiptNumber}.`,
            relatedEntityType: "receipt",
            relatedEntityId: receiptId,
          });
        } catch (emailError) {
          console.warn("[Finance] Email queue warning:", emailError);
        }

        return {
          success: true,
          receipt,
          message: "Receipt generated and customer notified",
        };
      } catch (error: any) {
        console.error("[Finance] Generate receipt error:", error);
        throw new Error(error?.message || "Failed to generate receipt");
      }
    }),

  /**
   * Get all receipts for a client
   */
  getClientReceipts: createFeatureRestrictedProcedure("finance:read")
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const database = await getDb();
        if (!database) return { receipts: [], total: 0, success: true };

        const user = await dbHelpers.getUserById(ctx.user.id);
        if (!user?.clientId) {
          return { receipts: [], total: 0, success: true };
        }

        const receiptRows = await database.select().from(receipts)
          .where(eq(receipts.clientId, user.clientId))
          .orderBy(desc(receipts.createdAt))
          .limit(input.limit)
          .offset(input.offset);
        const totalRows = await database.select({ id: receipts.id }).from(receipts)
          .where(eq(receipts.clientId, user.clientId));

        return {
          success: true,
          receipts: receiptRows,
          total: totalRows.length,
          page: Math.ceil(input.offset / input.limit) + 1,
          pageSize: input.limit,
        };
      } catch (error: any) {
        console.error("[Finance] Get receipts error:", error);
        return {
          success: false,
          receipts: [],
          total: 0,
          error: error?.message,
        };
      }
    }),

  /**
   * Download receipt as PDF
   */
  downloadReceiptPDF: createFeatureRestrictedProcedure("finance:read")
    .input(z.string()) // receiptId
    .mutation(async ({ input, ctx }) => {
      try {
        const database = await getDb();
        if (!database) throw new Error("DB not available");

        const receiptRows = await database.select().from(receipts)
          .where(eq(receipts.id, input)).limit(1);
        const receipt = receiptRows[0];
        if (!receipt) {
          throw new Error("Receipt not found");
        }

        // Log activity
        await dbHelpers.logActivity({
          userId: ctx.user.id,
          action: "receipt_downloaded",
          entityType: "receipt",
          entityId: input,
          description: `Receipt #${(receipt as any).receiptNumber} downloaded as PDF`,
        });

        return {
          success: true,
          receipt,
          downloadUrl: `/api/receipts/${input}/pdf`,
        };
      } catch (error: any) {
        console.error("[Finance] Download receipt error:", error);
        throw new Error(error?.message || "Failed to download receipt");
      }
    }),
});