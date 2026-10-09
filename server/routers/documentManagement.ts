/**
 * Document Management Router
 * 
 * Handles document preview, bulk operations, and line items
 */

import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb } from "../db";
import {
  invoices,
  receipts,
  estimates,
  lineItems,
  clients,
  documents,
} from "../../drizzle/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";

export const documentManagementRouter = router({
  /**
   * Get invoice with line items
   */
  getInvoiceWithLineItems: createFeatureRestrictedProcedure("reports:export")
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const invoice = await db
          .select()
          .from(invoices)
          .where(eq(invoices.id, input.id))
          .limit(1);

        if (!invoice.length) return null;

        const items = await db
          .select()
          .from(lineItems)
          .where(eq(lineItems.documentId, input.id));

        return {
          ...invoice[0],
          lineItems: items,
        };
      } catch (error) {
        console.error("Get invoice error:", error);
        return null;
      }
    }),

  /**
   * Get receipt with line items
   */
  getReceiptWithLineItems: createFeatureRestrictedProcedure("reports:export")
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const receipt = await db
          .select()
          .from(receipts)
          .where(eq(receipts.id, input.id))
          .limit(1);

        if (!receipt.length) return null;

        const items = await db
          .select()
          .from(lineItems)
          .where(eq(lineItems.documentId, input.id));

        return {
          ...receipt[0],
          lineItems: items,
        };
      } catch (error) {
        console.error("Get receipt error:", error);
        return null;
      }
    }),

  /**
   * Get estimate with line items
   */
  getEstimateWithLineItems: createFeatureRestrictedProcedure("reports:export")
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const estimate = await db
          .select()
          .from(estimates)
          .where(eq(estimates.id, input.id))
          .limit(1);

        if (!estimate.length) return null;

        const items = await db
          .select()
          .from(lineItems)
          .where(eq(lineItems.documentId, input.id));

        return {
          ...estimate[0],
          lineItems: items,
        };
      } catch (error) {
        console.error("Get estimate error:", error);
        return null;
      }
    }),



  /**
   * Get line items for a document
   */
  getLineItems: createFeatureRestrictedProcedure("reports:export")
    .input(z.object({ documentId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        const items = await db
          .select()
          .from(lineItems)
          .where(eq(lineItems.documentId, input.documentId));

        return items;
      } catch (error) {
        console.error("Get line items error:", error);
        return [];
      }
    }),

  /**
   * Create line item
   */
  createLineItem: createFeatureRestrictedProcedure("reports:export")
    .input(
      z.object({
        documentId: z.string(),
        itemDescription: z.string(),
        quantity: z.number(),
        unitPrice: z.number(),
        tax: z.number().optional(),
        unitOfMeasure: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const lineTotal = input.quantity * input.unitPrice;
        const taxAmount = input.tax ? (lineTotal * input.tax) / 100 : 0;

        const result = await db.insert(lineItems).values({
          id: `li-${Date.now()}`,
          documentId: input.documentId,
          documentType: 'invoice',
          description: input.itemDescription,
          quantity: input.quantity,
          rate: input.unitPrice,
          amount: Math.round(lineTotal + taxAmount),
          taxRate: input.tax || 0,
          taxAmount: Math.round(taxAmount),
        } as any);

        return { success: true };
      } catch (error) {
        console.error("Create line item error:", error);
        return { success: false };
      }
    }),

  /**
   * Update line item
   */
  updateLineItem: createFeatureRestrictedProcedure("reports:export")
    .input(
      z.object({
        id: z.string(),
        itemDescription: z.string().optional(),
        quantity: z.number().optional(),
        unitPrice: z.number().optional(),
        tax: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const updateData: any = {};
        if (input.itemDescription) updateData.description = input.itemDescription;
        if (input.quantity) updateData.quantity = input.quantity;
        if (input.unitPrice) updateData.unitPrice = input.unitPrice;
        if (input.tax !== undefined) updateData.taxRate = input.tax;

        // Recalculate line total if quantity or price changed
        if (input.quantity || input.unitPrice) {
          const item = await db
            .select()
            .from(lineItems)
            .where(eq(lineItems.id, input.id))
            .limit(1);

          if (item.length) {
            const qty = input.quantity || item[0].quantity;
            const price = input.unitPrice || item[0].rate;
            const tax = input.tax !== undefined ? input.tax : item[0].taxRate;
            const lineTotal = qty * price;
            const taxSafe = tax ?? 0;
            const taxAmount = (lineTotal * taxSafe) / 100;
            updateData.amount = Math.round(lineTotal + taxAmount);
            updateData.taxRate = tax;
            updateData.taxAmount = Math.round(taxAmount);
          }
        }

        await db.update(lineItems).set(updateData).where(eq(lineItems.id, input.id));

        return { success: true };
      } catch (error) {
        console.error("Update line item error:", error);
        return { success: false };
      }
    }),

  /**
   * Delete line item
   */
  deleteLineItem: createFeatureRestrictedProcedure("reports:export")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        await db.delete(lineItems).where(eq(lineItems.id, input.id));
        return { success: true };
      } catch (error) {
        console.error("Delete line item error:", error);
        return { success: false };
      }
    }),

  /**
   * Get document preview data
   */
  getDocumentPreview: createFeatureRestrictedProcedure("reports:export")
    .input(
      z.object({
        documentType: z.enum(["invoice", "receipt", "estimate"]),
        documentId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        let document: any = null;
        let items: any[] = [];

        switch (input.documentType) {
          case "invoice":
            const inv = await db
              .select()
              .from(invoices)
              .where(eq(invoices.id, input.documentId))
              .limit(1);
            if (inv.length) {
              document = inv[0];
              items = await db
                .select()
                .from(lineItems)
                .where(eq(lineItems.documentId, input.documentId));
            }
            break;

          case "receipt":
            const rec = await db
              .select()
              .from(receipts)
              .where(eq(receipts.id, input.documentId))
              .limit(1);
            if (rec.length) {
              document = rec[0];
              items = await db
                .select()
                .from(lineItems)
                .where(eq(lineItems.documentId, input.documentId));
            }
            break;

          case "estimate":
            const est = await db
              .select()
              .from(estimates)
              .where(eq(estimates.id, input.documentId))
              .limit(1);
            if (est.length) {
              document = est[0];
              items = await db
                .select()
                .from(lineItems)
                .where(eq(lineItems.documentId, input.documentId));
            }
            break;


        }

        if (!document) return null;

        // Get client info
        let clientInfo = null;
        if (document.clientId) {
          const clientData = await db
            .select()
            .from(clients)
            .where(eq(clients.id, document.clientId))
            .limit(1);
          if (clientData.length) {
            clientInfo = clientData[0];
          }
        }

        return {
          document,
          lineItems: items,
          client: clientInfo,
        };
      } catch (error) {
        console.error("Get document preview error:", error);
        return null;
      }
    }),

  /**
   * Get documents for bulk operations
   */
  getDocumentsForBulk: createFeatureRestrictedProcedure("reports:export")
    .input(
      z.object({
        documentType: z.enum(["invoice", "receipt", "estimate"]),
        ids: z.array(z.string()),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      try {
        let documents: any[] = [];

        switch (input.documentType) {
          case "invoice":
            documents = await db
              .select()
              .from(invoices)
              .where(inArray(invoices.id, input.ids));
            break;

          case "receipt":
            documents = await db
              .select()
              .from(receipts)
              .where(inArray(receipts.id, input.ids));
            break;

          case "estimate":
            documents = await db
              .select()
              .from(estimates)
              .where(inArray(estimates.id, input.ids));
            break;


        }

        return documents;
      } catch (error) {
        console.error("Get documents for bulk error:", error);
        return [];
      }
    }),

    // Client-facing helper: get documents belonging to a client (invoices/receipts/estimates)
    getClientDocuments: protectedProcedure
      .input(z.object({ clientId: z.string().optional() }).optional())
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
        try {
          const clientId = ctx.user?.role === "client"
            ? (ctx.user as any)?.clientId
            : input?.clientId || (ctx.user as any)?.clientId;
          if (!clientId) return [];
          const clientScope = [eq(clients.id, clientId)];
          if (ctx.user?.organizationId) {
            clientScope.push(eq(clients.organizationId, ctx.user.organizationId));
          } else if (ctx.user?.role !== "client") {
            clientScope.push(isNull(clients.organizationId));
          }
          const clientRows = await db.select({
            id: clients.id,
            organizationId: clients.organizationId,
          }).from(clients).where(and(...clientScope)).limit(1);
          if (!clientRows.length) return [];
          const organizationId = clientRows[0].organizationId || null;
          if (ctx.user?.role === "client" && ctx.user.organizationId && ctx.user.organizationId !== organizationId) {
            return [];
          }
          const invoiceScope = and(
            eq(invoices.clientId, clientId),
            organizationId ? eq(invoices.organizationId, organizationId) : isNull(invoices.organizationId),
          );
          const receiptScope = and(
            eq(receipts.clientId, clientId),
            organizationId ? eq(receipts.organizationId, organizationId) : isNull(receipts.organizationId),
          );
          const estimateScope = and(
            eq(estimates.clientId, clientId),
            organizationId ? eq(estimates.organizationId, organizationId) : isNull(estimates.organizationId),
          );
          const documentScope = and(
            eq(documents.linkedClientId, clientId),
            organizationId ? eq(documents.organizationId, organizationId) : isNull(documents.organizationId),
            eq(documents.status, "active"),
          );
          const [invoiceDocs, receiptDocs, estimateDocs, uploadedDocs] = await Promise.all([
            db.select().from(invoices).where(invoiceScope),
            db.select().from(receipts).where(receiptScope),
            db.select().from(estimates).where(estimateScope),
            db.select().from(documents).where(documentScope),
          ]);
          // Tag each with a documentType for client consumption
          const tagged = [
            ...invoiceDocs.map((d: any) => ({ ...d, documentType: 'invoice' })),
            ...receiptDocs.map((d: any) => ({ ...d, documentType: 'receipt' })),
            ...estimateDocs.map((d: any) => ({ ...d, documentType: 'estimate' })),
            ...uploadedDocs.map((d: any) => ({ ...d, documentType: d.documentType || 'other', isUploaded: true })),
          ];
          return tagged;
        } catch (error) {
          console.error('Get client documents error:', error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Could not load client documents" });
        }
      }),

  /**
   * Get document status workflow
   */
  getDocumentWorkflow: createFeatureRestrictedProcedure("reports:export")
    .input(
      z.object({
        documentType: z.enum(["invoice", "receipt", "estimate"]),
        documentId: z.string(),
      })
    )
    .query(async ({ input }) => {
      // Return workflow timeline based on document type and status
      const workflows: Record<string, Record<string, string[]>> = {
        invoice: {
          draft: ["draft", "sent", "paid"],
          sent: ["sent", "paid", "overdue"],
          paid: ["paid"],
          overdue: ["overdue", "paid"],
          cancelled: ["cancelled"],
        },
        receipt: {
          draft: ["draft", "issued"],
          issued: ["issued", "void"],
          void: ["void"],
          cancelled: ["cancelled"],
        },
        estimate: {
          draft: ["draft", "sent", "accepted"],
          sent: ["sent", "accepted", "rejected"],
          accepted: ["accepted"],
          rejected: ["rejected"],
          expired: ["expired"],
        },

      };

      const workflow = workflows[input.documentType] || {};
      return workflow;
    }),
});
