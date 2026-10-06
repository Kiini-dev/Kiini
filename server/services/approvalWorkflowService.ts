import { and, asc, eq, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import {
  approvalActions,
  approvalLevels,
  approvalRequests,
  approvalWorkflows,
} from "../../drizzle/approvalSchema";
import { notificationService } from "./notificationService";

export const APPROVAL_ENTITY_TYPES = [
  "invoice",
  "estimate",
  "proposal",
  "contract",
  "expense",
  "payment",
  "budget",
  "purchase_order",
  "lpo",
  "leave_request",
  "imprest",
  "work_order",
  "service_invoice",
  "credit_note",
  "debit_note",
  "payroll",
] as const;

export type ApprovalEntityType = (typeof APPROVAL_ENTITY_TYPES)[number];

const DEFAULT_APPROVER_ROLES: Record<ApprovalEntityType, string[]> = {
  invoice: ["accountant", "admin", "super_admin"],
  estimate: ["sales_manager", "admin", "super_admin"],
  proposal: ["sales_manager", "admin", "super_admin"],
  contract: ["admin", "super_admin"],
  expense: ["accountant", "admin", "super_admin"],
  payment: ["accountant", "admin", "super_admin"],
  budget: ["accountant", "admin", "super_admin"],
  purchase_order: ["procurement_manager", "accountant", "admin", "super_admin"],
  lpo: ["procurement_manager", "accountant", "admin", "super_admin"],
  leave_request: ["hr", "admin", "super_admin"],
  imprest: ["accountant", "admin", "super_admin"],
  work_order: ["operations_manager", "admin", "super_admin"],
  service_invoice: ["accountant", "admin", "super_admin"],
  credit_note: ["accountant", "admin", "super_admin"],
  debit_note: ["accountant", "admin", "super_admin"],
  payroll: ["hr", "accountant", "admin", "super_admin"],
};

const displayName = (entityType: string) => entityType.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export function isApprovalLevelComplete(
  approvalType: string,
  actions: Array<{ action: string; status: string }>,
): boolean {
  if (actions.length === 0) return false;
  if (approvalType === "any") return actions.some((action) => action.action === "approved");
  return actions.every((action) => action.status === "completed" && action.action === "approved");
}

async function getApproversForLevel(
  database: any,
  organizationId: string,
  requestedBy: string,
  level: typeof approvalLevels.$inferSelect,
) {
  const roleList = level.approverRoles || [];
  const userIds = level.approverUserIds || [];
  const [roleApprovers, userIdApprovers] = await Promise.all([
    roleList.length
      ? database.select().from(users).where(and(
          eq(users.organizationId, organizationId),
          inArray(users.role, roleList as any),
        ))
      : [],
    userIds.length
      ? database.select().from(users).where(and(
          eq(users.organizationId, organizationId),
          inArray(users.id, userIds),
        ))
      : [],
  ]);
  const configuredApprovers = new Map<string, any>();
  for (const user of [...roleApprovers, ...userIdApprovers]) {
    if (user.id !== requestedBy) configuredApprovers.set(user.id, user);
  }

  if (configuredApprovers.size > 0) return [...configuredApprovers.values()];
  return database.select().from(users).where(and(
    eq(users.organizationId, organizationId),
    inArray(users.role, ["admin", "super_admin"] as any),
  )).then((approvers: any[]) => approvers.filter((user) => user.id !== requestedBy));
}

async function getOrCreateWorkflow(organizationId: string, entityType: ApprovalEntityType) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const existing = await database.select().from(approvalWorkflows).where(and(
    eq(approvalWorkflows.organizationId, organizationId),
    eq(approvalWorkflows.applicableEntity, entityType),
    eq(approvalWorkflows.isActive, true),
  )).limit(1);
  if (existing[0]) return existing[0];

  const workflowId = uuidv4();
  try {
    await database.insert(approvalWorkflows).values({
      id: workflowId,
      organizationId,
      name: `${displayName(entityType)} Approval`,
      description: `Default approval workflow for ${displayName(entityType)} records`,
      type: "sequential",
      applicableEntity: entityType,
      minAmount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await database.insert(approvalLevels).values({
      id: uuidv4(),
      workflowId,
      organizationId,
      levelNumber: 1,
      levelName: "Primary approval",
      approvalType: "any",
      approverRoles: DEFAULT_APPROVER_ROLES[entityType],
      approverUserIds: null,
      escalationDays: 7,
      requiresComment: false,
      allowApprovePartially: false,
      notificationTemplate: `${entityType}_approval_pending`,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error: any) {
    if (!String(error?.message || "").toLowerCase().includes("duplicate")) throw error;
  }

  const workflow = await database.select().from(approvalWorkflows).where(and(
    eq(approvalWorkflows.organizationId, organizationId),
    eq(approvalWorkflows.applicableEntity, entityType),
    eq(approvalWorkflows.isActive, true),
  )).limit(1);
  if (!workflow[0]) throw new Error(`Could not create ${entityType} approval workflow`);
  return workflow[0];
}

async function notifyUser(user: any, subject: string, message: string, entityType: string, entityId: string, emailOnly = false) {
  const channels: ("in-app" | "email" | "sms")[] = emailOnly ? ["email"] : ["in-app"];
  if (user.email) channels.push("email");
  if (user.phone && !emailOnly) channels.push("sms");
  if (!channels.length) return;

  await notificationService.send({
    userId: user.id,
    title: subject,
    message,
    type: emailOnly ? "success" : "info",
    category: "approval",
    entityType,
    entityId,
    actionUrl: `/approvals/${entityType}/${entityId}`,
    priority: "high",
    channels,
    emailData: user.email ? {
      to: user.email,
      subject,
      htmlContent: `<p>${message}</p><p><a href="/approvals/${entityType}/${entityId}">Open approval</a></p>`,
    } : undefined,
    smsData: user.phone && !emailOnly ? { phoneNumber: user.phone, message } : undefined,
  });
}

export async function submitApprovalRequest(input: {
  organizationId: string;
  entityType: ApprovalEntityType;
  entityId: string;
  requestedBy: string;
  amount?: number;
  reason?: string;
  metadata?: Record<string, any>;
}) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  const workflow = await getOrCreateWorkflow(input.organizationId, input.entityType);
  const levels = await database.select().from(approvalLevels).where(eq(approvalLevels.workflowId, workflow.id));
  if (!levels.length) throw new Error(`No approval levels configured for ${input.entityType}`);

  const existing = await database.select().from(approvalRequests).where(and(
    eq(approvalRequests.organizationId, input.organizationId),
    eq(approvalRequests.entityType, input.entityType),
    eq(approvalRequests.entityId, input.entityId),
    eq(approvalRequests.status, "pending"),
  )).limit(1);
  if (existing[0]) return existing[0];

  const orderedLevels = levels.sort((a, b) => a.levelNumber - b.levelNumber);
  const firstLevel = orderedLevels[0];
  const recipients = await getApproversForLevel(database, input.organizationId, input.requestedBy, firstLevel);
  if (!recipients.length) throw new Error(`No approver is configured for ${input.entityType}`);

  const requestId = uuidv4();
  await database.insert(approvalRequests).values({
    id: requestId,
    organizationId: input.organizationId,
    workflowId: workflow.id,
    entityType: input.entityType,
    entityId: input.entityId,
    status: "pending",
    currentLevel: firstLevel.levelNumber,
    totalLevels: levels.length,
    progressPercentage: 0,
    completedLevels: 0,
    requestedBy: input.requestedBy,
    requestedAt: new Date(),
    reason: input.reason || null,
    amount: input.amount ?? null,
    dueDate: new Date(Date.now() + (firstLevel.escalationDays || 7) * 86400000),
    metadata: input.metadata || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const subject = `Approval required: ${displayName(input.entityType)}`;
  const message = `A new ${displayName(input.entityType).toLowerCase()} approval is pending. Please review it.`;
  await Promise.all(recipients.map(async (approver: any) => {
    await database.insert(approvalActions).values({
      id: uuidv4(),
      approvalRequestId: requestId,
      organizationId: input.organizationId,
      levelNumber: firstLevel.levelNumber,
      approverId: approver.id,
      approverRole: approver.role,
      action: "pending",
      status: "pending",
      dueDate: new Date(Date.now() + (firstLevel.escalationDays || 7) * 86400000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await notifyUser(approver, subject, message, input.entityType, input.entityId);
  }));

  return { id: requestId, status: "pending", approverIds: recipients.map((user: any) => user.id) };
}

export async function decideApproval(input: { requestId: string; approverId: string; action: "approved" | "rejected"; comment?: string }) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  const request = (await database.select().from(approvalRequests).where(eq(approvalRequests.id, input.requestId)).limit(1))[0];
  if (!request || request.status !== "pending") throw new Error("Approval request is not pending");
  const action = (await database.select().from(approvalActions).where(and(
    eq(approvalActions.approvalRequestId, request.id),
    eq(approvalActions.approverId, input.approverId),
    eq(approvalActions.levelNumber, request.currentLevel),
    eq(approvalActions.status, "pending"),
  )).limit(1))[0];
  if (!action) throw new Error("You are not assigned to this approval");

  const workflowLevels = await database.select().from(approvalLevels).where(and(
    eq(approvalLevels.workflowId, request.workflowId),
    eq(approvalLevels.organizationId, request.organizationId),
  )).orderBy(asc(approvalLevels.levelNumber));
  const currentLevelIndex = workflowLevels.findIndex((level: any) => level.levelNumber === request.currentLevel);
  const currentLevel = workflowLevels[currentLevelIndex];
  if (!currentLevel) throw new Error("Current approval level is not configured");
  if (currentLevel.requiresComment && !input.comment?.trim()) throw new Error("A comment is required for this approval decision");

  const levelActions = await database.select().from(approvalActions).where(and(
    eq(approvalActions.approvalRequestId, request.id),
    eq(approvalActions.levelNumber, request.currentLevel),
  ));
  const projectedActions = levelActions.map((item: any) => item.id === action.id
    ? { ...item, action: input.action, status: "completed" }
    : item);
  const levelComplete = input.action === "approved" && isApprovalLevelComplete(currentLevel.approvalType, projectedActions);
  const nextLevel = levelComplete ? workflowLevels[currentLevelIndex + 1] : undefined;
  const nextRecipients = nextLevel
    ? await getApproversForLevel(database, request.organizationId, request.requestedBy, nextLevel)
    : [];
  if (nextLevel && !nextRecipients.length) throw new Error(`No approver is configured for ${nextLevel.levelName || `level ${nextLevel.levelNumber}`}`);

  await database.update(approvalActions).set({ action: input.action, status: "completed", comment: input.comment || null, actionDate: new Date(), updatedAt: new Date() }).where(eq(approvalActions.id, action.id));
  if (input.action === "rejected") {
    await database.update(approvalRequests).set({ status: "rejected", completedAt: new Date(), updatedAt: new Date() }).where(eq(approvalRequests.id, request.id));
  } else if (levelComplete) {
    if (!nextLevel) {
      await database.update(approvalRequests).set({ status: "approved", progressPercentage: 100, completedLevels: request.totalLevels, completedAt: new Date(), updatedAt: new Date() }).where(eq(approvalRequests.id, request.id));
      const requester = (await database.select().from(users).where(eq(users.id, request.requestedBy)).limit(1))[0];
      if (requester) await notifyUser(requester, `${displayName(request.entityType)} approved`, `Your ${displayName(request.entityType).toLowerCase()} has been approved.`, request.entityType, request.entityId, true);
    } else {
      const dueDate = new Date(Date.now() + (nextLevel.escalationDays || 7) * 86400000);
      await Promise.all(nextRecipients.map(async (approver: any) => {
        await database.insert(approvalActions).values({
          id: uuidv4(),
          approvalRequestId: request.id,
          organizationId: request.organizationId,
          levelNumber: nextLevel.levelNumber,
          approverId: approver.id,
          approverRole: approver.role,
          action: "pending",
          status: "pending",
          dueDate,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await notifyUser(
          approver,
          `Approval required: ${displayName(request.entityType)}`,
          `A ${displayName(request.entityType).toLowerCase()} approval is pending at ${nextLevel.levelName || `level ${nextLevel.levelNumber}`}. Please review it.`,
          request.entityType,
          request.entityId,
        );
      }));
      await database.update(approvalRequests).set({
        currentLevel: nextLevel.levelNumber,
        completedLevels: currentLevelIndex + 1,
        progressPercentage: Math.round(((currentLevelIndex + 1) / request.totalLevels) * 100),
        dueDate,
        updatedAt: new Date(),
      }).where(eq(approvalRequests.id, request.id));
    }
  }
  return { success: true };
}

export async function listApprovalRequests(organizationId: string) {
  const database = await getDb();
  if (!database) return [];
  return database.select().from(approvalRequests).where(eq(approvalRequests.organizationId, organizationId));
}

export async function ensureApprovalWorkflows(organizationId: string) {
  return Promise.all(APPROVAL_ENTITY_TYPES.map((entityType) => getOrCreateWorkflow(organizationId, entityType)));
}
