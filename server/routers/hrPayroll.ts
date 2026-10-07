import { router, publicProcedure } from '../_core/trpc'
import { getDb, logActivity } from '../db'
import { payrollBatches, payrollDetails, payslips, taxCompliance, employees, leaveBalances, hrSettings, approvalWorkflows } from '../../drizzle/schema'
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm'
import { z } from 'zod'
import { sendEmail } from '../_core/mail'
import { v4 as uuidv4 } from 'uuid'
import { createFeatureRestrictedProcedure } from '../middleware/enhancedRbac'
import { departments } from '../../drizzle/schema'
import { calculateKenyanPayroll } from '../utils/kenyan-payroll-calculator'
import { checkBudget, deductFromBudget, findActiveBudget } from '../utils/budgetEnforcer'
import { recordPayrollCostAllocation } from '../services/payrollCostAllocationService'

const calculatePayrollSchema = z.object({
  organizationId: z.string(),
  payMonth: z.string().datetime(),
  payPeriodStart: z.string().datetime(),
  payPeriodEnd: z.string().datetime(),
  employeeIds: z.array(z.string()).optional(),
  autoProcess: z.boolean().default(false),
})

const approvePayrollSchema = z.object({
  batchId: z.string(),
  approverComments: z.string().optional(),
})

const processPayrollSchema = z.object({
  batchId: z.string(),
  paymentDate: z.string().datetime(),
})

const generateP9Schema = z.object({
  organizationId: z.string(),
  employeeId: z.string(),
  taxYear: z.number().int(),
})

// NSSF calculation (6% of basic salary, max KES 1,080/month as of 2024)
const calculateNSSF = (basicSalary: number) => {
  const maxNSSF = 1080
  return Math.min(Math.round(basicSalary * 0.06), maxNSSF)
}

// NHIF calculation (tiered based on gross salary)
const calculateNHIF = (grossSalary: number) => {
  if (grossSalary < 5999) return 150
  if (grossSalary < 7999) return 300
  if (grossSalary < 11999) return 400
  if (grossSalary < 15999) return 500
  if (grossSalary < 19999) return 600
  if (grossSalary < 24999) return 750
  if (grossSalary < 29999) return 850
  if (grossSalary < 34999) return 900
  if (grossSalary < 39999) return 950
  if (grossSalary < 44999) return 1000
  if (grossSalary < 49999) return 1100
  if (grossSalary < 59999) return 1200
  if (grossSalary < 69999) return 1300
  if (grossSalary < 79999) return 1400
  if (grossSalary < 89999) return 1500
  return 1600
}

// PAYE calculation (progressive tax - Kenya)
const calculatePAYE = (taxableIncome: number) => {
  let tax = 0
  if (taxableIncome > 0 && taxableIncome <= 24000) {
    tax = taxableIncome * 0.10
  } else if (taxableIncome > 24000 && taxableIncome <= 40320) {
    tax = 2400 + (taxableIncome - 24000) * 0.25
  } else if (taxableIncome > 40320) {
    tax = 2400 + 4080 + (taxableIncome - 40320) * 0.30
  }
  return Math.round(tax)
}

type PayrollRules = {
  countryCode: string
  currencyLabel: string
  payeReliefMonthly: number
  nssf: { rate: number; cap?: number }
  nhif: (grossSalary: number) => number
  paye: (taxableIncome: number) => number
  statutoryTemplates: { payslip: string; taxForm: string; auditTrail: string }
}

const getPayrollRulesForCountry = (countryCode = 'KE'): PayrollRules => {
  const upperCode = countryCode.toUpperCase()
  switch (upperCode) {
    case 'NG':
      return {
        countryCode: 'NG',
        currencyLabel: 'NGN',
        payeReliefMonthly: 2000,
        nssf: { rate: 0.0 },
        nhif: () => 0,
        paye: (taxableIncome: number) => Math.round(Math.max(0, taxableIncome * 0.075)),
        statutoryTemplates: { payslip: 'NG-PAYSLIP', taxForm: 'ITF', auditTrail: 'NG-AUDIT' },
      }
    case 'ZA':
      return {
        countryCode: 'ZA',
        currencyLabel: 'ZAR',
        payeReliefMonthly: 0,
        nssf: { rate: 0.0 },
        nhif: () => 0,
        paye: (taxableIncome: number) => Math.round(Math.max(0, taxableIncome * 0.18)),
        statutoryTemplates: { payslip: 'ZA-PAYSLIP', taxForm: 'IRP5', auditTrail: 'ZA-AUDIT' },
      }
    case 'UG':
      return {
        countryCode: 'UG',
        currencyLabel: 'UGX',
        payeReliefMonthly: 10000,
        nssf: { rate: 0.0 },
        nhif: () => 0,
        paye: (taxableIncome: number) => Math.round(Math.max(0, taxableIncome * 0.10)),
        statutoryTemplates: { payslip: 'UG-PAYSLIP', taxForm: 'IT3', auditTrail: 'UG-AUDIT' },
      }
    case 'GH':
      return {
        countryCode: 'GH',
        currencyLabel: 'GHS',
        payeReliefMonthly: 100,
        nssf: { rate: 0.0 },
        nhif: () => 0,
        paye: (taxableIncome: number) => Math.round(Math.max(0, taxableIncome * 0.10)),
        statutoryTemplates: { payslip: 'GH-PAYSLIP', taxForm: 'GHS-ITF', auditTrail: 'GH-AUDIT' },
      }
    case 'TZ':
      return {
        countryCode: 'TZ',
        currencyLabel: 'TZS',
        payeReliefMonthly: 0,
        nssf: { rate: 0.0 },
        nhif: () => 0,
        paye: (taxableIncome: number) => Math.round(Math.max(0, taxableIncome * 0.10)),
        statutoryTemplates: { payslip: 'TZ-PAYSLIP', taxForm: 'TAX-FORM', auditTrail: 'TZ-AUDIT' },
      }
    case 'ET':
      return {
        countryCode: 'ET',
        currencyLabel: 'ETB',
        payeReliefMonthly: 0,
        nssf: { rate: 0.0 },
        nhif: () => 0,
        paye: (taxableIncome: number) => Math.round(Math.max(0, taxableIncome * 0.15)),
        statutoryTemplates: { payslip: 'ET-PAYSLIP', taxForm: 'ET-ITF', auditTrail: 'ET-AUDIT' },
      }
    default:
      return {
        countryCode: 'KE',
        currencyLabel: 'KES',
        payeReliefMonthly: 2400,
        nssf: { rate: 0.06, cap: 1080 },
        nhif: calculateNHIF,
        paye: calculatePAYE,
        statutoryTemplates: { payslip: 'KE-PAYSLIP', taxForm: 'P9', auditTrail: 'KE-AUDIT' },
      }
  }
}

const calculateCountryDeductions = (rules: PayrollRules, basicSalary: number, grossSalary: number) => {
  const nssfDeduction = rules.nssf.cap ? Math.min(Math.round(basicSalary * rules.nssf.rate), rules.nssf.cap) : Math.round(basicSalary * rules.nssf.rate)
  const nhifDeduction = rules.nhif(grossSalary)
  const taxableIncome = Math.max(0, grossSalary - nssfDeduction)
  const payeDeduction = rules.paye(taxableIncome)
  const totalDeductions = nssfDeduction + nhifDeduction + payeDeduction
  return { nssfDeduction, nhifDeduction, payeDeduction, taxableIncome, totalDeductions }
}

const formatPayrollCurrency = (amount: number, currencyLabel: string) => `${currencyLabel} ${amount.toLocaleString()}`

const getStatutoryTemplateContent = (countryCode: string) => {
  const templates: Record<string, any> = {
    KE: {
      payslip: '<h1>Kenya Payslip</h1><p>Use this template for monthly pay documentation.</p>',
      taxForm: '<h1>P9 Tax Statement</h1><p>Annual tax statement for Kenya employees.</p>',
      auditTrail: '<h1>Payroll Audit Trail</h1><p>Payroll batch audit history for Kenyan compliance.</p>',
    },
    NG: {
      payslip: '<h1>Nigeria Payslip</h1><p>Use this template for payroll disclosures.</p>',
      taxForm: '<h1>ITF Tax Form</h1><p>Nigerian annual tax form.</p>',
      auditTrail: '<h1>Payroll Audit Trail</h1><p>Nigeria payroll compliance log.</p>',
    },
    ZA: {
      payslip: '<h1>South Africa Payslip</h1><p>South Africa pay documentation template.</p>',
      taxForm: '<h1>IRP5 Tax Certificate</h1><p>South African IRP5 form.</p>',
      auditTrail: '<h1>Payroll Audit Trail</h1><p>South Africa payroll compliance audit history.</p>',
    },
    UG: {
      payslip: '<h1>Uganda Payslip</h1><p>Ugandan payroll statement.</p>',
      taxForm: '<h1>IT3 Tax Form</h1><p>Ugandan annual PAYE statement.</p>',
      auditTrail: '<h1>Payroll Audit Trail</h1><p>Uganda payroll compliance log.</p>',
    },
  }

  return templates[countryCode.toUpperCase()] || templates['KE']
}

const resolveStatutoryTemplates = (settings: any, payrollRules: PayrollRules) => {
  return {
    ...payrollRules.statutoryTemplates,
    ...(settings?.statutoryReportTemplates || {}),
    content: getStatutoryTemplateContent(settings?.countryCode || payrollRules.countryCode),
  }
}

const getRequestIp = (req: any) => {
  return req?.headers?.['x-forwarded-for'] || req?.ip || null
}

type CalculatePayrollInput = {
  organizationId: string
  payMonth: string
  payPeriodStart: string
  payPeriodEnd: string
  employeeIds?: string[]
  autoProcess?: boolean
}

export async function calculatePayrollBatch(input: CalculatePayrollInput, userId: string) {
  const db = await getDb()
  if (!db) throw new Error('Database not available')

  const batchNumber = `PB-${new Date().getFullYear()}-${String(new Date(input.payMonth).getMonth() + 1).padStart(2, '0')}-${uuidv4().substring(0, 4).toUpperCase()}`
  const batchId = uuidv4()

  let empList = input.employeeIds
  if (!empList || empList.length === 0) {
    const emps = await db.query.employees.findMany({
      where: and(
        eq(employees.organizationId, input.organizationId),
        eq(employees.status, 'active')
      ),
    })
    empList = emps.map((e: any) => e.id)
  }

  let totalGross = 0
  let totalDeductions = 0
  let totalNet = 0
  const payrollDetailsData: any[] = []

  const orgSettings = await db.query.hrSettings.findFirst({
    where: eq(hrSettings.organizationId, input.organizationId),
  })
  const defaultCountry = orgSettings?.countryCode || 'KE'

  for (const empId of empList) {
    const employee = await db.query.employees.findFirst({
      where: eq(employees.id, empId),
    })

    if (!employee) continue

    const basicSalary = employee.salary || 0
    const allowances = 0
    const bonuses = 0
    const grossSalary = basicSalary + allowances + bonuses
    const employeeCountry = employee.country || defaultCountry
    const payrollRules = getPayrollRulesForCountry(employeeCountry)
    const loanDeduction = 0
    const otherDeductions = 0
    const countryDeductions = calculateCountryDeductions(payrollRules, basicSalary, grossSalary)
    const totalDeduction = countryDeductions.totalDeductions + loanDeduction + otherDeductions
    const netSalary = grossSalary - totalDeduction

    payrollDetailsData.push({
      id: uuidv4(),
      payrollId: batchId,
      itemType: 'payroll',
      itemId: empId,
      description: `Payroll for ${input.payMonth.slice(0, 7)}`,
      amount: grossSalary,
      isDeduction: false,
      lineNumber: 1,
      organizationId: input.organizationId,
      batchId,
      employeeId: empId,
      payMonth: input.payMonth,
      basicSalary,
      allowances,
      bonuses,
      grossSalary,
      nssfDeduction: countryDeductions.nssfDeduction,
      nhifDeduction: countryDeductions.nhifDeduction,
      payeDeduction: countryDeductions.payeDeduction,
      loanDeduction,
      otherDeductions,
      totalDeductions: totalDeduction,
      netSalary,
      countryCode: employeeCountry,
      currencyLabel: payrollRules.currencyLabel,
      status: 'draft',
      createdAt: new Date().toISOString(),
    })

    totalGross += grossSalary
    totalDeductions += totalDeduction
    totalNet += netSalary
  }

  await db.insert(payrollBatches).values({
    id: batchId,
    organizationId: input.organizationId,
    batchNumber,
    payMonth: input.payMonth,
    payPeriodStart: input.payPeriodStart,
    payPeriodEnd: input.payPeriodEnd,
    employeeCount: payrollDetailsData.length,
    totalGross,
    totalDeductions,
    totalNet,
    status: 'calculated',
    createdBy: userId,
    createdAt: new Date().toISOString(),
  })

  for (const detail of payrollDetailsData) {
    await db.insert(payrollDetails).values(detail)
  }

  await db.insert(approvalWorkflows).values({
    id: uuidv4(),
    organizationId: input.organizationId,
    workflowType: 'payroll_batch',
    entityId: batchId,
    requestedBy: userId,
    requestedAt: new Date().toISOString(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  })

  await logActivity({
    userId,
    action: 'payroll_batch_calculated',
    entityType: 'payrollBatch',
    entityId: batchId,
    description: `Payroll batch ${batchNumber} calculated for ${payrollDetailsData.length} employees`,
    metadata: JSON.stringify({ organizationId: input.organizationId, payMonth: input.payMonth, countryCode: defaultCountry }),
    ipAddress: null,
  })

  if (input.autoProcess && orgSettings?.autoApprovePayroll) {
    await db.update(payrollBatches)
      .set({ status: 'approved', approvedBy: userId, approvalDate: new Date().toISOString() })
      .where(eq(payrollBatches.id, batchId))

    await db.update(payrollDetails)
      .set({ status: 'approved' })
      .where(eq(payrollDetails.batchId, batchId))

    await db.update(approvalWorkflows)
      .set({ status: 'approved', approvedBy: userId, approvedAt: new Date().toISOString() })
      .where(eq(approvalWorkflows.entityId, batchId))
  }

  return { batchId, batchNumber, employeeCount: payrollDetailsData.length, totalGross, totalDeductions, totalNet }
}

export async function generateP9TaxForm(input: { organizationId: string; employeeId: string; taxYear: number }, userId: string) {
  const db = await getDb()
  if (!db) throw new Error('Database not available')

  const yearStart = new Date(`${input.taxYear}-01-01`).toISOString()
  const yearEnd = new Date(`${input.taxYear}-12-31`).toISOString()

  const yearPayrolls = await db.query.payrollDetails.findMany({
    where: and(
      eq(payrollDetails.employeeId, input.employeeId),
      gte(payrollDetails.payMonth, yearStart),
      lte(payrollDetails.payMonth, yearEnd)
    ),
  })

  const totals = yearPayrolls.reduce(
    (acc: any, p: any) => ({
      grossIncome: acc.grossIncome + p.grossSalary,
      nssfAmount: acc.nssfAmount + p.nssfDeduction,
      payeDeducted: acc.payeDeducted + p.payeDeduction,
      nhifAmount: acc.nhifAmount + p.nhifDeduction,
    }),
    { grossIncome: 0, nssfAmount: 0, payeDeducted: 0, nhifAmount: 0 }
  )

  const employee = await db.query.employees.findFirst({
    where: eq(employees.id, input.employeeId),
  })
  const orgSettings = await db.query.hrSettings.findFirst({
    where: eq(hrSettings.organizationId, input.organizationId),
  })
  const country = employee?.country || orgSettings?.countryCode || 'KE'
  const payrollRules = getPayrollRulesForCountry(country)
  const reliefs = payrollRules.payeReliefMonthly * 12
  const taxableIncome = Math.max(0, totals.grossIncome - totals.nssfAmount)
  const taxDue = Math.max(0, totals.payeDeducted - reliefs)
  const p9Id = uuidv4()

  await db.insert(taxCompliance).values({
    id: p9Id,
    organizationId: input.organizationId,
    employeeId: input.employeeId,
    taxYear: input.taxYear,
    grossIncome: totals.grossIncome,
    nssfAmount: totals.nssfAmount,
    taxableIncome,
    payeDeducted: totals.payeDeducted,
    nhifAmount: totals.nhifAmount,
    reliefs,
    taxDue,
    taxPaid: totals.payeDeducted,
    balanceDue: Math.max(0, taxDue - totals.payeDeducted),
    p9aGenerated: 1,
    status: 'generated',
    createdAt: new Date().toISOString(),
  })

  if (employee?.email) {
    await sendEmail({
      to: employee.email,
      subject: `${payrollRules.statutoryTemplates.taxForm} Tax Form for ${input.taxYear}`,
      html: `<p>Dear ${employee.firstName},</p><p>Your ${payrollRules.statutoryTemplates.taxForm} tax form for ${input.taxYear} has been generated. Gross Income: ${formatPayrollCurrency(totals.grossIncome, payrollRules.currencyLabel)}, PAYE Deducted: ${formatPayrollCurrency(totals.payeDeducted, payrollRules.currencyLabel)}</p>`,
    })
  }

  await logActivity({
    userId,
    action: 'tax_form_generated',
    entityType: 'taxCompliance',
    entityId: p9Id,
    description: `Generated ${payrollRules.statutoryTemplates.taxForm} for employee ${input.employeeId} for year ${input.taxYear}`,
    metadata: JSON.stringify({ organizationId: input.organizationId, country, taxYear: input.taxYear }),
    ipAddress: null,
  })

  return { p9Id, ...totals, taxYear: input.taxYear, taxDue, reliefs }
}

export const hrPayrollRouter = router({
  // Calculate payroll for a batch
  calculatePayroll: createFeatureRestrictedProcedure(['payroll:process', 'admin:all', 'hr:manage'])
    .input(calculatePayrollSchema)
    .mutation(async ({ input, ctx }) => {
      return calculatePayrollBatch(input, ctx.user.id)
    }),

  // Get payroll batch details
  getPayrollBatch: publicProcedure
    .input(z.object({ batchId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')

      const batch = await db.query.payrollBatches.findFirst({
        where: eq(payrollBatches.id, input.batchId),
      })

      const details = await db.query.payrollDetails.findMany({
        where: eq(payrollDetails.batchId, input.batchId),
      })

      return { batch, details }
    }),

  // List payroll batches
  listPayrollBatches: publicProcedure
    .input(z.object({
      organizationId: z.string(),
      status: z.string().optional(),
      limit: z.number().int().default(50),
      offset: z.number().int().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')

      let query = db.select().from(payrollBatches).where(
        eq(payrollBatches.organizationId, input.organizationId)
      )

      if (input.status) {
        query = query.where(eq(payrollBatches.status, input.status as any))
      }

      query = query.orderBy(desc(payrollBatches.createdAt))

      return query.limit(input.limit).offset(input.offset)
    }),

  getHRSettings: createFeatureRestrictedProcedure(['hr:manage', 'admin:all'])
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')

      return db.query.hrSettings.findFirst({
        where: eq(hrSettings.organizationId, input.organizationId),
      })
    }),

  updateHRSettings: createFeatureRestrictedProcedure(['hr:manage', 'admin:all'])
    .input(z.object({
      organizationId: z.string(),
      countryCode: z.string().optional(),
      payrollRegion: z.string().optional(),
      leavePolicy: z.any().optional(),
      statutoryReportTemplates: z.any().optional(),
      statutoryAuditingEnabled: z.boolean().optional(),
      autoApprovePayroll: z.boolean().optional(),
      autoAccrueLeave: z.boolean().optional(),
      payrollDay: z.number().int().optional(),
      leaveAccrualDay: z.number().int().optional(),
    }).strict())
    .mutation(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')

      const existing = await db.query.hrSettings.findFirst({
        where: eq(hrSettings.organizationId, input.organizationId),
      })

      const payload: any = {
        organizationId: input.organizationId,
        updatedAt: new Date().toISOString(),
      }

      if (input.countryCode) payload.countryCode = input.countryCode
      if (input.payrollRegion) payload.payrollRegion = input.payrollRegion
      if (input.leavePolicy) payload.leavePolicy = input.leavePolicy
      if (typeof input.statutoryReportTemplates !== 'undefined') payload.statutoryReportTemplates = input.statutoryReportTemplates
      if (typeof input.statutoryAuditingEnabled !== 'undefined') payload.statutoryAuditingEnabled = Number(input.statutoryAuditingEnabled)
      if (typeof input.autoApprovePayroll !== 'undefined') payload.autoApprovePayroll = Number(input.autoApprovePayroll)
      if (typeof input.autoAccrueLeave !== 'undefined') payload.autoAccrueLeave = Number(input.autoAccrueLeave)
      if (typeof input.payrollDay !== 'undefined') payload.payrollDay = input.payrollDay
      if (typeof input.leaveAccrualDay !== 'undefined') payload.leaveAccrualDay = input.leaveAccrualDay

      if (existing) {
        await db.update(hrSettings).set(payload).where(eq(hrSettings.id, existing.id))
        await logActivity({
          userId: ctx.user.id,
          action: 'hr_settings_updated',
          entityType: 'hrSettings',
          entityId: existing.id,
          description: `HR settings updated for organization ${input.organizationId}`,
          metadata: JSON.stringify({ organizationId: input.organizationId, updates: payload }),
          ipAddress: getRequestIp(ctx.req),
        })
        return { updated: true }
      }

      const newSettingsId = uuidv4()
      await db.insert(hrSettings).values({
        id: newSettingsId,
        createdAt: new Date().toISOString(),
        ...payload,
      })

      await logActivity({
        userId: ctx.user.id,
        action: 'hr_settings_created',
        entityType: 'hrSettings',
        entityId: newSettingsId,
        description: `HR settings created for organization ${input.organizationId}`,
        metadata: JSON.stringify({ organizationId: input.organizationId, initialSettings: payload }),
        ipAddress: getRequestIp(ctx.req),
      })

      return { created: true }
    }),

  getPayrollRules: publicProcedure
    .input(z.object({ countryCode: z.string().optional().default('KE') }))
    .query(async ({ input }) => {
      return getPayrollRulesForCountry(input.countryCode)
    }),

  generateStatutoryReport: createFeatureRestrictedProcedure(['tax:manage', 'hr:manage', 'admin:all'])
    .input(z.object({ organizationId: z.string(), payMonth: z.string().datetime(), countryCode: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')

      const orgSettings = await db.query.hrSettings.findFirst({
        where: eq(hrSettings.organizationId, input.organizationId),
      })
      const country = input.countryCode || orgSettings?.countryCode || 'KE'
      const payrollRules = getPayrollRulesForCountry(country)
      const batch = await db.query.payrollBatches.findFirst({
        where: and(
          eq(payrollBatches.organizationId, input.organizationId),
          eq(payrollBatches.payMonth, input.payMonth)
        ),
      })
      const details = batch
        ? await db.query.payrollDetails.findMany({ where: eq(payrollDetails.batchId, batch.id) })
        : []

      const totals = details.reduce(
        (acc: any, row: any) => ({
          grossIncome: acc.grossIncome + row.grossSalary,
          totalDeductions: acc.totalDeductions + row.totalDeductions,
          netPay: acc.netPay + row.netSalary,
        }),
        { grossIncome: 0, totalDeductions: 0, netPay: 0 }
      )

      const statutoryTemplates = resolveStatutoryTemplates(orgSettings, payrollRules)

      await logActivity({
        userId: ctx.user?.id || 'system',
        action: 'statutory_report_generated',
        entityType: 'payrollBatch',
        entityId: batch?.id || null,
        description: `Generated statutory report for ${country} payroll region ${orgSettings?.payrollRegion || 'east_africa'}`,
        metadata: JSON.stringify({ organizationId: input.organizationId, payMonth: input.payMonth, templates: statutoryTemplates, complianceStatus: orgSettings?.statutoryAuditingEnabled ? 'enabled' : 'disabled' }),
        ipAddress: getRequestIp(ctx.req),
      })

      return {
        country,
        payrollRegion: orgSettings?.payrollRegion || 'east_africa',
        currencyLabel: payrollRules.currencyLabel,
        statutoryTemplates,
        statutoryTemplateContent: statutoryTemplates.content,
        totals,
        batchId: batch?.id,
        employeeCount: batch?.employeeCount || 0,
        complianceStatus: orgSettings?.statutoryAuditingEnabled ? 'enabled' : 'disabled',
      }
    }),

  // Approve payroll
  approvePayroll: createFeatureRestrictedProcedure(['payroll:approve', 'admin:all', 'hr:manage'])
    .input(approvePayrollSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')

      await db.update(payrollBatches)
        .set({ status: 'approved', approvedBy: ctx.user.id, approvalDate: new Date().toISOString() })
        .where(eq(payrollBatches.id, input.batchId))

      // Update payroll details status
      await db.update(payrollDetails)
        .set({ status: 'approved' })
        .where(eq(payrollDetails.batchId, input.batchId))

      // Update approval workflow
      await db.update(approvalWorkflows)
        .set({ status: 'approved', approvedBy: ctx.user.id, approvedAt: new Date().toISOString() })
        .where(eq(approvalWorkflows.entityId, input.batchId))

      await logActivity({
        userId: ctx.user.id,
        action: 'payroll_batch_approved',
        entityType: 'payrollBatch',
        entityId: input.batchId,
        description: `Payroll batch ${input.batchId} approved`,
        metadata: JSON.stringify({ organizationId: ctx.user.organizationId }),
        ipAddress: getRequestIp(ctx.req),
      })

      return { batchId: input.batchId }
    }),

  // Process payroll (actual payment)
  processPayroll: createFeatureRestrictedProcedure(['payroll:process', 'admin:all', 'hr:manage'])
    .input(processPayrollSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')

      const processing = await db.transaction(async (transaction: any) => {
        const lockedResult = await transaction.execute(sql`
          SELECT id, organizationId, status, payMonth, payPeriodStart, payPeriodEnd
          FROM payrollBatches
          WHERE id = ${input.batchId}
          LIMIT 1 FOR UPDATE
        `)
        const batch = (lockedResult?.[0] as any[])?.[0]
        if (!batch || batch.status !== 'approved') {
          throw new Error('Payroll must be approved before processing')
        }
        if (ctx.user.organizationId && batch.organizationId !== ctx.user.organizationId) {
          throw new Error('Payroll batch does not belong to your organization')
        }

        const details = await transaction.select()
          .from(payrollDetails)
          .where(eq(payrollDetails.batchId, input.batchId))
        if (details.length === 0) throw new Error('Payroll batch has no employee details')

        const departmentRows = await transaction.select({
          id: departments.id,
          name: departments.name,
        }).from(departments).where(eq(departments.organizationId, batch.organizationId))
        const departmentsByKey = new Map<string, string>()
        for (const department of departmentRows) {
          departmentsByKey.set(department.id.toLowerCase(), department.id)
          departmentsByKey.set(department.name.trim().toLowerCase(), department.id)
        }

        const budgetTotals = new Map<string, number>()
        const generatedPayslips: Array<{ detail: any; employee: any }> = []
        const dateOnly = (value: unknown, label: string) => {
          const text = value instanceof Date ? value.toISOString() : String(value || '')
          const match = text.match(/^(\d{4}-\d{2}-\d{2})/)
          if (match) return match[1]
          const parsed = new Date(text)
          if (Number.isNaN(parsed.getTime())) throw new Error(`Invalid ${label} in payroll batch`)
          return parsed.toISOString().slice(0, 10)
        }
        const periodStart = dateOnly(batch.payPeriodStart, 'pay period start')
        const periodEnd = dateOnly(batch.payPeriodEnd, 'pay period end')
        const payrollMonth = batch.payMonth instanceof Date
          ? batch.payMonth.toISOString().slice(0, 7)
          : String(batch.payMonth).slice(0, 7)
        const fiscalYear = new Date(`${periodEnd}T00:00:00.000Z`).getUTCFullYear()
        const toCents = (value: unknown, label: string) => {
          const amount = Number(value)
          const cents = Math.round(amount * 100)
          if (!Number.isFinite(amount) || !Number.isSafeInteger(cents) || cents < 0) {
            throw new Error(`Invalid ${label} amount in payroll batch`)
          }
          return cents
        }

        for (const detail of details) {
          if (String(detail.countryCode || '').toUpperCase() !== 'KE') {
            throw new Error('Manual payroll allocation currently supports Kenya only; configure employer-cost rules for this country before processing.')
          }

          const employeeRows = await transaction.select({
            id: employees.id,
            firstName: employees.firstName,
            email: employees.email,
            department: employees.department,
          }).from(employees).where(and(
            eq(employees.id, detail.employeeId),
            eq(employees.organizationId, batch.organizationId),
          )).limit(1)
          const employee = employeeRows[0]
          if (!employee) throw new Error(`Employee ${detail.employeeId} is not in the payroll organization`)

          const departmentKey = String(employee.department || '').trim().toLowerCase()
          const departmentId = departmentsByKey.get(departmentKey)
          if (!departmentId) throw new Error(`No organization department could be resolved for employee ${detail.employeeId}`)

          const basicSalaryCents = toCents(detail.basicSalary, 'basic salary')
          const allowancesAndBonusesCents = toCents(detail.allowances, 'allowances') + toCents(detail.bonuses, 'bonuses')
          const grossPayCents = toCents(detail.grossSalary, 'gross salary')
          const calculation = calculateKenyanPayroll({
            basicSalary: basicSalaryCents,
            allowances: allowancesAndBonusesCents,
          })
          if (Math.abs(calculation.grossSalary - grossPayCents) > 1) {
            throw new Error(`Payroll gross salary does not match the Kenya calculation for employee ${detail.employeeId}`)
          }

          const benefitsResult = await transaction.execute(sql`
            SELECT COALESCE(SUM(employerCost), 0) AS employerBenefitsCents
            FROM employeeBenefits
            WHERE employeeId = ${detail.employeeId}
              AND isActive = 1
              AND enrollDate <= ${periodEnd}
              AND (endDate IS NULL OR endDate >= ${periodStart})
          `)
          const benefitsRow = (benefitsResult?.[0] as any[])?.[0]
          const employerBenefitsCents = Number(benefitsRow?.employerBenefitsCents ?? 0)
          if (!Number.isSafeInteger(employerBenefitsCents) || employerBenefitsCents < 0) {
            throw new Error(`Invalid employer benefits for employee ${detail.employeeId}`)
          }

          const allocation = await recordPayrollCostAllocation(transaction, {
            organizationId: batch.organizationId,
            payrollId: detail.id,
            employeeId: detail.employeeId,
            createdBy: ctx.user.id,
            payrollPeriodStart: periodStart,
            payrollPeriodEnd: periodEnd,
            employeeDepartmentId: departmentId,
            grossPayCents,
            employerStatutoryCents: calculation.nssfContribution + calculation.housingLevyDeduction,
            employerBenefitsCents,
            employeeTaxCents: toCents(detail.payeDeduction, 'PAYE deduction'),
            netPayoutCents: toCents(detail.netSalary, 'net salary'),
          })
          for (const split of allocation.budgetSplits ?? []) {
            if (!split.departmentId) throw new Error(`Cost center ${split.costCenterId} has no department for budget charging`)
            budgetTotals.set(split.departmentId, (budgetTotals.get(split.departmentId) ?? 0) + split.fullyBurdenedCostCents)
          }

          await transaction.update(payrollDetails)
            .set({ status: 'paid', paidDate: input.paymentDate })
            .where(eq(payrollDetails.id, detail.id))

          await transaction.insert(payslips).values({
            id: uuidv4(),
            organizationId: batch.organizationId,
            payrollDetailId: detail.id,
            employeeId: detail.employeeId,
            payslipNumber: `PS-${payrollMonth}-${String(detail.employeeId).substring(0, 4).toUpperCase()}`,
            payMonth: batch.payMonth,
            basicSalary: detail.basicSalary,
            allowances: detail.allowances,
            bonuses: detail.bonuses,
            grossSalary: detail.grossSalary,
            nssfDeduction: detail.nssfDeduction,
            nhifDeduction: detail.nhifDeduction,
            payeDeduction: detail.payeDeduction,
            loanDeduction: detail.loanDeduction,
            otherDeductions: detail.otherDeductions,
            totalDeductions: detail.totalDeductions,
            netSalary: detail.netSalary,
            status: 'generated',
            createdAt: new Date().toISOString(),
          })
          generatedPayslips.push({ detail, employee })
        }

        for (const [departmentId, amountCents] of budgetTotals) {
          const budget = await findActiveBudget(transaction, batch.organizationId, departmentId, fiscalYear)
          if (!budget) throw new Error(`No budget found for department ${departmentId} in FY${fiscalYear}`)
          await checkBudget(transaction, amountCents, batch.organizationId, {
            budgetId: budget.budgetId,
            departmentId,
            fiscalYear,
            label: `payroll ${String(batch.payMonth).slice(0, 7)}`,
          })
          await deductFromBudget(transaction, budget.budgetId, amountCents)
        }

        await transaction.update(payrollBatches)
          .set({ status: 'processed', processedBy: ctx.user.id, processedDate: input.paymentDate })
          .where(and(eq(payrollBatches.id, input.batchId), eq(payrollBatches.status, 'approved')))

        return { batch, generatedPayslips, payrollMonth }
      })

      for (const { detail, employee } of processing.generatedPayslips) {
        if (employee.email) {
          await sendEmail({
            to: employee.email,
            subject: `Payslip for ${processing.payrollMonth}`,
            html: `<p>Dear ${employee.firstName},</p><p>Your payslip for ${processing.payrollMonth} is ready. Gross: ${detail.currencyLabel} ${Number(detail.grossSalary).toLocaleString()}, Net: ${detail.currencyLabel} ${Number(detail.netSalary).toLocaleString()}</p>`,
          })
        }
      }

      await logActivity({
        userId: ctx.user.id,
        action: 'payroll_batch_processed',
        entityType: 'payrollBatch',
        entityId: input.batchId,
        description: `Payroll batch ${input.batchId} processed and ${processing.generatedPayslips.length} payslips generated`,
        metadata: JSON.stringify({ paymentDate: input.paymentDate, organizationId: processing.batch.organizationId }),
        ipAddress: getRequestIp(ctx.req),
      })

      return { batchId: input.batchId, payslipsGenerated: processing.generatedPayslips.length }
    }),

  // Get payslip
  getPayslip: publicProcedure
    .input(z.object({ payslipId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      return db.query.payslips.findFirst({
        where: eq(payslips.id, input.payslipId),
      })
    }),

  // List payslips for employee
  listPayslipsForEmployee: publicProcedure
    .input(z.object({
      employeeId: z.string(),
      year: z.number().int().optional(),
      limit: z.number().int().default(12),
      offset: z.number().int().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      let query = db.select().from(payslips).where(
        eq(payslips.employeeId, input.employeeId)
      )

      if (input.year) {
        query = query.where(
          and(
            gte(payslips.payMonth, new Date(`${input.year}-01-01`).toISOString()),
            lte(payslips.payMonth, new Date(`${input.year}-12-31`).toISOString())
          )
        )
      }

      return query.orderBy(desc(payslips.payMonth)).limit(input.limit).offset(input.offset)
    }),

  // Generate P9 tax compliance form
  generateP9: createFeatureRestrictedProcedure(['payroll:process', 'tax:manage', 'admin:all', 'hr:manage'])
    .input(generateP9Schema)
    .mutation(async ({ input, ctx }) => {
      return generateP9TaxForm({
        organizationId: input.organizationId,
        employeeId: input.employeeId,
        taxYear: input.taxYear,
      }, ctx.user.id)
    }),

  // List P9 forms
  listP9Forms: publicProcedure
    .input(z.object({
      organizationId: z.string(),
      taxYear: z.number().int().optional(),
      status: z.string().optional(),
      limit: z.number().int().default(50),
      offset: z.number().int().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available')
      let query = db.select().from(taxCompliance).where(
        eq(taxCompliance.organizationId, input.organizationId)
      )

      if (input.taxYear) {
        query = query.where(eq(taxCompliance.taxYear, input.taxYear))
      }

      if (input.status) {
        query = query.where(eq(taxCompliance.status, input.status as any))
      }

      return query.orderBy(desc(taxCompliance.createdAt)).limit(input.limit).offset(input.offset)
    }),

  // Get payroll analytics
  getPayrollAnalytics: publicProcedure
    .input(z.object({
      organizationId: z.string(),
      month: z.string().datetime(),
    }))
    .query(async ({ input }) => {
      const db = await getDb()
      if (!db) throw new Error('Database not available')
      const batches = await db.query.payrollBatches.findMany({
        where: and(
          eq(payrollBatches.organizationId, input.organizationId),
          gte(payrollBatches.payMonth, input.month),
          lte(payrollBatches.payMonth, input.month)
        ),
      })

      const batch = batches[0]

      return {
        totalEmployees: batch?.employeeCount || 0,
        totalGross: batch?.totalGross || 0,
        totalDeductions: batch?.totalDeductions || 0,
        totalNet: batch?.totalNet || 0,
        averageSalary: batch?.employeeCount ? Math.round((batch.totalGross || 0) / batch.employeeCount) : 0,
      }
    }),
})
