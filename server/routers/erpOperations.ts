import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getPool } from "../db";
import { TRPCError } from "@trpc/server";
import { v4 as uuid } from "uuid";
import { notifyPurchasingTeam } from "./purchaseOrders";

function database() {
  const pool = getPool();
  if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  return pool;
}
function org(ctx: any): string {
  return ctx.user?.organizationId || ctx.user?.orgId || "default";
}
function id(prefix: string): string { return `${prefix}_${uuid()}`; }
const idInput = z.object({ id: z.string().min(1) });

async function ensureInventorySettingsTable(): Promise<void> {
  await database().query(`
    CREATE TABLE IF NOT EXISTS inventory_settings (
      id varchar(64) NOT NULL,
      organizationId varchar(64) NOT NULL,
      valuationMethod enum('weighted_average','fifo','standard_cost') NOT NULL DEFAULT 'weighted_average',
      allowNegativeStock tinyint NOT NULL DEFAULT 0,
      updatedBy varchar(64),
      updatedAt timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY inventory_settings_org (organizationId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function ensureAccountingPeriodsTable(): Promise<void> {
  try {
    await database().query("SELECT 1 FROM accounting_periods LIMIT 1");
  } catch (error: any) {
    if (error?.code === "ER_NO_SUCH_TABLE" || /doesn't exist/i.test(error?.message || "")) {
      await database().query(`
        CREATE TABLE IF NOT EXISTS accounting_periods (
          id varchar(64) NOT NULL,
          organizationId varchar(64) NOT NULL,
          name varchar(100) NOT NULL,
          startDate date NOT NULL,
          endDate date NOT NULL,
          status enum('open','locked','closed') NOT NULL DEFAULT 'open',
          closedBy varchar(64) DEFAULT NULL,
          closedAt timestamp NULL DEFAULT NULL,
          reopenedBy varchar(64) DEFAULT NULL,
          reopenedAt timestamp NULL DEFAULT NULL,
          createdAt timestamp NULL DEFAULT CURRENT_TIMESTAMP,
          updatedAt timestamp NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          KEY period_org_dates (organizationId, startDate, endDate)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      return;
    }
    throw error;
  }
}

async function assertPostingPeriod(ctx: any, postingDate: string): Promise<void> {
  await ensureAccountingPeriodsTable();
  const [rows] = await database().query("SELECT status FROM accounting_periods WHERE organizationId=? AND startDate<=DATE(?) AND endDate>=DATE(?) LIMIT 1", [org(ctx), postingDate, postingDate]);
  const status = (rows as any[])[0]?.status;
  if (status && status !== "open") throw new TRPCError({ code: "BAD_REQUEST", message: `Accounting period is ${status}; posting is not allowed` });
}

export const erpOperationsRouter = router({
  periods: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      try {
        await ensureAccountingPeriodsTable();
        const [rows] = await database().query("SELECT * FROM accounting_periods WHERE organizationId = ? ORDER BY startDate DESC", [org(ctx)]);
        return rows;
      } catch (error: any) {
        if (error?.code === "ER_NO_SUCH_TABLE" || /doesn't exist/i.test(error?.message || "")) {
          return [];
        }
        throw error;
      }
    }),
    create: protectedProcedure.input(z.object({ name: z.string(), startDate: z.string(), endDate: z.string() })).mutation(async ({ ctx, input }) => {
      await ensureAccountingPeriodsTable();
      const periodId = id("period");
      await database().query("INSERT INTO accounting_periods (id,organizationId,name,startDate,endDate) VALUES (?,?,?,?,?)", [periodId, org(ctx), input.name, input.startDate, input.endDate]);
      return { id: periodId };
    }),
    setStatus: protectedProcedure.input(z.object({ id: z.string(), status: z.enum(["open", "locked", "closed"]) })).mutation(async ({ ctx, input }) => {
      await ensureAccountingPeriodsTable();
      const field = input.status === "closed" ? ",closedBy=?,closedAt=NOW()" : input.status === "open" ? ",reopenedBy=?,reopenedAt=NOW()" : "";
      const actor = ctx.user.id;
      await database().query(`UPDATE accounting_periods SET status=?,updatedAt=NOW()${field} WHERE id=? AND organizationId=?`, field ? [input.status, actor, input.id, org(ctx)] : [input.status, input.id, org(ctx)]);
      return { success: true };
    }),
    createAdjustment: protectedProcedure.input(z.object({ periodId: z.string(), postingDate: z.string(), description: z.string(), lines: z.array(z.object({ accountId: z.string(), debit: z.number().nonnegative().default(0), credit: z.number().nonnegative().default(0) })).min(2) })).mutation(async ({ ctx, input }) => {
      const [periodRows] = await database().query("SELECT status FROM accounting_periods WHERE id=? AND organizationId=? LIMIT 1", [input.periodId, org(ctx)]);
      if ((periodRows as any[])[0]?.status !== "open") throw new TRPCError({ code: "BAD_REQUEST", message: "Adjustments are only allowed in open accounting periods" });
      const debit = input.lines.reduce((sum, line) => sum + line.debit, 0); const credit = input.lines.reduce((sum, line) => sum + line.credit, 0);
      if (debit <= 0 || debit !== credit) throw new TRPCError({ code: "BAD_REQUEST", message: "Adjustment must balance" });
      const postingId = id("adjustment"); const pool = database(); const connection = await pool.getConnection();
      try { await connection.beginTransaction(); await connection.query("INSERT INTO erp_postings (id,organizationId,postingDate,sourceType,description,createdBy) VALUES (?,?,?,?,?,?)", [postingId, org(ctx), input.postingDate, "adjustment", input.description, ctx.user.id]); for (const line of input.lines) await connection.query("INSERT INTO erp_posting_lines (id,postingId,accountId,debit,credit,description) VALUES (?,?,?,?,?,?)", [id("adjustment_line"), postingId, line.accountId, line.debit, line.credit, `Period adjustment ${input.periodId}`]); await connection.commit(); } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
      return { id: postingId, status: "posted" };
    }),
  }),

  posting: router({
    post: protectedProcedure.input(z.object({ postingDate: z.string(), sourceType: z.string(), sourceId: z.string().optional(), description: z.string(), lines: z.array(z.object({ accountId: z.string(), debit: z.number().nonnegative().default(0), credit: z.number().nonnegative().default(0), description: z.string().optional() })).min(2) })).mutation(async ({ ctx, input }) => {
      await assertPostingPeriod(ctx, input.postingDate);
      const debit = input.lines.reduce((sum, line) => sum + line.debit, 0);
      const credit = input.lines.reduce((sum, line) => sum + line.credit, 0);
      if (debit !== credit || debit <= 0) throw new TRPCError({ code: "BAD_REQUEST", message: "Posting must balance and contain a non-zero amount" });
      const pool = database(); const postingId = id("posting");
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        await connection.query("INSERT INTO erp_postings (id,organizationId,postingDate,sourceType,sourceId,description,createdBy) VALUES (?,?,?,?,?,?,?)", [postingId, org(ctx), input.postingDate, input.sourceType, input.sourceId || null, input.description, ctx.user.id]);
        for (const line of input.lines) await connection.query("INSERT INTO erp_posting_lines (id,postingId,accountId,debit,credit,description) VALUES (?,?,?,?,?,?)", [id("line"), postingId, line.accountId, line.debit, line.credit, line.description || null]);
        await connection.commit();
      } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
      return { id: postingId, status: "posted" };
    }),
    postSource: protectedProcedure.input(z.object({ sourceType: z.enum(["invoice", "payment", "expense", "payroll", "inventory"]), sourceId: z.string(), postingDate: z.string(), debitAccountId: z.string(), creditAccountId: z.string(), description: z.string().optional() })).mutation(async ({ ctx, input }) => {
      await assertPostingPeriod(ctx, input.postingDate);
      const [existing] = await database().query("SELECT id FROM erp_postings WHERE organizationId=? AND sourceType=? AND sourceId=? AND status='posted' LIMIT 1", [org(ctx), input.sourceType, input.sourceId]);
      if ((existing as any[])[0]) return { id: (existing as any[])[0].id, sourceType: input.sourceType, sourceId: input.sourceId, status: "already_posted" };
      const sourceTables: Record<string, { table: string; amount: string; scoped: boolean }> = { invoice: { table: "invoices", amount: "total", scoped: true }, payment: { table: "payments", amount: "amount", scoped: true }, expense: { table: "expenses", amount: "amount", scoped: true }, payroll: { table: "payroll", amount: "netSalary", scoped: false }, inventory: { table: "inventory_ledger", amount: "quantity*unitCost", scoped: true } };
      const source = sourceTables[input.sourceType];
      const [rows] = await database().query(`SELECT ${source.amount} AS sourceAmount FROM ${source.table} WHERE id=?${source.scoped ? " AND organizationId=?" : ""} LIMIT 1`, source.scoped ? [input.sourceId, org(ctx)] : [input.sourceId]);
      const amount = Number((rows as any[])[0]?.sourceAmount || 0);
      if (amount <= 0) throw new TRPCError({ code: "NOT_FOUND", message: `No positive amount found for ${input.sourceType} ${input.sourceId}` });
      const postingId = id("source_posting"); const pool = database(); const connection = await pool.getConnection();
      try { await connection.beginTransaction(); await connection.query("INSERT INTO erp_postings (id,organizationId,postingDate,sourceType,sourceId,description,createdBy) VALUES (?,?,?,?,?,?,?)", [postingId, org(ctx), input.postingDate, input.sourceType, input.sourceId, input.description || `Automatic ${input.sourceType} posting`, ctx.user.id]); await connection.query("INSERT INTO erp_posting_lines (id,postingId,accountId,debit,credit,description) VALUES (?,?,?,?,?,?)", [id("source_debit"), postingId, input.debitAccountId, amount, 0, input.description || input.sourceType]); await connection.query("INSERT INTO erp_posting_lines (id,postingId,accountId,debit,credit,description) VALUES (?,?,?,?,?,?)", [id("source_credit"), postingId, input.creditAccountId, 0, amount, input.description || input.sourceType]); await connection.commit(); } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
      return { id: postingId, sourceType: input.sourceType, sourceId: input.sourceId, amount, status: "posted" };
    }),
    list: protectedProcedure.input(z.object({ startDate: z.string().optional(), endDate: z.string().optional() }).optional()).query(async ({ ctx, input }) => {
      const conditions = ["organizationId = ?"]; const params: any[] = [org(ctx)];
      if (input?.startDate) { conditions.push("postingDate >= ?"); params.push(input.startDate); }
      if (input?.endDate) { conditions.push("postingDate <= ?"); params.push(input.endDate); }
      const [rows] = await database().query(`SELECT p.*,SUM(l.debit) totalDebit,SUM(l.credit) totalCredit FROM erp_postings p LEFT JOIN erp_posting_lines l ON l.postingId=p.id WHERE ${conditions.join(" AND ")} GROUP BY p.id ORDER BY p.postingDate DESC`, params);
      return rows;
    }),
  }),

  reconciliation: router({
    create: protectedProcedure.input(z.object({ bankAccountId: z.string(), periodStart: z.string(), periodEnd: z.string(), statementBalance: z.number(), bookBalance: z.number(), notes: z.string().optional() })).mutation(async ({ ctx, input }) => {
      const reconciliationId = id("recon");
      await database().query("INSERT INTO reconciliation_sessions (id,organizationId,bankAccountId,periodStart,periodEnd,statementBalance,bookBalance,difference,notes,createdBy) VALUES (?,?,?,?,?,?,?,?,?,?)", [reconciliationId, org(ctx), input.bankAccountId, input.periodStart, input.periodEnd, input.statementBalance, input.bookBalance, input.statementBalance - input.bookBalance, input.notes || null, ctx.user.id]);
      return { id: reconciliationId };
    }),
    list: protectedProcedure.query(async ({ ctx }) => { const [rows] = await database().query("SELECT * FROM reconciliation_sessions WHERE organizationId=? ORDER BY createdAt DESC", [org(ctx)]); return rows; }),
    match: protectedProcedure.input(z.object({ sessionId: z.string(), bankTransactionId: z.string().optional(), sourceType: z.string(), sourceId: z.string(), amount: z.number(), notes: z.string().optional() })).mutation(async ({ ctx, input }) => {
      const itemId = id("recon_item"); await database().query("INSERT INTO reconciliation_items (id,sessionId,bankTransactionId,sourceType,sourceId,amount,status,notes,matchedBy,matchedAt) VALUES (?,?,?,?,?,?,?,?,?,NOW())", [itemId, input.sessionId, input.bankTransactionId || null, input.sourceType, input.sourceId, input.amount, "matched", input.notes || null, ctx.user.id]); return { id: itemId };
    }),
    approve: protectedProcedure.input(idInput).mutation(async ({ ctx, input }) => { await database().query("UPDATE reconciliation_sessions SET status='approved',approvedBy=?,approvedAt=NOW(),updatedAt=NOW() WHERE id=? AND organizationId=?", [ctx.user.id, input.id, org(ctx)]); return { success: true }; }),
  }),

  receivables: router({
    aging: protectedProcedure.query(async ({ ctx }) => { const [rows] = await database().query("SELECT i.id,i.invoiceNumber,i.clientId,i.issueDate,i.dueDate,i.total,i.paidAmount,i.status,DATEDIFF(CURDATE(),i.dueDate) daysOverdue FROM invoices i WHERE i.organizationId=? AND COALESCE(i.total,0)>COALESCE(i.paidAmount,0) ORDER BY i.dueDate", [org(ctx)]); return rows; }),
    allocatePayment: protectedProcedure.input(z.object({ paymentId: z.string(), invoiceId: z.string(), amount: z.number() })).mutation(async ({ ctx, input }) => { const allocationId = id("allocation"); await database().query("INSERT INTO payment_allocations (id,organizationId,paymentId,invoiceId,amount,allocatedBy) VALUES (?,?,?,?,?,?)", [allocationId, org(ctx), input.paymentId, input.invoiceId, input.amount, ctx.user.id]); return { id: allocationId }; }),
    statement: protectedProcedure.input(z.object({ clientId: z.string() })).query(async ({ ctx, input }) => { const [rows] = await database().query("SELECT invoiceNumber,issueDate,dueDate,total,paidAmount,status FROM invoices WHERE organizationId=? AND clientId=? ORDER BY issueDate DESC", [org(ctx), input.clientId]); return rows; }),
    setCreditLimit: protectedProcedure.input(z.object({ clientId: z.string(), creditLimit: z.number(), paymentTerms: z.string().optional() })).mutation(async ({ ctx, input }) => { await database().query("UPDATE clients SET creditLimit=?,paymentTerms=? WHERE id=? AND organizationId=?", [input.creditLimit, input.paymentTerms || null, input.clientId, org(ctx)]); return { success: true }; }),
  }),

  payables: router({
    aging: protectedProcedure.query(async ({ ctx }) => { const [rows] = await database().query("SELECT s.id,s.companyName,s.supplierNumber,COALESCE(SUM(po.total),0) outstanding,MAX(po.poDate) lastOrderDate FROM suppliers s LEFT JOIN purchaseOrders po ON po.supplierId=s.id AND po.organizationId=? WHERE s.organizationId=? GROUP BY s.id,s.companyName,s.supplierNumber ORDER BY outstanding DESC", [org(ctx), org(ctx)]); return rows; }),
    statement: protectedProcedure.input(z.object({ supplierId: z.string() })).query(async ({ ctx, input }) => { const [rows] = await database().query("SELECT poNumber,poDate,status,total FROM purchaseOrders WHERE supplierId=? AND organizationId=? ORDER BY poDate DESC", [input.supplierId, org(ctx)]); return rows; }),
  }),

  assets: router({
    create: protectedProcedure.input(z.object({ assetNumber: z.string(), name: z.string(), category: z.string().optional(), acquisitionDate: z.string(), cost: z.number(), residualValue: z.number().default(0), usefulLifeMonths: z.number().int().positive(), depreciationMethod: z.enum(["straight_line", "declining_balance"]).default("straight_line"), location: z.string().optional() })).mutation(async ({ ctx, input }) => { const assetId = id("asset"); await database().query("INSERT INTO fixed_assets (id,organizationId,assetNumber,name,category,acquisitionDate,cost,residualValue,usefulLifeMonths,depreciationMethod,location,createdBy) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", [assetId, org(ctx), input.assetNumber, input.name, input.category || null, input.acquisitionDate, input.cost, input.residualValue, input.usefulLifeMonths, input.depreciationMethod, input.location || null, ctx.user.id]); return { id: assetId }; }),
    depreciate: protectedProcedure.input(z.object({ assetId: z.string(), transactionDate: z.string(), amount: z.number() })).mutation(async ({ ctx, input }) => { const txId = id("asset_tx"); await database().query("INSERT INTO fixed_asset_transactions (id,assetId,type,transactionDate,amount,createdBy) VALUES (?,?,?, ?,?,?)", [txId, input.assetId, "depreciation", input.transactionDate, input.amount, ctx.user.id]); await database().query("UPDATE fixed_assets SET accumulatedDepreciation=accumulatedDepreciation+? WHERE id=? AND organizationId=?", [input.amount, input.assetId, org(ctx)]); return { id: txId }; }),
    dispose: protectedProcedure.input(z.object({ assetId: z.string(), transactionDate: z.string(), amount: z.number(), notes: z.string().optional() })).mutation(async ({ ctx, input }) => { const txId = id("asset_tx"); await database().query("INSERT INTO fixed_asset_transactions (id,assetId,type,transactionDate,amount,notes,createdBy) VALUES (?,?,?,?,?,?,?)", [txId, input.assetId, "disposal", input.transactionDate, input.amount, input.notes || null, ctx.user.id]); await database().query("UPDATE fixed_assets SET status='disposed' WHERE id=? AND organizationId=?", [input.assetId, org(ctx)]); return { id: txId }; }),
    transfer: protectedProcedure.input(z.object({ assetId: z.string(), transactionDate: z.string(), fromLocation: z.string(), toLocation: z.string(), notes: z.string().optional() })).mutation(async ({ ctx, input }) => { const txId = id("asset_tx"); await database().query("INSERT INTO fixed_asset_transactions (id,assetId,type,transactionDate,fromLocation,toLocation,notes,createdBy) VALUES (?,?,?,?,?,?,?,?)", [txId, input.assetId, "transfer", input.transactionDate, input.fromLocation, input.toLocation, input.notes || null, ctx.user.id]); await database().query("UPDATE fixed_assets SET location=?,status='transferred' WHERE id=? AND organizationId=?", [input.toLocation, input.assetId, org(ctx)]); return { id: txId }; }),
    depreciationSchedule: protectedProcedure.input(z.object({ assetId: z.string(), months: z.number().int().positive().max(600).default(12) })).query(async ({ ctx, input }) => {
      const [rows] = await database().query("SELECT * FROM fixed_assets WHERE id=? AND organizationId=? LIMIT 1", [input.assetId, org(ctx)]); const asset = (rows as any[])[0];
      if (!asset) throw new TRPCError({ code: "NOT_FOUND", message: "Fixed asset not found" });
      const remainingBase = Math.max(0, Number(asset.cost) - Number(asset.residualValue) - Number(asset.accumulatedDepreciation || 0)); const monthly = asset.depreciationMethod === "straight_line" ? remainingBase / Math.max(1, Number(asset.usefulLifeMonths)) : remainingBase * (2 / Math.max(1, Number(asset.usefulLifeMonths)));
      return Array.from({ length: Math.min(input.months, Number(asset.usefulLifeMonths)) }, (_, index) => ({ month: index + 1, depreciation: Math.min(remainingBase, monthly * (index + 1)) - Math.min(remainingBase, monthly * index) }));
    }),
  }),

  inventory: router({
    transact: protectedProcedure.input(z.object({ productId: z.string(), warehouseId: z.string().optional(), binId: z.string().optional(), lotId: z.string().optional(), serialNumber: z.string().optional(), transactionType: z.string(), quantity: z.number().int(), unitCost: z.number().default(0), referenceType: z.string().optional(), referenceId: z.string().optional(), allowNegative: z.boolean().default(false) })).mutation(async ({ ctx, input }) => {
      const pool = database();
      await ensureInventorySettingsTable();
      const [settingsRows] = await pool.query("SELECT valuationMethod,allowNegativeStock FROM inventory_settings WHERE organizationId=? LIMIT 1", [org(ctx)]);
      const policy = (settingsRows as any[])[0];
      const allowNegative = input.allowNegative || Boolean(policy?.allowNegativeStock);
      const balanceParams: any[] = [org(ctx), input.productId]; let balanceSql = "SELECT COALESCE(SUM(quantity),0) balance,COALESCE(SUM(quantity*unitCost),0) value FROM inventory_ledger WHERE organizationId=? AND productId=?";
      if (input.warehouseId) { balanceSql += " AND warehouseId=?"; balanceParams.push(input.warehouseId); }
      const [balanceRows] = await pool.query(balanceSql, balanceParams); const balance = Number((balanceRows as any[])[0]?.balance || 0); const currentValue = Number((balanceRows as any[])[0]?.value || 0);
      if (balance + input.quantity < 0 && !allowNegative) throw new TRPCError({ code: "BAD_REQUEST", message: "Transaction would create negative stock" });
      if (input.serialNumber && input.quantity > 0) { const [serialRows] = await pool.query("SELECT id FROM inventory_ledger WHERE organizationId=? AND productId=? AND serialNumber=? AND quantity>0 LIMIT 1", [org(ctx), input.productId, input.serialNumber]); if ((serialRows as any[]).length) throw new TRPCError({ code: "CONFLICT", message: "Serial number is already in stock" }); }
      if (input.lotId) { const [lotRows] = await pool.query("SELECT status,expiryDate FROM inventory_lots WHERE id=? AND organizationId=? LIMIT 1", [input.lotId, org(ctx)]); const lot = (lotRows as any[])[0]; if (!lot) throw new TRPCError({ code: "NOT_FOUND", message: "Inventory lot not found" }); if (["recalled", "quarantined", "expired"].includes(lot.status)) throw new TRPCError({ code: "BAD_REQUEST", message: `Lot is ${lot.status}` }); if (lot.expiryDate && new Date(lot.expiryDate) < new Date()) throw new TRPCError({ code: "BAD_REQUEST", message: "Lot has expired" }); }
      const unitCost = input.unitCost || (balance > 0 ? currentValue / balance : 0); const ledgerId = id("inv");
      await pool.query("INSERT INTO inventory_ledger (id,organizationId,productId,warehouseId,binId,lotId,serialNumber,transactionType,quantity,unitCost,referenceType,referenceId,allowNegative,createdBy) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [ledgerId, org(ctx), input.productId, input.warehouseId || null, input.binId || null, input.lotId || null, input.serialNumber || null, input.transactionType, input.quantity, unitCost, input.referenceType || null, input.referenceId || null, allowNegative ? 1 : 0, ctx.user.id]);
      if (input.lotId) await pool.query("UPDATE inventory_lots SET quantity=quantity+? WHERE id=? AND organizationId=?", [input.quantity, input.lotId, org(ctx)]);
      return { id: ledgerId, balance: balance + input.quantity, unitCost };
    }),
    balance: protectedProcedure.input(z.object({ productId: z.string(), warehouseId: z.string().optional() })).query(async ({ ctx, input }) => { const params: any[] = [org(ctx), input.productId]; let sql = "SELECT COALESCE(SUM(quantity),0) balance,COALESCE(SUM(quantity*unitCost),0) value FROM inventory_ledger WHERE organizationId=? AND productId=?"; if (input.warehouseId) { sql += " AND warehouseId=?"; params.push(input.warehouseId); } const [rows] = await database().query(sql, params); return (rows as any[])[0]; }),
    createLot: protectedProcedure.input(z.object({ productId: z.string(), lotNumber: z.string(), batchNumber: z.string().optional(), expiryDate: z.string().optional(), quantity: z.number().int().default(0) })).mutation(async ({ ctx, input }) => { const lotId = id("lot"); await database().query("INSERT INTO inventory_lots (id,organizationId,productId,lotNumber,batchNumber,expiryDate,quantity) VALUES (?,?,?,?,?,?,?)", [lotId, org(ctx), input.productId, input.lotNumber, input.batchNumber || null, input.expiryDate || null, input.quantity]); return { id: lotId }; }),
    recallLot: protectedProcedure.input(z.object({ lotId: z.string(), reason: z.string() })).mutation(async ({ ctx, input }) => { await database().query("UPDATE inventory_lots SET status='recalled',recallReason=? WHERE id=? AND organizationId=?", [input.reason, input.lotId, org(ctx)]); return { success: true }; }),
  }),

  procurement: router({
    createRfq: protectedProcedure.input(z.object({ rfqNumber: z.string(), requiredDate: z.string().optional() })).mutation(async ({ ctx, input }) => { const rfqId = id("rfq"); await database().query("INSERT INTO procurement_rfqs (id,organizationId,rfqNumber,requiredDate,createdBy) VALUES (?,?,?,?,?)", [rfqId, org(ctx), input.rfqNumber, input.requiredDate || null, ctx.user.id]); return { id: rfqId }; }),
    addQuote: protectedProcedure.input(z.object({ rfqId: z.string(), supplierId: z.string(), amount: z.number(), leadTimeDays: z.number().optional(), validUntil: z.string().optional(), notes: z.string().optional() })).mutation(async ({ input }) => { const quoteId = id("quote"); await database().query("INSERT INTO procurement_quotes (id,rfqId,supplierId,amount,leadTimeDays,validUntil,notes) VALUES (?,?,?,?,?,?,?)", [quoteId, input.rfqId, input.supplierId, input.amount, input.leadTimeDays || null, input.validUntil || null, input.notes || null]); return { id: quoteId }; }),
    compareQuotes: protectedProcedure.input(z.object({ rfqId: z.string() })).query(async ({ input }) => { const [rows] = await database().query("SELECT q.*,s.companyName supplierName FROM procurement_quotes q LEFT JOIN suppliers s ON s.id=q.supplierId WHERE q.rfqId=? ORDER BY q.amount ASC,q.leadTimeDays ASC", [input.rfqId]); return rows; }),
    awardQuote: protectedProcedure.input(z.object({ rfqId: z.string(), quoteId: z.string() })).mutation(async ({ input }) => { await database().query("UPDATE procurement_quotes SET status='awarded' WHERE id=? AND rfqId=?", [input.quoteId, input.rfqId]); await database().query("UPDATE procurement_rfqs SET status='awarded' WHERE id=?", [input.rfqId]); return { success: true }; }),
    matchPurchase: protectedProcedure.input(z.object({ purchaseOrderId: z.string().optional(), receiptId: z.string().optional(), invoiceId: z.string().optional(), exceptionReason: z.string().optional() })).mutation(async ({ ctx, input }) => { const matchId = id("match"); await database().query("INSERT INTO purchase_matchings (id,organizationId,purchaseOrderId,receiptId,invoiceId,status,exceptionReason) VALUES (?,?,?,?,?,?,?)", [matchId, org(ctx), input.purchaseOrderId || null, input.receiptId || null, input.invoiceId || null, input.exceptionReason ? "exception" : "matched", input.exceptionReason || null]); return { id: matchId }; }),
    convertRequisitionToPO: protectedProcedure.input(z.object({ requisitionId: z.string(), orderNumber: z.string(), supplierId: z.string() })).mutation(async ({ ctx, input }) => {
      const pool = database(); const [requestRows] = await pool.query("SELECT * FROM purchase_requisitions WHERE id=? AND organizationId=? AND status IN ('draft','submitted','approved') LIMIT 1", [input.requisitionId, org(ctx)]); const request = (requestRows as any[])[0];
      if (!request) throw new TRPCError({ code: "NOT_FOUND", message: "Purchase requisition not found or already converted" });
      const [lines] = await pool.query("SELECT * FROM purchase_requisition_lines WHERE requisitionId=? ORDER BY id", [input.requisitionId]); const [supplierRows] = await pool.query("SELECT companyName FROM suppliers WHERE id=? AND organizationId=? LIMIT 1", [input.supplierId, org(ctx)]); const supplierName = (supplierRows as any[])[0]?.companyName || "Supplier";
      const total = (lines as any[]).reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.estimatedUnitCost || 0), 0); const orderId = id("po"); const now = new Date().toISOString().replace("T", " ").slice(0, 19); const connection = await pool.getConnection();
      try { await connection.beginTransaction(); await connection.query("INSERT INTO purchaseOrders (id,organizationId,poNumber,supplierId,supplierName,poDate,subtotal,taxAmount,total,status,createdBy,createdAt) VALUES (?,?,?,?,?, ?,?,?,?,'draft',?,?)", [orderId, org(ctx), input.orderNumber, input.supplierId, supplierName, now, total, 0, total, ctx.user.id, now]); for (const [index, line] of (lines as any[]).entries()) await connection.query("INSERT INTO purchaseOrderItems (id,purchaseOrderId,description,quantity,rate,amount,lineNumber,createdBy) VALUES (?,?,?,?,?,?,?,?)", [id("po_line"), orderId, line.productId, line.quantity, line.estimatedUnitCost || 0, Number(line.quantity || 0) * Number(line.estimatedUnitCost || 0), index + 1, ctx.user.id]); await connection.query("UPDATE purchase_requisitions SET status='converted' WHERE id=? AND organizationId=?", [input.requisitionId, org(ctx)]); await connection.commit(); } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
      await notifyPurchasingTeam({
        organizationId: org(ctx),
        templateId: "purchase-order-created-team",
        poId: orderId,
        poNumber: input.orderNumber,
        supplierName,
        total,
        userId: ctx.user.id,
        extra: { approval_status: "Draft - awaiting review" },
      });
      return { success: true, requisitionId: input.requisitionId, purchaseOrderId: orderId, orderNumber: input.orderNumber, total };
    }),
    createPurchaseAdjustment: protectedProcedure.input(z.object({ purchaseOrderId: z.string(), type: z.enum(["credit_note", "debit_note"]), amount: z.number().positive(), reason: z.string() })).mutation(async ({ ctx, input }) => { const adjustmentId = id("purchase_adjustment"); await database().query("INSERT INTO purchase_matchings (id,organizationId,purchaseOrderId,status,exceptionReason) VALUES (?,?,?,?,?)", [adjustmentId, org(ctx), input.purchaseOrderId, "exception", `${input.type}:${input.amount}:${input.reason}`]); return { id: adjustmentId, type: input.type, status: "recorded" }; }),
  }),

  manufacturing: router({
    createBom: protectedProcedure.input(z.object({ productId: z.string(), version: z.string(), routingId: z.string().optional(), lines: z.array(z.object({ componentProductId: z.string(), quantity: z.number(), scrapPercent: z.number().default(0) })) })).mutation(async ({ ctx, input }) => { const bomId = id("bom"); const pool = database(); const connection = await pool.getConnection(); try { await connection.beginTransaction(); await connection.query("INSERT INTO boms (id,organizationId,productId,version,routingId,status) VALUES (?,?,?,?,?,'active')", [bomId, org(ctx), input.productId, input.version, input.routingId || null]); for (const line of input.lines) await connection.query("INSERT INTO bom_lines (id,bomId,componentProductId,quantity,scrapPercent) VALUES (?,?,?,?,?)", [id("bom_line"), bomId, line.componentProductId, line.quantity, line.scrapPercent]); await connection.commit(); } catch (e) { await connection.rollback(); throw e; } finally { connection.release(); } return { id: bomId }; }),
    createProductionOrder: protectedProcedure.input(z.object({ orderNumber: z.string(), productId: z.string(), bomId: z.string().optional(), quantity: z.number().int().positive(), plannedStart: z.string().optional(), plannedEnd: z.string().optional() })).mutation(async ({ ctx, input }) => { const orderId = id("prod"); await database().query("INSERT INTO production_orders (id,organizationId,orderNumber,productId,bomId,quantity,plannedStart,plannedEnd) VALUES (?,?,?,?,?,?,?,?)", [orderId, org(ctx), input.orderNumber, input.productId, input.bomId || null, input.quantity, input.plannedStart || null, input.plannedEnd || null]); return { id: orderId }; }),
    inspect: protectedProcedure.input(z.object({ referenceType: z.string(), referenceId: z.string(), status: z.enum(["pending", "passed", "failed", "quarantined"]), notes: z.string().optional() })).mutation(async ({ ctx, input }) => { const inspectionId = id("inspection"); await database().query("INSERT INTO quality_inspections (id,organizationId,referenceType,referenceId,status,inspectorId,notes) VALUES (?,?,?,?,?,?,?)", [inspectionId, org(ctx), input.referenceType, input.referenceId, input.status, ctx.user.id, input.notes || null]); return { id: inspectionId }; }),
  }),

  distribution: router({
    setInventoryPolicy: protectedProcedure.input(z.object({ valuationMethod: z.enum(["weighted_average", "fifo", "standard_cost"]), allowNegativeStock: z.boolean() })).mutation(async ({ ctx, input }) => {
      await ensureInventorySettingsTable();
      const settingsId = id("inventory_settings");
      await database().query("INSERT INTO inventory_settings (id,organizationId,valuationMethod,allowNegativeStock,updatedBy) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE valuationMethod=VALUES(valuationMethod),allowNegativeStock=VALUES(allowNegativeStock),updatedBy=VALUES(updatedBy),updatedAt=NOW()", [settingsId, org(ctx), input.valuationMethod, input.allowNegativeStock ? 1 : 0, ctx.user.id]);
      return { success: true };
    }),
    createBin: protectedProcedure.input(z.object({ warehouseId: z.string(), code: z.string(), name: z.string().optional() })).mutation(async ({ ctx, input }) => { const binId = id("bin"); await database().query("INSERT INTO inventory_bins (id,organizationId,warehouseId,code,name) VALUES (?,?,?,?,?)", [binId, org(ctx), input.warehouseId, input.code, input.name || null]); return { id: binId }; }),
    createTransfer: protectedProcedure.input(z.object({ fromWarehouseId: z.string(), toWarehouseId: z.string(), notes: z.string().optional(), lines: z.array(z.object({ productId: z.string(), lotId: z.string().optional(), quantity: z.number().int().positive() })).min(1) })).mutation(async ({ ctx, input }) => {
      const transferId = id("transfer"); const pool = database(); const connection = await pool.getConnection();
      try { await connection.beginTransaction(); await connection.query("INSERT INTO inventory_transfers (id,organizationId,fromWarehouseId,toWarehouseId,notes,createdBy) VALUES (?,?,?,?,?,?)", [transferId, org(ctx), input.fromWarehouseId, input.toWarehouseId, input.notes || null, ctx.user.id]); for (const line of input.lines) await connection.query("INSERT INTO inventory_transfer_lines (id,transferId,productId,lotId,quantity) VALUES (?,?,?,?,?)", [id("transfer_line"), transferId, line.productId, line.lotId || null, line.quantity]); await connection.commit(); } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
      return { id: transferId, status: "draft" };
    }),
    createCount: protectedProcedure.input(z.object({ warehouseId: z.string(), notes: z.string().optional(), lines: z.array(z.object({ productId: z.string(), expectedQuantity: z.number().int(), countedQuantity: z.number().int() })).min(1) })).mutation(async ({ ctx, input }) => {
      const countId = id("count"); const pool = database(); const connection = await pool.getConnection();
      try { await connection.beginTransaction(); await connection.query("INSERT INTO inventory_counts (id,organizationId,warehouseId,notes,createdBy) VALUES (?,?,?,?,?)", [countId, org(ctx), input.warehouseId, input.notes || null, ctx.user.id]); for (const line of input.lines) await connection.query("INSERT INTO inventory_count_lines (id,countId,productId,expectedQuantity,countedQuantity,variance) VALUES (?,?,?,?,?,?)", [id("count_line"), countId, line.productId, line.expectedQuantity, line.countedQuantity, line.countedQuantity - line.expectedQuantity]); await connection.commit(); } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
      return { id: countId };
    }),
    createRequisition: protectedProcedure.input(z.object({ requisitionNumber: z.string(), requiredDate: z.string().optional(), notes: z.string().optional(), lines: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive(), estimatedUnitCost: z.number().default(0) })).min(1) })).mutation(async ({ ctx, input }) => {
      const requisitionId = id("requisition"); const pool = database(); const connection = await pool.getConnection();
      try { await connection.beginTransaction(); await connection.query("INSERT INTO purchase_requisitions (id,organizationId,requisitionNumber,requestedBy,requiredDate,notes) VALUES (?,?,?,?,?,?)", [requisitionId, org(ctx), input.requisitionNumber, ctx.user.id, input.requiredDate || null, input.notes || null]); for (const line of input.lines) await connection.query("INSERT INTO purchase_requisition_lines (id,requisitionId,productId,quantity,estimatedUnitCost) VALUES (?,?,?,?,?)", [id("requisition_line"), requisitionId, line.productId, line.quantity, line.estimatedUnitCost]); await connection.commit(); } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
      return { id: requisitionId, status: "draft" };
    }),
    addLandedCost: protectedProcedure.input(z.object({ purchaseOrderId: z.string(), costType: z.string(), amount: z.number(), allocationMethod: z.enum(["value", "quantity", "weight", "manual"]).default("value"), notes: z.string().optional() })).mutation(async ({ ctx, input }) => { const landedCostId = id("landed_cost"); await database().query("INSERT INTO landed_costs (id,organizationId,purchaseOrderId,costType,amount,allocationMethod,notes,createdBy) VALUES (?,?,?,?,?,?,?,?)", [landedCostId, org(ctx), input.purchaseOrderId, input.costType, input.amount, input.allocationMethod, input.notes || null, ctx.user.id]); return { id: landedCostId }; }),
    createSupplierReturn: protectedProcedure.input(z.object({ supplierId: z.string(), referenceNumber: z.string(), reason: z.string().optional() })).mutation(async ({ ctx, input }) => { const returnId = id("supplier_return"); await database().query("INSERT INTO supplier_returns (id,organizationId,supplierId,referenceNumber,reason,createdBy) VALUES (?,?,?,?,?,?)", [returnId, org(ctx), input.supplierId, input.referenceNumber, input.reason || null, ctx.user.id]); return { id: returnId }; }),
    reserveStock: protectedProcedure.input(z.object({ productId: z.string(), warehouseId: z.string().optional(), sourceType: z.string(), sourceId: z.string(), quantity: z.number().int().positive() })).mutation(async ({ ctx, input }) => { const reservationId = id("reservation"); await database().query("INSERT INTO inventory_reservations (id,organizationId,productId,warehouseId,sourceType,sourceId,quantity) VALUES (?,?,?,?,?,?,?)", [reservationId, org(ctx), input.productId, input.warehouseId || null, input.sourceType, input.sourceId, input.quantity]); return { id: reservationId }; }),
    releaseReservation: protectedProcedure.input(z.object({ reservationId: z.string() })).mutation(async ({ ctx, input }) => { await database().query("UPDATE inventory_reservations SET status='released' WHERE id=? AND organizationId=?", [input.reservationId, org(ctx)]); return { success: true }; }),
    createFulfilment: protectedProcedure.input(z.object({ sourceType: z.string(), sourceId: z.string(), trackingNumber: z.string().optional(), lines: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })).min(1) })).mutation(async ({ ctx, input }) => {
      const fulfilmentId = id("fulfilment"); const pool = database(); const connection = await pool.getConnection();
      try { await connection.beginTransaction(); await connection.query("INSERT INTO fulfilment_orders (id,organizationId,sourceType,sourceId,trackingNumber,createdBy) VALUES (?,?,?,?,?,?)", [fulfilmentId, org(ctx), input.sourceType, input.sourceId, input.trackingNumber || null, ctx.user.id]); for (const line of input.lines) await connection.query("INSERT INTO fulfilment_lines (id,fulfilmentOrderId,productId,quantity) VALUES (?,?,?,?)", [id("fulfilment_line"), fulfilmentId, line.productId, line.quantity]); await connection.commit(); } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
      return { id: fulfilmentId, status: "open" };
    }),
    updateFulfilmentStatus: protectedProcedure.input(z.object({ fulfilmentId: z.string(), status: z.enum(["open", "picking", "packed", "dispatched", "delivered", "returned", "cancelled"]), trackingNumber: z.string().optional() })).mutation(async ({ ctx, input }) => { await database().query("UPDATE fulfilment_orders SET status=?,trackingNumber=COALESCE(?,trackingNumber),dispatchDate=IF(?='dispatched',CURDATE(),dispatchDate) WHERE id=? AND organizationId=?", [input.status, input.trackingNumber || null, input.status, input.fulfilmentId, org(ctx)]); return { success: true, status: input.status }; }),
    lotTrace: protectedProcedure.input(z.object({ productId: z.string().optional(), lotId: z.string().optional(), serialNumber: z.string().optional() })).query(async ({ ctx, input }) => { const conditions = ["organizationId=?"]; const params: any[] = [org(ctx)]; if (input.productId) { conditions.push("productId=?"); params.push(input.productId); } if (input.lotId) { conditions.push("lotId=?"); params.push(input.lotId); } if (input.serialNumber) { conditions.push("serialNumber=?"); params.push(input.serialNumber); } const [rows] = await database().query(`SELECT * FROM inventory_ledger WHERE ${conditions.join(" AND ")} ORDER BY createdAt DESC`, params); return rows; }),
  }),

  planning: router({
    createRouting: protectedProcedure.input(z.object({ name: z.string(), version: z.string(), steps: z.array(z.object({ sequence: z.number().int(), workCenterId: z.string(), setupMinutes: z.number().int().default(0), runMinutes: z.number().int().default(0) })).min(1) })).mutation(async ({ ctx, input }) => { const routingId = id("routing"); const pool = database(); const connection = await pool.getConnection(); try { await connection.beginTransaction(); await connection.query("INSERT INTO routings (id,organizationId,name,version,status) VALUES (?,?,?,?, 'active')", [routingId, org(ctx), input.name, input.version]); for (const step of input.steps) await connection.query("INSERT INTO routing_steps (id,routingId,sequence,workCenterId,setupMinutes,runMinutes) VALUES (?,?,?,?,?,?)", [id("routing_step"), routingId, step.sequence, step.workCenterId, step.setupMinutes, step.runMinutes]); await connection.commit(); } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); } return { id: routingId }; }),
    runMrp: protectedProcedure.input(z.object({ horizonDate: z.string(), safetyStock: z.number().int().nonnegative().default(0), recommendations: z.array(z.object({ productId: z.string(), requiredDate: z.string(), quantity: z.number().int().positive(), sourceType: z.string(), sourceId: z.string().optional() })).default([]) })).mutation(async ({ ctx, input }) => {
      const generated = input.recommendations.length ? input.recommendations : ((await database().query("SELECT p.id productId,p.stockQuantity,COALESCE(SUM(r.quantity),0) reserved FROM products p LEFT JOIN inventory_reservations r ON r.productId=p.id AND r.organizationId=? AND r.status='reserved' WHERE p.organizationId=? GROUP BY p.id,p.stockQuantity", [org(ctx), org(ctx)])) as any)[0].flatMap((row: any) => { const quantity = Math.max(0, Number(input.safetyStock) + Number(row.reserved || 0) - Number(row.stockQuantity || 0)); return quantity > 0 ? [{ productId: row.productId, requiredDate: input.horizonDate, quantity, sourceType: "stock_and_reservations" }] : []; });
      const runId = id("mrp"); const pool = database(); const connection = await pool.getConnection(); try { await connection.beginTransaction(); await connection.query("INSERT INTO mrp_runs (id,organizationId,runDate,horizonDate,status,createdBy) VALUES (?,?,NOW(),?,'completed',?)", [runId, org(ctx), input.horizonDate, ctx.user.id]); for (const recommendation of generated) await connection.query("INSERT INTO mrp_recommendations (id,runId,productId,requiredDate,quantity,sourceType,sourceId) VALUES (?,?,?,?,?,?,?)", [id("mrp_rec"), runId, recommendation.productId, recommendation.requiredDate, recommendation.quantity, recommendation.sourceType, recommendation.sourceId || null]); await connection.commit(); } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); } return { id: runId, status: "completed", recommendations: generated }; }),
    recordConsumption: protectedProcedure.input(z.object({ productionOrderId: z.string(), productId: z.string(), quantity: z.number().int().positive(), unitCost: z.number().default(0) })).mutation(async ({ input }) => { const consumptionId = id("consumption"); await database().query("INSERT INTO production_consumption (id,productionOrderId,productId,quantity,unitCost) VALUES (?,?,?,?,?)", [consumptionId, input.productionOrderId, input.productId, input.quantity, input.unitCost]); return { id: consumptionId }; }),
    recordLabor: protectedProcedure.input(z.object({ productionOrderId: z.string(), employeeId: z.string(), hours: z.number().positive(), rate: z.number().default(0) })).mutation(async ({ input }) => { const laborId = id("labor"); await database().query("INSERT INTO production_labor (id,productionOrderId,employeeId,hours,rate) VALUES (?,?,?,?,?)", [laborId, input.productionOrderId, input.employeeId, input.hours, input.rate]); return { id: laborId }; }),
    recordVariance: protectedProcedure.input(z.object({ productionOrderId: z.string(), varianceType: z.string(), amount: z.number(), notes: z.string().optional() })).mutation(async ({ input }) => { const varianceId = id("variance"); await database().query("INSERT INTO production_variances (id,productionOrderId,varianceType,amount,notes) VALUES (?,?,?,?,?)", [varianceId, input.productionOrderId, input.varianceType, input.amount, input.notes || null]); return { id: varianceId }; }),
    createNonconformance: protectedProcedure.input(z.object({ referenceType: z.string(), referenceId: z.string(), severity: z.enum(["low", "medium", "high", "critical"]), description: z.string(), correctiveAction: z.string().optional() })).mutation(async ({ ctx, input }) => { const issueId = id("nonconformance"); await database().query("INSERT INTO quality_nonconformances (id,organizationId,referenceType,referenceId,severity,description,correctiveAction,createdBy) VALUES (?,?,?,?,?,?,?,?)", [issueId, org(ctx), input.referenceType, input.referenceId, input.severity, input.description, input.correctiveAction || null, ctx.user.id]); return { id: issueId }; }),
  }),

  enterprise: router({
    intercompany: protectedProcedure.input(z.object({ toOrganizationId: z.string(), amount: z.number(), currency: z.string().default("KES"), description: z.string() })).mutation(async ({ ctx, input }) => { const journalId = id("ic"); await database().query("INSERT INTO intercompany_journals (id,organizationId,fromOrganizationId,toOrganizationId,amount,currency,description,createdBy) VALUES (?,?,?,?,?,?,?,?)", [journalId, org(ctx), org(ctx), input.toOrganizationId, input.amount, input.currency, input.description, ctx.user.id]); return { id: journalId }; }),
    consolidate: protectedProcedure.input(z.object({ organizationIds: z.array(z.string()).min(1), startDate: z.string(), endDate: z.string(), exchangeRates: z.record(z.string(), z.number()).default({}), eliminations: z.array(z.object({ organizationId: z.string(), debit: z.number(), credit: z.number() })).default([]) })).query(async ({ input }) => { const placeholders = input.organizationIds.map(() => "?").join(","); const [rows] = await database().query(`SELECT organizationId,COALESCE(SUM(debit),0) debit,COALESCE(SUM(credit),0) credit FROM erp_postings p JOIN erp_posting_lines l ON l.postingId=p.id WHERE p.organizationId IN (${placeholders}) AND p.postingDate BETWEEN ? AND ? GROUP BY organizationId`, [...input.organizationIds, input.startDate, input.endDate]); const consolidated = (rows as any[]).reduce((total, row) => { const rate = Number(input.exchangeRates[row.organizationId] || 1); return { debit: total.debit + Number(row.debit || 0) * rate, credit: total.credit + Number(row.credit || 0) * rate }; }, { debit: 0, credit: 0 }); const eliminated = input.eliminations.reduce((total, row) => ({ debit: total.debit + row.debit, credit: total.credit + row.credit }), { debit: 0, credit: 0 }); return { organizations: rows, consolidated: { debit: consolidated.debit - eliminated.debit, credit: consolidated.credit - eliminated.credit }, eliminations: eliminated }; }),
    defineKpi: protectedProcedure.input(z.object({ name: z.string(), metricKey: z.enum(["invoice_revenue", "payment_cash", "expense_total"]), formula: z.enum(["invoices", "payments", "expenses"]), target: z.number().optional(), dimensions: z.string().optional() })).mutation(async ({ ctx, input }) => { const kpiId = id("kpi"); await database().query("INSERT INTO kpi_definitions (id,organizationId,name,metricKey,formula,target,dimensions) VALUES (?,?,?,?,?,?,?)", [kpiId, org(ctx), input.name, input.metricKey, input.formula, input.target || null, input.dimensions || null]); return { id: kpiId }; }),
    drilldownKpi: protectedProcedure.input(z.object({ metricKey: z.enum(["invoice_revenue", "payment_cash", "expense_total"]), startDate: z.string().optional(), endDate: z.string().optional() })).query(async ({ ctx, input }) => { const [definitions] = await database().query("SELECT formula FROM kpi_definitions WHERE organizationId=? AND metricKey=? AND isActive=1 LIMIT 1", [org(ctx), input.metricKey]); const formula = (definitions as any[])[0]?.formula; if (!["invoices", "payments", "expenses"].includes(formula)) throw new TRPCError({ code: "NOT_FOUND", message: "No governed KPI definition found" }); const params: any[] = [org(ctx)]; const filters = ["organizationId=?"]; if (input.startDate) { filters.push("createdAt>=?"); params.push(input.startDate); } if (input.endDate) { filters.push("createdAt<=?"); params.push(input.endDate); } const [rows] = await database().query(`SELECT * FROM ${formula} WHERE ${filters.join(" AND ")} ORDER BY createdAt DESC LIMIT 500`, params); return { metricKey: input.metricKey, source: formula, rows }; }),
    enqueueIntegrationEvent: protectedProcedure.input(z.object({ provider: z.string(), eventType: z.string(), payload: z.record(z.string(), z.any()), idempotencyKey: z.string().optional() })).mutation(async ({ ctx, input }) => { const eventId = id("event"); await database().query("INSERT INTO integration_events (id,organizationId,provider,eventType,payload,idempotencyKey) VALUES (?,?,?,?,?,?)", [eventId, org(ctx), input.provider, input.eventType, JSON.stringify(input.payload), input.idempotencyKey || null]); return { id: eventId, status: "pending" }; }),
    retryIntegrationEvent: protectedProcedure.input(z.object({ eventId: z.string(), error: z.string().optional() })).mutation(async ({ ctx, input }) => { const attemptId = id("attempt"); const [rows] = await database().query("SELECT COALESCE(MAX(attemptNumber),0)+1 attemptNumber FROM integration_attempts WHERE eventId=?", [input.eventId]); const attemptNumber = Number((rows as any[])[0]?.attemptNumber || 1); await database().query("INSERT INTO integration_attempts (id,eventId,attemptNumber,status,error) VALUES (?,?,?,?,?)", [attemptId, input.eventId, attemptNumber, "failed", input.error || "Retry requested"]); await database().query("UPDATE integration_events SET status='pending',attempts=?,nextAttemptAt=NOW() WHERE id=? AND organizationId=?", [attemptNumber, input.eventId, org(ctx)]); return { id: attemptId, status: "pending" }; }),
    scheduleReport: protectedProcedure.input(z.object({ name: z.string(), reportType: z.string(), schedule: z.string(), recipients: z.array(z.string()), filters: z.record(z.string(), z.any()).optional() })).mutation(async ({ ctx, input }) => { const jobId = id("report_job"); await database().query("INSERT INTO scheduled_report_jobs (id,organizationId,name,reportType,schedule,recipients,filters) VALUES (?,?,?,?,?,?,?)", [jobId, org(ctx), input.name, input.reportType, input.schedule, JSON.stringify(input.recipients), JSON.stringify(input.filters || {})]); return { id: jobId }; }),
    createAnomaly: protectedProcedure.input(z.object({ sourceType: z.string(), sourceId: z.string().optional(), severity: z.enum(["info", "warning", "critical"]), message: z.string() })).mutation(async ({ ctx, input }) => { const alertId = id("anomaly"); await database().query("INSERT INTO anomaly_alerts (id,organizationId,sourceType,sourceId,severity,message) VALUES (?,?,?,?,?,?)", [alertId, org(ctx), input.sourceType, input.sourceId || null, input.severity, input.message]); return { id: alertId }; }),
    listAnomalies: protectedProcedure.query(async ({ ctx }) => { const [rows] = await database().query("SELECT * FROM anomaly_alerts WHERE organizationId=? ORDER BY createdAt DESC", [org(ctx)]); return rows; }),
    explainForecast: protectedProcedure.input(z.object({ metric: z.string(), horizon: z.number().int().positive(), factors: z.array(z.object({ name: z.string(), impact: z.number(), explanation: z.string() })) })).mutation(async ({ ctx, input }) => { const alertId = id("forecast"); const message = JSON.stringify({ metric: input.metric, horizon: input.horizon, factors: input.factors }); await database().query("INSERT INTO anomaly_alerts (id,organizationId,sourceType,severity,message) VALUES (?,?,?,?,?)", [alertId, org(ctx), "forecast_explanation", "info", message]); return { id: alertId, metric: input.metric, horizon: input.horizon, factors: input.factors }; }),
    registerWebhook: protectedProcedure.input(z.object({ name: z.string(), url: z.string().url(), secret: z.string().optional(), events: z.array(z.string()) })).mutation(async ({ ctx, input }) => { const webhookId = id("webhook"); await database().query("INSERT INTO api_webhooks (id,organizationId,name,url,secret,events) VALUES (?,?,?,?,?,?)", [webhookId, org(ctx), input.name, input.url, input.secret || null, JSON.stringify(input.events)]); return { id: webhookId }; }),
  }),
});
