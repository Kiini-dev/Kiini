import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { getPool, getDb, getSetting } from "../db";
import { settings } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { TRPCError } from "@trpc/server";
import fs from "fs";
import path from "path";
import sanitizeHtml from "sanitize-html";
import { DEFAULT_TIER_PRICING, parseTierPricingOverrides, resolveTierPricingEntry } from "../services/tierPricing";

// Admin-only guard
const adminOnly = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ── Website pages registry (matches actual public routes) ─────────────
const WEBSITE_PAGES = [
  { slug: "landing", title: "Landing Page", path: "/", description: "Main homepage with hero, features overview, and CTAs" },
  { slug: "features", title: "Features", path: "/features", description: "Product features showcase by category" },
  { slug: "pricing", title: "Pricing", path: "/pricing", description: "Pricing tiers and feature comparison" },
  { slug: "about", title: "About Us", path: "/about", description: "Company story, values, team, and milestones" },
  { slug: "contact", title: "Contact", path: "/contact", description: "Contact form and company info" },
  { slug: "demo", title: "Demo", path: "/demo", description: "Interactive product demo page" },
  { slug: "documentation", title: "Documentation", path: "/documentation", description: "Platform documentation and knowledge base" },
  { slug: "user-guide", title: "User Guide", path: "/user-guide", description: "Step-by-step user guide" },
  { slug: "troubleshooting", title: "Troubleshooting", path: "/troubleshooting", description: "Support and troubleshooting guide" },
  { slug: "privacy-policy", title: "Privacy Policy", path: "/privacy-policy", description: "Privacy policy page" },
  { slug: "terms-and-conditions", title: "Terms & Conditions", path: "/terms-and-conditions", description: "Terms of service" },
];

// These are the same defaults rendered by the public website. Keeping them in
// the admin router makes the existing site editable before the first save.
const DEFAULT_ABOUT_CONTENT = {
  heroTitle: "The connected operating core for modern business",
  heroSubtitle: "Kiini brings customer relationships, finance, people, projects, procurement, and reporting into one organization-aware system.",
  missionText: "Kiini helps teams manage customer, finance, people, project, procurement, and service workflows from one platform, with organization-aware records and role-based access.",
  stats: [
    { label: "Connected customer workflows", value: "CRM & sales" },
    { label: "Financial visibility", value: "Income & accounts" },
    { label: "People operations", value: "HR & payroll" },
    { label: "Organization access", value: "Role-aware" },
  ],
  values: [
    { title: "Reliability", desc: "We build platforms that teams depend on every day. Uptime, data integrity, and consistency are non-negotiable.", icon: "Shield", color: "from-blue-500 to-blue-600" },
    { title: "Simplicity", desc: "Powerful does not have to mean complex. We design for clarity so your team can get work done without training manuals.", icon: "Lightbulb", color: "from-amber-500 to-orange-600" },
    { title: "Customer-first", desc: "Every feature we build is driven by real customer feedback. Your business problems shape our product roadmap.", icon: "Heart", color: "from-rose-500 to-red-600" },
    { title: "Global perspective, local roots", desc: "Built with African markets in mind — M-Pesa, KRA, Kenyan payroll — but designed for businesses worldwide.", icon: "Globe", color: "from-emerald-500 to-teal-600" },
    { title: "Innovation", desc: "We are not content with the status quo. AI, automation, and continuous improvement are built into how we work.", icon: "Sparkles", color: "from-violet-500 to-purple-600" },
    { title: "Accountability", desc: "We own our results. If something is broken, we fix it. If something can be better, we improve it. No excuses.", icon: "Target", color: "from-cyan-500 to-blue-600" },
  ],
  milestones: [
    { year: "Connected work", event: "Customer, finance, people, projects, procurement, and service workflows in one platform." },
    { year: "Organization-aware", event: "Organization-specific records, settings, roles, and financial policies." },
    { year: "Clear financial activity", event: "Sales and non-sales income, account balances, and ledger reporting." },
  ],
  team: [],
  cta: {
    title: "Ready to work with us?", subtitle: "Let's talk about how Kiini can transform your operations.",
    actions: [{ label: "Book a Demo", href: "/book-a-demo", description: "See Kiini in action" }, { label: "Get in Touch", href: "/contact", description: "Contact our team" }, { label: "View Pricing", href: "/pricing", description: "Explore our plans" }],
  },
};

const DEFAULT_FEATURES_CONTENT = {
  heroBadge: "Connected business workflows", heroTitle: "Every feature your business demands",
  heroSubtitle: "Kiini connects customer, finance, people, delivery, and administration workflows. Available features depend on the organization and assigned role.",
  sections: [
    { category: "CRM & Sales", icon: "Users", desc: "A complete client relationship and sales pipeline — from first contact to closed deal.", features: ["Client & contact management with full interaction history", "Visual pipeline with custom stages", "Opportunity tracking and forecasting", "Product catalog with pricing and discounts", "Quotations and proposals", "Activity logging (calls, emails, meetings)", "Lead source attribution and conversion tracking"] },
    { category: "Finance & Billing", icon: "DollarSign", desc: "Manage customer billing, business income, expenses, and account-level financial activity.", features: ["Invoice creation with itemized line items", "Recurring invoice schedules", "Payment tracking, receipts, and payment plans", "Expense and budget tracking", "Chart of accounts with debit and credit balances", "Non-sales inflows for grants, other income, equity, and loans", "Bank reconciliation and financial reports", "Separate organization and platform accounting scopes"] },
    { category: "HR & Payroll", icon: "UserCog", desc: "Coordinate employee records, leave, attendance, payroll, and performance workflows.", features: ["Employee records and department hierarchy", "Flexible leave date and duration entry with weekday-based day counts", "Attendance tracking with clock in/out", "Payroll processing with allowances and deductions", "Payslip generation and payroll reporting", "Performance reviews and appraisals"] },
    { category: "Projects & Work Orders", icon: "Briefcase", desc: "Deliver projects on time and on budget with complete visibility.", features: ["Project creation with milestones and phases", "Task assignment with priorities and deadlines", "Time tracking per task and team member", "Budget vs actual cost tracking", "Work order management with field assignments", "Kanban and list views", "Team collaboration and file attachments"] },
    { category: "Procurement", icon: "ShoppingCart", desc: "Streamline purchasing from requisition to goods delivery.", features: ["Purchase requisitions with approval workflows", "Local Purchase Orders (LPO) generation", "Supplier management and vendor ratings", "Goods Received Notes (GRN)", "Invoice matching and reconciliation", "Procurement budget tracking", "Inventory and stock management"] },
    { category: "Templates & Documents", icon: "FileCheck", desc: "Create, reuse and automate document templates across the platform.", features: ["Unified template system across modules", "Default templates per organization and document type", "Email & SMS templates with variable placeholders", "Generate PDFs from saved templates and export/print"] },
    { category: "Analytics & Reports", icon: "BarChart3", desc: "Review business performance with role-scoped dashboards and reports.", features: ["Executive dashboard with KPI widgets", "Revenue, expense, account-balance, and cash activity reports", "Sales pipeline and conversion reports", "HR headcount and payroll reports", "Custom report builder", "CSV and PDF report exports"] },
    { category: "SaaS Revenue & Billing", icon: "DollarSign", desc: "Review Kiini subscription revenue and configured usage-based rate cards.", features: ["Subscription and usage-based rate cards", "Seat and usage metrics for billing calculations", "Revenue ledger entries with date and scope filters", "Correction by offset entries rather than editing posted charges", "Organization income and platform SaaS revenue views"] },
    { category: "Organization Administration", icon: "Shield", desc: "Configure organizations, roles, permissions, and accounting policies.", features: ["Organization-specific users, settings, and feature access", "Custom roles and permissions", "Department-head role and permission assignment", "Organization accounting policies", "Platform-wide administration for authorized super admins"] },
    { category: "AI Hub", icon: "Sparkles", desc: "Use AI-assisted tools for analysis and recommendations.", features: ["AI-assisted analysis and recommendations", "AI insights and anomaly detection tools", "AI-assisted business reporting"] },
    { category: "Communications", icon: "MessageSquare", desc: "Keep teams and clients in touch through supported communication workflows.", features: ["Internal team announcements", "Email and SMS dispatch", "Canned responses for supported reply workflows", "Document sharing and attachments", "Activity feed per record"] },
  ],
  pillars: [
    { title: "Role-aware access", desc: "Use roles and custom permissions to align module access with responsibilities.", icon: "Shield" },
    { title: "Connected workflows", desc: "Move records through daily work, review, approval, and reporting in one platform.", icon: "Zap" },
    { title: "Organization scope", desc: "Keep organization-level operations distinct from platform-wide administration.", icon: "Globe" },
    { title: "Financial traceability", desc: "Review income, expenses, account balances, and correction entries with their context.", icon: "Activity" },
  ],
};

const DEFAULT_TESTIMONIALS: Array<{ id: string; name: string; role: string; company: string; content: string; rating: number; isVisible: boolean; avatarUrl: string }> = [];

const DEFAULT_FAQS = [
  { id: "faq-plans", question: "Which plan is right for my organization?", answer: "Compare current user limits and included product areas on the pricing page, or contact sales to discuss a custom plan.", category: "General", order: 1, isVisible: true },
  { id: "faq-users", question: "How is access managed?", answer: "Organization administrators assign roles and permissions so each team can access the features it needs.", category: "General", order: 2, isVisible: true },
  { id: "faq-trial", question: "Is there a free trial?", answer: "A 7-day trial tier is available. Check the current plan details for included access.", category: "General", order: 3, isVisible: true },
  { id: "faq-organizations", question: "Can I manage more than one organization?", answer: "Kiini supports organization-aware workspaces. Platform-wide views are available to authorized administrators.", category: "General", order: 4, isVisible: true },
];

const DEFAULT_HERO_CONTENT = {
  badge: "The operating system for modern business", title: "One hub. Total control.", subtitle: "Finance, HR, CRM, projects, and operations — unified in one intelligent platform.",
  ctaPrimary: { label: "Get Started", href: "/signup" }, ctaSecondary: { label: "Watch Demo", href: "/demo" }, stats: [], slides: [],
};

const WEBSITE_HTML_OPTIONS = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "style", "iframe"]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "width", "height", "style"],
    iframe: ["src", "title", "width", "height", "allow", "allowfullscreen", "frameborder"],
    "*": ["style", "class", "id", "data-*"],
  },
};

const websitePageContentInput = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(300),
  contentHtml: z.string().max(500000).default(""),
  blocks: z.array(z.any()).default([]),
  designJson: z.string().max(500000).default(""),
  customCss: z.string().max(100000).default(""),
  customJs: z.string().max(100000).default(""),
  seoTitle: z.string().max(300).default(""),
  seoDescription: z.string().max(1000).default(""),
  seoKeywords: z.string().max(1000).default(""),
  ogImageUrl: z.string().max(1000).default(""),
  canonicalUrl: z.string().max(1000).default(""),
  schemaJson: z.string().max(100000).default(""),
  isPublished: z.boolean().default(false),
});

const normalizeWebsiteHtml = (html: string) => sanitizeHtml(html, WEBSITE_HTML_OPTIONS);

async function ensureWebsiteTrackingTables(pool: any) {
  await pool.query(`CREATE TABLE IF NOT EXISTS website_leads (
    id varchar(64) NOT NULL PRIMARY KEY, name varchar(255) NOT NULL, email varchar(320) NOT NULL,
    phone varchar(50), company varchar(255), source varchar(100) NOT NULL DEFAULT 'website',
    landingPage varchar(500), campaign varchar(255), status varchar(30) NOT NULL DEFAULT 'new',
    notes text, createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt timestamp NULL,
    INDEX idx_website_leads_status (status), INDEX idx_website_leads_created (createdAt), INDEX idx_website_leads_email (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await pool.query(`CREATE TABLE IF NOT EXISTS website_analytics_events (
    id varchar(64) NOT NULL PRIMARY KEY, eventName varchar(100) NOT NULL, path varchar(500),
    referrer varchar(1000), sessionId varchar(128), visitorId varchar(128), metadata json,
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_website_events_name (eventName), INDEX idx_website_events_created (createdAt), INDEX idx_website_events_path (path)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
}

export const websiteAdminRouter = router({
  uploadImage: adminOnly
    .input(z.object({
      fileName: z.string().min(1).max(180),
      mimeType: z.string().regex(/^image\/(jpeg|png|gif|webp|svg\+xml)$/),
      data: z.string().regex(/^data:image\//),
    }))
    .mutation(async ({ input }) => {
      const match = input.data.match(/^data:([^;]+);base64,(.+)$/);
      if (!match || match[1] !== input.mimeType) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid image data" });
      }

      const buffer = Buffer.from(match[2], "base64");
      if (buffer.length > 5 * 1024 * 1024) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Image must be 5MB or smaller" });
      }

      const extension = input.mimeType.split("/")[1].replace("svg+xml", "svg");
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/\.+/g, ".");
      const fileName = `${Date.now()}-${safeName || `website.${extension}`}`;
      const uploadDir = path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads"), "website");
      fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, fileName), buffer);

      return { success: true, url: `/uploads/website/${fileName}` };
    }),

  // ── Pages ──────────────────────────────────────────────────────
  getPages: adminOnly.query(async ({ ctx }) => {
    const pool = getPool();
    if (!pool) return WEBSITE_PAGES.map(p => ({ ...p, isPublished: true, seoTitle: "", seoDescription: "", seoKeywords: "" }));

    const [rows] = await pool.query(
      "SELECT * FROM systemSettings WHERE category = 'website_page'"
    );
    const settings = rows as any[];
    const settingsMap: Record<string, any> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.dataType === "json" ? JSON.parse(s.value || "{}") : s.value;
    }

    return WEBSITE_PAGES.map(p => {
      const pageData = settingsMap[`page_${p.slug}`] || {};
      return {
        ...p,
        isPublished: pageData.isPublished !== false,
        seoTitle: pageData.seoTitle || "",
        seoDescription: pageData.seoDescription || "",
        seoKeywords: pageData.seoKeywords || "",
        contentHtml: pageData.contentHtml || "",
        designJson: pageData.designJson || "",
      };
    });
  }),

  getPublicPage: publicProcedure
    .input(z.object({ slug: z.string().regex(/^[a-z0-9-]+$/) }))
    .query(async ({ input }) => {
      const pool = getPool();
      if (!pool) return null;
      const [rows] = await pool.query(
        "SELECT value FROM systemSettings WHERE category = 'website_page' AND `key` = ? LIMIT 1",
        [`page_${input.slug}`]
      );
      const page = (rows as any[])[0];
      if (!page?.value) return null;
      const data = JSON.parse(page.value);
      if (data.isPublished === false) return null;
      return { slug: input.slug, ...data, contentHtml: sanitizeHtml(data.contentHtml || "", { allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "style"]), allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ["src", "alt", "width", "height", "style"], "*": ["style", "class"] } }) };
    }),

  getCustomPages: adminOnly.query(async () => {
    const pool = getPool();
    if (!pool) return [];
    const [rows] = await pool.query("SELECT `key`, value FROM systemSettings WHERE category = 'website_custom_page'");
    return (rows as any[]).map((row) => ({ slug: String(row.key).replace(/^page_/, ""), ...JSON.parse(row.value || "{}") }));
  }),

  saveCustomPage: adminOnly
    .input(z.object({
      slug: z.string().regex(/^[a-z0-9-]+$/),
      title: z.string().min(1),
      contentHtml: z.string().default(""),
      designJson: z.string().default(""),
      isPublished: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const value = JSON.stringify({ ...input, contentHtml: sanitizeHtml(input.contentHtml, { allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "style"]), allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ["src", "alt", "width", "height", "style"], "*": ["style", "class"] } }) });
      const key = `page_${input.slug}`;
      const [existing] = await pool.query("SELECT id FROM systemSettings WHERE category = 'website_custom_page' AND `key` = ?", [key]);
      if ((existing as any[]).length) {
        await pool.query("UPDATE systemSettings SET value = ?, updatedBy = ?, updatedAt = NOW() WHERE id = ?", [value, ctx.user.id, (existing as any[])[0].id]);
      } else {
        await pool.query("INSERT INTO systemSettings (id, category, `key`, value, dataType, description, isPublic, updatedBy, updatedAt) VALUES (?, 'website_custom_page', ?, ?, 'json', ?, 1, ?, NOW())", [uuidv4(), key, value, `Custom website page ${input.slug}`, ctx.user.id]);
      }
      return { success: true };
    }),

  updatePage: adminOnly
    .input(z.object({
      slug: z.string(),
      isPublished: z.boolean().optional(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      seoKeywords: z.string().optional(),
      contentHtml: z.string().optional(),
      designJson: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const key = `page_${input.slug}`;
      const [existingDataRows] = await pool.query("SELECT value FROM systemSettings WHERE category = 'website_page' AND `key` = ?", [key]);
      const existingData = (existingDataRows as any[])[0]?.value ? JSON.parse((existingDataRows as any[])[0].value) : {};
      const value = JSON.stringify({
        ...existingData,
        isPublished: input.isPublished ?? true,
        seoTitle: input.seoTitle || "",
        seoDescription: input.seoDescription || "",
        seoKeywords: input.seoKeywords || "",
        contentHtml: input.contentHtml !== undefined ? normalizeWebsiteHtml(input.contentHtml) : existingData.contentHtml ?? "",
        designJson: input.designJson ?? existingData.designJson ?? "",
      });

      // Upsert
      const [existing] = await pool.query(
        "SELECT id FROM systemSettings WHERE category = 'website_page' AND `key` = ?",
        [key]
      );
      const rows = existing as any[];
      if (rows.length) {
        await pool.query(
          "UPDATE systemSettings SET value = ?, updatedBy = ?, updatedAt = NOW() WHERE id = ?",
          [value, ctx.user.id, rows[0].id]
        );
      } else {
        await pool.query(
          "INSERT INTO systemSettings (id, category, `key`, value, dataType, description, isPublic, updatedBy, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
          [uuidv4(), "website_page", key, value, "json", `Page settings for ${input.slug}`, 0, ctx.user.id]
        );
      }
      return { success: true };
    }),

  // ── Navigation ─────────────────────────────────────────────────
  getNavigation: adminOnly.query(async ({ ctx }) => {
    const pool = getPool();
    if (!pool) return null;

    const [rows] = await pool.query(
      "SELECT value FROM systemSettings WHERE category = 'website_nav' AND `key` = 'config'"
    );
    const arr = rows as any[];
    if (arr.length && arr[0].value) {
      return JSON.parse(arr[0].value);
    }
    // Return default nav structure
    return {
      mainLinks: [
        { label: "Features",    href: "/features",         visible: true },
        { label: "Pricing",     href: "/pricing",          visible: true },
        { label: "Book a Demo", href: "/book-a-demo",      visible: true },
        { label: "Partners",    href: "/become-a-partner", visible: true },
        { label: "About",       href: "/about",            visible: true },
        { label: "Contact",     href: "/contact",          visible: true },
      ],
      resourceLinks: [
        { label: "Documentation",   href: "/documentation",  visible: true },
        { label: "User Guide",      href: "/user-guide",     visible: true },
        { label: "Troubleshooting", href: "/troubleshooting", visible: true },
      ],
      ctaText: "Get Started",
      ctaLink: "/signup",
    };
  }),

  updateNavigation: adminOnly
    .input(z.object({
      mainLinks: z.array(z.object({
        label: z.string(),
        href: z.string(),
        visible: z.boolean(),
      })),
      resourceLinks: z.array(z.object({
        label: z.string(),
        href: z.string(),
        visible: z.boolean(),
      })),
      ctaText: z.string(),
      ctaLink: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const value = JSON.stringify(input);
      const [existing] = await pool.query(
        "SELECT id FROM systemSettings WHERE category = 'website_nav' AND `key` = 'config'"
      );
      const rows = existing as any[];
      if (rows.length) {
        await pool.query(
          "UPDATE systemSettings SET value = ?, updatedBy = ?, updatedAt = NOW() WHERE id = ?",
          [value, ctx.user.id, rows[0].id]
        );
      } else {
        await pool.query(
          "INSERT INTO systemSettings (id, category, `key`, value, dataType, description, isPublic, updatedBy, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
          [uuidv4(), "website_nav", "config", value, "json", "Website navigation configuration", 0, ctx.user.id]
        );
      }
      return { success: true };
    }),

  // ── General website settings ───────────────────────────────────
  getSettings: adminOnly.query(async ({ ctx }) => {
    const pool = getPool();
    if (!pool) return null;

    const [rows] = await pool.query(
      "SELECT * FROM systemSettings WHERE category = 'website_general'"
    );
    const arr = rows as any[];
    const result: Record<string, string> = {};
    for (const r of arr) {
      result[r.key] = r.value || "";
    }
    return {
      siteTitle: result.siteTitle || "Kiini",
      tagline: result.tagline || "Complete Business Management Platform",
      heroTitle: result.heroTitle || "",
      heroSubtitle: result.heroSubtitle || "",
      contactEmail: result.contactEmail || "",
      contactPhone: result.contactPhone || "",
      contactAddress: result.contactAddress || "",
      socialLinkedIn: result.socialLinkedIn || "",
      socialTwitter: result.socialTwitter || "",
      socialFacebook: result.socialFacebook || "",
      socialInstagram: result.socialInstagram || "",
      googleAnalyticsId: result.googleAnalyticsId || "",
      customHeadScript: result.customHeadScript || "",
      announcementBanner: result.announcementBanner || "",
      announcementEnabled: result.announcementEnabled === "true",
    };
  }),

  updateSettings: adminOnly
    .input(z.object({
      siteTitle: z.string().optional(),
      tagline: z.string().optional(),
      heroTitle: z.string().optional(),
      heroSubtitle: z.string().optional(),
      contactEmail: z.string().optional(),
      contactPhone: z.string().optional(),
      contactAddress: z.string().optional(),
      socialLinkedIn: z.string().optional(),
      socialTwitter: z.string().optional(),
      socialFacebook: z.string().optional(),
      socialInstagram: z.string().optional(),
      googleAnalyticsId: z.string().optional(),
      customHeadScript: z.string().optional(),
      announcementBanner: z.string().optional(),
      announcementEnabled: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      for (const [key, val] of Object.entries(input)) {
        if (val === undefined) continue;
        const strVal = typeof val === "boolean" ? String(val) : val;
        const [existing] = await pool.query(
          "SELECT id FROM systemSettings WHERE category = 'website_general' AND `key` = ?",
          [key]
        );
        const rows = existing as any[];
        if (rows.length) {
          await pool.query(
            "UPDATE systemSettings SET value = ?, updatedBy = ?, updatedAt = NOW() WHERE id = ?",
            [strVal, ctx.user.id, rows[0].id]
          );
        } else {
          await pool.query(
            "INSERT INTO systemSettings (id, category, `key`, value, dataType, description, isPublic, updatedBy, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
            [uuidv4(), "website_general", key, strVal, "string", `Website setting: ${key}`, 0, ctx.user.id]
          );
        }
      }
      return { success: true };
    }),

  // ── Contact form submissions ───────────────────────────────────
  getContactSubmissions: adminOnly.query(async ({ ctx }) => {
    const pool = getPool();
    if (!pool) return [];

    // Check if websiteContacts table exists
    try {
      const [rows] = await pool.query(
        "SELECT * FROM websiteContacts ORDER BY createdAt DESC LIMIT 100"
      );
      return (rows as any[]).map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone || "",
        company: r.company || "",
        subject: r.subject || "",
        message: r.message,
        status: r.status || "new",
        createdAt: r.createdAt,
      }));
    } catch {
      return [];
    }
  }),

  updateContactStatus: adminOnly
    .input(z.object({
      id: z.string(),
      status: z.enum(["new", "read", "replied", "archived"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        await pool.query(
          "UPDATE websiteContacts SET status = ? WHERE id = ?",
          [input.status, input.id]
        );
      } catch {
        // Table might not have status column — attempt to add it
        try {
          await pool.query("ALTER TABLE websiteContacts ADD COLUMN status VARCHAR(20) DEFAULT 'new'");
          await pool.query("UPDATE websiteContacts SET status = ? WHERE id = ?", [input.status, input.id]);
        } catch { /* ignore */ }
      }
      return { success: true };
    }),

  // ── Analytics placeholder ──────────────────────────────────────
  getAnalytics: adminOnly.query(async () => {
    const pool = getPool();
    if (!pool) {
      return { totalPages: WEBSITE_PAGES.length, publishedPages: WEBSITE_PAGES.length, lastUpdated: new Date().toISOString(), totalInquiries: 0, inquiriesByMonth: [], inquiriesByStatus: {} };
    }

    // Get page settings for published count
    const [pageRows] = await pool.query("SELECT value FROM systemSettings WHERE category = 'website_page'");
    const pageSettings = pageRows as any[];
    let publishedCount = WEBSITE_PAGES.length;
    for (const s of pageSettings) {
      try {
        const val = JSON.parse(s.value || "{}");
        if (val.isPublished === false) publishedCount--;
      } catch {}
    }

    // Get inquiry stats
    let totalInquiries = 0;
    let inquiriesByMonth: { month: string; count: number }[] = [];
    let inquiriesByStatus: Record<string, number> = { new: 0, read: 0, replied: 0, archived: 0 };
    try {
      const [countRows] = await pool.query("SELECT COUNT(*) as total FROM websiteContacts");
      totalInquiries = (countRows as any[])[0]?.total ?? 0;

      const [monthRows] = await pool.query(
        "SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, COUNT(*) as count FROM websiteContacts GROUP BY month ORDER BY month DESC LIMIT 12"
      );
      inquiriesByMonth = (monthRows as any[]).reverse();

      const [statusRows] = await pool.query(
        "SELECT COALESCE(status, 'new') as status, COUNT(*) as count FROM websiteContacts GROUP BY status"
      );
      for (const r of statusRows as any[]) {
        inquiriesByStatus[r.status] = r.count;
      }
    } catch {}

    return {
      totalPages: WEBSITE_PAGES.length,
      publishedPages: publishedCount,
      lastUpdated: new Date().toISOString(),
      totalInquiries,
      inquiriesByMonth,
      inquiriesByStatus,
    };
  }),

  // ── Unified CMS content API ──────────────────────────────────
  getPageContent: adminOnly.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const pool = getPool();
    if (!pool) return null;
    const [rows] = await pool.query("SELECT value FROM systemSettings WHERE category = 'website_page' AND `key` = ? LIMIT 1", [`page_${input.slug}`]);
    const value = (rows as any[])[0]?.value;
    return value ? JSON.parse(value) : null;
  }),

  savePageContent: adminOnly.input(websitePageContentInput).mutation(async ({ input, ctx }) => {
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const value = JSON.stringify({ ...input, contentHtml: normalizeWebsiteHtml(input.contentHtml), updatedAt: new Date().toISOString(), updatedBy: ctx.user.id });
    const key = `page_${input.slug}`;
    const [existing] = await pool.query("SELECT id FROM systemSettings WHERE category = 'website_page' AND `key` = ?", [key]);
    if ((existing as any[]).length) await pool.query("UPDATE systemSettings SET value = ?, dataType = 'json', updatedBy = ?, updatedAt = NOW(), isPublic = 1 WHERE id = ?", [value, ctx.user.id, (existing as any[])[0].id]);
    else await pool.query("INSERT INTO systemSettings (id, category, `key`, value, dataType, description, isPublic, updatedBy, updatedAt) VALUES (?, 'website_page', ?, ?, 'json', ?, 1, ?, NOW())", [uuidv4(), key, value, `Website page ${input.slug}`, ctx.user.id]);
    return { success: true };
  }),

  duplicatePage: adminOnly.input(z.object({ sourceSlug: z.string(), targetSlug: z.string().regex(/^[a-z0-9-]+$/), title: z.string().min(1) })).mutation(async ({ input, ctx }) => {
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const [rows] = await pool.query("SELECT value FROM systemSettings WHERE category = 'website_page' AND `key` = ? LIMIT 1", [`page_${input.sourceSlug}`]);
    const source = (rows as any[])[0]?.value ? JSON.parse((rows as any[])[0].value) : {};
    const value = JSON.stringify({ ...source, slug: input.targetSlug, title: input.title, isPublished: false, updatedAt: new Date().toISOString(), updatedBy: ctx.user.id });
    await pool.query("INSERT INTO systemSettings (id, category, `key`, value, dataType, description, isPublic, updatedBy, updatedAt) VALUES (?, 'website_page', ?, ?, 'json', ?, 1, ?, NOW()) ON DUPLICATE KEY UPDATE value = VALUES(value), updatedBy = VALUES(updatedBy), updatedAt = NOW()", [uuidv4(), `page_${input.targetSlug}`, value, `Website page ${input.targetSlug}`, ctx.user.id]);
    return { success: true };
  }),

  // ── Website leads and analytics ───────────────────────────────
  getLeads: adminOnly.input(z.object({ status: z.string().optional(), search: z.string().optional(), limit: z.number().int().min(1).max(500).default(100) }).optional()).query(async ({ input }) => {
    const pool = getPool();
    if (!pool) return [];
    await ensureWebsiteTrackingTables(pool);
    const params: any[] = [];
    const conditions: string[] = [];
    if (input?.status) { conditions.push("status = ?"); params.push(input.status); }
    if (input?.search) { conditions.push("(name LIKE ? OR email LIKE ? OR company LIKE ?)"); params.push(`%${input.search}%`, `%${input.search}%`, `%${input.search}%`); }
    params.push(input?.limit || 100);
    const [rows] = await pool.query(`SELECT * FROM website_leads${conditions.length ? ` WHERE ${conditions.join(" AND ")}` : ""} ORDER BY createdAt DESC LIMIT ?`, params);
    return rows;
  }),

  updateLead: adminOnly.input(z.object({ id: z.string(), status: z.enum(["new", "contacted", "qualified", "converted", "lost"]), notes: z.string().max(10000).optional() })).mutation(async ({ input }) => {
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    await ensureWebsiteTrackingTables(pool);
    await pool.query("UPDATE website_leads SET status = ?, notes = COALESCE(?, notes), updatedAt = NOW() WHERE id = ?", [input.status, input.notes ?? null, input.id]);
    return { success: true };
  }),

  getWebsiteReport: adminOnly.input(z.object({ days: z.number().int().min(1).max(365).default(30) }).optional()).query(async ({ input }) => {
    const pool = getPool();
    if (!pool) return { days: input?.days || 30, visitors: 0, pageViews: 0, leads: 0, conversions: 0, topPages: [], events: [], leadsByStatus: {} };
    await ensureWebsiteTrackingTables(pool);
    const days = input?.days || 30;
    const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 19).replace("T", " ");
    const [summaryRows] = await pool.query("SELECT COUNT(DISTINCT visitorId) visitors, SUM(eventName = 'page_view') pageViews FROM website_analytics_events WHERE createdAt >= ?", [since]);
    const [leadRows] = await pool.query("SELECT COUNT(*) leads, SUM(status = 'converted') conversions FROM website_leads WHERE createdAt >= ?", [since]);
    const summary = (Array.isArray(summaryRows) ? summaryRows[0] : {}) as any;
    const leadSummary = (Array.isArray(leadRows) ? leadRows[0] : {}) as any;
    const [topPages] = await pool.query("SELECT path, COUNT(*) views FROM website_analytics_events WHERE eventName = 'page_view' AND createdAt >= ? GROUP BY path ORDER BY views DESC LIMIT 10", [since]);
    const [events] = await pool.query("SELECT eventName, COUNT(*) count FROM website_analytics_events WHERE createdAt >= ? GROUP BY eventName ORDER BY count DESC", [since]);
    const [statusRows] = await pool.query("SELECT status, COUNT(*) count FROM website_leads WHERE createdAt >= ? GROUP BY status", [since]);
    const leadsByStatus: Record<string, number> = {};
    for (const row of statusRows as any[]) leadsByStatus[row.status] = Number(row.count);
    return { days, visitors: Number(summary?.visitors || 0), pageViews: Number(summary?.pageViews || 0), leads: Number(leadSummary?.leads || 0), conversions: Number(leadSummary?.conversions || 0), topPages, events, leadsByStatus };
  }),

  trackEvent: publicProcedure.input(z.object({
    eventName: z.string().min(1).max(100),
    path: z.string().max(500).optional(),
    referrer: z.string().max(1000).optional(),
    sessionId: z.string().max(128).optional(),
    visitorId: z.string().max(128).optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  })).mutation(async ({ input }) => {
    const pool = getPool();
    if (!pool) return { success: false };
    try {
      await ensureWebsiteTrackingTables(pool);
      await pool.query("INSERT INTO website_analytics_events (id, eventName, path, referrer, sessionId, visitorId, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)", [uuidv4(), input.eventName, input.path || null, input.referrer || null, input.sessionId || null, input.visitorId || null, JSON.stringify(input.metadata || {})]);
    } catch (error) {
      console.warn("[Website Analytics] Event rejected:", error);
    }
    return { success: true };
  }),

  // ── Delete contact ────────────────────────────────────────────
  deleteContact: adminOnly
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      await pool.query("DELETE FROM websiteContacts WHERE id = ?", [input.id]);
      return { success: true };
    }),

  // ── Bulk update contacts ──────────────────────────────────────
  bulkUpdateContacts: adminOnly
    .input(z.object({
      ids: z.array(z.string()),
      action: z.enum(["read", "replied", "archived", "delete"]),
    }))
    .mutation(async ({ input }) => {
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      if (input.action === "delete") {
        await pool.query("DELETE FROM websiteContacts WHERE id IN (?)", [input.ids]);
      } else {
        await pool.query("UPDATE websiteContacts SET status = ? WHERE id IN (?)", [input.action, input.ids]);
      }
      return { success: true };
    }),

  // ── Footer configuration ──────────────────────────────────────
  getFooterConfig: adminOnly.query(async () => {
    const pool = getPool();
    if (!pool) return null;
    const [rows] = await pool.query(
      "SELECT value FROM systemSettings WHERE category = 'website_footer' AND `key` = 'config'"
    );
    const arr = rows as any[];
    if (arr.length && arr[0].value) return JSON.parse(arr[0].value);
    return {
      columns: [
        { title: "Product", links: [
          { label: "Features", href: "/features" },
          { label: "Pricing", href: "/pricing" },
          { label: "Demo", href: "/demo" },
          { label: "Documentation", href: "/documentation" },
        ]},
        { title: "Resources", links: [
          { label: "User Guide", href: "/user-guide" },
          { label: "Troubleshooting", href: "/troubleshooting" },
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },
        ]},
        { title: "Legal", links: [
          { label: "Privacy Policy", href: "/privacy-policy" },
          { label: "Terms & Conditions", href: "/terms-and-conditions" },
        ]},
      ],
      copyrightText: "",
      showCloudPartners: true,
      showComplianceBadges: true,
    };
  }),

  updateFooterConfig: adminOnly
    .input(z.object({
      columns: z.array(z.object({
        title: z.string(),
        links: z.array(z.object({ label: z.string(), href: z.string() })),
      })),
      copyrightText: z.string().optional(),
      showCloudPartners: z.boolean().optional(),
      showComplianceBadges: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const value = JSON.stringify(input);
      const [existing] = await pool.query(
        "SELECT id FROM systemSettings WHERE category = 'website_footer' AND `key` = 'config'"
      );
      const rows = existing as any[];
      if (rows.length) {
        await pool.query("UPDATE systemSettings SET value = ?, updatedBy = ?, updatedAt = NOW() WHERE id = ?",
          [value, ctx.user.id, rows[0].id]);
      } else {
        await pool.query(
          "INSERT INTO systemSettings (id, category, `key`, value, dataType, description, isPublic, updatedBy, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
          [uuidv4(), "website_footer", "config", value, "json", "Website footer configuration", 0, ctx.user.id]);
      }
      return { success: true };
    }),

  // ── Public endpoints (no auth required) ────────────────────────
  publicNavigation: publicProcedure.query(async () => {
    const pool = getPool();
    const defaultNav = {
      mainLinks: [
        { label: "Features",      href: "/features",          visible: true },
        { label: "Pricing",       href: "/pricing",           visible: true },
        { label: "Book a Demo",   href: "/book-a-demo",       visible: true },
        { label: "Partners",      href: "/become-a-partner",  visible: true },
        { label: "About",         href: "/about",             visible: true },
        { label: "Contact",       href: "/contact",           visible: true },
      ],
      resourceLinks: [
        { label: "Documentation",   href: "/documentation",  visible: true },
        { label: "User Guide",      href: "/user-guide",     visible: true },
        { label: "Troubleshooting", href: "/troubleshooting", visible: true },
      ],
      ctaText: "Get Started",
      ctaLink: "/signup",
    };
    if (!pool) return defaultNav;
    const [rows] = await pool.query(
      "SELECT value FROM systemSettings WHERE category = 'website_nav' AND `key` = 'config'"
    );
    const arr = rows as any[];
    if (!arr.length || !arr[0].value) return defaultNav;

    const stored = JSON.parse(arr[0].value);
    // Upgrade legacy /demo link → /book-a-demo, and inject /become-a-partner if missing
    if (stored.mainLinks) {
      stored.mainLinks = stored.mainLinks.map((link: any) => {
        if (link.href === "/demo") return { ...link, label: "Book a Demo", href: "/book-a-demo" };
        return link;
      });
      const hasPartners = stored.mainLinks.some((l: any) => l.href === "/become-a-partner");
      if (!hasPartners) {
        const bookIdx = stored.mainLinks.findIndex((l: any) => l.href === "/book-a-demo");
        const insertAt = bookIdx >= 0 ? bookIdx + 1 : stored.mainLinks.length;
        stored.mainLinks.splice(insertAt, 0, { label: "Partners", href: "/become-a-partner", visible: true });
      }
    }
    return stored;
  }),

  publicSettings: publicProcedure.query(async () => {
    const pool = getPool();
    if (!pool) return null;
    const [rows] = await pool.query(
      "SELECT * FROM systemSettings WHERE category = 'website_general'"
    );
    const arr = rows as any[];
    const result: Record<string, string> = {};
    for (const r of arr) result[r.key] = r.value || "";

    // Fetch company logo and name from the settings table (company_logos + general categories)
    let logoUrl = "";
    let companyName = "";
    try {
      const database = await getDb();
      if (database) {
        const logoRows = await database
          .select()
          .from(settings)
          .where(eq(settings.category, "app_logo"));
        const logoMap: Record<string, string> = {};
        for (const r of logoRows) logoMap[r.key] = r.value ?? "";
        logoUrl = logoMap.largeLogo || logoMap.smallLogo || "";

        const generalRows = await database
          .select()
          .from(settings)
          .where(eq(settings.category, "general"));
        const generalMap: Record<string, string> = {};
        for (const r of generalRows) generalMap[r.key] = r.value ?? "";
        companyName = generalMap.companyName || "";
      }
    } catch (_) { /* non-fatal */ }

    return {
      siteTitle: result.siteTitle || "Kiini",
      tagline: result.tagline || "One Hub. Total Control. The unified business management platform for modern enterprises.",
      contactEmail: result.contactEmail || "",
      contactPhone: result.contactPhone || "",
      contactAddress: result.contactAddress || "",
      socialLinkedIn: result.socialLinkedIn || "",
      socialTwitter: result.socialTwitter || "",
      socialFacebook: result.socialFacebook || "",
      socialInstagram: result.socialInstagram || "",
      announcementBanner: result.announcementBanner || "",
      announcementEnabled: result.announcementEnabled === "true",
      logoUrl,
      companyName,
    };
  }),

  publicFooterConfig: publicProcedure.query(async () => {
    const pool = getPool();
    if (!pool) return null;
    try {
      const [rows] = await pool.query(
        "SELECT value FROM systemSettings WHERE category = 'website_footer' AND `key` = 'config'"
      );
      const arr = rows as any[];
      if (arr.length && arr[0].value) {
        try {
          return JSON.parse(arr[0].value);
        } catch {
          // fall through to the default footer config below
        }
      }
    } catch {
      // fall through to the default footer config below
    }
    return {
      columns: [
        { title: "Product", links: [
          { label: "Features", href: "/features" },
          { label: "Pricing", href: "/pricing" },
          { label: "Demo", href: "/demo" },
          { label: "Documentation", href: "/documentation" },
        ]},
        { title: "Resources", links: [
          { label: "User Guide", href: "/user-guide" },
          { label: "Troubleshooting", href: "/troubleshooting" },
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },
        ]},
        { title: "Legal", links: [
          { label: "Privacy Policy", href: "/privacy-policy" },
          { label: "Terms & Conditions", href: "/terms-and-conditions" },
        ]},
      ],
      copyrightText: "",
      showCloudPartners: true,
      showComplianceBadges: true,
    };
  }),

  /** Public pricing data - fetches plans from CRM pricing management */
  publicPricing: publicProcedure.query(async () => {
    const pool = getPool();
    if (!pool) return null;
    const databaseApi = await import("../db");

    // The CRM pricing-tier screen is the source of truth. Return every active
    // plan, preserving its saved label, prices, limits, and feature map.
    let canonicalPlans: any[] = [];
    try {
      const databasePlans = await (await import("../db")).getAvailablePlans();
      canonicalPlans = databasePlans.map((plan: any) => ({
        key: plan.planSlug,
        planSlug: plan.planSlug,
        planName: plan.planName,
        name: plan.planName,
        tier: plan.tier,
        description: plan.description || "",
        monthlyPrice: Number(plan.monthlyPrice || 0),
        annualPrice: Number(plan.annualPrice || 0),
        monthlyKes: Number(plan.monthlyPrice || 0),
        annualKes: Number(plan.annualPrice || 0),
        maxUsers: Number(plan.maxUsers || 0),
        supportLevel: plan.supportLevel || "email",
        features: typeof plan.features === "string" ? (() => { try { return JSON.parse(plan.features); } catch { return {}; } })() : plan.features || {},
      }));
    } catch (error) {
      console.warn("[Website Pricing] Canonical pricing plans unavailable:", error);
    }

    // 1. Try to read plan prices from settings (managed via CRM admin)
    let prices: Record<string, any> | null = null;
    // Use the same canonical setting written by /crm/pricing-tiers.
    try {
      const canonicalSetting = await databaseApi.getSetting("plan_prices");
      if (canonicalSetting?.value) {
        const canonicalPrices = typeof canonicalSetting.value === "string"
          ? JSON.parse(canonicalSetting.value)
          : canonicalSetting.value;
        if (canonicalPrices && typeof canonicalPrices === "object" && !Array.isArray(canonicalPrices)) {
          prices = { ...(prices || {}), ...canonicalPrices };
        }
      }
    } catch { /* keep the SQL-derived pricing data */ }

    if (prices) {
      const overrides = parseTierPricingOverrides(prices);
      for (const key of Object.keys(DEFAULT_TIER_PRICING)) {
        const resolved = resolveTierPricingEntry(key, overrides);
        prices[key] = {
          ...(prices[key] || {}),
          ...resolved,
          monthlyPrice: resolved.monthlyKes,
          annualPrice: resolved.annualKes,
        };
      }
    }

    // Custom tiers store their feature flags separately from plan_prices.
    let savedTierFeatures: Record<string, Record<string, boolean>> = {};
    try {
      const featureRows = await databaseApi.getAllPricingTierFeatures();
      for (const feature of featureRows as any[]) {
        if (!savedTierFeatures[feature.tier]) savedTierFeatures[feature.tier] = {};
        savedTierFeatures[feature.tier][feature.featureKey] = Boolean(feature.isEnabled);
      }
    } catch { /* feature table may not exist in older deployments */ }

    if (prices) {
      for (const [key, price] of Object.entries(prices)) {
        const entry = price as any;
        entry.key = entry.key || key;
        entry.planSlug = entry.planSlug || key;
        entry.planName = entry.planName || entry.label || key;
        entry.name = entry.name || entry.label || entry.planName;
        entry.tier = entry.tier || key;
        entry.monthlyPrice = Number(entry.monthlyPrice ?? entry.monthlyKes ?? 0);
        entry.annualPrice = Number(entry.annualPrice ?? entry.annualKes ?? 0);
        entry.features = { ...(savedTierFeatures[key] || {}), ...(entry.features || {}) };
      }
    }

    // 2. Try to read pricing plans from pricingPlans table
    let dbPlans: any[] = [];
    try {
      const [planRows] = await pool.query(
        "SELECT * FROM pricingPlans WHERE isActive = 1 ORDER BY displayOrder ASC, monthlyPrice ASC"
      );
      dbPlans = planRows as any[];
    } catch { /* table may not exist yet */ }

    // 3. Read tier features
    let tierFeatures: Record<string, Record<string, boolean>> = {};
    try {
      const [featureRows] = await pool.query(
        "SELECT tier, featureKey, isEnabled FROM pricingTierFeatures"
      );
      for (const f of featureRows as any[]) {
        if (!tierFeatures[f.tier]) tierFeatures[f.tier] = {};
        tierFeatures[f.tier][f.featureKey] = Boolean(f.isEnabled);
      }
    } catch { /* table may not exist */ }

    // 4. Read custom pricing config from website settings
    let customConfig: any = null;
    try {
      const [cfgRows] = await pool.query(
        "SELECT value FROM systemSettings WHERE category = 'website_pricing' AND `key` = 'config' LIMIT 1"
      );
      const cfgArr = cfgRows as any[];
      if (cfgArr.length && cfgArr[0].value) {
        customConfig = JSON.parse(cfgArr[0].value);
      }
    } catch { /* ignore */ }

    const customPlans = Object.values(prices || {}) as any[];
    const knownPlanKeys = new Set(canonicalPlans.map((plan: any) => plan.key || plan.planSlug));
    const plans = [
      ...canonicalPlans,
      ...customPlans.filter((plan: any) => !knownPlanKeys.has(plan.key || plan.planSlug)),
    ];
    return { prices, dbPlans: canonicalPlans, plans, tierFeatures: { ...tierFeatures, ...savedTierFeatures }, customConfig };
  }),

  /** Admin: save pricing page customization */
  updatePricingConfig: adminOnly
    .input(z.object({
      config: z.object({
        plans: z.array(z.object({
          name: z.string(),
          tier: z.string(),
          monthlyKes: z.number(),
          annualKes: z.number(),
          description: z.string(),
          highlight: z.boolean(),
          badge: z.string().nullable(),
          cta: z.string(),
          ctaLink: z.string(),
          maxUsers: z.string(),
          features: z.array(z.object({
            text: z.string(),
            included: z.boolean(),
          })),
        })),
        comparisonRows: z.array(z.object({
          category: z.string().optional(),
          label: z.string().optional(),
          starter: z.any().optional(),
          pro: z.any().optional(),
          ent: z.any().optional(),
        })),
        faq: z.array(z.object({
          q: z.string(),
          a: z.string(),
        })),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const value = JSON.stringify(input.config);
      const [existing] = await pool.query(
        "SELECT id FROM systemSettings WHERE category = 'website_pricing' AND `key` = 'config'"
      );
      const rows = existing as any[];
      if (rows.length) {
        await pool.query(
          "UPDATE systemSettings SET value = ?, updatedBy = ?, updatedAt = NOW() WHERE id = ?",
          [value, ctx.user.id, rows[0].id]
        );
      } else {
        await pool.query(
          "INSERT INTO systemSettings (id, category, `key`, value, dataType, description, isPublic, updatedBy, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
          [uuidv4(), "website_pricing", "config", value, "json", "Public pricing page configuration", 1, ctx.user.id]
        );
      }
      return { success: true };
    }),

  /** Admin: get pricing page config */
  getPricingConfig: adminOnly.query(async () => {
    const pool = getPool();
    if (!pool) return null;
    try {
      const [rows] = await pool.query(
        "SELECT value FROM systemSettings WHERE category = 'website_pricing' AND `key` = 'config' LIMIT 1"
      );
      const arr = rows as any[];
      if (arr.length && arr[0].value) return JSON.parse(arr[0].value);
    } catch { /* ignore */ }
    return null;
  }),

  // ── About Page Content ─────────────────────────────────────────
  getAboutContent: adminOnly.query(async () => {
    const pool = getPool();
    if (!pool) return DEFAULT_ABOUT_CONTENT;
    try {
      const [rows] = await pool.query(
        "SELECT value FROM systemSettings WHERE category = 'website_about' AND `key` = 'content' LIMIT 1"
      );
      const arr = rows as any[];
      if (arr.length && arr[0].value) return { ...DEFAULT_ABOUT_CONTENT, ...JSON.parse(arr[0].value) };
    } catch { /* ignore */ }
    return DEFAULT_ABOUT_CONTENT;
  }),

  updateAboutContent: adminOnly
    .input(z.object({
      heroTitle: z.string().max(200).optional(),
      heroSubtitle: z.string().max(2000).optional(),
      missionText: z.string().max(2000).optional(),
      stats: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
      values: z.array(z.object({ title: z.string(), desc: z.string(), icon: z.string().optional(), color: z.string().optional() })).optional(),
      milestones: z.array(z.object({ year: z.string(), event: z.string() })).optional(),
      team: z.array(z.object({ name: z.string(), role: z.string(), bio: z.string(), imageUrl: z.string().optional() })).optional(),
      cta: z.object({ title: z.string(), subtitle: z.string(), actions: z.array(z.object({ label: z.string(), href: z.string(), description: z.string() })) }).optional(),
    }))
    .mutation(async ({ input }) => {
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No DB" });
      const value = JSON.stringify(input);
      await pool.query(
        `INSERT INTO systemSettings (id, category, \`key\`, value, dataType)
         VALUES (?, 'website_about', 'content', ?, 'json')
         ON DUPLICATE KEY UPDATE value = ?`,
        [uuidv4(), value, value]
      );
      return { success: true };
    }),

  // Public About content
  publicAboutContent: publicProcedure.query(async () => {
    const pool = getPool();
    if (!pool) return DEFAULT_ABOUT_CONTENT;
    try {
      const [rows] = await pool.query(
        "SELECT value FROM systemSettings WHERE category = 'website_about' AND `key` = 'content' LIMIT 1"
      );
      const arr = rows as any[];
      if (arr.length && arr[0].value) return { ...DEFAULT_ABOUT_CONTENT, ...JSON.parse(arr[0].value) };
    } catch { /* ignore */ }
    return DEFAULT_ABOUT_CONTENT;
  }),

  // ── Features Page Content ──────────────────────────────────────
  getFeaturesContent: adminOnly.query(async () => {
    const pool = getPool();
    if (!pool) return DEFAULT_FEATURES_CONTENT;
    try {
      const [rows] = await pool.query(
        "SELECT value FROM systemSettings WHERE category = 'website_features' AND `key` = 'content' LIMIT 1"
      );
      const arr = rows as any[];
      if (arr.length && arr[0].value) return { ...DEFAULT_FEATURES_CONTENT, ...JSON.parse(arr[0].value) };
    } catch { /* ignore */ }
    return DEFAULT_FEATURES_CONTENT;
  }),

  updateFeaturesContent: adminOnly
    .input(z.object({
      heroTitle: z.string().max(200).optional(),
      heroBadge: z.string().max(100).optional(),
      heroSubtitle: z.string().max(500).optional(),
      sections: z.array(z.object({
        category: z.string(),
        desc: z.string().optional(),
        icon: z.string().optional(),
        features: z.array(z.string()),
      })).optional(),
      pillars: z.array(z.object({ title: z.string(), desc: z.string(), icon: z.string().optional() })).optional(),
    }))
    .mutation(async ({ input }) => {
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No DB" });
      const value = JSON.stringify(input);
      await pool.query(
        `INSERT INTO systemSettings (id, category, \`key\`, value, dataType)
         VALUES (?, 'website_features', 'content', ?, 'json')
         ON DUPLICATE KEY UPDATE value = ?`,
        [uuidv4(), value, value]
      );
      return { success: true };
    }),

  // Public Features content
  publicFeaturesContent: publicProcedure.query(async () => {
    const pool = getPool();
    if (!pool) return DEFAULT_FEATURES_CONTENT;
    try {
      const [rows] = await pool.query(
        "SELECT value FROM systemSettings WHERE category = 'website_features' AND `key` = 'content' LIMIT 1"
      );
      const arr = rows as any[];
      if (arr.length && arr[0].value) return { ...DEFAULT_FEATURES_CONTENT, ...JSON.parse(arr[0].value) };
    } catch { /* ignore */ }
    return DEFAULT_FEATURES_CONTENT;
  }),

  // ── Testimonials ──────────────────────────────────────────────
  getTestimonials: adminOnly.query(async () => {
    const pool = getPool();
    if (!pool) return DEFAULT_TESTIMONIALS;
    try {
      const [rows] = await pool.query(
        "SELECT value FROM systemSettings WHERE category = 'website_testimonials' AND `key` = 'items' LIMIT 1"
      );
      const arr = rows as any[];
      if (arr.length && arr[0].value) return JSON.parse(arr[0].value);
    } catch { /* ignore */ }
    return DEFAULT_TESTIMONIALS;
  }),

  updateTestimonials: adminOnly
    .input(z.array(z.object({
      id: z.string(),
      name: z.string().max(100),
      role: z.string().max(100).optional(),
      company: z.string().max(100).optional(),
      content: z.string().max(1000),
      rating: z.number().min(1).max(5).default(5),
      isVisible: z.boolean().default(true),
      avatarUrl: z.string().max(500).optional(),
    })))
    .mutation(async ({ input }) => {
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No DB" });
      const value = JSON.stringify(input);
      await pool.query(
        `INSERT INTO systemSettings (id, category, \`key\`, value, dataType)
         VALUES (?, 'website_testimonials', 'items', ?, 'json')
         ON DUPLICATE KEY UPDATE value = ?`,
        [uuidv4(), value, value]
      );
      return { success: true };
    }),

  publicTestimonials: publicProcedure.query(async () => {
    const pool = getPool();
    if (!pool) return DEFAULT_TESTIMONIALS.filter((t) => t.isVisible);
    try {
      const [rows] = await pool.query(
        "SELECT value FROM systemSettings WHERE category = 'website_testimonials' AND `key` = 'items' LIMIT 1"
      );
      const arr = rows as any[];
      if (arr.length && arr[0].value) {
        const items = JSON.parse(arr[0].value);
        return items.filter((t: any) => t.isVisible !== false);
      }
    } catch { /* ignore */ }
    return DEFAULT_TESTIMONIALS.filter((t) => t.isVisible);
  }),

  // ── FAQ ────────────────────────────────────────────────────────
  getFAQs: adminOnly.query(async () => {
    const pool = getPool();
    if (!pool) return DEFAULT_FAQS;
    try {
      const [rows] = await pool.query(
        "SELECT value FROM systemSettings WHERE category = 'website_faq' AND `key` = 'items' LIMIT 1"
      );
      const arr = rows as any[];
      if (arr.length && arr[0].value) return JSON.parse(arr[0].value);
    } catch { /* ignore */ }
    return DEFAULT_FAQS;
  }),

  updateFAQs: adminOnly
    .input(z.array(z.object({
      id: z.string(),
      question: z.string().max(500),
      answer: z.string().max(2000),
      category: z.string().max(100).optional(),
      order: z.number().default(0),
      isVisible: z.boolean().default(true),
    })))
    .mutation(async ({ input }) => {
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No DB" });
      const value = JSON.stringify(input);
      await pool.query(
        `INSERT INTO systemSettings (id, category, \`key\`, value, dataType)
         VALUES (?, 'website_faq', 'items', ?, 'json')
         ON DUPLICATE KEY UPDATE value = ?`,
        [uuidv4(), value, value]
      );
      return { success: true };
    }),

  publicFAQs: publicProcedure.query(async () => {
    const pool = getPool();
    if (!pool) return DEFAULT_FAQS.filter((f) => f.isVisible);
    try {
      const [rows] = await pool.query(
        "SELECT value FROM systemSettings WHERE category = 'website_faq' AND `key` = 'items' LIMIT 1"
      );
      const arr = rows as any[];
      if (arr.length && arr[0].value) {
        const items = JSON.parse(arr[0].value);
        return items.filter((f: any) => f.isVisible !== false).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
      }
    } catch { /* ignore */ }
    return DEFAULT_FAQS.filter((f) => f.isVisible);
  }),

  // ── Blog ───────────────────────────────────────────────────────
  getBlogPosts: adminOnly.query(async () => {
    const pool = getPool();
    if (!pool) return [];
    try {
      const [rows] = await pool.query(
        "SELECT value FROM systemSettings WHERE category = 'website_blog' AND `key` = 'posts' LIMIT 1"
      );
      const arr = rows as any[];
      if (arr.length && arr[0].value) return JSON.parse(arr[0].value);
    } catch { /* ignore */ }
    return [];
  }),

  updateBlogPosts: adminOnly
    .input(z.array(z.object({
      id: z.string(),
      title: z.string().max(300),
      slug: z.string().max(300),
      excerpt: z.string().max(500).optional(),
      content: z.string().max(50000),
      author: z.string().max(100).optional(),
      category: z.string().max(100).optional(),
      tags: z.array(z.string()).optional(),
      coverImageUrl: z.string().max(500).optional(),
      isPublished: z.boolean().default(false),
      publishedAt: z.string().optional(),
      createdAt: z.string().optional(),
    })))
    .mutation(async ({ input }) => {
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No DB" });
      const value = JSON.stringify(input);
      await pool.query(
        `INSERT INTO systemSettings (id, category, \`key\`, value, dataType)
         VALUES (?, 'website_blog', 'posts', ?, 'json')
         ON DUPLICATE KEY UPDATE value = ?`,
        [uuidv4(), value, value]
      );
      return { success: true };
    }),

  publicBlogPosts: publicProcedure.query(async () => {
    const pool = getPool();
    if (!pool) return [];
    try {
      const [rows] = await pool.query(
        "SELECT value FROM systemSettings WHERE category = 'website_blog' AND `key` = 'posts' LIMIT 1"
      );
      const arr = rows as any[];
      if (arr.length && arr[0].value) {
        const posts = JSON.parse(arr[0].value);
        return posts.filter((p: any) => p.isPublished).sort((a: any, b: any) =>
          new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime()
        );
      }
    } catch { /* ignore */ }
    return [];
  }),

  // ── Hero / Landing Content ─────────────────────────────────────
  getHeroContent: adminOnly.query(async () => {
    const pool = getPool();
    if (!pool) return DEFAULT_HERO_CONTENT;
    try {
      const [rows] = await pool.query(
        "SELECT value FROM systemSettings WHERE category = 'website_hero' AND `key` = 'content' LIMIT 1"
      );
      const arr = rows as any[];
      if (arr.length && arr[0].value) return { ...DEFAULT_HERO_CONTENT, ...JSON.parse(arr[0].value) };
    } catch { /* ignore */ }
    return DEFAULT_HERO_CONTENT;
  }),

  updateHeroContent: adminOnly
    .input(z.object({
      badge: z.string().max(100).optional(),
      title: z.string().max(300).optional(),
      subtitle: z.string().max(500).optional(),
      ctaPrimary: z.object({ label: z.string(), href: z.string() }).optional(),
      ctaSecondary: z.object({ label: z.string(), href: z.string() }).optional(),
      stats: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
      slides: z.array(z.object({
        id: z.string(), badge: z.string(), title: z.string(), subtitle: z.string(),
        imageUrl: z.string(), ctaPrimary: z.object({ label: z.string(), href: z.string() }),
        ctaSecondary: z.object({ label: z.string(), href: z.string() }).optional(),
        isActive: z.boolean(), displayOrder: z.number().int(),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "No DB" });
      const value = JSON.stringify(input);
      await pool.query(
        `INSERT INTO systemSettings (id, category, \`key\`, value, dataType)
         VALUES (?, 'website_hero', 'content', ?, 'json')
         ON DUPLICATE KEY UPDATE value = ?`,
        [uuidv4(), value, value]
      );
      return { success: true };
    }),

  publicHeroContent: publicProcedure.query(async () => {
    const pool = getPool();
    if (!pool) return DEFAULT_HERO_CONTENT;
    try {
      const [rows] = await pool.query(
        "SELECT value FROM systemSettings WHERE category = 'website_hero' AND `key` = 'content' LIMIT 1"
      );
      const arr = rows as any[];
      if (arr.length && arr[0].value) return { ...DEFAULT_HERO_CONTENT, ...JSON.parse(arr[0].value) };
    } catch { /* ignore */ }
    return DEFAULT_HERO_CONTENT;
  }),

  // ── Public: Submit contact / partner application ───────────────
  submitContact: publicProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      email: z.string().email().max(255),
      company: z.string().max(255).optional(),
      phone: z.string().max(50).optional(),
      website: z.string().max(500).optional(),
      subject: z.string().max(500).optional(),
      message: z.string().min(1).max(10000),
    }))
    .mutation(async ({ input }) => {
      const pool = getPool();
      const id = uuidv4();
      const subject = input.subject || "Website Enquiry";
      if (pool) {
        try {
          await ensureWebsiteTrackingTables(pool);
          await pool.query(
            `INSERT INTO website_leads (id, name, email, phone, company, source, landingPage, status, notes, createdAt)
             VALUES (?, ?, ?, ?, ?, 'website', ?, 'new', ?, NOW())`,
            [id, input.name, input.email, input.phone || null, input.company || null, input.subject || null, input.message]
          );
          await pool.query(
            `INSERT INTO websiteContacts (id, name, email, company, phone, subject, message, status, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'new', NOW())
             ON DUPLICATE KEY UPDATE id = id`,
            [id, input.name, input.email, input.company || null, input.phone || null, subject, input.message]
          );
        } catch (err) {
          // phone column may not exist — retry without it
          try {
            await pool.query(
              `INSERT INTO websiteContacts (id, name, email, company, subject, message, status, createdAt)
               VALUES (?, ?, ?, ?, ?, ?, 'new', NOW())`,
              [id, input.name, input.email, input.company || null, subject, input.message]
            );
          } catch { /* ignore if table doesn't exist */ }
        }
      }
      return { success: true, message: "Thank you! We'll be in touch shortly." };
    }),

  // ── Public: Book a demo ───────────────────────────────────────
  bookDemo: publicProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      email: z.string().email().max(255),
      company: z.string().max(255).optional(),
      phone: z.string().max(50).optional(),
      teamSize: z.string().max(50).optional(),
      message: z.string().max(2000).optional(),
      date: z.string().max(50),
      time: z.string().max(20),
      timezone: z.string().max(100),
      duration: z.number().int().min(15).max(120),
    }))
    .mutation(async ({ input }) => {
      const pool = getPool();
      const id = uuidv4();
      const subject = `Demo Booking – ${input.date} at ${input.time} (${input.timezone})`;
      const messageBody = [
        `Meeting: ${input.date} at ${input.time} ${input.timezone} (${input.duration} min)`,
        `Company: ${input.company || "—"}`,
        `Phone: ${input.phone || "—"}`,
        `Team size: ${input.teamSize || "—"}`,
        input.message ? `Notes: ${input.message}` : "",
      ].filter(Boolean).join("\n");

      if (pool) {
        try {
          await ensureWebsiteTrackingTables(pool);
          await pool.query(
            `INSERT INTO website_leads (id, name, email, phone, company, source, landingPage, status, notes, createdAt)
             VALUES (?, ?, ?, ?, ?, 'demo', ?, 'new', ?, NOW())`,
            [id, input.name, input.email, input.phone || null, input.company || null, "/book-a-demo", messageBody]
          );
          await pool.query(
            `INSERT INTO websiteContacts (id, name, email, company, phone, subject, message, status, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'new', NOW())`,
            [id, input.name, input.email, input.company || null, input.phone || null, subject, messageBody]
          );
        } catch {
          try {
            await pool.query(
              `INSERT INTO websiteContacts (id, name, email, company, subject, message, status, createdAt)
               VALUES (?, ?, ?, ?, ?, ?, 'new', NOW())`,
              [id, input.name, input.email, input.company || null, subject, messageBody]
            );
          } catch { /* ignore */ }
        }
      }
      return { success: true, message: "Demo booked! Check your email for a confirmation." };
    }),
});
