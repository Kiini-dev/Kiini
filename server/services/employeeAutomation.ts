import { getPool } from "../db";
import { NotificationTriggerService } from "./notificationTriggerService";
import { v4 as uuidv4 } from "uuid";

interface EmployeeLifecycleInput {
  employeeId: string;
  organizationId: string | null | undefined;
  userId?: string | null;
  employeeName: string;
  actorUserId: string;
}

function getConnection() {
  const pool = getPool();
  if (!pool) throw new Error("Database not available");
  return pool;
}

export async function startEmployeeOnboarding(input: EmployeeLifecycleInput) {
  const pool = getConnection();
  const [existing] = await pool.query(
    `SELECT id FROM onboardingChecklists
     WHERE employeeId = ? AND type = 'onboarding' AND status IN ('pending', 'in_progress')
     LIMIT 1`,
    [input.employeeId]
  );
  if ((existing as any[]).length) return { created: false, checklistId: (existing as any[])[0].id };

  const [templates] = await pool.query(
    `SELECT id FROM onboardingTemplates
     WHERE type = 'onboarding' AND (organizationId = ? OR organizationId IS NULL)
     ORDER BY organizationId IS NULL, createdAt ASC LIMIT 1`,
    [input.organizationId]
  );
  const templateId = (templates as any[])[0]?.id || null;
  const checklistId = uuidv4();

  await pool.query(
    `INSERT INTO onboardingChecklists
      (id, organizationId, employeeId, templateId, type, status, startDate, assignedTo, createdBy)
     VALUES (?, ?, ?, ?, 'onboarding', 'in_progress', NOW(), ?, ?)`,
    [checklistId, input.organizationId || null, input.employeeId, templateId, input.userId || input.actorUserId, input.actorUserId]
  );

  if (templateId) {
    const [templateTasks] = await pool.query(
      `SELECT title, description, category, sortOrder, isRequired
       FROM onboardingTasks WHERE templateId = ? ORDER BY sortOrder, createdAt`,
      [templateId]
    );
    for (const task of templateTasks as any[]) {
      await pool.query(
        `INSERT INTO onboardingTasks
          (id, organizationId, checklistId, templateId, title, description, category, sortOrder, isRequired)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), input.organizationId || null, checklistId, templateId, task.title, task.description || null, task.category || "other", task.sortOrder || 0, task.isRequired !== 0 ? 1 : 0]
      );
    }
  }

  if (input.userId) {
    await NotificationTriggerService.notify({
      userId: input.userId,
      title: "Employee onboarding started",
      message: `Your onboarding checklist for ${input.employeeName} is ready.`,
      type: "info",
      priority: "normal",
      category: "hr_onboarding",
      entityType: "onboarding",
      entityId: checklistId,
      actionUrl: `/onboarding/${checklistId}`,
    });
  }

  return { created: true, checklistId };
}

export async function startEmployeeOffboarding(input: EmployeeLifecycleInput) {
  const pool = getConnection();
  const [existing] = await pool.query(
    `SELECT id FROM onboardingChecklists
     WHERE employeeId = ? AND type = 'offboarding' AND status IN ('pending', 'in_progress')
     LIMIT 1`,
    [input.employeeId]
  );
  if ((existing as any[]).length) return { created: false, checklistId: (existing as any[])[0].id };

  const [templates] = await pool.query(
    `SELECT id FROM onboardingTemplates
     WHERE type = 'offboarding' AND (organizationId = ? OR organizationId IS NULL)
     ORDER BY organizationId IS NULL, createdAt ASC LIMIT 1`,
    [input.organizationId]
  );
  const templateId = (templates as any[])[0]?.id || null;
  const checklistId = uuidv4();

  await pool.query(
    `INSERT INTO onboardingChecklists
      (id, organizationId, employeeId, templateId, type, status, startDate, assignedTo, createdBy)
     VALUES (?, ?, ?, ?, 'offboarding', 'in_progress', NOW(), ?, ?)`,
    [checklistId, input.organizationId || null, input.employeeId, templateId, input.actorUserId, input.actorUserId]
  );

  if (templateId) {
    const [templateTasks] = await pool.query(
      `SELECT title, description, category, sortOrder, isRequired
       FROM onboardingTasks WHERE templateId = ? ORDER BY sortOrder, createdAt`,
      [templateId]
    );
    for (const task of templateTasks as any[]) {
      await pool.query(
        `INSERT INTO onboardingTasks
          (id, organizationId, checklistId, templateId, title, description, category, sortOrder, isRequired)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), input.organizationId || null, checklistId, templateId, task.title, task.description || null, task.category || "other", task.sortOrder || 0, task.isRequired !== 0 ? 1 : 0]
      );
    }
  }

  if (input.userId) {
    await NotificationTriggerService.notify({
      userId: input.userId,
      title: "Employee offboarding started",
      message: `Your offboarding checklist for ${input.employeeName} has been started.`,
      type: "warning",
      priority: "high",
      category: "hr_offboarding",
      entityType: "offboarding",
      entityId: checklistId,
      actionUrl: `/onboarding/${checklistId}`,
    });
  }

  return { created: true, checklistId };
}
