import { z } from "zod";
import { router } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../_core/trpc";
import { createNotification, getPool } from "../db";
import { TRPCError } from "@trpc/server";
import cron from "node-cron";
import { sendEmailImmediately } from "../services/emailService";

const hrViewProcedure = createFeatureRestrictedProcedure("hr:view");
const hrEditProcedure = createFeatureRestrictedProcedure("hr:edit");

function pool() {
  const p = getPool();
  if (!p) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
  return p;
}

function scheduleExpression(schedule: string, type: string): string | null {
  if (type === "payroll_generation" && schedule === "monthly") return "0 8 21 * *";
  if (schedule === "daily") return "0 9 * * *";
  if (schedule === "weekly") return "0 9 * * 1";
  if (schedule === "monthly") return "0 9 1 * *";
  return null;
}

const automationTasks = new Map<string, ReturnType<typeof cron.schedule>>();

async function sendProbationAlerts(days: number): Promise<number> {
  const p = pool();
  const [employees] = await p.query(
    `SELECT id, firstName, lastName, organizationId, probationEndDate
     FROM employees
     WHERE status = 'active' AND probationEndDate IS NOT NULL
       AND probationEndDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)`,
    [days]
  );
  let alertsSent = 0;

  for (const employee of employees as any[]) {
    const endDate = String(employee.probationEndDate).slice(0, 10);
    const entityId = `${employee.id}:${endDate}`;
    const [recipients] = await p.query(
      `SELECT id, email FROM users
       WHERE organizationId = ? AND role IN ('hr', 'hr_manager', 'super_admin')`,
      [employee.organizationId]
    );

    for (const recipient of recipients as any[]) {
      const [existing] = await p.query(
        `SELECT id FROM notifications
         WHERE userId = ? AND entityType = 'probation_review' AND entityId = ? LIMIT 1`,
        [recipient.id, entityId]
      );
      if ((existing as any[]).length) continue;

      const employeeName = `${employee.firstName} ${employee.lastName}`.trim();
      const message = `${employeeName}'s probation period ends on ${endDate}. Please review their employment status.`;
      await createNotification({
        userId: recipient.id,
        type: "warning",
        title: "Probation review due",
        message,
        category: "hr",
        entityType: "probation_review",
        entityId,
        priority: "high",
        actionUrl: "/hr/automation",
      } as any);

      if (recipient.email) {
        try {
          await sendEmailImmediately({
            toEmail: recipient.email,
            subject: "Probation review due",
            htmlContent: `<p>${message.replace(/[&<>"']/g, (character) => ({
              "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
            })[character] || character)}</p>`,
          });
        } catch (error) {
          console.error(`[HR] Probation review email failed for HR user ${recipient.id}:`, error);
        }
      }
      alertsSent++;
    }
  }

  return alertsSent;
}

async function executeAutomationRule(rule: any): Promise<string> {
  const config = typeof rule.config === "string" ? JSON.parse(rule.config || "{}") : rule.config || {};
  switch (rule.type) {
    case "contract_alert": {
      const { sendContractExpiryAlerts } = await import("../jobs/hrAutomationJobs");
      await sendContractExpiryAlerts(Number(config.days) || 30);
      return "Contract expiry alert run completed";
    }
    case "probation_alert": {
      const days = Number(config.days) || 90;
      const count = await sendProbationAlerts(days);
      return `Sent ${count} probation review alerts for the next ${days} days`;
    }
    case "leave_accrual": {
      const { monthlyLeaveAccrual } = await import("../jobs/hrAutomationJobs");
      await monthlyLeaveAccrual().handler();
      return "Leave accrual run completed";
    }
    case "payroll_generation": {
      const { processMonthlyPayroll } = await import("../jobs/payrollJobs");
      const result = await processMonthlyPayroll(undefined, undefined, `hr-automation:${rule.id}`);
      if (result.errors.length) throw new Error(result.errors.join("; "));
      return `Processed payroll for ${result.processed} employees; ${result.skipped} skipped`;
    }
    case "birthday_reminder": {
      const { birthdayReminder } = await import("../jobs/hrAutomationJobs");
      await birthdayReminder().handler();
      return "Birthday reminder run completed";
    }
    default:
      throw new Error(`No automation handler is registered for rule type '${rule.type}'`);
  }
}

export async function runHRAutomationRules(ruleIds?: string[]) {
  const p = pool();
  const params: unknown[] = [];
  let query = "SELECT * FROM hr_automation_rules WHERE is_active = 1";
  if (ruleIds?.length) {
    query += ` AND id IN (${ruleIds.map(() => "?").join(",")})`;
    params.push(...ruleIds);
  }
  const [rules] = await p.query(query, params);
  const results: Array<{ ruleId: string; status: "success" | "error"; result: string }> = [];

  for (const rule of rules as any[]) {
    let status: "success" | "error" = "success";
    let result: string;
    try {
      result = await executeAutomationRule(rule);
    } catch (error) {
      status = "error";
      result = error instanceof Error ? error.message : String(error);
      console.error(`[HR] Automation rule '${rule.name}' failed:`, error);
    }

    await p.query(
      `INSERT INTO hr_automation_logs (id, rule_id, action, status, details, executed_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [`log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, rule.id, rule.name, status, result]
    );
    await p.query(
      "UPDATE hr_automation_rules SET last_run_at = NOW() WHERE id = ?",
      [rule.id]
    );
    results.push({ ruleId: rule.id, status, result });
  }

  return { success: results.every((result) => result.status === "success"), results };
}

export async function initializeHRAutomationRuleSchedules() {
  for (const task of automationTasks.values()) task.stop();
  automationTasks.clear();

  let p;
  try {
    p = pool();
  } catch (error) {
    console.error("[HR] Could not initialize automation rules:", error);
    return;
  }

  try {
    const [rules] = await p.query("SELECT id, name, schedule FROM hr_automation_rules WHERE is_active = 1");
    for (const rule of rules as any[]) {
      const expression = scheduleExpression(String(rule.schedule || ""), String(rule.type || ""));
      if (!expression) {
        console.error(`[HR] Invalid schedule '${rule.schedule}' for automation rule '${rule.name}'`);
        continue;
      }

      const task = cron.schedule(expression, async () => {
        try {
          await runHRAutomationRules([rule.id]);
        } catch (error) {
          console.error(`[HR] Scheduled automation rule '${rule.name}' failed:`, error);
        }
      }, { timezone: "Africa/Nairobi" });
      automationTasks.set(rule.id, task);
      console.log(`[HR] Scheduled automation rule '${rule.name}' (${rule.schedule}, Africa/Nairobi)`);
    }
  } catch (error) {
    console.error("[HR] Failed to load automation rules:", error);
  }
}

export function stopHRAutomationRuleSchedules() {
  for (const task of automationTasks.values()) task.stop();
  automationTasks.clear();
}

export const hrAutomationRouter = router({
  // ── Automation Dashboard Stats ─────────────────────────────────
  getStats: hrViewProcedure.query(async () => {
    const p = pool();

    // Count contracts expiring within 30 days
    const [expiringContracts] = await p.query(
      `SELECT COUNT(*) as count FROM employee_contracts
       WHERE status = 'active' AND end_date IS NOT NULL
       AND end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)`
    );

    // Count employees needing leave accrual
    const [pendingAccrual] = await p.query(
      `SELECT COUNT(DISTINCT employee_id) as count FROM leave_balances
       WHERE YEAR(created_at) = YEAR(CURDATE())`
    );

    // Count pending payroll runs
    const [pendingPayroll] = await p.query(
      `SELECT COUNT(*) as count FROM payroll WHERE status = 'draft'`
    );

    // Count active automation rules
    const [automationRules] = await p.query(
      `SELECT COUNT(*) as count FROM hr_automation_rules WHERE is_active = 1`
    );

    return {
      expiringContracts: (expiringContracts as any[])[0]?.count || 0,
      pendingAccrual: (pendingAccrual as any[])[0]?.count || 0,
      pendingPayroll: (pendingPayroll as any[])[0]?.count || 0,
      activeRules: (automationRules as any[])[0]?.count || 0,
    };
  }),

  // ── Contract Expiry Alerts ─────────────────────────────────────
  getExpiringContracts: hrViewProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ input }) => {
      const p = pool();
      const [rows] = await p.query(
        `SELECT ec.*, e.first_name, e.last_name, e.email, e.department
         FROM employee_contracts ec
         LEFT JOIN employees e ON ec.employee_id = e.id
         WHERE ec.status = 'active' AND ec.end_date IS NOT NULL
         AND ec.end_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
         ORDER BY ec.end_date ASC`,
        [input.days]
      );
      return rows as any[];
    }),

  // ── Leave Accrual ──────────────────────────────────────────────
  runLeaveAccrual: hrEditProcedure
    .input(z.object({
      leaveType: z.string().default("annual"),
      accrualDays: z.number().default(1.75), // ~21 days/year monthly
      year: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const p = pool();
      const year = input.year || new Date().getFullYear();
      const month = new Date().getMonth() + 1;

      // Get all active employees
      const [employees] = await p.query(
        "SELECT id, first_name, last_name FROM employees WHERE status = 'active'"
      );

      let accrued = 0;
      for (const emp of employees as any[]) {
        // Check if already accrued this month
        const [existing] = await p.query(
          `SELECT id FROM leave_balances
           WHERE employee_id = ? AND leave_type = ? AND YEAR(created_at) = ?
           AND MONTH(created_at) = ?`,
          [emp.id, input.leaveType, year, month]
        );

        if ((existing as any[]).length === 0) {
          // Upsert leave balance
          const [balRow] = await p.query(
            `SELECT id, total_days, used_days FROM leave_balances
             WHERE employee_id = ? AND leave_type = ? AND YEAR(created_at) = YEAR(CURDATE())`,
            [emp.id, input.leaveType]
          );

          if ((balRow as any[]).length > 0) {
            const bal = (balRow as any[])[0];
            await p.query(
              "UPDATE leave_balances SET total_days = total_days + ? WHERE id = ?",
              [input.accrualDays, bal.id]
            );
          } else {
            const id = `lb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            await p.query(
              `INSERT INTO leave_balances (id, employee_id, leave_type, total_days, used_days, year, created_at)
               VALUES (?, ?, ?, ?, 0, ?, NOW())`,
              [id, emp.id, input.leaveType, input.accrualDays, year]
            );
          }
          accrued++;
        }
      }

      return { success: true, accrued, message: `Leave accrual completed for ${accrued} employees` };
    }),

  // ── Auto Payroll Generation ────────────────────────────────────
  generatePayroll: hrEditProcedure
    .input(z.object({
      month: z.number().min(1).max(12),
      year: z.number(),
    }))
    .mutation(async ({ input }) => {
      const p = pool();
      const period = `${input.year}-${String(input.month).padStart(2, "0")}`;

      // Check if payroll already exists for this period
      const [existing] = await p.query(
        "SELECT id FROM payroll WHERE pay_period = ? LIMIT 1",
        [period]
      );
      if ((existing as any[]).length > 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Payroll for ${period} already exists` });
      }

      // Get all active employees with salary info
      const [employees] = await p.query(
        `SELECT e.id, e.first_name, e.last_name, e.email, e.department,
                COALESCE(e.basic_salary, 0) as basic_salary
         FROM employees e
         WHERE e.status = 'active' AND e.basic_salary > 0`
      );

      let generated = 0;
      for (const emp of employees as any[]) {
        const basic = parseFloat(emp.basic_salary) || 0;
        if (basic <= 0) continue;

        // Simple Kenyan payroll calc
        const nhif = basic <= 5999 ? 150 : basic <= 7999 ? 300 : basic <= 11999 ? 400 : basic <= 14999 ? 500 : basic <= 19999 ? 600 : basic <= 24999 ? 750 : basic <= 29999 ? 850 : basic <= 34999 ? 900 : basic <= 39999 ? 950 : basic <= 44999 ? 1000 : basic <= 49999 ? 1100 : basic <= 59999 ? 1200 : basic <= 69999 ? 1300 : basic <= 79999 ? 1400 : basic <= 89999 ? 1500 : basic <= 99999 ? 1600 : 1700;
        const nssf = Math.min(basic * 0.06, 1080);
        const housingLevy = basic * 0.015;
        const taxableIncome = basic - nssf;
        // Simplified PAYE
        let paye = 0;
        if (taxableIncome > 0) {
          if (taxableIncome <= 24000) paye = taxableIncome * 0.10;
          else if (taxableIncome <= 32333) paye = 2400 + (taxableIncome - 24000) * 0.25;
          else paye = 2400 + 2083.25 + (taxableIncome - 32333) * 0.30;
          paye = Math.max(0, paye - 2400); // Personal relief
        }

        const totalDeductions = nhif + nssf + housingLevy + paye;
        const netPay = basic - totalDeductions;

        const payrollId = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        await p.query(
          `INSERT INTO payroll (id, employee_id, pay_period, basic_salary, gross_salary, nhif, nssf, paye, housing_levy, total_deductions, net_salary, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', NOW())`,
          [payrollId, emp.id, period, basic, basic, nhif, nssf, paye, housingLevy, totalDeductions, netPay]
        );
        generated++;
      }

      return { success: true, generated, message: `Generated payroll for ${generated} employees for ${period}` };
    }),

  // ── Automation Rules CRUD ──────────────────────────────────────
  getRules: hrViewProcedure.query(async () => {
    const p = pool();
    const [rows] = await p.query(
      "SELECT * FROM hr_automation_rules ORDER BY created_at DESC"
    );
    return rows as any[];
  }),

  createRule: hrEditProcedure
    .input(z.object({
      name: z.string().max(200),
      type: z.enum(["leave_accrual", "contract_alert", "payroll_generation", "probation_alert", "birthday_reminder"]),
      schedule: z.enum(["daily", "weekly", "monthly"]).default("monthly"),
      config: z.string().max(2000).default("{}"),
      isActive: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const p = pool();
      const id = `rule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await p.query(
        `INSERT INTO hr_automation_rules (id, name, type, schedule, config, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [id, input.name, input.type, input.schedule, input.config, input.isActive ? 1 : 0]
      );
      await initializeHRAutomationRuleSchedules();
      return { success: true, id };
    }),

  updateRule: hrEditProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().max(200).optional(),
      schedule: z.enum(["daily", "weekly", "monthly"]).optional(),
      config: z.string().max(2000).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const p = pool();
      const sets: string[] = [];
      const vals: any[] = [];
      if (input.name !== undefined) { sets.push("name = ?"); vals.push(input.name); }
      if (input.schedule !== undefined) { sets.push("schedule = ?"); vals.push(input.schedule); }
      if (input.config !== undefined) { sets.push("config = ?"); vals.push(input.config); }
      if (input.isActive !== undefined) { sets.push("is_active = ?"); vals.push(input.isActive ? 1 : 0); }
      if (sets.length === 0) return { success: true };
      vals.push(input.id);
      await p.query(`UPDATE hr_automation_rules SET ${sets.join(", ")} WHERE id = ?`, vals);
      await initializeHRAutomationRuleSchedules();
      return { success: true };
    }),

  deleteRule: hrEditProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const p = pool();
      await p.query("DELETE FROM hr_automation_rules WHERE id = ?", [input.id]);
      await initializeHRAutomationRuleSchedules();
      return { success: true };
    }),

  // ── Automation Logs ────────────────────────────────────────────
  getLogs: hrViewProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const p = pool();
      const [rows] = await p.query(
        `SELECT l.*, r.name AS rule_name, l.details AS result
         FROM hr_automation_logs l
         LEFT JOIN hr_automation_rules r ON r.id = l.rule_id
         ORDER BY l.executed_at DESC LIMIT ?`,
        [input.limit]
      );
      return rows as any[];
    }),

  // ── Run All Active Automation ──────────────────────────────────
  runAutomation: hrEditProcedure.mutation(async () => runHRAutomationRules()),
});
