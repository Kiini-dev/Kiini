export interface PayslipTaxAmounts {
  month: string;
  grossSalary: number;
  totalPayee: number;
  totalNSSF: number;
  totalSHIF: number;
  totalHousing: number;
  netSalary: number;
}

function parseBreakdown(value: unknown): any[] {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(String(value || "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function breakdownTotal(items: any[], pattern: RegExp): number {
  return items.reduce((sum, item) => {
    const label = String(item.name || item.description || item.component || item.type || "");
    return pattern.test(label) ? sum + Number(item.amount || 0) : sum;
  }, 0);
}

export function getPayslipTaxAmounts(row: any): PayslipTaxAmounts {
  const deductions = parseBreakdown(row.deductionsBreakdown);
  const period = String(row.payPeriod || row.payPeriodEnd || row.payDate || row.payMonth || "");
  return {
    month: period.slice(0, 7),
    grossSalary: Number(row.grossSalary || (Number(row.basicSalary || 0) + Number(row.allowances || 0) + Number(row.bonuses || 0))),
    totalPayee: Number(row.payeDeduction || row.paye || breakdownTotal(deductions, /paye|payee|income tax/i)),
    totalNSSF: Number(row.nssfDeduction || row.nssf || breakdownTotal(deductions, /nssf/i)),
    totalSHIF: Number(row.nhifDeduction || row.shif || row.nhif || breakdownTotal(deductions, /shif|nhif/i)),
    totalHousing: Number(row.housingLevy || breakdownTotal(deductions, /housing levy/i)),
    netSalary: Number(row.netSalary || 0),
  };
}

export function groupPayslipTaxRows(rows: any[]): PayslipTaxAmounts[] {
  const months = new Map<string, PayslipTaxAmounts>();
  for (const row of rows) {
    const amount = getPayslipTaxAmounts(row);
    if (!amount.month) continue;
    const totals = months.get(amount.month) || {
      month: amount.month,
      grossSalary: 0,
      totalPayee: 0,
      totalNSSF: 0,
      totalSHIF: 0,
      totalHousing: 0,
      netSalary: 0,
    };
    totals.grossSalary += amount.grossSalary;
    totals.totalPayee += amount.totalPayee;
    totals.totalNSSF += amount.totalNSSF;
    totals.totalSHIF += amount.totalSHIF;
    totals.totalHousing += amount.totalHousing;
    totals.netSalary += amount.netSalary;
    months.set(amount.month, totals);
  }
  return [...months.values()].sort((left, right) => left.month.localeCompare(right.month));
}

export function summarizePayslipTaxRows(rows: any[]) {
  return rows.map(getPayslipTaxAmounts).reduce((totals, row) => ({
    grossSalary: totals.grossSalary + row.grossSalary,
    nssfContribution: totals.nssfContribution + row.totalNSSF,
    payeeTax: totals.payeeTax + row.totalPayee,
    shifContribution: totals.shifContribution + row.totalSHIF,
    housingLevy: totals.housingLevy + row.totalHousing,
    netSalary: totals.netSalary + row.netSalary,
  }), {
    grossSalary: 0,
    nssfContribution: 0,
    payeeTax: 0,
    shifContribution: 0,
    housingLevy: 0,
    netSalary: 0,
  });
}

function csvCell(value: unknown): string {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function payslipsToKraCsv(rows: any[]): string {
  const lines = [["EmployeeID", "Name", "GrossSalary", "NSSF", "PAYE", "SHIF", "HousingLevy"]];
  for (const row of rows) {
    const amounts = getPayslipTaxAmounts(row);
    lines.push([
      row.employeeNumber || row.employeeId,
      `${row.firstName || ""} ${row.lastName || ""}`.trim(),
      amounts.grossSalary,
      amounts.totalNSSF,
      amounts.totalPayee,
      amounts.totalSHIF,
      amounts.totalHousing,
    ]);
  }
  return lines.map((line) => line.map(csvCell).join(",")).join("\n");
}