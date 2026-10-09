import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { optionalEmail } from "../utils/validation";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { 
  clients, employees, departments, jobGroups, products, services,
  payments, accounts, bankAccounts, expenses, invoices, users
} from "../../drizzle/schema";
import { and, eq, isNull } from "drizzle-orm";
import { getTableColumns } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import * as csvGen from "../utils/csvGenerator";
import * as db from "../db";
import { getImportableColumns, getRegisteredTable, getTableRegistry } from "../data/tableRegistry";
import { paymentModeSchema } from "../utils/payment-modes";

function csvEscape(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function normalizeSchemaKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function normalizeGenericRow(value: Record<string, unknown>, columns: string[]): Record<string, unknown> {
  const byNormalizedName = new Map(columns.map((column) => [normalizeSchemaKey(column), column]));
  const aliases: Record<string, string> = {
    "project_#": "projectNumber",
    project_no: "projectNumber",
    project_number: "projectNumber",
    client: "clientId",
    client_code: "clientId",
    client_id: "clientId",
  };
  const row: Record<string, unknown> = {};
  for (const [key, rawValue] of Object.entries(value)) {
    const normalizedKey = normalizeSchemaKey(key);
    const canonical = aliases[normalizedKey] || byNormalizedName.get(normalizedKey);
    if (canonical && !byNormalizedName.has(normalizeSchemaKey(canonical))) continue;
    if (!canonical || rawValue === "" || rawValue === null) continue;
    row[canonical] = rawValue;
  }
  return row;
}

const parseOptionalIntString = (value: string): number | undefined => {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};
const parseOptionalNumberString = (value: string): number | undefined => {
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseRequiredIntString = (value: string): number => {
  const trimmed = value.trim();
  if (trimmed === "") return 0;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const accountTypeValues = ['asset', 'liability', 'equity', 'revenue', 'expense', 'cost of goods sold', 'operating expense', 'capital expenditure', 'other income', 'other expense'] as const;

const normalizeAccountType = (value: unknown): string => {
  if (typeof value !== 'string') return 'asset';

  const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ');
  const aliasMap: Record<string, string> = {
    'cogs': 'cost of goods sold',
    'cost of goods sold': 'cost of goods sold',
    'opex': 'operating expense',
    'operating expense': 'operating expense',
    'capex': 'capital expenditure',
    'capital expenditure': 'capital expenditure',
    'other income': 'other income',
    'other expense': 'other expense',
  };

  return aliasMap[normalized] ?? normalized;
};

const csvAccountTypeSchema = z.preprocess((value) => normalizeAccountType(value), z.enum(accountTypeValues));

export const normalizeClientImportRow = (value: unknown) => {
  if (!value || typeof value !== "object") return value;
  const row = value as Record<string, unknown>;
  const normalized: Record<string, unknown> = { ...row };
  const aliases: Record<string, string> = {
    company_name: "companyName",
    company: "companyName",
    client_name: "companyName",
    client_status: "status",
    status: "status",
  };
  for (const [key, rawValue] of Object.entries(row)) {
    const normalizedKey = key.trim().toLowerCase().replace(/[\s-]+/g, "_");
    const canonical = aliases[normalizedKey];
    if (canonical && normalized[canonical] === undefined) {
      normalized[canonical] = rawValue;
    }
  }
  for (const key of Object.keys(normalized)) {
    if (normalized[key] === null || normalized[key] === "") normalized[key] = undefined;
  }
  return normalized;
};

export const normalizeEmployeeImportRow = (value: unknown) => {
  if (!value || typeof value !== "object") return value;
  const row = value as Record<string, unknown>;
  const normalized: Record<string, unknown> = { ...row };
  const aliases: Record<string, string> = {
    employee_number: "employeeNumber",
    employee_id: "employeeNumber",
    employee_no: "employeeNumber",
    first_name: "firstName",
    last_name: "lastName",
    date_of_birth: "dateOfBirth",
    hire_date: "hireDate",
    date_of_hire: "hireDate",
    job_group_id: "jobGroupId",
    employment_type: "employmentType",
    bank_account_number: "bankAccountNumber",
    national_id: "nationalId",
  };
  for (const [key, rawValue] of Object.entries(row)) {
    const normalizedKey = key.trim().toLowerCase().replace(/[\s-]+/g, "_");
    const canonical = aliases[normalizedKey];
    if (canonical && normalized[canonical] === undefined) normalized[canonical] = rawValue;
  }
  for (const key of Object.keys(normalized)) {
    if (normalized[key] === null || normalized[key] === "") normalized[key] = undefined;
  }
  return normalized;
};

const clientImportRowSchema = z.preprocess(
  normalizeClientImportRow,
  z.object({
    companyName: z.string(),
    contactPerson: z.string().optional(),
    email: optionalEmail(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
    taxId: z.string().optional(),
    website: z.string().optional(),
    industry: z.string().optional(),
    status: z.enum(['active', 'inactive', 'prospect', 'archived']).optional(),
    businessType: z.string().optional(),
    registrationNumber: z.string().optional(),
    creditLimit: z.number().optional().or(z.string().transform(parseOptionalIntString)),
  }),
);

/**
 * CSV Import/Export Router
 * Handles template generation, CSV parsing, and module-specific imports
 */
export const csvImportExportRouter = router({
  listSchemaTables: createFeatureRestrictedProcedure("data:export")
    .query(async () => getTableRegistry().map((table) => ({
      key: table.key,
      label: table.label,
      columns: table.columns,
      requiredColumns: table.columns.filter((column) => column.required).map((column) => column.name),
      organizationColumn: table.organizationColumn,
    }))),

  generateTableTemplate: createFeatureRestrictedProcedure("data:export")
    .input(z.object({ table: z.string() }))
    .query(async ({ input }) => {
      const table = getRegisteredTable(input.table);
      if (!table) throw new TRPCError({ code: "NOT_FOUND", message: `Unknown schema table: ${input.table}` });
      const columns = getImportableColumns(table);
      return {
        table: table.key,
        label: table.label,
        columns,
        requiredColumns: columns.filter((column) => column.required).map((column) => column.name),
        content: `${columns.map((column) => csvEscape(column.name)).join(",")}\n`,
      };
    }),

  exportTable: createFeatureRestrictedProcedure("data:export")
    .input(z.object({ table: z.string(), limit: z.number().int().positive().max(100000).default(100000) }))
    .query(async ({ input, ctx }) => {
      const table = getRegisteredTable(input.table);
      if (!table) throw new TRPCError({ code: "NOT_FOUND", message: `Unknown schema table: ${input.table}` });
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      let rows: any[];
      try {
        rows = table.organizationColumn && ctx.user.organizationId
          ? await database.select().from(table.schema as any).where(eq((table.schema as any)[table.organizationColumn], ctx.user.organizationId)).limit(input.limit)
          : await database.select().from(table.schema as any).limit(input.limit);
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Failed to export ${table.key}: ${error}` });
      }
      const columns = getImportableColumns(table).map((column) => column.name);
      return {
        table: table.key,
        label: table.label,
        content: [columns.join(","), ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(","))].join("\n"),
        rowCount: rows.length,
      };
    }),

  importTable: createFeatureRestrictedProcedure("data:import")
    .input(z.object({
      table: z.string(),
      content: z.string().max(25_000_000),
      skipDuplicates: z.boolean().default(true),
      validateOnly: z.boolean().default(false),
    }))
    .mutation(async ({ input, ctx }) => {
      const table = getRegisteredTable(input.table);
      if (!table) throw new TRPCError({ code: "NOT_FOUND", message: `Unknown schema table: ${input.table}` });
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      const rows = csvGen.parseCSV(input.content);
      if (rows.length === 0) return { imported: 0, skipped: 0, errors: [] };

      const importableColumns = getImportableColumns(table);
      const columnNames = importableColumns.map((column) => column.name);
      const requiredColumns = importableColumns.filter((column) => column.required).map((column) => column.name);
      const headers = Object.keys(rows[0]);
      const missingHeaders = requiredColumns.filter((column) => !headers.some((header) => normalizeSchemaKey(header) === normalizeSchemaKey(column)));
      if (missingHeaders.length > 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Missing required columns for ${table.key}: ${missingHeaders.join(", ")}` });
      }

      const importRows = async (targetDatabase: any) => {
        const results = { imported: 0, skipped: 0, errors: [] as Array<{ row: number; message: string }> };
        const schemaColumns = getTableColumns(table.schema as any);
        const [liveColumnRows] = await targetDatabase.execute(`SHOW COLUMNS FROM \`${table.name.replace(/`/g, "") }\``);
        const liveColumns = new Set(
          (Array.isArray(liveColumnRows) ? liveColumnRows : []).map((column: any) => String(column.Field || column.field || ""))
        );
        for (let index = 0; index < rows.length; index++) {
          try {
            const normalized = normalizeGenericRow(rows[index], columnNames);
            if (!normalized.id) normalized.id = uuidv4();
            if (table.organizationColumn && ctx.user.organizationId && !normalized[table.organizationColumn]) {
              normalized[table.organizationColumn] = ctx.user.organizationId;
            }
            delete normalized.createdAt;
            delete normalized.updatedAt;
            for (const key of Object.keys(normalized)) {
              if (!(key in schemaColumns) || !liveColumns.has(key) || table.sensitiveColumns.includes(key)) delete normalized[key];
            }
            const missing = requiredColumns.filter((column) => normalized[column] === undefined);
            if (missing.length > 0) throw new Error(`Missing required values: ${missing.join(", ")}`);
            await targetDatabase.insert(table.schema).values(normalized);
            results.imported++;
          } catch (error: any) {
            if (input.skipDuplicates && /duplicate|unique/i.test(error?.message || "")) results.skipped++;
            else results.errors.push({ row: index + 2, message: error?.message || String(error) });
          }
        }
        return results;
      };

      if (!input.validateOnly) return importRows(database);

      const rollbackValidation = "CSV_IMPORT_VALIDATION_ROLLBACK";
      let validationResults = { imported: 0, skipped: 0, errors: [] as Array<{ row: number; message: string }> };
      try {
        await (database as any).transaction(async (transaction: any) => {
          validationResults = await importRows(transaction);
          throw new Error(rollbackValidation);
        });
      } catch (error: any) {
        if (error?.message !== rollbackValidation) throw error;
      }
      return {
        imported: 0,
        skipped: validationResults.skipped,
        errors: validationResults.errors,
        validated: rows.length,
        ready: validationResults.imported,
      };
    }),

  // Get list of available modules for import
  getAvailableModules: createFeatureRestrictedProcedure("data:export")
    .query(async () => {
      return csvGen.getAvailableModules();
    }),

  // Generate CSV template for a specific module
  generateTemplate: createFeatureRestrictedProcedure("data:export")
    .input(z.enum([
      'clients', 'employees', 'departments', 'jobGroups', 'products', 'services',
      'payments', 'accounts', 'bankAccounts', 'expenses', 'invoices', 'users'
    ]))
    .query(async ({ input }) => {
      try {
        const template = csvGen.generateCSVTemplate(input as csvGen.ModuleType);
        return {
          success: true,
          content: template,
          module: input,
          timestamp: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to generate template: ${error}`,
        });
      }
    }),

  // Import clients from CSV data
  importClients: createFeatureRestrictedProcedure("data:import")
    .input(z.object({
      data: z.array(clientImportRowSchema),
      skipDuplicates: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const results = {
        imported: 0,
        skipped: 0,
        errors: [] as Array<{ row: number; field?: string; message: string }>,
        batchId: uuidv4(),
      };
      for (let idx = 0; idx < input.data.length; idx++) {
        const row = idx + 1; // CSV row number (1-indexed)
        const clientData = input.data[idx];

        try {
          // Validate required fields
          if (!clientData.companyName || clientData.companyName.trim() === '') {
            results.errors.push({ row, field: 'companyName', message: 'Company name is required' });
            results.skipped++;
            continue;
          }

          // Check for duplicates
          if (input.skipDuplicates && clientData.email) {
            const existing = await database
              .select()
              .from(clients)
              .where(eq(clients.email, clientData.email));
            
            if (existing.length > 0) {
              results.skipped++;
              continue;
            }
          }

          const id = uuidv4();
          await database.insert(clients).values({
            id,
            companyName: clientData.companyName,
            contactPerson: clientData.contactPerson || null,
            email: clientData.email || null,
            phone: clientData.phone || null,
            address: clientData.address || null,
            city: clientData.city || null,
            country: clientData.country || null,
            postalCode: clientData.postalCode || null,
            taxId: clientData.taxId || null,
            website: clientData.website || null,
            industry: clientData.industry || null,
            status: clientData.status || 'active',
            businessType: clientData.businessType || null,
            registrationNumber: clientData.registrationNumber || null,
            creditLimit: clientData.creditLimit ? parseInt(clientData.creditLimit.toString()) : null,
            createdBy: ctx.user.id,
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          } as any);

          results.imported++;
        } catch (error) {
          results.errors.push({
            row,
            message: `Failed to import client: ${error}`,
          });
        }
      }

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "csv_import_clients",
        entityType: "client",
        entityId: "bulk",
        description: `Imported ${results.imported} clients via CSV (skipped: ${results.skipped})`,
      });

      return results;
    }),

  // Import employees from CSV data
  importEmployees: createFeatureRestrictedProcedure("data:import")
    .input(z.object({
      data: z.array(z.preprocess(normalizeEmployeeImportRow, z.object({
        employeeNumber: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        email: optionalEmail(),
        phone: z.string().optional(),
        dateOfBirth: z.string().optional(),
        hireDate: z.string(),
        department: z.string().optional(),
        position: z.string().optional(),
        jobGroupId: z.string().optional(),
        salary: z.number().optional().or(z.string().transform(parseOptionalNumberString)),
        employmentType: z.enum(['full_time', 'part_time', 'contract', 'intern']).optional(),
        status: z.enum(['active', 'on_leave', 'terminated', 'suspended']).optional(),
        address: z.string().optional(),
        nationalId: z.string().optional(),
        bankAccountNumber: z.string().optional(),
        taxId: z.string().optional(),
      }))),
      skipDuplicates: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const results = {
        imported: 0,
        skipped: 0,
        errors: [] as Array<{ row: number; field?: string; message: string }>,
        batchId: uuidv4(),
      };
      for (let idx = 0; idx < input.data.length; idx++) {
        const row = idx + 1;
        const empData = input.data[idx];

        try {
          // Validate required fields
          if (!empData.employeeNumber || empData.employeeNumber.trim() === '') {
            results.errors.push({ row, field: 'employeeNumber', message: 'Employee number is required' });
            results.skipped++;
            continue;
          }
          if (!empData.firstName || empData.firstName.trim() === '') {
            results.errors.push({ row, field: 'firstName', message: 'First name is required' });
            results.skipped++;
            continue;
          }
          if (!empData.lastName || empData.lastName.trim() === '') {
            results.errors.push({ row, field: 'lastName', message: 'Last name is required' });
            results.skipped++;
            continue;
          }
          if (!empData.hireDate || empData.hireDate.trim() === '') {
            results.errors.push({ row, field: 'hireDate', message: 'Hire date is required' });
            results.skipped++;
            continue;
          }

          // Check for duplicates
          if (input.skipDuplicates) {
            const existing = await database
              .select()
              .from(employees)
              .where(eq(employees.employeeNumber, empData.employeeNumber));
            
            if (existing.length > 0) {
              results.skipped++;
              continue;
            }
          }

          const id = uuidv4();
          await database.insert(employees).values({
            id,
            organizationId: ctx.user.organizationId ?? null,
            employeeNumber: empData.employeeNumber,
            firstName: empData.firstName,
            lastName: empData.lastName,
            email: empData.email || null,
            phone: empData.phone || null,
            dateOfBirth: empData.dateOfBirth ? new Date(empData.dateOfBirth).toISOString() : null,
            hireDate: new Date(empData.hireDate).toISOString(),
            department: empData.department || null,
            position: empData.position || null,
            jobGroupId: empData.jobGroupId || uuidv4(), // Default job group
            salary: empData.salary ? Number(empData.salary) : 0,
            employmentType: empData.employmentType || 'full_time',
            status: empData.status || 'active',
            address: empData.address || null,
            nationalId: empData.nationalId || null,
            bankAccountNumber: empData.bankAccountNumber || null,
            taxId: empData.taxId || null,
            createdBy: ctx.user.id,
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          } as any);

          results.imported++;
        } catch (error) {
          results.errors.push({
            row,
            message: `Failed to import employee: ${error}`,
          });
        }
      }

      await db.logActivity({
        userId: ctx.user.id,
        action: "csv_import_employees",
        entityType: "employee",
        entityId: "bulk",
        description: `Imported ${results.imported} employees via CSV`,
      });

      return results;
    }),

  // Import products from CSV data
  importProducts: createFeatureRestrictedProcedure("data:import")
    .input(z.object({
      data: z.array(z.object({
        name: z.string().optional(),
        productName: z.string().optional(),
        sku: z.string().optional(),
        productCode: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        unitPrice: z.number().optional().or(z.string().transform(parseRequiredIntString)),
        unit_price: z.number().optional().or(z.string().transform(parseRequiredIntString)),
        taxRate: z.number().optional().or(z.string().transform(parseOptionalIntString)),
        tax_rate: z.number().optional().or(z.string().transform(parseOptionalIntString)),
        costPrice: z.number().optional().or(z.string().transform(parseOptionalIntString)),
        minStockLevel: z.number().optional().or(z.string().transform(parseOptionalIntString)),
        maxStockLevel: z.number().optional().or(z.string().transform(parseOptionalIntString)),
        location: z.string().optional(),
        unit: z.string().optional(),
        stockQuantity: z.number().optional().or(z.string().transform(parseOptionalIntString)),
        stock_quantity: z.number().optional().or(z.string().transform(parseOptionalIntString)),
        reorderLevel: z.number().optional().or(z.string().transform(parseOptionalIntString)),
        reorder_level: z.number().optional().or(z.string().transform(parseOptionalIntString)),
        supplier: z.string().optional(),
        status: z.enum(['active', 'inactive', 'discontinued']).optional(),
        isActive: z.boolean().optional().or(z.string().transform(v => v === 'true')),
        is_active: z.boolean().optional().or(z.string().transform(v => v === 'true')),
      })),
      skipDuplicates: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const results = {
        imported: 0,
        skipped: 0,
        errors: [] as Array<{ row: number; field?: string; message: string }>,
        batchId: uuidv4(),
      };

      for (let idx = 0; idx < input.data.length; idx++) {
        const row = idx + 1;
        const prodData = input.data[idx];
        const normalizedName = prodData.name || prodData.productName || '';
        const normalizedSku = prodData.sku || prodData.productCode || '';
        const normalizedUnitPrice = prodData.unitPrice ?? prodData.unit_price ?? 0;
        const normalizedTaxRate = prodData.taxRate ?? prodData.tax_rate ?? 0;
        const normalizedStockQuantity = prodData.stockQuantity ?? prodData.stock_quantity ?? 0;
        const normalizedReorderLevel = prodData.reorderLevel ?? prodData.reorder_level ?? 0;

        try {
          if (!normalizedName || normalizedName.trim() === '') {
            results.errors.push({ row, field: 'name', message: 'Product name is required' });
            results.skipped++;
            continue;
          }

          if (input.skipDuplicates && normalizedSku) {
            const existing = await database.select().from(products).where(eq(products.sku, normalizedSku));
            if (existing.length > 0) {
              results.skipped++;
              continue;
            }
          }

          const id = uuidv4();
          await database.insert(products).values({
            id,
            organizationId: ctx.user.organizationId ?? null,
            name: normalizedName,
            sku: normalizedSku || null,
            description: prodData.description || null,
            category: prodData.category || null,
            unitPrice: Number(normalizedUnitPrice),
            taxRate: Number(normalizedTaxRate || 0),
            costPrice: Number(prodData.costPrice || 0),
            stockQuantity: Number(normalizedStockQuantity || 0),
            minStockLevel: Number(prodData.minStockLevel || 0),
            maxStockLevel: Number(prodData.maxStockLevel || 0),
            unit: prodData.unit || 'pcs',
            isActive: prodData.isActive ?? prodData.is_active ?? true ? 1 : 0,
            supplier: prodData.supplier || null,
            location: prodData.location || null,
            reorderLevel: Number(normalizedReorderLevel || 0),
            createdBy: ctx.user.id,
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          } as any);

          results.imported++;
        } catch (error) {
          results.errors.push({
            row,
            message: `Failed to import product: ${error}`,
          });
        }
      }

      await db.logActivity({
        userId: ctx.user.id,
        action: "csv_import_products",
        entityType: "product",
        entityId: "bulk",
        description: `Imported ${results.imported} products via CSV`,
      });

      return results;
    }),

  // Import accounts (Chart of Accounts) from CSV data
  importAccounts: createFeatureRestrictedProcedure("data:import")
    .input(z.object({
      data: z.array(z.object({
        // Support both camelCase and snake_case field names for flexibility
        accountCode: z.string().optional(),
        account_code: z.string().optional(),
        accountName: z.string().optional(),
        account_name: z.string().optional(),
        accountType: csvAccountTypeSchema.optional(),
        account_type: csvAccountTypeSchema.optional(),
        parentAccountCode: z.string().optional(),
        parent_account_code: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        isActive: z.boolean().optional().or(z.string().transform(v => v === 'true')),
        is_header_account: z.boolean().optional().or(z.string().transform(v => v === 'true')),
      })),
      skipDuplicates: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const results = {
        imported: 0,
        skipped: 0,
        errors: [] as Array<{ row: number; field?: string; message: string }>,
        batchId: uuidv4(),
      };
      const accountScope = ctx.user.organizationId
        ? eq(accounts.organizationId, ctx.user.organizationId)
        : isNull(accounts.organizationId);

      for (let idx = 0; idx < input.data.length; idx++) {
        const row = idx + 1;
        const rawData = input.data[idx];

        try {
          // Normalize field names (support both camelCase and snake_case)
          const accountTypeValue = rawData.accountType ?? rawData.account_type ?? 'asset';
          const normalizedAccountType = normalizeAccountType(rawData.accountType ?? rawData.account_type ?? 'asset');
          const accData = {
            accountCode: rawData.accountCode || rawData.account_code || '',
            accountName: rawData.accountName || rawData.account_name || '',
            accountType: normalizedAccountType,
            parentAccountCode: rawData.parentAccountCode || rawData.parent_account_code,
            description: rawData.description || null,
            category: rawData.category || null,
            isHeaderAccount: rawData.is_header_account || false,
          };

          if (!accData.accountCode || accData.accountCode.trim() === '') {
            results.errors.push({ row, field: 'account_code', message: 'Account code is required' });
            results.skipped++;
            continue;
          }
          if (!accData.accountName || accData.accountName.trim() === '') {
            results.errors.push({ row, field: 'account_name', message: 'Account name is required' });
            results.skipped++;
            continue;
          }

          if (input.skipDuplicates) {
            const existing = await database
              .select()
              .from(accounts)
              .where(and(eq(accounts.accountCode, accData.accountCode), accountScope));
            
            if (existing.length > 0) {
              results.skipped++;
              continue;
            }
          }

          // Look up parent account if specified
          let parentAccountId: string | null = null;
          if (accData.parentAccountCode) {
            const parentFromDb = await database
              .select()
              .from(accounts)
              .where(and(eq(accounts.accountCode, accData.parentAccountCode), accountScope));
            
            if (parentFromDb.length === 0) {
              results.errors.push({
                row,
                field: 'parent_account_code',
                message: `Parent account with code ${accData.parentAccountCode} not found`,
              });
              results.skipped++;
              continue;
            }
            parentAccountId = parentFromDb[0].id;
          }

          const id = uuidv4();

          await database.insert(accounts).values({
            id,
            organizationId: ctx.user.organizationId ?? null,
            accountCode: accData.accountCode,
            accountName: accData.accountName,
            accountType: accData.accountType as any,
            parentAccountId,
            description: accData.description,
            isActive: 1,
            balance: 0,
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          } as any);

          results.imported++;
        } catch (error) {
          results.errors.push({
            row,
            message: `Failed to import account: ${error}`,
          });
        }
      }

      await db.logActivity({
        userId: ctx.user.id,
        action: "csv_import_accounts",
        entityType: "account",
        entityId: "bulk",
        description: `Imported ${results.imported} accounts via CSV (skipped: ${results.skipped})`,
      });

      return results;
    }),

  // Import payments from CSV data
  importPayments: createFeatureRestrictedProcedure("data:import")
    .input(z.object({
      data: z.array(z.object({
        invoiceNumber: z.string(),
        clientName: z.string().optional(),
        amount: z.number().or(z.string().transform(parseRequiredIntString)),
        paymentDate: z.string(),
        paymentMethod: paymentModeSchema.optional(),
        reference: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(['pending', 'completed', 'cancelled']).optional(),
      })),
      skipDuplicates: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const results = {
        imported: 0,
        skipped: 0,
        errors: [] as Array<{ row: number; field?: string; message: string }>,
        batchId: uuidv4(),
      };

      for (let idx = 0; idx < input.data.length; idx++) {
        const row = idx + 1;
        const payData = input.data[idx];

        try {
          if (!payData.invoiceNumber || payData.invoiceNumber.trim() === '') {
            results.errors.push({ row, field: 'invoiceNumber', message: 'Invoice number is required' });
            results.skipped++;
            continue;
          }

          if (!payData.amount || payData.amount <= 0) {
            results.errors.push({ row, field: 'amount', message: 'Amount must be greater than 0' });
            results.skipped++;
            continue;
          }

          const id = uuidv4();
          await database.insert(payments).values({
            id,
            invoiceNumber: payData.invoiceNumber,
            amount: parseInt(payData.amount.toString()),
            paymentDate: new Date(payData.paymentDate).toISOString().replace('T', ' ').substring(0, 19),
            paymentMethod: payData.paymentMethod || 'bank_transfer',
            reference: payData.reference || null,
            description: payData.description || null,
            status: payData.status || 'completed',
            createdBy: ctx.user.id,
            createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          } as any);

          results.imported++;
        } catch (error) {
          results.errors.push({
            row,
            message: `Failed to import payment: ${error}`,
          });
        }
      }

      await db.logActivity({
        userId: ctx.user.id,
        action: "csv_import_payments",
        entityType: "payment",
        entityId: "bulk",
        description: `Imported ${results.imported} payments via CSV`,
      });

      return results;
    }),
});
