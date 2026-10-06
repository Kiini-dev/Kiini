// ============================================================================
// PHASE 20+ EXTENDED: NOTIFICATIONS, MESSAGING, TICKETS, USER MANAGEMENT
// ============================================================================

import { mysqlTable, index, varchar, mysqlEnum, int, text, longtext, timestamp, tinyint, json, datetime } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

// ============================================================================
// USER MANAGEMENT: Soft Delete & Audit
// ============================================================================

export const userDeletions = mysqlTable("userDeletions", {
  id: varchar({ length: 64 }).primaryKey(),
  userId: varchar({ length: 64 }).notNull(),
  userName: varchar({ length: 255 }).notNull(),
  userEmail: varchar({ length: 320 }).notNull(),
  deletedReason: text(),
  deletedBy: varchar({ length: 64 }).notNull(),
  deletedAt: timestamp({ mode: 'string' }).defaultNow(),
  restoredAt: timestamp({ mode: 'string' }),
  restoredBy: varchar({ length: 64 }),
  archived: tinyint().default(1).notNull(), // 1 = soft deleted, 0 = active
}, (table) => [
  index("idx_user_id").on(table.userId),
  index("idx_deleted_by").on(table.deletedBy),
  index("idx_deleted_at").on(table.deletedAt),
  index("idx_archived").on(table.archived),
]);

export type UserDeletion = typeof userDeletions.$inferSelect;
export type InsertUserDeletion = typeof userDeletions.$inferInsert;

// ============================================================================
// NOTIFICATIONS SYSTEM: Broadcast & In-App
// ============================================================================

export const notificationTemplates = mysqlTable("notificationTemplates", {
  id: varchar({ length: 64 }).primaryKey(),
  templateKey: varchar({ length: 100 }).notNull().unique(),
  templateName: varchar({ length: 255 }).notNull(),
  category: mysqlEnum(['billing', 'system', 'user', 'document', 'communication', 'security']).notNull(),
  subject: varchar({ length: 500 }),
  bodyTemplate: longtext().notNull(),
  channels: json(), // ['email', 'in_app', 'sms']
  variables: json(), // List of template variables
  isActive: tinyint().default(1).notNull(),
  createdAt: timestamp({ mode: 'string' }).defaultNow(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_template_key").on(table.templateKey),
  index("idx_category").on(table.category),
]);

export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type InsertNotificationTemplate = typeof notificationTemplates.$inferInsert;

export const notifications = mysqlTable("notifications", {
  id: varchar({ length: 64 }).primaryKey(),
  recipientId: varchar({ length: 64 }).notNull(),
  templateId: varchar({ length: 64 }).notNull(),
  category: mysqlEnum(['billing', 'system', 'user', 'document', 'communication', 'security']).notNull(),
  subject: varchar({ length: 500 }).notNull(),
  body: longtext().notNull(),
  actionUrl: varchar({ length: 500 }),
  priority: mysqlEnum(['low', 'normal', 'high', 'critical']).default('normal').notNull(),
  channels: json(), // ['email', 'in_app', 'sms']
  status: mysqlEnum(['draft', 'queued', 'sent', 'failed', 'archived']).default('draft').notNull(),
  sentAt: timestamp({ mode: 'string' }),
  readAt: timestamp({ mode: 'string' }),
  failureReason: text(),
  metadata: json(),
  createdBy: varchar({ length: 64 }),
  createdAt: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
  index("idx_recipient_id").on(table.recipientId),
  index("idx_category").on(table.category),
  index("idx_status").on(table.status),
  index("idx_created_at").on(table.createdAt),
]);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export const notificationBroadcasts = mysqlTable("notificationBroadcasts", {
  id: varchar({ length: 64 }).primaryKey(),
  title: varchar({ length: 500 }).notNull(),
  content: longtext().notNull(),
  target: mysqlEnum(['all_users', 'specific_role', 'specific_department', 'specific_plan', 'custom']).notNull(),
  targetValue: varchar({ length: 255 }), // role name, department id, plan id, or custom filter
  priority: mysqlEnum(['low', 'normal', 'high', 'critical']).default('normal').notNull(),
  channels: json(), // ['email', 'in_app', 'sms']
  status: mysqlEnum(['draft', 'scheduled', 'sending', 'sent', 'cancelled']).default('draft').notNull(),
  scheduledFor: timestamp({ mode: 'string' }),
  startedAt: timestamp({ mode: 'string' }),
  completedAt: timestamp({ mode: 'string' }),
  recipientCount: int().default(0),
  sentCount: int().default(0),
  failedCount: int().default(0),
  createdBy: varchar({ length: 64 }).notNull(),
  createdAt: timestamp({ mode: 'string' }).defaultNow(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_status").on(table.status),
  index("idx_target").on(table.target),
  index("idx_scheduled_for").on(table.scheduledFor),
]);

export type NotificationBroadcast = typeof notificationBroadcasts.$inferSelect;
export type InsertNotificationBroadcast = typeof notificationBroadcasts.$inferInsert;

// ============================================================================
// MESSAGING & INTRACHAT: Internal Communication
// ============================================================================

export const messages = mysqlTable("messages", {
  id: varchar({ length: 64 }).primaryKey(),
  conversationId: varchar({ length: 64 }).notNull(),
  senderId: varchar({ length: 64 }).notNull(),
  messageType: mysqlEnum(['text', 'image', 'file', 'system']).default('text').notNull(),
  content: longtext().notNull(),
  fileUrl: varchar({ length: 500 }),
  fileName: varchar({ length: 255 }),
  fileSize: int(),
  mimeType: varchar({ length: 100 }),
  isEdited: tinyint().default(0),
  editedAt: timestamp({ mode: 'string' }),
  isDeleted: tinyint().default(0),
  deletedAt: timestamp({ mode: 'string' }),
  reactions: json(), // { emoji: count }
  encryptionIv: varchar({ length: 255 }), // For message encryption
  encryptionTag: varchar({ length: 255 }),
  createdAt: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
  index("idx_conversation_id").on(table.conversationId),
  index("idx_sender_id").on(table.senderId),
  index("idx_created_at").on(table.createdAt),
]);

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

export const conversations = mysqlTable("conversations", {
  id: varchar({ length: 64 }).primaryKey(),
  type: mysqlEnum(['direct', 'group', 'channel']).default('direct').notNull(),
  name: varchar({ length: 255 }),
  description: text(),
  conversationIcon: varchar({ length: 500 }),
  createdBy: varchar({ length: 64 }).notNull(),
  isArchived: tinyint().default(0),
  archivedAt: timestamp({ mode: 'string' }),
  isEncrypted: tinyint().default(1).notNull(), // 1 = encrypted, 0 = plain
  encryptionKey: varchar({ length: 255 }), // Stored encrypted
  lastMessageAt: timestamp({ mode: 'string' }),
  createdAt: timestamp({ mode: 'string' }).defaultNow(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_type").on(table.type),
  index("idx_created_by").on(table.createdBy),
  index("idx_archived").on(table.isArchived),
]);

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

export const conversationMembers = mysqlTable("conversationMembers", {
  id: varchar({ length: 64 }).primaryKey(),
  conversationId: varchar({ length: 64 }).notNull(),
  userId: varchar({ length: 64 }).notNull(),
  role: mysqlEnum(['member', 'moderator', 'admin']).default('member').notNull(),
  joinedAt: timestamp({ mode: 'string' }).defaultNow(),
  leftAt: timestamp({ mode: 'string' }),
  lastReadAt: timestamp({ mode: 'string' }),
  unreadCount: int().default(0),
  isMuted: tinyint().default(0),
  isActive: tinyint().default(1).notNull(),
}, (table) => [
  index("idx_conversation_id").on(table.conversationId),
  index("idx_user_id").on(table.userId),
]);

export type ConversationMember = typeof conversationMembers.$inferSelect;
export type InsertConversationMember = typeof conversationMembers.$inferInsert;

export const messageReadReceipts = mysqlTable("messageReadReceipts", {
  id: varchar({ length: 64 }).primaryKey(),
  messageId: varchar({ length: 64 }).notNull(),
  userId: varchar({ length: 64 }).notNull(),
  readAt: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
  index("idx_message_id").on(table.messageId),
  index("idx_user_id").on(table.userId),
]);

export type MessageReadReceipt = typeof messageReadReceipts.$inferSelect;
export type InsertMessageReadReceipt = typeof messageReadReceipts.$inferInsert;

// ============================================================================
// TICKETS & SUPPORT: Issue Tracking
// ============================================================================

export const tickets = mysqlTable("tickets", {
  id: varchar({ length: 64 }).primaryKey(),
  ticketNumber: varchar({ length: 50 }).notNull().unique(),
  title: varchar({ length: 500 }).notNull(),
  description: longtext().notNull(),
  category: mysqlEnum(['support', 'billing', 'feature_request', 'bug', 'security', 'general']).notNull(),
  priority: mysqlEnum(['low', 'normal', 'high', 'urgent']).default('normal').notNull(),
  status: mysqlEnum(['open', 'in_progress', 'on_hold', 'resolved', 'closed', 'reopened']).default('open').notNull(),
  createdBy: varchar({ length: 64 }).notNull(),
  assignedTo: varchar({ length: 64 }),
  department: varchar({ length: 100 }),
  resolution: text(),
  solutionUrl: varchar({ length: 500 }),
  attachments: json(), // Array of file URLs
  relatedTickets: json(), // Array of ticket IDs
  firstResponseAt: timestamp({ mode: 'string' }),
  resolvedAt: timestamp({ mode: 'string' }),
  closedAt: timestamp({ mode: 'string' }),
  createdAt: timestamp({ mode: 'string' }).defaultNow(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_ticket_number").on(table.ticketNumber),
  index("idx_status").on(table.status),
  index("idx_created_by").on(table.createdBy),
  index("idx_assigned_to").on(table.assignedTo),
  index("idx_priority").on(table.priority),
]);

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

export const ticketResponses = mysqlTable("ticketResponses", {
  id: varchar({ length: 64 }).primaryKey(),
  ticketId: varchar({ length: 64 }).notNull(),
  responderId: varchar({ length: 64 }).notNull(),
  responseType: mysqlEnum(['comment', 'resolution', 'escalation']).default('comment').notNull(),
  content: longtext().notNull(),
  attachments: json(), // Array of file URLs
  isInternal: tinyint().default(0), // 1 = only visible to staff
  createdAt: timestamp({ mode: 'string' }).defaultNow(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_ticket_id").on(table.ticketId),
  index("idx_responder_id").on(table.responderId),
]);

export type TicketResponse = typeof ticketResponses.$inferSelect;
export type InsertTicketResponse = typeof ticketResponses.$inferInsert;

// ============================================================================
// RECURRING INVOICES: Automation
// ============================================================================

export const recurringInvoiceTemplates = mysqlTable("recurringInvoiceTemplates", {
  id: varchar({ length: 64 }).primaryKey(),
  clientId: varchar({ length: 64 }).notNull(),
  invoiceName: varchar({ length: 255 }).notNull(),
  description: text(),
  frequency: mysqlEnum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annual', 'annual']).notNull(),
  startDate: datetime({ mode: 'string' }).notNull(),
  endDate: datetime({ mode: 'string' }),
  nextInvoiceDate: datetime({ mode: 'string' }).notNull(),
  items: json(), // Array of line items with description, quantity, rate
  taxRate: decimal({ precision: 5, scale: 2 }).default('0'),
  discount: decimal({ precision: 5, scale: 2 }).default('0'),
  discountType: mysqlEnum(['percentage', 'fixed']).default('percentage'),
  notes: text(),
  paymentTerms: int(), // days to payment due
  autoSend: tinyint().default(1).notNull(),
  autoCreateReceipt: tinyint().default(1).notNull(),
  isActive: tinyint().default(1).notNull(),
  createdBy: varchar({ length: 64 }).notNull(),
  createdAt: timestamp({ mode: 'string' }).defaultNow(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_client_id").on(table.clientId),
  index("idx_next_invoice_date").on(table.nextInvoiceDate),
  index("idx_is_active").on(table.isActive),
]);

export type RecurringInvoiceTemplate = typeof recurringInvoiceTemplates.$inferSelect;
export type InsertRecurringInvoiceTemplate = typeof recurringInvoiceTemplates.$inferInsert;

export const automatedReceipts = mysqlTable("automatedReceipts", {
  id: varchar({ length: 64 }).primaryKey(),
  invoiceId: varchar({ length: 64 }).notNull(),
  receiptNumber: varchar({ length: 50 }).notNull().unique(),
  amountReceived: decimal({ precision: 10, scale: 2 }).notNull(),
  amountOutstanding: decimal({ precision: 10, scale: 2 }).default('0'),
  paymentStatus: mysqlEnum(['partial', 'full']).notNull(),
  paymentMethod: varchar({ length: 50 }),
  paymentReference: varchar({ length: 255 }),
  autoGenerated: tinyint().default(1).notNull(),
  createdAt: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
  index("idx_invoice_id").on(table.invoiceId),
  index("idx_receipt_number").on(table.receiptNumber),
]);

export type AutomatedReceipt = typeof automatedReceipts.$inferSelect;
export type InsertAutomatedReceipt = typeof automatedReceipts.$inferInsert;

// ============================================================================
// EMAIL CAMPAIGN & COMMUNICATION TRACKING
// ============================================================================

export const emailCampaigns = mysqlTable("emailCampaigns", {
  id: varchar({ length: 64 }).primaryKey(),
  campaignName: varchar({ length: 255 }).notNull(),
  subject: varchar({ length: 500 }).notNull(),
  bodyHtml: longtext().notNull(),
  bodyText: longtext(),
  fromEmail: varchar({ length: 320 }).notNull(),
  fromName: varchar({ length: 255 }),
  recipientCount: int().default(0),
  sentCount: int().default(0),
  openCount: int().default(0),
  clickCount: int().default(0),
  failureCount: int().default(0),
  status: mysqlEnum(['draft', 'scheduled', 'sending', 'sent', 'failed', 'paused']).default('draft').notNull(),
  scheduledFor: timestamp({ mode: 'string' }),
  startedAt: timestamp({ mode: 'string' }),
  completedAt: timestamp({ mode: 'string' }),
  createdBy: varchar({ length: 64 }).notNull(),
  createdAt: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
  index("idx_status").on(table.status),
  index("idx_created_by").on(table.createdBy),
]);

export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = typeof emailCampaigns.$inferInsert;

export const emailLogs = mysqlTable("emailLogs", {
  id: varchar({ length: 64 }).primaryKey(),
  campaignId: varchar({ length: 64 }),
  recipientEmail: varchar({ length: 320 }).notNull(),
  userId: varchar({ length: 64 }),
  subject: varchar({ length: 500 }).notNull(),
  status: mysqlEnum(['pending', 'sent', 'bounced', 'failed', 'opened', 'clicked']).default('pending').notNull(),
  provider: varchar({ length: 50 }), // smtp, sendgrid, mailgun, ses, etc.
  providerMessageId: varchar({ length: 255 }),
  sentAt: timestamp({ mode: 'string' }),
  failureReason: text(),
  openedAt: timestamp({ mode: 'string' }),
  clickedAt: timestamp({ mode: 'string' }),
  metadata: json(),
  createdAt: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
  index("idx_campaign_id").on(table.campaignId),
  index("idx_recipient_email").on(table.recipientEmail),
  index("idx_status").on(table.status),
]);

export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailLog = typeof emailLogs.$inferInsert;
