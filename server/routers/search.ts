/**
 * Advanced Search & Filtering Router
 * 
 * Provides unified search, filtering, and sorting capabilities across all modules
 */

import { router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { resolveUserPermission } from "../middleware/enhancedRbac";
import { TRPCError } from "@trpc/server";
import {
  clients,
  contacts,
  contracts,
  estimates,
  invoices,
  expenses,
  payments,
  projects,
  projectTasks,
  products,
  services,
  employees,
  proposals,
  orders,
  lpos,
} from "../../drizzle/schema";
import { suppliers } from "../../drizzle/schema-extended";
import { like, and, or, eq, gte, lte, isNull } from "drizzle-orm";

function workspaceCondition(column: any, organizationId: string | null | undefined) {
  return organizationId ? eq(column, organizationId) : isNull(column);
}

function searchPermissionFeatures(organizationId: string | null | undefined, resource: string) {
  if (!organizationId) return [`${resource}:view`, `${resource}:read`];
  const organizationFeatures: Record<string, string[]> = {
    clients: ["org:clients:view", "org:clients:read", "clients:view", "clients:read"],
    contacts: ["org:clients:view", "clients:view"],
    invoices: ["org:accounting:invoices:view", "accounting:invoices:view"],
    estimates: ["org:accounting:estimates:view", "accounting:estimates:view"],
    expenses: ["org:accounting:expenses:view", "accounting:expenses:view"],
    payments: ["org:accounting:payments:view", "accounting:payments:view"],
    projects: ["org:projects:view", "projects:view"],
    projectTasks: ["org:projects:view", "projects:view"],
    products: ["org:products:view", "products:view"],
    services: ["org:services:view", "services:view"],
    employees: ["org:employees:read", "org:hr:employees:view", "employees:read"],
    proposals: ["org:proposals:view", "proposals:view"],
    contracts: ["org:contracts:view", "contracts:view"],
    suppliers: ["org:procurement:suppliers:view", "suppliers:view"],
    orders: ["org:procurement:orders:view", "orders:view"],
    lpos: ["org:procurement:lpos:view", "lpos:view"],
  };
  return organizationFeatures[resource] ?? [`org:${resource}:view`, `${resource}:view`];
}

async function hasSearchResourceAccess(
  user: {
    id: string;
    role: string;
    organizationId?: string | null;
    effectiveRole?: string | null;
    customRoleId?: string | null;
  },
  resource: string,
) {
  const role = (user.effectiveRole || user.role) as any;
  for (const feature of searchPermissionFeatures(user.organizationId, resource)) {
    if (await resolveUserPermission(user.id, role, user.customRoleId, feature)) return true;
  }
  return false;
}

async function requireSearchResourceAccess(
  user: Parameters<typeof hasSearchResourceAccess>[0],
  resource: string,
) {
  if (!await hasSearchResourceAccess(user, resource)) {
    throw new TRPCError({ code: "FORBIDDEN", message: `You do not have permission to search ${resource}.` });
  }
}

export const searchRouter = router({
  /**
   * Global search across multiple modules
   */
  global: createFeatureRestrictedProcedure("search:use")
    .input(
      z.object({
        query: z.string().trim().min(2).max(100),
        limit: z.number().int().min(1).max(50).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const searchTerm = `%${input.query.trim()}%`;
      const organizationId = ctx.user.organizationId ?? null;
      const enabledResources = await Promise.all(
        [
          "clients", "contacts", "invoices", "estimates", "expenses", "payments",
          "projects", "projectTasks", "products", "services", "employees",
          "proposals", "contracts", "suppliers", "orders", "lpos",
        ].map(async (resource) => {
          return await hasSearchResourceAccess(ctx.user, resource) ? resource : null;
        }),
      );
      const allowed = new Set(enabledResources.filter((resource): resource is string => resource !== null));
      const searches: Array<Promise<any[]>> = [];
      const addResults = (
        resource: string,
        query: Promise<any[]>,
        mapResult: (row: any) => any,
      ) => {
        if (allowed.has(resource)) {
          searches.push(query.then((rows) => rows.map(mapResult)));
        }
      };
      const take = input.limit;

      addResults("clients", db.select({
        id: clients.id,
        name: clients.companyName,
        email: clients.email,
        phone: clients.phone,
      })
          .from(clients)
          .where(and(
            workspaceCondition(clients.organizationId, organizationId),
            or(
              like(clients.companyName, searchTerm),
              like(clients.email, searchTerm),
              like(clients.phone, searchTerm)
            ),
          ))
          .limit(take),
      (row) => ({ type: "client", id: row.id, title: row.name, description: row.email || row.phone, href: `/clients/${row.id}` }));

      addResults("contacts", db.select({
        id: contacts.id,
        firstName: contacts.firstName,
        lastName: contacts.lastName,
        email: contacts.email,
        jobTitle: contacts.jobTitle,
      })
        .from(contacts)
        .where(and(
          workspaceCondition(contacts.organizationId, organizationId),
          or(
            like(contacts.firstName, searchTerm),
            like(contacts.lastName, searchTerm),
            like(contacts.email, searchTerm),
            like(contacts.phone, searchTerm),
            like(contacts.jobTitle, searchTerm),
          ),
        ))
        .limit(take),
      (row) => ({ type: "contact", id: row.id, title: `${row.firstName} ${row.lastName}`.trim(), description: row.jobTitle || row.email, href: `/contacts/${row.id}` }));

      addResults("invoices", db.select({
        id: invoices.id,
        name: invoices.invoiceNumber,
        title: invoices.title,
        status: invoices.status,
      })
          .from(invoices)
          .where(and(
            workspaceCondition(invoices.organizationId, organizationId),
            or(like(invoices.invoiceNumber, searchTerm), like(invoices.title, searchTerm)),
          ))
          .limit(take),
      (row) => ({ type: "invoice", id: row.id, title: row.title || row.name, description: `${row.name} · ${row.status}`, href: `/invoices/${row.id}` }));

      addResults("estimates", db.select({
        id: estimates.id,
        name: estimates.estimateNumber,
        title: estimates.title,
        status: estimates.status,
      })
        .from(estimates)
        .where(and(
          workspaceCondition(estimates.organizationId, organizationId),
          or(like(estimates.estimateNumber, searchTerm), like(estimates.title, searchTerm)),
        ))
        .limit(take),
      (row) => ({ type: "estimate", id: row.id, title: row.title || row.name, description: `${row.name} · ${row.status}`, href: `/estimates/${row.id}` }));

      addResults("expenses", db.select({
        id: expenses.id,
        name: expenses.expenseNumber,
        vendor: expenses.vendor,
        description: expenses.description,
        status: expenses.status,
      })
        .from(expenses)
        .where(and(
          workspaceCondition(expenses.organizationId, organizationId),
          or(
            like(expenses.expenseNumber, searchTerm),
            like(expenses.vendor, searchTerm),
            like(expenses.description, searchTerm),
          ),
        ))
        .limit(take),
      (row) => ({ type: "expense", id: row.id, title: row.name || row.vendor || "Expense", description: row.description || row.status, href: `/expenses/${row.id}` }));

      addResults("payments", db.select({
        id: payments.id,
        referenceNumber: payments.referenceNumber,
        notes: payments.notes,
        status: payments.status,
      })
        .from(payments)
        .where(and(
          workspaceCondition(payments.organizationId, organizationId),
          or(like(payments.referenceNumber, searchTerm), like(payments.notes, searchTerm)),
        ))
        .limit(take),
      (row) => ({ type: "payment", id: row.id, title: row.referenceNumber || "Payment", description: row.notes || row.status, href: `/payments/${row.id}` }));

      addResults("projects", db.select({
        id: projects.id,
        name: projects.name,
        projectNumber: projects.projectNumber,
        description: projects.description,
        status: projects.status,
      })
          .from(projects)
          .where(and(
            workspaceCondition(projects.organizationId, organizationId),
            or(
              like(projects.name, searchTerm),
              like(projects.projectNumber, searchTerm),
              like(projects.description, searchTerm),
            ),
          ))
          .limit(take),
      (row) => ({ type: "project", id: row.id, title: row.name, description: `${row.projectNumber} · ${row.status}`, href: `/projects/${row.id}` }));

      addResults("projectTasks", db.select({
        id: projectTasks.id,
        title: projectTasks.title,
        description: projectTasks.description,
        status: projectTasks.status,
      })
        .from(projectTasks)
        .innerJoin(projects, eq(projectTasks.projectId, projects.id))
        .where(and(
          workspaceCondition(projects.organizationId, organizationId),
          or(like(projectTasks.title, searchTerm), like(projectTasks.description, searchTerm)),
        ))
        .limit(take),
      (row) => ({ type: "task", id: row.id, title: row.title, description: row.description || row.status, href: `/tasks/${row.id}` }));

      addResults("products", db.select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        description: products.description,
      })
        .from(products)
        .where(and(
          workspaceCondition(products.organizationId, organizationId),
          or(
            like(products.name, searchTerm),
            like(products.sku, searchTerm),
            like(products.description, searchTerm),
            like(products.barcode, searchTerm),
          ),
        ))
        .limit(take),
      (row) => ({ type: "product", id: row.id, title: row.name, description: row.sku || row.description, href: `/products/${row.id}` }));

      addResults("services", db.select({
        id: services.id,
        name: services.name,
        category: services.category,
        description: services.description,
      })
        .from(services)
        .where(and(
          workspaceCondition(services.organizationId, organizationId),
          or(like(services.name, searchTerm), like(services.category, searchTerm), like(services.description, searchTerm)),
        ))
        .limit(take),
      (row) => ({ type: "service", id: row.id, title: row.name, description: row.category || row.description, href: `/services/${row.id}` }));

      addResults("employees", db.select({
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        employeeNumber: employees.employeeNumber,
        email: employees.email,
        position: employees.position,
      })
        .from(employees)
        .where(and(
          workspaceCondition(employees.organizationId, organizationId),
          or(
            like(employees.firstName, searchTerm),
            like(employees.lastName, searchTerm),
            like(employees.employeeNumber, searchTerm),
            like(employees.email, searchTerm),
            like(employees.position, searchTerm),
          ),
        ))
        .limit(take),
      (row) => ({ type: "employee", id: row.id, title: `${row.firstName} ${row.lastName}`, description: `${row.employeeNumber} · ${row.position || row.email || ""}`, href: `/employees/${row.id}` }));

      addResults("proposals", db.select({
        id: proposals.id,
        proposalNumber: proposals.proposalNumber,
        title: proposals.title,
        description: proposals.description,
        status: proposals.status,
      })
        .from(proposals)
        .where(and(
          workspaceCondition(proposals.organizationId, organizationId),
          or(
            like(proposals.proposalNumber, searchTerm),
            like(proposals.title, searchTerm),
            like(proposals.description, searchTerm),
          ),
        ))
        .limit(take),
      (row) => ({ type: "proposal", id: row.id, title: row.title || row.proposalNumber, description: `${row.proposalNumber} · ${row.status}`, href: `/proposals/${row.id}` }));

      addResults("contracts", db.select({
        id: contracts.id,
        contractNumber: contracts.contractNumber,
        name: contracts.name,
        vendor: contracts.vendor,
        status: contracts.status,
      })
        .from(contracts)
        .where(and(
          workspaceCondition(contracts.organizationId, organizationId),
          or(
            like(contracts.contractNumber, searchTerm),
            like(contracts.name, searchTerm),
            like(contracts.vendor, searchTerm),
          ),
        ))
        .limit(take),
      (row) => ({ type: "contract", id: row.id, title: row.name, description: `${row.contractNumber || "Contract"} · ${row.vendor} · ${row.status}`, href: `/contracts/${row.id}` }));

      addResults("suppliers", db.select({
        id: suppliers.id,
        companyName: suppliers.companyName,
        supplierNumber: suppliers.supplierNumber,
        email: suppliers.email,
        phone: suppliers.phone,
      })
        .from(suppliers)
        .where(and(
          workspaceCondition(suppliers.organizationId, organizationId),
          or(
            like(suppliers.companyName, searchTerm),
            like(suppliers.supplierNumber, searchTerm),
            like(suppliers.email, searchTerm),
            like(suppliers.phone, searchTerm),
          ),
        ))
        .limit(take),
      (row) => ({ type: "supplier", id: row.id, title: row.companyName, description: row.supplierNumber || row.email || row.phone, href: `/suppliers/${row.id}` }));

      addResults("orders", db.select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
      })
        .from(orders)
        .where(and(
          workspaceCondition(orders.organizationId, organizationId),
          like(orders.orderNumber, searchTerm),
        ))
        .limit(take),
      (row) => ({ type: "order", id: row.id, title: row.orderNumber, description: row.status, href: `/orders/${row.id}` }));

      addResults("lpos", db.select({
        id: lpos.id,
        lpoNumber: lpos.lpoNumber,
        status: lpos.status,
      })
        .from(lpos)
        .where(and(
          workspaceCondition(lpos.organizationId, organizationId),
          like(lpos.lpoNumber, searchTerm),
        ))
        .limit(take),
      (row) => ({ type: "lpo", id: row.id, title: row.lpoNumber, description: row.status, href: `/lpos/${row.id}` }));

      const results = (await Promise.all(searches)).flat();
      return results.slice(0, input.limit);
    }),

  /**
   * Advanced filtering for clients
   */
  clients: createFeatureRestrictedProcedure("search:use")
    .input(
      z.object({
        search: z.string().optional(),
        status: z.enum(["active", "inactive", "prospect", "archived"]).optional(),
        country: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      await requireSearchResourceAccess(ctx.user, "clients");
      const db = await getDb();
      if (!db) return [];

      const conditions = [workspaceCondition(clients.organizationId, ctx.user.organizationId)];

      if (input.search) {
        conditions.push(
          or(
            like(clients.companyName, `%${input.search}%`),
            like(clients.email, `%${input.search}%`)
          )
        );
      }

      if (input.status) {
        conditions.push(eq(clients.status, input.status));
      }

      if (input.country) {
        conditions.push(eq(clients.country, input.country));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      return await db
        .select()
        .from(clients)
        .where(whereClause)
        .limit(input.limit)
        .offset(input.offset);
    }),

  /**
   * Advanced filtering for invoices
   */
  invoices: createFeatureRestrictedProcedure("search:use")
    .input(
      z.object({
        search: z.string().optional(),
        status: z.enum(["draft", "sent", "paid", "partial", "overdue", "cancelled"]).optional(),
        minAmount: z.number().optional(),
        maxAmount: z.number().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        clientId: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      await requireSearchResourceAccess(ctx.user, "invoices");
      const db = await getDb();
      if (!db) return [];

      const conditions = [workspaceCondition(invoices.organizationId, ctx.user.organizationId)];

      if (input.search) {
        conditions.push(like(invoices.invoiceNumber, `%${input.search}%`));
      }

      if (input.status) {
        conditions.push(eq(invoices.status, input.status));
      }

      if (input.minAmount) {
        conditions.push(gte(invoices.total, input.minAmount));
      }

      if (input.maxAmount) {
        conditions.push(lte(invoices.total, input.maxAmount));
      }

      if (input.clientId) {
        conditions.push(eq(invoices.clientId, input.clientId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      return await db
        .select()
        .from(invoices)
        .where(whereClause)
        .limit(input.limit)
        .offset(input.offset);
    }),

  /**
   * Advanced filtering for expenses
   */
  expenses: createFeatureRestrictedProcedure("search:use")
    .input(
      z.object({
        search: z.string().optional(),
        category: z.string().optional(),
        status: z.enum(["pending", "approved", "rejected", "paid"]).optional(),
        minAmount: z.number().optional(),
        maxAmount: z.number().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      await requireSearchResourceAccess(ctx.user, "expenses");
      const db = await getDb();
      if (!db) return [];

      const conditions = [workspaceCondition(expenses.organizationId, ctx.user.organizationId)];

      if (input.search) {
        conditions.push(
          or(
            like(expenses.vendor, `%${input.search}%`),
            like(expenses.description, `%${input.search}%`)
          )
        );
      }

      if (input.category) {
        conditions.push(eq(expenses.category, input.category));
      }

      if (input.status) {
        conditions.push(eq(expenses.status, input.status));
      }

      if (input.minAmount) {
        conditions.push(gte(expenses.amount, input.minAmount));
      }

      if (input.maxAmount) {
        conditions.push(lte(expenses.amount, input.maxAmount));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      return await db
        .select()
        .from(expenses)
        .where(whereClause)
        .limit(input.limit)
        .offset(input.offset);
    }),

  /**
   * Advanced filtering for projects
   */
  projects: createFeatureRestrictedProcedure("search:use")
    .input(
      z.object({
        search: z.string().optional(),
        status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        clientId: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      await requireSearchResourceAccess(ctx.user, "projects");
      const db = await getDb();
      if (!db) return [];

      const conditions = [workspaceCondition(projects.organizationId, ctx.user.organizationId)];

      if (input.search) {
        conditions.push(like(projects.name, `%${input.search}%`));
      }

      if (input.status) {
        conditions.push(eq(projects.status, input.status));
      }

      if (input.priority) {
        conditions.push(eq(projects.priority, input.priority));
      }

      if (input.clientId) {
        conditions.push(eq(projects.clientId, input.clientId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      return await db
        .select()
        .from(projects)
        .where(whereClause)
        .limit(input.limit)
        .offset(input.offset);
    }),
});
