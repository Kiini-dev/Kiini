-- Migration: Add SMS Service Tables
-- Date: 2026-03-10
-- Purpose: SMS queue, preferences, and delivery tracking

CREATE TABLE IF NOT EXISTS smsQueue (
  id VARCHAR(64) PRIMARY KEY,
  phoneNumber VARCHAR(20) NOT NULL,
  message VARCHAR(1000) NOT NULL,
  status ENUM('pending', 'sent', 'failed', 'queued', 'delivered') DEFAULT 'pending',
  provider ENUM('africa_talking', 'twilio', 'safaricom') DEFAULT 'africa_talking',
  providerReference VARCHAR(255),
  deliveryStatus VARCHAR(50),
  attemptCount INT DEFAULT 0,
  maxAttempts INT DEFAULT 3,
  nextRetryAt TIMESTAMP NULL,
  sentAt TIMESTAMP NULL,
  deliveredAt TIMESTAMP NULL,
  failureReason TEXT,
  cost DECIMAL(10, 2),
  relatedEntityType VARCHAR(50),
  relatedEntityId VARCHAR(64),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phoneNumber),
  INDEX idx_status (status),
  INDEX idx_retry (nextRetryAt),
  INDEX idx_provider_ref (providerReference)
);

CREATE TABLE IF NOT EXISTS smsCustomerPreferences (
  id VARCHAR(64) PRIMARY KEY,
  clientId VARCHAR(64) UNIQUE NOT NULL,
  phoneNumber VARCHAR(20),
  receivePaymentConfirmation BOOLEAN DEFAULT 1,
  receiveInvoiceReminders BOOLEAN DEFAULT 1,
  receiveReceiptNotification BOOLEAN DEFAULT 1,
  receiveOverdueReminders BOOLEAN DEFAULT 1,
  receivePromotional BOOLEAN DEFAULT 0,
  consentOptInAt TIMESTAMP,
  consentOptOutAt TIMESTAMP NULL,
  optOutReason VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_client (clientId),
  INDEX idx_phone (phoneNumber)
);

CREATE TABLE IF NOT EXISTS smsDeliveryEvents (
  id VARCHAR(64) PRIMARY KEY,
  queueId VARCHAR(64) NOT NULL,
  eventType ENUM('sent', 'delivered', 'failed', 'rejected', 'expired') NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSON,
  INDEX idx_queue (queueId),
  INDEX idx_type (eventType),
  FOREIGN KEY idx_queue (queueId) REFERENCES smsQueue(id) ON DELETE CASCADE
);
