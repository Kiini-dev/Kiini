/**
 * Standard International Payslip HTML Template (Kenya Labour Act compliant)
 * Generates a print-ready, email-safe HTML payslip.
 */

import { formatMinorCurrencyAmount } from "../../shared/currency";

export interface PayslipTemplateData {
  payPeriod: string; // "2025-01"
  payDate: string;   // "2025-01-31 23:59:00"
  employee: {
    name: string;
    id: string;         // employee number
    department: string;
    position: string;
    bankName: string;
    bankAccount: string;
    nssfNumber: string;
    nhifNumber: string;
    taxPin: string;
    nationalId: string;
  };
  company: {
    name: string;
    address: string;
    logo: string;
    employerContributions?: Array<{ name: string; amount: number; balance?: number }>;
  };
  earnings: {
    basicSalary: number;             // cents
    allowances: Array<{ name: string; amount: number }>; // cents
    grossSalary: number;             // cents
  };
  deductions: {
    paye: number;        // cents
    nssf: number;        // cents
    nssfTier1: number;
    nssfTier2: number;
    shif: number;        // cents (Social Health Insurance Fund)
    housingLevy: number; // cents
    personalRelief: number; // cents (credit against PAYE)
    total: number;       // cents
    additional?: Array<{ name: string; amount: number }>;
  };
  netSalary: number; // cents
}

function ksh(cents: number): string {
  return formatMinorCurrencyAmount(cents, "KES", {
    symbol: "KES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function monthLabel(period: string): string {
  try {
    const [y, m] = period.split("-");
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-KE", { month: "long", year: "numeric" });
  } catch {
    return period;
  }
}

export function generatePayslipHTML(data: PayslipTemplateData): string {
  const { employee: emp, company, earnings, deductions } = data;
  const month = monthLabel(data.payPeriod);

  const allowanceRows = earnings.allowances.map(
    (a) => `<tr><td class="lbl">${a.name}</td><td class="amt">${ksh(a.amount)}</td></tr>`
  ).join("");

  const nssfDetail =
    deductions.nssfTier1 > 0
      ? `<tr><td class="lbl sub">NSSF Tier I</td><td class="amt">${ksh(deductions.nssfTier1)}</td></tr>
         <tr><td class="lbl sub">NSSF Tier II</td><td class="amt">${ksh(deductions.nssfTier2)}</td></tr>`
      : `<tr><td class="lbl sub">NSSF Contribution</td><td class="amt">${ksh(deductions.nssf)}</td></tr>`;

  const netPAYE = Math.max(0, deductions.paye - deductions.personalRelief);
  const reliefRow =
    deductions.personalRelief > 0
      ? `<tr class="relief"><td class="lbl">Personal Relief</td><td class="amt credit">(${ksh(deductions.personalRelief)})</td></tr>`
      : "";
  const employerRows = (company.employerContributions || []).map(
    (item) => `<tr><td class="lbl">${item.name}</td><td class="amt">${ksh(item.amount)}</td><td class="amt">${item.balance === undefined ? "0.00" : ksh(item.balance)}</td></tr>`
  ).join("");
  const additionalDeductionRows = (deductions.additional || []).map(
    (item) => `<tr><td class="lbl">${item.name}</td><td class="amt">${ksh(item.amount)}</td></tr>`
  ).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Payslip — ${month}</title>
<style>
  /* ── Reset & Base ────────────────────────────────────────── */
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:Arial,sans-serif;font-size:12px;color:#111;background:#fff;}
  .wrapper{max-width:900px;margin:0 auto;background:#fff;overflow:hidden;}
  /* ── Header ─────────────────────────────────────────────── */
    .header{color:#111;padding:8px 28px 2px;display:flex;
      justify-content:flex-end;align-items:flex-start;min-height:88px;}
    .header > div:first-child{display:none;}
    .header .co-name{font-size:20px;font-weight:700;letter-spacing:.5px;}
    .header .co-meta{font-size:10.5px;color:#555;margin-top:4px;}
    .header > div:last-child{display:block;}
  .header .slip-label{text-align:center;position:absolute;left:0;right:0;top:116px;}
  .header .slip-label h2{font-size:16px;font-weight:700;text-transform:none;
                          letter-spacing:0;color:#111;}
  .header .slip-label span{font-size:11px;opacity:.8;}
  /* ── Divider banner ──────────────────────────────────────── */
  .band{background:#f0a800;height:4px;margin:52px 28px 0;}
  /* ── Employee details ────────────────────────────────────── */
  .section{padding:10px 28px;}
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px;}
  .grid-3{display:grid;grid-template-columns:1fr 1fr;gap:4px 32px;border-bottom:5px solid #c8c8c8;padding-bottom:12px;}
  .field{margin-bottom:2px;}
  .field .k{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.4px;}
  .field .v{font-size:12.5px;font-weight:600;color:#1a1a1a;}
  .section-title{font-size:13px;text-transform:none;letter-spacing:0;
                  color:#111;font-weight:700;border-bottom:2px solid #111;
                  padding-bottom:4px;margin-bottom:12px;}
  /* ── Tables ──────────────────────────────────────────────── */
  .pay-tables{display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;padding:48px 28px 16px;border-top:1px solid #111;}
  table{width:100%;border-collapse:collapse;}
  table thead tr{background:#d9d9d9;}
  table thead th{font-size:10.5px;text-transform:uppercase;letter-spacing:.4px;
                  color:#111;padding:5px 8px;text-align:left;border-bottom:1px solid #aaa;}
  table thead th.amt{text-align:right;}
  table td{padding:5px 8px;border-bottom:1px solid #eef0f4;vertical-align:middle;}
  td.lbl{color:#3a3a3a;}
  td.lbl.sub{padding-left:18px;color:#666;font-style:italic;}
  td.amt{text-align:right;font-variant-numeric:tabular-nums;font-weight:500;}
  td.credit{color:#1a7c4e;font-weight:600;}
  tr.relief td{background:#f5fbf8;}
  tr.subtotal td{background:#f9fafc;font-weight:600;border-top:1px solid #c8d0e0;}
  tr.grandtotal td{background:#1a3c6e;color:#fff;font-weight:700;font-size:13px;}
  tr.grandtotal td.amt{color:#f0c040;font-size:14px;}
  /* ── Net Pay box ─────────────────────────────────────────── */
  .netpay-box{margin:0 28px 20px;background:#e8edf2;border-top:2px solid #1a3c6e;
              padding:8px 28px;display:flex;justify-content:space-between;align-items:center;color:#111;}
  .netpay-box .label{font-size:11px;text-transform:uppercase;letter-spacing:.8px;opacity:.8;}
  .netpay-box .amount{font-size:18px;font-weight:800;color:#111;letter-spacing:0;}
  .netpay-box .period{font-size:11px;opacity:.7;}
  /* ── Banking / statutory ─────────────────────────────────── */
  .info-row{display:none;}
  /* ── Footer ──────────────────────────────────────────────── */
  .footer{background:#f8f9fb;border-top:1px solid #e8ecf2;padding:12px 28px;
          display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;}
  .footer p{font-size:10px;color:#888;}
  .footer .conf{color:#c0392b;font-weight:600;font-size:10px;}
  @media print{
    body{background:#fff;}
    .wrapper{box-shadow:none;margin:0;border-radius:0;}
  }
  @media(max-width:600px){
    .pay-tables,.info-row,.grid-3{grid-template-columns:1fr;}
    .header{flex-direction:column;}
    .header .slip-label{text-align:center;}
  }
</style>
</head>
<body>
<div class="wrapper">

  <!-- ── Header ── -->
  <div class="header">
    <div>
      ${company.logo ? `<img src="${company.logo}" alt="Logo" style="height:40px;margin-bottom:6px;display:block;"/>` : ""}
      <div class="co-name">${company.name}</div>
      <div class="co-meta">${company.address}</div>
    </div>
    <div class="slip-label">
      <h2>Pay Slip</h2>
      <span>${month}</span>
    </div>
  </div>
  <div class="band"></div>

  <!-- ── Employee Details ── -->
  <div class="section">
    <div class="section-title">Employee Information</div>
    <div class="grid-3">
      <div class="field"><div class="k">Full Name</div><div class="v">${emp.name}</div></div>
      <div class="field"><div class="k">Employee No.</div><div class="v">${emp.id || "—"}</div></div>
      <div class="field"><div class="k">National ID</div><div class="v">${emp.nationalId || "—"}</div></div>
      <div class="field"><div class="k">Department</div><div class="v">${emp.department || "—"}</div></div>
      <div class="field"><div class="k">Position / Grade</div><div class="v">${emp.position || "—"}</div></div>
      <div class="field"><div class="k">KRA PIN</div><div class="v">${emp.taxPin || "—"}</div></div>
      <div class="field"><div class="k">NSSF No.</div><div class="v">${emp.nssfNumber || "—"}</div></div>
      <div class="field"><div class="k">NHIF / SHIF No.</div><div class="v">${emp.nhifNumber || "—"}</div></div>
      <div class="field"><div class="k">Pay Date</div><div class="v">${data.payDate.substring(0, 10)}</div></div>
    </div>
  </div>

  <!-- ── Earnings + Deductions ── -->
  <div class="pay-tables">
    <!-- Earnings -->
    <div>
      <div class="section-title">Earnings</div>
      <table>
        <thead>
          <tr><th>Description</th><th class="amt">Amount (KES)</th></tr>
        </thead>
        <tbody>
          <tr><td class="lbl">Basic Salary</td><td class="amt">${ksh(earnings.basicSalary)}</td></tr>
          ${allowanceRows}
          <tr class="subtotal"><td class="lbl">Gross Salary</td><td class="amt">${ksh(earnings.grossSalary)}</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Deductions -->
    <div>
      <div class="section-title">Deductions</div>
      <table>
        <thead>
          <tr><th>Description</th><th class="amt">Amount (KES)</th></tr>
        </thead>
        <tbody>
          <!-- PAYE -->
          <tr><td class="lbl">PAYE (Gross Tax)</td><td class="amt">${ksh(deductions.paye)}</td></tr>
          ${reliefRow}
          <tr class="subtotal"><td class="lbl">Net PAYE</td><td class="amt">${ksh(netPAYE)}</td></tr>
          <!-- NSSF -->
          ${nssfDetail}
          <!-- SHIF -->
          <tr><td class="lbl">SHIF (Social Health)</td><td class="amt">${ksh(deductions.shif)}</td></tr>
          <!-- Housing Levy -->
          <tr><td class="lbl">Housing Levy (AHL)</td><td class="amt">${ksh(deductions.housingLevy)}</td></tr>
          ${additionalDeductionRows}
          <!-- Total -->
          <tr class="subtotal"><td class="lbl">Total Deductions</td><td class="amt">${ksh(deductions.total)}</td></tr>
        </tbody>
      </table>
    </div>

    <div>
      <div class="section-title">Company Contributions</div>
      <table>
        <thead><tr><th>Description</th><th class="amt">Amount</th><th class="amt">Balance</th></tr></thead>
        <tbody>
          ${employerRows || `<tr><td class="lbl">Employer contributions</td><td class="amt">KES 0.00</td><td class="amt">KES 0.00</td></tr>`}
          <tr class="subtotal"><td class="lbl">Total Company Contribution</td><td class="amt">${ksh((company.employerContributions || []).reduce((sum, item) => sum + item.amount, 0))}</td><td class="amt">KES 0.00</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ── Net Pay ── -->
  <div class="netpay-box">
    <div>
      <div class="label">Net Pay</div>
      <div class="period">${month} · Pay Date: ${data.payDate.substring(0, 10)}</div>
    </div>
    <div class="amount">${ksh(data.netSalary)}</div>
  </div>

  <!-- ── Banking / Statutory Summary ── -->
  <div class="info-row">
    <div>
      <div class="section-title">Banking Details</div>
      <div class="field"><div class="k">Bank</div><div class="v">${emp.bankName || "—"}</div></div>
      <div class="field"><div class="k">Account Number</div><div class="v">${emp.bankAccount ? `••••${emp.bankAccount.slice(-4)}` : "—"}</div></div>
    </div>
    <div>
      <div class="section-title">Statutory Summary</div>
      <div class="field"><div class="k">Gross Salary</div><div class="v">${ksh(earnings.grossSalary)}</div></div>
      <div class="field"><div class="k">Total Deductions</div><div class="v">${ksh(deductions.total)}</div></div>
      <div class="field"><div class="k">Net Pay</div><div class="v" style="color:#1a3c6e;font-size:14px;">${ksh(data.netSalary)}</div></div>
    </div>
  </div>

  <!-- ── Footer ── -->
  <div class="footer">
    <p>This is a computer-generated payslip and does not require a signature. 
       Generated on ${new Date().toLocaleDateString("en-KE", { dateStyle: "long" })}.</p>
    <p class="conf">CONFIDENTIAL — For addressee only</p>
  </div>

</div>
</body>
</html>`;
}
