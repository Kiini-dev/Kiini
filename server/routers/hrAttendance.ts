import { router, publicProcedure } from '../_core/trpc'
import { getDb, logActivity } from '../db'
import { attendance, employees, approvalWorkflows } from '../../drizzle/schema'
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm'
import { z } from 'zod'
import { sendEmail } from '../_core/mail'
import { v4 as uuidv4 } from 'uuid'
import { createFeatureRestrictedProcedure } from '../middleware/enhancedRbac'

const recordAttendanceSchema = z.object({
  organizationId: z.string(),
  employeeId: z.string(),
  date: z.string(), // YYYY-MM-DD format
  checkInTime: z.string(), // HH:MM format
  checkOutTime: z.string().optional(),
  status: z.enum(['present', 'absent', 'late', 'half_day', 'work_from_home', 'on_leave']).default('present'),
  remarks: z.string().optional(),
})

const approveAttendanceSchema = z.object({
  attendanceId: z.string(),
  approverId: z.string(),
  approvalStatus: z.enum(['approved', 'rejected']),
  approvalComments: z.string().optional(),
})

const bulkRecordAttendanceSchema = z.object({
  organizationId: z.string(),
  date: z.string(), // YYYY-MM-DD format
  records: z.array(z.object({
    employeeId: z.string(),
    checkInTime: z.string(),
    checkOutTime: z.string().optional(),
    status: z.enum(['present', 'absent', 'late', 'half_day', 'work_from_home', 'on_leave']),
  })),
})

export const hrAttendanceRouter = router({
  // Record attendance
  recordAttendance: createFeatureRestrictedProcedure(['attendance:manage', 'admin:all', 'hr:manage'])
    .input(recordAttendanceSchema)
    .mutation(async ({ input, ctx }) => {
      const db = (await getDb()) as any
      if (!db) throw new Error("Database not initialized")

      // Check if attendance already recorded for this date
      const existing = await db.query.attendance.findFirst({
        where: and(
          eq(attendance.employeeId, input.employeeId),
          eq(attendance.date, input.date as any)
        ),
      })

      if (existing) {
        // Update existing
        await db.update(attendance)
          .set({
            checkInTime: input.checkInTime,
            checkOutTime: input.checkOutTime,
            status: input.status,
            remarks: input.remarks,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(attendance.id, existing.id))

        return { attendanceId: existing.id, created: false }
      }

      // Create new attendance record
      const attendanceId = uuidv4()
      const checkInDate = new Date(`${input.date}T${input.checkInTime}:00`)
      
      // Calculate working hours
      let workingHours = 0
      if (input.checkOutTime) {
        const checkOutDate = new Date(`${input.date}T${input.checkOutTime}:00`)
        workingHours = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60)
      }

      await db.insert(attendance).values({
        id: attendanceId,
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        date: input.date,
        checkInTime: input.checkInTime,
        checkOutTime: input.checkOutTime || null,
        workingHours: workingHours > 0 ? workingHours : null,
        status: input.status,
        remarks: input.remarks,
        approvalStatus: 'pending',
        createdAt: new Date().toISOString(),
        createdBy: ctx.user.id,
      })

      // Create approval workflow
      await db.insert(approvalWorkflows).values({
        id: uuidv4(),
        organizationId: input.organizationId,
        workflowType: 'attendance',
        entityId: attendanceId,
        requestedBy: ctx.user.id,
        requestedAt: new Date().toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      })

      return { attendanceId, created: true }
    }),

  // Get attendance record
  getAttendance: publicProcedure
    .input(z.object({ attendanceId: z.string() }))
    .query(async ({ input }) => {
      const db = (await getDb()) as any
      if (!db) throw new Error("Database not initialized")

      return db.query.attendance.findFirst({
        where: eq(attendance.id, input.attendanceId),
      })
    }),

  // List attendance records with filters
  listAttendance: publicProcedure
    .input(z.object({
      organizationId: z.string(),
      employeeId: z.string().optional(),
      startDate: z.string(), // YYYY-MM-DD
      endDate: z.string(),   // YYYY-MM-DD
      status: z.string().optional(),
      approvalStatus: z.string().optional(),
      limit: z.number().int().default(100),
      offset: z.number().int().default(0),
    }))
    .query(async ({ input }) => {
      const db = (await getDb()) as any
      if (!db) throw new Error("Database not initialized")

      let query: any = db.select().from(attendance).where(
        and(
          eq(attendance.organizationId, input.organizationId),
          gte(attendance.date, input.startDate as any),
          lte(attendance.date, input.endDate as any)
        )
      )

      if (input.employeeId) {
        query = query.where(eq(attendance.employeeId, input.employeeId))
      }

      if (input.status) {
        query = query.where(eq(attendance.status, input.status as any))
      }

      return query.orderBy(desc(attendance.date)).limit(input.limit).offset(input.offset)
    }),

  // Approve attendance
  approveAttendance: createFeatureRestrictedProcedure(['attendance:approve', 'admin:all', 'hr:manage'])
    .input(approveAttendanceSchema)
    .mutation(async ({ input }) => {
      const db = (await getDb()) as any
      if (!db) throw new Error("Database not initialized")

      const record = await db.query.attendance.findFirst({
        where: eq(attendance.id, input.attendanceId),
      })

      if (!record) {
        throw new Error('Attendance record not found')
      }

      await db.update(attendance)
        .set({
          approvalStatus: input.approvalStatus,
          approvedBy: input.approverId,
          approvalDate: new Date().toISOString(),
          approvalComments: input.approvalComments,
        })
        .where(eq(attendance.id, input.attendanceId))

      // Update approval workflow
      await db.update(approvalWorkflows)
        .set({
          status: input.approvalStatus === 'approved' ? 'approved' : 'rejected',
          approvedBy: input.approverId,
          approvedAt: new Date().toISOString(),
        })
        .where(eq(approvalWorkflows.entityId, input.attendanceId))

      return { attendanceId: input.attendanceId }
    }),

  // Bulk record attendance
  bulkRecordAttendance: createFeatureRestrictedProcedure(['attendance:manage', 'admin:all', 'hr:manage'])
    .input(bulkRecordAttendanceSchema)
    .mutation(async ({ input, ctx }) => {
      const db = (await getDb()) as any
      if (!db) throw new Error("Database not initialized")

      const results = []

      for (const record of input.records) {
        try {
          const existingRecord = await db.query.attendance.findFirst({
            where: and(
              eq(attendance.employeeId, record.employeeId),
              eq(attendance.date, input.date as any)
            ),
          })

          const attendanceId = existingRecord?.id || uuidv4()

          if (existingRecord) {
            await db.update(attendance)
              .set({
                checkInTime: record.checkInTime,
                checkOutTime: record.checkOutTime,
                status: record.status,
              })
              .where(eq(attendance.id, attendanceId))
          } else {
            const checkInDate = new Date(`${input.date}T${record.checkInTime}:00`)
            let workingHours = 0

            if (record.checkOutTime) {
              const checkOutDate = new Date(`${input.date}T${record.checkOutTime}:00`)
              workingHours = (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60)
            }

            await db.insert(attendance).values({
              id: attendanceId,
              organizationId: input.organizationId,
              employeeId: record.employeeId,
              date: input.date,
              checkInTime: record.checkInTime,
              checkOutTime: record.checkOutTime || null,
              workingHours: workingHours > 0 ? workingHours : null,
              status: record.status,
              approvalStatus: 'pending',
              createdAt: new Date().toISOString(),
              createdBy: ctx.user.id,
            })
          }

          results.push({ employeeId: record.employeeId, status: 'success' })
        } catch (error: any) {
          results.push({ employeeId: record.employeeId, status: 'failed', error: error.message })
        }
      }

      return { results, processed: results.length }
    }),

  // Get attendance summary for month
  getMonthlyAttendanceSummary: publicProcedure
    .input(z.object({
      organizationId: z.string(),
      employeeId: z.string().optional(),
      year: z.number().int(),
      month: z.number().int().min(1).max(12),
    }))
    .query(async ({ input }) => {
      const db = (await getDb()) as any
      if (!db) throw new Error("Database not initialized")

      const monthStart = `${input.year}-${String(input.month).padStart(2, '0')}-01`
      const monthEnd = new Date(input.year, input.month, 0)
      const monthEndStr = `${input.year}-${String(input.month).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`

      let query: any = db.select().from(attendance).where(
        and(
          eq(attendance.organizationId, input.organizationId),
          gte(attendance.date, monthStart as any),
          lte(attendance.date, monthEndStr as any)
        )
      )

      if (input.employeeId) {
        query = query.where(eq(attendance.employeeId, input.employeeId))
      }

      const records = await query

      const summary = {
        totalDays: 0,
        present: 0,
        absent: 0,
        late: 0,
        halfDay: 0,
        workFromHome: 0,
        onLeave: 0,
        totalWorkingHours: 0,
        averageWorkingHours: 0,
      }

      for (const rec of records) {
        summary.totalDays++
        if (rec.status === 'present') summary.present++
        if (rec.status === 'absent') summary.absent++
        if (rec.status === 'late') summary.late++
        if (rec.status === 'half_day') summary.halfDay++
        if (rec.status === 'work_from_home') summary.workFromHome++
        if (rec.status === 'on_leave') summary.onLeave++
        if (rec.workingHours) summary.totalWorkingHours += rec.workingHours
      }

      summary.averageWorkingHours = summary.totalDays > 0 ? summary.totalWorkingHours / summary.totalDays : 0

      return summary
    }),

  // Get attendance analytics for organization
  getAttendanceAnalytics: publicProcedure
    .input(z.object({
      organizationId: z.string(),
      year: z.number().int(),
      month: z.number().int().min(1).max(12),
    }))
    .query(async ({ input }) => {
      const db = (await getDb()) as any
      if (!db) throw new Error("Database not initialized")

      const monthStart = `${input.year}-${String(input.month).padStart(2, '0')}-01`
      const monthEnd = new Date(input.year, input.month, 0)
      const monthEndStr = `${input.year}-${String(input.month).padStart(2, '0')}-${String(monthEnd.getDate()).padStart(2, '0')}`

      const records = await db.select().from(attendance).where(
        and(
          eq(attendance.organizationId, input.organizationId),
          gte(attendance.date, monthStart as any),
          lte(attendance.date, monthEndStr as any)
        )
      )

      const stats = {
        totalRecords: records.length,
        byStatus: {
          present: records.filter((r: any) => r.status === 'present').length,
          absent: records.filter((r: any) => r.status === 'absent').length,
          late: records.filter((r: any) => r.status === 'late').length,
          halfDay: records.filter((r: any) => r.status === 'half_day').length,
          workFromHome: records.filter((r: any) => r.status === 'work_from_home').length,
          onLeave: records.filter((r: any) => r.status === 'on_leave').length,
        },
        byApprovalStatus: {
          pending: records.filter((r: any) => r.approvalStatus === 'pending').length,
          approved: records.filter((r: any) => r.approvalStatus === 'approved').length,
          rejected: records.filter((r: any) => r.approvalStatus === 'rejected').length,
        },
        attendanceRate: records.length > 0 
          ? Math.round((records.filter((r: any) => r.status === 'present' || r.status === 'late').length / records.length) * 100)
          : 0,
      }

      return stats
    }),

  // Late arrivals report
  getLateArrivalsReport: publicProcedure
    .input(z.object({
      organizationId: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      threshold: z.number().default(30), // minutes after official time
    }))
    .query(async ({ input }) => {
      const db = (await getDb()) as any
      if (!db) throw new Error("Database not initialized")

      const records = await db.select().from(attendance).where(
        and(
          eq(attendance.organizationId, input.organizationId),
          gte(attendance.date, input.startDate as any),
          lte(attendance.date, input.endDate as any),
          eq(attendance.status, 'late')
        )
      )

      return records
    }),

  // Absent employees report
  getAbsentEmployeesReport: publicProcedure
    .input(z.object({
      organizationId: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      const db = (await getDb()) as any
      if (!db) throw new Error("Database not initialized")

      const records = await db.select().from(attendance).where(
        and(
          eq(attendance.organizationId, input.organizationId),
          gte(attendance.date, input.startDate as any),
          lte(attendance.date, input.endDate as any),
          eq(attendance.status, 'absent')
        )
      )

      return records
    }),

  // Get employee attendance dashboard
  getEmployeeAttendanceDashboard: publicProcedure
    .input(z.object({
      employeeId: z.string(),
      year: z.number().int(),
    }))
    .query(async ({ input }) => {
      const db = (await getDb()) as any
      if (!db) throw new Error("Database not initialized")

      const records = await db.select().from(attendance).where(
        and(
          eq(attendance.employeeId, input.employeeId),
          gte(attendance.date, `${input.year}-01-01` as any),
          lte(attendance.date, `${input.year}-12-31` as any)
        )
      )

      const monthlyStats: Record<string, any> = {}
      for (let month = 1; month <= 12; month++) {
        const monthStr = String(month).padStart(2, '0')
        const monthRecords = records.filter((r: any) => r.date?.startsWith(`${input.year}-${monthStr}`))
        
        monthlyStats[monthStr] = {
          present: monthRecords.filter((r: any) => r.status === 'present').length,
          absent: monthRecords.filter((r: any) => r.status === 'absent').length,
          late: monthRecords.filter((r: any) => r.status === 'late').length,
          halfDay: monthRecords.filter((r: any) => r.status === 'half_day').length,
          workFromHome: monthRecords.filter((r: any) => r.status === 'work_from_home').length,
          onLeave: monthRecords.filter((r: any) => r.status === 'on_leave').length,
        }
      }

      return {
        totalRecords: records.length,
        yearStats: {
          present: records.filter((r: any) => r.status === 'present').length,
          absent: records.filter((r: any) => r.status === 'absent').length,
          late: records.filter((r: any) => r.status === 'late').length,
          halfDay: records.filter((r: any) => r.status === 'half_day').length,
          workFromHome: records.filter((r: any) => r.status === 'work_from_home').length,
          onLeave: records.filter((r: any) => r.status === 'on_leave').length,
        },
        monthlyStats,
      }
    }),
})
