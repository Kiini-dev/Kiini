import { router, protectedProcedure } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb, logActivity } from "../db";
import { employees, jobGroups, users, departments, customRoles, projects, projectTasks, timeEntries, documents, performanceContracts, performanceReviews, leaveBalances, leaveRequests } from "../../drizzle/schema";
import { projectTeamMembers, salaryStructures, salaryAllowances, salaryDeductions, employeeBenefits, salaryIncrements, employeeDisciplinaryActions, employeeDepartmentMovements } from "../../drizzle/schema-extended";
import { eq, desc, gt, inArray, and, or, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { generatePassword, hashPassword } from "../lib/passwordUtils";
import { enforceOrganizationIsolation, combineOrgFilters } from "../middleware/organizationIsolationEnforcer";
import { startEmployeeOffboarding, startEmployeeOnboarding } from "../services/employeeAutomation";
import {
  applyJobGroupCompensationDefaults,
  resolveJobGroupPayrollAmount,
  toPayrollStorageAmount,
} from "../services/jobGroupPayrollDefaults";

export function normalizeEmployeePayload<T extends Record<string, any>>(payload: T) {
  const normalized: Record<string, any> = { ...payload };

  if (normalized.country === undefined && typeof normalized.countryCode === "string") {
    normalized.country = normalized.countryCode;
  }

  if (normalized.country === undefined && typeof normalized.country_name === "string") {
    normalized.country = normalized.country_name;
  }

  if (normalized.bankAccountNumber === undefined && typeof normalized.bankAccount === "string") {
    normalized.bankAccountNumber = normalized.bankAccount;
  }

  if (normalized.bankName === undefined && typeof normalized.bankAccountName === "string") {
    normalized.bankName = normalized.bankAccountName;
  }

  if (normalized.emergencyContactPhone === undefined && typeof normalized.emergencyContactNumber === "string") {
    normalized.emergencyContactPhone = normalized.emergencyContactNumber;
  }

  if (normalized.emergencyContactName === undefined && typeof normalized.nextOfKinName === "string") {
    normalized.emergencyContactName = normalized.nextOfKinName;
  }

  if (normalized.emergencyContactPhone === undefined && typeof normalized.nextOfKinPhone === "string") {
    normalized.emergencyContactPhone = normalized.nextOfKinPhone;
  }

  if (normalized.nationalId === undefined && typeof normalized.nationalID === "string") {
    normalized.nationalId = normalized.nationalID;
  }

  if (normalized.salary === undefined && typeof normalized.grossSalary === "number") {
    normalized.salary = normalized.grossSalary;
  }

  if (normalized.salary === undefined && typeof normalized.monthlySalary === "number") {
    normalized.salary = normalized.monthlySalary;
  }

  if (normalized.dateOfBirth === undefined && normalized.dob !== undefined) {
    normalized.dateOfBirth = normalized.dob;
  }

  return normalized as T;
}

export { resolveJobGroupPayrollAmount, toPayrollStorageAmount };

export async function applyJobGroupPayrollDefaults(db: any, employee: any, jobGroup: any, actorId: string) {
  const now = new Date();
  const effectiveDate = now.toISOString().replace("T", " ").substring(0, 19);
  await applyJobGroupCompensationDefaults(db, employee, jobGroup, actorId);

  if (employee.organizationId) {
    const fiscalYear = now.getFullYear();
    const existingLeave = await db.select({ id: leaveBalances.id }).from(leaveBalances)
      .where(and(eq(leaveBalances.employeeId, employee.id), eq(leaveBalances.fiscalYear, fiscalYear), eq(leaveBalances.leaveType, "annual"))).limit(1);
    if (!existingLeave.length) {
      const entitlement = jobGroup.defaultAnnualLeaveDays ?? 21;
      await db.insert(leaveBalances).values({ id: uuidv4(), organizationId: employee.organizationId, employeeId: employee.id, fiscalYear, leaveType: "annual", totalEntitlement: entitlement, accrued: 0, used: 0, available: entitlement, createdAt: effectiveDate } as any);
    }
  }
}

// Helper function to generate next employee number
async function generateNextEmployeeNumber(db: any): Promise<string> {
  try {
    // Query for the highest employee number
    const result = await db.select({ empNum: employees.employeeNumber })
      .from(employees)
      .orderBy(desc(employees.employeeNumber))
      .limit(1);
    
    if (result.length === 0) {
      return "1100";
    }

    // Extract the numeric part from the employee number (e.g., "EMP-00101" -> 101)
    const lastNumber = result[0].empNum;
    const match = lastNumber.match(/(\d+)$/);
    
    if (!match) {
      return "1100";
    }

    const nextNum = parseInt(match[1]) + 1;
    return String(Math.max(nextNum, 1100)).padStart(4, '0');
  } catch (err) {
    console.warn("Error generating employee number, using default:", err);
    return "1100";
  }
}

function normalizeEmployeeNumber(value: string): string {
  const digits = value.match(/\d+/g)?.join("");
  return digits ? String(Math.max(Number(digits), 1100)).padStart(4, "0") : "";
}

const MAX_EMPLOYEE_PHOTO_URL_LENGTH = 6_500_000;

export function normalizeEmployeePhotoUrl(value: string | undefined): string | null {
  if (!value) return null;
  if (value.length <= MAX_EMPLOYEE_PHOTO_URL_LENGTH) return value;

  if (value.startsWith("data:")) {
    console.warn("[Employees] Omitting oversized inline photo data; store employee photos as a URL instead");
  }
  return null;
}

export const employeesRouter = router({
  list: createFeatureRestrictedProcedure("employees:read")
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }).optional())
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          console.error("[Employees] Database connection not available");
          return [];
        }
        const orgFilter = enforceOrganizationIsolation(ctx.user, employees.organizationId, false);
        console.log("[Employees] Attempting to fetch employees with limit:", input?.limit || 50);
        const limit = input?.limit || 50;
        const offset = input?.offset || 0;
        const result = orgFilter
          ? await db.select().from(employees).where(orgFilter).limit(limit).offset(offset)
          : await db.select().from(employees).limit(limit).offset(offset);
        const eligibleEmployees = result.filter((employee: any) => ["active", "on_leave", "on-leave"].includes(employee.status));
        const onLeaveIds = eligibleEmployees.length
          ? new Set((await db.select({ employeeId: leaveRequests.employeeId }).from(leaveRequests).where(and(
              inArray(leaveRequests.employeeId, eligibleEmployees.map((employee: any) => employee.id)),
              eq(leaveRequests.status, "approved"),
              sql`DATE(${leaveRequests.startDate}) <= CURRENT_DATE`,
              sql`DATE(${leaveRequests.endDate}) >= CURRENT_DATE`,
            ))).map((request: any) => request.employeeId))
          : new Set<string>();
        console.log("[Employees] Successfully fetched", result?.length || 0, "employees");
        return result.map((employee: any) => ({
          ...employee,
          isCurrentlyOnLeave: onLeaveIds.has(employee.id),
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("[Employees] Error fetching employees - Database Error:", errorMessage);
        console.error("[Employees] Full error details:", error);
        return [];
      }
    }),

  getById: createFeatureRestrictedProcedure("employees:read")
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const orgFilter = enforceOrganizationIsolation(ctx.user, employees.organizationId, false);
      const where = orgFilter ? and(eq(employees.id, input), orgFilter) : eq(employees.id, input);
      const result = await db.select().from(employees).where(where).limit(1);
      return result[0] || null;
    }),

  byUserId: createFeatureRestrictedProcedure("employees:read")
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const orgFilter = enforceOrganizationIsolation(ctx.user, employees.organizationId, false);
      const where = orgFilter ? and(eq(employees.userId, input.userId), orgFilter) : eq(employees.userId, input.userId);
      const result = await db.select().from(employees).where(where).limit(1);
      return result[0] || null;
    }),

  getRelatedData: createFeatureRestrictedProcedure("employees:read")
    .input(z.object({ employeeId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { projects: [], tasks: [], timeEntries: [], documents: [], performanceContracts: [], allowances: [], deductions: [], benefits: [], performanceReviews: [], activity: [] };

      const employeeOrgFilter = enforceOrganizationIsolation(ctx.user, employees.organizationId, false);
      const employeeWhere = employeeOrgFilter
        ? and(eq(employees.id, input.employeeId), employeeOrgFilter)
        : eq(employees.id, input.employeeId);
      const employee = await db.select({ id: employees.id, userId: employees.userId, organizationId: employees.organizationId })
        .from(employees)
        .where(employeeWhere)
        .limit(1);
      if (!employee[0]) return { projects: [], tasks: [], timeEntries: [], documents: [], performanceContracts: [], allowances: [], deductions: [], benefits: [], performanceReviews: [], activity: [] };

      let memberRows: any[] = [];
      try {
        memberRows = await db.select().from(projectTeamMembers).where(eq(projectTeamMembers.employeeId, input.employeeId));
      } catch (error) {
        console.warn("Could not load employee project memberships:", error);
      }
      const safeQuery = async (label: string, query: Promise<any[]>): Promise<any[]> => {
        try { return await query; } catch (error) {
          console.warn(`[Employees] Could not load ${label}:`, error);
          return [];
        }
      };
      const projectIds = memberRows.map((row: any) => row.projectId).filter(Boolean);
      const relatedProjects = projectIds.length
        ? await safeQuery("employee projects", db.select().from(projects).where(inArray(projects.id, projectIds)))
        : [];
      const relatedTasks = await safeQuery("employee tasks", db.select().from(projectTasks).where(eq(projectTasks.assignedTo, input.employeeId)));
      const relatedTimeEntries = employee[0].userId
        ? await safeQuery("employee time entries", db.select().from(timeEntries).where(eq(timeEntries.userId, employee[0].userId)))
        : [];
      const relatedDocuments = await safeQuery("employee documents", db.select().from(documents).where(
        employee[0].userId
          ? or(eq(documents.linkedEntityId, input.employeeId), eq(documents.uploadedBy, employee[0].userId))
          : eq(documents.linkedEntityId, input.employeeId)
      ));
      const relatedContracts = await safeQuery("performance contracts", db.select().from(performanceContracts).where(eq(performanceContracts.employeeId, input.employeeId)));
      const [relatedAllowances, relatedDeductions, relatedBenefits, relatedReviews] = await Promise.all([
        safeQuery("employee allowances", db.select().from(salaryAllowances).where(eq(salaryAllowances.employeeId, input.employeeId))),
        safeQuery("employee deductions", db.select().from(salaryDeductions).where(eq(salaryDeductions.employeeId, input.employeeId))),
        safeQuery("employee benefits", db.select().from(employeeBenefits).where(eq(employeeBenefits.employeeId, input.employeeId))),
        safeQuery("performance reviews", db.select().from(performanceReviews).where(eq(performanceReviews.employeeId, input.employeeId))),
      ]);

      let activity: any[] = [];
      try {
        const [rows] = await db.execute(
          `SELECT id, action, entityType, entityId, description, createdAt
           FROM activityLog
           WHERE entityType = 'employee' AND entityId = ?
           ORDER BY createdAt DESC LIMIT 30`,
          [input.employeeId]
        );
        activity = rows as any[];
      } catch (error) {
        console.warn("Could not load employee activity:", error);
      }

      return {
        projects: relatedProjects.map((project: any) => ({
          ...project,
          teamRole: memberRows.find((member: any) => member.projectId === project.id)?.role || "Team member",
        })),
        tasks: relatedTasks,
        timeEntries: relatedTimeEntries,
        documents: relatedDocuments,
        performanceContracts: relatedContracts,
        allowances: relatedAllowances,
        deductions: relatedDeductions,
        benefits: relatedBenefits,
        performanceReviews: relatedReviews,
        activity,
      };
    }),

  byDepartment: createFeatureRestrictedProcedure("employees:read")
    .input(z.object({ department: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const where = combineOrgFilters(ctx.user, employees.organizationId, eq(employees.department, input.department), false);
      const result = where ? await db.select().from(employees).where(where) : await db.select().from(employees).where(eq(employees.department, input.department));
      return result;
    }),

  byJobGroup: createFeatureRestrictedProcedure("employees:read")
    .input(z.object({ jobGroupId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const where = combineOrgFilters(ctx.user, employees.organizationId, eq(employees.jobGroupId, input.jobGroupId), false);
      const result = where ? await db.select().from(employees).where(where) : await db.select().from(employees).where(eq(employees.jobGroupId, input.jobGroupId));
      return result;
    }),

  getNextEmployeeNumber: createFeatureRestrictedProcedure("employees:read")
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const nextNumber = await generateNextEmployeeNumber(db);
      return { employeeNumber: nextNumber };
    }),

  create: createFeatureRestrictedProcedure("employees:create")
    .input(z.object({
      employeeNumber: z.string().optional(),
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
      country: z.string().optional(),
      gender: z.enum(['male','female','other']).optional(),
      maritalStatus: z.enum(['single','married','divorced','widowed']).optional(),
      dateOfBirth: z.coerce.date().optional(),
      hireDate: z.coerce.date(),
      probationEndDate: z.coerce.date().optional(),
      contractEndDate: z.coerce.date().optional(),
      department: z.string().optional(),
      position: z.string().optional(),
      jobGroupId: z.string(),
      salary: z.number().optional(),
      employmentType: z.string().optional(),
      status: z.string().optional(),
      photoUrl: z.string().optional(),
      address: z.string().optional(),
      emergencyContactName: z.string().optional(),
      emergencyContactRelationship: z.string().optional(),
      emergencyContactPhone: z.string().optional(),
      emergencyContact: z.string().optional(),
      bankName: z.string().optional(),
      bankBranch: z.string().optional(),
      bankAccountNumber: z.string().optional(),
      nhifNumber: z.string().optional(),
      nssfNumber: z.string().optional(),
      taxId: z.string().optional(),
      nationalId: z.string().optional(),
      accountMode: z.enum(["none", "existing", "create"]).default("none"),
      existingUserId: z.string().optional(),
      role: z.enum(["user", "admin", "staff", "accountant", "client", "super_admin", "project_manager", "hr", "ict_manager", "procurement_manager", "sales_manager"]).optional(),
      customRoleId: z.string().optional(),
      permissions: z.array(z.string()).optional(),
      password: z.string().min(8).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const normalizedInput = normalizeEmployeePayload(input);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const id = uuidv4();
      let userId: string | null = null;
      
      // Generate employee number if not provided
      let employeeNumber = normalizedInput.employeeNumber ? normalizeEmployeeNumber(normalizedInput.employeeNumber) : "";
      if (!employeeNumber) {
        employeeNumber = await generateNextEmployeeNumber(db);
      }

      // Validate job group exists
      const jobGroup = await db.select().from(jobGroups)
        .where(eq(jobGroups.id, input.jobGroupId))
        .limit(1);
      
      if (!jobGroup || jobGroup.length === 0) {
        throw new Error("Job group not found");
      }

      // Validate salary is within job group range if provided
      if (normalizedInput.salary) {
        if (normalizedInput.salary < jobGroup[0].minimumGrossSalary || 
            normalizedInput.salary > jobGroup[0].maximumGrossSalary) {
          throw new Error(
            `Salary must be between ${jobGroup[0].minimumGrossSalary} and ${jobGroup[0].maximumGrossSalary} for this job group`
          );
        }
      }

      if (normalizedInput.department) {
        const department = await db.select().from(departments)
          .where(eq(departments.name, normalizedInput.department)).limit(1);
        const minSalary = department[0]?.salaryRangeMin;
        const maxSalary = department[0]?.salaryRangeMax;
        if (minSalary != null && normalizedInput.salary != null && normalizedInput.salary < minSalary) {
          throw new Error(`Salary must be at least ${minSalary} for the ${normalizedInput.department} department`);
        }
        if (maxSalary != null && normalizedInput.salary != null && normalizedInput.salary > maxSalary) {
          throw new Error(`Salary must not exceed ${maxSalary} for the ${normalizedInput.department} department`);
        }
      }

      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const hireDate = normalizedInput.hireDate instanceof Date 
        ? normalizedInput.hireDate.toISOString().replace('T', ' ').substring(0, 19)
        : new Date(normalizedInput.hireDate).toISOString().replace('T', ' ').substring(0, 19);

      // Account creation/linking is explicit so employees do not silently become staff users.
      let generatedPassword: string | null = null;
      if (normalizedInput.accountMode === "existing") {
        if (!normalizedInput.existingUserId) throw new Error("Select an existing user to link");
        const existingUser = await db.select().from(users).where(eq(users.id, normalizedInput.existingUserId)).limit(1);
        if (!existingUser.length) throw new Error("User not found");
        if (ctx.user.organizationId && existingUser[0].organizationId !== ctx.user.organizationId) throw new Error("User belongs to another organization");
        userId = existingUser[0].id;
      } else if (normalizedInput.accountMode === "create") {
        if (!normalizedInput.email) throw new Error("An email address is required to create a user account");
        try {
          userId = uuidv4();
          const userExists = await db.select().from(users)
            .where(eq(users.email, normalizedInput.email))
            .limit(1);
          
          if (!userExists || userExists.length === 0) {
            // Determine role from explicit selection, then department default, then staff.
            let assignedRole: string = normalizedInput.role || 'staff';
            let assignedCustomRoleId: string | null = normalizedInput.customRoleId || null;

            if (!normalizedInput.role && !normalizedInput.customRoleId && normalizedInput.department) {
              try {
                // Look up department by name to find defaultRole
                const deptResult = await db.select().from(departments)
                  .where(eq(departments.name, normalizedInput.department))
                  .limit(1);
                
                if (deptResult.length > 0 && deptResult[0].defaultRole) {
                  const defaultRole = deptResult[0].defaultRole;
                  // Check if defaultRole is a system role enum value
                  const systemRoles = ['user','admin','staff','accountant','client','super_admin','project_manager','hr','ict_manager','procurement_manager','sales_manager'];
                  if (systemRoles.includes(defaultRole)) {
                    assignedRole = defaultRole;
                  } else {
                    // It's a custom role ID - verify it exists and is active
                    const customRole = await db.select().from(customRoles)
                      .where(and(eq(customRoles.id, defaultRole), eq(customRoles.isActive, 1)))
                      .limit(1);
                    if (customRole.length > 0) {
                      assignedCustomRoleId = customRole[0].id;
                      assignedRole = (customRole[0].baseRole as string) || 'staff';
                    }
                  }
                }
              } catch (deptErr) {
                console.warn("Failed to look up department default role:", deptErr);
              }
            }

            // Generate a strong password
            generatedPassword = normalizedInput.password ? null : generatePassword(14);
            const password = normalizedInput.password || generatedPassword;
            if (!password) throw new Error("A password is required");
            const passwordHash = await hashPassword(password);
            
            await db.insert(users).values({
              id: userId,
              name: `${normalizedInput.firstName} ${normalizedInput.lastName}`.trim(),
              email: normalizedInput.email,
              role: assignedRole,
              passwordHash: passwordHash,
              isActive: 1,
              organizationId: ctx.user.organizationId ?? null,
              customRoleId: assignedCustomRoleId,
              permissions: normalizedInput.permissions?.length ? JSON.stringify(normalizedInput.permissions) : null,
              createdAt: now,
            } as any);
          } else {
            throw new Error("A user with this email already exists. Choose Link existing user instead.");
          }
        } catch (userError) {
          console.error("Failed to create user account for employee:", userError);
          throw userError;
        }
      }

      await db.insert(employees).values({
        id,
        userId: userId || null,
        employeeNumber,
        firstName: normalizedInput.firstName,
        lastName: normalizedInput.lastName,
        email: normalizedInput.email || null,
        phone: normalizedInput.phone || null,
        country: normalizedInput.country || null,
        gender: normalizedInput.gender || null,
        maritalStatus: normalizedInput.maritalStatus || null,
        dateOfBirth: normalizedInput.dateOfBirth ? normalizedInput.dateOfBirth.toISOString().replace('T', ' ').substring(0, 19) : null,
        hireDate,
        probationEndDate: normalizedInput.probationEndDate ? normalizedInput.probationEndDate.toISOString().replace('T', ' ').substring(0, 19) : null,
        contractEndDate: normalizedInput.contractEndDate ? normalizedInput.contractEndDate.toISOString().replace('T', ' ').substring(0, 19) : null,
        department: normalizedInput.department || null,
        position: normalizedInput.position || null,
        jobGroupId: normalizedInput.jobGroupId,
        salary: normalizedInput.salary || null,
        employmentType: normalizedInput.employmentType || 'full_time',
        status: normalizedInput.status || 'active',
        photoUrl: normalizeEmployeePhotoUrl(normalizedInput.photoUrl),
        address: normalizedInput.address || null,
        emergencyContactName: normalizedInput.emergencyContactName || null,
        emergencyContactRelationship: normalizedInput.emergencyContactRelationship || null,
        emergencyContactPhone: normalizedInput.emergencyContactPhone || null,
        emergencyContact: normalizedInput.emergencyContact || null,
        bankName: normalizedInput.bankName || null,
        bankBranch: normalizedInput.bankBranch || null,
        bankAccountNumber: normalizedInput.bankAccountNumber || null,
        nhifNumber: normalizedInput.nhifNumber || null,
        nssfNumber: normalizedInput.nssfNumber || null,
        taxId: normalizedInput.taxId || null,
        nationalId: normalizedInput.nationalId || null,
        createdBy: ctx.user.id,
        createdAt: now,
        updatedAt: now,
        organizationId: ctx.user.organizationId ?? null,
      } as any);

      await applyJobGroupPayrollDefaults(db, { id, organizationId: ctx.user.organizationId, salary: normalizedInput.salary }, jobGroup[0], ctx.user.id);

      try {
        await startEmployeeOnboarding({
          employeeId: id,
          organizationId: ctx.user.organizationId,
          userId,
          employeeName: `${normalizedInput.firstName} ${normalizedInput.lastName}`.trim(),
          actorUserId: ctx.user.id,
        });
      } catch (automationError) {
        console.warn("[Employees] Onboarding automation failed:", automationError);
      }
      
      return { id, employeeNumber, generatedPassword, userId };
    }),

  update: createFeatureRestrictedProcedure("employees:edit")
    .input(z.object({
      id: z.string(),
      employeeNumber: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      country: z.string().optional(),
      gender: z.string().optional(),
      maritalStatus: z.string().optional(),
      dateOfBirth: z.coerce.date().optional(),
      hireDate: z.coerce.date().optional(),
      probationEndDate: z.string().optional(),
      contractEndDate: z.string().optional(),
      department: z.string().optional(),
      position: z.string().optional(),
      jobGroupId: z.string().optional(),
      salary: z.number().optional(),
      employmentType: z.string().optional(),
      status: z.string().optional(),
      photoUrl: z.string().optional(),
      nationalId: z.string().optional(),
      taxId: z.string().optional(),
      nhifNumber: z.string().optional(),
      nssfNumber: z.string().optional(),
      address: z.string().optional(),
      emergencyContactName: z.string().optional(),
      emergencyContactRelationship: z.string().optional(),
      emergencyContactPhone: z.string().optional(),
      emergencyContact: z.string().optional(),
      bankName: z.string().optional(),
      bankBranch: z.string().optional(),
      bankAccountNumber: z.string().optional(),
      accountMode: z.enum(["none", "existing", "create"]).optional(),
      existingUserId: z.string().optional(),
      role: z.enum(["user", "admin", "staff", "accountant", "client", "super_admin", "project_manager", "hr", "ict_manager", "procurement_manager", "sales_manager"]).optional(),
      customRoleId: z.string().optional(),
      permissions: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const normalizedInput = normalizeEmployeePayload(input);
      const { id, accountMode, existingUserId, role, customRoleId, permissions, ...data } = normalizedInput;
      const orgId = ctx.user.organizationId;
      const ownerCheck = orgId ? and(eq(employees.id, id), eq(employees.organizationId, orgId)) : eq(employees.id, id);
      const lifecycleEmployee = await db.select().from(employees).where(ownerCheck).limit(1);
      if (!lifecycleEmployee.length) throw new Error("Employee not found");

      // If jobGroupId or salary is being updated, validate
      if (data.jobGroupId || data.salary !== undefined) {
        const currentEmployee = await db.select().from(employees)
          .where(ownerCheck)
          .limit(1);
        
        if (!currentEmployee || currentEmployee.length === 0) {
          throw new Error("Employee not found");
        }

        const jobGroupId = data.jobGroupId || currentEmployee[0].jobGroupId;
        const jobGroup = await db.select().from(jobGroups)
          .where(eq(jobGroups.id, jobGroupId))
          .limit(1);
        
        if (!jobGroup || jobGroup.length === 0) {
          throw new Error("Job group not found");
        }

        // Validate salary if provided
        if (data.salary !== undefined) {
          if (data.salary < jobGroup[0].minimumGrossSalary || 
              data.salary > jobGroup[0].maximumGrossSalary) {
            throw new Error(
              `Salary must be between ${jobGroup[0].minimumGrossSalary} and ${jobGroup[0].maximumGrossSalary} for this job group`
            );
          }
        }
      }

      if (data.department !== undefined || data.salary !== undefined) {
        const department = data.department
          ? await db.select().from(departments).where(eq(departments.name, data.department)).limit(1)
          : [];
        const minSalary = department[0]?.salaryRangeMin;
        const maxSalary = department[0]?.salaryRangeMax;
        if (minSalary != null && data.salary != null && data.salary < minSalary) throw new Error(`Salary must be at least ${minSalary} for the ${data.department} department`);
        if (maxSalary != null && data.salary != null && data.salary > maxSalary) throw new Error(`Salary must not exceed ${maxSalary} for the ${data.department} department`);
      }

      const updateData: any = {
        ...data,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };

      if (data.country !== undefined) {
        updateData.country = data.country || null;
      }

      // Convert date fields if provided
      if (data.hireDate) {
        updateData.hireDate = data.hireDate instanceof Date 
          ? data.hireDate.toISOString().replace('T', ' ').substring(0, 19)
          : new Date(data.hireDate).toISOString().replace('T', ' ').substring(0, 19);
      }

      if (data.dateOfBirth) {
        updateData.dateOfBirth = data.dateOfBirth instanceof Date
          ? data.dateOfBirth.toISOString().replace('T', ' ').substring(0, 19)
          : new Date(data.dateOfBirth).toISOString().replace('T', ' ').substring(0, 19);
      }

      await db.update(employees).set(updateData).where(eq(employees.id, id));

      if (data.jobGroupId || data.salary !== undefined) {
        const effectiveJobGroupId = data.jobGroupId || lifecycleEmployee[0].jobGroupId;
        const [effectiveJobGroup] = await db.select().from(jobGroups).where(eq(jobGroups.id, effectiveJobGroupId)).limit(1);
        if (effectiveJobGroup) {
          await applyJobGroupPayrollDefaults(db, { id, organizationId: lifecycleEmployee[0].organizationId, salary: data.salary ?? lifecycleEmployee[0].salary }, effectiveJobGroup, ctx.user.id);
        }
      }

      if (accountMode === "none") {
        updateData.userId = null;
        await db.update(employees).set({ userId: null, updatedAt: updateData.updatedAt }).where(eq(employees.id, id));
      } else if (accountMode === "existing") {
        if (!existingUserId) throw new Error("Select an existing user to link");
        const targetUser = await db.select().from(users).where(eq(users.id, existingUserId)).limit(1);
        if (!targetUser.length) throw new Error("User not found");
        if (orgId && targetUser[0].organizationId !== orgId) throw new Error("User belongs to another organization");
        const alreadyLinked = await db.select({ id: employees.id }).from(employees).where(eq(employees.userId, existingUserId)).limit(1);
        if (alreadyLinked.length && alreadyLinked[0].id !== id) throw new Error("User is already linked to another employee");
        await db.update(employees).set({ userId: existingUserId, updatedAt: updateData.updatedAt }).where(eq(employees.id, id));
        if (role !== undefined || customRoleId !== undefined || permissions !== undefined) {
          await db.update(users).set({
            role: role || targetUser[0].role,
            customRoleId: customRoleId || null,
            permissions: permissions ? JSON.stringify(permissions) : targetUser[0].permissions,
          } as any).where(eq(users.id, existingUserId));
        }
      }

      if (data.status === "terminated" && lifecycleEmployee[0].status !== "terminated") {
        try {
          await startEmployeeOffboarding({
            employeeId: id,
            organizationId: orgId,
            userId: (updateData.userId as string | null | undefined) ?? lifecycleEmployee[0].userId,
            employeeName: `${data.firstName || lifecycleEmployee[0].firstName} ${data.lastName || lifecycleEmployee[0].lastName}`.trim(),
            actorUserId: ctx.user.id,
          });
        } catch (automationError) {
          console.warn("[Employees] Offboarding automation failed:", automationError);
        }
      }
      return { success: true };
    }),

  delete: createFeatureRestrictedProcedure("employees:delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const orgId = ctx.user.organizationId;
      const where = orgId ? and(eq(employees.id, input), eq(employees.organizationId, orgId)) : eq(employees.id, input);
      await db.delete(employees).where(where);
      return { success: true };
    }),

  bulkUpdateStatus: createFeatureRestrictedProcedure("employees:edit")
    .input(z.object({ employeeIds: z.array(z.string()).min(1), status: z.enum(["active", "on_leave", "terminated", "suspended"]) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const orgId = ctx.user.organizationId;
      const where = orgId ? and(inArray(employees.id, input.employeeIds), eq(employees.organizationId, orgId)) : inArray(employees.id, input.employeeIds);
      const selectedEmployees = await db.select().from(employees).where(where);
      await db
        .update(employees)
        .set({ status: input.status, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) as any })
        .where(where);
      if (input.status === "terminated") {
        await Promise.all(selectedEmployees.filter((employee: any) => employee.status !== "terminated").map((employee: any) =>
          startEmployeeOffboarding({
            employeeId: employee.id,
            organizationId: employee.organizationId,
            userId: employee.userId,
            employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
            actorUserId: ctx.user.id,
          }).catch((error) => console.warn("[Employees] Bulk offboarding automation failed:", error))
        ));
      }
      return { success: true, count: input.employeeIds.length };
    }),

  bulkUpdateDepartment: createFeatureRestrictedProcedure("employees:edit")
    .input(z.object({ employeeIds: z.array(z.string()), department: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const orgId = ctx.user.organizationId;
      const where = orgId ? and(inArray(employees.id, input.employeeIds), eq(employees.organizationId, orgId)) : inArray(employees.id, input.employeeIds);
      await db
        .update(employees)
        .set({ department: input.department, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) as any })
        .where(where);
      return { success: true, count: input.employeeIds.length };
    }),

  bulkDelete: createFeatureRestrictedProcedure("employees:delete")
    .input(z.array(z.string()).min(1))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const orgId = ctx.user.organizationId;
      const where = orgId ? and(inArray(employees.id, input), eq(employees.organizationId, orgId)) : inArray(employees.id, input);
      await db.delete(employees).where(where);
      return { success: true, count: input.length };
    }),

  // Promote employee to a new job group
  promote: createFeatureRestrictedProcedure("employees:edit")
    .input(z.object({
      employeeId: z.string(),
      newJobGroupId: z.string(),
      newSalary: z.number().optional().describe("New salary for the promoted position"),
      effectiveDate: z.string().min(1).default(() => new Date().toISOString()),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Fetch current employee
      const employee = await db.select().from(employees).where(eq(employees.id, input.employeeId)).limit(1);
      if (!employee || employee.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
      }

      // Fetch new job group
      const newJobGroup = await db.select().from(jobGroups).where(eq(jobGroups.id, input.newJobGroupId)).limit(1);
      if (!newJobGroup || newJobGroup.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "New job group not found" });
      }

      // Validate salary is within new job group range if provided
      if (input.newSalary) {
        if (input.newSalary < newJobGroup[0].minimumGrossSalary || input.newSalary > newJobGroup[0].maximumGrossSalary) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Salary must be between ${newJobGroup[0].minimumGrossSalary} and ${newJobGroup[0].maximumGrossSalary} for the new job group`,
          });
        }
      }

      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const effectiveDateValue = new Date(input.effectiveDate);
      if (Number.isNaN(effectiveDateValue.getTime())) throw new TRPCError({ code: "BAD_REQUEST", message: "A valid effective date is required" });
      const effectiveDate = effectiveDateValue.toISOString().replace('T', ' ').substring(0, 19);

      // Update employee with new job group and salary
      await db.update(employees)
        .set({
          jobGroupId: input.newJobGroupId,
          salary: input.newSalary || employee[0].salary,
          updatedAt: now,
        })
        .where(eq(employees.id, input.employeeId));

      await db.insert(salaryIncrements).values({
        id: uuidv4(),
        employeeId: input.employeeId,
        previousSalary: employee[0].salary || 0,
        newSalary: input.newSalary || employee[0].salary || 0,
        incrementPercent: employee[0].salary ? Math.round((((input.newSalary || employee[0].salary || 0) - employee[0].salary) / employee[0].salary) * 10000) : 0,
        reason: "promotion",
        effectiveDate,
        approvedBy: ctx.user.id,
        approvalDate: now,
        notes: input.notes || null,
        createdBy: ctx.user.id,
        createdAt: now,
      } as any);

      // Log the promotion
      await logActivity({
        userId: ctx.user.id,
        action: "employee_promoted",
        entityType: "employee",
        entityId: input.employeeId,
        description: `Employee promoted from ${employee[0].jobGroupId} to ${input.newJobGroupId}. Effective: ${effectiveDate}. ${input.notes ? `Notes: ${input.notes}` : ""}`,
      });

      return {
        success: true,
        message: `Employee promoted to ${newJobGroup[0].name}`,
        employee: {
          id: input.employeeId,
          newJobGroup: newJobGroup[0].name,
          newSalary: input.newSalary || employee[0].salary,
          effectiveDate,
        },
      };
    }),

  disciplinary: router({
    list: createFeatureRestrictedProcedure("employees:read")
      .input(z.object({ employeeId: z.string().optional(), status: z.enum(["open", "under_review", "resolved", "appealed"]).optional() }).optional())
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return [];
        const filters: any[] = [];
        if (ctx.user.organizationId) filters.push(eq(employeeDisciplinaryActions.organizationId, ctx.user.organizationId));
        if (input?.employeeId) filters.push(eq(employeeDisciplinaryActions.employeeId, input.employeeId));
        if (input?.status) filters.push(eq(employeeDisciplinaryActions.status, input.status));
        return db.select().from(employeeDisciplinaryActions).where(filters.length ? and(...filters) : undefined).orderBy(desc(employeeDisciplinaryActions.createdAt));
      }),

    create: createFeatureRestrictedProcedure("employees:edit")
      .input(z.object({
        employeeId: z.string(),
        actionType: z.string().min(1),
        severity: z.enum(["low", "medium", "high", "critical"]),
        incidentDate: z.coerce.date(),
        description: z.string().min(1),
        actionTaken: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const employeeWhere = ctx.user.organizationId ? and(eq(employees.id, input.employeeId), eq(employees.organizationId, ctx.user.organizationId)) : eq(employees.id, input.employeeId);
        const employee = await db.select().from(employees).where(employeeWhere).limit(1);
        if (!employee.length) throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
        const id = uuidv4();
        await db.insert(employeeDisciplinaryActions).values({ id, organizationId: ctx.user.organizationId ?? null, employeeId: input.employeeId, actionType: input.actionType, severity: input.severity, incidentDate: input.incidentDate.toISOString().replace("T", " ").substring(0, 19), description: input.description, actionTaken: input.actionTaken, createdBy: ctx.user.id } as any);
        await logActivity({ userId: ctx.user.id, action: "employee_disciplinary_action_created", entityType: "employee", entityId: input.employeeId, description: `${input.severity} disciplinary action recorded` });
        return { id };
      }),

    resolve: createFeatureRestrictedProcedure("employees:edit")
      .input(z.object({ id: z.string(), status: z.enum(["resolved", "appealed"]), resolution: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const where = ctx.user.organizationId ? and(eq(employeeDisciplinaryActions.id, input.id), eq(employeeDisciplinaryActions.organizationId, ctx.user.organizationId)) : eq(employeeDisciplinaryActions.id, input.id);
        const result = await db.update(employeeDisciplinaryActions).set({ status: input.status, resolution: input.resolution, resolvedBy: ctx.user.id, resolvedAt: new Date().toISOString().replace("T", " ").substring(0, 19), updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19) } as any).where(where);
        return { success: true, updated: result };
      }),
  }),

  transfers: router({
    list: createFeatureRestrictedProcedure("employees:read")
      .input(z.object({ employeeId: z.string().optional() }).optional())
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return [];
        const filters: any[] = [];
        if (ctx.user.organizationId) filters.push(eq(employeeDepartmentMovements.organizationId, ctx.user.organizationId));
        if (input?.employeeId) filters.push(eq(employeeDepartmentMovements.employeeId, input.employeeId));
        return db.select().from(employeeDepartmentMovements).where(filters.length ? and(...filters) : undefined).orderBy(desc(employeeDepartmentMovements.effectiveDate));
      }),

    create: createFeatureRestrictedProcedure("employees:edit")
      .input(z.object({ employeeId: z.string(), toDepartment: z.string().min(1), effectiveDate: z.coerce.date(), reason: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const where = ctx.user.organizationId ? and(eq(employees.id, input.employeeId), eq(employees.organizationId, ctx.user.organizationId)) : eq(employees.id, input.employeeId);
        const employee = await db.select().from(employees).where(where).limit(1);
        if (!employee.length) throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
        if (employee[0].department === input.toDepartment) throw new TRPCError({ code: "BAD_REQUEST", message: "Employee is already in this department" });
        const effectiveDateValue = input.effectiveDate instanceof Date ? input.effectiveDate : new Date(input.effectiveDate);
        if (Number.isNaN(effectiveDateValue.getTime())) throw new TRPCError({ code: "BAD_REQUEST", message: "A valid effective date is required" });
        const effectiveDate = effectiveDateValue.toISOString().replace("T", " ").substring(0, 19);
        const completed = effectiveDateValue.getTime() <= Date.now();
        const id = uuidv4();
        await db.insert(employeeDepartmentMovements).values({ id, organizationId: ctx.user.organizationId ?? null, employeeId: input.employeeId, fromDepartment: employee[0].department, toDepartment: input.toDepartment, effectiveDate, reason: input.reason, status: completed ? "completed" : "scheduled", createdBy: ctx.user.id } as any);
        if (completed) await db.update(employees).set({ department: input.toDepartment, updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19) }).where(eq(employees.id, input.employeeId));
        return { id, status: completed ? "completed" : "scheduled" };
      }),

    complete: createFeatureRestrictedProcedure("employees:edit")
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
        const where = ctx.user.organizationId ? and(eq(employeeDepartmentMovements.id, input.id), eq(employeeDepartmentMovements.organizationId, ctx.user.organizationId)) : eq(employeeDepartmentMovements.id, input.id);
        const movement = await db.select().from(employeeDepartmentMovements).where(where).limit(1);
        if (!movement.length) throw new TRPCError({ code: "NOT_FOUND", message: "Department movement not found" });
        await db.update(employees).set({ department: movement[0].toDepartment, updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19) }).where(eq(employees.id, movement[0].employeeId));
        await db.update(employeeDepartmentMovements).set({ status: "completed", updatedAt: new Date().toISOString().replace("T", " ").substring(0, 19) } as any).where(eq(employeeDepartmentMovements.id, input.id));
        return { success: true };
      }),
  }),

  reports: router({
    summary: createFeatureRestrictedProcedure("employees:read")
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return { headcount: 0, byStatus: [], byDepartment: [], promotions: 0, transfers: 0, openDisciplinary: 0 };
        const org = ctx.user.organizationId;
        const employeeFilter = org ? eq(employees.organizationId, org) : undefined;
        const employeeRows = await db.select().from(employees).where(employeeFilter);
        const scoped = (rows: any[]) => org ? rows.filter((row) => row.organizationId === org) : rows;
        const [increments, movements, discipline] = await Promise.all([db.select().from(salaryIncrements), db.select().from(employeeDepartmentMovements), db.select().from(employeeDisciplinaryActions)]);
        return {
          headcount: employeeRows.length,
          byStatus: Object.entries(employeeRows.reduce((map: Record<string, number>, employee: any) => ({ ...map, [employee.status]: (map[employee.status] || 0) + 1 }), {})).map(([status, count]) => ({ status, count })),
          byDepartment: Object.entries(employeeRows.reduce((map: Record<string, number>, employee: any) => ({ ...map, [employee.department || "Unassigned"]: (map[employee.department || "Unassigned"] || 0) + 1 }), {})).map(([department, count]) => ({ department, count })),
          promotions: scoped(increments).length,
          transfers: scoped(movements).length,
          openDisciplinary: scoped(discipline).filter((row) => row.status !== "resolved").length,
        };
      }),
  }),

  // Demote employee to a different job group
  demote: createFeatureRestrictedProcedure("employees:edit")
    .input(z.object({
      employeeId: z.string(),
      newJobGroupId: z.string(),
      newSalary: z.number().optional(),
      effectiveDate: z.coerce.date().default(() => new Date()),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Fetch current employee
      const employee = await db.select().from(employees).where(eq(employees.id, input.employeeId)).limit(1);
      if (!employee || employee.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
      }

      // Fetch new job group
      const newJobGroup = await db.select().from(jobGroups).where(eq(jobGroups.id, input.newJobGroupId)).limit(1);
      if (!newJobGroup || newJobGroup.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "New job group not found" });
      }

      // Validate salary is within new job group range if provided
      if (input.newSalary) {
        if (input.newSalary < newJobGroup[0].minimumGrossSalary || input.newSalary > newJobGroup[0].maximumGrossSalary) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Salary must be between ${newJobGroup[0].minimumGrossSalary} and ${newJobGroup[0].maximumGrossSalary} for the new job group`,
          });
        }
      }

      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const effectiveDateValue = input.effectiveDate instanceof Date ? input.effectiveDate : new Date(input.effectiveDate);
      if (Number.isNaN(effectiveDateValue.getTime())) throw new TRPCError({ code: "BAD_REQUEST", message: "A valid effective date is required" });
      const effectiveDate = effectiveDateValue.toISOString().replace('T', ' ').substring(0, 19);

      // Update employee with new job group and salary
      await db.update(employees)
        .set({
          jobGroupId: input.newJobGroupId,
          salary: input.newSalary || employee[0].salary,
          updatedAt: now,
        })
        .where(eq(employees.id, input.employeeId));

      // Log the demotion
      await db.logActivity({
        userId: ctx.user.id,
        action: "employee_demoted",
        entityType: "employee",
        entityId: input.employeeId,
        description: `Employee demoted from ${employee[0].jobGroupId} to ${input.newJobGroupId}. Effective: ${effectiveDate}. ${input.reason ? `Reason: ${input.reason}` : ""}`,
      });

      return {
        success: true,
        message: `Employee demoted to ${newJobGroup[0].name}`,
        employee: {
          id: input.employeeId,
          newJobGroup: newJobGroup[0].name,
          newSalary: input.newSalary || employee[0].salary,
          effectiveDate,
        },
      };
    }),

  /**
   * Link an existing employee to an existing user
   */
  linkToUser: createFeatureRestrictedProcedure("employees:edit")
    .input(z.object({
      employeeId: z.string().describe("Employee ID to link"),
      userId: z.string().describe("User ID to link to"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verify employee exists and belongs to this organization
      const employee = await db.select().from(employees)
        .where(eq(employees.id, input.employeeId))
        .limit(1);
      if (!employee || employee.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
      }

      // Verify user exists and belongs to this organization
      const { users: usersTable } = await import("../../drizzle/schema");
      const user = await db.select().from(usersTable)
        .where(eq(usersTable.id, input.userId))
        .limit(1);
      if (!user || user.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Verify organization scoping
      if (ctx.user.organizationId && 
          (employee[0].organizationId !== ctx.user.organizationId || 
           (user[0] as any).organizationId !== ctx.user.organizationId)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Organization access denied" });
      }

      // Check if employee already has a different user
      if (employee[0].userId && employee[0].userId !== input.userId) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: `Employee is already linked to another user (${employee[0].userId}). Unlink first.` 
        });
      }

      // Link employee to user
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      await db.update(employees)
        .set({ userId: input.userId, updatedAt: now })
        .where(eq(employees.id, input.employeeId));

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "employee_linked_to_user",
        entityType: "employee",
        entityId: input.employeeId,
        description: `Employee linked to user: ${input.userId}`,
      });

      return {
        success: true,
        message: "Employee successfully linked to user",
        employeeId: input.employeeId,
        userId: input.userId,
      };
    }),

  /**
   * Unlink an employee from its associated user
   */
  unlinkFromUser: createFeatureRestrictedProcedure("employees:edit")
    .input(z.object({
      employeeId: z.string().describe("Employee ID to unlink"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verify employee exists
      const employee = await db.select().from(employees)
        .where(eq(employees.id, input.employeeId))
        .limit(1);
      if (!employee || employee.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
      }

      // Verify organization scoping
      if (ctx.user.organizationId && employee[0].organizationId !== ctx.user.organizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Organization access denied" });
      }

      if (!employee[0].userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Employee is not linked to any user" });
      }

      // Unlink employee from user
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
      await db.update(employees)
        .set({ userId: null, updatedAt: now })
        .where(eq(employees.id, input.employeeId));

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "employee_unlinked_from_user",
        entityType: "employee",
        entityId: input.employeeId,
        description: `Employee unlinked from user: ${employee[0].userId}`,
      });

      return {
        success: true,
        message: "Employee successfully unlinked from user",
        employeeId: input.employeeId,
        previousUserId: employee[0].userId,
      };
    }),

  /**
   * Create a new user account for an existing employee
   */
  createUserForEmployee: createFeatureRestrictedProcedure("employees:edit")
    .input(z.object({
      employeeId: z.string().describe("Employee ID to create user for"),
      role: z.enum(["user", "admin", "staff", "accountant", "client", "super_admin", "project_manager", "hr", "ict_manager", "procurement_manager", "sales_manager"]).optional(),
      customRoleId: z.string().optional(),
      permissions: z.array(z.string()).optional(),
      password: z.string().min(8).optional().describe("If not provided, a random password will be generated"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Verify employee exists
      const employee = await db.select().from(employees)
        .where(eq(employees.id, input.employeeId))
        .limit(1);
      if (!employee || employee.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found" });
      }

      if (!employee[0].email) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Employee must have an email address to create a user account" });
      }

      // Verify organization scoping
      if (ctx.user.organizationId && employee[0].organizationId !== ctx.user.organizationId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Organization access denied" });
      }

      // Check if employee already has a user
      if (employee[0].userId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Employee already has an associated user account" });
      }

      // Check if user already exists for this email
      const { users: usersTable } = await import("../../drizzle/schema");
      const existingUser = await db.select().from(usersTable)
        .where(eq(usersTable.email, employee[0].email))
        .limit(1);
      if (existingUser && existingUser.length > 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "User already exists for this email address" });
      }

      // Determine role (use provided role, or default from department, or use 'staff')
      let assignedRole = input.role || "staff";
      if (!input.role && employee[0].department) {
        try {
          const dept = await db.select().from(departments)
            .where(eq(departments.name, employee[0].department))
            .limit(1);
          if (dept && dept.length > 0 && dept[0].defaultRole) {
            assignedRole = dept[0].defaultRole as any;
          }
        } catch (err) {
          console.warn("Failed to get department default role:", err);
        }
      }

      // Generate or hash password
      let generatedPassword: string | null = null;
      let passwordHash: string;
      if (input.password) {
        const bcrypt = await import("bcryptjs");
        const salt = await bcrypt.genSalt(10);
        passwordHash = await bcrypt.hash(input.password, salt);
      } else {
        generatedPassword = generatePassword(14);
        passwordHash = await hashPassword(generatedPassword);
      }

      // Create user
      const userId = uuidv4();
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

      await db.insert(usersTable).values({
        id: userId,
        name: `${employee[0].firstName} ${employee[0].lastName}`.trim(),
        email: employee[0].email,
        passwordHash,
        role: assignedRole,
        customRoleId: input.customRoleId || null,
        permissions: input.permissions?.length ? JSON.stringify(input.permissions) : null,
        position: employee[0].position || undefined,
        phone: employee[0].phone || undefined,
        address: employee[0].address || undefined,
        city: (employee[0] as any).city || undefined,
        country: (employee[0] as any).country || undefined,
        isActive: 1,
        organizationId: ctx.user.organizationId || null,
        requiresPasswordChange: 1,
        createdAt: now,
      } as any);

      // Link employee to user
      await db.update(employees)
        .set({ userId, updatedAt: now })
        .where(eq(employees.id, input.employeeId));

      // Log activity
      await db.logActivity({
        userId: ctx.user.id,
        action: "user_created_for_employee",
        entityType: "employee",
        entityId: input.employeeId,
        description: `Created user account for employee: ${employee[0].firstName} ${employee[0].lastName} with role ${assignedRole}`,
      });

      return {
        success: true,
        message: "User account created for employee",
        userId,
        email: employee[0].email,
        role: assignedRole,
        generatedPassword, // Only return if we generated it
        requiresPasswordChange: true,
      };
    }),

  /**
   * Get user associated with an employee
   */
  getUser: createFeatureRestrictedProcedure("employees:read")
    .input(z.string().describe("Employee ID"))
    .query(async ({ input: employeeId, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      // Verify employee exists
      const employee = await db.select().from(employees)
        .where(eq(employees.id, employeeId))
        .limit(1);
      if (!employee || employee.length === 0) return null;

      // Verify organization scoping
      if (ctx.user.organizationId && employee[0].organizationId !== ctx.user.organizationId) {
        return null;
      }

      if (!employee[0].userId) return null;

      // Get the associated user
      const { users: usersTable } = await import("../../drizzle/schema");
      const user = await db.select().from(usersTable)
        .where(eq(usersTable.id, employee[0].userId))
        .limit(1);

      return user && user.length > 0 ? user[0] : null;
    }),

  /**
   * Get employee associated with a user
   */
  getByUserId: createFeatureRestrictedProcedure("employees:read")
    .input(z.string().describe("User ID"))
    .query(async ({ input: userId, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      try {
        const result = await db.select().from(employees)
          .where(eq(employees.userId, userId))
          .limit(1);

        if (!result || result.length === 0) return null;

        // Verify organization scoping
        if (ctx.user.organizationId && result[0].organizationId !== ctx.user.organizationId) {
          return null;
        }

        return result[0];
      } catch (err) {
        console.error("Failed to get employee by user ID:", err);
        return null;
      }
    }),
});
