-- Migration: Add M-Pesa Payment Integration Tables
-- Date: 2026-03-10
-- Purpose: Support M-Pesa STK Push and transaction tracking

CREATE TABLE IF NOT EXISTS mpesaTransactions (
  id VARCHAR(64) PRIMARY KEY,
  checkoutRequestId VARCHAR(255) UNIQUE NOT NULL,
  invoiceId VARCHAR(64) NOT NULL,
  clientId VARCHAR(64) NOT NULL,
  phoneNumber VARCHAR(20) NOT NULL,
  amount INT NOT NULL,
  businessShortCode VARCHAR(10),
  status ENUM('pending', 'completed', 'failed', 'cancelled', 'expired', 'retry') DEFAULT 'pending',
  mpesaReceiptNumber VARCHAR(100),
  resultCode INT,
  resultDescription TEXT,
  transactionDate DATETIME,
  initiatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completedAt TIMESTAMP NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_invoice (invoiceId),
  INDEX idx_client (clientId),
  INDEX idx_phone (phoneNumber),
  INDEX idx_status (status),
  INDEX idx_completed (completedAt)
);

CREATE TABLE IF NOT EXISTS mpesaSettings (
  id VARCHAR(64) PRIMARY KEY,
  businessShortCode VARCHAR(10),
  consumerKey VARCHAR(255),
  consumerSecret VARCHAR(255),
  passkey VARCHAR(255),
  environment ENUM('sandbox', 'production') DEFAULT 'sandbox',
  callbackUrl VARCHAR(255),
  validationUrl VARCHAR(255),
  confirmationUrl VARCHAR(255),
  isActive BOOLEAN DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX uk_business_code (businessShortCode)
);

CREATE TABLE IF NOT EXISTS mpesaSettlements (
  id VARCHAR(64) PRIMARY KEY,
  settlementDate DATE NOT NULL,
  businessShortCode VARCHAR(10),
  totalTransactions INT DEFAULT 0,
  totalAmount INT DEFAULT 0,
  totalFees INT DEFAULT 0,
  netAmount INT DEFAULT 0,
  reconciliationStatus ENUM('pending', 'reconciled', 'discrepancy') DEFAULT 'pending',
  discrepancyNotes TEXT,
  reconciledAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX uk_date_shortcode (settlementDate, businessShortCode)
);
