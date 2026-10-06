-- ============================================================================
-- Add organizationId column to subscriptions table
-- This allows multi-tenant support for subscriptions and org billing
-- ============================================================================

-- Add organizationId column to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN `organizationId` VARCHAR(64) AFTER `clientId`;

-- Add index on organizationId for efficient queries
ALTER TABLE subscriptions
ADD INDEX `idx_org_id` (`organizationId`);

-- Optionally: Add foreign key constraint to organizations table (if needed)
-- ALTER TABLE subscriptions
-- ADD CONSTRAINT `fk_subscription_org`
-- FOREIGN KEY (`organizationId`) REFERENCES `organizations` (`id`) ON DELETE SET NULL;
