import { getPool } from "../db";
import { createNotification } from "../_core/notification";
import { queueEmail } from "../routers/emailQueue";
import { renderNotificationTemplate } from "./notificationRenderer";
import { v4 as uuidv4 } from "uuid";
import { createHash } from "node:crypto";
import { subDays, subMonths } from "date-fns";

interface Recipient {
  id: string;
  email?: string | null;
  name?: string | null;
  organizationId?: string | null;
}

interface ReportScope {
  organizationId?: string | null;
  organizationName?: string | null;
  organizationSlug?: string | null;
  email?: string | null;
  address?: string | null;
  website?: string | null;
  logo?: string | null;
  currency?: string | null;
}

interface DepartmentScope {
  id: string;
  name: string;
  organizationId: string;
  organizationName: string;
  organizationSlug?: string | null;
  email?: string | null;
  address?: string | null;
  website?: string | null;
  logo?: string | null;
  currency?: string | null;
  managerId?: string | null;
  managerEmail?: string | null;
  managerName?: string | null;
}

const SUPERADMIN_ROLES = ["super_admin", "superadmin"];
const ORG_ADMIN_ROLES = [
  "admin",
  "org_admin",
  "project_manager",
  "sales_manager",
  "procurement_manager",
  "hr",
  "ict_manager",
];

function formatCount(value: number): string {
  return value.toLocaleString("en-KE");
}

async function tableColumns(pool: any, table: string): Promise<Set<string>> {
  const [rows] = await pool.query(`SHOW COLUMNS FROM \`${table.replace(/`/g, "") }\``);
  return new Set((Array.isArray(rows) ? rows : []).map((row: any) => String(row.Field || row.field || "")));
}

async function countRows(pool: any, table: string, scope: ReportScope, since?: Date): Promise<number> {
  const columns = await tableColumns(pool, table);
  if (!columns.size) return 0;
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (scope.organizationId && columns.has("organizationId")) {
    conditions.push("`organizationId` = ?");
    params.push(scope.organizationId);
  }
  if (since && columns.has("createdAt")) {
    conditions.push("`createdAt` >= ?");
    params.push(since.toISOString().replace("T", " ").substring(0, 19));
  }
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total FROM \`${table}\`${conditions.length ? ` WHERE ${conditions.join(" AND ")}` : ""}`,
    params,
  );
  return Number((rows as any[])[0]?.total || 0);
}

async function recipientsForScope(pool: any, scope: ReportScope): Promise<Recipient[]> {
  const [rows] = await pool.query(
    `SELECT id, email, name, organizationId, role FROM users WHERE role IN (${[...SUPERADMIN_ROLES, ...ORG_ADMIN_ROLES].map(() => "?").join(", ")})`,
    [...SUPERADMIN_ROLES, ...ORG_ADMIN_ROLES],
  );
  return (rows as any[]).filter((row) => {
    if (SUPERADMIN_ROLES.includes(row.role)) return !scope.organizationId;
    return Boolean(scope.organizationId) && row.organizationId === scope.organizationId && ORG_ADMIN_ROLES.includes(row.role);
  });
}

async function organizationScopes(pool: any): Promise<ReportScope[]> {
  const [rows] = await pool.query("SELECT id, name, slug, contactEmail AS email, address, website, logoUrl AS logo, currency FROM organizations ORDER BY name ASC");
  return (rows as any[]).map((row) => ({
    organizationId: row.id,
    organizationName: row.name,
    organizationSlug: row.slug,
    email: row.email,
    address: row.address,
    website: row.website,
    logo: row.logo,
    currency: row.currency,
  }));
}

async function departmentScopes(pool: any): Promise<DepartmentScope[]> {
  const [rows] = await pool.query(
    `SELECT d.id, d.name, d.organizationId, o.name AS organizationName, o.slug AS organizationSlug,
            o.contactEmail AS email, o.address, o.website, o.logoUrl AS logo, o.currency,
            dh.userId AS managerId,
            COALESCE(NULLIF(u.email, ''), NULLIF(e.email, '')) AS managerEmail,
            COALESCE(NULLIF(u.name, ''), CONCAT(e.firstName, ' ', e.lastName)) AS managerName
       FROM departments d
       INNER JOIN organizations o ON o.id = d.organizationId
       LEFT JOIN departmental_heads dh
         ON dh.departmentId = d.id
        AND dh.organizationId = d.organizationId
        AND dh.removedAt IS NULL
       LEFT JOIN employees e
         ON e.id = COALESCE(dh.employeeId, d.headId)
        AND e.organizationId = d.organizationId
       LEFT JOIN users u ON u.id = COALESCE(dh.userId, e.userId)
      WHERE d.status = 'active' OR d.status IS NULL
      ORDER BY d.organizationId, d.name, dh.assignedAt DESC`,
  );
  const uniqueDepartments = new Map<string, DepartmentScope>();
  for (const row of rows as any[]) {
    const key = `${row.organizationId}:${row.id}`;
    if (!uniqueDepartments.has(key)) {
      uniqueDepartments.set(key, {
        ...row,
        managerId: row.managerEmail ? row.managerId : null,
        managerEmail: row.managerEmail,
        managerName: row.managerName,
      });
    }
  }
  return [...uniqueDepartments.values()];
}

function asDbDate(date: Date): string {
  return date.toISOString().replace("T", " ").substring(0, 19);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}

function departmentReportHtml(
  title: string,
  summary: Record<string, number>,
  department: DepartmentScope,
  period: string,
): string {
  const rows = Object.entries(summary)
    .map(([label, value]) => `<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(label)}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right"><strong>${formatCount(value)}</strong></td></tr>`)
    .join("");
  const appUrl = (process.env.APP_URL || process.env.PUBLIC_APP_URL || "https://kiini.africa").replace(/\/$/, "");
  const logoUrl = `${appUrl}/logo.png`;
  const dashboardUrl = department.organizationSlug
    ? `${appUrl}/org/${encodeURIComponent(department.organizationSlug)}/dashboard`
    : `${appUrl}/dashboard`;
  return `<html><body style="font-family:Arial,sans-serif;color:#111827"><img src="${escapeHtml(logoUrl)}" alt="Kiini" style="max-width:160px;height:auto"><h2>${escapeHtml(title)}</h2><p>Period: ${escapeHtml(period)}</p><p>Department: ${escapeHtml(department.name)} (${escapeHtml(department.organizationName)})</p><table style="border-collapse:collapse;width:100%"><tbody>${rows}</tbody></table><p><a href="${escapeHtml(dashboardUrl)}" target="_blank" style="display:inline-block;padding:12px 28px;background:#001D3D;color:#fff;text-decoration:none;border-radius:6px">Open Department Dashboard</a></p><p>This report was generated automatically by Kiini: One Hub. Total Control.</p></body></html>`;
}

async function departmentSummary(
  pool: any,
  department: DepartmentScope,
  currentStart: Date,
  periodEnd: Date,
  previousStart: Date,
): Promise<Record<string, number>> {
  const current = [asDbDate(currentStart), asDbDate(periodEnd)];
  const previous = [asDbDate(previousStart), asDbDate(currentStart)];
  const statements: string[] = [];
  const params: unknown[] = [];
  const addMetric = (label: string, rowId: string, from: string, where: string, scopeParams: unknown[], dateColumn: string) => {
    statements.push(`(SELECT COUNT(DISTINCT ${rowId})
      ${from} WHERE ${where} AND ${dateColumn} >= ? AND ${dateColumn} < ?) AS \`${label} current\``);
    params.push(...scopeParams, ...current);
    statements.push(`(SELECT COUNT(DISTINCT ${rowId})
      ${from} WHERE ${where} AND ${dateColumn} >= ? AND ${dateColumn} < ?) AS \`${label} previous\``);
    params.push(...scopeParams, ...previous);
  };
  const employeeScope = "e.organizationId = ? AND LOWER(TRIM(e.department)) = LOWER(TRIM(?))";
  addMetric("Employee hires", "e.id", "FROM employees e", employeeScope, [department.organizationId, department.name], "e.hireDate");
  addMetric(
    "Leave requests",
    "lr.id",
    "FROM leaveRequests lr INNER JOIN employees e ON e.id = lr.employeeId",
    `e.organizationId = ? AND LOWER(TRIM(e.department)) = LOWER(TRIM(?))`,
    [department.organizationId, department.name],
    "lr.createdAt",
  );
  addMetric(
    "Payroll",
    "p.id",
    "FROM payroll p INNER JOIN employees e ON e.id = p.employeeId",
    `e.organizationId = ? AND LOWER(TRIM(e.department)) = LOWER(TRIM(?))`,
    [department.organizationId, department.name],
    "p.payPeriodStart",
  );
  addMetric(
    "Tasks",
    "t.id",
    "FROM staffTasks t INNER JOIN departments d ON d.id = t.departmentId",
    "d.id = ? AND d.organizationId = ?",
    [department.id, department.organizationId],
    "t.createdAt",
  );
  addMetric(
    "Expenses",
    "x.id",
    `FROM expenses x
       LEFT JOIN budgetAllocations ba ON ba.id = x.budgetAllocationId
       LEFT JOIN budgets b ON b.id = ba.budgetId
       LEFT JOIN employees owner ON owner.userId = x.createdBy AND owner.organizationId = x.organizationId`,
    "x.organizationId = ? AND (b.departmentId = ? OR (b.departmentId IS NULL AND LOWER(TRIM(owner.department)) = LOWER(TRIM(?))))",
    [department.organizationId, department.id, department.name],
    "x.expenseDate",
  );
  const [rows] = await pool.query(`SELECT ${statements.join(", ")}`, params);
  const values = (rows as any[])[0] || {};
  const summary: Record<string, number> = {
    "Active employees": 0,
  };
  for (const label of ["Employee hires", "Leave requests", "Payroll", "Tasks", "Expenses"]) {
    summary[`${label} (current period)`] = Number(values[`${label} current`] || 0);
    summary[`${label} (previous period)`] = Number(values[`${label} previous`] || 0);
  }
  const [activeRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM employees e
      WHERE e.organizationId = ?
        AND LOWER(TRIM(e.department)) = LOWER(TRIM(?))
        AND e.status IN ('active', 'on_leave')`,
    [department.organizationId, department.name],
  );
  summary["Active employees"] = Number((activeRows as any[])[0]?.total || 0);
  return summary;
}

function reportHtml(title: string, summary: Record<string, number>, scope: ReportScope, period: string): string {
  const rows = Object.entries(summary)
    .map(([label, value]) => `<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb">${label}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right"><strong>${formatCount(value)}</strong></td></tr>`)
    .join("");
  return `<h2>${title}</h2><p>Period: ${period}</p><p>Scope: ${scope.organizationName || "All instances"}</p><table style="border-collapse:collapse;width:100%"><tbody>${rows}</tbody></table><p>This report was generated automatically by Kiini: One Hub. Total Control.</p>`;
}

function reportEntityId(kind: "weekly" | "monthly", scopeKey: string, periodStart: Date): string {
  return createHash("sha256")
    .update(`${kind}:${scopeKey}:${asDbDate(periodStart)}`)
    .digest("hex")
    .slice(0, 64);
}

async function deliver(
  pool: any,
  recipient: Recipient,
  title: string,
  message: string,
  html: string,
  category: string,
  reportId: string,
  ccEmails: string[] = [],
) {
  if (!recipient.email) return false;
  const entityType = "system_report";
  const [existing] = await pool.query(
    `SELECT id FROM emailQueue
      WHERE eventType = ? AND entityType = ? AND entityId = ? AND recipientEmail = ?
      LIMIT 1`,
    [category, entityType, reportId, recipient.email],
  );
  if ((existing as any[]).length > 0) return false;

  await createNotification({
    userId: recipient.id,
    title,
    message,
    type: "system",
    category,
    priority: "normal",
  });
  const queued = await queueEmail({
    recipientEmail: recipient.email,
    recipientName: recipient.name || undefined,
    subject: title,
    htmlContent: html,
    textContent: message,
    eventType: category,
    entityType,
    entityId: reportId,
    userId: recipient.id,
    ccEmails,
    metadata: { reportId: uuidv4() },
  });
  if (!queued.success) {
    throw new Error(`Unable to queue system report for ${recipient.email}: ${queued.error || "unknown error"}`);
  }
  return true;
}

export async function dispatchSystemReport(kind: "weekly" | "monthly") {
  const pool = getPool();
  if (!pool) return { delivered: 0, scopes: 0 };
  const now = new Date();
  const since = kind === "weekly" ? subDays(now, 7) : subMonths(now, 1);
  const previousSince = kind === "weekly" ? subDays(since, 7) : subMonths(since, 1);
  const period = `${since.toLocaleDateString("en-KE")} - ${now.toLocaleDateString("en-KE")}`;
  const globalScope: ReportScope = {};
  const orgScopes = await organizationScopes(pool);
  const departments = await departmentScopes(pool);
  let delivered = 0;

  const globalSummary = {
    "New users": await countRows(pool, "users", globalScope, since),
    "New clients": await countRows(pool, "clients", globalScope, since),
    "Invoices": await countRows(pool, "invoices", globalScope, since),
    "Payments": await countRows(pool, "payments", globalScope, since),
    "Failed emails": await countRows(pool, "emailQueue", globalScope, since),
  };
  const globalTitle = `${kind === "weekly" ? "Weekly" : "Monthly"} System Report`;
  const globalMessage = Object.entries(globalSummary).map(([label, value]) => `${label}: ${formatCount(value)}`).join(" | ");
  const globalDashboardUrl = `${(process.env.APP_URL || process.env.PUBLIC_APP_URL || "https://kiini.africa").replace(/\/$/, "")}/admin/system-health`;
  const globalRendered = await renderNotificationTemplate("admin/admin_daily_digest", {
    app_name: "Kiini",
    digest_type: kind === "weekly" ? "Weekly" : "Monthly",
    digest_date: period,
    new_users: globalSummary["New users"],
    new_clients: globalSummary["New clients"],
    invoices_issued: globalSummary.Invoices,
    payments_count: globalSummary.Payments,
    failed_email_count: globalSummary["Failed emails"],
    scope_name: "All instances",
    highlights_text: globalMessage,
    dashboard_url: globalDashboardUrl,
    actionUrl: globalDashboardUrl,
    company_logo_url: `${(process.env.APP_URL || process.env.PUBLIC_APP_URL || "https://kiini.africa").replace(/\/$/, "")}/logo.png`,
    currency: "KES",
  }, { subject: globalTitle, html: reportHtml(globalTitle, globalSummary, globalScope, period), text: globalMessage });
  const globalReportId = reportEntityId(kind, "global", since);
  const globalRecipients = await recipientsForScope(pool, globalScope);
  for (const recipient of globalRecipients) {
    if (await deliver(pool, recipient, globalRendered.subject, globalRendered.text, globalRendered.html, `system_report_${kind}`, globalReportId)) {
      delivered++;
    }
  }

  for (const department of departments) {
    const summary = await departmentSummary(pool, department, since, now, previousSince);
    const title = `${kind === "weekly" ? "Weekly" : "Monthly"} Department Report - ${department.name}`;
    const message = Object.entries(summary).map(([label, value]) => `${label}: ${formatCount(value)}`).join(" | ");
    const rendered = {
      subject: title,
      html: departmentReportHtml(title, summary, department, period),
      text: message,
    };
    const admins = await recipientsForScope(pool, {});
    const adminEmails = [...new Set(admins.map((admin) => admin.email).filter((email): email is string => Boolean(email)))];
    const reportId = reportEntityId(kind, `${department.organizationId}:${department.id}`, since);
    if (department.managerEmail && department.managerId) {
      const manager: Recipient = {
        id: department.managerId,
        email: department.managerEmail,
        name: department.managerName,
        organizationId: department.organizationId,
      };
      if (await deliver(
        pool,
        manager,
        rendered.subject,
        rendered.text,
        rendered.html,
        `system_report_${kind}_department`,
        reportId,
        adminEmails.filter((email) => email.toLowerCase() !== department.managerEmail!.toLowerCase()),
      )) {
        delivered++;
      }
    } else {
      for (const recipient of admins) {
        if (await deliver(pool, recipient, rendered.subject, rendered.text, rendered.html, `system_report_${kind}_department`, reportId)) {
          delivered++;
        }
      }
    }
  }
  return { delivered, scopes: 1 + orgScopes.length + departments.length };
}

export async function dispatchSystemAlert(input: {
  title: string;
  message: string;
  organizationId?: string | null;
  category?: string;
  priority?: "low" | "normal" | "high" | "critical";
  affectedUserEmail?: string;
  ipAddress?: string;
  deviceInfo?: string;
  attemptCount?: number;
  actionTaken?: string;
  integrationName?: string;
  errorCode?: string;
  failedCount?: number;
}) {
  const pool = getPool();
  if (!pool) return { delivered: 0 };
  const scope = input.organizationId ? { organizationId: input.organizationId } : {};
  const recipients = await recipientsForScope(pool, scope);
  let organization: Record<string, unknown> | undefined;
  if (input.organizationId) {
    const [rows] = await pool.query(
      "SELECT name, contactEmail AS email, address, website, logoUrl AS logo FROM organizations WHERE id = ? LIMIT 1",
      [input.organizationId],
    );
    organization = (rows as any[])[0];
  }
  const category = String(input.category || "").toLowerCase();
  const templateId = category.includes("security")
    ? "admin/admin_security_alert"
    : category.includes("integration")
      ? "admin/admin_integration_failure"
      : input.priority === "critical" ? "admin/admin_critical_alert" : "admin/admin_system_warning";
  const eventTime = new Date().toLocaleString("en-KE");
  const dashboardUrl = `${(process.env.APP_URL || process.env.PUBLIC_APP_URL || "https://kiini.africa").replace(/\/$/, "")}/admin/system-health`;
  const renderContext = {
    organizationId: input.organizationId,
    company: organization,
    app_name: "Kiini",
    alert_title: input.title,
    alert_message: input.message,
    alert_details: input.message,
    alert_timestamp: eventTime,
    alert_source: input.category || "System",
    incident_id: `${input.category || "alert"}-${Date.now()}`,
    affected_scope: organization?.name || "Global system",
    recommended_action: "Review the alert in System Health.",
    alert_url: dashboardUrl,
    warning_title: input.title,
    warning_message: input.message,
    metric_name: input.category || "System alert",
    current_value: input.priority || "Triggered",
    threshold_value: "Configured threshold",
    trend: "Triggered",
    environment: process.env.NODE_ENV || "production",
    first_seen_at: eventTime,
    dashboard_url: dashboardUrl,
    security_event: input.title,
    affected_user_email: input.affectedUserEmail || "Not available",
    ip_address: input.ipAddress || "Not available",
    device_info: input.deviceInfo || "Not available",
    location: "Not available",
    attempt_count: input.attemptCount ?? 0,
    action_taken: input.actionTaken || "Review the account activity.",
    audit_log_url: dashboardUrl,
    lock_account_url: dashboardUrl,
    integration_name: input.integrationName || input.title,
    error_code: input.errorCode || "N/A",
    error_message: input.message,
    failed_count: input.failedCount ?? 1,
    first_failure_at: eventTime,
    last_success_at: "Not available",
    integration_url: dashboardUrl,
  };
  const rendered = await renderNotificationTemplate(templateId, renderContext, {
    subject: input.title,
    html: `<h2>${input.title}</h2><p>${input.message}</p>`,
    text: input.message,
  });
  for (const recipient of recipients) {
    await createNotification({
      userId: recipient.id,
      title: input.title,
      message: input.message,
      type: input.priority === "critical" ? "error" : "warning",
      category: input.category || "system_alert",
      priority: input.priority || "high",
      organizationId: input.organizationId || undefined,
    });
    if (recipient.email) {
      await queueEmail({
        recipientEmail: recipient.email,
        recipientName: recipient.name || undefined,
        subject: rendered.subject,
        htmlContent: rendered.html,
        textContent: rendered.text,
        eventType: input.category || "system_alert",
        userId: recipient.id,
      });
    }
  }
  return { delivered: recipients.length };
}
