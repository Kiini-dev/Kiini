import { router, protectedProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { getDb, getPool } from "../db";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";
import { generateNextDocumentNumber } from "../utils/document-numbering";

/** Execute raw SQL via mysql2 pool. Returns the rows array. */
async function rawQuery(query: string, params?: any[]): Promise<any[]> {
  const pool = getPool();
  if (!pool) throw new Error("Database pool not available");
  const [rows] = await pool.execute(query, params ?? []);
  return rows as any[];
}

// Feature-based procedures
const readProcedure = createFeatureRestrictedProcedure("procurement:read");
const writeProcedure = createFeatureRestrictedProcedure("procurement:write");

/**
 * Comprehensive Procurement Router
 * Handles LPOs, Purchase Orders, Imprests, and related operations
 * with full CRUD, status management, and approval workflows
 */

// ============================================================================
// SCHEMAS
// ============================================================================

const lpoCreateSchema = z.object({
  vendorName: z.string().min(1).optional(),
  vendorId: z.string().optional(),
  lpoNumber: z.string().optional(),
  description: z.string(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    amount: z.number().positive(),
  })),
  totalAmount: z.number().positive(),
  budgetLine: z.string().optional(),
  expectedDelivery: z.string().optional(),
  terms: z.string().optional(),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected']).default('draft'),
});

const orderCreateSchema = z.object({
  orderNumber: z.string().optional(),
  supplierId: z.string().optional(),
  supplierName: z.string().optional(),
  description: z.string(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
    amount: z.number().positive(),
  })),
  totalAmount: z.number().positive(),
  deliveryAddress: z.string(),
  expectedDelivery: z.string().optional(),
  paymentTerms: z.string().optional(),
  status: z.enum(['draft', 'sent', 'confirmed', 'delivered', 'invoiced']).default('draft'),
});

const imprestCreateSchema = z.object({
  employeeId: z.string(),
  employeeName: z.string(),
  purpose: z.string(),
  amount: z.number().positive(),
  justification: z.string().optional(),
  expectedReturnDate: z.string().optional(),
  status: z.enum(['requested', 'approved', 'rejected', 'issued', 'surrendered']).default('requested'),
});

const budgetUpdateSchema = z.object({
  budgetName: z.string(),
  amount: z.number().positive(),
  departmentId: z.string(),
  fiscalYear: z.number(),
  description: z.string().optional(),
  status: z.enum(['draft', 'active', 'inactive', 'closed']).optional(),
});

// ============================================================================
// UTILITIES
// ============================================================================

async function generateLPONumber(): Promise<string> {
  return generateNextDocumentNumber(await getDb(), "lpo");
}

async function generateOrderNumber(): Promise<string> {
  return generateNextDocumentNumber(await getDb(), "purchase_order");
}

// ============================================================================
// ROUTER
// ============================================================================

export const procurementRouter = router({
  // ====== LPO OPERATIONS ======

  lpoList: readProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.string().optional(),
      vendorId: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ input = {} }) => {
      try {
        let query = `SELECT * FROM lpos WHERE 1=1`;
        const params: any[] = [];
        
        if (input.search) {
          query += ` AND (lpoNumber LIKE ? OR vendorName LIKE ? OR description LIKE ?)`;
          const search = `%${input.search}%`;
          params.push(search, search, search);
        }
        if (input.status) {
          query += ` AND status = ?`;
          params.push(input.status);
        }
        if (input.vendorId) {
          query += ` AND vendorId = ?`;
          params.push(input.vendorId);
        }
        
        query += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
        params.push(input.limit, input.offset);
        
        return await rawQuery(query, params) || [];
      } catch (error) {
        console.error("LPO list error:", error);
        return [];
      }
    }),

  lpoGetById: readProcedure
    .input(z.string())
    .query(async ({ input }) => {
      try {
        const result = await rawQuery(
          `SELECT * FROM lpos WHERE id = ? LIMIT 1`,
          [input]
        );
        return result?.[0] || null;
      } catch (error) {
        console.error("LPO getById error:", error);
        return null;
      }
    }),

  lpoCreate: writeProcedure
    .input(lpoCreateSchema)
    .mutation(async ({ input, ctx }) => {
      
      try {
        const id = uuidv4();
        const lpoNumber = await generateLPONumber();
        const now = new Date().toISOString();

        const vendorName = input.vendorName || input.vendorId || "Custom Supplier";
        const vendorId = input.vendorId || vendorName;

        await rawQuery(
          `INSERT INTO lpos (id, lpoNumber, vendorName, vendorId, description, items, totalAmount, budgetLine, expectedDelivery, terms, status, createdBy, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id, lpoNumber, vendorName, vendorId, input.description,
            JSON.stringify(input.items), input.totalAmount, input.budgetLine || null,
            input.expectedDelivery || null, input.terms || null, input.status,
            ctx.user?.id || 'system', now, now
          ]
        );

        // Log activity
        await rawQuery(
          `INSERT INTO activity_logs (id, userId, action, entityType, entityId, description, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), ctx.user?.id || 'system', 'CREATE_LPO', 'LPO', id, `Created LPO ${lpoNumber}`, now]
        );

        return { id, lpoNumber, success: true };
      } catch (error) {
        console.error("LPO create error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create LPO" });
      }
    }),

  lpoUpdate: writeProcedure
    .input(z.object({
      id: z.string(),
      vendorName: z.string().optional(),
      description: z.string().optional(),
      items: z.array(z.object({
        description: z.string(),
        quantity: z.number().positive(),
        unitPrice: z.number().positive(),
        amount: z.number().positive(),
      })).optional(),
      totalAmount: z.number().positive().optional(),
      status: z.enum(['draft', 'submitted', 'approved', 'rejected']).optional(),
      expectedDelivery: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      
      try {
        const now = new Date().toISOString();
        const updates: any[] = [];
        const values: any[] = [];

        if (input.vendorName) { updates.push('vendorName = ?'); values.push(input.vendorName); }
        if (input.description) { updates.push('description = ?'); values.push(input.description); }
        if (input.items) { updates.push('items = ?'); values.push(JSON.stringify(input.items)); }
        if (input.totalAmount) { updates.push('totalAmount = ?'); values.push(input.totalAmount); }
        if (input.status) { updates.push('status = ?'); values.push(input.status); }
        if (input.expectedDelivery) { updates.push('expectedDelivery = ?'); values.push(input.expectedDelivery); }

        updates.push('updatedAt = ?');
        values.push(now);
        values.push(input.id);

        await rawQuery(
          `UPDATE lpos SET ${updates.join(', ')} WHERE id = ?`,
          values
        );

        // Log activity
        await rawQuery(
          `INSERT INTO activity_logs (id, userId, action, entityType, entityId, description, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), ctx.user?.id || 'system', 'UPDATE_LPO', 'LPO', input.id, `Updated LPO ${input.id}`, now]
        );

        return { success: true };
      } catch (error) {
        console.error("LPO update error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update LPO" });
      }
    }),

  lpoDelete: writeProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      
      try {
        const now = new Date().toISOString();
        await rawQuery(`DELETE FROM lpos WHERE id = ?`, [input]);
        
        await rawQuery(
          `INSERT INTO activity_logs (id, userId, action, entityType, entityId, description, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), ctx.user?.id || 'system', 'DELETE_LPO', 'LPO', input, `Deleted LPO`, now]
        );

        return { success: true };
      } catch (error) {
        console.error("LPO delete error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete LPO" });
      }
    }),

  // ====== PURCHASE ORDER OPERATIONS ======

  orderList: readProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.string().optional(),
      supplierId: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ input = {}, ctx }) => {
      try {
        let query = `SELECT * FROM purchase_orders WHERE 1=1`;
        const params: any[] = [];
        if (ctx.user?.organizationId) {
          query += ` AND createdBy IN (SELECT id FROM users WHERE organizationId = ?)`;
          params.push(ctx.user.organizationId);
        }
        
        if (input.search) {
          query += ` AND (orderNumber LIKE ? OR supplierName LIKE ? OR description LIKE ?)`;
          const search = `%${input.search}%`;
          params.push(search, search, search);
        }
        if (input.status) {
          query += ` AND status = ?`;
          params.push(input.status);
        }
        if (input.supplierId) {
          query += ` AND supplierId = ?`;
          params.push(input.supplierId);
        }
        
        query += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
        params.push(input.limit, input.offset);
        
        return await rawQuery(query, params) || [];
      } catch (error) {
        console.error("Order list error:", error);
        return [];
      }
    }),

  orderGetById: readProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      try {
        const scope = ctx.user?.organizationId ? ` AND createdBy IN (SELECT id FROM users WHERE organizationId = ?)` : "";
        const params = ctx.user?.organizationId ? [input, ctx.user.organizationId] : [input];
        const result = await rawQuery(
          `SELECT * FROM purchase_orders WHERE id = ?${scope} LIMIT 1`,
          params
        );
        return result?.[0] || null;
      } catch (error) {
        console.error("Order getById error:", error);
        return null;
      }
    }),

  orderCreate: writeProcedure
    .input(orderCreateSchema)
    .mutation(async ({ input, ctx }) => {
      
      try {
        const id = uuidv4();
        const orderNumber = await generateOrderNumber();
        const now = new Date().toISOString();

        const resolvedSupplierId = input.supplierId || input.supplierName || "custom-supplier";
        const resolvedSupplierName = input.supplierName || input.supplierId || "Custom Supplier";

        await rawQuery(
          `INSERT INTO purchase_orders (id, orderNumber, supplierId, supplierName, description, items, totalAmount, deliveryAddress, expectedDelivery, paymentTerms, status, createdBy, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id, orderNumber, resolvedSupplierId, resolvedSupplierName, input.description,
            JSON.stringify(input.items), input.totalAmount, input.deliveryAddress,
            input.expectedDelivery || null, input.paymentTerms || null, input.status,
            ctx.user?.id || 'system', now, now
          ]
        );

        // Log activity
        await rawQuery(
          `INSERT INTO activity_logs (id, userId, action, entityType, entityId, description, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), ctx.user?.id || 'system', 'CREATE_ORDER', 'PurchaseOrder', id, `Created Order ${orderNumber}`, now]
        );

        return { id, orderNumber, success: true };
      } catch (error) {
        console.error("Order create error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create order" });
      }
    }),

  orderUpdate: writeProcedure
    .input(z.object({
      id: z.string(),
      supplierName: z.string().optional(),
      description: z.string().optional(),
      items: z.array(z.object({
        description: z.string(),
        quantity: z.number().positive(),
        unitPrice: z.number().positive(),
        amount: z.number().positive(),
      })).optional(),
      totalAmount: z.number().positive().optional(),
      status: z.enum(['draft', 'sent', 'confirmed', 'delivered', 'invoiced']).optional(),
      expectedDelivery: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      
      try {
        const now = new Date().toISOString();
        const updates: any[] = [];
        const values: any[] = [];

        if (input.supplierName) { updates.push('supplierName = ?'); values.push(input.supplierName); }
        if (input.description) { updates.push('description = ?'); values.push(input.description); }
        if (input.items) { updates.push('items = ?'); values.push(JSON.stringify(input.items)); }
        if (input.totalAmount) { updates.push('totalAmount = ?'); values.push(input.totalAmount); }
        if (input.status) { updates.push('status = ?'); values.push(input.status); }
        if (input.expectedDelivery) { updates.push('expectedDelivery = ?'); values.push(input.expectedDelivery); }

        updates.push('updatedAt = ?');
        values.push(now);
        values.push(input.id);
        if (ctx.user?.organizationId) {
          values.push(ctx.user.organizationId);
        }

        await rawQuery(
          `UPDATE purchase_orders SET ${updates.join(', ')} WHERE id = ?${ctx.user?.organizationId ? " AND createdBy IN (SELECT id FROM users WHERE organizationId = ?)" : ""}`,
          values
        );

        // Log activity
        await rawQuery(
          `INSERT INTO activity_logs (id, userId, action, entityType, entityId, description, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), ctx.user?.id || 'system', 'UPDATE_ORDER', 'PurchaseOrder', input.id, `Updated Order`, now]
        );

        return { success: true };
      } catch (error) {
        console.error("Order update error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update order" });
      }
    }),

  orderDelete: writeProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      
      try {
        const now = new Date().toISOString();
        const params = ctx.user?.organizationId ? [input, ctx.user.organizationId] : [input];
        await rawQuery(`DELETE FROM purchase_orders WHERE id = ?${ctx.user?.organizationId ? " AND createdBy IN (SELECT id FROM users WHERE organizationId = ?)" : ""}`, params);
        
        await rawQuery(
          `INSERT INTO activity_logs (id, userId, action, entityType, entityId, description, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), ctx.user?.id || 'system', 'DELETE_ORDER', 'PurchaseOrder', input, `Deleted Order`, now]
        );

        return { success: true };
      } catch (error) {
        console.error("Order delete error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete order" });
      }
    }),

  // ====== IMPREST OPERATIONS ======

  imprestList: readProcedure
    .input(z.object({
      search: z.string().optional(),
      status: z.string().optional(),
      employeeId: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ input = {} }) => {
      try {
        let query = `SELECT * FROM imprests WHERE 1=1`;
        const params: any[] = [];
        
        if (input.search) {
          query += ` AND (imprestNumber LIKE ? OR employeeName LIKE ? OR purpose LIKE ?)`;
          const search = `%${input.search}%`;
          params.push(search, search, search);
        }
        if (input.status) {
          query += ` AND status = ?`;
          params.push(input.status);
        }
        if (input.employeeId) {
          query += ` AND employeeId = ?`;
          params.push(input.employeeId);
        }
        
        query += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
        params.push(input.limit, input.offset);
        
        return await rawQuery(query, params) || [];
      } catch (error) {
        console.error("Imprest list error:", error);
        return [];
      }
    }),

  imprestCreate: writeProcedure
    .input(imprestCreateSchema)
    .mutation(async ({ input, ctx }) => {
      
      try {
        const id = uuidv4();
        const now = new Date().toISOString();
        const imprestNumber = `IMP-${String(Date.now()).slice(-6)}`;

        await rawQuery(
          `INSERT INTO imprests (id, imprestNumber, employeeId, employeeName, purpose, amount, justification, expectedReturnDate, status, createdBy, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id, imprestNumber, input.employeeId, input.employeeName, input.purpose,
            input.amount, input.justification || null, input.expectedReturnDate || null,
            input.status, ctx.user?.id || 'system', now, now
          ]
        );

        // Log activity
        await rawQuery(
          `INSERT INTO activity_logs (id, userId, action, entityType, entityId, description, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), ctx.user?.id || 'system', 'CREATE_IMPREST', 'Imprest', id, `Created Imprest ${imprestNumber}`, now]
        );

        return { id, imprestNumber, success: true };
      } catch (error) {
        console.error("Imprest create error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create imprest" });
      }
    }),

  imprestUpdate: writeProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['requested', 'approved', 'rejected', 'issued', 'surrendered']).optional(),
      amount: z.number().positive().optional(),
      purpose: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      
      try {
        const now = new Date().toISOString();
        const updates: any[] = [];
        const values: any[] = [];

        if (input.status) { updates.push('status = ?'); values.push(input.status); }
        if (input.amount) { updates.push('amount = ?'); values.push(input.amount); }
        if (input.purpose) { updates.push('purpose = ?'); values.push(input.purpose); }

        updates.push('updatedAt = ?');
        values.push(now);
        values.push(input.id);

        await rawQuery(
          `UPDATE imprests SET ${updates.join(', ')} WHERE id = ?`,
          values
        );

        // Log activity
        await rawQuery(
          `INSERT INTO activity_logs (id, userId, action, entityType, entityId, description, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [uuidv4(), ctx.user?.id || 'system', 'UPDATE_IMPREST', 'Imprest', input.id, `Updated Imprest status to ${input.status}`, now]
        );

        return { success: true };
      } catch (error) {
        console.error("Imprest update error:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update imprest" });
      }
    }),
});
