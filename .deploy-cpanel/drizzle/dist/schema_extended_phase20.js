"use strict";
// ============================================================================
// PHASE 20+ EXTENDED: NOTIFICATIONS, MESSAGING, TICKETS, USER MANAGEMENT
// ============================================================================
exports.__esModule = true;
exports.emailLogs = exports.emailCampaigns = exports.automatedReceipts = exports.recurringInvoiceTemplates = exports.ticketResponses = exports.tickets = exports.messageReadReceipts = exports.conversationMembers = exports.conversations = exports.messages = exports.notificationBroadcasts = exports.notifications = exports.notificationTemplates = exports.userDeletions = void 0;
var mysql_core_1 = require("drizzle-orm/mysql-core");
// ============================================================================
// USER MANAGEMENT: Soft Delete & Audit
// ============================================================================
exports.userDeletions = mysql_core_1.mysqlTable("userDeletions", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    userName: mysql_core_1.varchar({ length: 255 }).notNull(),
    userEmail: mysql_core_1.varchar({ length: 320 }).notNull(),
    deletedReason: mysql_core_1.text(),
    deletedBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    deletedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    restoredAt: mysql_core_1.timestamp({ mode: 'string' }),
    restoredBy: mysql_core_1.varchar({ length: 64 }),
    archived: mysql_core_1.tinyint()["default"](1).notNull()
}, function (table) { return [
    mysql_core_1.index("idx_user_id").on(table.userId),
    mysql_core_1.index("idx_deleted_by").on(table.deletedBy),
    mysql_core_1.index("idx_deleted_at").on(table.deletedAt),
    mysql_core_1.index("idx_archived").on(table.archived),
]; });
// ============================================================================
// NOTIFICATIONS SYSTEM: Broadcast & In-App
// ============================================================================
exports.notificationTemplates = mysql_core_1.mysqlTable("notificationTemplates", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    templateKey: mysql_core_1.varchar({ length: 100 }).notNull().unique(),
    templateName: mysql_core_1.varchar({ length: 255 }).notNull(),
    category: mysql_core_1.mysqlEnum(['billing', 'system', 'user', 'document', 'communication', 'security']).notNull(),
    subject: mysql_core_1.varchar({ length: 500 }),
    bodyTemplate: mysql_core_1.longtext().notNull(),
    channels: mysql_core_1.json(),
    variables: mysql_core_1.json(),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_template_key").on(table.templateKey),
    mysql_core_1.index("idx_category").on(table.category),
]; });
exports.notifications = mysql_core_1.mysqlTable("notifications", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    recipientId: mysql_core_1.varchar({ length: 64 }).notNull(),
    templateId: mysql_core_1.varchar({ length: 64 }).notNull(),
    category: mysql_core_1.mysqlEnum(['billing', 'system', 'user', 'document', 'communication', 'security']).notNull(),
    subject: mysql_core_1.varchar({ length: 500 }).notNull(),
    body: mysql_core_1.longtext().notNull(),
    actionUrl: mysql_core_1.varchar({ length: 500 }),
    priority: mysql_core_1.mysqlEnum(['low', 'normal', 'high', 'critical'])["default"]('normal').notNull(),
    channels: mysql_core_1.json(),
    status: mysql_core_1.mysqlEnum(['draft', 'queued', 'sent', 'failed', 'archived'])["default"]('draft').notNull(),
    sentAt: mysql_core_1.timestamp({ mode: 'string' }),
    readAt: mysql_core_1.timestamp({ mode: 'string' }),
    failureReason: mysql_core_1.text(),
    metadata: mysql_core_1.json(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_recipient_id").on(table.recipientId),
    mysql_core_1.index("idx_category").on(table.category),
    mysql_core_1.index("idx_status").on(table.status),
    mysql_core_1.index("idx_created_at").on(table.createdAt),
]; });
exports.notificationBroadcasts = mysql_core_1.mysqlTable("notificationBroadcasts", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    title: mysql_core_1.varchar({ length: 500 }).notNull(),
    content: mysql_core_1.longtext().notNull(),
    target: mysql_core_1.mysqlEnum(['all_users', 'specific_role', 'specific_department', 'specific_plan', 'custom']).notNull(),
    targetValue: mysql_core_1.varchar({ length: 255 }),
    priority: mysql_core_1.mysqlEnum(['low', 'normal', 'high', 'critical'])["default"]('normal').notNull(),
    channels: mysql_core_1.json(),
    status: mysql_core_1.mysqlEnum(['draft', 'scheduled', 'sending', 'sent', 'cancelled'])["default"]('draft').notNull(),
    scheduledFor: mysql_core_1.timestamp({ mode: 'string' }),
    startedAt: mysql_core_1.timestamp({ mode: 'string' }),
    completedAt: mysql_core_1.timestamp({ mode: 'string' }),
    recipientCount: mysql_core_1.int()["default"](0),
    sentCount: mysql_core_1.int()["default"](0),
    failedCount: mysql_core_1.int()["default"](0),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_status").on(table.status),
    mysql_core_1.index("idx_target").on(table.target),
    mysql_core_1.index("idx_scheduled_for").on(table.scheduledFor),
]; });
// ============================================================================
// MESSAGING & INTRACHAT: Internal Communication
// ============================================================================
exports.messages = mysql_core_1.mysqlTable("messages", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    conversationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    senderId: mysql_core_1.varchar({ length: 64 }).notNull(),
    messageType: mysql_core_1.mysqlEnum(['text', 'image', 'file', 'system'])["default"]('text').notNull(),
    content: mysql_core_1.longtext().notNull(),
    fileUrl: mysql_core_1.varchar({ length: 500 }),
    fileName: mysql_core_1.varchar({ length: 255 }),
    fileSize: mysql_core_1.int(),
    mimeType: mysql_core_1.varchar({ length: 100 }),
    isEdited: mysql_core_1.tinyint()["default"](0),
    editedAt: mysql_core_1.timestamp({ mode: 'string' }),
    isDeleted: mysql_core_1.tinyint()["default"](0),
    deletedAt: mysql_core_1.timestamp({ mode: 'string' }),
    reactions: mysql_core_1.json(),
    encryptionIv: mysql_core_1.varchar({ length: 255 }),
    encryptionTag: mysql_core_1.varchar({ length: 255 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_conversation_id").on(table.conversationId),
    mysql_core_1.index("idx_sender_id").on(table.senderId),
    mysql_core_1.index("idx_created_at").on(table.createdAt),
]; });
exports.conversations = mysql_core_1.mysqlTable("conversations", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    type: mysql_core_1.mysqlEnum(['direct', 'group', 'channel'])["default"]('direct').notNull(),
    name: mysql_core_1.varchar({ length: 255 }),
    description: mysql_core_1.text(),
    conversationIcon: mysql_core_1.varchar({ length: 500 }),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    isArchived: mysql_core_1.tinyint()["default"](0),
    archivedAt: mysql_core_1.timestamp({ mode: 'string' }),
    isEncrypted: mysql_core_1.tinyint()["default"](1).notNull(),
    encryptionKey: mysql_core_1.varchar({ length: 255 }),
    lastMessageAt: mysql_core_1.timestamp({ mode: 'string' }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_type").on(table.type),
    mysql_core_1.index("idx_created_by").on(table.createdBy),
    mysql_core_1.index("idx_archived").on(table.isArchived),
]; });
exports.conversationMembers = mysql_core_1.mysqlTable("conversationMembers", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    conversationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    role: mysql_core_1.mysqlEnum(['member', 'moderator', 'admin'])["default"]('member').notNull(),
    joinedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    leftAt: mysql_core_1.timestamp({ mode: 'string' }),
    lastReadAt: mysql_core_1.timestamp({ mode: 'string' }),
    unreadCount: mysql_core_1.int()["default"](0),
    isMuted: mysql_core_1.tinyint()["default"](0),
    isActive: mysql_core_1.tinyint()["default"](1).notNull()
}, function (table) { return [
    mysql_core_1.index("idx_conversation_id").on(table.conversationId),
    mysql_core_1.index("idx_user_id").on(table.userId),
]; });
exports.messageReadReceipts = mysql_core_1.mysqlTable("messageReadReceipts", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    messageId: mysql_core_1.varchar({ length: 64 }).notNull(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    readAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_message_id").on(table.messageId),
    mysql_core_1.index("idx_user_id").on(table.userId),
]; });
// ============================================================================
// TICKETS & SUPPORT: Issue Tracking
// ============================================================================
exports.tickets = mysql_core_1.mysqlTable("tickets", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    ticketNumber: mysql_core_1.varchar({ length: 50 }).notNull().unique(),
    title: mysql_core_1.varchar({ length: 500 }).notNull(),
    description: mysql_core_1.longtext().notNull(),
    category: mysql_core_1.mysqlEnum(['support', 'billing', 'feature_request', 'bug', 'security', 'general']).notNull(),
    priority: mysql_core_1.mysqlEnum(['low', 'normal', 'high', 'urgent'])["default"]('normal').notNull(),
    status: mysql_core_1.mysqlEnum(['open', 'in_progress', 'on_hold', 'resolved', 'closed', 'reopened'])["default"]('open').notNull(),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    assignedTo: mysql_core_1.varchar({ length: 64 }),
    department: mysql_core_1.varchar({ length: 100 }),
    resolution: mysql_core_1.text(),
    solutionUrl: mysql_core_1.varchar({ length: 500 }),
    attachments: mysql_core_1.json(),
    relatedTickets: mysql_core_1.json(),
    firstResponseAt: mysql_core_1.timestamp({ mode: 'string' }),
    resolvedAt: mysql_core_1.timestamp({ mode: 'string' }),
    closedAt: mysql_core_1.timestamp({ mode: 'string' }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_ticket_number").on(table.ticketNumber),
    mysql_core_1.index("idx_status").on(table.status),
    mysql_core_1.index("idx_created_by").on(table.createdBy),
    mysql_core_1.index("idx_assigned_to").on(table.assignedTo),
    mysql_core_1.index("idx_priority").on(table.priority),
]; });
exports.ticketResponses = mysql_core_1.mysqlTable("ticketResponses", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    ticketId: mysql_core_1.varchar({ length: 64 }).notNull(),
    responderId: mysql_core_1.varchar({ length: 64 }).notNull(),
    responseType: mysql_core_1.mysqlEnum(['comment', 'resolution', 'escalation'])["default"]('comment').notNull(),
    content: mysql_core_1.longtext().notNull(),
    attachments: mysql_core_1.json(),
    isInternal: mysql_core_1.tinyint()["default"](0),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_ticket_id").on(table.ticketId),
    mysql_core_1.index("idx_responder_id").on(table.responderId),
]; });
// ============================================================================
// RECURRING INVOICES: Automation
// ============================================================================
exports.recurringInvoiceTemplates = mysql_core_1.mysqlTable("recurringInvoiceTemplates", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    clientId: mysql_core_1.varchar({ length: 64 }).notNull(),
    invoiceName: mysql_core_1.varchar({ length: 255 }).notNull(),
    description: mysql_core_1.text(),
    frequency: mysql_core_1.mysqlEnum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annual', 'annual']).notNull(),
    startDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    endDate: mysql_core_1.datetime({ mode: 'string' }),
    nextInvoiceDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    items: mysql_core_1.json(),
    taxRate: decimal({ precision: 5, scale: 2 })["default"]('0'),
    discount: decimal({ precision: 5, scale: 2 })["default"]('0'),
    discountType: mysql_core_1.mysqlEnum(['percentage', 'fixed'])["default"]('percentage'),
    notes: mysql_core_1.text(),
    paymentTerms: mysql_core_1.int(),
    autoSend: mysql_core_1.tinyint()["default"](1).notNull(),
    autoCreateReceipt: mysql_core_1.tinyint()["default"](1).notNull(),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_client_id").on(table.clientId),
    mysql_core_1.index("idx_next_invoice_date").on(table.nextInvoiceDate),
    mysql_core_1.index("idx_is_active").on(table.isActive),
]; });
exports.automatedReceipts = mysql_core_1.mysqlTable("automatedReceipts", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    invoiceId: mysql_core_1.varchar({ length: 64 }).notNull(),
    receiptNumber: mysql_core_1.varchar({ length: 50 }).notNull().unique(),
    amountReceived: decimal({ precision: 10, scale: 2 }).notNull(),
    amountOutstanding: decimal({ precision: 10, scale: 2 })["default"]('0'),
    paymentStatus: mysql_core_1.mysqlEnum(['partial', 'full']).notNull(),
    paymentMethod: mysql_core_1.varchar({ length: 50 }),
    paymentReference: mysql_core_1.varchar({ length: 255 }),
    autoGenerated: mysql_core_1.tinyint()["default"](1).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_invoice_id").on(table.invoiceId),
    mysql_core_1.index("idx_receipt_number").on(table.receiptNumber),
]; });
// ============================================================================
// EMAIL CAMPAIGN & COMMUNICATION TRACKING
// ============================================================================
exports.emailCampaigns = mysql_core_1.mysqlTable("emailCampaigns", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    campaignName: mysql_core_1.varchar({ length: 255 }).notNull(),
    subject: mysql_core_1.varchar({ length: 500 }).notNull(),
    bodyHtml: mysql_core_1.longtext().notNull(),
    bodyText: mysql_core_1.longtext(),
    fromEmail: mysql_core_1.varchar({ length: 320 }).notNull(),
    fromName: mysql_core_1.varchar({ length: 255 }),
    recipientCount: mysql_core_1.int()["default"](0),
    sentCount: mysql_core_1.int()["default"](0),
    openCount: mysql_core_1.int()["default"](0),
    clickCount: mysql_core_1.int()["default"](0),
    failureCount: mysql_core_1.int()["default"](0),
    status: mysql_core_1.mysqlEnum(['draft', 'scheduled', 'sending', 'sent', 'failed', 'paused'])["default"]('draft').notNull(),
    scheduledFor: mysql_core_1.timestamp({ mode: 'string' }),
    startedAt: mysql_core_1.timestamp({ mode: 'string' }),
    completedAt: mysql_core_1.timestamp({ mode: 'string' }),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_status").on(table.status),
    mysql_core_1.index("idx_created_by").on(table.createdBy),
]; });
exports.emailLogs = mysql_core_1.mysqlTable("emailLogs", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    campaignId: mysql_core_1.varchar({ length: 64 }),
    recipientEmail: mysql_core_1.varchar({ length: 320 }).notNull(),
    userId: mysql_core_1.varchar({ length: 64 }),
    subject: mysql_core_1.varchar({ length: 500 }).notNull(),
    status: mysql_core_1.mysqlEnum(['pending', 'sent', 'bounced', 'failed', 'opened', 'clicked'])["default"]('pending').notNull(),
    provider: mysql_core_1.varchar({ length: 50 }),
    providerMessageId: mysql_core_1.varchar({ length: 255 }),
    sentAt: mysql_core_1.timestamp({ mode: 'string' }),
    failureReason: mysql_core_1.text(),
    openedAt: mysql_core_1.timestamp({ mode: 'string' }),
    clickedAt: mysql_core_1.timestamp({ mode: 'string' }),
    metadata: mysql_core_1.json(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_campaign_id").on(table.campaignId),
    mysql_core_1.index("idx_recipient_email").on(table.recipientEmail),
    mysql_core_1.index("idx_status").on(table.status),
]; });
