import { getPool } from "../db";
import { generateAnnualP9Forms } from "./p9Jobs";
import { processAndDispatchPayslips, processMonthlyPayroll } from "./payrollJobs";

export type ScheduledJobName = "payroll-process" | "payslip-dispatch" | "p9-generate";

function nairobiDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) => Number(parts.find((entry) => entry.type === type)?.value);
  return { year: part("year"), month: part("month"), day: part("day") };
}

function parsePayPeriod(value?: string) {
  const match = value?.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) };
}

function lastDayOfMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export async function runScheduledJob(name: string, period?: string, now = new Date()) {
  const current = nairobiDate(now);

  switch (name) {
    case "payroll-process": {
      const target = parsePayPeriod(period) || current;
      return processMonthlyPayroll(target.year, target.month, "system-cron");
    }
    case "payslip-dispatch": {
      const target = parsePayPeriod(period) || current;
      if (!period && target.day !== lastDayOfMonth(target.year, target.month)) {
        return { dispatched: 0, errors: [], skipped: true };
      }
      return processAndDispatchPayslips(target.year, target.month);
    }
    case "p9-generate": {
      const taxYear = period ? Number(period) : current.year - 1;
      if (!Number.isInteger(taxYear) || taxYear < 2000 || taxYear > 2100) {
        throw new Error("P9 tax year must be between 2000 and 2100");
      }
      return generateAnnualP9Forms(taxYear, "system-cron");
    }
    default:
      throw new Error(`Unsupported scheduled job: ${name}`);
  }
}

export async function closeScheduledJobConnections() {
  const pool = getPool();
  if (pool) await pool.end();
}