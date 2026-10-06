import { sql } from 'drizzle-orm';
import {
  mysqlTable,
  text,
  int,
  timestamp,
  varchar,
  json,
  boolean,
  uniqueIndex,
  index,
} from 'drizzle-orm/mysql-core';

// Approval workflow templates
export const approvalWorkflows = mysqlTable(
  'approval_workflows',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    organizationId: varchar('organization_id', { length: 36 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    
    // Workflow configuration
    type: varchar('type', { length: 50 }).notNull(), // 'sequential', 'parallel', 'mixed'
    applicableEntity: varchar('applicable_entity', { length: 100 }).notNull(), // 'purchase_order', 'expense_claim', 'leave_request', etc.
    
    // Thresholds
    minAmount: int('min_amount').default(0),
    maxAmount: int('max_amount'),
    
    // State management
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_org_id').on(table.organizationId),
    index('idx_applicable_entity').on(table.applicableEntity),
    uniqueIndex('unique_org_entity_workflow').on(table.organizationId, table.applicableEntity),
  ]
);

// Approval levels within a workflow
export const approvalLevels = mysqlTable(
  'approval_levels',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    workflowId: varchar('workflow_id', { length: 36 }).notNull(),
    organizationId: varchar('organization_id', { length: 36 }).notNull(),
    
    // Level sequencing
    levelNumber: int('level_number').notNull(),
    levelName: varchar('level_name', { length: 100 }),
    
    // Approval routing
    approvalType: varchar('approval_type', { length: 50 }).notNull(), // 'sequential', 'parallel', 'any'
    approverRoles: json('approver_roles').$type<string[]>().notNull(), // ['department_manager', 'finance_head', etc]
    approverUserIds: json('approver_user_ids').$type<string[]>(), // specific user IDs
    escalationDays: int('escalation_days'), // Auto-escalate after N days
    
    // Conditional routing
    conditions: json('conditions'), // { field: 'amount', operator: '>', value: 50000 }
    
    // Settings
    requiresComment: boolean('requires_comment').default(false),
    allowApprovePartially: boolean('allow_approve_partially').default(false),
    notificationTemplate: varchar('notification_template', { length: 100 }),
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_workflow_id').on(table.workflowId),
    index('idx_org_id').on(table.organizationId),
  ]
);

// Approval requests (instances of workflow)
export const approvalRequests = mysqlTable(
  'approval_requests',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    organizationId: varchar('organization_id', { length: 36 }).notNull(),
    workflowId: varchar('workflow_id', { length: 36 }).notNull(),
    
    // Reference to the entity being approved
    entityType: varchar('entity_type', { length: 100 }).notNull(), // 'purchase_order', 'expense_claim', etc
    entityId: varchar('entity_id', { length: 36 }).notNull(),
    
    // Workflow state
    status: varchar('status', { length: 50 }).notNull(), // 'pending', 'approved', 'rejected', 'partial', 'escalated'
    currentLevel: int('current_level').notNull().default(1),
    totalLevels: int('total_levels').notNull(),
    
    // Progress tracking
    progressPercentage: int('progress_percentage').default(0),
    completedLevels: int('completed_levels').default(0),
    
    // Context
    requestedBy: varchar('requested_by', { length: 36 }).notNull(),
    requestedAt: timestamp('requested_at').defaultNow().notNull(),
    reason: text('reason'),
    amount: int('amount'),
    
    // Timeline
    dueDate: timestamp('due_date'),
    completedAt: timestamp('completed_at'),
    
    // Audit trail
    metadata: json('metadata'), // Additional context
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_org_id').on(table.organizationId),
    index('idx_entity').on(table.entityType, table.entityId),
    index('idx_status').on(table.status),
    index('idx_current_level').on(table.currentLevel),
  ]
);

// Individual approval actions within a request
export const approvalActions = mysqlTable(
  'approval_actions',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    approvalRequestId: varchar('approval_request_id', { length: 36 }).notNull(),
    organizationId: varchar('organization_id', { length: 36 }).notNull(),
    
    // Action details
    levelNumber: int('level_number').notNull(),
    approverId: varchar('approver_id', { length: 36 }).notNull(),
    approverRole: varchar('approver_role', { length: 100 }),
    
    // Action taken
    action: varchar('action', { length: 50 }).notNull(), // 'approved', 'rejected', 'commented', 'escalated'
    status: varchar('status', { length: 50 }).notNull(), // 'pending', 'completed'
    
    // Details
    comment: text('comment'),
    decisionAmount: int('decision_amount'), // For partial approval
    
    // Timeline
    dueDate: timestamp('due_date'),
    actionDate: timestamp('action_date'),
    
    // Escalation
    escalatedTo: varchar('escalated_to', { length: 36 }),
    escalationReason: varchar('escalation_reason', { length: 255 }),
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_approval_request_id').on(table.approvalRequestId),
    index('idx_approver_id').on(table.approverId),
    index('idx_status').on(table.status),
    index('idx_level').on(table.levelNumber),
  ]
);

// Approval notifications and reminders
export const approvalNotifications = mysqlTable(
  'approval_notifications',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    organizationId: varchar('organization_id', { length: 36 }).notNull(),
    approvalRequestId: varchar('approval_request_id', { length: 36 }),
    approvalActionId: varchar('approval_action_id', { length: 36 }),
    
    // Notification details
    recipientId: varchar('recipient_id', { length: 36 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(), // 'pending', 'reminder', 'approved', 'rejected', 'escalation'
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message').notNull(),
    
    // Status
    isRead: boolean('is_read').default(false),
    readAt: timestamp('read_at'),
    
    // Configuration
    deliveryChannels: json('delivery_channels').$type<string[]>(), // ['email', 'push', 'in-app']
    deliveryStatus: json('delivery_status'), // { email: 'sent', push: 'pending' }
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
    sentAt: timestamp('sent_at'),
  },
  (table) => [
    index('idx_recipient_id').on(table.recipientId),
    index('idx_approval_request_id').on(table.approvalRequestId),
    index('idx_type').on(table.type),
    index('idx_is_read').on(table.isRead),
  ]
);

// Approval history and audit
export const approvalAuditLog = mysqlTable(
  'approval_audit_log',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    organizationId: varchar('organization_id', { length: 36 }).notNull(),
    approvalRequestId: varchar('approval_request_id', { length: 36 }).notNull(),
    
    // Action tracked
    action: varchar('action', { length: 100 }).notNull(),
    performedBy: varchar('performed_by', { length: 36 }),
    
    // Details
    details: json('details'),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: varchar('user_agent', { length: 500 }),
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_org_id').on(table.organizationId),
    index('idx_approval_request_id').on(table.approvalRequestId),
    index('idx_created_at').on(table.createdAt),
  ]
);

// Approval statistics and metrics
export const approvalMetrics = mysqlTable(
  'approval_metrics',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    organizationId: varchar('organization_id', { length: 36 }).notNull(),
    workflowId: varchar('workflow_id', { length: 36 }),
    
    // Time metrics
    avgApprovalTime: int('avg_approval_time'), // in minutes
    medianApprovalTime: int('median_approval_time'),
    
    // Volume metrics
    totalRequests: int('total_requests').default(0),
    approvedRequests: int('approved_requests').default(0),
    rejectedRequests: int('rejected_requests').default(0),
    partiallyApprovedRequests: int('partially_approved_requests').default(0),
    pendingRequests: int('pending_requests').default(0),
    
    // Performance
    approvalRate: int('approval_rate'), // percentage
    rejectionRate: int('rejection_rate'),
    escalationRate: int('escalation_rate'),
    
    // Period
    period: varchar('period', { length: 20 }), // 'daily', 'weekly', 'monthly'
    periodDate: timestamp('period_date').notNull(),
    
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_org_id').on(table.organizationId),
    index('idx_workflow_id').on(table.workflowId),
    index('idx_period').on(table.period, table.periodDate),
  ]
);

export type ApprovalWorkflow = typeof approvalWorkflows.$inferSelect;
export type ApprovalLevel = typeof approvalLevels.$inferSelect;
export type ApprovalRequest = typeof approvalRequests.$inferSelect;
export type ApprovalAction = typeof approvalActions.$inferSelect;
export type ApprovalNotification = typeof approvalNotifications.$inferSelect;
export type ApprovalAuditLog = typeof approvalAuditLog.$inferSelect;
export type ApprovalMetrics = typeof approvalMetrics.$inferSelect;