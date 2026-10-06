-- Migration: Add Email Service Tables
-- Date: 2026-03-10
-- Purpose: Email queue, templates, and delivery tracking

CREATE TABLE IF NOT EXISTS emailQueue (
  id VARCHAR(64) PRIMARY KEY,
  toEmail VARCHAR(320) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  templateId VARCHAR(64),
  templateVariables JSON,
  htmlContent LONGTEXT,
  plainTextContent LONGTEXT,
  attachments JSON,
  status ENUM('pending', 'sending', 'sent', 'failed', 'bounced', 'spam_reported') DEFAULT 'pending',
  attemptCount INT DEFAULT 0,
  maxAttempts INT DEFAULT 3,
  nextRetryAt TIMESTAMP NULL,
  sentAt TIMESTAMP NULL,
  failureReason TEXT,
  relatedEntityType VARCHAR(50),
  relatedEntityId VARCHAR(64),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_retry (nextRetryAt),
  INDEX idx_created (createdAt),
  INDEX idx_entity (relatedEntityType, relatedEntityId)
);

CREATE TABLE IF NOT EXISTS emailTemplates (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  subject VARCHAR(500) NOT NULL,
  htmlContent LONGTEXT NOT NULL,
  plainTextContent LONGTEXT,
  variables JSON,
  isActive BOOLEAN DEFAULT 1,
  category VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdBy VARCHAR(64),
  INDEX idx_active (isActive),
  INDEX idx_category (category)
);

CREATE TABLE IF NOT EXISTS emailDeliveryEvents (
  id VARCHAR(64) PRIMARY KEY,
  queueId VARCHAR(64) NOT NULL,
  eventType ENUM('sent', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed') NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSON,
  INDEX idx_queue (queueId),
  INDEX idx_type (eventType),
  INDEX idx_timestamp (timestamp),
  FOREIGN KEY idx_queue (queueId) REFERENCES emailQueue(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emailUnsubscribes (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(320) UNIQUE NOT NULL,
  reason VARCHAR(255),
  unsubscribedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);
