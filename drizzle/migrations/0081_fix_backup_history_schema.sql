-- Migration: Fix backup_history table schema to match Drizzle definition
-- This migration restructures the backup_history table to support the new backup system

-- Drop the old backup_history table if it exists
DROP TABLE IF EXISTS backup_history;

-- Create the backup_history table with the correct schema
CREATE TABLE backup_history (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  backupType VARCHAR(50) NOT NULL DEFAULT 'full',
  scope VARCHAR(50) NOT NULL DEFAULT 'full',
  scopeEntityId VARCHAR(64),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  tablesList TEXT,
  recordCount INT DEFAULT 0,
  sizeBytes INT DEFAULT 0,
  fileName VARCHAR(500),
  errorMessage TEXT,
  completedAt TIMESTAMP NULL,
  createdBy VARCHAR(64) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX status_idx (status),
  INDEX createdAt_idx (createdAt),
  INDEX scope_idx (scope),
  INDEX scopeEntityId_idx (scopeEntityId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
