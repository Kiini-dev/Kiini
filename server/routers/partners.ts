import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb, getPool } from "../db";
import { partnerCommissions, partnerPayouts, partnerProfiles, partnerReferrals } from "../../drizzle/schema";

const partnerType = z.enum(["affiliate", "reseller", "technology"]);
const applicationStatus = z.enum(["pending", "approved", "rejected", "suspended"]);
const referralStatus = z.enum(["submitted", "qualified", "converted", "rejected", "paid"]);
const commissionStatus = z.enum(["pending", "approved", "payable", "paid", "void"]);

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== "super_admin" || ctx.user.organizationId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Global super administrator access required" });
  }
  return next();
});

const partnerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
  const [partner] = await db.select().from(partnerProfiles).where(eq(partnerProfiles.userId, ctx.user.id)).limit(1);
  if (!partner || !["approved", "active"].includes(partner.status)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Approved partner access required" });
  }
  return next({ ctx: { ...ctx, partner } });
});

function referralCode(company: string, name: string) {
  const base = (company || name).replace(/[^a-z0-9]/gi, "").slice(0, 10).toUpperCase() || "PARTNER";
  return `${base}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function calculatePartnerTotals(commissions: Array<{ amount: unknown; status: string }>, payouts: Array<{ amount: unknown; status: string }>) {
  const earned = commissions.filter((row) => row.status !== "void").reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const commissionPaid = commissions.filter((row) => row.status === "paid").reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const payoutPaid = payouts.filter((row) => row.status === "paid").reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const requested = payouts.filter((row) => ["requested", "processing"].includes(row.status)).reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const paid = Math.max(commissionPaid, payoutPaid);
  return { earned, paid, requested, payable: Math.max(0, earned - paid - requested) };
}

export const partnersRouter = router({
  submitApplication: publicProcedure.input(z.object({
    name: z.string().min(2).max(255),
    email: z.string().email().max(320),
    company: z.string().max(255).optional(),
    phone: z.string().max(50).optional(),
    website: z.string().max(500).optional(),
    partnerType,
    message: z.string().max(10000).optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [existing] = await db.select({ id: partnerProfiles.id, status: partnerProfiles.status }).from(partnerProfiles).where(eq(partnerProfiles.email, input.email)).limit(1);
    if (existing && ["pending", "approved", "active"].includes(existing.status)) {
      throw new TRPCError({ code: "CONFLICT", message: "A partner application already exists for this email" });
    }
    const id = uuidv4();
    await db.insert(partnerProfiles).values({
      id,
      name: input.name,
      email: input.email,
      company: input.company || null,
      phone: input.phone || null,
      website: input.website || null,
      partnerType: input.partnerType,
      status: "pending",
      referralCode: referralCode(input.company || "", input.name),
      notes: input.message || null,
    });
    return { success: true, applicationId: id, message: "Application received" };
  }),

  listApplications: adminProcedure.input(z.object({ status: applicationStatus.optional(), limit: z.number().int().min(1).max(500).default(100) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const query = db.select().from(partnerProfiles).orderBy(desc(partnerProfiles.createdAt)).limit(input.limit);
    return input.status ? query.where(eq(partnerProfiles.status, input.status)) : query;
  }),

  reviewApplication: adminProcedure.input(z.object({ id: z.string(), status: applicationStatus, notes: z.string().max(10000).optional(), commissionRate: z.number().min(0).max(100).optional(), userId: z.string().optional() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    await db.update(partnerProfiles).set({ status: input.status, notes: input.notes, commissionRate: input.commissionRate?.toString(), userId: input.userId || undefined }).where(eq(partnerProfiles.id, input.id));
    return { success: true };
  }),

  listReferrals: adminProcedure.input(z.object({ status: referralStatus.optional(), partnerId: z.string().optional(), limit: z.number().int().min(1).max(500).default(100) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const filters = [];
    if (input.status) filters.push(eq(partnerReferrals.status, input.status));
    if (input.partnerId) filters.push(eq(partnerReferrals.partnerId, input.partnerId));
    if (filters.length) {
      return db.select().from(partnerReferrals).where(and(...filters))
        .orderBy(desc(partnerReferrals.createdAt)).limit(input.limit);
    }
    return db.select().from(partnerReferrals).orderBy(desc(partnerReferrals.createdAt)).limit(input.limit);
  }),

  updateReferral: adminProcedure.input(z.object({
    id: z.string(),
    status: referralStatus,
    organizationId: z.string().max(64).nullable().optional(),
    notes: z.string().max(5000).nullable().optional(),
  })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [existing] = await db.select({ id: partnerReferrals.id, convertedAt: partnerReferrals.convertedAt })
      .from(partnerReferrals).where(eq(partnerReferrals.id, input.id)).limit(1);
    if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Referral not found" });

    const updates: Record<string, unknown> = { status: input.status };
    if (input.organizationId !== undefined) updates.organizationId = input.organizationId || null;
    if (input.notes !== undefined) updates.notes = input.notes || null;
    if (["converted", "paid"].includes(input.status)) {
      updates.convertedAt = existing.convertedAt || new Date().toISOString();
    } else {
      updates.convertedAt = null;
    }
    await db.update(partnerReferrals).set(updates).where(eq(partnerReferrals.id, input.id));
    return { success: true, id: input.id };
  }),

  getMyProfile: partnerProcedure.query(({ ctx }) => ctx.partner),

  updateMyProfile: partnerProcedure.input(z.object({
    name: z.string().trim().min(2).max(255).optional(),
    company: z.string().trim().max(255).nullable().optional(),
    phone: z.string().trim().max(50).nullable().optional(),
    website: z.string().trim().url().max(500).nullable().optional(),
  })).mutation(async ({ ctx, input }) => {
    const updates = Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
    if (!Object.keys(updates).length) throw new TRPCError({ code: "BAD_REQUEST", message: "No profile fields to update" });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    await db.update(partnerProfiles).set(updates).where(eq(partnerProfiles.id, ctx.partner.id));
    const [profile] = await db.select().from(partnerProfiles).where(eq(partnerProfiles.id, ctx.partner.id)).limit(1);
    return profile;
  }),

  createReferral: partnerProcedure.input(z.object({ referredName: z.string().max(255).optional(), referredEmail: z.string().email().max(320), source: z.string().max(100).default("partner"), notes: z.string().max(5000).optional() })).mutation(async ({ ctx, input }) => {
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const normalizedEmail = input.referredEmail.trim().toLowerCase();
    const id = uuidv4();
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [partners] = await connection.execute<any[]>(
        "SELECT id FROM partner_profiles WHERE id=? AND userId=? AND status IN ('approved','active') LIMIT 1 FOR UPDATE",
        [ctx.partner.id, ctx.user.id],
      );
      if (!partners.length) throw new TRPCError({ code: "FORBIDDEN", message: "Approved partner access required" });
      const [existing] = await connection.execute<any[]>(
        "SELECT id FROM partner_referrals WHERE partnerId=? AND referredEmail=? AND status<>'rejected' LIMIT 1 FOR UPDATE",
        [ctx.partner.id, normalizedEmail],
      );
      if (existing.length) throw new TRPCError({ code: "CONFLICT", message: "This prospect has already been referred." });
      await connection.execute(
        "INSERT INTO partner_referrals (id, partnerId, referredName, referredEmail, source, notes) VALUES (?, ?, ?, ?, ?, ?)",
        [id, ctx.partner.id, input.referredName || null, normalizedEmail, input.source, input.notes || null],
      );
      await connection.commit();
      return { success: true, referralId: id };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),

  listMyReferrals: partnerProcedure.input(z.object({ status: referralStatus.optional(), limit: z.number().int().min(1).max(200).default(100) })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) return [];
    const query = db.select().from(partnerReferrals).where(eq(partnerReferrals.partnerId, ctx.partner.id)).orderBy(desc(partnerReferrals.createdAt)).limit(input.limit);
    return input.status ? query.where(eq(partnerReferrals.status, input.status)) : query;
  }),

  getMyEarnings: partnerProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return {
      commissions: [],
      payouts: [],
      referralSummary: { total: 0, active: 0, converted: 0, conversionRate: 0 },
      totals: { earned: 0, payable: 0, paid: 0, requested: 0 },
    };
    const [commissions, payouts, referrals] = await Promise.all([
      db.select().from(partnerCommissions).where(eq(partnerCommissions.partnerId, ctx.partner.id)).orderBy(desc(partnerCommissions.earnedAt)),
      db.select().from(partnerPayouts).where(eq(partnerPayouts.partnerId, ctx.partner.id)).orderBy(desc(partnerPayouts.requestedAt)),
      db.select({ status: partnerReferrals.status }).from(partnerReferrals).where(eq(partnerReferrals.partnerId, ctx.partner.id)),
    ]);
    const totals = calculatePartnerTotals(commissions, payouts);
    const converted = referrals.filter((row) => ["converted", "paid"].includes(row.status)).length;
    const active = referrals.filter((row) => ["submitted", "qualified"].includes(row.status)).length;
    return {
      commissions,
      payouts,
      referralSummary: {
        total: referrals.length,
        active,
        converted,
        conversionRate: referrals.length ? Math.round((converted / referrals.length) * 100) : 0,
      },
      totals,
    };
  }),

  requestPayout: partnerProcedure.input(z.object({ amount: z.number().positive(), currency: z.string().length(3).default("KES"), method: z.enum(["mpesa", "bank", "paypal"]), reference: z.string().max(255).optional() })).mutation(async ({ ctx, input }) => {
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const connection = await pool.getConnection();
    const id = uuidv4();
    try {
      await connection.beginTransaction();
      const [partners] = await connection.execute<any[]>(
        "SELECT id FROM partner_profiles WHERE id=? AND userId=? AND status IN ('approved','active') LIMIT 1 FOR UPDATE",
        [ctx.partner.id, ctx.user.id],
      );
      if (!partners.length) throw new TRPCError({ code: "FORBIDDEN", message: "Approved partner access required" });
      const [commissions] = await connection.execute<any[]>(
        "SELECT amount, status FROM partner_commissions WHERE partnerId=? FOR UPDATE",
        [ctx.partner.id],
      );
      const [payouts] = await connection.execute<any[]>(
        "SELECT amount, status FROM partner_payouts WHERE partnerId=? FOR UPDATE",
        [ctx.partner.id],
      );
      const { payable } = calculatePartnerTotals(commissions, payouts);
      if (input.amount > payable) throw new TRPCError({ code: "BAD_REQUEST", message: "Requested payout exceeds payable commission" });
      await connection.execute(
        "INSERT INTO partner_payouts (id, partnerId, amount, currency, method, reference) VALUES (?, ?, ?, ?, ?, ?)",
        [id, ctx.partner.id, input.amount.toFixed(2), input.currency.toUpperCase(), input.method, input.reference || null],
      );
      await connection.commit();
      return { success: true, payoutId: id };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }),

  cancelMyPayout: partnerProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const [result] = await pool.execute<any>(
      "UPDATE partner_payouts SET status='cancelled' WHERE id=? AND partnerId=? AND status='requested'",
      [input.id, ctx.partner.id],
    );
    if (!result.affectedRows) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Pending payout request not found or already processing" });
    }
    return { success: true, id: input.id };
  }),

  recordCommission: adminProcedure.input(z.object({ partnerId: z.string(), referralId: z.string().optional(), dealId: z.string().optional(), amount: z.number().positive(), currency: z.string().length(3).default("KES"), status: commissionStatus.default("pending"), payableAt: z.coerce.date().optional(), notes: z.string().max(5000).optional() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const id = uuidv4();
    await db.insert(partnerCommissions).values({ id, partnerId: input.partnerId, referralId: input.referralId || null, dealId: input.dealId || null, amount: input.amount.toString(), currency: input.currency, status: input.status, payableAt: input.payableAt?.toISOString() || null, notes: input.notes || null });
    return { success: true, commissionId: id };
  }),

  listCommissions: adminProcedure.input(z.object({ status: commissionStatus.optional(), partnerId: z.string().optional(), limit: z.number().int().min(1).max(500).default(100) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const filters = [];
    if (input.status) filters.push(eq(partnerCommissions.status, input.status));
    if (input.partnerId) filters.push(eq(partnerCommissions.partnerId, input.partnerId));
    if (filters.length) {
      return db.select().from(partnerCommissions).where(and(...filters))
        .orderBy(desc(partnerCommissions.earnedAt)).limit(input.limit);
    }
    return db.select().from(partnerCommissions).orderBy(desc(partnerCommissions.earnedAt)).limit(input.limit);
  }),

  updateCommission: adminProcedure.input(z.object({ id: z.string(), status: commissionStatus })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    await db.update(partnerCommissions).set({ status: input.status, paidAt: input.status === "paid" ? new Date().toISOString() : undefined }).where(eq(partnerCommissions.id, input.id));
    return { success: true };
  }),

  listPayouts: adminProcedure.input(z.object({ status: z.string().optional(), limit: z.number().int().min(1).max(500).default(100) })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) return [];
    const query = db.select().from(partnerPayouts).orderBy(desc(partnerPayouts.requestedAt)).limit(input.limit);
    return input.status ? query.where(eq(partnerPayouts.status, input.status)) : query;
  }),

  updatePayout: adminProcedure.input(z.object({ id: z.string(), status: z.enum(["requested", "processing", "paid", "rejected"]), notes: z.string().max(5000).optional() })).mutation(async ({ input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    await db.update(partnerPayouts).set({ status: input.status, notes: input.notes, processedAt: ["paid", "rejected"].includes(input.status) ? new Date().toISOString() : undefined }).where(eq(partnerPayouts.id, input.id));
    return { success: true };
  }),

  getProgramReport: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { partners: {}, referrals: {}, commissions: {}, payouts: {} };
    const [profiles, referrals, commissions, payouts] = await Promise.all([
      db.select().from(partnerProfiles),
      db.select().from(partnerReferrals),
      db.select().from(partnerCommissions),
      db.select().from(partnerPayouts),
    ]);
    const countBy = (rows: Array<{ status: string | null }>) => rows.reduce<Record<string, number>>((result, row) => { const key = row.status || "unknown"; result[key] = (result[key] || 0) + 1; return result; }, {});
    return {
      partners: { total: profiles.length, byStatus: countBy(profiles), byType: profiles.reduce((result: Record<string, number>, row: any) => { result[row.partnerType] = (result[row.partnerType] || 0) + 1; return result; }, {}) },
      referrals: { total: referrals.length, byStatus: countBy(referrals) },
      commissions: { total: commissions.length, byStatus: countBy(commissions), gross: commissions.filter((row) => row.status !== "void").reduce((sum, row) => sum + Number(row.amount || 0), 0), paid: commissions.filter((row) => row.status === "paid").reduce((sum, row) => sum + Number(row.amount || 0), 0) },
      payouts: { total: payouts.length, byStatus: countBy(payouts), requested: payouts.filter((row) => ["requested", "processing"].includes(row.status)).reduce((sum, row) => sum + Number(row.amount || 0), 0) },
    };
  }),
});
