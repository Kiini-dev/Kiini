import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  clients,
  estimateItems,
  estimates,
  invoiceItems,
  invoices,
  payments,
  projects,
  receipts,
  settings,
  services,
  serviceInvoiceItems,
  serviceInvoices,
} from "../../drizzle/schema";
import { eq, sql, and, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import * as db from "../db";

const defaultServiceUnits = [
  "hour",
  "day",
  "week",
  "month",
  "project",
  "unit",
  "item",
  "service",
];

const parseSettingsOptionValues = (value: unknown): string[] => {
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => {
        if (typeof entry === "string") return entry.trim();
        if (entry && typeof entry === "object") {
          const candidate = (entry as any).name ?? (entry as any).value ?? (entry as any).label;
          return typeof candidate === "string" ? candidate.trim() : "";
        }
        return "";
      })
      .filter((entry): entry is string => Boolean(entry));
  } catch {
    return [];
  }
};

const getConfiguredServiceUnits = async (): Promise<string[]> => {
  const database = await getDb();
  if (!database) return [];

  const rows = await database.select().from(settings).where(inArray(settings.category, ["service_units", "product_units", "uom", "unit_of_measure", "units"]));
  const configured = new Set<string>();

  for (const row of rows) {
    if (!row.key || !row.value) continue;
    const parsedValues = parseSettingsOptionValues(row.value);
    for (const value of parsedValues) {
      configured.add(value);
    }
  }

  return Array.from(configured);
};

export const servicesRouter = router({
  list: protectedProcedure
    .input(z.object({
      limit: z.number().optional(),
      offset: z.number().optional(),
      category: z.string().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) return [];

      const orgId = ctx.user.organizationId;
      let query: any;

      if (orgId && input?.category) {
        query = database.select().from(services).where(and(eq(services.organizationId, orgId), eq(services.category, input.category)));
      } else if (orgId) {
        query = database.select().from(services).where(eq(services.organizationId, orgId));
      } else if (input?.category) {
        query = database.select().from(services).where(eq(services.category, input.category));
      } else {
        query = database.select().from(services);
      }

      return await query.limit(input?.limit || 100).offset(input?.offset || 0);
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) return null;
      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(services.id, input), eq(services.organizationId, orgId)) : eq(services.id, input);
      const result = await database.select().from(services).where(where).limit(1);
      const service = result[0] || null;
      if (service && service.deliverables && typeof service.deliverables === "string") {
        try {
          (service as any).deliverables = JSON.parse(service.deliverables);
        } catch {
          (service as any).deliverables = [service.deliverables];
        }
      }
      return service;
    }),

  getUsageSummary: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) return null;

      const orgId = ctx.user.organizationId;
      const serviceWhere = orgId
        ? and(eq(services.id, input), eq(services.organizationId, orgId))
        : eq(services.id, input);
      const [service] = await database.select().from(services).where(serviceWhere).limit(1);
      if (!service) return null;

      const invoiceConditions: any[] = [
        eq(invoiceItems.itemType, "service"),
        eq(invoiceItems.itemId, input),
      ];
      if (orgId) invoiceConditions.push(eq(invoices.organizationId, orgId));
      const invoiceRows = await database.select({
        documentId: invoices.id,
        documentNumber: invoices.invoiceNumber,
        clientId: invoices.clientId,
        clientName: clients.companyName,
        status: invoices.status,
        date: invoices.issueDate,
        projectId: invoices.projectId,
        projectName: projects.name,
        quantity: invoiceItems.quantity,
        amount: invoiceItems.total,
      }).from(invoiceItems)
        .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
        .leftJoin(clients, eq(invoices.clientId, clients.id))
        .leftJoin(projects, eq(invoices.projectId, projects.id))
        .where(and(...invoiceConditions));

      const estimateConditions: any[] = [
        eq(estimateItems.itemType, "service"),
        eq(estimateItems.itemId, input),
      ];
      if (orgId) estimateConditions.push(eq(estimates.organizationId, orgId));
      const estimateRows = await database.select({
        documentId: estimates.id,
        documentNumber: estimates.estimateNumber,
        clientId: estimates.clientId,
        clientName: clients.companyName,
        status: estimates.status,
        date: estimates.issueDate,
        projectId: estimates.projectId,
        projectName: projects.name,
        quantity: estimateItems.quantity,
        amount: estimateItems.total,
      }).from(estimateItems)
        .innerJoin(estimates, eq(estimateItems.estimateId, estimates.id))
        .leftJoin(clients, eq(estimates.clientId, clients.id))
        .leftJoin(projects, eq(estimates.projectId, projects.id))
        .where(and(...estimateConditions));

      const serviceInvoiceConditions: any[] = [eq(serviceInvoiceItems.serviceId, input)];
      if (orgId) serviceInvoiceConditions.push(eq(serviceInvoices.organizationId, orgId));
      const serviceInvoiceRows = await database.select({
        documentId: serviceInvoices.id,
        documentNumber: serviceInvoices.serviceInvoiceNumber,
        clientId: serviceInvoices.clientId,
        clientName: serviceInvoices.clientName,
        status: serviceInvoices.status,
        date: serviceInvoices.issueDate,
        quantity: serviceInvoiceItems.quantity,
        amount: serviceInvoiceItems.total,
      }).from(serviceInvoiceItems)
        .innerJoin(serviceInvoices, eq(serviceInvoiceItems.serviceInvoiceId, serviceInvoices.id))
        .where(and(...serviceInvoiceConditions));

      const groupDocuments = (rows: any[], source: "invoice" | "estimate" | "service_invoice") => {
        const documentsById = new Map<string, any>();
        for (const row of rows) {
          const current = documentsById.get(row.documentId) || {
            id: row.documentId,
            source,
            documentNumber: row.documentNumber,
            clientId: row.clientId,
            clientName: row.clientName || "Unknown Client",
            status: row.status,
            date: row.date,
            projectId: row.projectId || null,
            projectName: row.projectName || null,
            quantity: 0,
            amount: 0,
          };
          current.quantity += Number(row.quantity || 0);
          current.amount += Number(row.amount || 0);
          documentsById.set(row.documentId, current);
        }
        return Array.from(documentsById.values());
      };

      const invoiceDocuments = groupDocuments(invoiceRows, "invoice");
      const estimateDocuments = groupDocuments(estimateRows, "estimate");
      const serviceInvoiceDocuments = groupDocuments(serviceInvoiceRows, "service_invoice");
      const invoiceIds = [...new Set(invoiceDocuments.map((document) => document.id))];
      const paymentRows = invoiceIds.length
        ? await database.select({
            id: payments.id,
            invoiceId: payments.invoiceId,
            amount: payments.amount,
            paymentDate: payments.paymentDate,
            paymentMethod: payments.paymentMethod,
            referenceNumber: payments.referenceNumber,
            status: payments.status,
          }).from(payments).where(inArray(payments.invoiceId, invoiceIds))
        : [];
      const paymentIds = paymentRows.map((payment) => payment.id);
      const receiptRows = paymentIds.length
        ? await database.select({
            id: receipts.id,
            receiptNumber: receipts.receiptNumber,
            paymentId: receipts.paymentId,
            amount: receipts.amount,
            receiptDate: receipts.receiptDate,
            status: receipts.status,
          }).from(receipts).where(inArray(receipts.paymentId, paymentIds))
        : [];

      const projectMap = new Map<string, { id: string; name: string }>();
      for (const document of [...invoiceDocuments, ...estimateDocuments]) {
        if (document.projectId && document.projectName) {
          projectMap.set(document.projectId, { id: document.projectId, name: document.projectName });
        }
      }
      const totalRevenue = [...invoiceDocuments, ...serviceInvoiceDocuments]
        .reduce((sum, document) => sum + document.amount, 0);
      const totalPaidFromPayments = paymentRows
        .filter((payment) => payment.status === "completed")
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      const totalPaidFromServiceInvoices = serviceInvoiceDocuments
        .filter((document) => document.status === "paid")
        .reduce((sum, document) => sum + document.amount, 0);

      return {
        serviceId: service.id,
        invoices: [...invoiceDocuments, ...serviceInvoiceDocuments].sort((left, right) =>
          new Date(right.date).getTime() - new Date(left.date).getTime()
        ),
        estimates: estimateDocuments,
        payments: paymentRows,
        receipts: receiptRows,
        projects: Array.from(projectMap.values()),
        timesUsed: invoiceDocuments.length + serviceInvoiceDocuments.length,
        totalUnits: [...invoiceDocuments, ...serviceInvoiceDocuments]
          .reduce((sum, document) => sum + document.quantity, 0),
        totalRevenue,
        totalPaid: totalPaidFromPayments + totalPaidFromServiceInvoices,
      };
    }),

  create: createFeatureRestrictedProcedure("services:create")
    .input(z.object({
      serviceName: z.string().min(1).max(100).optional(),
      name: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional(),
      serviceType: z.string().max(100).optional(),
      category: z.string().max(100).optional(),
      rate: z.number().positive().optional(),
      // Accept `hourlyRate` (in cents) from frontend for compatibility
      hourlyRate: z.number().optional(),
      unit: z.string().max(50).optional(),
      // Accept fixedPrice (in cents) from frontend
      fixedPrice: z.number().optional(),
      // Accept taxRate (as integer/percent*100) for compatibility
      taxRate: z.number().optional(),
      status: z.enum(['active', 'inactive']).optional(),
      deliverables: z.array(z.string()).optional(),
    }).refine((v) => !!(v.serviceName || v.name), { message: 'serviceName or name is required' }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const svcName = input.serviceName || input.name || '';
      const svcType = input.serviceType || input.category || undefined;

      // Check for duplicate service name
      const existing = await database.select().from(services).where(eq(services.name, svcName)).limit(1);
      if (existing.length > 0) {
        throw new Error(`Service '${svcName}' already exists`);
      }

      const id = uuidv4();
      // Determine hourlyRate in cents: prefer provided `hourlyRate`, otherwise convert `rate` (float)
      const rateInCents = input.hourlyRate !== undefined ? input.hourlyRate : (input.rate ? Math.round(input.rate * 100) : 0);
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      
      await database.insert(services).values({
        id,
        organizationId: ctx.user.organizationId ?? null,
        name: svcName,
        description: input.description || '',
        category: svcType,
        hourlyRate: rateInCents,
        fixedPrice: input.fixedPrice !== undefined ? input.fixedPrice : null,
        unit: input.unit || 'hour',
        taxRate: input.taxRate !== undefined ? input.taxRate : 0,
        deliverables: input.deliverables ? JSON.stringify(input.deliverables) : null,
        isActive: input.status === 'inactive' ? 0 : 1,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.user.id,
      } as any);

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "service_created",
        entityType: "service",
        entityId: id,
        description: `Created service: ${svcName}`,
      });

      return { id };
    }),

  // Get units for dropdown
  getUnits: protectedProcedure
    .query(async () => {
      const configuredUnits = await getConfiguredServiceUnits();
      return [...new Set([...defaultServiceUnits, ...configuredUnits])].sort((left, right) =>
        left.localeCompare(right, undefined, { sensitivity: "base" })
      );
    }),

  update: createFeatureRestrictedProcedure("services:edit")
    .input(z.object({
      id: z.string(),
      serviceName: z.string().min(1).max(100).optional(),
      name: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional(),
      serviceType: z.string().max(100).optional(),
      rate: z.number().positive().optional(),
      // Accept taxRate for updates as well (stored as integer percent*100)
      taxRate: z.number().optional(),
      hourlyRate: z.number().optional(),
      fixedPrice: z.number().optional(),
      unit: z.string().max(50).optional(),
      status: z.enum(['active', 'inactive']).optional(),
      category: z.string().max(100).optional(),
      deliverables: z.array(z.string()).optional(),
    }).refine((v) => !!(v.serviceName || v.name) || Object.keys(v).some(k => ['description','serviceType','category','rate','unit','status','deliverables'].includes(k)), { message: 'Either name/serviceName or other updatable fields required' }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const service = await database.select().from(services).where(eq(services.id, input.id)).limit(1);
      if (!service.length) throw new Error("Service not found");

      // Verify org ownership
      const orgId = ctx.user.organizationId;
      if (orgId && service[0].organizationId !== orgId) throw new Error("Service not found");

      const newName = input.serviceName || input.name;
      // Check for duplicate service name if changing it
      if (newName && newName !== service[0].name) {
        const existing = await database.select().from(services).where(eq(services.name, newName)).limit(1);
        if (existing.length > 0) {
          throw new Error(`Service '${newName}' already exists`);
        }
      }

      const updateData: any = {};
      if (newName) updateData.name = newName;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.serviceType) updateData.category = input.serviceType;
      if (input.hourlyRate !== undefined) updateData.hourlyRate = input.hourlyRate;
      else if (input.rate) updateData.hourlyRate = Math.round(input.rate * 100);
      if (input.fixedPrice !== undefined) updateData.fixedPrice = input.fixedPrice;
      if (input.taxRate !== undefined) updateData.taxRate = input.taxRate;
      if (input.deliverables !== undefined) updateData.deliverables = input.deliverables ? JSON.stringify(input.deliverables) : null;
      if (input.unit) updateData.unit = input.unit;
      if (input.status) updateData.isActive = input.status === 'inactive' ? 0 : 1;

      await database.update(services).set(updateData).where(eq(services.id, input.id));

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "service_updated",
        entityType: "service",
        entityId: input.id,
        description: `Updated service: ${service[0].name}`,
      });

      return { success: true };
    }),

  delete: createFeatureRestrictedProcedure("services:delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const service = await database.select().from(services).where(eq(services.id, input)).limit(1);
      if (!service.length) throw new Error("Service not found");

      // Verify org ownership
      const orgId = ctx.user.organizationId;
      if (orgId && service[0].organizationId !== orgId) throw new Error("Service not found");

      await database.delete(services).where(eq(services.id, input));

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "service_deleted",
        entityType: "service",
        entityId: input,
        description: `Deleted service: ${service[0].name}`,
      });

      return { success: true };
    }),

  getByType: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) return [];

      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(services.category, input), eq(services.organizationId, orgId)) : eq(services.category, input);
      return await database.select().from(services).where(where);
    }),

  getActive: protectedProcedure
    .query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) return [];

      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(services.isActive, 1), eq(services.organizationId, orgId)) : eq(services.isActive, 1);
      return await database.select().from(services).where(where);
    }),

  getSummary: protectedProcedure
    .query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) return {
        totalServices: 0,
        activeServices: 0,
        avgRate: 0,
      };

      const orgId = ctx.user.organizationId;
      const allServices = orgId
        ? await database.select().from(services).where(eq(services.organizationId, orgId))
        : await database.select().from(services);

      const activeServices = allServices.filter(s => s.isActive === 1).length;
      const avgRate = allServices.length > 0 
        ? allServices.reduce((sum, s) => sum + ((s.hourlyRate || 0) / 100), 0) / allServices.length 
        : 0;

      return {
        totalServices: allServices.length,
        activeServices,
        avgRate,
      };
    }),

  bulkDelete: createFeatureRestrictedProcedure("services:delete")
    .input(z.array(z.string()).min(1))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const results = {
        deleted: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const serviceId of input) {
        try {
          const service = await database.select().from(services).where(eq(services.id, serviceId)).limit(1);
          if (!service.length) {
            results.failed++;
            results.errors.push(`Service ${serviceId} not found`);
            continue;
          }

          await database.delete(services).where(eq(services.id, serviceId));
          results.deleted++;

          // Log activity
          await db.logActivity({
            userId: ctx.user.id,
            action: "service_deleted",
            entityType: "service",
            entityId: serviceId,
            description: `Bulk deleted service: ${service[0].name}`,
          });
        } catch (error) {
          results.failed++;
          results.errors.push(`Error deleting ${serviceId}: ${error}`);
        }
      }

      return results;
    }),

  // Get categories for dropdown
  getCategories: protectedProcedure
    .query(async () => {
      try {
        const database = await getDb();
        if (!database) return [];

        // Use a more efficient query - only select distinct categories
        const result = await database.selectDistinct({ category: services.category })
          .from(services)
          .where(sql`${services.category} IS NOT NULL AND ${services.category} != ''`)
          .orderBy(services.category);
        
        return result.map(r => r.category).filter(Boolean) as string[];
      } catch (error) {
        console.error("Error fetching service categories:", error);
        return [];
      }
    }),
});