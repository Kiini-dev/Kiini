-- ============================================================================
-- KIINI COMPREHENSIVE ACCOUNTING AUTOMATION DATABASE SCHEMA
-- Complete implementation for Accounting & Sales procedures
-- Africa-focused with multi-country compliance support
-- ============================================================================

-- ============================================================================
-- 1. ORGANIZATION ACCOUNTING POLICIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS organizationAccountingPolicies (
  id VARCHAR(36) PRIMARY KEY,
  organizationId VARCHAR(36) NOT NULL UNIQUE,
  country VARCHAR(10) NOT NULL DEFAULT 'KE', -- Two-letter country code
  
  -- Fiscal Year Configuration
  fiscalYearStart VARCHAR(5) NOT NULL DEFAULT '01-01', -- MM-DD format
  fiscalYearEnd VARCHAR(5) NOT NULL DEFAULT '12-31', -- MM-DD format
  
  -- Accounting Method
  accountingMethod ENUM('accrual', 'cash') NOT NULL DEFAULT 'accrual',
  defaultCurrency VARCHAR(3) NOT NULL DEFAULT 'KES',
  
  -- Tax Configuration
  taxInclusiveInvoicing BOOLEAN NOT NULL DEFAULT TRUE,
  autoReconciliation BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Approval Requirements
  requireInvoiceApproval BOOLEAN NOT NULL DEFAULT TRUE,
  requireExpenseApproval BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Payment Terms
  defaultPaymentTerms VARCHAR(20) DEFAULT 'net30',
  
  -- Asset Management
  depreciationMethod ENUM('straight_line', 'declining_balance', 'units_of_production') DEFAULT 'straight_line',
  capitalizedAssetThreshold DECIMAL(12, 2) DEFAULT 50000,
  
  -- Compliance & Control
  roundingMethod ENUM('round', 'truncate') DEFAULT 'round',
  retentionPeriod INT DEFAULT 7, -- Years
  auditTrailRequired BOOLEAN NOT NULL DEFAULT TRUE,
  allowManualJournalEntries BOOLEAN NOT NULL DEFAULT TRUE,
  
  createdBy VARCHAR(36) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedBy VARCHAR(36),
  updatedAt DATETIME,
  
  INDEX idx_org (organizationId),
  INDEX idx_country (country),
  FOREIGN KEY (organizationId) REFERENCES organizations(id)
);

-- ============================================================================
-- 2. JOURNAL ENTRIES (Double-entry Bookkeeping)
-- ============================================================================

CREATE TABLE IF NOT EXISTS journalEntries (
  id VARCHAR(36) PRIMARY KEY,
  organizationId VARCHAR(36) NOT NULL,
  entryDate DATE NOT NULL,
  entryMonth VARCHAR(7) NOT NULL, -- YYYY-MM for grouping
  reference VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  totalAmount DECIMAL(12, 2) NOT NULL,
  
  -- Approval Workflow
  status ENUM('pending_approval', 'approved', 'posted', 'reversed') DEFAULT 'pending_approval',
  approvedBy VARCHAR(36),
  approvedAt DATETIME,
  postedAt DATETIME,
  reversedAt DATETIME,
  
  notes TEXT,
  createdBy VARCHAR(36) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME,
  
  INDEX idx_org (organizationId),
  INDEX idx_date (entryDate),
  INDEX idx_month (entryMonth),
  INDEX idx_status (status),
  FOREIGN KEY (organizationId) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS journalEntryLines (
  id VARCHAR(36) PRIMARY KEY,
  journalEntryId VARCHAR(36) NOT NULL,
  accountId VARCHAR(36) NOT NULL,
  description VARCHAR(255),
  debit DECIMAL(12, 2) NOT NULL DEFAULT 0,
  credit DECIMAL(12, 2) NOT NULL DEFAULT 0,
  lineNumber INT,
  
  createdBy VARCHAR(36) NOT NULL,
  createdAt DATETIME NOT NULL,
  
  INDEX idx_entry (journalEntryId),
  INDEX idx_account (accountId),
  FOREIGN KEY (journalEntryId) REFERENCES journalEntries(id) ON DELETE CASCADE,
  FOREIGN KEY (accountId) REFERENCES accounts(id)
);

-- ============================================================================
-- 3. DEBIT NOTES (with approval workflow)
-- ============================================================================

ALTER TABLE debitNotes ADD COLUMN IF NOT EXISTS approvedBy VARCHAR(36);
ALTER TABLE debitNotes ADD COLUMN IF NOT EXISTS approvedAt DATETIME;

-- ============================================================================
-- 4. CREDIT NOTES (with approval workflow)
-- ============================================================================

ALTER TABLE creditNotes ADD COLUMN IF NOT EXISTS approvedBy VARCHAR(36);
ALTER TABLE creditNotes ADD COLUMN IF NOT EXISTS approvedAt DATETIME;

-- ============================================================================
-- 5. IMPREST MANAGEMENT (Africa-specific)
-- ============================================================================

CREATE TABLE IF NOT EXISTS imprests (
  id VARCHAR(36) PRIMARY KEY,
  organizationId VARCHAR(36) NOT NULL,
  imprestNumber VARCHAR(50) NOT NULL UNIQUE,
  employeeId VARCHAR(36) NOT NULL,
  employeeName VARCHAR(255) NOT NULL,
  
  amount DECIMAL(12, 2) NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  requestDate DATE NOT NULL,
  
  status ENUM('pending', 'approved', 'disbursed', 'settled', 'cancelled') DEFAULT 'pending',
  approvedBy VARCHAR(36),
  approvedAt DATETIME,
  disbursedAt DATETIME,
  settledAt DATETIME,
  
  notes TEXT,
  createdBy VARCHAR(36) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME,
  
  INDEX idx_org (organizationId),
  INDEX idx_employee (employeeId),
  INDEX idx_status (status),
  FOREIGN KEY (organizationId) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS imprestSurrenders (
  id VARCHAR(36) PRIMARY KEY,
  imprestId VARCHAR(36) NOT NULL,
  totalExpensed DECIMAL(12, 2) NOT NULL,
  variance DECIMAL(12, 2),
  returnedAmount DECIMAL(12, 2),
  
  status ENUM('settled', 'variance_pending', 'under_review') DEFAULT 'settled',
  settledBy VARCHAR(36) NOT NULL,
  settledAt DATETIME NOT NULL,
  
  createdAt DATETIME NOT NULL,
  
  INDEX idx_imprest (imprestId),
  FOREIGN KEY (imprestId) REFERENCES imprests(id)
);

-- ============================================================================
-- 6. PURCHASE ORDERS & GOODS RECEIPT
-- ============================================================================

CREATE TABLE IF NOT EXISTS purchaseOrders (
  id VARCHAR(36) PRIMARY KEY,
  organizationId VARCHAR(36) NOT NULL,
  poNumber VARCHAR(50) NOT NULL UNIQUE,
  supplierId VARCHAR(36) NOT NULL,
  supplierName VARCHAR(255) NOT NULL,
  
  poDate DATE NOT NULL,
  deliveryDate DATE,
  
  subtotal DECIMAL(12, 2) NOT NULL,
  taxAmount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  
  status ENUM('draft', 'approved', 'received', 'partially_received', 'cancelled') DEFAULT 'draft',
  approvedBy VARCHAR(36),
  approvedAt DATETIME,
  receivedAt DATETIME,
  
  notes TEXT,
  createdBy VARCHAR(36) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME,
  
  INDEX idx_org (organizationId),
  INDEX idx_supplier (supplierId),
  INDEX idx_status (status),
  FOREIGN KEY (organizationId) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS purchaseOrderItems (
  id VARCHAR(36) PRIMARY KEY,
  purchaseOrderId VARCHAR(36) NOT NULL,
  description VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  rate DECIMAL(12, 2) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  lineNumber INT,
  
  createdBy VARCHAR(36) NOT NULL,
  createdAt DATETIME NOT NULL,
  
  INDEX idx_po (purchaseOrderId),
  FOREIGN KEY (purchaseOrderId) REFERENCES purchaseOrders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS goodsReceiptNotes (
  id VARCHAR(36) PRIMARY KEY,
  organizationId VARCHAR(36) NOT NULL,
  grno VARCHAR(50) NOT NULL UNIQUE,
  purchaseOrderId VARCHAR(36) NOT NULL,
  
  receivedDate DATE NOT NULL,
  totalQuantity INT,
  notes TEXT,
  
  createdBy VARCHAR(36) NOT NULL,
  createdAt DATETIME NOT NULL,
  
  INDEX idx_org (organizationId),
  INDEX idx_po (purchaseOrderId),
  FOREIGN KEY (organizationId) REFERENCES organizations(id),
  FOREIGN KEY (purchaseOrderId) REFERENCES purchaseOrders(id)
);

-- ============================================================================
-- 7. SALES LEADS
-- ============================================================================

CREATE TABLE IF NOT EXISTS leads (
  id VARCHAR(36) PRIMARY KEY,
  organizationId VARCHAR(36) NOT NULL,
  leadNo VARCHAR(50) NOT NULL UNIQUE,
  
  companyName VARCHAR(255) NOT NULL,
  contactName VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  
  source ENUM('website', 'referral', 'social_media', 'cold_outreach', 'event', 'trade_show', 'other') NOT NULL,
  estimatedValue DECIMAL(12, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'KES',
  country VARCHAR(10),
  industry VARCHAR(100),
  
  status ENUM('new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'closed_won', 'closed_lost') DEFAULT 'new',
  assignedTo VARCHAR(36),
  
  notes TEXT,
  createdBy VARCHAR(36) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME,
  
  INDEX idx_org (organizationId),
  INDEX idx_status (status),
  INDEX idx_source (source),
  FOREIGN KEY (organizationId) REFERENCES organizations(id)
);

-- ============================================================================
-- 8. BANK RECONCILIATION (Persistent Storage)
-- ============================================================================

CREATE TABLE IF NOT EXISTS bankReconciliationStatements (
  id VARCHAR(36) PRIMARY KEY,
  organizationId VARCHAR(36) NOT NULL,
  bankAccountId VARCHAR(36) NOT NULL,
  statementDate DATE NOT NULL,
  
  openingBalance DECIMAL(12, 2),
  closingBalance DECIMAL(12, 2),
  
  status ENUM('pending', 'reconciled', 'variance_identified') DEFAULT 'pending',
  reconciliationNotes TEXT,
  reconcililedBy VARCHAR(36),
  reconcililedAt DATETIME,
  
  createdBy VARCHAR(36) NOT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME,
  
  INDEX idx_org (organizationId),
  INDEX idx_date (statementDate),
  INDEX idx_status (status),
  FOREIGN KEY (organizationId) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS bankReconciliationDetails (
  id VARCHAR(36) PRIMARY KEY,
  statementId VARCHAR(36) NOT NULL,
  transactionId VARCHAR(36),
  transactionType VARCHAR(50),
  
  bankDate DATE NOT NULL,
  description VARCHAR(255),
  amount DECIMAL(12, 2),
  
  matched BOOLEAN DEFAULT FALSE,
  matchedTransactionId VARCHAR(36),
  matchedAmount DECIMAL(12, 2),
  
  createdAt DATETIME NOT NULL,
  
  INDEX idx_statement (statementId),
  INDEX idx_transaction (transactionId),
  FOREIGN KEY (statementId) REFERENCES bankReconciliationStatements(id)
);

-- ============================================================================
-- 9. WORKFLOW AUTOMATION TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS automationConfigs (
  id VARCHAR(36) PRIMARY KEY,
  organizationId VARCHAR(36) NOT NULL,
  
  workflowType VARCHAR(100) NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  configuration JSON,
  
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME,
  
  INDEX idx_org (organizationId),
  INDEX idx_workflow (workflowType),
  UNIQUE KEY unique_org_workflow (organizationId, workflowType),
  FOREIGN KEY (organizationId) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS workflowAutomationLogs (
  id VARCHAR(36) PRIMARY KEY,
  organizationId VARCHAR(36) NOT NULL,
  
  workflowType VARCHAR(100) NOT NULL,
  sourceEntityId VARCHAR(36),
  sourceEntityType VARCHAR(50),
  targetEntityId VARCHAR(36),
  
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  errorMessage TEXT,
  
  executedBy VARCHAR(36),
  executedAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL,
  
  INDEX idx_org (organizationId),
  INDEX idx_workflow (workflowType),
  INDEX idx_source (sourceEntityId),
  INDEX idx_target (targetEntityId),
  INDEX idx_date (executedAt),
  FOREIGN KEY (organizationId) REFERENCES organizations(id)
);

-- ============================================================================
-- 10. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Ensure critical accounting query performance
CREATE INDEX idx_invoices_org_date ON invoices(organizationId, invoiceDate);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_expenses_org_date ON expenses(organizationId, expenseDate);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_payments_org_date ON payments(organizationId, paymentDate);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_accounts_org_type ON accounts(organizationId, type);
CREATE INDEX idx_chartOfAccounts_org_code ON chartOfAccounts(organizationId, accountCode);

-- ============================================================================
-- 11. DATA INTEGRITY CONSTRAINTS
-- ============================================================================

-- Ensure journal entry debits = credits
ALTER TABLE journalEntries ADD CONSTRAINT check_journal_balanced 
  CHECK (totalAmount >= 0);

-- Ensure imprest amounts are positive
ALTER TABLE imprests ADD CONSTRAINT check_imprest_positive 
  CHECK (amount > 0);

-- Ensure PO amounts are positive
ALTER TABLE purchaseOrders ADD CONSTRAINT check_po_positive 
  CHECK (total >= subtotal);

-- ============================================================================
-- MIGRATION COMPLETION MARKERS
-- ============================================================================

-- Record that accounting automation migrations have been applied
INSERT INTO database_migrations (name, version, applied_at) 
VALUES 
  ('accounting_automation_v1', '1.0.0', NOW()),
  ('africa_tax_compliance_v1', '1.0.0', NOW()),
  ('imprest_management_v1', '1.0.0', NOW()),
  ('purchase_orders_v1', '1.0.0', NOW()),
  ('workflow_automation_v1', '1.0.0', NOW())
ON DUPLICATE KEY UPDATE applied_at = NOW();
