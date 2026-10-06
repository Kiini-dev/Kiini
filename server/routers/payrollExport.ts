import { router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { payroll, employees, departments } from "../../drizzle/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import * as XLSX from 'xlsx';
// @ts-ignore
import * as ExcelJS from 'exceljs';

const readProcedure = createFeatureRestrictedProcedure("hr:payroll:view");

/**
 * Calculate Kenyan payroll taxes and deductions
 */
function calculateKenyanPayrollTaxes(basicSalary: number) {
  // Convert to KES if needed (assumed to be in cents, convert to whole shillings)
  const salary = Math.round(basicSalary / 100);

  // Personal Relief: 2,400 per month
  const personalRelief = 2400;

  // PAYE Calculation (Progressive Tax Brackets)
  let paye = 0;
  if (salary <= 24000) {
    paye = Math.round((salary * 0.1) - personalRelief);
  } else if (salary <= 32333) {
    paye = Math.round(2400 + (salary - 24000) * 0.15 - personalRelief);
  } else if (salary <= 500000) {
    paye = Math.round(2400 + 1250 + (salary - 32333) * 0.2 - personalRelief);
  } else if (salary <= 800000) {
    paye = Math.round(2400 + 1250 + 93333 + (salary - 500000) * 0.25 - personalRelief);
  } else {
    paye = Math.round(2400 + 1250 + 93333 + 75000 + (salary - 800000) * 0.3 - personalRelief);
  }
  paye = Math.max(0, paye);

  // NSSF Tier 1: 6% of salary, capped at 18,000
  const nssfTier1 = Math.min(Math.round(salary * 0.06), 18000);

  // NSSF Tier 2: 6% of salary above 300,000
  const nssfTier2 = salary > 300000 ? Math.round((salary - 300000) * 0.06) : 0;

  // SHIF (formerly NHIF): 2.5% capped at 15,000
  const shif = Math.min(Math.round(salary * 0.025), 15000);

  // Housing Levy: 1.5% capped at 15,000
  const housingLevy = Math.min(Math.round(salary * 0.015), 15000);

  // Total Deductions
  const totalDeductions = paye + nssfTier1 + nssfTier2 + shif + housingLevy;

  // Net Pay
  const netPay = salary - totalDeductions;

  return {
    salary,
    paye,
    nssfTier1,
    nssfTier2,
    nssf: nssfTier1 + nssfTier2,
    shif,
    housingLevy,
    totalDeductions,
    netPay,
  };
}

export const payrollExportRouter = router({
  /**
   * Export payroll data to Excel format
   */
  exportPayroll: readProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
      employeeId: z.string().optional(),
      departmentId: z.string().optional(),
      month: z.string().regex(/^(0[1-9]|1[0-2])$/).optional(),
      format: z.enum(['xlsx', 'csv']).default('xlsx'),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      try {
        // Fetch payroll data for the date range
        let query = database
          .select({
            payrollId: payroll.id,
            employeeId: payroll.employeeId,
            employeeName: employees.firstName,
            employeeLast: employees.lastName,
            department: departments.name,
            paymentDate: payroll.payPeriodEnd,
            basicSalary: payroll.basicSalary,
            allowances: payroll.allowances,
            deductions: payroll.deductions,
            netPay: payroll.netSalary,
            paymentMethod: payroll.paymentMethod,
            status: payroll.status,
          })
          .from(payroll)
          .leftJoin(employees, eq(payroll.employeeId, employees.id))
          .leftJoin(departments, eq(employees.department, departments.name));

        // Apply filters
        const conditions = [
          gte(payroll.paymentDate, input.startDate),
          lte(payroll.paymentDate, input.endDate),
        ];

        if (input.employeeId) {
          conditions.push(eq(payroll.employeeId, input.employeeId));
        }

        if (input.departmentId) {
          conditions.push(eq(departments.id, input.departmentId));
        }

        if (input.month) {
          conditions.push(sql`DATE_FORMAT(${payroll.paymentDate}, '%m') = ${input.month}`);
        }

        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }

        const records = await (query as any);

        if (!records || records.length === 0) {
          return {
            success: false,
            message: "No payroll records found for the specified criteria",
          };
        }

        // Prepare data with tax calculations
        const payrollData = records.map((record: any) => {
          const taxes = calculateKenyanPayrollTaxes(record.basicSalary);
          return {
            ...record,
            ...taxes,
            employeeName: `${record.employeeName || ''} ${record.employeeLast || ''}`,
          };
        });

        // Generate Excel file
        if (input.format === 'xlsx') {
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet('Payroll');

          // Set column widths
          worksheet.columns = [
            { header: 'Employee', key: 'employeeName', width: 20 },
            { header: 'Department', key: 'department', width: 15 },
            { header: 'Payment Date', key: 'paymentDate', width: 12 },
            { header: 'Basic Salary', key: 'salary', width: 14 },
            { header: 'Allowances', key: 'allowances', width: 12 },
            { header: 'PAYE', key: 'paye', width: 10 },
            { header: 'NSSF', key: 'nssf', width: 10 },
            { header: 'SHIF', key: 'shif', width: 10 },
            { header: 'Housing Levy', key: 'housingLevy', width: 12 },
            { header: 'Total Deductions', key: 'totalDeductions', width: 14 },
            { header: 'Net Pay', key: 'netPay', width: 12 },
            { header: 'Status', key: 'status', width: 10 },
          ];

          // Add header styling
          const headerRow = worksheet.getRow(1);
          headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
          headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

          // Add data rows
          payrollData.forEach((row: any) => {
            const sheetRow = worksheet.addRow({
              employeeName: row.employeeName,
              department: row.department || 'N/A',
              paymentDate: row.paymentDate,
              salary: row.salary,
              allowances: row.allowances || 0,
              paye: row.paye,
              nssf: row.nssf,
              shif: row.shif,
              housingLevy: row.housingLevy,
              totalDeductions: row.totalDeductions,
              netPay: row.netPay,
              status: row.status,
            });

            // Format currency columns
            const currencyColumns = ['salary', 'allowances', 'paye', 'nssf', 'shif', 'housingLevy', 'totalDeductions', 'netPay'];
            currencyColumns.forEach((col) => {
              const cellRef = sheetRow.getCell(col);
              if (cellRef) {
                cellRef.numFmt = '_("Ksh "*) #,##0.00_);_("Ksh "*(#,##0.00);_("Ksh "* "-"??_);_(@_)';
              }
            });
          });

          // Add summary row
          const summaryRow = worksheet.addRow({});
          summaryRow.font = { bold: true };
          summaryRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };

          // Detailed summary with calculations
          const totalSalary = payrollData.reduce((sum: number, row: any) => sum + row.salary, 0);
          const totalPAYE = payrollData.reduce((sum: number, row: any) => sum + row.paye, 0);
          const totalNSSF = payrollData.reduce((sum: number, row: any) => sum + row.nssf, 0);
          const totalSHIF = payrollData.reduce((sum: number, row: any) => sum + row.shif, 0);
          const totalHousing = payrollData.reduce((sum: number, row: any) => sum + row.housingLevy, 0);
          const totalDeductions = payrollData.reduce((sum: number, row: any) => sum + row.totalDeductions, 0);
          const totalNetPay = payrollData.reduce((sum: number, row: any) => sum + row.netPay, 0);

          worksheet.addRow({});
          worksheet.addRow({
            employeeName: 'TOTALS',
            salary: totalSalary,
            paye: totalPAYE,
            nssf: totalNSSF,
            shif: totalSHIF,
            housingLevy: totalHousing,
            totalDeductions: totalDeductions,
            netPay: totalNetPay,
          });

          // Export buffer
          const buffer = await workbook.xlsx.writeBuffer();
          const base64 = Buffer.from(buffer).toString('base64');

          return {
            success: true,
            format: 'xlsx',
            data: base64,
            filename: `Payroll_${input.startDate}_${input.endDate}.xlsx`,
            recordCount: payrollData.length,
            summary: {
              totalEmployees: payrollData.length,
              totalSalary,
              totalPAYE,
              totalNSSF,
              totalSHIF,
              totalHousing,
              totalDeductions,
              totalNetPay,
            },
          };
        } else {
          // CSV format
          const csv = [
            ['PAYROLL EXPORT', `${input.startDate} to ${input.endDate}`],
            [],
            ['Employee', 'Department', 'Payment Date', 'Basic Salary', 'Allowances', 'PAYE', 'NSSF', 'SHIF', 'Housing Levy', 'Total Deductions', 'Net Pay', 'Status'],
            ...payrollData.map((row: any) => [
              row.employeeName,
              row.department || 'N/A',
              row.paymentDate,
              row.salary,
              row.allowances || 0,
              row.paye,
              row.nssf,
              row.shif,
              row.housingLevy,
              row.totalDeductions,
              row.netPay,
              row.status,
            ]),
          ].map(row => row.join(',')).join('\n');

          return {
            success: true,
            format: 'csv',
            data: Buffer.from(csv).toString('base64'),
            filename: `Payroll_${input.startDate}_${input.endDate}.csv`,
            recordCount: payrollData.length,
          };
        }
      } catch (error: any) {
        console.error("Error exporting payroll:", error);
        return {
          success: false,
          message: error.message || "Failed to export payroll data",
        };
      }
    }),

  /**
   * Get payroll summary statistics for export
   */
  getExportSummary: readProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) return null;

      try {
        const records = await database
          .select({
            employeeCount: database.fn.count(database.fn.distinct(payroll.employeeId)),
            totalSalary: database.fn.sum(payroll.basicSalary),
            totalNetPay: database.fn.sum(payroll.netSalary),
            recordCount: database.fn.count(payroll.id),
          })
          .from(payroll)
          .where(
            and(
              gte(payroll.paymentDate, input.startDate),
              lte(payroll.paymentDate, input.endDate)
            )
          );

        if (!records || records.length === 0) {
          return null;
        }

        const record = records[0] as any;
        return {
          employeeCount: record.employeeCount || 0,
          totalSalary: Math.round(record.totalSalary || 0),
          totalNetPay: Math.round(record.totalNetPay || 0),
          recordCount: record.recordCount || 0,
          avgSalary: record.employeeCount ? Math.round((record.totalSalary || 0) / record.employeeCount) : 0,
        };
      } catch (error: any) {
        console.error("Error getting export summary:", error);
        return null;
      }
    }),
});
