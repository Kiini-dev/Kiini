-- Migration: Enhance Receipt Management
-- Date: 2026-03-10
-- Purpose: Add fields for receipt tracking, email delivery, and reconciliation

ALTER TABLE receipts 
ADD COLUMN IF NOT EXISTS receiptStatus ENUM('draft', 'issued', 'sent', 'delivered', 'archived') DEFAULT 'issued' AFTER approvedAt,
ADD COLUMN IF NOT EXISTS emailSentAt TIMESTAMP NULL AFTER receiptStatus,
ADD COLUMN IF NOT EXISTS emailRecipient VARCHAR(320) NULL AFTER emailSentAt,
ADD COLUMN IF NOT EXISTS paymentReconciliationId VARCHAR(64) NULL AFTER emailRecipient,
ADD COLUMN IF NOT EXISTS receiptTemplate VARCHAR(50) DEFAULT 'default' AFTER paymentReconciliationId,
ADD COLUMN IF NOT EXISTS metadata JSON NULL AFTER receiptTemplate,
ADD INDEX idx_status (receiptStatus),
ADD INDEX idx_email_sent (emailSentAt),
ADD INDEX idx_created_by (createdBy);

-- Migration: Enhance Password Management
-- Date: 2026-03-10
-- Purpose: Add password history, expiry, and reset tracking

ALTER TABLE users
ADD COLUMN IF NOT EXISTS passwordChangedAt TIMESTAMP NULL AFTER password,
ADD COLUMN IF NOT EXISTS passwordExpiresAt TIMESTAMP NULL AFTER passwordChangedAt,
ADD COLUMN IF NOT EXISTS passwordResetDeadline TIMESTAMP NULL AFTER passwordExpiresAt,
ADD COLUMN IF NOT EXISTS forcePasswordReset BOOLEAN DEFAULT 0 AFTER passwordResetDeadline,
ADD INDEX idx_password_expires (passwordExpiresAt),
ADD INDEX idx_force_reset (forcePasswordReset);

CREATE TABLE IF NOT EXISTS passwordHistory (
  id VARCHAR(64) PRIMARY KEY,
  userId VARCHAR(64) NOT NULL,
  oldPasswordHash VARCHAR(255) NOT NULL,
  changedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  changedBy VARCHAR(64),
  INDEX idx_user (userId),
  INDEX idx_changed (changedAt),
  FOREIGN KEY idx_user (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Migration: Add Payment Method Enhancements
-- Date: 2026-03-10
-- Purpose: Better tracking of payment methods and their usage

ALTER TABLE paymentMethods
ADD COLUMN IF NOT EXISTS isVerified BOOLEAN DEFAULT 0 AFTER isActive,
ADD COLUMN IF NOT EXISTS verificationCode VARCHAR(6) NULL AFTER isVerified,
ADD COLUMN IF NOT EXISTS verificationAttempts INT DEFAULT 0 AFTER verificationCode,
ADD COLUMN IF NOT EXISTS lastUsedAt TIMESTAMP NULL AFTER verificationAttempts,
ADD COLUMN IF NOT EXISTS numberOfTimesUsed INT DEFAULT 0 AFTER lastUsedAt,
ADD INDEX idx_verified (isVerified),
ADD INDEX idx_last_used (lastUsedAt);
