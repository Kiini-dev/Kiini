import { z } from "zod";
import { router, adminProcedure, protectedProcedure } from "../_core/trpc";
import { getPool } from "../db";
import { v4 as uuidv4 } from "uuid";
import { TRPCError } from "@trpc/server";

function mapRow(row: any) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    content: row.content,
    isDefault: Boolean(row.isDefault ?? row.is_default),
    createdBy: row.createdBy || row.created_by || "System",
    createdAt: row.createdAt || row.created_at,
    updatedAt: row.updatedAt || row.updated_at,
  };
}

async function insertDocumentTemplateRow(
  pool: any,
  data: {
    id: string;
    type: string;
    title: string;
    content: string;
    createdBy: string;
    organizationId: string | null;
    isDefault: number;
  }
) {
  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    await pool.query(
      `INSERT INTO documentTemplates (
        id, type, title, content, createdBy, organizationId, isDefault, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id,
        data.type,
        data.title,
        data.content,
        data.createdBy,
        data.organizationId,
        data.isDefault,
        now,
        now,
      ]
    );
    return;
  } catch (error: any) {
    const message = String(error?.message || "");
    if (!/Unknown column 'createdAt'|Unknown column 'updatedAt'/i.test(message)) {
      throw error;
    }
  }

  await pool.query(
    `INSERT INTO documentTemplates (
      id, type, title, content, created_by, organization_id, is_default, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id,
      data.type,
      data.title,
      data.content,
      data.createdBy,
      data.organizationId,
      data.isDefault,
      now,
      now,
    ]
  );
}

const COMMON_ALLOWED_TOKENS = new Set([
  "company_name",
  "company_tagline",
  "company_email",
  "company_phone",
  "company_website",
  "company_address",
  "company_logo",
  "logo_url",
  "company_pin",
  "company_kra_pin",
  "company_tax_number",
  "todays_date",
  "client_name",
  "client_company",
  "client_email",
  "client_phone",
  "client_address",
  "client_kra_pin",
  "client_tax_number",
  "supplier_name",
  "supplier_company",
  "supplier_email",
  "supplier_phone",
  "supplier_address",
  "supplier_registration",
  "document_number",
  "document_date",
  "issue_date",
  "due_date",
  "subtotal",
  "sub_total",
  "tax",
  "tax_rate",
  "tax_amount",
  "total",
  "total_amount",
  "currency",
  "notes",
  "terms",
  "terms_and_conditions",
  "items_table",
  "line_items_table",
  "items_rows",
  "line_items_rows",
  "items_html",
  "line_items_html",
  "payment_method",
  "payment_reference",
  "payment_instructions",
  "payment_details",
  "reference_number",
  "reference_invoice",
  "reference_po",
  "payment_terms",
  "kra_pin",
  "authorized_by",
  "delivery_address",
  "delivery_location",
  "pickup_address",
  "bank_name",
  "bank_account",
  "account_name",
  "amount",
  "amount_due",
  "balance_due",
  "date",
  "dd_mm_yyyy",
  "period_start",
  "period_end",
  "claim_status",
  "claim_number",
  "claim_date",
  "credit_reason",
  "debit_reason",
  "contact_name",
  "contact_phone",
  "phone",
  "phone_number",
  "location",
  "priority",
  "purchase_date",
  "remarks",
  "response_deadline",
  "serial_number",
  "service_location",
  "service_start_date",
  "service_end_date",
  "receiver_name",
  "receiver_company",
  "receiver_phone",
  "receiving_contact",
  "consignor_name",
  "consignor_company",
  "consignor_phone",
  "vendor_name",
  "vendor_company",
  "vendor_address",
  "vendor_phone",
  "vendor_email",
  "employee_name",
  "employee_email",
  "employee_id",
  "manager_name",
  "department",
  "department_name",
  "job_title",
  "approved_by",
  "approver_name_signature",
  "asset_description",
  "asset_category",
  "asset_condition",
  "asset_cost",
  "equipment",
  "materials_cost",
  "labor_cost",
  "budget_range",
  "description",
  "work_description",
  "work_type",
  "business_purpose_description",
  "total_expenses",
  "travel_activity_location",
  "advance_deduction",
  "category",
  "hr_email",
  "hr_phone",
  "hr_extension",
  "assets_email",
  "assets_extension",
  "imp_00001",
  "kes_000",
  // Individual line item field tokens - generate both lowercase and UPPERCASE formats
  // Usage: {{item_1_description}}, {{item_2_quantity}}, {{ITEM_1_DESCRIPTION}}, {{ITEM_1_QUANTITY}}, etc.
  "item_description",
  "item_quantity",
  "item_qty",
  "item_rate",
  "item_unit_price",
  "item_amount",
  "item_total",
  "item_tax_rate",
  "item_tax_amount",
  "item_line_number",
  // Raw value variants (for custom formatting without currency)
  "item_quantity_raw",
  "item_rate_raw",
  "item_unit_price_raw",
  "item_amount_raw",
  "item_total_raw",
  "item_tax_amount_raw",
  // Uppercase legacy format variants
  "ITEM_DESCRIPTION",
  "ITEM_QUANTITY",
  "ITEM_QTY",
  "ITEM_UNIT_PRICE",
  "ITEM_RATE",
  "ITEM_AMOUNT",
  "ITEM_TOTAL",
  "ITEM_TAX_RATE",
  "ITEM_TAX_AMOUNT",
  "ITEM_LINE_NUMBER",
  // Dynamic item count
  "item_count",
  "total_items",
]);

const DOC_TYPE_ALLOWED_TOKENS: Record<string, string[]> = {
  invoice: [
    "invoice_number",
    "invoice_date",
    "discount",
    "balance_due",
    "company_tagline",
    "company_logo",
    "client_company",
    "client_kra_pin",
    "tax_rate",
  ],
  estimate: ["estimate_number", "estimate_date", "expiry_date", "valid_until", "quotation_number", "quotation_date"],
  quotation: ["quotation_number", "quotation_date", "valid_until", "estimate_number", "estimate_date"],
  receipt: ["receipt_number", "receipt_date", "payment_amount", "invoice_number", "balance_due"],
  credit_note: ["credit_note_number", "credit_note_date", "invoice_number", "reason"],
  debit_note: ["debit_note_number", "debit_note_date", "invoice_number", "reason"],
  purchase_order: ["po_number", "po_date", "delivery_date", "requested_by"],
  lpo: ["lpo_number", "po_number", "po_date", "delivery_date", "requested_by"],
  dn: ["dn_number", "dn_date", "po_number", "delivery_date", "grn_number"],
  delivery_note: ["dn_number", "dn_date", "po_number", "delivery_date", "grn_number"],
  grn: ["grn_number", "grn_date", "inspection_status", "po_number", "delivery_note_number"],
  rfq: ["rfq_number", "rfq_date", "deadline_date", "vendor_name", "vendor_email"],
  work_order: ["work_order_number", "work_order_date", "assigned_to", "start_date", "end_date", "description"],
  expense_claim: ["claim_number", "claim_date", "employee_name", "department", "approved_by"],
  service_invoice: ["service_invoice_number", "service_date", "service_description", "service_items"],
  contract: ["contract_id", "contract_number", "contract_date", "contract_value", "start_date", "end_date", "scope_of_work", "payment_terms"],
  proposal: ["proposal_number", "proposal_date", "valid_until", "project_name", "prepared_by"],
  payslip: ["payslip_number", "pay_period", "pay_date", "employee_name", "employee_number", "department", "position", "bank_name", "bank_account", "basic_salary", "allowances", "allowance_1_name", "allowance_1_amount", "allowance_2_name", "allowance_2_amount", "allowance_3_name", "allowance_3_amount", "allowance_4_name", "allowance_4_amount", "bonuses", "gross_salary", "paye", "nssf", "nhif", "loan_deduction", "other_deductions", "total_deductions", "employer_nssf", "employer_benefits", "total_company_contribution", "net_salary"],
  warranty: ["warranty_number", "purchase_date", "expiry_date", "product", "vendor", "serial_number", "coverage", "claim_terms", "status"],
  asset: ["asset_description", "asset_category", "asset_condition", "asset_cost", "serial_number", "employee_name"],
};

function getAllowedTemplateTokens(type?: string | null): string[] {
  const tokens = new Set<string>(COMMON_ALLOWED_TOKENS);
  if (type && DOC_TYPE_ALLOWED_TOKENS[type]) {
    DOC_TYPE_ALLOWED_TOKENS[type].forEach((token) => tokens.add(token));
  }
  return Array.from(tokens).sort();
}

function normalizeTemplateToken(raw: string): string {
  return raw
    .trim()
    .replace(/^[{\[$\s]+|[}\]$\s]+$/g, "")
    .replace(/([a-z\d])([A-Z])/g, "$1_$2")
    .replace(/[\s\-.]+/g, "_")
    .replace(/_+/g, "_")
    .toLowerCase();
}

function extractTemplateTokens(content: string): string[] {
  const tokens = new Set<string>();
  const moustache = /\{\{\s*([^{}]+)\s*\}\}/g;
  const dollar = /\$\{\s*([^{}]+)\s*\}/g;
  const bracket = /\[\s*([A-Za-z0-9_ ]+)\s*\]/g;

  for (const regex of [moustache, dollar, bracket]) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      const token = normalizeTemplateToken(match[1] || "");
      if (token) tokens.add(token);
    }
  }

  return Array.from(tokens);
}

function isLikelyAllowedTemplateToken(token: string): boolean {
  const knownPrefixes = [
    "company",
    "client",
    "supplier",
    "vendor",
    "employee",
    "manager",
    "department",
    "asset",
    "service",
    "invoice",
    "estimate",
    "receipt",
    "credit",
    "debit",
    "delivery",
    "grn",
    "rfq",
    "work",
    "claim",
    "po",
    "lpo",
    "dn",
    "reference",
    "payment",
    "bank",
    "mpesa",
    "total",
    "subtotal",
    "tax",
    "balance",
    "notes",
    "terms",
    "currency",
    "amount",
    "date",
    "period",
    "item",
    "line",
    "contact",
    "receiver",
    "consignor",
    "approver",
    "hr",
    "assets",
    "travel",
    "business",
    "labor",
    "materials",
    "equipment",
    "due",
    "expiry",
    "valid",
    "authorized",
    "pickup",
    "category",
    "approved",
    "issue",
    "response",
    "budget",
    "purchase",
    "serial",
    "description",
    "advance",
    "remarks",
    "location",
    "priority",
    "status",
    "phone",
    "email",
    "website",
    "address",
    "logo",
    "kra",
    "pin",
    "discount",
    "reason",
    "days",
    "cost",
    "signature",
    "name",
    "number",
    "id",
  ];

  if (knownPrefixes.some((prefix) => token.startsWith(prefix + "_") || token === prefix)) {
    return true;
  }

  return /(^|_)(number|date|name|email|phone|address|amount|cost|total|rate|status|reason|location|description|pin|company|person|date)$/.test(token);
}

function validateTemplateTokens(type: string, content: string): void {
  const docAllowed = DOC_TYPE_ALLOWED_TOKENS[type];
  if (!docAllowed) return;

  const allowed = new Set([...COMMON_ALLOWED_TOKENS, ...docAllowed]);
  const usedTokens = extractTemplateTokens(content);
  const invalidTokens = usedTokens.filter((token) => {
    if (allowed.has(token)) return false;
    if (token.startsWith("companyinfo_") || token.startsWith("company_info_")) return false;
    if (isLikelyAllowedTemplateToken(token)) return false;
    return true;
  });

  if (invalidTokens.length > 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Template contains unsupported token(s) for ${type}: ${invalidTokens.join(", ")}`,
    });
  }
}

export const documentTemplatesRouter = router({
  allowedTokens: protectedProcedure
    .input(z.object({ type: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const type = input?.type;
      return {
        type: type || null,
        commonTokens: Array.from(COMMON_ALLOWED_TOKENS).sort(),
        documentTokens: type && DOC_TYPE_ALLOWED_TOKENS[type] ? [...DOC_TYPE_ALLOWED_TOKENS[type]].sort() : [],
        allowedTokens: getAllowedTemplateTokens(type),
      };
    }),

  list: protectedProcedure
    .input(z.object({ type: z.string() }))
    .query(async ({ input, ctx }) => {
      const pool = getPool();
      if (!pool) return [];
      const orgId = ctx.user?.organizationId;
      if (orgId) {
        const [rows] = await pool.query(
          "SELECT * FROM documentTemplates WHERE type = ? AND organizationId = ? ORDER BY createdAt DESC",
          [input.type, orgId]
        );
        return (rows as any[]).map(mapRow);
      }
      const [rows] = await pool.query(
        "SELECT * FROM documentTemplates WHERE type = ? ORDER BY createdAt DESC",
        [input.type]
      );
      return (rows as any[]).map(mapRow);
    }),

  getById: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const pool = getPool();
    if (!pool) return null;
    const orgId = ctx.user?.organizationId;
    if (orgId) {
      const [rows] = await pool.query(
        "SELECT * FROM documentTemplates WHERE id = ? AND organizationId = ?",
        [input, orgId]
      );
      const arr = rows as any[];
      return arr.length ? mapRow(arr[0]) : null;
    }
    const [rows] = await pool.query("SELECT * FROM documentTemplates WHERE id = ?", [input]);
    const arr = rows as any[];
    return arr.length ? mapRow(arr[0]) : null;
  }),

  create: adminProcedure
    .input(z.object({ type: z.string(), title: z.string().min(1), content: z.string(), isDefault: z.boolean().optional() }))
    .mutation(async ({ input, ctx }) => {
      validateTemplateTokens(input.type, input.content);

      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const id = uuidv4();
      const orgId = ctx.user?.organizationId || null;
      
      // If marking as default, unset other defaults of same type in same org
      if (input.isDefault && orgId) {
        await pool.query(
          "UPDATE documentTemplates SET isDefault = 0 WHERE type = ? AND organizationId = ? AND isDefault = 1",
          [input.type, orgId]
        );
      }
      
      await insertDocumentTemplateRow(pool, {
        id,
        type: input.type,
        title: input.title,
        content: input.content,
        createdBy: ctx.user?.name || ctx.user?.id || "System",
        organizationId: orgId,
        isDefault: input.isDefault ? 1 : 0,
      });
      const [rows] = await pool.query("SELECT * FROM documentTemplates WHERE id = ?", [id]);
      return mapRow((rows as any[])[0]);
    }),

  update: adminProcedure
    .input(z.object({ id: z.string(), title: z.string().optional(), content: z.string().optional(), isDefault: z.boolean().optional() }))
    .mutation(async ({ input, ctx }) => {
      const pool = getPool();
      if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const orgId = ctx.user?.organizationId;
      const [existing] = orgId
        ? await pool.query("SELECT * FROM documentTemplates WHERE id = ? AND organizationId = ?", [input.id, orgId])
        : await pool.query("SELECT * FROM documentTemplates WHERE id = ?", [input.id]);
      if (!(existing as any[]).length) throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });

      const existingTemplate = (existing as any[])[0];

      if (input.content !== undefined) {
        validateTemplateTokens(existingTemplate.type, input.content);
      }

      const updates: string[] = [];
      const values: any[] = [];
      
      if (input.title !== undefined) { updates.push("title = ?"); values.push(input.title); }
      if (input.content !== undefined) { updates.push("content = ?"); values.push(input.content); }
      if (input.isDefault !== undefined) { updates.push("isDefault = ?"); values.push(input.isDefault ? 1 : 0); }
      
      if (updates.length) {
        // If marking as default, unset other defaults of same type in same org
        if (input.isDefault && orgId) {
          await pool.query(
            "UPDATE documentTemplates SET isDefault = 0 WHERE type = ? AND organizationId = ? AND isDefault = 1 AND id != ?",
            [existingTemplate.type, orgId, input.id]
          );
        }
        
        values.push(input.id);
        await pool.query(`UPDATE documentTemplates SET ${updates.join(", ")} WHERE id = ?`, values);
      }
      const [rows] = await pool.query("SELECT * FROM documentTemplates WHERE id = ?", [input.id]);
      return mapRow((rows as any[])[0]);
    }),

  delete: adminProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const orgId = ctx.user?.organizationId;
    if (orgId) {
      await pool.query("DELETE FROM documentTemplates WHERE id = ? AND organizationId = ?", [input, orgId]);
    } else {
      await pool.query("DELETE FROM documentTemplates WHERE id = ?", [input]);
    }
    return { success: true };
  }),

  duplicate: adminProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const orgId = ctx.user?.organizationId;
    const [rows] = orgId
      ? await pool.query("SELECT * FROM documentTemplates WHERE id = ? AND organizationId = ?", [input, orgId])
      : await pool.query("SELECT * FROM documentTemplates WHERE id = ?", [input]);
    const arr = rows as any[];
    if (!arr.length) throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
    const orig = arr[0];
    const newId = uuidv4();
    await insertDocumentTemplateRow(pool, {
      id: newId,
      type: orig.type,
      title: orig.title + " (Copy)",
      content: orig.content,
      createdBy: ctx.user?.name || ctx.user?.id || "System",
      organizationId: orig.organizationId || orig.organization_id || null,
      isDefault: 0,
    });
    const [newRows] = await pool.query("SELECT * FROM documentTemplates WHERE id = ?", [newId]);
    return mapRow((newRows as any[])[0]);
  }),

  setDefault: adminProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const orgId = ctx.user?.organizationId;
    
    // Get the template to find its type
    const [templateRows] = orgId
      ? await pool.query("SELECT type FROM documentTemplates WHERE id = ? AND organizationId = ?", [input, orgId])
      : await pool.query("SELECT type FROM documentTemplates WHERE id = ?", [input]);
    const templateArr = templateRows as any[];
    if (!templateArr.length) throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
    
    const templateType = templateArr[0].type;
    
    // Unset other defaults of same type in same org
    if (orgId) {
      await pool.query(
        "UPDATE documentTemplates SET isDefault = 0 WHERE type = ? AND organizationId = ? AND id != ?",
        [templateType, orgId, input]
      );
    }
    
    // Set this template as default
    await pool.query("UPDATE documentTemplates SET isDefault = 1 WHERE id = ?", [input]);
    
    const [rows] = await pool.query("SELECT * FROM documentTemplates WHERE id = ?", [input]);
    return mapRow((rows as any[])[0]);
  }),

  unsetDefault: adminProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const pool = getPool();
    if (!pool) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const orgId = ctx.user?.organizationId;
    
    // Verify ownership
    const [templateRows] = orgId
      ? await pool.query("SELECT id FROM documentTemplates WHERE id = ? AND organizationId = ?", [input, orgId])
      : await pool.query("SELECT id FROM documentTemplates WHERE id = ?", [input]);
    if (!(templateRows as any[]).length) throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
    
    // Unset this template as default
    await pool.query("UPDATE documentTemplates SET isDefault = 0 WHERE id = ?", [input]);
    
    const [rows] = await pool.query("SELECT * FROM documentTemplates WHERE id = ?", [input]);
    return mapRow((rows as any[])[0]);
  }),
});
