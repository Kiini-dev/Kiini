/**
 * P9 Form Generation Utility
 * Generates annual tax forms for Kenyan employees
 */
import { getPool } from "../db";
import { v4 as uuidv4 } from "uuid";

interface P9GenerationInput {
  employeeId: string;
  organizationId: string | null;
  taxYear: number;
}

interface P9Data {
  employeeId: string;
  organizationId: string | null;
  taxYear: number;
  taxNumber: string;
  grossIncome: number;
  paye: number;
  nssf: number;
  shif: number;
  housingLevy: number;
  reliefs: number;
  netTaxPayable: number;
  numberOfPayslips: number;
}

function parseDeductionsBreakdown(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(String(value || "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parsePayrollNotes(value: unknown): Record<string, any> {
  if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, any>;
  try {
    const parsed = JSON.parse(String(value || "{}"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function aggregateP9PayslipRows(rows: any[]) {
  return rows.reduce((totals, row) => {
    const deductions = parseDeductionsBreakdown(row.deductionsBreakdown);
    const amountFor = (pattern: RegExp) => deductions.reduce((sum, item) => {
      const label = String(item.name || item.description || item.component || item.type || "");
      return pattern.test(label) ? sum + Number(item.amount || 0) : sum;
    }, 0);
    totals.grossIncome += Number(row.grossSalary || (Number(row.basicSalary || 0) + Number(row.allowances || 0) + Number(row.bonuses || 0)));
    totals.paye += Number(row.payeDeduction || row.paye || amountFor(/paye|payee|income tax/i));
    totals.nssf += Number(row.nssfDeduction || row.nssf || amountFor(/nssf/i));
    totals.shif += Number(row.nhifDeduction || row.shif || row.nhif || amountFor(/shif|nhif/i));
    totals.housingLevy += Number(row.housingLevy || amountFor(/housing levy/i));
    totals.numberOfPayslips += 1;
    return totals;
  }, { grossIncome: 0, paye: 0, nssf: 0, shif: 0, housingLevy: 0, numberOfPayslips: 0 });
}

export function aggregateP9PayrollRows(rows: any[]) {
  return rows.reduce((totals, row) => {
    const notes = parsePayrollNotes(row.notes);
    totals.grossIncome += Number(notes.grossSalary ?? (Number(row.basicSalary || 0) + Number(row.allowances || 0)));
    totals.paye += Number(notes.paye ?? row.tax ?? 0);
    totals.nssf += Number(notes.nssf ?? notes.nssfContribution ?? 0);
    totals.shif += Number(notes.shif ?? notes.shifContribution ?? notes.nhif ?? 0);
    totals.housingLevy += Number(notes.housingLevy ?? notes.housingLevyDeduction ?? 0);
    totals.numberOfPayslips += 1;
    return totals;
  }, { grossIncome: 0, paye: 0, nssf: 0, shif: 0, housingLevy: 0, numberOfPayslips: 0 });
}

export function aggregateP9PayrollAndPayslipRows(payrollRows: any[], payslipRows: any[]) {
  const payslipPayrollIds = new Set(payslipRows
    .map((row) => row.payrollId || row.payrollDetailId)
    .filter(Boolean)
    .map(String));
  const payrollWithoutPayslip = payrollRows.filter((row) => !payslipPayrollIds.has(String(row.id)));
  const payrollTotals = aggregateP9PayrollRows(payrollWithoutPayslip);
  const payslipTotals = aggregateP9PayslipRows(payslipRows);
  return {
    grossIncome: payrollTotals.grossIncome + payslipTotals.grossIncome,
    paye: payrollTotals.paye + payslipTotals.paye,
    nssf: payrollTotals.nssf + payslipTotals.nssf,
    shif: payrollTotals.shif + payslipTotals.shif,
    housingLevy: payrollTotals.housingLevy + payslipTotals.housingLevy,
    numberOfPayslips: payrollTotals.numberOfPayslips + payslipTotals.numberOfPayslips,
  };
}

export function resolveP9TaxNumber(
  taxInfo: { taxNumber?: unknown; taxId?: unknown } | null | undefined,
  employeeTaxId?: unknown,
): string {
  const value = taxInfo?.taxNumber || taxInfo?.taxId || employeeTaxId;
  return typeof value === "string" && value.trim() ? value.trim() : "N/A";
}

/**
 * Calculate P9 form data from payroll records
 */
export async function calculateP9Data(input: P9GenerationInput): Promise<P9Data | null> {
  const pool = getPool();
  if (!pool) throw new Error("Database not available");

  const employeeScope = input.organizationId ? "organizationId = ?" : "organizationId IS NULL";
  const employeeParams = input.organizationId ? [input.employeeId, input.organizationId] : [input.employeeId];
  const [empRows] = await pool.query(
    `SELECT id, firstName, lastName, email, taxId FROM employees WHERE id = ? AND ${employeeScope} LIMIT 1`,
    employeeParams
  );

  const emp = (empRows as any[])?.[0];
  if (!emp) throw new Error(`Employee ${input.employeeId} was not found in this organization`);

  const [taxRows] = await pool.query(
    `SELECT * FROM employeeTaxInfo WHERE employeeId = ? ORDER BY effectiveDate DESC LIMIT 1`,
    [input.employeeId]
  );

  const taxInfo = (taxRows as any[])?.[0];
  const taxNumber = resolveP9TaxNumber(taxInfo, emp.taxId);
  const yearStart = `${input.taxYear}-01-01`;
  const nextYearStart = `${input.taxYear + 1}-01-01`;

  const [payrollRows] = await pool.query(
    `SELECT p.id, p.basicSalary, p.allowances, p.tax, p.notes
     FROM payroll p
     INNER JOIN employees e ON e.id = p.employeeId
     WHERE p.employeeId = ? AND e.${input.organizationId ? "organizationId = ?" : "organizationId IS NULL"}
       AND p.payPeriodStart >= ? AND p.payPeriodStart < ?
       AND p.status IN ('processed', 'paid')`,
    input.organizationId
      ? [input.employeeId, input.organizationId, yearStart, nextYearStart]
      : [input.employeeId, yearStart, nextYearStart]
  );

  const [payslipRows] = await pool.query(
    `SELECT * FROM payslips
     WHERE employeeId = ? AND ${input.organizationId ? "organizationId = ?" : "organizationId IS NULL"}
       AND status IN ('generated', 'sent', 'viewed', 'downloaded')`,
    input.organizationId ? [input.employeeId, input.organizationId] : [input.employeeId]
  );
  const yearPayslips = (payslipRows as any[] || []).filter((row) => {
    const period = String(row.payPeriod || row.payMonth || row.payPeriodStart || "");
    return period >= yearStart && period < nextYearStart;
  });
  const totals = aggregateP9PayrollAndPayslipRows(payrollRows as any[] || [], yearPayslips);

  if (totals.numberOfPayslips === 0) {
    console.warn(`[P9-GEN] No processed payroll or payslips found for employee ${emp.email} in ${input.taxYear}`);
    return null;
  }

  const { grossIncome, paye, nssf, shif, housingLevy, numberOfPayslips } = totals;
  const reliefs = 0;
  const netTaxPayable = paye - reliefs;

  return {
    employeeId: input.employeeId,
    organizationId: input.organizationId,
    taxYear: input.taxYear,
    taxNumber,
    grossIncome,
    paye,
    nssf,
    shif,
    housingLevy,
    reliefs,
    netTaxPayable,
    numberOfPayslips,
  };
}

/**
 * Generate P9 HTML content
 */
export function generateP9HTML(
  employeeName: string,
  email: string,
  p9Data: P9Data
): string {
  const formatAmount = (cents: number) => {
    return (cents / 100).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>P9 Tax Form - ${p9Data.taxYear}</title>
      <style>
        body {
          font-family: "Courier New", monospace;
          line-height: 1.6;
          margin: 20px;
          color: #333;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          border: 2px solid #000;
          padding: 30px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #000;
          padding-bottom: 15px;
        }
        .header h1 {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
        }
        .header p {
          margin: 5px 0;
          font-size: 14px;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          background-color: #f5f5f5;
          padding: 8px;
          font-weight: bold;
          border-bottom: 1px solid #ccc;
          margin-bottom: 10px;
        }
        .form-row {
          display: flex;
          margin-bottom: 8px;
          border-bottom: 1px solid #ddd;
          padding: 5px 0;
        }
        .form-label {
          flex: 0 0 60%;
          font-weight: 500;
        }
        .form-value {
          flex: 1;
          text-align: right;
          padding-right: 20px;
          border-left: 1px solid #ddd;
          padding-left: 10px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .total-row {
          background-color: #f9f9f9;
          font-weight: bold;
        }
        .highlight {
          background-color: #fff9e6;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ANNUAL TAX DECLARATION (P9)</h1>
          <p>TAX YEAR: ${p9Data.taxYear}</p>
          <p>Kenya Revenue Authority</p>
        </div>

        <div class="section">
          <div class="section-title">EMPLOYEE INFORMATION</div>
          <div class="form-row">
            <div class="form-label">Employee Name:</div>
            <div class="form-value">${employeeName}</div>
          </div>
          <div class="form-row">
            <div class="form-label">Email:</div>
            <div class="form-value">${email}</div>
          </div>
          <div class="form-row">
            <div class="form-label">PIN/Tax Number:</div>
            <div class="form-value">${p9Data.taxNumber}</div>
          </div>
          <div class="form-row">
            <div class="form-label">Tax Year:</div>
            <div class="form-value">${p9Data.taxYear}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">INCOME SUMMARY</div>
          <div class="form-row">
            <div class="form-label">Total Gross Income:</div>
            <div class="form-value">KES ${formatAmount(p9Data.grossIncome)}</div>
          </div>
          <div class="form-row">
            <div class="form-label">Number of Pay Periods:</div>
            <div class="form-value">${p9Data.numberOfPayslips}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">DEDUCTIONS & CONTRIBUTIONS</div>
          <div class="form-row">
            <div class="form-label">NSSF Contributions:</div>
            <div class="form-value">KES ${formatAmount(p9Data.nssf)}</div>
          </div>
          <div class="form-row">
            <div class="form-label">SHIF (Health Insurance):</div>
            <div class="form-value">KES ${formatAmount(p9Data.shif)}</div>
          </div>
          <div class="form-row">
            <div class="form-label">Housing Levy:</div>
            <div class="form-value">KES ${formatAmount(p9Data.housingLevy)}</div>
          </div>
          <div class="form-row total-row">
            <div class="form-label">Total Non-Tax Deductions:</div>
            <div class="form-value">KES ${formatAmount(
              p9Data.nssf + p9Data.shif + p9Data.housingLevy
            )}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">TAX PAYABLE</div>
          <div class="form-row">
            <div class="form-label">PAYE Tax Deducted:</div>
            <div class="form-value">KES ${formatAmount(p9Data.paye)}</div>
          </div>
          <div class="form-row">
            <div class="form-label">Tax Reliefs:</div>
            <div class="form-value">KES ${formatAmount(p9Data.reliefs)}</div>
          </div>
          <div class="form-row total-row highlight">
            <div class="form-label">NET TAX PAYABLE:</div>
            <div class="form-value">KES ${formatAmount(p9Data.netTaxPayable)}</div>
          </div>
        </div>

        <div class="footer">
          <p>Generated on ${formatDate(new Date())}</p>
          <p>This P9 form is generated electronically and serves as an official tax declaration.</p>
          <p>For inquiries, contact your HR department.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate and store P9 form for an employee
 */
export async function generateP9Form(
  input: P9GenerationInput,
  generatedBy: string
): Promise<{ id: string; status: string } | null> {
  const pool = getPool();
  if (!pool) throw new Error("Database not available");

  const p9Data = await calculateP9Data(input);
  if (!p9Data) return null;

  const [empRows] = await pool.query(
    `SELECT firstName, lastName, email FROM employees
     WHERE id = ? AND ${input.organizationId ? "organizationId = ?" : "organizationId IS NULL"} LIMIT 1`,
    input.organizationId ? [input.employeeId, input.organizationId] : [input.employeeId]
  );
  const emp = (empRows as any[])?.[0];
  if (!emp) throw new Error(`Employee ${input.employeeId} was not found in this organization`);

  const employeeName = `${emp.firstName} ${emp.lastName}`;
  const htmlContent = generateP9HTML(employeeName, emp.email, p9Data);
  const [existingRows] = await pool.query(
    `SELECT id FROM p9_forms
     WHERE ${input.organizationId ? "organizationId = ?" : "organizationId IS NULL"}
       AND employeeId = ? AND taxYear = ? LIMIT 1`,
    input.organizationId
      ? [input.organizationId, input.employeeId, input.taxYear]
      : [input.employeeId, input.taxYear]
  );
  const existingId = (existingRows as any[])?.[0]?.id;
  const p9Id = existingId || uuidv4();
  const values = [
    p9Data.taxNumber,
    p9Data.grossIncome,
    p9Data.paye + p9Data.nssf + p9Data.shif + p9Data.housingLevy,
    p9Data.paye,
    p9Data.nssf,
    p9Data.shif,
    p9Data.housingLevy,
    p9Data.reliefs,
    p9Data.netTaxPayable,
    p9Data.numberOfPayslips,
    htmlContent,
    generatedBy,
  ];

  if (existingId) {
    await pool.query(
      `UPDATE p9_forms SET taxNumber = ?, grossIncome = ?, totalDeductions = ?, paye = ?,
       nssf = ?, shif = ?, housingLevy = ?, reliefs = ?, netTaxPayable = ?,
       numberOfPayslips = ?, htmlContent = ?, generatedBy = ?, generatedAt = NOW(),
       status = IF(status IN ('sent', 'received'), status, 'generated'), updatedAt = NOW()
       WHERE id = ? AND ${input.organizationId ? "organizationId = ?" : "organizationId IS NULL"}`,
      input.organizationId
        ? [...values, p9Id, input.organizationId]
        : [...values, p9Id]
    );
  } else {
    await pool.query(
      `INSERT INTO p9_forms (
        id, organizationId, employeeId, taxYear, taxNumber, grossIncome,
        totalDeductions, paye, nssf, shif, housingLevy, reliefs, netTaxPayable,
        numberOfPayslips, htmlContent, generatedBy, generatedAt, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW(), NOW())`,
      [
        p9Id,
        input.organizationId,
        input.employeeId,
        input.taxYear,
        ...values.slice(0, 11),
        generatedBy,
        "generated",
      ]
    );
  }

  console.log(`[P9-GEN] Generated P9 form ${p9Id} for ${emp.email} (${input.taxYear})`);
  return { id: p9Id, status: "generated" };
}
