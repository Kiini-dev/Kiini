import { TRPCError } from "@trpc/server";
import { router } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { getDb, getSettingsByCategory, logActivity } from "../db";
import { v4 as uuidv4 } from "uuid";
import { tickets as canonicalTickets, clients } from "../../drizzle/schema";
import { ticketComments, ticketTasks } from "../../drizzle/schema-extended";
import { eq, and } from "drizzle-orm";

// Feature-based procedures
const readProcedure = createFeatureRestrictedProcedure("tickets:read");
const createProcedure = createFeatureRestrictedProcedure("tickets:create");
const updateProcedure = createFeatureRestrictedProcedure("tickets:edit");
const deleteProcedure = createFeatureRestrictedProcedure("tickets:delete");

const normalizePriority = (value?: string) => {
  if (!value) return "normal";
  if (value === "medium") return "normal";
  if (["low", "normal", "high", "urgent"].includes(value)) return value;
  return "normal";
};

const normalizeStatus = (value?: string) => {
  if (!value) return "open";
  const statusMap: Record<string, string> = {
    new: "open",
    pending: "open",
    completed: "resolved",
    done: "resolved",
    awaiting_client: "on_hold",
    "awaiting-client": "on_hold",
  };

  if (statusMap[value]) return statusMap[value];
  return value;
};

const normalizeCategory = (value?: string) => {
  if (!value) return "general";
  return value;
};

const makeTicketNumber = () => `TKT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export function resolveAllowClientTickets(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const normalized = String(value).trim().toLowerCase();
  if (["false", "0", "no", "off"].includes(normalized)) return false;
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  return true;
}

export function canRoleCreateTicket(role: string, allowClientTickets: unknown): boolean {
  return role !== "client" || resolveAllowClientTickets(allowClientTickets);
}

export async function getClientOrganizationId(db: any, user: { clientId?: string | null; organizationId?: string | null }) {
  if (!user.clientId) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Client account is not linked to a client record" });
  }
  const clientRows = await db.select({
    organizationId: clients.organizationId,
  }).from(clients).where(eq(clients.id, user.clientId)).limit(1);
  const clientOrganizationId = clientRows[0]?.organizationId || null;
  if (!clientOrganizationId || (user.organizationId && user.organizationId !== clientOrganizationId)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Client account is not linked to an organization" });
  }
  return clientOrganizationId;
}

const safeSelectByTicketId = async <T>(db: any, table: any, ticketId: string, fieldName: string) => {
  try {
    return await db.select().from(table).where(eq(table.ticketId, ticketId));
  } catch (error) {
    console.warn(`[tickets] ${fieldName} table unavailable or incompatible, returning empty collection`, error instanceof Error ? error.message : error);
    return [] as T[];
  }
};

export const ticketsRouter = router({
  list: readProcedure
    .input(z.object({ clientId: z.string().optional(), status: z.string().optional(), limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const orgId = ctx.user.role === "client"
        ? await getClientOrganizationId(db, { clientId: (ctx.user as any).clientId, organizationId: ctx.user.organizationId })
        : ctx.user.organizationId || "";
      const filters: any[] = [eq(canonicalTickets.organizationId, orgId)];
      if (ctx.user.role === "client") filters.push(eq(canonicalTickets.createdBy, ctx.user.id));
      if (input?.status) filters.push(eq(canonicalTickets.status as any, normalizeStatus(input.status) as any));
      const where = filters.length === 1 ? filters[0] : and(...filters);
      return await db.select().from(canonicalTickets).where(where).limit(input?.limit || 100).offset(input?.offset || 0);
    }),

  getById: readProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const orgId = ctx.user.role === "client"
        ? await getClientOrganizationId(db, { clientId: (ctx.user as any).clientId, organizationId: ctx.user.organizationId })
        : ctx.user.organizationId || "";
      const filters = [
        eq(canonicalTickets.id, input),
        eq(canonicalTickets.organizationId, orgId),
      ];
      if (ctx.user.role === "client") filters.push(eq(canonicalTickets.createdBy, ctx.user.id));
      const where = and(...filters);
      const rows = await db.select().from(canonicalTickets).where(where).limit(1);
      if (rows.length === 0) return null;
      const ticket = rows[0];
      const comments = await safeSelectByTicketId<typeof ticketComments>(db, ticketComments, input, "comments");
      const tasks = await safeSelectByTicketId<typeof ticketTasks>(db, ticketTasks, input, "tasks");
      return { ...ticket, comments, tasks };
    }),

  create: createProcedure
    .input(
      z.object({
        clientId: z.string().optional(),
        title: z.string().min(3),
        description: z.string().optional(),
        category: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        status: z.string().optional(),
        requestedDueDate: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      if (ctx.user.role === "client") {
        const ticketSettings = await getSettingsByCategory("tickets_general");
        const allowClientTickets = ticketSettings.find((setting) => setting.key === "allowClientTickets")?.value;
        if (!canRoleCreateTicket(ctx.user.role, allowClientTickets)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Client ticket submissions are disabled" });
        }
      }
      const organizationId = ctx.user.role === "client"
        ? await getClientOrganizationId(db, { clientId: (ctx.user as any).clientId, organizationId: ctx.user.organizationId })
        : ctx.user.organizationId;
      if (!organizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Organization context required" });
      }

      const id = uuidv4();
      const payload = {
        id,
        organizationId,
        ticketNumber: makeTicketNumber(),
        title: input.title.trim(),
        description: input.description || "No description provided",
        category: normalizeCategory(input.category),
        priority: normalizePriority(input.priority),
        status: normalizeStatus(input.status),
        createdBy: ctx.user.id,
      } as any;
      await db.insert(canonicalTickets).values(payload);
      await logActivity({
        userId: ctx.user.id,
        action: "ticket:create",
        entityType: "ticket",
        entityId: id,
        description: `Created ticket ${input.title}`,
        metadata: JSON.stringify({ clientId: input.clientId || null, priority: payload.priority }),
      });
      return { id };
    }),

  update: updateProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        category: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        status: z.string().optional(),
        assignedTo: z.string().optional(),
        requestedDueDate: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      if (!ctx.user.organizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Organization context required" });
      }
      const orgId = ctx.user.organizationId;
      const ownerCheck = and(eq(canonicalTickets.id, input.id), eq(canonicalTickets.organizationId, orgId));
      const existing = await db.select().from(canonicalTickets).where(ownerCheck).limit(1);
      if (!existing.length) throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });

      const upd: any = { updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) };
      if (input.title !== undefined) upd.title = input.title.trim();
      if (input.description !== undefined) upd.description = input.description || "No description provided";
      if (input.category !== undefined) upd.category = normalizeCategory(input.category);
      if (input.priority !== undefined) upd.priority = normalizePriority(input.priority);
      if (input.status !== undefined) upd.status = normalizeStatus(input.status);
      if (input.assignedTo !== undefined) upd.assignedTo = input.assignedTo;

      await db.update(canonicalTickets).set(upd).where(ownerCheck);
      await logActivity({
        userId: ctx.user.id,
        action: "ticket:update",
        entityType: "ticket",
        entityId: input.id,
        description: `Updated ticket ${input.id}`,
        metadata: JSON.stringify({ fields: Object.keys(upd) }),
      });
      return { success: true };
    }),

  delete: deleteProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      if (!ctx.user.organizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Organization context required" });
      }
      const where = and(eq(canonicalTickets.id, input), eq(canonicalTickets.organizationId, ctx.user.organizationId));
      await db.delete(canonicalTickets).where(where);
      await logActivity({
        userId: ctx.user.id,
        action: "ticket:delete",
        entityType: "ticket",
        entityId: input,
        description: `Deleted ticket ${input}`,
      });
      return { success: true };
    }),

  addComment: updateProcedure
    .input(z.object({ ticketId: z.string(), body: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      if (!ctx.user.organizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Organization context required" });
      }
      const ticket = await db.select().from(canonicalTickets).where(and(eq(canonicalTickets.id, input.ticketId), eq(canonicalTickets.organizationId, ctx.user.organizationId))).limit(1);
      if (!ticket.length) throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      const id = uuidv4();
      await db.insert(ticketComments).values({ id, ticketId: input.ticketId, authorId: ctx.user.id, body: input.body } as any);
      await logActivity({
        userId: ctx.user.id,
        action: "ticket:addComment",
        entityType: "ticket_comment",
        entityId: id,
        description: `Added comment to ticket ${input.ticketId}`,
      });
      return { id };
    }),

  createTask: createProcedure
    .input(
      z.object({ ticketId: z.string(), serviceType: z.string(), details: z.string().optional(), budget: z.number().optional(), dueDate: z.string().optional() })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      if (!ctx.user.organizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Organization context required" });
      }
      const ticket = await db.select().from(canonicalTickets).where(and(eq(canonicalTickets.id, input.ticketId), eq(canonicalTickets.organizationId, ctx.user.organizationId))).limit(1);
      if (!ticket.length) throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      const id = uuidv4();
      try {
        await db.insert(ticketTasks).values({
          id,
          ticketId: input.ticketId,
          serviceType: input.serviceType,
          details: input.details || null,
          budget: input.budget || null,
          dueDate: input.dueDate || null,
        } as any);
      } catch (error) {
        console.warn("[tickets] task table unavailable; continuing without task persistence", error instanceof Error ? error.message : error);
      }
      await logActivity({
        userId: ctx.user.id,
        action: "ticket:createTask",
        entityType: "ticket_task",
        entityId: id,
        description: `Created task for ticket ${input.ticketId}`,
        metadata: JSON.stringify({ serviceType: input.serviceType, dueDate: input.dueDate }),
      });
      return { id };
    }),
});
