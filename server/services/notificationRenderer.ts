import { getDb, getPool } from "../db";
import { organizationSettings, settings } from "../../drizzle/schema";
import { and, eq } from "drizzle-orm";
import { getCompanyInfo } from "../utils/company-info";
import { buildEmailHtml, htmlToPlainText } from "../_core/emailTemplates";
import * as fs from "fs";
import * as path from "path";

export interface NotificationTemplateFallback {
  subject: string;
  html: string;
  text?: string;
}

export interface NotificationAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
}

export interface NotificationRenderContext {
  company?: Record<string, unknown>;
  client?: Record<string, unknown>;
  user?: Record<string, unknown>;
  document?: Record<string, unknown>;
  recipientEmail?: string;
  recipientName?: string;
  attachments?: NotificationAttachment[];
  [key: string]: unknown;
}

const publicAppUrl = () => (process.env.APP_URL || process.env.PUBLIC_APP_URL || "https://kiini.africa").replace(/\/$/, "");

function absolutePublicUrl(value: unknown, baseUrl: string): string {
  const url = String(value ?? "").trim();
  if (!url) return "";
  if (/^(?:https?:|data:)/i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  return `${baseUrl}/${url.replace(/^\/+/, "")}`;
}

const actionLinkTokens = new Set([
  "action_url", "alert_url", "approve_url", "appointment_url", "backup_url", "cta_url",
  "dashboard_url", "document_url", "download_url", "estimate_url", "feedback_url",
  "hr_portal_url", "integration_url", "invitation_url", "invoice_url", "new_estimate_url",
  "new_proposal_url", "notification_url", "payslip_url", "project_url", "proposal_url",
  "receipt_pdf_url", "receipt_url", "refund_url", "reminder_action_url", "retry_payment_url",
  "sign_url", "task_url", "ticket_url", "verification_url",
]);

const routeTokens: Record<string, (context: NotificationRenderContext, basePath: string) => string | undefined> = {
  action_url: (context) => stringContextValue(context, "actionUrl", "action_url"),
  alert_url: (context) => stringContextValue(context, "actionUrl", "action_url") || "/admin/system-health",
  appointment_url: (_context, basePath) => `${basePath}/calendar`,
  approve_url: (context, basePath) => resourcePath(context, "approval", "approvalId", basePath) || `${basePath}/approvals`,
  audit_log_url: () => "/audit-logs",
  backup_url: () => "/admin/backups",
  app_url: () => publicAppUrl(),
  cta_url: (context, basePath) => stringContextValue(context, "actionUrl", "action_url", "ctaUrl", "cta_url") || `${basePath}/dashboard`,
  dashboard_url: (_context, basePath) => `${basePath}/dashboard`,
  estimate_url: (context, basePath) => resourcePath(context, "estimate", "estimateId", basePath) || `${basePath}/estimates`,
  feedback_url: (context, basePath) => stringContextValue(context, "feedbackUrl", "feedback_url", "actionUrl", "action_url") || `${basePath}/notifications`,
  hr_portal_url: (_context, basePath) => `${basePath}/hr`,
  integration_url: () => "/integrations",
  invitation_url: (context) => {
    const explicit = stringContextValue(context, "invitationUrl", "invitation_url");
    if (explicit) return explicit;
    const token = stringContextValue(context, "invitationToken", "invitation_token", "token");
    return token ? `/signup?invitation=${encodeURIComponent(token)}` : "/signup";
  },
  project_url: (context, basePath) => resourcePath(context, "project", "projectId", basePath),
  invoice_url: (context, basePath) => resourcePath(context, "invoice", "invoiceId", basePath),
  client_url: (context, basePath) => resourcePath(context, "client", "clientId", basePath),
  task_url: (context, basePath) => resourcePath(context, "task", "taskId", basePath),
  leave_url: (context, basePath) => resourcePath(context, "leave", "leaveRequestId", basePath),
  document_url: (context, basePath) => resourcePath(context, "document", "documentId", basePath),
  expense_url: (context, basePath) => resourcePath(context, "expense", "expenseId", basePath),
  lock_account_url: () => "/admin/system-health",
  download_url: (context, basePath) => {
    const explicit = stringContextValue(context, "downloadUrl", "download_url");
    if (explicit) return explicit;
    const exportId = stringContextValue(context, "exportId", "export_id", "entityId", "entity_id");
    return exportId ? `${basePath}/exports/${encodeURIComponent(exportId)}` : undefined;
  },
  new_estimate_url: (_context, basePath) => `${basePath}/estimates/create`,
  new_proposal_url: (_context, basePath) => `${basePath}/proposals?action=create`,
  notification_url: (_context, basePath) => `${basePath}/notifications`,
  payslip_url: (context, basePath) => {
    const explicit = stringContextValue(context, "payslipUrl", "payslip_url");
    if (explicit) return explicit;
    const payslipId = stringContextValue(context, "payslipId", "payslip_id");
    const payrollId = stringContextValue(context, "payrollId", "payroll_id");
    return payslipId ? `${basePath}/payslips/${encodeURIComponent(payslipId)}`
      : payrollId ? `${basePath}/payroll/${encodeURIComponent(payrollId)}`
        : `${basePath}/my-payslips`;
  },
  proposal_url: (context, basePath) => resourcePath(context, "proposal", "proposalId", basePath) || `${basePath}/proposals`,
  receipt_pdf_url: (context, basePath) => stringContextValue(context, "receiptPdfUrl", "receipt_pdf_url", "receiptUrl", "receipt_url")
    || resourcePath(context, "receipt", "receiptId", basePath)
    || `${basePath}/receipts`,
  receipt_url: (context, basePath) => stringContextValue(context, "receiptUrl", "receipt_url")
    || resourcePath(context, "receipt", "receiptId", basePath)
    || `${basePath}/receipts`,
  refund_url: (context, basePath) => stringContextValue(context, "refundUrl", "refund_url")
    || resourcePath(context, "payment", "paymentId", basePath)
    || `${basePath}/payments`,
  reminder_action_url: (context, basePath) => stringContextValue(context, "reminderActionUrl", "reminder_action_url", "actionUrl", "action_url")
    || `${basePath}/notifications`,
  reschedule_url: (_context, basePath) => `${basePath}/calendar`,
  reset_link: (context) => {
    const explicit = stringContextValue(context, "resetLink", "reset_link", "resetUrl", "reset_url");
    if (explicit) return explicit;
    const token = stringContextValue(context, "resetToken", "reset_token", "token");
    return token ? `/reset-password?token=${encodeURIComponent(token)}` : "/reset-password";
  },
  review_url: (context, basePath) => {
    const explicit = stringContextValue(context, "reviewUrl", "review_url");
    if (explicit) return explicit;
    const id = stringContextValue(context, "reviewId", "review_id", "entityId", "entity_id");
    return id ? `${basePath}/performance-reviews/${encodeURIComponent(id)}` : `${basePath}/performance-reviews`;
  },
  sign_url: (context, basePath) => stringContextValue(context, "signUrl", "sign_url")
    || resourcePath(context, "document", "documentId", basePath)
    || `${basePath}/e-signatures`,
  status_page_url: () => "/admin/system-health",
  subscription_url: (_context, basePath) => `${basePath}/billing`,
  ticket_url: (context, basePath) => resourcePath(context, "ticket", "ticketId", basePath) || `${basePath}/tickets`,
  unlock_url: (context) => stringContextValue(context, "unlockUrl", "unlock_url") || "/login",
  verification_url: (context) => {
    const explicit = stringContextValue(context, "verificationUrl", "verification_url");
    if (explicit) return explicit;
    const token = stringContextValue(context, "verificationToken", "verification_token", "token");
    return token ? `/verify-email?token=${encodeURIComponent(token)}` : "/verify-email";
  },
  login_url: (context) => stringContextValue(context, "loginUrl", "login_url") || "/login",
  unsubscribe_url: (context, basePath) => stringContextValue(context, "unsubscribeUrl", "unsubscribe_url") || `${basePath}/settings`,
};

function stringContextValue(context: NotificationRenderContext, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = context[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function resourcePath(
  context: NotificationRenderContext,
  resource: string,
  idKey: string,
  basePath: string,
): string | undefined {
  const explicit = stringContextValue(context, `${resource}Url`, `${resource}_url`);
  if (explicit) return explicit;
  const entityType = (
    stringContextValue(context, "entityType", "entity_type", "templateId", "template_id")
    || ""
  ).toLowerCase();
  const id = stringContextValue(context, idKey, idKey.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`), "entityId", "entity_id");
  if (!id || (entityType && !entityType.includes(resource))) return undefined;
  const route = resource === "leave" ? "leave-management" : resource === "document" ? "documents" : `${resource}s`;
  return `${basePath}/${route}/${encodeURIComponent(id)}`;
}

function enrichContextWithRoutes(context: NotificationRenderContext): NotificationRenderContext {
  const slug = stringContextValue(context, "organizationSlug", "organization_slug", "orgSlug", "org_slug");
  const basePath = slug ? `/org/${encodeURIComponent(slug)}` : "";
  const enriched = { ...context };
  for (const [token, resolver] of Object.entries(routeTokens)) {
    if (!stringContextValue(enriched, token, token.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase()))) {
      const resolved = resolver(context, basePath);
      if (resolved) enriched[token] = resolved;
    }
  }
  const actionUrl = stringContextValue(enriched, "actionUrl", "action_url")
    || stringContextValue(enriched, "projectUrl", "project_url", "invoiceUrl", "invoice_url", "taskUrl", "task_url", "clientUrl", "client_url", "leaveUrl", "leave_url", "expenseUrl", "expense_url", "documentUrl", "document_url");
  if (actionUrl && !stringContextValue(enriched, "actionUrl", "action_url")) enriched.actionUrl = actionUrl;
  return enriched;
}

function normalizeTokenName(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[.-]+/g, "_")
    .toLowerCase();
}

function tokenNameVariants(name: string): string[] {
  const snakeCase = normalizeTokenName(name);
  const camelCase = snakeCase.replace(/_([a-z0-9])/g, (_match, character: string) => character.toUpperCase());
  return [...new Set([name, name.toLowerCase(), snakeCase, camelCase])];
}

function addToken(values: Record<string, string>, name: string, value: unknown): void {
  const text = String(value ?? "");
  for (const variant of tokenNameVariants(name)) values[variant] = text;
}

function flattenContext(context: NotificationRenderContext): Record<string, string> {
  const baseUrl = publicAppUrl();
  const company = (context.company || {}) as Record<string, unknown>;
  const user = (context.user || {}) as Record<string, unknown>;
  const email = context.recipientEmail || context.recipient_email || user.email || context.userEmail || "";
  const recipient = context.recipientName || context.recipient_name || user.name || context.clientName || email;
  const firstName = String(context.recipient_first_name || recipient || "").trim().split(/\s+/)[0] || "there";
  const website = absolutePublicUrl(context.company_website || company.website || baseUrl, baseUrl);
  const logo = absolutePublicUrl(context.company_logo_url || company.logo || company.logoUrl || company.logo_url, baseUrl) || `${baseUrl}/logo.png`;
  const defaults: Record<string, unknown> = {
    todays_date: new Date().toLocaleDateString(),
    app_url: baseUrl,
    app_name: String(context.app_name || company.name || "Kiini"),
    company_name: String(context.company_name || company.name || "Kiini"),
    company_email: String(context.company_email || company.email || "info@kiini.africa"),
    company_phone: String(context.company_phone || company.phone || ""),
    company_address: String(context.company_address || company.address || ""),
    company_website: website,
    company_logo_url: logo,
    company_facebook_url: absolutePublicUrl(context.company_facebook_url || company.facebook || website, baseUrl),
    company_instagram_url: absolutePublicUrl(context.company_instagram_url || company.instagram || website, baseUrl),
    company_linkedin_url: absolutePublicUrl(context.company_linkedin_url || company.linkedin || website, baseUrl),
    company_twitter_url: absolutePublicUrl(context.company_twitter_url || company.twitter || website, baseUrl),
    recipient_email: String(email),
    recipient_first_name: firstName,
    login_url: absolutePublicUrl(context.login_url || context.loginUrl || `${baseUrl}/login`, baseUrl),
    app_logo: logo,
  };
  const values: Record<string, string> = {};
  for (const [name, value] of Object.entries(defaults)) addToken(values, name, value);

  for (const [group, value] of Object.entries(context)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [key, nestedValue] of Object.entries(value)) {
        addToken(values, `${group}.${key}`, nestedValue);
        addToken(values, `${group}_${key}`, nestedValue);
      }
    } else if (value != null) {
      addToken(values, group, value);
    }
  }
  return values;
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

function replaceTokens(value: string, tokens: Record<string, string>, escapeValues = false): string {
  return value.replace(/\{\{?([\w.-]+)\}?\}|\$\{([\w.-]+)\}/g, (_match, braceKey, dollarKey) => {
    const key = braceKey || dollarKey;
    const normalizedKey = normalizeTokenName(key);
    const replacement = tokens[key]
      ?? tokens[normalizedKey]
      ?? (actionLinkTokens.has(normalizedKey) ? tokens.action_url : undefined)
      ?? "";
    return escapeValues ? escapeHtml(replacement) : replacement;
  });
}

function resolveContextValue(context: NotificationRenderContext, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => (
    current && typeof current === "object" ? (current as Record<string, unknown>)[key] : undefined
  ), context);
}

function renderEachBlocks(value: string, context: NotificationRenderContext, tokens: Record<string, string>): string {
  return value.replace(/<!--\s*\{\{#each\s+([\w.]+)\s*\}\}\s*-->([\s\S]*?)<!--\s*\{\{\/each\s*\}\}\s*-->/gi, (_match, path, block) => {
    const collection = resolveContextValue(context, path);
    if (!Array.isArray(collection)) return "";

    return collection.map((item) => {
      const itemTokens = flattenContext({ ...context, this: item });
      return replaceTokens(block, { ...tokens, ...itemTokens }, true);
    }).join("");
  });
}

function renderConditionalBlocks(value: string, context: NotificationRenderContext): string {
  return value.replace(/<!--\s*\{\{#if\s+([\w.]+)\s*\}\}\s*-->([\s\S]*?)(?:<!--\s*\{\{else\}\}\s*-->([\s\S]*?))?<!--\s*\{\{\/if\s*\}\}\s*-->/gi, (_match, path, whenTrue, whenFalse = "") => {
    const condition = resolveContextValue(context, path);
    const enabled = Array.isArray(condition)
      ? condition.length > 0
      : typeof condition === "string"
        ? Boolean(condition.trim()) && !/^(?:false|0|no)$/i.test(condition.trim())
        : Boolean(condition);
    return enabled ? whenTrue : whenFalse;
  });
}

function resolveLinks(value: string): string {
  const baseUrl = publicAppUrl();
  const resolved = value.replace(/\b(href|src)=(['"])(.*?)\2/gi, (_match, attribute: string, quote: string, rawUrl: string) => {
    const url = rawUrl.replace(/&amp;/gi, "&").trim();
    if (!url) return attribute.toLowerCase() === "src" ? `src="${baseUrl}/logo.png"` : `${attribute}=${quote}${quote}`;
    if (url.startsWith("#")) return `${attribute}=${quote}${escapeHtml(url)}${quote}`;

    try {
      const parsed = new URL(url, baseUrl);
      const allowedProtocols = attribute.toLowerCase() === "src"
        ? ["http:", "https:", "data:", "cid:"]
        : ["http:", "https:", "mailto:", "tel:"];
      if (!allowedProtocols.includes(parsed.protocol)) {
        return attribute.toLowerCase() === "src" ? `src="${baseUrl}/logo.png"` : `${attribute}=${quote}${quote}`;
      }
      return `${attribute}=${quote}${escapeHtml(parsed.href)}${quote}`;
    } catch {
      return attribute.toLowerCase() === "src" ? `src="${baseUrl}/logo.png"` : `${attribute}=${quote}${quote}`;
    }
  });

  return resolved.replace(/<a\b([^>]*?)\bhref=(['"])\s*\2([^>]*)>([\s\S]*?)<\/a>/gi, "$4");
}

function addActionButton(html: string, context: NotificationRenderContext): string {
  const actionUrl = stringContextValue(context, "actionUrl", "action_url");
  if (!actionUrl) return html;

  let absoluteUrl: string;
  try {
    absoluteUrl = new URL(actionUrl, publicAppUrl()).href;
  } catch {
    return html;
  }
  const escapedUrl = escapeHtml(absoluteUrl);
  const alreadyLinked = [...html.matchAll(/<a\b[^>]*\bhref=(['"])(.*?)\1/gi)]
    .some((match) => {
      try {
        return new URL(match[2].replace(/&amp;/gi, "&"), publicAppUrl()).href === absoluteUrl;
      } catch {
        return false;
      }
    });
  if (alreadyLinked) return html;

  const entityType = stringContextValue(context, "entityType", "entity_type") || "item";
  const buttonText = stringContextValue(context, "ctaText", "cta_text", "actionLabel", "action_label")
    || `View ${entityType.replace(/[_-]+/g, " ")}`;
  const button = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0"><tr><td align="center" bgcolor="#001D3D" style="border-radius:6px"><a href="${escapedUrl}" target="_blank" style="display:inline-block;padding:12px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#fff;text-decoration:none;border-radius:6px">${escapeHtml(buttonText)}</a></td></tr></table>`;
  return /<\/body\s*>/i.test(html)
    ? html.replace(/<\/body\s*>/i, `${button}</body>`)
    : `${html}${button}`;
}

function isCompleteHtmlDocument(value: string): boolean {
  return /<!doctype\s+html|<html[\s>]/i.test(value);
}

function loadFileTemplate(templateId: string): string | null {
  const templateRoot = path.resolve(process.cwd(), "email-templates");
  const safeId = templateId.replace(/\\/g, "/");
  const candidates = [
    path.resolve(templateRoot, "System Templates", `${safeId}.html`),
    path.resolve(templateRoot, `${safeId}.html`),
  ];
  for (const filePath of candidates) {
    if (!filePath.startsWith(`${templateRoot}${path.sep}`)) continue;
    try {
      if (fs.existsSync(filePath)) return fs.readFileSync(filePath, "utf8");
    } catch {
      // Try the next supported template location.
    }
  }
  return null;
}

function loadRegistrySubject(templateId: string): string | undefined {
  try {
    const registryPath = path.resolve(process.cwd(), "email-templates", "System Templates", "subjects.json");
    const registry = JSON.parse(fs.readFileSync(registryPath, "utf8")) as Record<string, string>;
    return registry[templateId.replace(/\\/g, "/")];
  } catch {
    return undefined;
  }
}

function renderEmailBody(value: string, subject: string, company: Record<string, unknown>): string {
  if (isCompleteHtmlDocument(value)) return value;

  return resolveLinks(buildEmailHtml({
    title: subject || "Notification",
    bodyContent: value,
    companyName: String(company.name || company.company_name || "Kiini"),
    companyEmail: String(company.email || company.company_email || ""),
    logoUrl: String(company.logo || company.logo_url || ""),
  }));
}

async function loadScopedEmailSettings(database: any, category: string, organizationId?: string) {
  const globalRows = await database.select().from(settings).where(eq(settings.category, category));
  const values: Record<string, string> = {};
  globalRows.forEach((row: { key: string; value: string | null }) => {
    values[row.key] = row.value || "";
  });

  if (organizationId) {
    const organizationRows = await database.select().from(organizationSettings).where(and(
      eq(organizationSettings.organizationId, organizationId),
      eq(organizationSettings.category, category),
    ));
    organizationRows.forEach((row: { key: string; value: string | null }) => {
      values[row.key] = row.value || "";
    });
  }

  return values;
}

export async function renderNotificationTemplate(
  templateId: string,
  context: NotificationRenderContext,
  fallback: NotificationTemplateFallback,
) {
  const database = await getDb();
  let company: Record<string, unknown> = context.company || {};
  try {
    company = { ...(await getCompanyInfo()), ...company };
  } catch {
    // Keep caller-provided company data when settings are unavailable.
  }

  const routedContext = enrichContextWithRoutes({ ...context, company, templateId });
  const tokens = flattenContext(routedContext);
  let subject = fallback.subject;
  let hasConfiguredSubject = false;
  let html = fallback.html;
  let customBody = false;

  if (database) {
    const organization = context.organization as Record<string, unknown> | undefined;
    const companyContext = context.company;
    const organizationIdValue = context.organizationId || organization?.id || companyContext?.organizationId;
    const organizationId = typeof organizationIdValue === "string" ? organizationIdValue : undefined;
    const pool = getPool();
    if (pool) {
      const [templateRows] = organizationId
        ? await pool.query(
          "SELECT subject, htmlContent, plainTextContent FROM emailTemplates WHERE (id = ? OR name = ?) AND (organizationId = ? OR organizationId IS NULL) ORDER BY organizationId IS NULL, createdAt DESC LIMIT 1",
          [templateId, templateId, organizationId],
        )
        : await pool.query(
          "SELECT subject, htmlContent, plainTextContent FROM emailTemplates WHERE id = ? OR name = ? ORDER BY createdAt DESC LIMIT 1",
          [templateId, templateId],
        );
      const template = (templateRows as any[])[0];
      if (template) {
        if (template.subject) { subject = template.subject; hasConfiguredSubject = true; }
        if (template.htmlContent) { html = template.htmlContent; customBody = true; }
      }
    }

    const saved = await loadScopedEmailSettings(database, `email_template:${templateId}`, organizationId);
    if (saved.subject) { subject = saved.subject; hasConfiguredSubject = true; }
    if (saved.body) { html = saved.body; customBody = true; }

    const [signatureSettings, footerSettings] = await Promise.all([
      loadScopedEmailSettings(database, "email_template:email-signature-all", organizationId),
      loadScopedEmailSettings(database, "email_template:email-footer-all", organizationId),
    ]);
    const signature = signatureSettings.body || "";
    const footer = footerSettings.body || "";
    if (customBody && !isCompleteHtmlDocument(html) && signature) html += `<div>${signature}</div>`;
    if (customBody && !isCompleteHtmlDocument(html) && footer) html += `<hr><div>${footer}</div>`;
  }

  if (!customBody) {
    const fileTemplate = loadFileTemplate(templateId);
    if (fileTemplate) {
      html = fileTemplate;
      customBody = true;
      if (!hasConfiguredSubject) subject = loadRegistrySubject(templateId) || subject;
    }
  }

  subject = replaceTokens(subject, tokens).replace(/[\r\n]+/g, " ").trim();
  tokens.email_subject = subject;
  const templateContext = routedContext;
  html = renderEmailBody(resolveLinks(replaceTokens(renderConditionalBlocks(renderEachBlocks(html, templateContext, tokens), templateContext), tokens, true)), subject, company);
  html = addActionButton(html, routedContext);
  const text = replaceTokens(fallback.text || htmlToPlainText(html), tokens).replace(/\s+/g, " ").trim();
  return { subject, html, text };
}
