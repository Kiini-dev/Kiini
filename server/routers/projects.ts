import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getDb, getPool, logActivity } from "../db";
import { projects, projectTasks, employees, settings, clients, users } from "../../drizzle/schema";
import { projectTeamMembers, invoicePayments } from "../../drizzle/schema-extended";
import { eq, desc, and, inArray, isNull, or } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { triggerEventNotification } from "./emailNotifications";
import fs from "fs";
import path from "path";
import { scheduleDocumentAutomation } from "../services/jobScheduler";

const readProcedure = protectedProcedure;
const rejectClientMutation = ({ ctx, next }: any) => {
  if (ctx.user?.role === "client") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Client accounts have read-only project access" });
  }
  return next({ ctx });
};
const createProcedure = createFeatureRestrictedProcedure("projects:create").use(rejectClientMutation);
const updateProcedure = createFeatureRestrictedProcedure("projects:edit").use(rejectClientMutation);
const deleteProcedure = createFeatureRestrictedProcedure("projects:delete").use(rejectClientMutation);

let projectTasksSchemaReady: Promise<void> | null = null;

function ensureProjectTasksSchema() {
  if (!projectTasksSchemaReady) {
    projectTasksSchemaReady = (async () => {
      const pool = getPool();
      if (!pool) throw new Error("Database pool not initialized");
      await pool.query(`CREATE TABLE IF NOT EXISTS projectTasks (
        id VARCHAR(64) NOT NULL PRIMARY KEY,
        projectId VARCHAR(64) NULL,
        clientId VARCHAR(64) NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        status ENUM('todo','in_progress','review','completed','blocked') NOT NULL DEFAULT 'todo',
        priority ENUM('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
        assignedTo VARCHAR(64) NULL,
        dueDate DATETIME NULL,
        completedDate DATETIME NULL,
        estimatedHours INT NULL,
        actualHours INT NULL,
        approvalStatus ENUM('pending','approved','rejected','revision_requested') DEFAULT 'pending',
        adminRemarks LONGTEXT NULL,
        approvedBy VARCHAR(64) NULL,
        approvedAt TIMESTAMP NULL,
        rejectionReason LONGTEXT NULL,
        parentTaskId VARCHAR(64) NULL,
        \`order\` INT DEFAULT 0,
        tags TEXT NULL,
        targetDate DATETIME NULL,
        billable TINYINT DEFAULT 1,
        visibleToClient TINYINT DEFAULT 1,
        createdBy VARCHAR(64) NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);

      const [columnRows] = await pool.query("SHOW COLUMNS FROM projectTasks");
      const columns = new Set((Array.isArray(columnRows) ? columnRows : []).map((row: any) => String(row.Field).toLowerCase()));
      const requiredColumns: Record<string, string> = {
        projectId: "VARCHAR(64) NULL",
        clientId: "VARCHAR(64) NULL",
        approvalStatus: "ENUM('pending','approved','rejected','revision_requested') DEFAULT 'pending'",
        adminRemarks: "LONGTEXT NULL",
        approvedBy: "VARCHAR(64) NULL",
        approvedAt: "TIMESTAMP NULL",
        rejectionReason: "LONGTEXT NULL",
        parentTaskId: "VARCHAR(64) NULL",
        order: "INT DEFAULT 0",
        tags: "TEXT NULL",
        targetDate: "DATETIME NULL",
        billable: "TINYINT DEFAULT 1",
        visibleToClient: "TINYINT DEFAULT 1",
        createdBy: "VARCHAR(64) NULL",
        createdAt: "TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP",
        updatedAt: "TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
      };
      if (columns.has("projectid")) await pool.query("ALTER TABLE projectTasks MODIFY COLUMN projectId VARCHAR(64) NULL");
      for (const [column, definition] of Object.entries(requiredColumns)) {
        if (!columns.has(column.toLowerCase())) {
          await pool.query(`ALTER TABLE projectTasks ADD COLUMN \`${column}\` ${definition}`);
        }
      }
    })().catch((error) => {
      projectTasksSchemaReady = null;
      throw error;
    });
  }
  return projectTasksSchemaReady;
}

export function calculateProgressBasedSpent(budget: number | null | undefined, progress: number | null | undefined): number {
  const budgetAmount = Math.max(0, Number(budget || 0));
  const completion = Math.min(100, Math.max(0, Number(progress || 0)));
  return Math.round(budgetAmount * completion / 100);
}

export const projectsRouter = router({
  list: readProcedure
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      console.log('[Projects.list] Called. User:', ctx.user?.email || 'NO USER', 'Input:', input);
      const db = await getDb();
      if (!db) return [];
      const orgId = ctx.user.organizationId;
      const result = orgId
        ? await db.select().from(projects).where(eq(projects.organizationId, orgId)).orderBy(desc(projects.createdAt)).limit(input?.limit || 50).offset(input?.offset || 0)
        : await db.select().from(projects).orderBy(desc(projects.createdAt)).limit(input?.limit || 50).offset(input?.offset || 0);
      const managerIds = [...new Set<string>(result.flatMap((project: any): string[] =>
        [project.assignedTo, project.projectManager].filter((id): id is string => typeof id === 'string' && id.length > 0),
      ))];
      const managerRows = managerIds.length
        ? await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(inArray(users.id, managerIds as any))
        : [];
      const managerNames = new Map(managerRows.map((manager) => [manager.id, manager.name || manager.email || manager.id]));

      // Convert frozen Drizzle objects to plain objects to avoid React error #306
      return result.map(project => ({
        id: project.id,
        clientId: project.clientId,
        name: project.name,
        projectNumber: project.projectNumber,
        description: project.description,
        status: project.status,
        priority: project.priority,
        startDate: project.startDate,
        endDate: project.endDate,
        budget: project.budget,
        progress: project.progress,
        progressBasedSpent: calculateProgressBasedSpent(project.budget, project.progress),
        tags: project.tags || '',
        projectColor: (project as any).projectColor || 'primary',
        teamSize: (project as any).teamSize ?? 1,
        projectRating: (project as any).projectRating ?? 0,
        coverImageUrl: (project as any).coverImageUrl || null,
        createdBy: project.createdBy,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        assignedToName: project.assignedTo ? managerNames.get(project.assignedTo) || project.assignedTo : null,
        projectManagerName: project.projectManager ? managerNames.get(project.projectManager) || project.projectManager : null,
      }));
    }),

  getById: readProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(projects.id, input), eq(projects.organizationId, orgId)) : eq(projects.id, input);
      const result = await db.select().from(projects).where(where).limit(1);
      if (!result[0]) return null;
      return {
        ...result[0],
        progressBasedSpent: calculateProgressBasedSpent(result[0].budget, result[0].progress),
      };
    }),

  byClient: readProcedure
    .input(z.object({ clientId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(projects.clientId, input.clientId), eq(projects.organizationId, orgId)) : eq(projects.clientId, input.clientId);
      const result = await db.select().from(projects).where(where);
      return result;
    }),

  byStatus: readProcedure
    .input(z.object({ status: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(projects.status, input.status as any), eq(projects.organizationId, orgId)) : eq(projects.status, input.status as any);
      const result = await db.select().from(projects).where(where);
      return result;
    }),

  create: createProcedure
    .input(z.object({
      clientId: z.string(),
      name: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]).optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      budget: z.number().optional(),
      progress: z.number().min(0).max(100).optional(),
      // Accept progressPercentage from some frontend forms and map to progress
      progressPercentage: z.union([z.string(), z.number()]).optional(),
      // Extended project fields
      assignedTo: z.string().optional(),
      projectManager: z.string().optional(),
      projectColor: z.string().optional(),
      teamSize: z.union([z.string(), z.number()]).optional(),
      projectRating: z.union([z.string(), z.number()]).optional(),
      coverImageUrl: z.string().optional(),
      tags: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const id = uuidv4();
      // Read project prefix from settings
      let prjPrefix = "PRJ";
      try {
        const prefixRows = await db.select().from(settings)
          .where(and(eq(settings.category, "numbering"), eq(settings.key, "projectPrefix")))
          .limit(1);
        if (prefixRows.length > 0 && prefixRows[0].value) prjPrefix = prefixRows[0].value;
      } catch { /* use default */ }
      const projectNumber = `${prjPrefix}-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
      
      await db.insert(projects).values({
        id,
        projectNumber,
        name: input.name,
        clientId: input.clientId,
        category: input.category || null,
        description: input.description || null,
        status: input.status || 'planning',
        priority: input.priority || 'medium',
        startDate: input.startDate || null,
        endDate: input.endDate || null,
        budget: input.budget !== undefined ? Math.round(input.budget * 100) : 0,
        progress: input.progress ?? (input.progressPercentage != null && input.progressPercentage !== '' ? Math.min(100, Math.max(0, typeof input.progressPercentage === 'string' ? (Number.isNaN(parseInt(input.progressPercentage)) ? 0 : parseInt(input.progressPercentage)) : input.progressPercentage)) : 0),
        assignedTo: input.assignedTo || null,
        projectManager: input.projectManager || null,
        projectColor: input.projectColor || 'primary',
        teamSize: input.teamSize != null ? (typeof input.teamSize === 'string' ? Number(input.teamSize) || 1 : input.teamSize) : 1,
        projectRating: input.projectRating != null ? (typeof input.projectRating === 'string' ? Number(input.projectRating) || 0 : input.projectRating) : 0,
        coverImageUrl: input.coverImageUrl || null,
        tags: input.tags || null,
        notes: input.notes || null,
        createdBy: ctx.user.id,
        organizationId: ctx.user.organizationId ?? null,
      } as any);
      await scheduleDocumentAutomation({ documentType: "project", documentId: id, organizationId: ctx.user.organizationId, createdBy: ctx.user.id }).catch((error) => console.error("Failed to schedule project automation:", error));

      // Email notification
      try {
        if (ctx.user.email) {
          await triggerEventNotification({
            userId: ctx.user.id,
            eventType: "project_created",
            recipientEmail: ctx.user.email,
            recipientName: ctx.user.name,
            subject: `New Project Created: ${input.name}`,
            htmlContent: `<h2>New Project Created</h2><p>Project <strong>${input.name}</strong> (${projectNumber}) has been created.</p>${input.status ? `<p><strong>Status:</strong> ${input.status}</p>` : ''}<p><a href="/projects/${id}">View Project</a></p>`,
            entityType: "project",
            entityId: id,
            actionUrl: `/projects/${id}`,
          });
        }
      } catch (notifError) {
        console.error("[Projects] Failed to send email notification:", notifError);
      }

      return { id };
    }),

  update: updateProcedure
    .input(z.object({
      id: z.string(),
      clientId: z.string().optional(),
      name: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]).optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      budget: z.number().optional(),
      progress: z.number().min(0).max(100).optional(),
      progressPercentage: z.union([z.string(), z.number()]).optional(),
      assignedTo: z.string().optional(),
      projectManager: z.string().optional(),
      accountManager: z.string().optional(),
      projectColor: z.string().optional(),
      teamSize: z.union([z.string(), z.number()]).optional(),
      projectRating: z.union([z.string(), z.number()]).optional(),
      coverImageUrl: z.string().optional(),
      tags: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const { id, ...data } = input;
      const orgId = ctx.user.organizationId;
      const ownerCheck = orgId ? and(eq(projects.id, id), eq(projects.organizationId, orgId)) : eq(projects.id, id);
      const existing = await db.select({ id: projects.id }).from(projects).where(ownerCheck).limit(1);
      if (!existing.length) throw new Error("Project not found");
      const updateData: any = { ...data };
      
      // Handle dates - convert to MySQL format (YYYY-MM-DD HH:MM:SS)
      if (data.startDate) {
        const dateStr = typeof data.startDate === 'string' ? data.startDate : (data.startDate as Date).toISOString();
        updateData.startDate = dateStr.replace('T', ' ').substring(0, 19);
      }
      if (data.endDate) {
        const dateStr = typeof data.endDate === 'string' ? data.endDate : (data.endDate as Date).toISOString();
        updateData.endDate = dateStr.replace('T', ' ').substring(0, 19);
      }
      
      // Handle progress
      if (data.progress !== undefined) {
        updateData.progress = data.progress;
      } else if ((data as any).progressPercentage !== undefined && (data as any).progressPercentage !== '') {
        const parsed = typeof (data as any).progressPercentage === 'string' ? parseInt((data as any).progressPercentage) : (data as any).progressPercentage;
        updateData.progress = Number.isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed));
      }

      // Normalize budget: accept major units from client and store as cents
      if ((data as any).budget !== undefined) {
        updateData.budget = Math.round((data as any).budget * 100);
      }
      if ((data as any).projectColor !== undefined) updateData.projectColor = (data as any).projectColor || 'primary';
      if ((data as any).teamSize !== undefined) updateData.teamSize = typeof (data as any).teamSize === 'string' ? (Number((data as any).teamSize) || 1) : ((data as any).teamSize ?? 1);
      if ((data as any).projectRating !== undefined) updateData.projectRating = typeof (data as any).projectRating === 'string' ? (Number((data as any).projectRating) || 0) : ((data as any).projectRating ?? 0);
      if ((data as any).coverImageUrl !== undefined) updateData.coverImageUrl = (data as any).coverImageUrl || null;
      
      // If progress is 100, automatically set status to completed if not already set
      const progressValue = data.progress;
      if (progressValue === 100 && !data.status) {
        updateData.status = 'completed';
      }
      
      await db.update(projects).set(updateData).where(eq(projects.id, id));
      return { success: true };
    }),

  updateProgress: updateProcedure
    .input(z.object({
      id: z.string(),
      progress: z.number().min(0).max(100),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(projects.id, input.id), eq(projects.organizationId, orgId)) : eq(projects.id, input.id);
      const currentProject = await db.select({ status: projects.status }).from(projects).where(where).limit(1);
      if (!currentProject[0]) throw new Error("Project not found");
      
      // Convert to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      
      const updateData: any = { 
        progress: input.progress,
        updatedAt: now
      };
      
      // Automatically complete project if progress reaches 100%
      if (input.progress === 100) {
        updateData.status = 'completed';
        updateData.actualEndDate = now;
      } else if (input.progress > 0) {
        // If progress starts, ensure it's at least 'active'
        if (currentProject[0]?.status === 'planning') {
          updateData.status = 'active';
          updateData.actualStartDate = now;
        }
      }
      
      try {
        await db.update(projects).set(updateData).where(where);
      } catch (err: any) {
        console.error('Failed updating project progress', { input, updateData, err });
        throw new Error('Failed updating project progress: ' + (err?.message || String(err)));
      }
      return { success: true, progress: input.progress };
    }),

  delete: deleteProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(projects.id, input), eq(projects.organizationId, orgId)) : eq(projects.id, input);
      await db.delete(projects).where(where);
      return { success: true };
    }),

  // Client-facing alias used by legacy client code
  getClientProjects: readProcedure
    .input(z.object({ clientId: z.string().optional() }).optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      // Use clientId from input, or from user's record (client users have clientId in users table)
      const clientId = ctx.user?.role === "client"
        ? (ctx.user as any)?.clientId
        : input?.clientId || (ctx.user as any)?.clientId;
      if (!clientId) return [];
      const result = await db.select().from(projects).where(eq(projects.clientId, clientId));
      const managerIds = [...new Set(result.flatMap((project: any) => [project.assignedTo, project.projectManager].filter((id): id is string => !!id)))];
      const managerIdList = managerIds as string[];
      const managerRows = managerIdList.length
        ? await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(inArray(users.id, managerIdList))
        : [];
      const managerNames = new Map(managerRows.map((manager) => [manager.id, manager.name || manager.email || manager.id]));
        // Map actualCost to spent for frontend compatibility
        return result.map((p: any) => ({
          ...p,
          spent: p.actualCost || 0,
          assignedToName: p.assignedTo ? managerNames.get(p.assignedTo) || p.assignedTo : null,
          projectManagerName: p.projectManager ? managerNames.get(p.projectManager) || p.projectManager : null,
        }));
    }),

  // Project Tasks
  tasks: router({
    list: readProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        try {
          const tasks = await db
            .select()
            .from(projectTasks)
            .where(eq(projectTasks.projectId, input.projectId))
            .orderBy(projectTasks.order);
          return tasks;
        } catch (error) {
          console.error("Error listing tasks:", error);
          return [];
        }
      }),

    // List all tasks across all projects AND standalone tasks for the organization
    listAll: readProcedure
      .input(z.object({
        status: z.string().min(1).optional(),
        assignedTo: z.string().optional(),
        priority: z.enum(['low','medium','high','urgent']).optional(),
      }).optional())
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return [];

        try {
          const orgId = ctx.user.organizationId;
          // Get all project IDs for this org
          const orgProjects = orgId
            ? await db.select({ id: projects.id, name: projects.name }).from(projects).where(eq(projects.organizationId, orgId))
            : await db.select({ id: projects.id, name: projects.name }).from(projects);

          const projectIds = orgProjects.map(p => p.id);
          const projectMap: Record<string, string> = {};
          orgProjects.forEach(p => { projectMap[p.id] = p.name; });

          // Get clients for client name lookup on standalone tasks
          const orgClients = orgId
            ? await db.select({ id: clients.id, name: clients.companyName }).from(clients).where(eq(clients.organizationId as any, orgId))
            : await db.select({ id: clients.id, name: clients.companyName }).from(clients);
          const clientMap: Record<string, string> = {};
          orgClients.forEach((c: any) => { clientMap[c.id] = c.name; });

          // Include tasks attached to org projects OR standalone tasks (no projectId) created by org members
          const statusFilters: any[] = [];
          if (input?.status) statusFilters.push(eq(projectTasks.status, input.status));
          if (input?.assignedTo) statusFilters.push(eq(projectTasks.assignedTo, input.assignedTo));
          if (input?.priority) statusFilters.push(eq(projectTasks.priority, input.priority));

          // Build org-scoped filter: either has a projectId in org, or has clientId in org (standalone)
          const orgFilter = projectIds.length > 0
            ? or(
                inArray(projectTasks.projectId, projectIds),
                isNull(projectTasks.projectId)
              )
            : isNull(projectTasks.projectId);

          const allFilters = statusFilters.length > 0
            ? and(orgFilter, ...statusFilters)
            : orgFilter;

          const tasks = await db
            .select()
            .from(projectTasks)
            .where(allFilters)
            .orderBy(desc(projectTasks.createdAt));

          return tasks.map((t: any) => ({
            ...t,
            projectName: t.projectId ? (projectMap[t.projectId] || 'Unknown Project') : null,
            clientName: t.clientId ? (clientMap[t.clientId] || null) : null,
          }));
        } catch (error) {
          console.error("Error listing all tasks:", error);
          return [];
        }
      }),

    create: createProcedure
      .input(z.object({
        projectId: z.string().optional(),
        clientId: z.string().optional(),
        title: z.string(),
        description: z.string().optional(),
        status: z.string().min(1).optional(),
        priority: z.enum(['low','medium','high','urgent']).optional(),
        assignedTo: z.string().optional(),
        dueDate: z.coerce.date().optional(),
        estimatedHours: z.number().optional(),
        parentTaskId: z.string().optional(),
        tags: z.string().optional(),
        targetDate: z.string().optional(),
        billable: z.number().optional(),
        visibleToClient: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await ensureProjectTasksSchema();

        const id = uuidv4();
        
        // Convert dates to MySQL DATETIME format (YYYY-MM-DD HH:MM:SS)
        const convertToMySQLDateTime = (date?: Date | string | null): string | null => {
          if (!date) return null;
          if (typeof date === 'string') return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
          if (date instanceof Date) return date.toISOString().replace('T', ' ').substring(0, 19);
          return null;
        };

        const dueDate = convertToMySQLDateTime(input.dueDate);
        const now = new Date();

        await db.insert(projectTasks).values({
          id,
          projectId: input.projectId || null,
          clientId: input.clientId || null,
          title: input.title,
          description: input.description || null,
          status: input.status || 'todo',
          priority: input.priority || 'medium',
          assignedTo: input.assignedTo || null,
          dueDate: dueDate,
          estimatedHours: input.estimatedHours || null,
          parentTaskId: input.parentTaskId || null,
          tags: input.tags || null,
          targetDate: input.targetDate ? convertToMySQLDateTime(input.targetDate) : null,
          billable: input.billable ?? 1,
          visibleToClient: input.visibleToClient ?? 1,
          order: 0,
          createdBy: ctx.user.id,
          createdAt: now,
          updatedAt: now,
        } as any);

        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "task_created",
          entityType: "projectTask",
          entityId: id,
          description: `Created task: ${input.title}`,
        });

        if (input.assignedTo) {
          try {
            const projectTaskCreateSettings = await db.select().from(settings)
              .where(and(eq(settings.category, "projects_general"), eq(settings.key, "notifyOnTaskCreate")))
              .limit(1);
            const projectTaskCreateNotificationsEnabled = projectTaskCreateSettings[0]?.value !== "false";

            const taskSettings = await db.select().from(settings)
              .where(and(eq(settings.category, "tasks_general"), eq(settings.key, "notifyAssigneeByEmail")))
              .limit(1);
            const assigneeNotificationEnabled = projectTaskCreateNotificationsEnabled && taskSettings[0]?.value !== "false";

            if (assigneeNotificationEnabled) {
              const assignee = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, input.assignedTo)).limit(1);
              if (assignee[0]?.email) {
                await triggerEventNotification({
                  userId: ctx.user.id,
                  eventType: "task_assigned",
                  recipientEmail: assignee[0].email,
                  recipientName: assignee[0].name || assignee[0].email,
                  subject: `Task assigned: ${input.title}`,
                  htmlContent: `<p>You have been assigned the task <strong>${input.title}</strong>.</p>`,
                  entityType: "projectTask",
                  entityId: id,
                  actionUrl: `/projects/${input.projectId || ""}`,
                  templateId: "user/task_assigned",
                  templateContext: {
                    organizationId: ctx.user.organizationId,
                    recipient_first_name: assignee[0].name?.trim().split(/\s+/)[0] || assignee[0].email,
                    assigned_by_name: ctx.user.name || ctx.user.email || "A colleague",
                    task_title: input.title,
                    task_description: input.description || "See the task for details.",
                    project_name: input.projectId || "Standalone task",
                    due_date: input.dueDate || "Not specified",
                    task_priority: input.priority || "medium",
                    task_url: ctx.user.organizationSlug ? `/org/${ctx.user.organizationSlug}/tasks` : "/tasks",
                    app_name: "Kiini",
                  },
                });
              }
            }
          } catch (notificationError) {
            console.error("[Projects] Failed to notify task assignee:", notificationError);
          }
        }

        return { id };
      }),

    // Upload a file attachment for a task, returns a URL
    uploadAttachment: createProcedure
      .input(z.object({
        filename: z.string().max(255),
        dataUrl: z.string().max(15_000_000), // ~11MB base64
        fileType: z.enum(['image', 'document']).default('document'),
      }))
      .mutation(async ({ input }) => {
        const uploadDir = process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads');
        const tasksDir = path.join(uploadDir, 'tasks');
        if (!fs.existsSync(tasksDir)) fs.mkdirSync(tasksDir, { recursive: true });

        const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const ext = path.extname(safeName) || '.bin';
        const newFilename = `${uuidv4()}${ext}`;
        const base64Data = input.dataUrl.replace(/^data:[^;]+;base64,/, '');

        fs.writeFileSync(path.join(tasksDir, newFilename), Buffer.from(base64Data, 'base64'));

        return { url: `/uploads/tasks/${newFilename}`, filename: input.filename };
      }),

    update: updateProcedure
      .input(z.object({
        id: z.string(),
        projectId: z.string().optional().nullable(),
        clientId: z.string().optional().nullable(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.string().min(1).optional(),
        priority: z.enum(['low','medium','high','urgent']).optional(),
        assignedTo: z.string().optional(),
        dueDate: z.coerce.date().optional(),
        estimatedHours: z.number().optional(),
        actualHours: z.number().optional(),
        parentTaskId: z.string().optional(),
        tags: z.string().optional(),
        targetDate: z.string().optional(),
        billable: z.number().optional(),
        visibleToClient: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const { id, ...updates } = input;
        const updateData: any = { ...updates };

        // Handle date conversion to MySQL format
        if (updates.dueDate) {
          const dateStr = typeof updates.dueDate === 'string' ? updates.dueDate : updates.dueDate.toISOString().replace('T', ' ').substring(0, 19);
          updateData.dueDate = dateStr.replace('T', ' ').substring(0, 19);
        }

        // If task is being marked as completed, set completedDate
        if (updates.status === 'completed') {
          updateData.completedDate = new Date().toISOString().replace('T', ' ').substring(0, 19);
        }

        updateData.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

        await db.update(projectTasks).set(updateData).where(eq(projectTasks.id, id));

        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "task_updated",
          entityType: "projectTask",
          entityId: id,
          description: `Updated task${updates.status ? ` status to ${updates.status}` : ''}`,
        });

        return { success: true };
      }),

    delete: deleteProcedure
      .input(z.string())
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.delete(projectTasks).where(eq(projectTasks.id, input));

        // Log activity
        await logActivity({
          userId: ctx.user.id,
          action: "task_deleted",
          entityType: "projectTask",
          entityId: input,
          description: "Deleted task",
        });

        return { success: true };
      }),

    // Get task by ID with all details including approval info
    getById: readProcedure
      .input(z.string())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;

        try {
          const task = await db
            .select()
            .from(projectTasks)
            .where(eq(projectTasks.id, input))
            .limit(1);
          
          return task[0] || null;
        } catch (error) {
          console.error("Error fetching task:", error);
          return null;
        }
      }),

    // List tasks filtered by team member (assignedTo)
    listByTeamMember: readProcedure
      .input(z.object({
        projectId: z.string(),
        teamMemberId: z.string(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        try {
          const tasks = await db
            .select()
            .from(projectTasks)
            .where(
              and(
                eq(projectTasks.projectId, input.projectId),
                eq(projectTasks.assignedTo, input.teamMemberId)
              )
            )
            .orderBy(projectTasks.order);
          
          return tasks;
        } catch (error) {
          console.error("Error listing team member tasks:", error);
          return [];
        }
      }),

    // List tasks filtered by status
    listByStatus: readProcedure
      .input(z.object({
        projectId: z.string(),
        status: z.string().min(1),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        try {
          const tasks = await db
            .select()
            .from(projectTasks)
            .where(
              and(
                eq(projectTasks.projectId, input.projectId),
                eq(projectTasks.status, input.status)
              )
            )
            .orderBy(projectTasks.order);
          
          return tasks;
        } catch (error) {
          console.error("Error listing tasks by status:", error);
          return [];
        }
      }),

    // List tasks pending approval
    listPendingApproval: readProcedure
      .input(z.object({
        projectId: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        try {
          let query = db
            .select()
            .from(projectTasks)
            .where(eq(projectTasks.approvalStatus, 'pending'));
          
          if (input?.projectId) {
            query = db
              .select()
              .from(projectTasks)
              .where(
                and(
                  eq(projectTasks.projectId, input.projectId),
                  eq(projectTasks.approvalStatus, 'pending')
                )
              );
          }
          
          const tasks = await query.orderBy(projectTasks.updatedAt);
          return tasks;
        } catch (error) {
          console.error("Error listing pending approval tasks:", error);
          return [];
        }
      }),

    // Approve task
    approve: updateProcedure
      .input(z.object({
        id: z.string(),
        adminRemarks: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

        try {
          await db.update(projectTasks).set({
            approvalStatus: 'approved',
            approvedBy: ctx.user.id,
            approvedAt: now,
            adminRemarks: input.adminRemarks || null,
            updatedAt: now,
          }).where(eq(projectTasks.id, input.id));

          // Log activity
          await logActivity({
            userId: ctx.user.id,
            action: "task_approved",
            entityType: "projectTask",
            entityId: input.id,
            description: `Approved task${input.adminRemarks ? ` with remarks: ${input.adminRemarks}` : ''}`,
          });

          return { success: true, message: "Task approved successfully" };
        } catch (error) {
          console.error("Error approving task:", error);
          throw new Error("Failed to approve task");
        }
      }),

    // Reject task with reason
    reject: updateProcedure
      .input(z.object({
        id: z.string(),
        rejectionReason: z.string(),
        adminRemarks: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

        try {
          await db.update(projectTasks).set({
            approvalStatus: 'rejected',
            approvedBy: ctx.user.id,
            approvedAt: now,
            rejectionReason: input.rejectionReason,
            adminRemarks: input.adminRemarks || null,
            updatedAt: now,
          }).where(eq(projectTasks.id, input.id));

          // Log activity
          await logActivity({
            userId: ctx.user.id,
            action: "task_rejected",
            entityType: "projectTask",
            entityId: input.id,
            description: `Rejected task - Reason: ${input.rejectionReason}`,
          });

          return { success: true, message: "Task rejected with reason" };
        } catch (error) {
          console.error("Error rejecting task:", error);
          throw new Error("Failed to reject task");
        }
      }),

    // Request revision on task
    requestRevision: updateProcedure
      .input(z.object({
        id: z.string(),
        revisionRemarks: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

        try {
          await db.update(projectTasks).set({
            approvalStatus: 'revision_requested',
            approvedBy: ctx.user.id,
            approvedAt: now,
            adminRemarks: input.revisionRemarks,
            updatedAt: now,
          }).where(eq(projectTasks.id, input.id));

          // Log activity
          await logActivity({
            userId: ctx.user.id,
            action: "task_revision_requested",
            entityType: "projectTask",
            entityId: input.id,
            description: `Revision requested: ${input.revisionRemarks}`,
          });

          return { success: true, message: "Revision requested" };
        } catch (error) {
          console.error("Error requesting revision:", error);
          throw new Error("Failed to request revision");
        }
      }),
  }),

  // Project Manager Assignment
  assignManager: updateProcedure
    .input(z.object({
      id: z.string(),
      projectManagerId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(projects)
        .set({ 
          projectManager: input.projectManagerId,
          updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        })
        .where(eq(projects.id, input.id));

      // Log activity
      await logActivity({
        userId: ctx.user.id,
        action: "project_manager_assigned",
        entityType: "project",
        entityId: input.id,
        description: `Assigned Project Manager`,
      });

      return { success: true };
    }),

  // Team Member Management
  teamMembers: router({
    list: readProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ input }) => {
        const database = await getDb();
        if (!database) return [];
        
        try {
          const results = await database
            .select({
              id: projectTeamMembers.id,
              projectId: projectTeamMembers.projectId,
              employeeId: projectTeamMembers.employeeId,
              role: projectTeamMembers.role,
              hoursAllocated: projectTeamMembers.hoursAllocated,
              startDate: projectTeamMembers.startDate,
              endDate: projectTeamMembers.endDate,
              isActive: projectTeamMembers.isActive,
              createdAt: projectTeamMembers.createdAt,
            })
            .from(projectTeamMembers)
            .where(eq(projectTeamMembers.projectId, input.projectId));
          
          return results;
        } catch (error) {
          console.error("Error fetching team members:", error);
          // Table may not exist yet, return empty array
          return [];
        }
      }),

    create: createProcedure
      .input(z.object({
        projectId: z.string(),
        employeeId: z.string(),
        role: z.string().optional(),
        hoursAllocated: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const id = uuidv4();
        const now = new Date();
        
        try {
          await database.insert(projectTeamMembers).values({
            id,
            projectId: input.projectId,
            employeeId: input.employeeId,
            role: input.role || undefined,
            hoursAllocated: input.hoursAllocated || undefined,
            startDate: input.startDate ? new Date(input.startDate) : undefined,
            endDate: input.endDate ? new Date(input.endDate) : undefined,
            isActive: true,
            createdBy: ctx.user.id,
            createdAt: now,
          });

          // Log activity
          try {
            await database.logActivity({
              userId: ctx.user.id,
              action: "team_member_added",
              entityType: "project",
              entityId: input.projectId,
              description: "Added staff member to project team",
            });
          } catch (err) {
            console.warn("Could not log activity:", err);
          }

          return { success: true, id };
        } catch (error) {
          console.error("Error creating team member:", error);
          const msg = error instanceof Error ? error.message : String(error);
          throw new Error(`Failed to add team member: ${msg}`);
        }
      }),

    update: updateProcedure
      .input(z.object({
        id: z.string(),
        role: z.string().optional(),
        hoursAllocated: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        const updates: any = {};
        
        if (input.role !== undefined) updates.role = input.role;
        if (input.hoursAllocated !== undefined) updates.hoursAllocated = input.hoursAllocated;
        if (input.startDate !== undefined) updates.startDate = input.startDate ? new Date(input.startDate) : null;
        if (input.endDate !== undefined) updates.endDate = input.endDate ? new Date(input.endDate) : null;
        if (input.isActive !== undefined) updates.isActive = input.isActive;

        try {
          await database.update(projectTeamMembers)
            .set(updates)
            .where(eq(projectTeamMembers.id, input.id));

          // Log activity
          try {
            await database.logActivity({
              userId: ctx.user.id,
              action: "team_member_updated",
              entityType: "projectTeamMember",
              entityId: input.id,
              description: "Updated team member assignment",
            });
          } catch (err) {
            console.warn("Could not log activity:", err);
          }

          return { success: true };
        } catch (error) {
          console.error("Error updating team member:", error);
          throw new Error("Failed to update team member. Please ensure database is migrated.");
        }
      }),

    delete: deleteProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        try {
          // Get team member info for logging
          const teamMember = await database.select()
            .from(projectTeamMembers)
            .where(eq(projectTeamMembers.id, input.id))
            .limit(1);

          await database.delete(projectTeamMembers)
            .where(eq(projectTeamMembers.id, input.id));

          // Log activity
          if (teamMember.length > 0) {
            try {
              await database.logActivity({
                userId: ctx.user.id,
                action: "team_member_removed",
                entityType: "project",
                entityId: teamMember[0].projectId,
                description: "Removed staff member from project team",
              });
            } catch (err) {
              console.warn("Could not log activity:", err);
            }
          }

          return { success: true };
        } catch (error) {
          console.error("Error deleting team member:", error);
          throw new Error("Failed to delete team member. Please ensure database is migrated.");
        }
      }),

    // Bulk reassign team members to different projects
    bulkReassign: updateProcedure
      .input(z.object({
        memberIds: z.array(z.string()),
        newProjectId: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        let successCount = 0;
        const errors: string[] = [];

        try {
          for (const memberId of input.memberIds) {
            try {
              const member = await database
                .select()
                .from(projectTeamMembers)
                .where(eq(projectTeamMembers.id, memberId))
                .limit(1);

              if (member.length === 0) {
                errors.push(`Team member ${memberId} not found`);
                continue;
              }

              const oldProjectId = member[0].projectId;

              // Update project
              await database
                .update(projectTeamMembers)
                .set({
                  projectId: input.newProjectId,
                  updatedAt: new Date(),
                })
                .where(eq(projectTeamMembers.id, memberId));

              // Log activity
              try {
                await database.logActivity({
                  userId: ctx.user.id,
                  action: "team_member_reassigned",
                  entityType: "projectTeamMember",
                  entityId: memberId,
                  description: `Reassigned from project ${oldProjectId} to ${input.newProjectId}`,
                });
              } catch (err) {
                console.warn("Could not log activity:", err);
              }

              successCount++;
            } catch (error) {
              errors.push(`Failed to reassign member ${memberId}: ${(error as any).message}`);
            }
          }

          return { success: true, successCount, errors, totalRequested: input.memberIds.length };
        } catch (error) {
          throw new Error(`Bulk reassign failed: ${(error as any).message}`);
        }
      }),

    // Bulk update team members (role, hours, dates)
    bulkUpdate: updateProcedure
      .input(z.object({
        memberIds: z.array(z.string()),
        updates: z.object({
          role: z.string().optional(),
          hoursAllocated: z.number().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          isActive: z.boolean().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        let successCount = 0;
        const errors: string[] = [];

        try {
          const updateObj: any = {
            updatedAt: new Date(),
          };

          if (input.updates.role !== undefined) updateObj.role = input.updates.role;
          if (input.updates.hoursAllocated !== undefined) updateObj.hoursAllocated = input.updates.hoursAllocated;
          if (input.updates.startDate !== undefined) updateObj.startDate = input.updates.startDate ? new Date(input.updates.startDate) : null;
          if (input.updates.endDate !== undefined) updateObj.endDate = input.updates.endDate ? new Date(input.updates.endDate) : null;
          if (input.updates.isActive !== undefined) updateObj.isActive = input.updates.isActive;

          for (const memberId of input.memberIds) {
            try {
              // Verify member exists
              const member = await database
                .select()
                .from(projectTeamMembers)
                .where(eq(projectTeamMembers.id, memberId))
                .limit(1);

              if (member.length === 0) {
                errors.push(`Team member ${memberId} not found`);
                continue;
              }

              // Update
              await database
                .update(projectTeamMembers)
                .set(updateObj)
                .where(eq(projectTeamMembers.id, memberId));

              // Log activity
              try {
                await database.logActivity({
                  userId: ctx.user.id,
                  action: "team_member_bulk_updated",
                  entityType: "projectTeamMember",
                  entityId: memberId,
                  description: `Updated team member assignment fields`,
                });
              } catch (err) {
                console.warn("Could not log activity:", err);
              }

              successCount++;
            } catch (error) {
              errors.push(`Failed to update member ${memberId}: ${(error as any).message}`);
            }
          }

          return { success: true, successCount, errors, totalRequested: input.memberIds.length };
        } catch (error) {
          throw new Error(`Bulk update failed: ${(error as any).message}`);
        }
      }),

    // Bulk delete team members
    bulkDelete: createFeatureRestrictedProcedure("projects:edit")
      .input(z.object({ memberIds: z.array(z.string()) }))
      .mutation(async ({ input, ctx }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        let successCount = 0;
        const errors: string[] = [];

        try {
          for (const memberId of input.memberIds) {
            try {
              // Get team member for logging
              const member = await database
                .select()
                .from(projectTeamMembers)
                .where(eq(projectTeamMembers.id, memberId))
                .limit(1);

              if (member.length === 0) {
                errors.push(`Team member ${memberId} not found`);
                continue;
              }

              // Delete
              await database.delete(projectTeamMembers).where(eq(projectTeamMembers.id, memberId));

              // Log activity
              try {
                await database.logActivity({
                  userId: ctx.user.id,
                  action: "team_member_deleted",
                  entityType: "project",
                  entityId: member[0].projectId,
                  description: "Bulk removed staff member from project team",
                });
              } catch (err) {
                console.warn("Could not log activity:", err);
              }

              successCount++;
            } catch (error) {
              errors.push(`Failed to delete member ${memberId}: ${(error as any).message}`);
            }
          }

          return { success: true, successCount, errors, totalRequested: input.memberIds.length };
        } catch (error) {
          throw new Error(`Bulk delete failed: ${(error as any).message}`);
        }
      }),

    // Get team workload summary for dashboard
    teamWorkloadSummary: readProcedure.query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) return [];

      try {
        // Get all active team members
        const teamMembers = await database
          .select()
          .from(projectTeamMembers)
          .where(eq(projectTeamMembers.isActive, true));

        if (teamMembers.length === 0) return [];

        // Get all employees
        const allEmployees = await database.select().from(employees);
        const employeeMap = new Map(allEmployees.map((e: any) => [e.id, e]));

        // Get all projects
        const allProjects = await database.select().from(projects);
        const projectMap = new Map(allProjects.map((p: any) => [p.id, p]));

        // Aggregate data by employee
        const workloadByEmployee: Record<string, any> = {};

        for (const member of teamMembers) {
          const employee = employeeMap.get(member.employeeId) as any;
          const project = projectMap.get(member.projectId) as any;

          if (!employee) continue; // Skip if employee doesn't exist

          const empId = member.employeeId;

          if (!workloadByEmployee[empId]) {
            workloadByEmployee[empId] = {
              employeeId: empId,
              name: `${employee.firstName || ''} ${employee.lastName || ''}`.trim(),
              firstName: employee.firstName,
              lastName: employee.lastName,
              department: employee.department || '',
              position: employee.position || '',
              status: employee.status,
              totalHoursAllocated: 0,
              projects: [],
              utilizationPercentage: 0,
            };
          }

          const hours = member.hoursAllocated || 0;
          workloadByEmployee[empId].totalHoursAllocated += hours;
          workloadByEmployee[empId].projects.push({
            teamMemberId: member.id,
            projectId: member.projectId,
            projectName: project?.name || 'Unknown Project',
            projectStatus: project?.status || 'pending',
            hoursAllocated: hours,
            role: member.role,
            startDate: member.startDate,
            endDate: member.endDate,
          });
        }

        // Calculate utilization percentage (assuming 40 hours per week)
        const standardWeeklyHours = 40;
        const result = Object.values(workloadByEmployee)
          .map((emp: any) => ({
            ...emp,
            utilizationPercentage: Math.min(100, Math.round((emp.totalHoursAllocated / standardWeeklyHours) * 100)),
          }))
          .sort((a: any, b: any) => {
            // Sort by utilization descending, then by name
            if (b.utilizationPercentage !== a.utilizationPercentage) {
              return b.utilizationPercentage - a.utilizationPercentage;
            }
            return a.name.localeCompare(b.name);
          });

        return result;
      } catch (error) {
        console.error("Error fetching team workload summary:", error);
        return [];
      }
    }),
  }),
});
