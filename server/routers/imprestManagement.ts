import { router, protectedProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { getDb } from "../db";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

/**
 * Imprest Management Router
 * Handles petty cash and imprest requests/surrenders
 * Common in African organizations for employee advances
 */

const viewProcedure = createFeatureRestrictedProcedure("accounting:imprests:view");
const createProcedure = createFeatureRestrictedProcedure("accounting:imprests:create");
const approveProcedure = createFeatureRestrictedProcedure("accounting:imprests:approve");
const settleProcedure = createFeatureRestrictedProcedure("accounting:imprests:settle");

interface ImprestRequest {
  id: string;
  imprestNumber: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  purpose: string;
  requestDate: string;
  status: "pending" | "approved" | "disbursed" | "settled" | "cancelled";
  approvedBy?: string;
  approvedAt?: string;
  disbursedAt?: string;
}

export const imprestsRouter = router({
  list: viewProcedure
    .input(z.object({
      limit: z.number().optional(),
      offset: z.number().optional(),
      status: z.string().optional(),
      employeeId: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const orgId = ctx.user.organizationId;
        const conditions = [];
        
        if (orgId) conditions.push(eq("imprests.organizationId" as any, orgId));
        if (input?.status) conditions.push(eq("imprests.status" as any, input.status));
        if (input?.employeeId) conditions.push(eq("imprests.employeeId" as any, input.employeeId));

        const where = conditions.length > 0 ? and(...conditions) : undefined;
        
        return await (db.select().from("imprests" as any)
          .where(where as any)
          .orderBy(desc("imprests.createdAt" as any))
          .limit(input?.limit || 50)
          .offset(input?.offset || 0) as any);
      } catch (error) {
        console.error("Error listing imprests:", error);
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
          ? and(eq("imprests.id" as any, input), eq("imprests.organizationId" as any, orgId))
          : eq("imprests.id" as any, input);

        const result = await (db.select().from("imprests" as any).where(where as any) as any).limit(1);
        return result[0] || null;
      } catch (error) {
        console.error("Error fetching imprest:", error);
        return null;
      }
    }),

  create: createProcedure
    .input(z.object({
      employeeId: z.string(),
      employeeName: z.string(),
      amount: z.number().positive(),
      purpose: z.string(),
      requestDate: z.coerce.date(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      try {
        const id = uuidv4();
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const imprestNumber = `IMP-${new Date().getFullYear()}-${String(Math.random() * 10000).padStart(6, '0')}`;

        await database.insert("imprests" as any).values({
          id,
          organizationId: ctx.user.organizationId ?? null,
          imprestNumber,
          employeeId: input.employeeId,
          employeeName: input.employeeName,
          amount: input.amount,
          purpose: input.purpose,
          requestDate: typeof input.requestDate === 'string'
            ? new Date(input.requestDate).toISOString().replace('T', ' ').substring(0, 19)
            : input.requestDate.toISOString().replace('T', ' ').substring(0, 19),
          status: "pending",
          notes: input.notes || null,
          createdBy: ctx.user.id,
          createdAt: now,
          updatedAt: now,
        });

        await db.logActivity({
          userId: ctx.user.id,
          action: "imprest_requested",
          entityType: "imprest",
          entityId: id,
          description: `Imprest request ${imprestNumber} for Ksh ${input.amount} by ${input.employeeName}`,
        });

        return { id, imprestNumber };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to create imprest: ${error.message}`,
        });
      }
    }),

  approve: approveProcedure
    .input(z.string())
    .mutation(async ({ input: imprestId, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      try {
        const result = await (database.select().from("imprests" as any).where(eq("imprests.id" as any, imprestId)) as any).limit(1);
        if (!result.length) throw new Error("Imprest not found");

        const imprest = result[0];
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

        await database.update("imprests" as any).set({
          status: "approved",
          approvedBy: ctx.user.id,
          approvedAt: now,
          updatedAt: now,
        }).where(eq("imprests.id" as any, imprestId));

        await db.logActivity({
          userId: ctx.user.id,
          action: "imprest_approved",
          entityType: "imprest",
          entityId: imprestId,
          description: `Approved imprest ${imprest.imprestNumber} for Ksh ${imprest.amount}`,
        });

        return { success: true, imprestId };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to approve imprest: ${error.message}`,
        });
      }
    }),

  // Settle imprest with expense submission
  settleImprest: settleProcedure
    .input(z.object({
      imprestId: z.string(),
      expenses: z.array(z.object({
        description: z.string(),
        amount: z.number(),
        receipt: z.string().optional(),
      })),
      returnedAmount: z.number().default(0),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      try {
        const result = await (database.select().from("imprests" as any).where(eq("imprests.id" as any, input.imprestId)) as any).limit(1);
        if (!result.length) throw new Error("Imprest not found");

        const imprest = result[0];
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        
        let totalExpensed = 0;
        input.expenses.forEach(exp => totalExpensed += exp.amount);

        const variance = imprest.amount - totalExpensed - input.returnedAmount;

        // Create settlement record
        const settlementId = uuidv4();
        await database.insert("imprestSurrenders" as any).values({
          id: settlementId,
          imprestId: input.imprestId,
          totalExpensed,
          variance,
          returnedAmount: input.returnedAmount,
          settledBy: ctx.user.id,
          settledAt: now,
          status: variance === 0 ? "settled" : "variance_pending",
          createdAt: now,
        });

        // Update imprest status
        await database.update("imprests" as any).set({
          status: "settled",
          settledAt: now,
          updatedAt: now,
        }).where(eq("imprests.id" as any, input.imprestId));

        await db.logActivity({
          userId: ctx.user.id,
          action: "imprest_settled",
          entityType: "imprest",
          entityId: input.imprestId,
          description: `Settled imprest ${imprest.imprestNumber}. Expenses: Ksh ${totalExpensed}, Variance: Ksh ${variance}`,
        });

        return { 
          success: true, 
          settlementId,
          totalExpensed,
          returnedAmount: input.returnedAmount,
          variance,
        };
      } catch (error: any) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to settle imprest: ${error.message}`,
        });
      }
    }),
});
