import cron from 'node-cron'
import { createNotification, getDb, getPool } from '../db'
import { employees, leaveBalances, hrSettings, timesheets, attendance } from '../../drizzle/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { sendEmail } from '../_core/mail'
import { sendEmailImmediately } from '../services/emailService'
import { v4 as uuidv4 } from 'uuid'

interface HRCronJob {
  name: string
  schedule: string // cron expression
  handler: () => Promise<void>
}

const jobs: HRCronJob[] = []
const registeredJobs: ReturnType<typeof cron.schedule>[] = []

function nairobiDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const part = (type: string) => parts.find((entry) => entry.type === type)?.value || ''
  return `${part('year')}-${part('month')}-${part('day')}`
}

function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] || character)
}

// 1. DAILY ATTENDANCE REMINDER - 9 AM
// Sends reminder to employees who haven't logged attendance
export const dailyAttendanceReminder = (): HRCronJob => ({
  name: 'Daily Attendance Reminder',
  schedule: '0 9 * * *', // 9 AM daily
  handler: async () => {
    console.log('Running daily attendance reminder...')
    const db = await getDb()
    if (!db) {
      console.error('Database not available')
      return
    }
    // Get active employees
    const activeEmployees = await db.query.employees.findMany({
      where: eq(employees.status, 'active'),
    })

    const today = nairobiDateParts(new Date())
    for (const emp of activeEmployees) {
      if (!emp.email) continue
      const attendanceRecord = await db.query.attendance.findFirst({
        where: and(
          eq(attendance.employeeId, emp.id),
          gte(attendance.date, `${today} 00:00:00`),
          lte(attendance.date, `${today} 23:59:59`)
        ),
      })

      if (!attendanceRecord) {
        await sendEmail({
          to: emp.email,
          subject: 'Attendance Reminder',
          html: `<p>Dear ${escapeHtml(emp.firstName)},</p><p>Please log your attendance for today.</p>`,
        })
      }
    }
  },
})

jobs.push(dailyAttendanceReminder())

// 2. MONTHLY LEAVE ACCRUAL - 1st of month
// Accrues annual leave for employees
export const monthlyLeaveAccrual = (): HRCronJob => ({
  name: 'Monthly Leave Accrual',
  schedule: '0 0 1 * *', // 1st of month at midnight
  handler: async () => {
    console.log('Running monthly leave accrual...')
    const db = await getDb()
    if (!db) {
      console.error('Database not available')
      return
    }
    const organizations = await db.select().from(hrSettings).distinct()

    for (const org of organizations) {
      const activeEmployees = await db.query.employees.findMany({
        where: and(
          eq(employees.organizationId, org.organizationId),
          eq(employees.status, 'active')
        ),
      })

      const [currentYear, currentMonth] = nairobiDateParts(new Date()).split('-').map(Number)

      for (const emp of activeEmployees) {
        const settings = await db.query.hrSettings.findFirst({
          where: eq(hrSettings.organizationId, emp.organizationId),
        })
        const leavePolicy = settings?.leavePolicy || { accrualRatePerMonth: 2, maxCarryover: 5 }

        const balance = await db.query.leaveBalances.findFirst({
          where: and(
            eq(leaveBalances.employeeId, emp.id),
            eq(leaveBalances.leaveType, 'annual'),
            eq(leaveBalances.fiscalYear, currentYear)
          ),
        })

        if (balance) {
          const accrualMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}`
          if (String(balance.lastAccrualDate || '').slice(0, 7) === accrualMonth) continue

          const monthlyAccrual = Math.round(balance.totalEntitlement / 12 || leavePolicy.accrualRatePerMonth)
          const newAccrued = (balance.accrued || 0) + (leavePolicy.accrualRatePerMonth || monthlyAccrual)

          await db.update(leaveBalances)
            .set({
              accrued: newAccrued,
              available: newAccrued - (balance.used || 0),
              lastAccrualDate: new Date().toISOString(),
            })
            .where(eq(leaveBalances.id, balance.id))
        }
      }
    }
  },
})

jobs.push(monthlyLeaveAccrual())

// 6. LEAVE EXPIRY REMINDER - November 20th
// Reminds about leave carryover limits
export const leaveExpiryReminder = (): HRCronJob => ({
  name: 'Leave Expiry Reminder',
  schedule: '0 9 20 11 *', // November 20th at 9 AM
  handler: async () => {
    console.log('Running leave expiry reminder...')
    const db = await getDb()
    if (!db) {
      console.error('Database not available')
      return
    }
    const currentYear = new Date().getFullYear()

    // Get all active employees
    const allEmployees = await db.query.employees.findMany({
      where: eq(employees.status, 'active'),
    })

    for (const emp of allEmployees) {
      const balance = await db.query.leaveBalances.findFirst({
        where: and(
          eq(leaveBalances.employeeId, emp.id),
          eq(leaveBalances.leaveType, 'annual'),
          eq(leaveBalances.fiscalYear, currentYear)
        ),
      })

      if (balance && (balance.available || 0) > 5) {
        // Employee has more than max carryover (5 days), send warning
        await sendEmail({
          to: emp.email!,
          subject: 'Leave Carryover Notice',
          html: `<p>Dear ${emp.firstName},</p><p>You have ${balance.available} days of leave remaining. Only 5 days can be carried to next year. Please plan your leave accordingly.</p>`,
        })
      }
    }
  },
})

jobs.push(leaveExpiryReminder())

// 7. BIRTHDAY REMINDERS - Daily
// Notifies managers about employee birthdays
export const birthdayReminder = (): HRCronJob => ({
  name: 'Birthday Reminder',
  schedule: '0 8 * * *', // 8 AM daily
  handler: async () => {
    console.log('Running birthday reminder...')
    const db = await getDb()
    if (!db) {
      console.error('Database not available')
      return
    }
    const today = new Date()
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0')
    const todayDate = String(today.getDate()).padStart(2, '0')

    // Get all employees with birthday today
    const birthdayEmployees = await db.query.employees.findMany({
      where: eq(employees.status, 'active'),
    })

    const birthdays = birthdayEmployees.filter(emp => {
      if (!emp.dateOfBirth) return false
      const empMonth = emp.dateOfBirth.substring(5, 7)
      const empDate = emp.dateOfBirth.substring(8, 10)
      return empMonth === todayMonth && empDate === todayDate
    })

    for (const emp of birthdays) {
      const managers = await db.query.employees.findMany({
        where: eq(employees.department, emp.department),
      })

      for (const manager of managers) {
        if (manager.id !== emp.id) {
          await sendEmail({
            to: manager.email!,
            subject: `Birthday Reminder: ${emp.firstName} ${emp.lastName}`,
            html: `<p>Today is ${emp.firstName}'s birthday! Don't forget to wish them.</p>`,
          })
        }
      }
    }
  },
})

jobs.push(birthdayReminder())

// 8. WORK ANNIVERSARY REMINDER - Annually
// Notifies about work anniversaries
export const workAnniversaryReminder = (): HRCronJob => ({
  name: 'Work Anniversary Reminder',
  schedule: '0 8 * * *', // 8 AM daily
  handler: async () => {
    console.log('Running work anniversary reminder...')
    const db = await getDb()
    if (!db) {
      console.error('Database not available')
      return
    }
    const today = new Date()
    const todayMonth = String(today.getMonth() + 1).padStart(2, '0')
    const todayDate = String(today.getDate()).padStart(2, '0')

    // Get all employees
    const allEmployees = await db.query.employees.findMany({
      where: eq(employees.status, 'active'),
    })

    const anniversaries = allEmployees.filter(emp => {
      if (!emp.hireDate) return false
      const hireMonth = emp.hireDate.substring(5, 7)
      const hireDate = emp.hireDate.substring(8, 10)
      return hireMonth === todayMonth && hireDate === todayDate
    })

    for (const emp of anniversaries) {
      const years = today.getFullYear() - parseInt(emp.hireDate!.substring(0, 4))
      
      if (years > 0) {
        // Send email to HR/Manager
        await sendEmail({
          to: 'hr@company.com',
          subject: `Work Anniversary: ${emp.firstName} ${emp.lastName} - ${years} years`,
          html: `<p>Today marks ${emp.firstName}'s ${years}th work anniversary!</p>`,
        })
      }
    }
  },
})

jobs.push(workAnniversaryReminder())

// 9. TIMESHEET REMINDER - Weekly on Friday
// Reminds employees to submit timesheets
export const timesheetReminder = (): HRCronJob => ({
  name: 'Timesheet Reminder',
  schedule: '0 16 * * 5', // Friday at 4 PM
  handler: async () => {
    console.log('Running timesheet reminder...')
    const db = await getDb()
    if (!db) {
      console.error('Database not available')
      return
    }
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const allEmployees = await db.query.employees.findMany({
      where: eq(employees.status, 'active'),
    })

    for (const emp of allEmployees) {
      const timesheet = await db.query.timesheets.findFirst({
        where: and(
          eq(timesheets.employeeId, emp.id),
          eq(timesheets.status, 'draft')
        ),
      })

      if (!timesheet && emp.email) {
        await sendEmail({
          to: emp.email,
          subject: 'Timesheet Submission Reminder',
          html: `<p>Dear ${emp.firstName},</p><p>Please submit your timesheet for this week before end of day Friday.</p>`,
        })
      }
    }
  },
})

jobs.push(timesheetReminder())

export async function sendContractExpiryAlerts(days = 30): Promise<void> {
  const reminderDays = Math.max(1, Math.min(365, Math.floor(days)))
  const pool = getPool()
  if (!pool) throw new Error('Database connection pool not available')

  const [contracts] = await pool.query(
    `SELECT ec.id, ec.employee_id, ec.contract_type,
            DATE_FORMAT(ec.end_date, '%Y-%m-%d') AS end_date, ec.organization_id,
            e.firstName, e.lastName,
            DATEDIFF(ec.end_date, CURDATE()) AS days_remaining
     FROM employee_contracts ec
     JOIN employees e ON e.id = ec.employee_id
     WHERE ec.status = 'active'
       AND ec.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)`,
    [reminderDays]
  )

  for (const contract of contracts as any[]) {
    const daysRemaining = Number(contract.days_remaining)
    const alertWindow = daysRemaining <= 1 ? 1 : daysRemaining <= 7 ? 7 : reminderDays
    const entityType = `contract_expiry_${alertWindow}`
    const entityId = `${contract.id}:${String(contract.end_date).slice(0, 10)}`
    const employeeName = `${contract.firstName || ''} ${contract.lastName || ''}`.trim() || 'An employee'
    const [recipients] = await pool.query(
      `SELECT id, name, email FROM users
       WHERE organizationId = ? AND role IN ('hr', 'hr_manager', 'super_admin')`,
      [contract.organization_id]
    )

    for (const recipient of recipients as any[]) {
      const [existing] = await pool.query(
        `SELECT id FROM notifications
         WHERE userId = ? AND entityType = ? AND entityId = ? LIMIT 1`,
        [recipient.id, entityType, entityId]
      )
      if ((existing as any[]).length) continue

      const title = daysRemaining <= 0
        ? 'Contract expires today'
        : `Contract expiring in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`
      const message = `${employeeName}'s ${contract.contract_type || 'employment'} contract expires on ${String(contract.end_date).slice(0, 10)}.`
      await createNotification({
        userId: recipient.id,
        type: 'warning',
        title,
        message,
        category: 'hr',
        entityType,
        entityId,
        priority: 'high',
        actionUrl: '/hr/automation',
      } as any)

      if (recipient.email) {
        try {
          await sendEmailImmediately({
            toEmail: recipient.email,
            subject: title,
            htmlContent: `<p>${escapeHtml(message)}</p><p>Please review the contract and arrange any required renewal.</p>`,
          })
        } catch (error) {
          console.error(`[HR] Contract expiry email failed for HR user ${recipient.id}:`, error)
        }
      }
    }
  }
}

export const contractExpiryReminder = (): HRCronJob => ({
  name: 'Contract Expiry Reminder',
  schedule: '0 9 * * *',
  handler: () => sendContractExpiryAlerts(),
})

jobs.push(contractExpiryReminder())

// 10. PERFORMANCE REVIEW CYCLE - Q1, Q2, Q3, Q4 start
// Initiates performance review cycles
export const performanceReviewCycle = (): HRCronJob => ({
  name: 'Performance Review Cycle',
  schedule: '0 0 1 1,4,7,10 *', // 1st of Jan, Apr, Jul, Oct
  handler: async () => {
    console.log('Running performance review cycle...')
    const pool = getPool()
    if (!pool) throw new Error('Database pool not available')

    const periodDateParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: '2-digit',
    }).formatToParts(new Date())
    const year = Number(periodDateParts.find((part) => part.type === 'year')?.value)
    const month = Number(periodDateParts.find((part) => part.type === 'month')?.value)
    const quarter = Math.ceil(month / 3)
    const period = `${year}-Q${quarter}`
    const quarterStart = `${year}-${String((quarter - 1) * 3 + 1).padStart(2, '0')}-01 00:00:00`

    const [employeeRows] = await pool.query(
      `SELECT e.id AS employeeId, e.firstName, e.lastName, e.organizationId,
              manager.id AS reviewerId, manager.userId AS reviewerUserId
       FROM employees e
       LEFT JOIN departments d ON d.id = (
         SELECT d2.id
         FROM departments d2
         WHERE d2.organizationId = e.organizationId
           AND (d2.id = e.department OR d2.name = e.department)
         ORDER BY (d2.id = e.department) DESC
         LIMIT 1
       )
       LEFT JOIN employees manager
         ON manager.id = d.headId
        AND manager.organizationId = e.organizationId
        AND manager.status = 'active'
       WHERE e.status IN ('active', 'on_leave')
         AND e.organizationId IS NOT NULL`
    )

    let created = 0
    let existing = 0
    let skipped = 0
    let notificationFailures = 0

    for (const employee of employeeRows as any[]) {
      if (!employee.reviewerId || employee.reviewerId === employee.employeeId) {
        skipped++
        console.warn(
          `[HR] Quarterly performance review skipped for employee ${employee.employeeId}: department manager is not assigned or is the employee`
        )
        continue
      }

      const [reviewRows] = await pool.query(
        `SELECT id FROM performanceReviews WHERE employeeId = ? AND period = ? LIMIT 1`,
        [employee.employeeId, period]
      )
      let reviewId = (reviewRows as any[])[0]?.id as string | undefined

      if (reviewId) {
        existing++
      } else {
        reviewId = uuidv4()
        await pool.query(
          `INSERT INTO performanceReviews
            (id, employeeId, reviewerId, overallRating, status, period, reviewDate, createdAt, updatedAt)
           VALUES (?, ?, ?, 0, 'draft', ?, ?, NOW(), NOW())`,
          [reviewId, employee.employeeId, employee.reviewerId, period, quarterStart]
        )
        created++
      }

      if (!employee.reviewerUserId) continue

      const [notificationRows] = await pool.query(
        `SELECT id FROM notifications
         WHERE userId = ? AND entityType = 'performance_review_cycle' AND entityId = ?
         LIMIT 1`,
        [employee.reviewerUserId, reviewId]
      )
      if ((notificationRows as any[]).length) continue

      try {
        await createNotification({
          userId: employee.reviewerUserId,
          type: 'info',
          title: 'Quarterly performance review assigned',
          message: `A ${period} performance review is ready for ${employee.firstName} ${employee.lastName}.`,
          category: 'hr',
          entityType: 'performance_review_cycle',
          entityId: reviewId,
          priority: 'normal',
          actionUrl: '/performance-reviews',
        } as any)
      } catch (error) {
        notificationFailures++
        console.error(
          `[HR] Could not notify department manager ${employee.reviewerUserId} about review ${reviewId}:`,
          error
        )
      }
    }

    console.log(
      `[HR] Performance review cycle ${period} complete: ${created} created, ${existing} already existed, ${skipped} skipped without an eligible department manager, ${notificationFailures} notification failures`
    )
  },
})

jobs.push(performanceReviewCycle())

// Initialize all cron jobs
export const initializeHRAutomationJobs = () => {
  if (registeredJobs.length) return registeredJobs
  console.log('Initializing HR automation jobs...')

  for (const job of jobs) {
    const task = cron.schedule(job.schedule, async () => {
      try {
        await job.handler()
      } catch (error) {
        console.error(`[HR] ${job.name} failed:`, error)
      }
    }, { timezone: 'Africa/Nairobi' })
    registeredJobs.push(task)
    console.log(`✓ Scheduled: ${job.name} (${job.schedule})`)
  }

  console.log(`HR automation: ${jobs.length} jobs initialized`)
  return registeredJobs
}
