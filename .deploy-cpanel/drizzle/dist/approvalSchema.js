"use strict";
exports.__esModule = true;
exports.approvalMetrics = exports.approvalAuditLog = exports.approvalNotifications = exports.approvalActions = exports.approvalRequests = exports.approvalLevels = exports.approvalWorkflows = void 0;
var mysql_core_1 = require("drizzle-orm/mysql-core");
// Approval workflow templates
exports.approvalWorkflows = mysql_core_1.mysqlTable('approval_workflows', {
    id: mysql_core_1.varchar('id', { length: 36 }).primaryKey(),
    organizationId: mysql_core_1.varchar('organization_id', { length: 36 }).notNull(),
    name: mysql_core_1.varchar('name', { length: 255 }).notNull(),
    description: mysql_core_1.text('description'),
    // Workflow configuration
    type: mysql_core_1.varchar('type', { length: 50 }).notNull(),
    applicableEntity: mysql_core_1.varchar('applicable_entity', { length: 100 }).notNull(),
    // Thresholds
    minAmount: mysql_core_1.int('min_amount')["default"](0),
    maxAmount: mysql_core_1.int('max_amount'),
    // State management
    isActive: mysql_core_1.boolean('is_active')["default"](true),
    createdAt: mysql_core_1.timestamp('created_at').defaultNow().notNull(),
    updatedAt: mysql_core_1.timestamp('updated_at').defaultNow().notNull()
}, function (table) { return [
    mysql_core_1.index('idx_org_id').on(table.organizationId),
    mysql_core_1.index('idx_applicable_entity').on(table.applicableEntity),
    mysql_core_1.uniqueIndex('unique_org_entity_workflow').on(table.organizationId, table.applicableEntity),
]; });
// Approval levels within a workflow
exports.approvalLevels = mysql_core_1.mysqlTable('approval_levels', {
    id: mysql_core_1.varchar('id', { length: 36 }).primaryKey(),
    workflowId: mysql_core_1.varchar('workflow_id', { length: 36 }).notNull(),
    organizationId: mysql_core_1.varchar('organization_id', { length: 36 }).notNull(),
    // Level sequencing
    levelNumber: mysql_core_1.int('level_number').notNull(),
    levelName: mysql_core_1.varchar('level_name', { length: 100 }),
    // Approval routing
    approvalType: mysql_core_1.varchar('approval_type', { length: 50 }).notNull(),
    approverRoles: mysql_core_1.json('approver_roles').$type().notNull(),
    approverUserIds: mysql_core_1.json('approver_user_ids').$type(),
    escalationDays: mysql_core_1.int('escalation_days'),
    // Conditional routing
    conditions: mysql_core_1.json('conditions'),
    // Settings
    requiresComment: mysql_core_1.boolean('requires_comment')["default"](false),
    allowApprovePartially: mysql_core_1.boolean('allow_approve_partially')["default"](false),
    notificationTemplate: mysql_core_1.varchar('notification_template', { length: 100 }),
    createdAt: mysql_core_1.timestamp('created_at').defaultNow().notNull(),
    updatedAt: mysql_core_1.timestamp('updated_at').defaultNow().notNull()
}, function (table) { return [
    mysql_core_1.index('idx_workflow_id').on(table.workflowId),
    mysql_core_1.index('idx_org_id').on(table.organizationId),
]; });
// Approval requests (instances of workflow)
exports.approvalRequests = mysql_core_1.mysqlTable('approval_requests', {
    id: mysql_core_1.varchar('id', { length: 36 }).primaryKey(),
    organizationId: mysql_core_1.varchar('organization_id', { length: 36 }).notNull(),
    workflowId: mysql_core_1.varchar('workflow_id', { length: 36 }).notNull(),
    // Reference to the entity being approved
    entityType: mysql_core_1.varchar('entity_type', { length: 100 }).notNull(),
    entityId: mysql_core_1.varchar('entity_id', { length: 36 }).notNull(),
    // Workflow state
    status: mysql_core_1.varchar('status', { length: 50 }).notNull(),
    currentLevel: mysql_core_1.int('current_level').notNull()["default"](1),
    totalLevels: mysql_core_1.int('total_levels').notNull(),
    // Progress tracking
    progressPercentage: mysql_core_1.int('progress_percentage')["default"](0),
    completedLevels: mysql_core_1.int('completed_levels')["default"](0),
    // Context
    requestedBy: mysql_core_1.varchar('requested_by', { length: 36 }).notNull(),
    requestedAt: mysql_core_1.timestamp('requested_at').defaultNow().notNull(),
    reason: mysql_core_1.text('reason'),
    amount: mysql_core_1.int('amount'),
    // Timeline
    dueDate: mysql_core_1.timestamp('due_date'),
    completedAt: mysql_core_1.timestamp('completed_at'),
    // Audit trail
    metadata: mysql_core_1.json('metadata'),
    createdAt: mysql_core_1.timestamp('created_at').defaultNow().notNull(),
    updatedAt: mysql_core_1.timestamp('updated_at').defaultNow().notNull()
}, function (table) { return [
    mysql_core_1.index('idx_org_id').on(table.organizationId),
    mysql_core_1.index('idx_entity').on(table.entityType, table.entityId),
    mysql_core_1.index('idx_status').on(table.status),
    mysql_core_1.index('idx_current_level').on(table.currentLevel),
]; });
// Individual approval actions within a request
exports.approvalActions = mysql_core_1.mysqlTable('approval_actions', {
    id: mysql_core_1.varchar('id', { length: 36 }).primaryKey(),
    approvalRequestId: mysql_core_1.varchar('approval_request_id', { length: 36 }).notNull(),
    organizationId: mysql_core_1.varchar('organization_id', { length: 36 }).notNull(),
    // Action details
    levelNumber: mysql_core_1.int('level_number').notNull(),
    approverId: mysql_core_1.varchar('approver_id', { length: 36 }).notNull(),
    approverRole: mysql_core_1.varchar('approver_role', { length: 100 }),
    // Action taken
    action: mysql_core_1.varchar('action', { length: 50 }).notNull(),
    status: mysql_core_1.varchar('status', { length: 50 }).notNull(),
    // Details
    comment: mysql_core_1.text('comment'),
    decisionAmount: mysql_core_1.int('decision_amount'),
    // Timeline
    dueDate: mysql_core_1.timestamp('due_date'),
    actionDate: mysql_core_1.timestamp('action_date'),
    // Escalation
    escalatedTo: mysql_core_1.varchar('escalated_to', { length: 36 }),
    escalationReason: mysql_core_1.varchar('escalation_reason', { length: 255 }),
    createdAt: mysql_core_1.timestamp('created_at').defaultNow().notNull(),
    updatedAt: mysql_core_1.timestamp('updated_at').defaultNow().notNull()
}, function (table) { return [
    mysql_core_1.index('idx_approval_request_id').on(table.approvalRequestId),
    mysql_core_1.index('idx_approver_id').on(table.approverId),
    mysql_core_1.index('idx_status').on(table.status),
    mysql_core_1.index('idx_level').on(table.levelNumber),
]; });
// Approval notifications and reminders
exports.approvalNotifications = mysql_core_1.mysqlTable('approval_notifications', {
    id: mysql_core_1.varchar('id', { length: 36 }).primaryKey(),
    organizationId: mysql_core_1.varchar('organization_id', { length: 36 }).notNull(),
    approvalRequestId: mysql_core_1.varchar('approval_request_id', { length: 36 }),
    approvalActionId: mysql_core_1.varchar('approval_action_id', { length: 36 }),
    // Notification details
    recipientId: mysql_core_1.varchar('recipient_id', { length: 36 }).notNull(),
    type: mysql_core_1.varchar('type', { length: 50 }).notNull(),
    title: mysql_core_1.varchar('title', { length: 255 }).notNull(),
    message: mysql_core_1.text('message').notNull(),
    // Status
    isRead: mysql_core_1.boolean('is_read')["default"](false),
    readAt: mysql_core_1.timestamp('read_at'),
    // Configuration
    deliveryChannels: mysql_core_1.json('delivery_channels').$type(),
    deliveryStatus: mysql_core_1.json('delivery_status'),
    createdAt: mysql_core_1.timestamp('created_at').defaultNow().notNull(),
    sentAt: mysql_core_1.timestamp('sent_at')
}, function (table) { return [
    mysql_core_1.index('idx_recipient_id').on(table.recipientId),
    mysql_core_1.index('idx_approval_request_id').on(table.approvalRequestId),
    mysql_core_1.index('idx_type').on(table.type),
    mysql_core_1.index('idx_is_read').on(table.isRead),
]; });
// Approval history and audit
exports.approvalAuditLog = mysql_core_1.mysqlTable('approval_audit_log', {
    id: mysql_core_1.varchar('id', { length: 36 }).primaryKey(),
    organizationId: mysql_core_1.varchar('organization_id', { length: 36 }).notNull(),
    approvalRequestId: mysql_core_1.varchar('approval_request_id', { length: 36 }).notNull(),
    // Action tracked
    action: mysql_core_1.varchar('action', { length: 100 }).notNull(),
    performedBy: mysql_core_1.varchar('performed_by', { length: 36 }),
    // Details
    details: mysql_core_1.json('details'),
    ipAddress: mysql_core_1.varchar('ip_address', { length: 45 }),
    userAgent: mysql_core_1.varchar('user_agent', { length: 500 }),
    createdAt: mysql_core_1.timestamp('created_at').defaultNow().notNull()
}, function (table) { return [
    mysql_core_1.index('idx_org_id').on(table.organizationId),
    mysql_core_1.index('idx_approval_request_id').on(table.approvalRequestId),
    mysql_core_1.index('idx_created_at').on(table.createdAt),
]; });
// Approval statistics and metrics
exports.approvalMetrics = mysql_core_1.mysqlTable('approval_metrics', {
    id: mysql_core_1.varchar('id', { length: 36 }).primaryKey(),
    organizationId: mysql_core_1.varchar('organization_id', { length: 36 }).notNull(),
    workflowId: mysql_core_1.varchar('workflow_id', { length: 36 }),
    // Time metrics
    avgApprovalTime: mysql_core_1.int('avg_approval_time'),
    medianApprovalTime: mysql_core_1.int('median_approval_time'),
    // Volume metrics
    totalRequests: mysql_core_1.int('total_requests')["default"](0),
    approvedRequests: mysql_core_1.int('approved_requests')["default"](0),
    rejectedRequests: mysql_core_1.int('rejected_requests')["default"](0),
    partiallyApprovedRequests: mysql_core_1.int('partially_approved_requests')["default"](0),
    pendingRequests: mysql_core_1.int('pending_requests')["default"](0),
    // Performance
    approvalRate: mysql_core_1.int('approval_rate'),
    rejectionRate: mysql_core_1.int('rejection_rate'),
    escalationRate: mysql_core_1.int('escalation_rate'),
    // Period
    period: mysql_core_1.varchar('period', { length: 20 }),
    periodDate: mysql_core_1.timestamp('period_date').notNull(),
    createdAt: mysql_core_1.timestamp('created_at').defaultNow().notNull()
}, function (table) { return [
    mysql_core_1.index('idx_org_id').on(table.organizationId),
    mysql_core_1.index('idx_workflow_id').on(table.workflowId),
    mysql_core_1.index('idx_period').on(table.period, table.periodDate),
]; });
