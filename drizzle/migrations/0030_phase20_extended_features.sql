-- ============================================================================
-- PHASE 20+ EXTENDED: NOTIFICATIONS, MESSAGING, TICKETS, USER MANAGEMENT
-- ============================================================================

-- User Deletions (Soft Delete)
CREATE TABLE IF NOT EXISTS `userDeletions` (
  `id` varchar(64) PRIMARY KEY,
  `userId` varchar(64) NOT NULL,
  `userName` varchar(255) NOT NULL,
  `userEmail` varchar(320) NOT NULL,
  `deletedReason` text,
  `deletedBy` varchar(64) NOT NULL,
  `deletedAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `restoredAt` timestamp NULL,
  `restoredBy` varchar(64),
  `archived` tinyint DEFAULT 1,
  INDEX `idx_user_id` (`userId`),
  INDEX `idx_deleted_by` (`deletedBy`),
  INDEX `idx_deleted_at` (`deletedAt`),
  INDEX `idx_archived` (`archived`)
);

-- Notification Templates
CREATE TABLE IF NOT EXISTS `notificationTemplates` (
  `id` varchar(64) PRIMARY KEY,
  `templateKey` varchar(100) UNIQUE NOT NULL,
  `templateName` varchar(255) NOT NULL,
  `category` ENUM('billing', 'system', 'user', 'document', 'communication', 'security') NOT NULL,
  `subject` varchar(500),
  `bodyTemplate` longtext NOT NULL,
  `channels` json,
  `variables` json,
  `isActive` tinyint DEFAULT 1,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_template_key` (`templateKey`),
  INDEX `idx_category` (`category`)
);

-- Notifications
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` varchar(64) PRIMARY KEY,
  `recipientId` varchar(64) NOT NULL,
  `templateId` varchar(64) NOT NULL,
  `category` ENUM('billing', 'system', 'user', 'document', 'communication', 'security') NOT NULL,
  `subject` varchar(500) NOT NULL,
  `body` longtext NOT NULL,
  `actionUrl` varchar(500),
  `priority` ENUM('low', 'normal', 'high', 'critical') DEFAULT 'normal',
  `channels` json,
  `status` ENUM('draft', 'queued', 'sent', 'failed', 'archived') DEFAULT 'draft',
  `sentAt` timestamp NULL,
  `readAt` timestamp NULL,
  `failureReason` text,
  `metadata` json,
  `createdBy` varchar(64),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_recipient_id` (`recipientId`),
  INDEX `idx_category` (`category`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`createdAt`)
);

-- Notification Broadcasts
CREATE TABLE IF NOT EXISTS `notificationBroadcasts` (
  `id` varchar(64) PRIMARY KEY,
  `title` varchar(500) NOT NULL,
  `content` longtext NOT NULL,
  `target` ENUM('all_users', 'specific_role', 'specific_department', 'specific_plan', 'custom') NOT NULL,
  `targetValue` varchar(255),
  `priority` ENUM('low', 'normal', 'high', 'critical') DEFAULT 'normal',
  `channels` json,
  `status` ENUM('draft', 'scheduled', 'sending', 'sent', 'cancelled') DEFAULT 'draft',
  `scheduledFor` timestamp NULL,
  `startedAt` timestamp NULL,
  `completedAt` timestamp NULL,
  `recipientCount` int DEFAULT 0,
  `sentCount` int DEFAULT 0,
  `failedCount` int DEFAULT 0,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_target` (`target`),
  INDEX `idx_scheduled_for` (`scheduledFor`)
);

-- Conversations (for Intrachat)
CREATE TABLE IF NOT EXISTS `conversations` (
  `id` varchar(64) PRIMARY KEY,
  `type` ENUM('direct', 'group', 'channel') DEFAULT 'direct',
  `name` varchar(255),
  `description` text,
  `conversationIcon` varchar(500),
  `createdBy` varchar(64) NOT NULL,
  `isArchived` tinyint DEFAULT 0,
  `archivedAt` timestamp NULL,
  `isEncrypted` tinyint DEFAULT 1,
  `encryptionKey` varchar(255),
  `lastMessageAt` timestamp NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_type` (`type`),
  INDEX `idx_created_by` (`createdBy`),
  INDEX `idx_archived` (`isArchived`)
);

-- Conversation Members
CREATE TABLE IF NOT EXISTS `conversationMembers` (
  `id` varchar(64) PRIMARY KEY,
  `conversationId` varchar(64) NOT NULL,
  `userId` varchar(64) NOT NULL,
  `role` ENUM('member', 'moderator', 'admin') DEFAULT 'member',
  `joinedAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `leftAt` timestamp NULL,
  `lastReadAt` timestamp NULL,
  `unreadCount` int DEFAULT 0,
  `isMuted` tinyint DEFAULT 0,
  `isActive` tinyint DEFAULT 1,
  INDEX `idx_conversation_id` (`conversationId`),
  INDEX `idx_user_id` (`userId`)
);

-- Messages
CREATE TABLE IF NOT EXISTS `messages` (
  `id` varchar(64) PRIMARY KEY,
  `conversationId` varchar(64) NOT NULL,
  `senderId` varchar(64) NOT NULL,
  `messageType` ENUM('text', 'image', 'file', 'system') DEFAULT 'text',
  `content` longtext NOT NULL,
  `fileUrl` varchar(500),
  `fileName` varchar(255),
  `fileSize` int,
  `mimeType` varchar(100),
  `isEdited` tinyint DEFAULT 0,
  `editedAt` timestamp NULL,
  `isDeleted` tinyint DEFAULT 0,
  `deletedAt` timestamp NULL,
  `reactions` json,
  `encryptionIv` varchar(255),
  `encryptionTag` varchar(255),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_conversation_id` (`conversationId`),
  INDEX `idx_sender_id` (`senderId`),
  INDEX `idx_created_at` (`createdAt`)
);

-- Message Read Receipts
CREATE TABLE IF NOT EXISTS `messageReadReceipts` (
  `id` varchar(64) PRIMARY KEY,
  `messageId` varchar(64) NOT NULL,
  `userId` varchar(64) NOT NULL,
  `readAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_message_id` (`messageId`),
  INDEX `idx_user_id` (`userId`)
);

-- Tickets/Support
CREATE TABLE IF NOT EXISTS `tickets` (
  `id` varchar(64) PRIMARY KEY,
  `ticketNumber` varchar(50) UNIQUE NOT NULL,
  `title` varchar(500) NOT NULL,
  `description` longtext NOT NULL,
  `category` ENUM('support', 'billing', 'feature_request', 'bug', 'security', 'general') NOT NULL,
  `priority` ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  `status` ENUM('open', 'in_progress', 'on_hold', 'resolved', 'closed', 'reopened') DEFAULT 'open',
  `createdBy` varchar(64) NOT NULL,
  `assignedTo` varchar(64),
  `department` varchar(100),
  `resolution` text,
  `solutionUrl` varchar(500),
  `attachments` json,
  `relatedTickets` json,
  `firstResponseAt` timestamp NULL,
  `resolvedAt` timestamp NULL,
  `closedAt` timestamp NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_ticket_number` (`ticketNumber`),
  INDEX `idx_status` (`status`),
  INDEX `idx_created_by` (`createdBy`),
  INDEX `idx_assigned_to` (`assignedTo`),
  INDEX `idx_priority` (`priority`)
);

-- Ticket Responses
CREATE TABLE IF NOT EXISTS `ticketResponses` (
  `id` varchar(64) PRIMARY KEY,
  `ticketId` varchar(64) NOT NULL,
  `responderId` varchar(64) NOT NULL,
  `responseType` ENUM('comment', 'resolution', 'escalation') DEFAULT 'comment',
  `content` longtext NOT NULL,
  `attachments` json,
  `isInternal` tinyint DEFAULT 0,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_ticket_id` (`ticketId`),
  INDEX `idx_responder_id` (`responderId`)
);

-- Recurring Invoice Templates
CREATE TABLE IF NOT EXISTS `recurringInvoiceTemplates` (
  `id` varchar(64) PRIMARY KEY,
  `clientId` varchar(64) NOT NULL,
  `invoiceName` varchar(255) NOT NULL,
  `description` text,
  `frequency` ENUM('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annual', 'annual') NOT NULL,
  `startDate` datetime NOT NULL,
  `endDate` datetime NULL,
  `nextInvoiceDate` datetime NOT NULL,
  `items` json NOT NULL,
  `taxRate` decimal(5, 2) DEFAULT 0,
  `discount` decimal(5, 2) DEFAULT 0,
  `discountType` ENUM('percentage', 'fixed') DEFAULT 'percentage',
  `notes` text,
  `paymentTerms` int,
  `autoSend` tinyint DEFAULT 1,
  `autoCreateReceipt` tinyint DEFAULT 1,
  `isActive` tinyint DEFAULT 1,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_client_id` (`clientId`),
  INDEX `idx_next_invoice_date` (`nextInvoiceDate`),
  INDEX `idx_is_active` (`isActive`)
);

-- Automated Receipts
CREATE TABLE IF NOT EXISTS `automatedReceipts` (
  `id` varchar(64) PRIMARY KEY,
  `invoiceId` varchar(64) NOT NULL,
  `receiptNumber` varchar(50) UNIQUE NOT NULL,
  `amountReceived` decimal(10, 2) NOT NULL,
  `amountOutstanding` decimal(10, 2) DEFAULT 0,
  `paymentStatus` ENUM('partial', 'full') NOT NULL,
  `paymentMethod` varchar(50),
  `paymentReference` varchar(255),
  `autoGenerated` tinyint DEFAULT 1,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_invoice_id` (`invoiceId`),
  INDEX `idx_receipt_number` (`receiptNumber`)
);

-- Email Campaigns
CREATE TABLE IF NOT EXISTS `emailCampaigns` (
  `id` varchar(64) PRIMARY KEY,
  `campaignName` varchar(255) NOT NULL,
  `subject` varchar(500) NOT NULL,
  `bodyHtml` longtext NOT NULL,
  `bodyText` longtext,
  `fromEmail` varchar(320) NOT NULL,
  `fromName` varchar(255),
  `recipientCount` int DEFAULT 0,
  `sentCount` int DEFAULT 0,
  `openCount` int DEFAULT 0,
  `clickCount` int DEFAULT 0,
  `failureCount` int DEFAULT 0,
  `status` ENUM('draft', 'scheduled', 'sending', 'sent', 'failed', 'paused') DEFAULT 'draft',
  `scheduledFor` timestamp NULL,
  `startedAt` timestamp NULL,
  `completedAt` timestamp NULL,
  `createdBy` varchar(64) NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_created_by` (`createdBy`)
);

-- Email Logs
CREATE TABLE IF NOT EXISTS `emailLogs` (
  `id` varchar(64) PRIMARY KEY,
  `campaignId` varchar(64),
  `recipientEmail` varchar(320) NOT NULL,
  `userId` varchar(64),
  `subject` varchar(500) NOT NULL,
  `status` ENUM('pending', 'sent', 'bounced', 'failed', 'opened', 'clicked') DEFAULT 'pending',
  `provider` varchar(50),
  `providerMessageId` varchar(255),
  `sentAt` timestamp NULL,
  `failureReason` text,
  `openedAt` timestamp NULL,
  `clickedAt` timestamp NULL,
  `metadata` json,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_campaign_id` (`campaignId`),
  INDEX `idx_recipient_email` (`recipientEmail`),
  INDEX `idx_status` (`status`)
);
