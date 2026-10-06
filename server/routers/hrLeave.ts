import { router, protectedProcedure } from '../_core/trpc'
import { getDb, logActivity } from '../db'
import { leaveRequests, leaveBalances, leaveApprovals, approvalWorkflows, hrSettings, employees } from '../../drizzle/schema'
import { eq, and, desc, gte, lte, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { createFeatureRestrictedProcedure } from '../middleware/enhancedRbac'
import { countWeekdaysInclusive } from '../../shared/leaveDays'
import { TRPCError } from '@trpc/server'

const getRequestIp = (req: any) => {
  return req?.headers?.['x-forwarded-for'] || req?.ip || null
}

async function getLinkedEmployee(db: any, user: any) {
  const employeeWhere = user.organizationId
    ? and(eq(employees.userId, user.id), eq(employees.organizationId, user.organizationId))
    : eq(employees.userId, user.id)
  const [employee] = await db.select().from(employees).where(employeeWhere).limit(1)
  if (!employee) throw new Error('No employee profile is linked to your account')
  return employee
}

const requestLeaveSchema = z.object({
  leaveType: z.enum(['annual', 'sick', 'maternity', 'paternity', 'unpaid', 'other']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  days: z.number().int(),
  reason: z.string().optional().default(""),
})

const approveLeaveSchema = z.object({
  leaveRequestId: z.string(),
  approvalComments: z.string().optional(),
})

const rejectLeaveSchema = z.object({
  leaveRequestId: z.string(),
  reason: z.string().trim().min(1, "A rejection reason is required"),
})

const reviewLeaveProcedure = createFeatureRestrictedProcedure(["leave:approve", "hr:manage", "admin:all"])
  .use(async ({ ctx, next }) => {
    if (!["hr", "super_admin"].includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only HR Managers and Super Admins can review leave requests",
      })
    }
    return next({ ctx })
  })

export const hrLeaveRouter = router({
  // Request leave
  requestLeave: createFeatureRestrictedProcedure("leave:create")
    .input(requestLeaveSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      const employeeWhere = ctx.user.organizationId
        ? and(eq(employees.userId, ctx.user.id), eq(employees.organizationId, ctx.user.organizationId))
        : eq(employees.userId, ctx.user.id)
      const [employee] = await db.select().from(employees).where(employeeWhere).limit(1)
      if (!employee) throw new Error('No employee profile is linked to your account')
      const organizationId = employee.organizationId || ctx.user.organizationId || null
      const startDate = new Date(input.startDate)
      const endDate = new Date(input.endDate)
      if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime()) || endDate < startDate) {
        throw new Error('Leave end date cannot be before the start date')
      }
      const calculatedDays = countWeekdaysInclusive(startDate, endDate)
      if (calculatedDays === 0) throw new Error('Leave dates must include at least one weekday')
      if (input.days !== calculatedDays) throw new Error(`Leave days must equal ${calculatedDays} for the selected dates`)

      const requiresBalance = input.leaveType !== 'unpaid' && input.leaveType !== 'other'
      let balance: any = null;
      if (organizationId) {
        const orgSettings = await db.query.hrSettings.findFirst({
          where: eq(hrSettings.organizationId, organizationId),
        })
        const leavePolicy = orgSettings?.leavePolicy || { annual: 21, sick: 10, maxCarryover: 5, accrualRatePerMonth: 2 }
        const allowedLeaveTypes = Object.keys(leavePolicy).filter(key => key !== 'maxCarryover' && key !== 'accrualRatePerMonth')

        if (input.leaveType !== 'unpaid' && input.leaveType !== 'other' && !allowedLeaveTypes.includes(input.leaveType)) {
          throw new Error(`Leave type ${input.leaveType} is not supported by the organization's configured leave policy`)
        }

        if (input.leaveType !== 'other') {
          balance = await db.query.leaveBalances.findFirst({
            where: and(
              eq(leaveBalances.employeeId, employee.id),
              eq(leaveBalances.organizationId, organizationId),
              eq(leaveBalances.leaveType, input.leaveType),
              eq(leaveBalances.fiscalYear, new Date().getFullYear())
            ),
          });
        }

        if (!balance && input.leaveType !== 'other') {
          const entitlement = leavePolicy[input.leaveType] ?? 0
          const initialAvailable = requiresBalance ? entitlement : 0

          if (requiresBalance && entitlement < input.days) {
            throw new Error(`Insufficient ${input.leaveType} entitlement. Available: ${entitlement} days`)
          }

          balance = {
            id: uuidv4(),
            organizationId,
            employeeId: employee.id,
            leaveType: input.leaveType,
            fiscalYear: new Date().getFullYear(),
            totalEntitlement: entitlement,
            accrued: entitlement,
            used: 0,
            pending: 0,
            available: initialAvailable,
            createdAt: new Date().toISOString(),
          }

          await db.insert(leaveBalances).values(balance)
        }

        const availableDays = Number(balance?.available || 0)
        if (requiresBalance && availableDays < input.days) {
          throw new Error(`Insufficient ${input.leaveType} leave. Available: ${availableDays} days`)
        }
      }

      const leaveId = uuidv4()

      // Create leave request
      await db.insert(leaveRequests).values({
        id: leaveId,
        organizationId,
        employeeId: employee.id,
        leaveType: input.leaveType,
        startDate: input.startDate,
        endDate: input.endDate,
        days: input.days,
        reason: input.reason,
        status: 'pending',
        createdAt: new Date().toISOString(),
      })

      // Update leave balance (mark as pending and adjust available days for entitlement-based leave)
      if (balance) {
        const leaveBalanceUpdate: any = {
          pending: Number(balance.pending || 0) + input.days,
        }
        if (requiresBalance) {
          leaveBalanceUpdate.available = availableDays - input.days
        }

        await db.update(leaveBalances)
          .set(leaveBalanceUpdate)
          .where(eq(leaveBalances.id, balance.id))
      }

      // Create approval workflow
      if (organizationId) {
        await db.insert(approvalWorkflows).values({
          id: uuidv4(),
          organizationId,
          workflowType: 'leave_request',
          entityId: leaveId,
          requestedBy: ctx.user?.id || 'system',
          requestedAt: new Date().toISOString(),
          status: 'pending',
          createdAt: new Date().toISOString(),
        })
      }

      await logActivity({
        userId: ctx.user?.id || 'system',
        action: 'leave_requested',
        entityType: 'leaveRequest',
        entityId: leaveId,
        description: `Leave request for ${input.days} days of ${input.leaveType} created`,
        metadata: JSON.stringify({ organizationId, employeeId: employee.id, leaveType: input.leaveType, fiscalYear: new Date().getFullYear() }),
        ipAddress: getRequestIp(ctx.req),
      })

      return { leaveRequestId: leaveId }
    }),

  // Get leave request
  getLeaveRequest: protectedProcedure
    .input(z.object({ leaveRequestId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      const employee = await getLinkedEmployee(db, ctx.user)
      const where = ctx.user.organizationId
        ? and(eq(leaveRequests.id, input.leaveRequestId), eq(leaveRequests.employeeId, employee.id), eq(leaveRequests.organizationId, ctx.user.organizationId))
        : and(eq(leaveRequests.id, input.leaveRequestId), eq(leaveRequests.employeeId, employee.id))
      return db.query.leaveRequests.findFirst({
        where,
      })
    }),

  // List leave requests
  listLeaveRequests: reviewLeaveProcedure
    .input(z.object({
      employeeId: z.string().optional(),
      status: z.string().optional(),
      leaveType: z.string().optional(),
      limit: z.number().int().default(50),
      offset: z.number().int().default(0),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      const conditions: any[] = []
      if (ctx.user.organizationId) conditions.push(eq(leaveRequests.organizationId, ctx.user.organizationId))
      if (input.employeeId) conditions.push(eq(leaveRequests.employeeId, input.employeeId))
      if (input.status) conditions.push(eq(leaveRequests.status, input.status as any))
      if (input.leaveType) conditions.push(eq(leaveRequests.leaveType, input.leaveType as any))

      return db.select().from(leaveRequests)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(leaveRequests.createdAt)).limit(input.limit).offset(input.offset)
    }),

  // Approve leave
  approveLeave: reviewLeaveProcedure
    .input(approveLeaveSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      const leaveWhere = ctx.user.organizationId
        ? and(eq(leaveRequests.id, input.leaveRequestId), eq(leaveRequests.organizationId, ctx.user.organizationId))
        : eq(leaveRequests.id, input.leaveRequestId)
      const leaveRequest = await db.query.leaveRequests.findFirst({ where: leaveWhere })

      if (!leaveRequest || leaveRequest.status !== 'pending') {
        throw new Error('Leave request not found')
      }

      // Update leave request
      await db.update(leaveRequests)
        .set({
          status: 'approved',
          approvedBy: ctx.user.id,
          approvalDate: new Date().toISOString(),
        })
        .where(leaveWhere)

      // Update leave balance
      const balance = await db.query.leaveBalances.findFirst({
        where: and(
          eq(leaveBalances.employeeId, leaveRequest.employeeId),
          eq(leaveBalances.leaveType, leaveRequest.leaveType),
          eq(leaveBalances.organizationId, leaveRequest.organizationId)
        ),
      })

      if (balance) {
        await db.update(leaveBalances)
          .set({
            pending: Math.max(0, (balance.pending || 0) - leaveRequest.days),
            used: (balance.used || 0) + leaveRequest.days,
          })
          .where(eq(leaveBalances.id, balance.id))
      }

      // Create approval record
      await db.insert(leaveApprovals).values({
        id: uuidv4(),
        organizationId: leaveRequest.organizationId,
        leaveRequestId: input.leaveRequestId,
        approverId: ctx.user.id,
        approvalStatus: 'approved',
        approvalComments: input.approvalComments,
        approvalDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })

      // Update approval workflow
      await db.update(approvalWorkflows)
        .set({
          status: 'approved',
          approvedBy: ctx.user.id,
          approvedAt: new Date().toISOString(),
        })
        .where(eq(approvalWorkflows.entityId, input.leaveRequestId))

      await logActivity({
        userId: ctx.user.id,
        action: 'leave_request_approved',
        entityType: 'leaveRequest',
        entityId: input.leaveRequestId,
        description: `Leave request ${input.leaveRequestId} approved by ${ctx.user.id}`,
        metadata: JSON.stringify({ organizationId: leaveRequest.organizationId, employeeId: leaveRequest.employeeId, leaveType: leaveRequest.leaveType }),
        ipAddress: getRequestIp(ctx.req),
      })

      return { leaveRequestId: input.leaveRequestId }
    }),

  // Reject leave
  rejectLeave: reviewLeaveProcedure
    .input(rejectLeaveSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      const leaveWhere = ctx.user.organizationId
        ? and(eq(leaveRequests.id, input.leaveRequestId), eq(leaveRequests.organizationId, ctx.user.organizationId))
        : eq(leaveRequests.id, input.leaveRequestId)
      const leaveRequest = await db.query.leaveRequests.findFirst({ where: leaveWhere })

      if (!leaveRequest || leaveRequest.status !== 'pending') {
        throw new Error('Leave request not found')
      }

      // Update leave request
      await db.update(leaveRequests)
        .set({
          status: 'rejected',
          approvedBy: ctx.user.id,
          approvalDate: new Date().toISOString(),
          notes: input.reason,
        })
        .where(leaveWhere)

      // Restore leave balance
      const balance = await db.query.leaveBalances.findFirst({
        where: and(
          eq(leaveBalances.employeeId, leaveRequest.employeeId),
          eq(leaveBalances.leaveType, leaveRequest.leaveType),
          eq(leaveBalances.organizationId, leaveRequest.organizationId)
        ),
      })

      if (balance) {
        await db.update(leaveBalances)
          .set({
            pending: Math.max(0, (balance.pending || 0) - leaveRequest.days),
            available: (balance.available || 0) + leaveRequest.days,
          })
          .where(eq(leaveBalances.id, balance.id))
      }

      // Create rejection record
      await db.insert(leaveApprovals).values({
        id: uuidv4(),
        organizationId: leaveRequest.organizationId,
        leaveRequestId: input.leaveRequestId,
        approverId: ctx.user.id,
        approvalStatus: 'rejected',
        approvalComments: input.reason,
        approvalDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })

      // Update approval workflow
      await db.update(approvalWorkflows)
        .set({
          status: 'rejected',
          approverComments: input.reason,
          approvedAt: new Date().toISOString(),
        })
        .where(eq(approvalWorkflows.entityId, input.leaveRequestId))

      await logActivity({
        userId: ctx.user.id,
        action: 'leave_request_rejected',
        entityType: 'leaveRequest',
        entityId: input.leaveRequestId,
        description: `Leave request ${input.leaveRequestId} rejected`,
        metadata: JSON.stringify({ organizationId: leaveRequest.organizationId, employeeId: leaveRequest.employeeId, leaveType: leaveRequest.leaveType, reason: input.reason }),
        ipAddress: getRequestIp(ctx.req),
      })

      return { leaveRequestId: input.leaveRequestId }
    }),

  // Cancel leave
  cancelLeave: createFeatureRestrictedProcedure(['leave:manage', 'admin:all', 'hr:manage'])
    .input(z.object({
      leaveRequestId: z.string(),
      reason: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      const leaveWhere = ctx.user.organizationId
        ? and(eq(leaveRequests.id, input.leaveRequestId), eq(leaveRequests.organizationId, ctx.user.organizationId))
        : eq(leaveRequests.id, input.leaveRequestId)
      const leaveRequest = await db.query.leaveRequests.findFirst({ where: leaveWhere })

      if (!leaveRequest || leaveRequest.status !== 'approved') {
        throw new Error('Only approved leave can be cancelled')
      }

      // Update leave request
      await db.update(leaveRequests)
        .set({
          status: 'cancelled',
          notes: input.reason,
        })
        .where(leaveWhere)

      // Restore leave balance
      const balance = await db.query.leaveBalances.findFirst({
        where: and(
          eq(leaveBalances.employeeId, leaveRequest.employeeId),
          eq(leaveBalances.leaveType, leaveRequest.leaveType),
          eq(leaveBalances.organizationId, leaveRequest.organizationId)
        ),
      })

      if (balance) {
        await db.update(leaveBalances)
          .set({
            used: Math.max(0, (balance.used || 0) - leaveRequest.days),
            available: (balance.available || 0) + leaveRequest.days,
          })
          .where(eq(leaveBalances.id, balance.id))
      }

      await logActivity({
        userId: ctx.user.id,
        action: 'leave_request_cancelled',
        entityType: 'leaveRequest',
        entityId: input.leaveRequestId,
        description: `Leave request ${input.leaveRequestId} cancelled`,
        metadata: JSON.stringify({ organizationId: leaveRequest.organizationId, employeeId: leaveRequest.employeeId, reason: input.reason }),
        ipAddress: getRequestIp(ctx.req),
      })

      return { leaveRequestId: input.leaveRequestId }
    }),

  // Get leave balance
  getLeaveBalance: protectedProcedure
    .input(z.object({
      leaveType: z.string().optional(),
      fiscalYear: z.number().int().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      const employee = await getLinkedEmployee(db, ctx.user)
      const year = input.fiscalYear || new Date().getFullYear()

      const conditions = [
        eq(leaveBalances.employeeId, employee.id),
        eq(leaveBalances.fiscalYear, year),
        employee.organizationId
          ? eq(leaveBalances.organizationId, employee.organizationId)
          : isNull(leaveBalances.organizationId),
      ]

      if (input.leaveType) {
        conditions.push(eq(leaveBalances.leaveType, input.leaveType as any))
      }

      return db.select().from(leaveBalances).where(and(...conditions))
    }),

  // Get leave history
  getLeaveHistory: protectedProcedure
    .input(z.object({
      limit: z.number().int().default(20),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      const employee = await getLinkedEmployee(db, ctx.user)
      const conditions = [eq(leaveRequests.employeeId, employee.id)]
      conditions.push(employee.organizationId
        ? eq(leaveRequests.organizationId, employee.organizationId)
        : isNull(leaveRequests.organizationId))
      return db.select()
        .from(leaveRequests)
        .where(and(...conditions))
        .orderBy(desc(leaveRequests.startDate))
        .limit(input.limit)
    }),

  // Accrue leave (automated job, called monthly)
  accrueLeave: createFeatureRestrictedProcedure(['payroll:process', 'admin:all', 'hr:manage'])
    .input(z.object({
      organizationId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      if (ctx.user.organizationId && ctx.user.organizationId !== input.organizationId) {
        throw new Error('Cannot accrue leave for another organization')
      }
      const employees_active = await db.query.employees.findMany({
        where: and(
          eq(employees.organizationId, input.organizationId),
          eq(employees.status, 'active')
        ),
      })

      let accrueCount = 0

      for (const emp of employees_active) {
        const balance = await db.query.leaveBalances.findFirst({
          where: and(
            eq(leaveBalances.employeeId, emp.id),
            eq(leaveBalances.organizationId, input.organizationId),
            eq(leaveBalances.leaveType, 'annual'),
            eq(leaveBalances.fiscalYear, new Date().getFullYear())
          ),
        })

        if (balance) {
          const monthlyAccrual = Math.round(balance.totalEntitlement / 12)
          const newAccrued = (balance.accrued || 0) + monthlyAccrual

          await db.update(leaveBalances)
            .set({
              accrued: newAccrued,
              available: newAccrued - (balance.used || 0),
            })
            .where(eq(leaveBalances.id, balance.id))

          accrueCount++
        }
      }

      return { employeesProcessed: accrueCount }
    }),

  // Get leave analytics
  getLeaveAnalytics: reviewLeaveProcedure
    .input(z.object({
      organizationId: z.string().optional(),
      fiscalYear: z.number().int().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      const organizationId = ctx.user.organizationId || input.organizationId
      if (!organizationId) throw new Error('Organization ID is required')
      if (ctx.user.organizationId && input.organizationId && ctx.user.organizationId !== input.organizationId) {
        throw new Error('Cannot view leave analytics for another organization')
      }
      const year = input.fiscalYear || new Date().getFullYear()

      const requests = await db.query.leaveRequests.findMany({
        where: and(
          eq(leaveRequests.organizationId, organizationId),
          gte(leaveRequests.startDate, new Date(`${year}-01-01`).toISOString()),
          lte(leaveRequests.startDate, new Date(`${year}-12-31`).toISOString())
        ),
      })

      const approved = requests.filter(r => r.status === 'approved').length
      const pending = requests.filter(r => r.status === 'pending').length
      const rejected = requests.filter(r => r.status === 'rejected').length
      const totalDays = requests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.days, 0)

      return { approved, pending, rejected, totalDays, totalRequests: requests.length }
    }),
})
