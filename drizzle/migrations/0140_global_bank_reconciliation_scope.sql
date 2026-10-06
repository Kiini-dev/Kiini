ALTER TABLE `reconciliation_sessions`
  MODIFY COLUMN `organizationId` varchar(64) NULL;

ALTER TABLE `reconciliation_rules`
  MODIFY COLUMN `organizationId` varchar(64) NULL;

ALTER TABLE `reconciliation_audit_events`
  MODIFY COLUMN `organizationId` varchar(64) NULL;
