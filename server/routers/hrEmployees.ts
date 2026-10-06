import { router, publicProcedure } from '../_core/trpc'
import { getDb, logActivity } from '../db'
import { employees, employeePromotions, employeeTransfers, employeeSkills, onboardingChecklists, onboardingTasks, leaveBalances, payrollDetails, taxCompliance, organizations } from '../../drizzle/schema'
import { eq, and, desc, like, gte, lte, sql } from 'drizzle-orm'
import { z } from 'zod'
import { sendSystemEmail } from '../services/systemEmailService'
import { v4 as uuidv4 } from 'uuid'
import { createFeatureRestrictedProcedure } from '../middleware/enhancedRbac'

const createEmployeeSchema = z.object({
  organizationId: z.string(),
  employeeNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  dateOfBirth: z.string().datetime().optional(),
  hireDate: z.string().datetime(),
  departmentId: z.string(),
  jobGroupId: z.string(),
  salary: z.number().int(),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'intern', 'contractual', 'hourly', 'wage', 'temporary', 'seasonal']),
  address: z.string().optional(),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  nhifNumber: z.string().optional(),
  nssfNumber: z.string().optional(),
  taxId: z.string().optional(),
  nationalId: z.string().optional(),
})

const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  id: z.string(),
})

const promoteEmployeeSchema = z.object({
  employeeId: z.string(),
  newJobGroupId: z.string(),
  newSalary: z.number().int(),
  promotionDate: z.string().datetime(),
  promotionReason: z.string(),
  approvedBy: z.string().optional(),
})

const transferEmployeeSchema = z.object({
  employeeId: z.string(),
  newDepartmentId: z.string(),
  transferDate: z.string().datetime(),
  transferReason: z.string(),
  approvedBy: z.string().optional(),
})

export const hrEmployeesRouter = router({
  // Create employee
  createEmployee: createFeatureRestrictedProcedure(['hr:manage', 'admin:all'])
    .input(createEmployeeSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb()

      const id = uuidv4()
      
      const newEmployee = await db.insert(employees).values({
        id,
        organizationId: input.organizationId,
        employeeNumber: input.employeeNumber,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        gender: input.gender,
        maritalStatus: input.maritalStatus,
        dateOfBirth: input.dateOfBirth,
        hireDate: input.hireDate,
        department: input.departmentId,
        jobGroupId: input.jobGroupId,
        salary: input.salary,
        employmentType: input.employmentType,
        address: input.address,
        bankName: input.bankName,
        bankBranch: input.bankBranch,
        bankAccountNumber: input.bankAccountNumber,
        nhifNumber: input.nhifNumber,
        nssfNumber: input.nssfNumber,
        taxId: input.taxId,
        nationalId: input.nationalId,
        status: 'active',
        createdBy: ctx.user.id,
        createdAt: new Date().toISOString(),
      })

      // Create onboarding checklist
      const checklistId = uuidv4()
      await db.insert(onboardingChecklists).values({
        id: checklistId,
        organizationId: input.organizationId,
        employeeId: id,
        jobGroupId: input.jobGroupId,
        startDate: input.hireDate,
        status: 'in_progress',
        createdAt: new Date().toISOString(),
      })

      // Create default onboarding tasks
      const tasks = [
        { category: 'it_setup', name: 'Laptop & Email Setup', assignedTo: 'ict_manager' },
        { category: 'it_setup', name: 'System Access & VPN', assignedTo: 'ict_manager' },
        { category: 'paperwork', name: 'Contract Signing', assignedTo: 'hr' },
        { category: 'paperwork', name: 'Tax Forms (P9)', assignedTo: 'hr' },
        { category: 'paperwork', name: 'Insurance Forms', assignedTo: 'hr' },
        { category: 'training', name: 'Company Induction', assignedTo: 'hr' },
        { category: 'training', name: 'Department Orientation', assignedTo: 'manager' },
        { category: 'introduction', name: 'Meet the Team', assignedTo: 'manager' },
      ]

      for (const task of tasks) {
        await db.insert(onboardingTasks).values({
          id: uuidv4(),
          organizationId: input.organizationId,
          checklistId,
          taskName: task.name,
          category: task.category as any,
          priority: 'high',
          status: 'pending',
          createdAt: new Date().toISOString(),
        })
      }

      // Create leave balances for the year
      const leaveTypes = ['annual', 'sick', 'maternity', 'paternity', 'compassion']
      for (const leaveType of leaveTypes) {
        const entitlement = leaveType === 'annual' ? 21 : leaveType === 'sick' ? 10 : 0
        await db.insert(leaveBalances).values({
          id: uuidv4(),
          organizationId: input.organizationId,
          employeeId: id,
          fiscalYear: new Date().getFullYear(),
          leaveType: leaveType as any,
          totalEntitlement: entitlement,
          accrued: 0,
          used: 0,
          available: entitlement,
          createdAt: new Date().toISOString(),
        })
      }

      // Send welcome email
      const fullName = `${input.firstName} ${input.lastName}`
      const [organization] = await db.select({
        name: organizations.name,
        email: organizations.contactEmail,
        address: organizations.address,
        website: organizations.website,
        logo: organizations.logoUrl,
        currency: organizations.currency,
      }).from(organizations).where(eq(organizations.id, input.organizationId)).limit(1)
      await sendSystemEmail('user/employee_welcome', {
        recipientEmail: input.email,
        recipientName: fullName,
        recipient_first_name: input.firstName,
        recipient_email: input.email,
        company: organization,
        app_name: 'Kiini',
        employee_number: input.employeeNumber,
        department_name: input.departmentId,
        start_date: new Date(input.hireDate).toLocaleDateString(),
      }, {
        subject: `Welcome to ${organization?.name || 'the company'}`,
        html: `<p>Dear ${fullName}, welcome to the team. Your onboarding journey begins now.</p>`,
        text: `Dear ${fullName}, welcome to the team. Your onboarding journey begins now.`,
      })

      return { id, employeeNumber: input.employeeNumber }
    }),

  // Get employee details
  getEmployee: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb()

      const employee = await db.query.employees.findFirst({
        where: eq(employees.id, input.id),
      })
      return employee
    }),

  // List employees with filters
  listEmployees: publicProcedure
    .input(z.object({
      organizationId: z.string(),
      department: z.string().optional(),
      status: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().int().default(50),
      offset: z.number().int().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb()

      let query = db.select().from(employees).where(eq(employees.organizationId, input.organizationId))

      if (input.department) {
        query = query.where(eq(employees.department, input.department))
      }

      if (input.status) {
        query = query.where(eq(employees.status, input.status as any))
      }

      if (input.search) {
        query = query.where(
          sql`${employees.firstName} LIKE ${`%${input.search}%`} OR ${employees.lastName} LIKE ${`%${input.search}%`} OR ${employees.email} LIKE ${`%${input.search}%`}`
        )
      }

      const total = await query
      const records = await query.limit(input.limit).offset(input.offset)

      return { records, total: total.length }
    }),

  // Update employee
  updateEmployee: createFeatureRestrictedProcedure(['hr:manage', 'admin:all'])
    .input(updateEmployeeSchema)
    .mutation(async ({ input }) => {
      const db = await getDb()

      const { id, ...data } = input
      await db.update(employees).set(data).where(eq(employees.id, id))
      return { id }
    }),

  // Promote employee
  promoteEmployee: createFeatureRestrictedProcedure(['hr:manage', 'admin:all'])
    .input(promoteEmployeeSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb()

      const employee = await db.query.employees.findFirst({
        where: eq(employees.id, input.employeeId),
      })

      if (!employee) throw new Error('Employee not found')

      const promotionId = uuidv4()
      const previousJobGroupId = employee.jobGroupId
      const previousSalary = employee.salary || 0

      // Record promotion
      await db.insert(employeePromotions).values({
        id: promotionId,
        organizationId: employee.organizationId!,
        employeeId: input.employeeId,
        promotionDate: input.promotionDate,
        previousJobGroupId,
        newJobGroupId: input.newJobGroupId,
        previousSalary,
        newSalary: input.newSalary,
        promotionReason: input.promotionReason,
        approvedBy: input.approvedBy || ctx.user.id,
        approvalDate: input.approvedBy ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString(),
      })

      // Update employee job group and salary
      await db.update(employees)
        .set({ jobGroupId: input.newJobGroupId, salary: input.newSalary })
        .where(eq(employees.id, input.employeeId))

      // Send promotion notification
      const [organization] = await db.select({
        name: organizations.name,
        email: organizations.contactEmail,
        address: organizations.address,
        website: organizations.website,
        logo: organizations.logoUrl,
        currency: organizations.currency,
      }).from(organizations).where(eq(organizations.id, employee.organizationId || ctx.user.organizationId || '')).limit(1)
      await sendSystemEmail('user/promotion', {
        recipientEmail: employee.email!,
        recipientName: employee.firstName,
        recipient_first_name: employee.firstName,
        company: organization,
        app_name: 'Kiini',
        new_job_group: input.newJobGroupId,
        promotion_date: new Date(input.promotionDate).toLocaleDateString(),
        currency: organization?.currency || 'KES',
        new_salary: input.newSalary.toLocaleString(),
        approved_by_name: input.approvedBy || ctx.user.name || 'HR team',
        promotion_reason: input.promotionReason,
      }, {
        subject: `Promotion notification for ${employee.firstName}`,
        html: `<p>Congratulations on your promotion. Your new salary is ${organization?.currency || 'KES'} ${input.newSalary.toLocaleString()}.</p>`,
        text: `Congratulations on your promotion. Your new salary is ${organization?.currency || 'KES'} ${input.newSalary.toLocaleString()}.`,
      })

      return { promotionId }
    }),

  // Transfer employee
  transferEmployee: createFeatureRestrictedProcedure(['hr:manage', 'admin:all'])
    .input(transferEmployeeSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb()

      const employee = await db.query.employees.findFirst({
        where: eq(employees.id, input.employeeId),
      })

      if (!employee) throw new Error('Employee not found')

      const transferId = uuidv4()

      // Record transfer
      await db.insert(employeeTransfers).values({
        id: transferId,
        organizationId: employee.organizationId!,
        employeeId: input.employeeId,
        transferDate: input.transferDate,
        previousDepartmentId: employee.department || '',
        newDepartmentId: input.newDepartmentId,
        transferReason: input.transferReason,
        approvedBy: input.approvedBy || ctx.user.id,
        approvalDate: input.approvedBy ? new Date().toISOString() : undefined,
        createdAt: new Date().toISOString(),
      })

      // Update employee department
      await db.update(employees)
        .set({ department: input.newDepartmentId })
        .where(eq(employees.id, input.employeeId))

      return { transferId }
    }),

  // Terminate employee
  terminateEmployee: createFeatureRestrictedProcedure(['hr:manage', 'admin:all'])
    .input(z.object({
      employeeId: z.string(),
      terminationDate: z.string().datetime(),
      reason: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb()

      const employee = await db.query.employees.findFirst({
        where: eq(employees.id, input.employeeId),
      })

      if (!employee) throw new Error('Employee not found')

      await db.update(employees)
        .set({ status: 'terminated' })
        .where(eq(employees.id, input.employeeId))

      return { employeeId: input.employeeId }
    }),

  // Get employee history (promotions, transfers, leave, payroll)
  getEmployeeHistory: publicProcedure
    .input(z.object({ employeeId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb()

      const promotions = await db.query.employeePromotions.findMany({
        where: eq(employeePromotions.employeeId, input.employeeId),
      })

      const transfers = await db.query.employeeTransfers.findMany({
        where: eq(employeeTransfers.employeeId, input.employeeId),
      })

      return { promotions, transfers }
    }),

  // Add employee skill
  addEmployeeSkill: createFeatureRestrictedProcedure(['hr:manage', 'admin:all'])
    .input(z.object({
      organizationId: z.string(),
      employeeId: z.string(),
      skillName: z.string(),
      proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
      yearsOfExperience: z.number().int().optional(),
      certifications: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb()

      const skillId = uuidv4()
      await db.insert(employeeSkills).values({
        id: skillId,
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        skillName: input.skillName,
        proficiencyLevel: input.proficiencyLevel,
        yearsOfExperience: input.yearsOfExperience || 0,
        certifications: input.certifications ? JSON.stringify(input.certifications) : null,
        createdAt: new Date().toISOString(),
      })
      return { skillId }
    }),

  // Get employee skills
  getEmployeeSkills: publicProcedure
    .input(z.object({ employeeId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      return db.query.employeeSkills.findMany({
        where: eq(employeeSkills.employeeId, input.employeeId),
      })
    }),

  // Get onboarding progress
  getOnboardingProgress: publicProcedure
    .input(z.object({ employeeId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      const checklist = await db.query.onboardingChecklists.findFirst({
        where: eq(onboardingChecklists.employeeId, input.employeeId),
      })

      const tasks = await db.query.onboardingTasks.findMany({
        where: eq(onboardingTasks.checklistId, checklist?.id || ''),
      })

      const completedTasks = tasks.filter(t => t.status === 'completed').length
      const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0

      return { checklist, tasks, progress: Math.round(progress) }
    }),

  // Complete onboarding task
  completeOnboardingTask: createFeatureRestrictedProcedure(['hr:manage', 'admin:all'])
    .input(z.object({
      taskId: z.string(),
      completedBy: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      await db.update(onboardingTasks)
        .set({
          status: 'completed',
          completedBy: input.completedBy,
          completedDate: new Date().toISOString(),
        })
        .where(eq(onboardingTasks.id, input.taskId))

      return { taskId: input.taskId }
    }),

  // Get employee count by department
  getEmployeeCountByDepartment: publicProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      return db.select({
        department: employees.department,
        count: sql<number>`count(*)`.mapWith(Number),
      })
        .from(employees)
        .where(eq(employees.organizationId, input.organizationId))
        .groupBy(employees.department)
    }),
})
