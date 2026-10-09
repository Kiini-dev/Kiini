import { protectedProcedure, router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { recurringInvoices, invoices, invoiceItems, lineItems, clientSubscriptions } from "../../drizzle/schema";
import { getDb } from "../db";
import { eq, and, lte, gte, desc, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import { applyRecurringLabel, parseRecurringOccurrenceDate } from "../utils/recurringLabels";
import { generateNextDocumentNumber } from "../utils/document-numbering";

// Define typed procedures
const readProcedure = createFeatureRestrictedProcedure("invoices:read");
const createProcedure = createFeatureRestrictedProcedure("invoices:create");
const updateProcedure = createFeatureRestrictedProcedure("invoices:update");
const deleteProcedure = createFeatureRestrictedProcedure("invoices:delete");

// Helper to convert ISO date to MySQL format
const toMySqlDateFormat = (isoString: string): string => {
  try {
    // Handle both ISO strings and already-formatted strings
    if (isoString.includes('T')) {
      return isoString.split('T')[0] + ' ' + isoString.split('T')[1].substring(0, 8);
    }
    return isoString; // Already in MySQL format
  } catch {
    return isoString; // Passthrough if conversion fails
  }
};

const createRecurringInvoiceSchema = z.object({
  clientId: z.string(),
  templateInvoiceId: z.string(),
  frequency: z.enum(["weekly", "biweekly", "monthly", "quarterly", "annually"]),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  description: z.string().optional(),
  noteToInvoice: z.string().optional(),
  accountManagerId: z.string().optional(),
});

const updateRecurringInvoiceSchema = z.object({
  id: z.string(),
  frequency: z.enum(["weekly", "biweekly", "monthly", "quarterly", "annually"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
  description: z.string().optional(),
  noteToInvoice: z.string().optional(),
  accountManagerId: z.string().optional().nullable(),
});

function parseIsoDateInput(value: string): Date {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid date value",
    });
  }
  return d;
}

// Calculate next due date based on frequency
function calculateNextDueDate(currentDate: Date, frequency: string): Date {
  const nextDate = new Date(currentDate);
  switch (frequency) {
    case "weekly":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case "biweekly":
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case "monthly":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case "quarterly":
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case "annually":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  return nextDate;
}

// Generate invoice number with date suffix
export const recurringInvoicesRouter = router({
  create: createProcedure
    .input(createRecurringInvoiceSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const db = (await getDb()) as any;
        if (!db) throw new Error("Database not available");
        // Verify template invoice exists
        const templateInvoice = await db
          .select()
          .from(invoices)
          .where(eq(invoices.id, input.templateInvoiceId))
          .limit(1);

        if (!templateInvoice.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Template invoice not found",
          });
        }

        const id = nanoid();
        const subscriptionId = nanoid();
        // Parse ISO date to Date object for calculation
        const startDateObj = parseIsoDateInput(input.startDate);
        const nextDueDate = calculateNextDueDate(startDateObj, input.frequency);

        // Convert ISO dates to MySQL format for storage
        const mysqlStartDate = toMySqlDateFormat(input.startDate);
        const mysqlEndDate = input.endDate ? toMySqlDateFormat(input.endDate) : undefined;
        const mysqlNextDueDate = toMySqlDateFormat(nextDueDate.toISOString());

        await db.insert(recurringInvoices).values({
          id,
          clientId: input.clientId,
          templateInvoiceId: input.templateInvoiceId,
          clientSubscriptionId: subscriptionId,
          frequency: input.frequency,
          startDate: mysqlStartDate,
          endDate: mysqlEndDate,
          nextDueDate: mysqlNextDueDate,
          lastGeneratedDate: null,
          isActive: 1,
          description: input.description,
          noteToInvoice: input.noteToInvoice,
          accountManagerId: input.accountManagerId || null,
          createdBy: ctx.user.id,
        });

        const [template] = templateInvoice;
        await db.insert(clientSubscriptions).values({
          id: subscriptionId,
          organizationId: ctx.user.organizationId || null,
          clientId: input.clientId,
          name: input.description || template.title || "Recurring Invoice Subscription",
          description: input.noteToInvoice || input.description || null,
          status: "active",
          frequency: input.frequency,
          amount: template.total || 0,
          currency: "KES",
          startDate: mysqlStartDate,
          endDate: mysqlEndDate || null,
          nextBillingDate: mysqlNextDueDate,
          templateInvoiceId: input.templateInvoiceId,
          recurringInvoiceId: id,
          autoSendInvoice: 1,
          totalBilled: 0,
          invoiceCount: 0,
          createdBy: ctx.user.id,
        } as any);

        return { id, success: true };
      } catch (error) {
        console.error("[RECURRING_INVOICES] Create error:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create recurring invoice",
        });
      }
    }),

  list: readProcedure
    .input(
      z.object({
        clientId: z.string().optional(),
        activeOnly: z.boolean().optional().default(true),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = (await getDb()) as any;
        if (!db) throw new Error("Database not available");
        const filters = [];
        if (input.clientId) {
          filters.push(eq(recurringInvoices.clientId, input.clientId));
        }
        if (input.activeOnly) {
          filters.push(eq(recurringInvoices.isActive, 1));
        }

        const result = await db
          .select()
          .from(recurringInvoices)
          .where(filters.length > 0 ? and(...filters) : undefined)
          .orderBy(desc(recurringInvoices.createdAt));

        const templateIds = result.map((item: any) => item.templateInvoiceId).filter(Boolean);
        const templates: any[] = templateIds.length
          ? await db.select({ id: invoices.id, total: invoices.total, title: invoices.title }).from(invoices).where(inArray(invoices.id, templateIds))
          : [];
        const templateMap = new Map(templates.map((item: any) => [item.id, item]));
        return result.map((item: any) => ({
          ...item,
          amount: templateMap.get(item.templateInvoiceId)?.total ?? 0,
          templateTitle: templateMap.get(item.templateInvoiceId)?.title ?? null,
        }));
      } catch (error) {
        console.error("[RECURRING_INVOICES] List error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch recurring invoices",
        });
      }
    }),

  getById: readProcedure
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const db = (await getDb()) as any;
        if (!db) throw new Error("Database not available");
        const result = await db
          .select()
          .from(recurringInvoices)
          .where(eq(recurringInvoices.id, input))
          .limit(1);

        if (!result.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Recurring invoice not found",
          });
        }

        const template = await db.select({ total: invoices.total, title: invoices.title }).from(invoices).where(eq(invoices.id, result[0].templateInvoiceId)).limit(1);
        return { ...result[0], amount: template[0]?.total ?? 0, templateTitle: template[0]?.title ?? null };
      } catch (error) {
        console.error("[RECURRING_INVOICES] GetById error:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch recurring invoice",
        });
      }
    }),

  update: updateProcedure
    .input(updateRecurringInvoiceSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const db = (await getDb()) as any;
        if (!db) throw new Error("Database not available");
        const { id, ...updateData } = input;

        const existing = await db
          .select()
          .from(recurringInvoices)
          .where(eq(recurringInvoices.id, id))
          .limit(1);

        if (!existing.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Recurring invoice not found",
          });
        }

        const updates: any = {
          updatedAt: toMySqlDateFormat(new Date().toISOString()),
        };

        const nextFrequency = updateData.frequency || existing[0].frequency;
        if (updateData.frequency) updates.frequency = updateData.frequency;
        if (updateData.startDate !== undefined) {
          const startDate = parseIsoDateInput(updateData.startDate);
          updates.startDate = toMySqlDateFormat(updateData.startDate);
          updates.nextDueDate = toMySqlDateFormat(calculateNextDueDate(startDate, nextFrequency).toISOString());
        } else if (updateData.frequency) {
          const nextDueDate = calculateNextDueDate(
            new Date(existing[0].nextDueDate),
            updateData.frequency
          );
          updates.nextDueDate = toMySqlDateFormat(nextDueDate.toISOString());
        }

        if (updateData.endDate !== undefined) {
          updates.endDate = updateData.endDate ? toMySqlDateFormat(updateData.endDate) : null;
        }

        if (updateData.isActive !== undefined) {
          updates.isActive = updateData.isActive ? 1 : 0;
        }

        if (updateData.description !== undefined) {
          updates.description = updateData.description;
        }

        if (updateData.noteToInvoice !== undefined) {
          updates.noteToInvoice = updateData.noteToInvoice;
        }
        if (updateData.accountManagerId !== undefined) {
          updates.accountManagerId = updateData.accountManagerId;
        }

        await db
          .update(recurringInvoices)
          .set(updates)
          .where(eq(recurringInvoices.id, id));

        if (
          updateData.frequency ||
          updateData.startDate !== undefined ||
          updateData.endDate !== undefined ||
          updateData.isActive !== undefined
        ) {
          const linked = existing[0].clientSubscriptionId;
          if (linked) {
            const subscriptionUpdates: any = {};
            if (updateData.frequency) subscriptionUpdates.frequency = updateData.frequency;
            if (updateData.frequency) subscriptionUpdates.nextBillingDate = updates.nextDueDate;
            if (updateData.startDate !== undefined) {
              subscriptionUpdates.startDate = toMySqlDateFormat(updateData.startDate);
              subscriptionUpdates.nextBillingDate = updates.nextDueDate;
            }
            if (updateData.endDate !== undefined) subscriptionUpdates.endDate = updateData.endDate ? toMySqlDateFormat(updateData.endDate) : null;
            if (updateData.isActive !== undefined) {
              subscriptionUpdates.status = updateData.isActive ? "active" : "paused";
            }
            if (Object.keys(subscriptionUpdates).length > 0) {
              await db.update(clientSubscriptions)
                .set(subscriptionUpdates)
                .where(eq(clientSubscriptions.id, linked));
            }
          }
        }

        return { success: true };
      } catch (error) {
        console.error("[RECURRING_INVOICES] Update error:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update recurring invoice",
        });
      }
    }),

  toggleActive: updateProcedure
    .input(
      z.object({
        id: z.string(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = (await getDb()) as any;
        if (!db) throw new Error("Database not available");
        await db
          .update(recurringInvoices)
          .set({
            isActive: input.isActive ? 1 : 0,
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          })
          .where(eq(recurringInvoices.id, input.id));

        return { success: true };
      } catch (error) {
        console.error("[RECURRING_INVOICES] ToggleActive error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to toggle recurring invoice status",
        });
      }
    }),

  delete: deleteProcedure.input(z.string()).mutation(async ({ input }) => {
    try {
      const db = (await getDb()) as any;
      if (!db) throw new Error("Database not available");
      await db
        .delete(recurringInvoices)
        .where(eq(recurringInvoices.id, input));

      return { success: true };
    } catch (error) {
      console.error("[RECURRING_INVOICES] Delete error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete recurring invoice",
      });
    }
  }),

  // Manually trigger an invoice generation from recurring template
  triggerGeneration: createProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      try {
        const db = (await getDb()) as any;
        if (!db) throw new Error("Database not available");
        const recurringInvoice = await db
          .select()
          .from(recurringInvoices)
          .where(eq(recurringInvoices.id, input))
          .limit(1);

        if (!recurringInvoice.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Recurring invoice not found",
          });
        }

        const template = await db
          .select()
          .from(invoices)
          .where(eq(invoices.id, recurringInvoice[0].templateInvoiceId))
          .limit(1);

        if (!template.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Template invoice not found",
          });
        }

        // Invoices store their visible items in invoiceItems; lineItems is a legacy document table.
        const templateInvoiceItems = await db
          .select()
          .from(invoiceItems)
          .where(eq(invoiceItems.invoiceId, template[0].id));

        const templateLineItems = await db
          .select()
          .from(lineItems)
          .where(
            and(
              eq(lineItems.documentId, template[0].id),
              eq(lineItems.documentType, "invoice")
            )
          );

        const newInvoiceId = nanoid();
        const newInvoiceNumber = await generateNextDocumentNumber(db, "invoice");
        const now = new Date();
        const occurrenceDate = parseRecurringOccurrenceDate(recurringInvoice[0].nextDueDate);
        const issueDate = occurrenceDate.toISOString().replace('T', ' ').substring(0, 19);
        const dueDate = calculateNextDueDate(
          occurrenceDate,
          recurringInvoice[0].frequency
        ).toISOString().replace('T', ' ').substring(0, 19);

        // Apply auto-labeling with month/year
        const { title: labeledTitle, notes: labeledNotes } = applyRecurringLabel(
          template[0].title || "Recurring Invoice",
          template[0].notes || "",
          recurringInvoice[0].noteToInvoice,
          occurrenceDate
        );

        // Create new invoice from template
        await db.insert(invoices).values({
          id: newInvoiceId,
          invoiceNumber: newInvoiceNumber,
          invoiceSequence: parseInt(newInvoiceNumber.match(/-(\d+)$/)?.[1] || "0", 10),
          clientId: recurringInvoice[0].clientId,
          recurringInvoiceId: input,
          title: labeledTitle,
          status: "draft",
          issueDate,
          dueDate,
          subtotal: template[0].subtotal,
          taxAmount: template[0].taxAmount,
          discountAmount: template[0].discountAmount,
          total: template[0].total,
          paidAmount: 0,
          createdFromRecurring: 1,
          accountManagerId: recurringInvoice[0].accountManagerId || null,
          notes: labeledNotes,
          terms: template[0].terms,
          createdBy: ctx.user.id,
        });

        // Copy invoice items so generated invoices retain the template's actual products and totals.
        if (templateInvoiceItems.length > 0) {
          await db.insert(invoiceItems).values(
            templateInvoiceItems.map((item: any) => ({
              id: nanoid(),
              invoiceId: newInvoiceId,
              itemType: item.itemType,
              itemId: item.itemId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxRate: item.taxRate,
              discountPercent: item.discountPercent,
              total: item.total,
            }))
          );
        }

        // Copy legacy line items for invoices created before invoiceItems was introduced.
        if (templateLineItems.length > 0) {
          await db.insert(lineItems).values(
            templateLineItems.map((item: any) => ({
              id: nanoid(),
              documentId: newInvoiceId,
              documentType: "invoice" as const,
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.amount,
              productId: item.productId,
              serviceId: item.serviceId,
              taxRate: item.taxRate,
              taxAmount: item.taxAmount,
              lineNumber: item.lineNumber,
              createdBy: ctx.user.id,
            }))
          );
        }

        // Update recurring invoice's nextDueDate and lastGeneratedDate
        const nextDueDate = calculateNextDueDate(occurrenceDate, recurringInvoice[0].frequency);
        await db
          .update(recurringInvoices)
          .set({
            nextDueDate: nextDueDate.toISOString().replace('T', ' ').substring(0, 19),
            lastGeneratedDate: now.toISOString().replace('T', ' ').substring(0, 19),
            updatedAt: now.toISOString().replace('T', ' ').substring(0, 19),
          })
          .where(eq(recurringInvoices.id, input));

        return {
          success: true,
          invoiceId: newInvoiceId,
          invoiceNumber: newInvoiceNumber,
        };
      } catch (error) {
        console.error("[RECURRING_INVOICES] TriggerGeneration error:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate invoice from recurring template",
        });
      }
    }),
});

export type RecurringInvoicesRouter = typeof recurringInvoicesRouter;
