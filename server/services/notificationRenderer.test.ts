import { beforeEach, describe, expect, it, vi } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

const { getDbMock, getPoolMock, sendEmailMock, getCompanyInfoMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  getPoolMock: vi.fn(() => null),
  sendEmailMock: vi.fn(),
  getCompanyInfoMock: vi.fn(),
}));

vi.mock("../db", () => ({ getDb: getDbMock, getPool: getPoolMock }));
vi.mock("../utils/company-info", () => ({ getCompanyInfo: getCompanyInfoMock }));
vi.mock("../_core/mail", () => ({ sendEmail: sendEmailMock }));

import { renderNotificationTemplate } from "./notificationRenderer";
import { sendSystemEmail } from "./systemEmailService";
import { processEmailQueue, sendEmailImmediately } from "./emailService";
import { organizationSettings, settings } from "../../drizzle/schema";

const fallback = {
  subject: "Fallback subject",
  html: "<p>Fallback body</p>",
};

const urlTokenNames = new Set([
  "action_url", "alert_url", "app_url", "appointment_url", "approve_url", "audit_log_url",
  "backup_url", "company_facebook_url", "company_instagram_url", "company_linkedin_url",
  "company_twitter_url", "company_website", "cta_url", "dashboard_url", "document_url",
  "download_url", "estimate_url", "feedback_url", "hr_portal_url", "integration_url",
  "invitation_url", "invoice_url", "leave_url", "lock_account_url", "login_url",
  "new_estimate_url", "new_proposal_url", "notification_url", "payslip_url", "project_url",
  "proposal_url", "receipt_pdf_url", "receipt_url", "refund_url", "reminder_action_url",
  "reschedule_url", "reset_link", "review_url", "sign_url", "status_page_url",
  "subscription_url", "task_url", "ticket_url", "unlock_url", "unsubscribe_url",
  "verification_url",
]);

function assertEmailLinksAreResolved(html: string, templateId: string) {
  const links = [...html.matchAll(/\b(?:href|src)=(["'])(.*?)\1/gi)].map((match) => match[2]);
  for (const link of links) {
    expect(link, `${templateId}: ${link}`).not.toBe("");
    expect(link, `${templateId}: ${link}`).toMatch(/^(?:https?:|mailto:|tel:|data:|cid:|#)/i);
  }
}

describe("system email templates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPoolMock.mockReturnValue(null);
    getDbMock.mockResolvedValue(null);
    getCompanyInfoMock.mockResolvedValue({
      name: "Kiini",
      email: "support@kiini.africa",
      address: "Nairobi",
      website: "https://kiini.africa",
      logo: "/logo.png",
    });
    sendEmailMock.mockResolvedValue({ success: true, messageId: "mail-1" });
  });

  it("loads nested system templates and renders their subject and tokens", async () => {
    const rendered = await renderNotificationTemplate("user/staff_invitation", {
      recipientEmail: "new.user@example.com",
      recipient_first_name: "New User",
      invited_by_name: "Admin User",
      company_name: "Kiini",
      app_name: "Kiini",
      user_role: "Staff",
      department_name: "Operations",
      invitation_url: "https://kiini.africa/invite?token=a&source=email",
      expiry_date: "October 2, 2026",
    }, fallback);

    expect(rendered.subject).toContain("invited you to join Kiini");
    expect(rendered.html).toContain("New User");
    expect(rendered.html).toContain("https://kiini.africa/invite?token=a&amp;source=email");
    expect(rendered.html).not.toContain("{{");
    expect(rendered.html).toContain("src=\"https://kiini.africa/logo.png\"");
  });

  it("renders tokens and keeps HTML markup on immediate general-template sends", async () => {
    await sendEmailImmediately({
      toEmail: "new.user@example.com",
      subject: "Welcome - {{company_name}}",
      templateId: "welcome",
      templateVariables: {
        recipient_first_name: "Amina",
        company_name: "Kiini",
        user_role: "Staff",
        login_url: "https://kiini.africa/login",
      },
      htmlContent: "<p>Fallback for {{recipient_first_name}}</p>",
      plainTextContent: "Fallback for {{recipient_first_name}}",
    });

    expect(sendEmailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: "new.user@example.com",
      subject: "Welcome - Kiini",
      html: expect.stringContaining("<html"),
      text: expect.stringContaining("Amina"),
    }));
    const sentHtml = sendEmailMock.mock.calls[0][0].html;
    expect(sentHtml).toContain("Welcome to Kiini, Amina!");
    expect(sentHtml).not.toMatch(/\{\{/);
  });

  it("normalizes camel-case tokens and resolves relative links", async () => {
    const rendered = await renderNotificationTemplate("welcome", {
      recipientEmail: "amina@example.com",
      recipientName: "Amina Wanjiku",
      loginUrl: "/login?next=%2Fhome&source=email",
      company: { logo: "/uploads/logo.png", website: "https://kiini.africa" },
    }, fallback);

    expect(rendered.html).toContain("Welcome to Kiini, Amina!");
    expect(rendered.html).toContain("href=\"https://kiini.africa/login?next=%2Fhome&amp;source=email\"");
    expect(rendered.html).toContain("src=\"https://kiini.africa/uploads/logo.png\"");
    expect(rendered.html).not.toContain("{{");
  });

  it("prefers organization email template overrides over global settings", async () => {
    const globalRow = { category: "email_template:welcome", key: "body", value: "<p>Global template</p>" };
    const organizationRow = { category: "email_template:welcome", key: "body", value: "<p>Organization template</p>" };
    const database = {
      select: () => ({
        from: (table: unknown) => ({
          where: async () => table === organizationSettings ? [organizationRow] : table === settings ? [globalRow] : [],
        }),
      }),
    };
    getDbMock.mockResolvedValue(database);

    const rendered = await renderNotificationTemplate("welcome", {
      organizationId: "org-1",
      company: { name: "Organization One" },
    }, fallback);

    expect(rendered.html).toContain("Organization template");
    expect(rendered.html).not.toContain("Global template");
  });

  it("uses the event action URL for a missing template-specific CTA URL", async () => {
    const rendered = await renderNotificationTemplate("invoice_created", {
      actionUrl: "/invoices/inv-42",
      invoiceNumber: "INV-42",
      totalAmount: "KES 4,200",
    }, fallback);

    expect(rendered.html).toContain("Invoice #INV-42");
    expect(rendered.html).toContain("href=\"https://kiini.africa/invoices/inv-42\"");
  });

  it("derives resource links for file templates and prefixes organization routes", async () => {
    const rendered = await renderNotificationTemplate("project_update", {
      entityType: "project",
      entityId: "project-42",
      organizationSlug: "melitech",
      project_name: "Project 42",
    }, fallback);

    expect(rendered.html).toContain("href=\"https://kiini.africa/org/melitech/projects/project-42\"");
    expect(rendered.html).not.toMatch(/\b(?:href|src)="\s*"/i);
    expect(rendered.html).not.toContain("{{");
  });

  it("appends a working action button when a settings template omits its CTA", async () => {
    const database = {
      select: vi.fn(() => ({
        from: () => ({
          where: async () => [],
        }),
      })),
    };
    getDbMock.mockResolvedValue(database);
    const settingsPool = {
      query: vi.fn(async () => [[{
        subject: "Project update",
        htmlContent: "<html><body><p>Project update</p></body></html>",
        plainTextContent: null,
      }]]),
    };
    getPoolMock.mockReturnValue(settingsPool);

    const rendered = await renderNotificationTemplate("project_update", {
      entityType: "project",
      entityId: "project-73",
      organizationSlug: "melitech",
      actionUrl: "/org/melitech/projects/project-73",
    }, fallback);

    expect(rendered.html).toContain("href=\"https://kiini.africa/org/melitech/projects/project-73\"");
    expect(rendered.html).toContain("View project");
    expect(rendered.html).toContain("Project update");
  });

  it("includes the queued recipient when rendering a queued template", async () => {
    const { emailQueue } = await import("../../drizzle/schema");
    const queuedEmail = {
      id: "queue-1",
      recipientEmail: "queued.user@example.com",
      subject: "Welcome - {{company_name}}",
      htmlContent: "<p>Fallback for {{recipient_first_name}}</p>",
      textContent: "Fallback for {{recipient_first_name}}",
      metadata: JSON.stringify({
        templateId: "welcome",
        templateVariables: { recipient_first_name: "Queued User", login_url: "/login" },
      }),
      attempts: 0,
      maxAttempts: 3,
    };
    const database = {
      select: vi.fn(() => ({
        from: (table: unknown) => ({
          where: () => table === emailQueue
            ? { limit: async () => [queuedEmail] }
            : Promise.resolve([]),
        }),
      })),
      update: vi.fn(() => ({ set: () => ({ where: async () => undefined }) })),
    };
    getDbMock.mockResolvedValue(database);

    const result = await processEmailQueue();

    expect(result).toEqual({ sent: 1, failed: 0 });
    expect(sendEmailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: "queued.user@example.com",
      subject: "Welcome - Kiini",
      html: expect.stringContaining("queued.user@example.com"),
    }));
  });

  it("renders every registered system template without unresolved tokens or empty links", async () => {
    const templateRoot = path.resolve(process.cwd(), "email-templates", "System Templates");
    const subjectRegistry = JSON.parse(fs.readFileSync(path.join(templateRoot, "subjects.json"), "utf8")) as Record<string, string>;
    const templateIds = ["admin", "user"].flatMap((group) =>
      fs.readdirSync(path.join(templateRoot, group))
        .filter((fileName) => fileName.endsWith(".html"))
        .map((fileName) => `${group}/${fileName.slice(0, -5)}`),
    ).sort();
    expect(Object.keys(subjectRegistry).sort()).toEqual(templateIds);

    for (const [templateId, templateSubject] of Object.entries(subjectRegistry)) {
      const templatePath = path.join(templateRoot, `${templateId}.html`);
      const source = fs.readFileSync(templatePath, "utf8");
      expect(source, templateId).toMatch(/<html\b/i);
      expect(source, templateId).toContain("company_logo_url");
      expect(source, templateId).toContain("company_name");
      const tokenNames = new Set(
        [source, templateSubject].flatMap((value) =>
          [...value.matchAll(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g)].map((match) => match[1]),
        ),
      );
      const context: Record<string, unknown> = Object.fromEntries(
        [...tokenNames]
          .filter((name) => !urlTokenNames.has(name.toLowerCase()))
          .map((name) => [name, "sample-value"]),
      );
      Object.assign(context, {
        recipientEmail: "recipient@example.com",
        entityId: "sample-entity",
        company_name: "Kiini",
        company_logo_url: "https://kiini.africa/logo.png",
        company_website: "https://kiini.africa",
        company_email: "support@kiini.africa",
        app_name: "Kiini",
      });

      const rendered = await renderNotificationTemplate(templateId, context, fallback);
      expect(rendered.subject, templateId).not.toMatch(/\{\{/);
      expect(rendered.html, templateId).not.toMatch(/\{\{/);
      expect(rendered.html, templateId).not.toMatch(/\b(?:href|src)="\s*"/i);
      expect(rendered.html, templateId).not.toMatch(/\b(?:href|src)="\/(?!\/)/i);
      assertEmailLinksAreResolved(rendered.html, templateId);
    }
  });

  it("renders every general template token and expands line-item blocks", async () => {
    const templateRoot = path.resolve(process.cwd(), "email-templates");
    const templateIds = fs.readdirSync(templateRoot)
      .filter((fileName) => fileName.endsWith(".html"))
      .map((fileName) => fileName.slice(0, -5))
      .sort();

    for (const templateId of templateIds) {
      const source = fs.readFileSync(path.join(templateRoot, `${templateId}.html`), "utf8");
      const tokenNames = [...source.matchAll(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g)].map((match) => match[1]);
      const context: Record<string, unknown> = Object.fromEntries(
        [...new Set(tokenNames)]
          .filter((name) => !urlTokenNames.has(name.toLowerCase()))
          .map((name) => [name, "sample-value"]),
      );
      Object.assign(context, {
        recipientEmail: "recipient@example.com",
        recipientName: "Sample Recipient",
        entityId: "sample-entity",
        company_name: "Kiini",
        company_logo_url: "https://kiini.africa/logo.png",
        company_website: "https://kiini.africa",
        company_email: "support@kiini.africa",
        app_name: "Kiini",
        line_items: [{ description: "Consulting", qty: "2", unit_price: "500", amount: "1,000" }],
      });

      const rendered = await renderNotificationTemplate(templateId, context, fallback);
      expect(rendered.html, templateId).not.toMatch(/\{\{/);
      expect(rendered.html, templateId).toContain("#001D3D");
      expect(rendered.html, templateId).toContain("#E78200");
      assertEmailLinksAreResolved(rendered.html, templateId);
      if (source.includes("{{#each line_items}}")) {
        expect(rendered.html, templateId).toContain("Consulting");
      }
    }
  });

  it("forwards rendered attachments to the mail transport", async () => {
    const attachment = { filename: "export.csv", content: "id,name\n1,Kiini", contentType: "text/csv" };
    await sendSystemEmail("user/data_export_ready", {
      recipientEmail: "user@example.com",
      recipient_first_name: "User",
      export_name: "Clients",
      export_format: "CSV",
      export_size: "1 KB",
      download_url: "https://kiini.africa/exports/1",
      expiry_date: "October 2, 2026",
      attachments: [attachment],
    }, fallback);

    expect(sendEmailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: "user@example.com",
      attachments: [attachment],
    }));
  });
});
