/**
 * P9 Form Generation Utility
 * Generates annual tax forms for Kenyan employees
 */
import { getPool } from "../db";
import { v4 as uuidv4 } from "uuid";
import { TRPCError } from "@trpc/server";

interface P9GenerationInput {
  employeeId: string;
  organizationId: string;
  taxYear: number;
}

interface P9Data {
  employeeId: string;
  organizationId: string;
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

/**
 * Calculate P9 form data from payroll records
 */
export async function calculateP9Data(input: P9GenerationInput): Promise<P9Data | null> {
  const pool = getPool();
  if (!pool) return null;

  try {
    // Get employee details
    const [empRows] = await pool.query(
      `SELECT id, firstName, lastName, email, taxId FROM employees WHERE id = ? AND organizationId = ? LIMIT 1`,
      [input.employeeId, input.organizationId]
    );

    const emp = (empRows as any[])?.[0];
    if (!emp) return null;

    // Get employee tax info
    const [taxRows] = await pool.query(
      `SELECT taxNumber FROM employeeTaxInfo WHERE employeeId = ? ORDER BY effectiveDate DESC LIMIT 1`,
      [input.employeeId]
    );

    const taxInfo = (taxRows as any[])?.[0];
    const taxNumber = taxInfo?.taxNumber || emp.taxId || "N/A";

    // Aggregate persisted payslips using fields shared by legacy and current schemas.
    const [payslipRows] = await pool.query(
      `SELECT * FROM payslips
       WHERE employeeId = ? AND organizationId = ?
         AND payPeriod >= ? AND payPeriod < ?
         AND status IN ('generated', 'sent', 'viewed', 'downloaded')`,
      [input.employeeId, input.organizationId, `${input.taxYear}-01`, `${input.taxYear + 1}-01`]
    );

    const payslips = aggregateP9PayslipRows(payslipRows as any[] || []);
    if (payslips.numberOfPayslips === 0) {
      console.warn(
        `[P9-GEN] No payslips found for employee ${emp.email} in ${input.taxYear}`
      );
      return null;
    }

    const { grossIncome, paye, nssf, shif, housingLevy, numberOfPayslips } = payslips;

    // Kenyan personal relief for non-resident aliens: 0
    // For residents: KES 2,400 per month, max KES 28,800 per year (as of 2024)
    // This is handled in PAYE calculation, but P9 may include separate relief
    const reliefs = 0; // Typically included in PAYE calculation

    const totalDeductions = paye + nssf + shif + housingLevy;
    const netTaxPayable = paye - reliefs; // Typically net tax after relief

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
  } catch (error: any) {
    console.error("[P9-GEN] Error calculating P9 data:", error);
    return null;
  }
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
  if (!pool) return null;

  try {
    // Calculate P9 data
    const p9Data = await calculateP9Data(input);
    if (!p9Data) {
      console.warn(
        `[P9-GEN] Could not generate P9 data for employee ${input.employeeId}`
      );
      return null;
    }

    // Get employee details
    const [empRows] = await pool.query(
      `SELECT firstName, lastName, email FROM employees WHERE id = ? LIMIT 1`,
      [input.employeeId]
    );

    const emp = (empRows as any[])?.[0];
    if (!emp) return null;

    const employeeName = `${emp.firstName} ${emp.lastName}`;

    // Generate HTML
    const htmlContent = generateP9HTML(employeeName, emp.email, p9Data);

    // Store P9 form
    const p9Id = uuidv4();
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
        "generated",
      ]
    );

    console.log(`[P9-GEN] Generated P9 form ${p9Id} for ${emp.email} (${input.taxYear})`);

    return { id: p9Id, status: "generated" };
  } catch (error: any) {
    console.error("[P9-GEN] Error generating P9 form:", error);
    return null;
  }
}
