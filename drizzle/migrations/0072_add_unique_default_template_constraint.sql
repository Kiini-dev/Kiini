-- Add indices for better query performance on default template selection
-- Clean up any duplicate defaults (keep the oldest one per type/org)
-- Using subquery with temp table to avoid self-reference issues in MySQL 8.0
DELETE FROM documentTemplates
WHERE isDefault = 1 AND id NOT IN (
    SELECT min_id FROM (
        SELECT MIN(id) as min_id FROM documentTemplates
        WHERE isDefault = 1
        GROUP BY type, organizationId
    ) as temp
);

-- Add index for efficient template selection if it does not already exist
SET @idx_count = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'documentTemplates'
    AND INDEX_NAME = 'idx_default_by_type_org'
);
SET @stmt = IF(@idx_count = 0,
  'CREATE INDEX `idx_default_by_type_org` ON documentTemplates (`type`, `organizationId`, `isDefault`)',
  'SELECT 1'
);
PREPARE stmt FROM @stmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

