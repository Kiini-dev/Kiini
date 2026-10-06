import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { leaveRequests, employees, leaveApprovals, leaveBalances, organizations } from "../../drizzle/schema";
import { eq, inArray, and, desc, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { countWeekdaysInclusive } from "../../shared/leaveDays";
import { TRPCError } from "@trpc/server";

// Define typed procedures
const readProcedure = protectedProcedure;
const leaveReviewerProcedure = createFeatureRestrictedProcedure(["leave:approve", "hr:manage", "admin:all"])
  .use(async ({ ctx, next }) => {
    if (!["hr", "super_admin"].includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only HR Managers and Super Admins can review leave requests",
      });
    }
    return next({ ctx });
  });

async function findCurrentEmployee(db: any, user: any) {
  const conditions = [eq(employees.userId, user.id)];
  if (user.organizationId) conditions.push(eq(employees.organizationId, user.organizationId));
  return db.select().from(employees).where(and(...conditions)).limit(2);
}

async function getCurrentEmployee(db: any, user: any) {
  const matches = await findCurrentEmployee(db, user);
  if (matches.length !== 1) {
    throw new Error(matches.length ? "Your account is linked to multiple employee records" : "No employee profile is linked to your account");
  }
  return matches[0];
}

function employeeOrganizationCondition(employee: any) {
  return employee.organizationId
    ? eq(leaveRequests.organizationId, employee.organizationId)
    : isNull(leaveRequests.organizationId);
}

export async function adjustLeaveBalanceForDecision(db: any, request: any, decision: "approved" | "rejected" | "returned" | "cancelled") {
  if (request.leaveType === "other") return;
  const fiscalYear = new Date(request.startDate).getFullYear();
  const balanceWhere = and(
    eq(leaveBalances.employeeId, request.employeeId),
    eq(leaveBalances.organizationId, request.organizationId),
    eq(leaveBalances.leaveType, request.leaveType),
    eq(leaveBalances.fiscalYear, fiscalYear),
  );
  const [balance] = await db.select().from(leaveBalances).where(balanceWhere).limit(1);
  if (!balance) return;

  const pending = Math.max(0, Number(balance.pending || 0) - Number(request.days || 0));
  const update: any = { pending };
  if (decision === "approved") update.used = Number(balance.used || 0) + Number(request.days || 0);
  else update.available = Number(balance.available || 0) + Number(request.days || 0);
  await db.update(leaveBalances).set(update).where(eq(leaveBalances.id, balance.id));
}

async function enrichLeaveRequests(db: any, requests: any[]) {
  if (!requests.length) return [];
  const employeeIds = [...new Set(requests.map((request) => request.employeeId))];
  const requestIds = requests.map((request) => request.id);
  const organizationIds = [...new Set(requests.map((request) => request.organizationId).filter(Boolean))];
  const [employeeRows, approvalRows, organizationRows] = await Promise.all([
    db.select().from(employees).where(inArray(employees.id, employeeIds)),
    db.select().from(leaveApprovals).where(inArray(leaveApprovals.leaveRequestId, requestIds)).orderBy(desc(leaveApprovals.createdAt)),
    organizationIds.length ? db.select().from(organizations).where(inArray(organizations.id, organizationIds)) : Promise.resolve([]),
  ]);
  const employeesById = new Map<string, any>(employeeRows.map((employee: any) => [employee.id, employee]));
  const organizationsById = new Map<string, any>(organizationRows.map((organization: any) => [organization.id, organization]));
  const latestApprovalByRequest = new Map<string, any>();
  for (const approval of approvalRows) {
    if (!latestApprovalByRequest.has(approval.leaveRequestId)) latestApprovalByRequest.set(approval.leaveRequestId, approval);
  }
  return requests.map((request) => {
    const employee = employeesById.get(request.employeeId);
    const latestApproval = latestApprovalByRequest.get(request.id);
    return {
      ...request,
      employeeName: employee ? `${employee.firstName || ""} ${employee.lastName || ""}`.trim() : "",
      employeeEmail: employee?.email || "",
      organizationName: request.organizationId ? organizationsById.get(request.organizationId)?.name || "Unknown organization" : "Global",
      approvalComments: request.notes || (["returned", "rejected"].includes(request.status) ? latestApproval?.approvalComments : "") || "",
    };
  });
}

export const leaveRouter = router({
  list: readProcedure
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const matches = await findCurrentEmployee(db, ctx.user);
      if (!matches.length) return [];
      if (matches.length > 1) throw new Error("Your account is linked to multiple employee records");
      const employee = matches[0];
      const leaves = await db.select().from(leaveRequests)
        .where(and(eq(leaveRequests.employeeId, employee.id), employeeOrganizationCondition(employee)))
        .orderBy(desc(leaveRequests.createdAt))
        .limit(input?.limit || 50).offset(input?.offset || 0);
      return enrichLeaveRequests(db, leaves);
    }),

  listForApproval: leaveReviewerProcedure
    .input(z.object({
      limit: z.number().int().min(1).max(500).optional(),
      offset: z.number().int().min(0).optional(),
      status: z.enum(["pending", "approved", "rejected", "returned", "cancelled"]).optional(),
      allOrganizations: z.boolean().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      if (!ctx.user.organizationId && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "An organization is required to view leave requests" });
      }
      if (input?.allOrganizations && ctx.user.role !== "super_admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Only platform administrators can view leave requests across organizations" });
      }
      const conditions: any[] = [];
      if (input?.allOrganizations !== true && ctx.user.organizationId) conditions.push(eq(leaveRequests.organizationId, ctx.user.organizationId));
      if (input?.status) conditions.push(eq(leaveRequests.status, input.status));
      const leaves = await db.select().from(leaveRequests)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(leaveRequests.createdAt))
        .limit(input?.limit || 500).offset(input?.offset || 0);
      return enrichLeaveRequests(db, leaves);
    }),

  getById: readProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const employee = await getCurrentEmployee(db, ctx.user);
      const result = await db.select().from(leaveRequests).where(and(
        eq(leaveRequests.id, input),
        eq(leaveRequests.employeeId, employee.id),
        employeeOrganizationCondition(employee),
      )).limit(1);
      return (await enrichLeaveRequests(db, result))[0] || null;
    }),

  getForApproval: leaveReviewerProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const where = ctx.user.role === "super_admin"
        ? eq(leaveRequests.id, input)
        : ctx.user.organizationId
        ? and(eq(leaveRequests.id, input), eq(leaveRequests.organizationId, ctx.user.organizationId))
        : eq(leaveRequests.id, input);
      const result = await db.select().from(leaveRequests).where(where).limit(1);
      return (await enrichLeaveRequests(db, result))[0] || null;
    }),

  byEmployee: readProcedure
    .input(z.object({ employeeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const employee = await getCurrentEmployee(db, ctx.user);
      if (input.employeeId !== employee.id) return [];
      const result = await db.select().from(leaveRequests).where(and(
        eq(leaveRequests.employeeId, employee.id),
        employeeOrganizationCondition(employee),
      )).orderBy(desc(leaveRequests.createdAt));
      return enrichLeaveRequests(db, result);
    }),

  create: createFeatureRestrictedProcedure("leave:create")
    .input(z.object({
      leaveType: z.enum(["annual", "sick", "maternity", "paternity", "unpaid", "other"]),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      days: z.number().int().positive("Days must be a positive whole number"),
      reason: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const employee = await getCurrentEmployee(db, ctx.user);
      if (input.endDate < input.startDate) throw new Error("Leave end date cannot be before start date");
      const calculatedDays = countWeekdaysInclusive(input.startDate, input.endDate);
      if (calculatedDays === 0) throw new Error("Leave dates must include at least one weekday");
      if (input.days !== calculatedDays) throw new Error(`Leave days must equal ${calculatedDays} for the selected dates`);
      
      const id = uuidv4();
      const { startDate, endDate, ...requestData } = input;
      const insertData: any = {
        ...requestData,
        startDate: startDate.toISOString().replace('T', ' ').substring(0, 19),
        endDate: endDate.toISOString().replace('T', ' ').substring(0, 19),
      };

      await db.insert(leaveRequests).values({
        id,
        ...insertData,
        employeeId: employee.id,
        organizationId: employee.organizationId ?? null,
        status: "pending",
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      });
      return { id };
    }),

  update: createFeatureRestrictedProcedure("leave:create")
    .input(z.object({
      id: z.string(),
      leaveType: z.enum(["annual", "sick", "maternity", "paternity", "unpaid", "other"]).optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      days: z.number().int().positive("Days must be a positive whole number").optional(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      const employee = await getCurrentEmployee(db, ctx.user);
      const updateWhere = and(eq(leaveRequests.id, id), eq(leaveRequests.employeeId, employee.id), employeeOrganizationCondition(employee));
      const existing = await db.select().from(leaveRequests).where(updateWhere).limit(1);
      if (!existing.length) throw new Error("Leave request not found");
      const current = existing[0] as any;
      if (!["pending", "returned"].includes(current.status)) throw new Error("Only pending or returned leave requests can be edited");
      const nextStart = data.startDate || new Date(current.startDate);
      const nextEnd = data.endDate || new Date(current.endDate);
      if (data.leaveType && data.leaveType !== current.leaveType) {
        throw new Error("Leave type cannot be changed after submission; cancel and submit a new request");
      }
      if (nextEnd < nextStart) throw new Error("Leave end date cannot be before start date");
      const calculatedDays = countWeekdaysInclusive(nextStart, nextEnd);
      if (calculatedDays === 0) throw new Error("Leave dates must include at least one weekday");
      if (data.days !== undefined && data.days !== calculatedDays) throw new Error(`Leave days must equal ${calculatedDays} for the selected dates`);
      const nextDays = data.days ?? calculatedDays;
      const dayDelta = nextDays - Number(current.days || 0);
      if (dayDelta !== 0 && current.leaveType !== "other") {
        const fiscalYear = new Date(current.startDate).getFullYear();
        const [balance] = await db.select().from(leaveBalances).where(and(
          eq(leaveBalances.employeeId, current.employeeId),
          eq(leaveBalances.organizationId, current.organizationId),
          eq(leaveBalances.leaveType, current.leaveType),
          eq(leaveBalances.fiscalYear, fiscalYear),
        )).limit(1);
        if (dayDelta > 0 && balance && Number(balance.available || 0) < dayDelta) {
          throw new Error(`Insufficient leave balance. Available: ${balance.available} days`);
        }
        if (balance) await db.update(leaveBalances).set({
          pending: Math.max(0, Number(balance.pending || 0) + dayDelta),
          available: Number(balance.available || 0) - dayDelta,
        } as any).where(eq(leaveBalances.id, balance.id));
      }
      const updateData: any = {
        ...data,
        reason: data.reason ?? current.reason,
        notes: current.status === "returned" ? null : current.notes,
        status: current.status === "returned" ? "pending" : current.status,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        startDate: (data as any).startDate ? (data as any).startDate.toISOString().replace('T', ' ').substring(0, 19) : undefined,
        endDate: (data as any).endDate ? (data as any).endDate.toISOString().replace('T', ' ').substring(0, 19) : undefined,
      };
      await db.update(leaveRequests).set(updateData as any).where(updateWhere);
      return { success: true };
    }),

  delete: createFeatureRestrictedProcedure("leave:create")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const employee = await getCurrentEmployee(db, ctx.user);
      const deleteWhere = and(eq(leaveRequests.id, input), eq(leaveRequests.employeeId, employee.id), employeeOrganizationCondition(employee), inArray(leaveRequests.status, ["pending", "returned"]));
      const [request] = await db.select().from(leaveRequests).where(deleteWhere).limit(1);
      if (!request) throw new Error("Pending leave request not found");
      await db.delete(leaveRequests).where(deleteWhere);
      await adjustLeaveBalanceForDecision(db, request, "cancelled");
      return { success: true };
    }),

  approve: leaveReviewerProcedure
    .input(z.object({ id: z.string(), organizationId: z.string().nullable().optional(), comments: z.string().max(4000).optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const leaveWhere = ctx.user.role === "super_admin"
        ? input.organizationId === null
          ? and(eq(leaveRequests.id, input.id), isNull(leaveRequests.organizationId))
          : input.organizationId
            ? and(eq(leaveRequests.id, input.id), eq(leaveRequests.organizationId, input.organizationId))
            : eq(leaveRequests.id, input.id)
        : ctx.user.organizationId
          ? and(eq(leaveRequests.id, input.id), eq(leaveRequests.organizationId, ctx.user.organizationId))
          : undefined;
      if (!leaveWhere) throw new TRPCError({ code: "FORBIDDEN", message: "An organization is required to review leave requests" });
      const [request] = await db.select().from(leaveRequests).where(leaveWhere).limit(1);
      if (!request) throw new Error("Leave request not found");
      if (request.status !== "pending") throw new Error("Only pending leave requests can be approved");
      const now = new Date().toISOString().replace("T", " ").substring(0, 19);
      await db.update(leaveRequests).set({ status: "approved", approvedBy: ctx.user.id, approvalDate: now, updatedAt: now } as any).where(leaveWhere);
      await db.insert(leaveApprovals).values({
        id: uuidv4(), organizationId: request.organizationId || ctx.user.organizationId || "global",
        leaveRequestId: request.id, approverId: ctx.user.id, approvalStatus: "approved",
        approvalComments: input.comments?.trim() || null, approvalDate: now, createdAt: now,
      } as any);
      await adjustLeaveBalanceForDecision(db, request, "approved");
      return { success: true };
    }),

  reject: leaveReviewerProcedure
    .input(z.object({ id: z.string(), organizationId: z.string().nullable().optional(), comments: z.string().trim().min(1, "A rejection reason is required").max(4000) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const leaveWhere = ctx.user.role === "super_admin"
        ? input.organizationId === null
          ? and(eq(leaveRequests.id, input.id), isNull(leaveRequests.organizationId))
          : input.organizationId
            ? and(eq(leaveRequests.id, input.id), eq(leaveRequests.organizationId, input.organizationId))
            : eq(leaveRequests.id, input.id)
        : ctx.user.organizationId
          ? and(eq(leaveRequests.id, input.id), eq(leaveRequests.organizationId, ctx.user.organizationId))
          : undefined;
      if (!leaveWhere) throw new TRPCError({ code: "FORBIDDEN", message: "An organization is required to review leave requests" });
      const [request] = await db.select().from(leaveRequests).where(leaveWhere).limit(1);
      if (!request) throw new Error("Leave request not found");
      if (request.status !== "pending") throw new Error("Only pending leave requests can be rejected");
      const now = new Date().toISOString().replace("T", " ").substring(0, 19);
      await db.update(leaveRequests).set({ status: "rejected", approvedBy: ctx.user.id, approvalDate: now, notes: input.comments, updatedAt: now } as any).where(leaveWhere);
      await db.insert(leaveApprovals).values({
        id: uuidv4(), organizationId: request.organizationId || ctx.user.organizationId || "global",
        leaveRequestId: request.id, approverId: ctx.user.id, approvalStatus: "rejected",
        approvalComments: input.comments, approvalDate: now, createdAt: now,
      } as any);
      await adjustLeaveBalanceForDecision(db, request, "rejected");
      return { success: true };
    }),

  returnForRevision: leaveReviewerProcedure
    .input(z.object({
      id: z.string(),
      organizationId: z.string().nullable().optional(),
      comments: z.string().trim().min(1, "A return reason is required").max(4000),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const leaveWhere = ctx.user.role === "super_admin"
        ? input.organizationId === null
          ? and(eq(leaveRequests.id, input.id), isNull(leaveRequests.organizationId))
          : input.organizationId
            ? and(eq(leaveRequests.id, input.id), eq(leaveRequests.organizationId, input.organizationId))
            : eq(leaveRequests.id, input.id)
        : ctx.user.organizationId
          ? and(eq(leaveRequests.id, input.id), eq(leaveRequests.organizationId, ctx.user.organizationId))
          : undefined;
      if (!leaveWhere) throw new TRPCError({ code: "FORBIDDEN", message: "An organization is required to return leave requests" });
      const [request] = await db.select().from(leaveRequests).where(leaveWhere).limit(1);
      if (!request) throw new Error("Leave request not found");
      if (request.status !== "pending") throw new Error("Only pending leave requests can be returned");
      const now = new Date().toISOString().replace("T", " ").substring(0, 19);
      await db.update(leaveRequests).set({ status: "returned", approvedBy: ctx.user.id, approvalDate: now, notes: input.comments, updatedAt: now } as any).where(leaveWhere);
      await db.insert(leaveApprovals).values({
        id: uuidv4(), organizationId: request.organizationId || ctx.user.organizationId || "global",
        leaveRequestId: request.id, approverId: ctx.user.id, approvalStatus: "returned",
        approvalComments: input.comments, approvalDate: now, createdAt: now,
      } as any);
      return { success: true };
    }),

  byStatus: readProcedure
    .input(z.object({ status: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const matches = await findCurrentEmployee(db, ctx.user);
      if (!matches.length) return [];
      if (matches.length > 1) throw new Error("Your account is linked to multiple employee records");
      const employee = matches[0];
      const where = and(
        eq(leaveRequests.status, input.status as any),
        eq(leaveRequests.employeeId, employee.id),
        employeeOrganizationCondition(employee),
      );
      const result = await db.select().from(leaveRequests).where(where);
      return result;
    }),
});
