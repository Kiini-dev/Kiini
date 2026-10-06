/**
 * Advanced Search & Filtering Router
 * 
 * Provides unified search, filtering, and sorting capabilities across all modules
 */

import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  clients,
  invoices,
  expenses,
  payments,
  projects,
  products,
  services,
  employees,
} from "../../drizzle/schema";
import { like, and, or, eq, gte, lte } from "drizzle-orm";

export const searchRouter = router({
  /**
   * Global search across multiple modules
   */
  global: createFeatureRestrictedProcedure("search:use")
    .input(
      z.object({
        query: z.string().min(1),
        modules: z.array(z.enum(["clients", "invoices", "expenses", "projects", "products"])).optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const searchTerm = `%${input.query}%`;
      const results: any[] = [];

      // Search clients
      if (!input.modules || input.modules.includes("clients")) {
        const clientResults = await db
          .select()
          .from(clients)
          .where(
            or(
              like(clients.companyName, searchTerm),
              like(clients.email, searchTerm),
              like(clients.phone, searchTerm)
            )
          )
          .limit(input.limit);
        results.push(
          ...clientResults.map((c) => ({
            type: "client",
            id: c.id,
            title: c.companyName,
            description: c.email,
            data: c,
          }))
        );
      }

      // Search invoices
      if (!input.modules || input.modules.includes("invoices")) {
        const invoiceResults = await db
          .select()
          .from(invoices)
          .where(like(invoices.invoiceNumber, searchTerm))
          .limit(input.limit);
        results.push(
          ...invoiceResults.map((inv) => ({
            type: "invoice",
            id: inv.id,
            title: inv.invoiceNumber,
            description: `Amount: ${inv.total}`,
            data: inv,
          }))
        );
      }

      // Search projects
      if (!input.modules || input.modules.includes("projects")) {
        const projectResults = await db
          .select()
          .from(projects)
          .where(like(projects.name, searchTerm))
          .limit(input.limit);
        results.push(
          ...projectResults.map((p) => ({
            type: "project",
            id: p.id,
            title: p.name,
            description: p.description || "",
            data: p,
          }))
        );
      }

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
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [];

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
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [];

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
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [];

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
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [];

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
