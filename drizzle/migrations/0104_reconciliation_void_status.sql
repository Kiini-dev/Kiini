ALTER TABLE `reconciliation_sessions`
  MODIFY COLUMN `status` enum('draft','in_review','approved','reopened','voided') NOT NULL DEFAULT 'draft';