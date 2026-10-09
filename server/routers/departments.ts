import { router, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { departments, customRoles, employees, budgets, staffTasks, projects, projectTasks } from "../../drizzle/schema";
import { eq, and, or, inArray, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import * as db from "../db";
import { promoteDepartmentHead } from "../utils/department-head-promotion";
import { createNotification } from "../_core/notification";

export const departmentsRouter = router({
  list: createFeatureRestrictedProcedure("hr:departments:view")
    .input(z.object({
      limit: z.number().optional(),
      offset: z.number().optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) return [];

      const orgId = ctx.user.organizationId;
      const query = orgId
        ? database.select().from(departments).where(or(eq(departments.organizationId, orgId), isNull(departments.organizationId)))
        : database.select().from(departments).where(isNull(departments.organizationId));
      const rows = await (query as any).limit(input?.limit || 100).offset(input?.offset || 0);
      const employeeWhere = orgId ? eq(employees.organizationId, orgId) : isNull(employees.organizationId);
      const employeeRows = await database.select().from(employees).where(employeeWhere);
      const employeeById = new Map(employeeRows.map((employee) => [employee.id, employee]));
      return rows.map((r: any) => {
        const headEmployee = r.headId ? employeeById.get(r.headId) as any : null;
        return {
          ...r,
          isActive: (r as any).isActive !== undefined ? (r as any).isActive : ((r as any).status !== 'inactive'),
          headName: r.headId && headEmployee
            ? `${headEmployee.firstName || ''} ${headEmployee.lastName || ''}`.trim()
            : 'Unassigned',
          employeeCount: employeeRows.filter((employee: any) => employee.department === r.name).length,
        };
      });
    }),

  getById: createFeatureRestrictedProcedure("hr:departments:view")
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) return null;
      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(departments.id, input), eq(departments.organizationId, orgId)) : eq(departments.id, input);
      const result = await database.select().from(departments).where(where).limit(1);
      const row = result[0] || null;
      if (!row) return null;
      return {
        ...row,
        isActive: (row as any).isActive !== undefined ? (row as any).isActive : (row.status !== 'inactive'),
      };
    }),

  details: createFeatureRestrictedProcedure("hr:departments:view")
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) return null;

      const orgId = ctx.user.organizationId;
      const departmentWhere = orgId
        ? and(eq(departments.id, input), eq(departments.organizationId, orgId))
        : eq(departments.id, input);
      const departmentRows = await database.select().from(departments).where(departmentWhere).limit(1);
      const department = departmentRows[0];
      if (!department) return null;

      const employeeWhere = orgId
        ? and(eq(employees.organizationId, orgId), or(eq(employees.department, department.name), eq(employees.department, department.id)))
        : or(eq(employees.department, department.name), eq(employees.department, department.id));
      const departmentEmployees = await database.select().from(employees).where(employeeWhere);
      const employeeIds = departmentEmployees.map((employee) => employee.id);

      const departmentBudgets = await database.select().from(budgets).where(eq(budgets.departmentId, department.id));
      const tasks = await database.select().from(staffTasks).where(eq(staffTasks.departmentId, department.id));
      const departmentProjects = employeeIds.length
        ? await database.select().from(projects).where(inArray(projects.assignedTo, employeeIds))
        : [];
      const projectIds = departmentProjects.map((project) => project.id);
      const projectTaskRows = projectIds.length
        ? await database.select().from(projectTasks).where(inArray(projectTasks.projectId, projectIds))
        : [];

      const budgetTotal = departmentBudgets.reduce((total, budget) => total + (budget.amount || budget.totalBudgeted || 0), 0);
      const budgetRemaining = departmentBudgets.reduce((total, budget) => total + (budget.remaining || 0), 0);
      const projectBudget = departmentProjects.reduce((total, project) => total + (project.budget || 0), 0);
      const projectActual = departmentProjects.reduce((total, project) => total + (project.actualCost || 0), 0);

      return {
        department,
        employees: departmentEmployees,
        managers: departmentEmployees.filter((employee) => employee.id === department.headId || employee.position?.toLowerCase().includes('manager')),
        budgets: departmentBudgets,
        tasks,
        projects: departmentProjects,
        projectTasks: projectTaskRows,
        accounting: {
          budgetTotal,
          budgetRemaining,
          committed: budgetTotal - budgetRemaining,
          projectBudget,
          projectActual,
          variance: projectBudget - projectActual,
        },
        analytics: {
          employeeCount: departmentEmployees.length,
          activeEmployees: departmentEmployees.filter((employee) => employee.status === 'active').length,
          taskCount: tasks.length,
          completedTasks: tasks.filter((task) => task.status === 'completed').length,
          projectCount: departmentProjects.length,
          activeProjects: departmentProjects.filter((project) => project.status === 'active').length,
          projectTaskCount: projectTaskRows.length,
          completedProjectTasks: projectTaskRows.filter((task) => task.status === 'completed').length,
        },
      };
    }),

  moveEmployee: createFeatureRestrictedProcedure("hr:departments:edit")
    .input(z.object({ employeeId: z.string(), targetDepartmentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const orgId = ctx.user.organizationId;
      const targetWhere = orgId
        ? and(eq(departments.id, input.targetDepartmentId), eq(departments.organizationId, orgId))
        : eq(departments.id, input.targetDepartmentId);
      const targetRows = await database.select({ id: departments.id, name: departments.name }).from(departments).where(targetWhere).limit(1);
      const target = targetRows[0];
      if (!target) throw new Error("Target department not found");

      const employeeWhere = orgId
        ? and(eq(employees.id, input.employeeId), eq(employees.organizationId, orgId))
        : eq(employees.id, input.employeeId);
      const employeeRows = await database.select().from(employees).where(employeeWhere).limit(1);
      const employee = employeeRows[0];
      if (!employee) throw new Error("Employee not found");

      await database.update(employees).set({ department: target.name, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) as any }).where(eq(employees.id, employee.id));
      await db.logActivity({
        userId: ctx.user.id,
        action: "employee_department_moved",
        entityType: "employee",
        entityId: employee.id,
        description: `Moved ${employee.firstName} ${employee.lastName} to ${target.name}`,
      });

      return { success: true, department: target.name };
    }),

  create: createFeatureRestrictedProcedure("hr:departments:create")
    .input(z.object({
      name: z.string().min(1).max(100).optional(),
      departmentName: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional(),
      headId: z.string().optional().nullable(),
      budget: z.number().nonnegative().optional(),
      salaryRangeMin: z.number().nonnegative().optional().nullable(),
      salaryRangeMax: z.number().nonnegative().optional().nullable(),
      isActive: z.boolean().optional(),
      status: z.enum(['active', 'inactive']).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const deptName = (input.name || input.departmentName) as string;
      if (!deptName) throw new Error('Department name is required');

      const active = input.isActive !== undefined ? input.isActive : input.status !== 'inactive';

      let headUserId: string | null | undefined;
      if (input.headId) {
        const headWhere = ctx.user.organizationId
          ? and(eq(employees.id, input.headId), eq(employees.organizationId, ctx.user.organizationId))
          : eq(employees.id, input.headId);
        const headRows = await database.select({ id: employees.id, userId: employees.userId })
          .from(employees)
          .where(headWhere)
          .limit(1);
        if (!headRows[0]) throw new Error("Department head employee not found");
        headUserId = headRows[0].userId;
      }

      // Check for duplicate department name
      const existing = await database.select({ id: departments.id, name: departments.name }).from(departments).where(eq(departments.name, deptName)).limit(1);
      if (existing.length > 0) {
        throw new Error(`Department '${deptName}' already exists`);
      }

      const id = uuidv4();
      await database.insert(departments).values({
        id,
        organizationId: ctx.user.organizationId ?? undefined,
        name: deptName,
        description: input.description || '',
        headId: input.headId,
        budget: input.budget || 0,
        salaryRangeMin: input.salaryRangeMin ?? null,
        salaryRangeMax: input.salaryRangeMax ?? null,
        status: active === false ? 'inactive' : 'active',
        createdBy: ctx.user.id,
      } as any);

      if (input.headId) {
        await promoteDepartmentHead(headUserId, deptName);
        if (headUserId) {
          await createNotification({
            userId: headUserId,
            title: "Department Head Assignment",
            message: `You have been assigned as head of ${deptName}`,
            type: "info",
            organizationId: ctx.user.organizationId ?? undefined,
          });
        }
      }

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "department_created",
        entityType: "department",
        entityId: id,
        description: `Created department: ${deptName}`,
      });

      return { id };
    }),

  update: createFeatureRestrictedProcedure("hr:departments:edit")
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).max(100).optional(),
      departmentName: z.string().min(1).max(100).optional(),
      description: z.string().max(500).optional(),
      headId: z.string().optional().nullable(),
      budget: z.number().nonnegative().optional(),
      salaryRangeMin: z.number().nonnegative().optional().nullable(),
      salaryRangeMax: z.number().nonnegative().optional().nullable(),
      isActive: z.boolean().optional(),
      status: z.enum(['active', 'inactive']).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const department = await database.select().from(departments).where(eq(departments.id, input.id)).limit(1);
      if (!department.length) throw new Error("Department not found");

      // Verify org ownership before resolving a replacement head.
      const orgId = ctx.user.organizationId;
      if (orgId && department[0].organizationId !== orgId) throw new Error("Department not found");

      const hydratedName = input.name || input.departmentName;
      const nextHeadId = input.headId !== undefined ? input.headId : department[0].headId;
      let headUserId: string | null | undefined;
      if (nextHeadId && (input.headId !== undefined || hydratedName)) {
        const headWhere = orgId
          ? and(eq(employees.id, nextHeadId), eq(employees.organizationId, orgId))
          : eq(employees.id, nextHeadId);
        const headRows = await database.select({ id: employees.id, userId: employees.userId })
          .from(employees)
          .where(headWhere)
          .limit(1);
        if (!headRows[0]) throw new Error("Department head employee not found");
        headUserId = headRows[0].userId;
      }

      // Check for duplicate department name if changing it
      if (hydratedName && hydratedName !== department[0].name) {
        const existing = await database.select().from(departments).where(eq(departments.name, hydratedName)).limit(1);
        if (existing.length > 0) {
          throw new Error(`Department '${hydratedName}' already exists`);
        }
      }

      const updateData: any = {};
      if (hydratedName) updateData.name = hydratedName;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.headId !== undefined) updateData.headId = input.headId;
      if (input.budget !== undefined) updateData.budget = input.budget;
      if (input.salaryRangeMin !== undefined) updateData.salaryRangeMin = input.salaryRangeMin;
      if (input.salaryRangeMax !== undefined) updateData.salaryRangeMax = input.salaryRangeMax;
      if (input.isActive !== undefined) updateData.status = input.isActive ? 'active' : 'inactive';
      else if (input.status !== undefined) updateData.status = input.status;

      await database.update(departments).set(updateData).where(eq(departments.id, input.id));

      if (nextHeadId && headUserId !== undefined) {
        const targetDepartmentName = hydratedName || department[0].name;
        const promoted = await promoteDepartmentHead(headUserId, targetDepartmentName);
        if ((input.headId !== undefined || promoted) && headUserId) {
          await createNotification({
            userId: headUserId,
            title: "Department Head Assignment",
            message: `You have been assigned as head of ${targetDepartmentName}`,
            type: "info",
            organizationId: department[0].organizationId ?? undefined,
          });
        }
      }

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "department_updated",
        entityType: "department",
        entityId: input.id,
        description: `Updated department: ${department[0].name}`,
      });

      return { success: true };
    }),

  delete: createFeatureRestrictedProcedure("hr:departments:delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const department = await database.select().from(departments).where(eq(departments.id, input)).limit(1);
      if (!department.length) throw new Error("Department not found");

      // Verify org ownership
      const orgId = ctx.user.organizationId;
      if (orgId && department[0].organizationId !== orgId) throw new Error("Department not found");

      await database.delete(departments).where(eq(departments.id, input));

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "department_deleted",
        entityType: "department",
        entityId: input,
        description: `Deleted department: ${department[0].name}`,
      });

      return { success: true };
    }),

  getActive: createFeatureRestrictedProcedure("hr:departments:view")
    .query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) return [];

      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(departments.status, 'active'), or(eq(departments.organizationId, orgId), isNull(departments.organizationId))) : eq(departments.status, 'active');
      const rows = await database.select().from(departments).where(where);
      return rows.map((r: any) => ({
        ...r,
        isActive: true,
      }));
    }),

  getWorkflowOptions: createFeatureRestrictedProcedure("hr:departments:view")
    .query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) return { departments: [], roles: [] };

      const departmentWhere = ctx.user.organizationId
        ? and(eq(departments.status, "active"), or(eq(departments.organizationId, ctx.user.organizationId), isNull(departments.organizationId)))
        : eq(departments.status, "active");
      const departmentRows = await database.select().from(departments).where(departmentWhere);
      const roleRows = await database.select().from(customRoles).where(eq(customRoles.isActive, 1));

      const systemRoles = [
        ["user", "User"], ["admin", "Administrator"], ["staff", "Staff"], ["accountant", "Accountant"],
        ["client", "Client"], ["super_admin", "Super Admin"], ["project_manager", "Project Manager"],
        ["hr", "HR Manager"], ["ict_manager", "ICT Manager"], ["procurement_manager", "Procurement Manager"], ["sales_manager", "Sales Manager"],
      ].map(([value, label]) => ({ value, label, isCustom: false }));

      return {
        departments: departmentRows.map((department: any) => ({ ...department, isSystem: !department.organizationId })),
        roles: [
          ...systemRoles,
          ...roleRows.map((role: any) => ({ id: role.id, value: role.id, label: role.displayName || role.name, displayName: role.displayName || role.name, isCustom: true, baseRole: role.baseRole })),
        ],
      };
    }),

  getSummary: createFeatureRestrictedProcedure("hr:departments:view")
    .query(async ({ ctx }) => {
      const database = await getDb();
      if (!database) return {
        totalDepartments: 0,
        activeDepartments: 0,
        totalBudget: 0,
      };

      const orgId = ctx.user.organizationId;
      const allDepartments = orgId
        ? await database.select().from(departments).where(eq(departments.organizationId, orgId))
        : await database.select().from(departments);

      const activeDepartments = allDepartments.filter(d => d.status === 'active').length;
      const totalBudget = allDepartments.reduce((sum, d) => sum + (d.budget || 0), 0);

      return {
        totalDepartments: allDepartments.length,
        activeDepartments,
        totalBudget,
      };
    }),

  bulkDelete: createFeatureRestrictedProcedure("hr:departments:delete")
    .input(z.array(z.string()).min(1))
    .mutation(async ({ input, ctx }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");

      const results = {
        deleted: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const departmentId of input) {
        try {
          const department = await database.select().from(departments).where(eq(departments.id, departmentId)).limit(1);
          if (!department.length) {
            results.failed++;
            results.errors.push(`Department ${departmentId} not found`);
            continue;
          }

          await database.delete(departments).where(eq(departments.id, departmentId));
          results.deleted++;

          // Log activity
          await db.logActivity({
            userId: ctx.user.id,
            action: "department_deleted",
            entityType: "department",
            entityId: departmentId,
            description: `Bulk deleted department: ${department[0].name}`,
          });
        } catch (error) {
          results.failed++;
          results.errors.push(`Error deleting ${departmentId}: ${error}`);
        }
      }

      return results;
    }),
});
