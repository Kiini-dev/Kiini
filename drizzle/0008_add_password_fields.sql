-- Add password-related fields to users table for local authentication
-- No-op migration: columns added previously. Keep as safe no-op to avoid
-- executing DDL again within the migration runner.
SELECT 1;
