-- Migration: Add Stripe Payment Integration Tables
-- Date: 2026-03-10
-- Purpose: Support Stripe one-time and recurring payment processing

CREATE TABLE IF NOT EXISTS stripePaymentIntents (
  id VARCHAR(64) PRIMARY KEY,
  invoiceId VARCHAR(64) NOT NULL UNIQUE,
  stripeIntentId VARCHAR(255) NOT NULL UNIQUE,
  clientId VARCHAR(64) NOT NULL,
  amount INT NOT NULL,
  currency VARCHAR(3) DEFAULT 'KES',
  status ENUM('requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'requires_capture', 'succeeded', 'canceled') DEFAULT 'requires_payment_method',
  paymentMethod VARCHAR(255),
  receiptEmail VARCHAR(320),
  metadata JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_invoice (invoiceId),
  INDEX idx_client (clientId),
  INDEX idx_status (status),
  INDEX idx_stripe_intent (stripeIntentId)
);

CREATE TABLE IF NOT EXISTS stripeWebhookEvents (
  id VARCHAR(64) PRIMARY KEY,
  stripeEventId VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(100) NOT NULL,
  data JSON NOT NULL,
  processed BOOLEAN DEFAULT 0,
  processedAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_type (type),
  INDEX idx_processed (processed),
  INDEX idx_created (createdAt)
);

CREATE TABLE IF NOT EXISTS stripeCustomers (
  id VARCHAR(64) PRIMARY KEY,
  clientId VARCHAR(64) UNIQUE NOT NULL,
  stripeCustomerId VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(320),
  billingName VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_client (clientId),
  INDEX idx_stripe_customer (stripeCustomerId)
);

CREATE TABLE IF NOT EXISTS stripePaymentMethods (
  id VARCHAR(64) PRIMARY KEY,
  stripeCustomerId VARCHAR(255) NOT NULL,
  stripePaymentMethodId VARCHAR(255) NOT NULL UNIQUE,
  type ENUM('card', 'bank_account', 'paypal') DEFAULT 'card',
  brand VARCHAR(50),
  lastFourDigits VARCHAR(4),
  expiryMonth INT,
  expiryYear INT,
  holderName VARCHAR(255),
  isDefault BOOLEAN DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_customer (stripeCustomerId),
  INDEX idx_is_default (isDefault)
);
