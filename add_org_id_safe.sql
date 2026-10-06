-- Add organizationId columns to all tables for multi-tenant isolation
-- These are safe to run multiple times (will skip if column exists)

ALTER TABLE accounts ADD COLUMN organizationId VARCHAR(64) AFTER id;
ALTER TABLE clients ADD COLUMN organizationId VARCHAR(64) AFTER id;
ALTER TABLE invoices ADD COLUMN organizationId VARCHAR(64) AFTER id;
ALTER TABLE expenses ADD COLUMN organizationId VARCHAR(64) AFTER id;
ALTER TABLE projects ADD COLUMN organizationId VARCHAR(64) AFTER id;
ALTER TABLE payments ADD COLUMN organizationId VARCHAR(64) AFTER id;
ALTER TABLE employees ADD COLUMN organizationId VARCHAR(64) AFTER id;
ALTER TABLE leaveRequests ADD COLUMN organizationId VARCHAR(64) AFTER id;
ALTER TABLE attendance ADD COLUMN organizationId VARCHAR(64) AFTER id;
ALTER TABLE contracts ADD COLUMN organizationId VARCHAR(64) AFTER id;
ALTER TABLE tickets ADD COLUMN organizationId VARCHAR(64) AFTER id;
ALTER TABLE workOrders ADD COLUMN organizationId VARCHAR(64) AFTER id;
ALTER TABLE budgets ADD COLUMN organizationId VARCHAR(64) AFTER id;
ALTER TABLE communicationLogs ADD COLUMN organizationId VARCHAR(64) AFTER id;
ALTER TABLE procurement_requests ADD COLUMN organizationId VARCHAR(64) AFTER id;
