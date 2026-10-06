import { v4 as uuidv4 } from 'uuid';
import type {
  ApprovalWorkflow,
  ApprovalLevel,
  ApprovalRequest,
  ApprovalAction,
} from '../../drizzle/approvalSchema';

export type WorkflowType = 'sequential' | 'parallel' | 'mixed';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'partial' | 'escalated';
export type ActionType = 'approved' | 'rejected' | 'partial' | 'commented' | 'escalated';

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | '>' | '<' | '>=' | '<=' | 'in' | 'contains';
  value: any;
}

export interface ApprovalLevelConfig {
  levelNumber: number;
  levelName?: string;
  approvalType: 'sequential' | 'parallel' | 'any'; // 'any' = any one can approve
  approverRoles?: string[];
  approverUserIds?: string[];
  escalationDays?: number;
  conditions?: WorkflowCondition[];
  requiresComment?: boolean;
  allowApprovePartially?: boolean;
}

export interface WorkflowConfig {
  name: string;
  description?: string;
  type: WorkflowType;
  applicableEntity: string;
  minAmount?: number;
  maxAmount?: number;
  levels: ApprovalLevelConfig[];
}

export interface ApprovalRequestInput {
  organizationId: string;
  workflowId: string;
  entityType: string;
  entityId: string;
  requestedBy: string;
  reason?: string;
  amount?: number;
  metadata?: Record<string, any>;
}

export interface ApprovalDecision {
  approvalActionId: string;
  action: ActionType;
  comment?: string;
  decisionAmount?: number;
  escalatedTo?: string;
}

/**
 * AdvancedApprovalsService - Multi-level workflow management
 * Handles sequential, parallel, and mixed approval routing with escalation
 */
export class AdvancedApprovalsService {
  /**
   * Create a new approval workflow template
   */
  createWorkflow(organizationId: string, config: WorkflowConfig): ApprovalWorkflow {
    return {
      id: uuidv4(),
      organizationId,
      name: config.name,
      description: config.description ?? null,
      type: config.type,
      applicableEntity: config.applicableEntity,
      minAmount: config.minAmount || 0,
      maxAmount: config.maxAmount ?? null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Create approval levels for a workflow
   */
  createApprovalLevels(
    organizationId: string,
    workflowId: string,
    levels: ApprovalLevelConfig[]
  ): ApprovalLevel[] {
    return levels.map((level) => ({
      id: uuidv4(),
      workflowId,
      organizationId,
      levelNumber: level.levelNumber,
      levelName: level.levelName ?? null,
      approvalType: level.approvalType,
      approverRoles: level.approverRoles || [],
      approverUserIds: level.approverUserIds ?? null,
      escalationDays: level.escalationDays ?? null,
      conditions: level.conditions ?? null,
      requiresComment: level.requiresComment || false,
      allowApprovePartially: level.allowApprovePartially || false,
      notificationTemplate: `approval_level_${level.levelNumber}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  /**
   * Initiate an approval request
   */
  initiateApprovalRequest(
    workflow: ApprovalWorkflow,
    input: ApprovalRequestInput,
    levels: ApprovalLevel[]
  ): ApprovalRequest {
    return {
      id: uuidv4(),
      organizationId: input.organizationId,
      workflowId: input.workflowId,
      entityType: input.entityType,
      entityId: input.entityId,
      status: 'pending',
      currentLevel: 1,
      totalLevels: levels.length,
      progressPercentage: 0,
      completedLevels: 0,
      requestedBy: input.requestedBy,
      requestedAt: new Date(),
      reason: input.reason ?? null,
      amount: input.amount ?? null,
      dueDate: this.calculateDueDate(levels[0]),
      completedAt: null,
      metadata: input.metadata ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Process an approval decision
   */
  async processApprovalDecision(
    request: ApprovalRequest,
    decision: ApprovalDecision,
    currentLevel: ApprovalLevel
  ): Promise<{
    updatedRequest: ApprovalRequest;
    nextLevel?: ApprovalLevel;
    isComplete: boolean;
  }> {
    const updatedRequest = { ...request };
    const completedLevels = Number(updatedRequest.completedLevels ?? 0);

    switch (decision.action) {
      case 'approved':
        updatedRequest.completedLevels = completedLevels + 1;
        updatedRequest.progressPercentage = Math.round(
          ((updatedRequest.completedLevels ?? 0) / updatedRequest.totalLevels) * 100
        );

        // Check if all levels are approved
        if (completedLevels + 1 === updatedRequest.totalLevels) {
          updatedRequest.status = 'approved';
          updatedRequest.completedAt = new Date();
          return { updatedRequest, isComplete: true };
        }

        // Move to next level
        updatedRequest.currentLevel = (updatedRequest.currentLevel ?? 1) + 1;
        updatedRequest.status = 'pending';
        break;

      case 'rejected':
        updatedRequest.status = 'rejected';
        updatedRequest.completedAt = new Date();
        return { updatedRequest, isComplete: true };

      case 'partial':
        updatedRequest.status = 'partial';
        // Partial approvals require additional handling
        break;

      case 'escalated':
        updatedRequest.status = 'escalated';
        // Escalation logic - will be handled by escalation service
        break;
    }

    updatedRequest.updatedAt = new Date();
    return { updatedRequest, isComplete: false };
  }

  /**
   * Get approvers for a level based on conditions
   */
  getApproversForLevel(level: ApprovalLevel, context: Record<string, any>): string[] {
    let approvers: string[] = [];

    // Check conditions
    if (level.conditions && Array.isArray(level.conditions) && level.conditions.length > 0) {
      const conditionsMet = this.evaluateConditions(level.conditions, context);
      if (!conditionsMet) {
        return [];
      }
    }

    // Get approvers by role or ID
    if (Array.isArray(level.approverUserIds) && level.approverUserIds.length > 0) {
      approvers = level.approverUserIds;
    } else if (Array.isArray(level.approverRoles) && level.approverRoles.length > 0) {
      // TODO: Resolve roles to user IDs from database
      // approvers = await getUsersByRoles(level.approverRoles);
    }

    return approvers;
  }

  /**
   * Evaluate approval conditions
   */
  private evaluateConditions(conditions: any[], context: Record<string, any>): boolean {
    return conditions.every((condition) => this.evaluateCondition(condition, context));
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(condition: any, context: Record<string, any>): boolean {
    const fieldValue = context[condition.field];

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case '>':
        return fieldValue > condition.value;
      case '<':
        return fieldValue < condition.value;
      case '>=':
        return fieldValue >= condition.value;
      case '<=':
        return fieldValue <= condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue);
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      default:
        return true;
    }
  }

  /**
   * Calculate due date for approval level
   */
  private calculateDueDate(level: ApprovalLevel): Date {
    const daysToAdd = level.escalationDays || 7; // Default 7 days
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysToAdd);
    return dueDate;
  }

  /**
   * Check if approval request is overdue
   */
  isOverdue(request: ApprovalRequest): boolean {
    if (!request.dueDate || request.status !== 'pending') {
      return false;
    }
    return new Date() > request.dueDate;
  }

  /**
   * Get approval progress metrics
   */
  getProgressMetrics(request: ApprovalRequest) {
    return {
      totalLevels: request.totalLevels,
      completedLevels: request.completedLevels,
      currentLevel: request.currentLevel,
      progressPercentage: request.progressPercentage,
      status: request.status,
      isOverdue: this.isOverdue(request),
      timeSpent: Math.floor((Date.now() - request.requestedAt.getTime()) / 1000 / 60), // in minutes
    };
  }

  /**
   * Generate approval summary report
   */
  generateApprovalSummary(requests: ApprovalRequest[]) {
    const total = requests.length;
    const approved = requests.filter((r) => r.status === 'approved').length;
    const rejected = requests.filter((r) => r.status === 'rejected').length;
    const pending = requests.filter((r) => r.status === 'pending').length;
    const partial = requests.filter((r) => r.status === 'partial').length;

    const avgApprovalTime =
      requests
        .filter((r) => r.completedAt)
        .reduce((sum, r) => sum + (r.completedAt!.getTime() - r.requestedAt.getTime()), 0) /
      (approved + rejected) /
      1000 /
      60; // in minutes

    return {
      total,
      approved,
      rejected,
      pending,
      partial,
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
      rejectionRate: total > 0 ? Math.round((rejected / total) * 100) : 0,
      avgApprovalTime: Math.round(avgApprovalTime),
      overdueCount: requests.filter((r) => this.isOverdue(r)).length,
    };
  }
}

export const createAdvancedApprovalsService = () => new AdvancedApprovalsService();