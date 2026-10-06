-- Budget projections must be tagged to a chart-of-accounts entry.
-- Nullable keeps legacy allocation rows migratable; new application writes require accountId.
ALTER TABLE budgetAllocations ADD COLUMN IF NOT EXISTS accountId VARCHAR(64) NULL AFTER budgetId;
