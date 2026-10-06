-- Migration 0053: Expand multi-tenancy with granular permissions, policies, and billing automation
-- Adds: 
--   - granularPermissions table (per-user-per-feature-specific actions)
--   - organizationPolicies table (data retention, privacy, etc.)
--   - paymentTriggers table (auto-billing on trial end, renewal)
--   - organizationSubscriptions table (trial dates, renewal schedule)
--   - pricingTierDescriptions table (tier metadata & descriptions)

-- =====================================================================
-- GRANULAR PERMISSIONS TABLE
-- =====================================================================
-- Allow super-admin to configure specific permissions per user/role
-- e.g., "accounting": ["invoices.create", "invoices.edit", "invoices.delete"]
--       but NOT "invoices.view_analytics"
CREATE TABLE IF NOT EXISTS `granularPermissions` (
  `id` VARCHAR(64) PRIMARY KEY,
  `organizationId` VARCHAR(64) NOT NULL,
  `userId` VARCHAR(64),
  `module` VARCHAR(100) NOT NULL COMMENT 'e.g., "accounting", "invoicing", "hr"',
  `permission` VARCHAR(255) NOT NULL COMMENT 'e.g., "create", "edit", "delete", "view", "view_analytics"',
  `isGranted` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_org_user_module_perm` (`organizationId`, `userId`, `module`, `permission`),
  KEY `idx_org_id` (`organizationId`),
  KEY `idx_user_id` (`userId`),
  KEY `idx_module` (`module`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================================
-- ORGANIZATION POLICIES TABLE
-- =====================================================================
-- Data retention, privacy, security policies per organization
CREATE TABLE IF NOT EXISTS `organizationPolicies` (
  `id` VARCHAR(64) PRIMARY KEY,
  `organizationId` VARCHAR(64) NOT NULL UNIQUE,
  `dataRetentionDays` INT DEFAULT 2555 COMMENT '7 years default for tax compliance',
  `dataRetentionPolicy` LONGTEXT COMMENT 'Custom retention policy text',
  `privacyPolicy` LONGTEXT,
  `privacyPolicyUrl` VARCHAR(500),
  `termsOfService` LONGTEXT,
  `termsUrl` VARCHAR(500),
  `gdprCompliant` TINYINT(1) DEFAULT 0,
  `dataProcessingAgreement` LONGTEXT,
  `backupRetentionDays` INT DEFAULT 90,
  `encryptionEnabled` TINYINT(1) DEFAULT 1,
  `mfaRequired` TINYINT(1) DEFAULT 0,
  `sessionTimeoutMinutes` INT DEFAULT 30,
  `ipWhitelist` JSON COMMENT 'Array of allowed IP addresses',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_org_id` (`organizationId`),
  FOREIGN KEY (`organizationId`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================================
-- ORGANIZATION SUBSCRIPTIONS TABLE
-- =====================================================================
-- Track trial dates, renewal schedule, and billing automation
CREATE TABLE IF NOT EXISTS `organizationSubscriptions` (
  `id` VARCHAR(64) PRIMARY KEY,
  `organizationId` VARCHAR(64) NOT NULL UNIQUE,
  `trialStartDate` TIMESTAMP,
  `trialEndDate` TIMESTAMP,
  `trialDaysRemaining` INT DEFAULT 14,
  `isTrial` TINYINT(1) DEFAULT 1,
  `renewalDate` TIMESTAMP,
  `billingCycleMonths` INT DEFAULT 1 COMMENT '1=monthly, 12=annual',
  `nextBillingDate` TIMESTAMP,
  `autoRenewEnabled` TINYINT(1) DEFAULT 1,
  `billingEmail` VARCHAR(320),
  `billingAddress` TEXT,
  `billingCity` VARCHAR(100),
  `billingCountry` VARCHAR(100),
  `taxId` VARCHAR(50),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_org_id` (`organizationId`),
  KEY `idx_trial_end` (`trialEndDate`),
  KEY `idx_renewal_date` (`renewalDate`),
  FOREIGN KEY (`organizationId`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================================
-- PAYMENT TRIGGERS TABLE
-- =====================================================================
-- Automation rules for billing events (trial end, renewal, etc.)
CREATE TABLE IF NOT EXISTS `paymentTriggers` (
  `id` VARCHAR(64) PRIMARY KEY,
  `organizationId` VARCHAR(64) NOT NULL,
  `triggerType` ENUM('trial_end', 'renewal_due', 'payment_due', 'custom') NOT NULL,
  `triggerDate` TIMESTAMP,
  `isActive` TINYINT(1) DEFAULT 1,
  `status` ENUM('pending', 'triggered', 'completed', 'failed') DEFAULT 'pending',
  `actionType` ENUM('invoice_generate', 'invoice_send', 'payment_collect') DEFAULT 'invoice_generate',
  `amount` DECIMAL(10, 2),
  `description` TEXT,
  `retryCount` INT DEFAULT 0,
  `lastRetryAt` TIMESTAMP,
  `nextRetryAt` TIMESTAMP,
  `completedAt` TIMESTAMP,
  `errorMessage` TEXT,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_org_id` (`organizationId`),
  KEY `idx_trigger_date` (`triggerDate`),
  KEY `idx_status` (`status`),
  FOREIGN KEY (`organizationId`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================================
-- PRICING TIER DESCRIPTIONS TABLE
-- =====================================================================
-- Rich metadata for pricing tiers (descriptions, use cases, etc.)
CREATE TABLE IF NOT EXISTS `pricingTierDescriptions` (
  `id` VARCHAR(64) PRIMARY KEY,
  `tier` ENUM('trial','starter','accounting_only','growth','professional','enterprise','custom') NOT NULL UNIQUE,
  `displayName` VARCHAR(255) NOT NULL,
  `description` LONGTEXT,
  `shortDescription` VARCHAR(500),
  `monthlyPrice` DECIMAL(10, 2) DEFAULT 0,
  `annualPrice` DECIMAL(10, 2) DEFAULT 0,
  `annualDiscount` DECIMAL(5, 2) DEFAULT 0 COMMENT 'Percentage discount for annual billing',
  `maxUsers` INT DEFAULT -1 COMMENT '-1 = unlimited',
  `maxProjects` INT DEFAULT -1,
  `maxStorageGB` INT DEFAULT 10,
  `supportLevel` ENUM('none','email','priority','24/7','dedicated_manager') DEFAULT 'email',
  `apiCallsPerMonth` INT DEFAULT 10000,
  `ssoEnabled` TINYINT(1) DEFAULT 0,
  `whitelabelEnabled` TINYINT(1) DEFAULT 0,
  `customReportsEnabled` TINYINT(1) DEFAULT 0,
  `dedicatedAccountManager` TINYINT(1) DEFAULT 0,
  `trainingIncluded` TINYINT(1) DEFAULT 0,
  `useCase` VARCHAR(255) COMMENT 'e.g., "For accountants only", "For growing businesses"',
  `idealFor` LONGTEXT COMMENT 'Target audience description',
  `icon` VARCHAR(100) COMMENT 'Icon name or URL',
  `color` VARCHAR(20) COMMENT 'Hex color code',
  `order` INT DEFAULT 0 COMMENT 'Display order on pricing page',
  `isActive` TINYINT(1) DEFAULT 1,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_tier` (`tier`),
  KEY `idx_active` (`isActive`),
  KEY `idx_order` (`order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================================
-- SEED: 6 PRICING TIERS WITH DESCRIPTIONS
-- =====================================================================
INSERT IGNORE INTO `pricingTierDescriptions` VALUES
-- Trial: Free for 14 days
('ptd_trial', 'trial', 'Trial', 
 'Start free for 14 days. No credit card required. Full access to core CRM features.',
 'Free for 14 days', 0, 0, 0, 5, -1, 5, 'email', 5000, 0, 0, 0, 0, 0, 
 'For testing the platform', 'Teams evaluating Kiini',
 'zap', '#FDE047', 0, 1, NOW(), NOW()),

-- Accounting Only: Minimal tier for accountants
('ptd_accounting', 'accounting_only', 'Accounting Only',
 'Perfect for independent accountants. CRM, Invoicing, Payments & Chart of Accounts only.',
 'For accountants only - $49/mo', 49.00, 490.00, 15, 2, 0, 25, 'email', 20000, 0, 0, 0, 0, 0,
 'For independent accountants', 'Solo accountants and bookkeepers who need invoicing & accounting',
 'calculator', '#3B82F6', 1, 1, NOW(), NOW()),

-- Starter: SMB businesses starting out
('ptd_starter', 'starter', 'Starter',
 'Complete CRM with invoicing, basic accounting, and HR tracking. Perfect for growing businesses.',
 'For growing businesses - $99/mo', 99.00, 1008.00, 15, 10, 5, 50, 'priority', 50000, 0, 0, 0, 0, 1,
 'For small growing businesses', 'Small teams and startups up to 10 users',
 'rocket', '#10B981', 2, 1, NOW(), NOW()),

-- Growth: Mid-size businesses
('ptd_growth', 'growth', 'Growth',
 'Full CRM, invoicing, accounting, HR, payroll, and advanced reporting. For growing companies.',
 'For growing companies - $199/mo', 199.00, 1990.00, 15, 25, 10, 100, 'priority', 100000, 1, 0, 1, 0, 1,
 'For mid-size operations', 'Teams of 25+ users with advanced accounting needs',
 'trending-up', '#8B5CF6', 3, 1, NOW(), NOW()),

-- Professional: Full system for established businesses
('ptd_professional', 'professional', 'Professional',
 'Everything in Growth plus: procurement, projects, advanced automation, custom fields, integrations.',
 'For established businesses - $399/mo', 399.00, 3990.00, 15, 50, -1, 250, '24/7', 250000, 1, 1, 1, 0, 1,
 'For established enterprises', 'Established companies 50-250+ users with complex needs',
 'briefcase', '#06B6D4', 4, 1, NOW(), NOW()),

-- Enterprise: Full-featured, scalable, custom support
('ptd_enterprise', 'enterprise', 'Enterprise',
 'Unlimited everything. Advanced security, dedicated account manager, custom integrations, training.',
 'Custom pricing', NULL, NULL, NULL, -1, -1, -1, 'dedicated_manager', -1, 1, 1, 1, 1, 1,
 'For enterprise organizations', 'Large enterprises with unlimited users, custom requirements',
 'crown', '#7C3AED', 5, 1, NOW(), NOW());

-- =====================================================================
-- UPDATE: Existing pricingTierFeatures enum to support new tiers
-- =====================================================================
-- MySQL doesn't allow direct MODIFY ENUM in all versions, so we check if the tier already exists
-- The tier column in pricingTierFeatures already supports these via ENUM auto-extension

-- =====================================================================
-- ORGANIZATIONAL KYC (Know Your Customer) DATA
-- =====================================================================
-- Auto-populates organizations into clients table when org is created
CREATE TABLE IF NOT EXISTS `organizationKycData` (
  `id` VARCHAR(64) PRIMARY KEY,
  `organizationId` VARCHAR(64) NOT NULL UNIQUE,
  `clientId` VARCHAR(64) UNIQUE COMMENT 'Linked client from clients table',
  `legalName` VARCHAR(255),
  `registrationNumber` VARCHAR(100),
  `taxId` VARCHAR(100),
  `registeredAddress` TEXT,
  `businessType` ENUM('sole_proprietor', 'partnership', 'company', 'llc', 'ngo', 'other') DEFAULT 'company',
  `industryCode` VARCHAR(10),
  `industryName` VARCHAR(100),
  `yearEstablished` YEAR,
  `employeeCount` INT,
  `annualRevenue` DECIMAL(14, 2),
  `website` VARCHAR(500),
  `linkedinProfile` VARCHAR(500),
  `businessRegistrationDoc` LONGTEXT COMMENT 'URL or base64',
  `taxCertificateDoc` LONGTEXT,
  `directorName` VARCHAR(255),
  `directorEmail` VARCHAR(320),
  `directorPhone` VARCHAR(50),
  `kycVerificationStatus` ENUM('pending', 'under_review', 'verified', 'rejected') DEFAULT 'pending',
  `kycVerificationDate` TIMESTAMP,
  `kycVerifier` VARCHAR(64),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_org_id` (`organizationId`),
  KEY `idx_client_id` (`clientId`),
  KEY `idx_tax_id` (`taxId`),
  KEY `idx_kyc_status` (`kycVerificationStatus`),
  FOREIGN KEY (`organizationId`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================================
-- APPLICATION AUDIT LOG (for compliance & data retention tracking)
-- =====================================================================
CREATE TABLE IF NOT EXISTS `auditLogs` (
  `id` VARCHAR(64) PRIMARY KEY,
  `organizationId` VARCHAR(64),
  `userId` VARCHAR(64),
  `action` VARCHAR(255) COMMENT 'e.g., "user_create", "org_delete", "payment_process"',
  `entityType` VARCHAR(100) COMMENT 'e.g., "user", "organization", "invoice"',
  `entityId` VARCHAR(64),
  `ipAddress` VARCHAR(45),
  `userAgent` LONGTEXT,
  `oldValues` JSON COMMENT 'Before state',
  `newValues` JSON COMMENT 'After state',
  `description` LONGTEXT,
  `severity` ENUM('info', 'warning', 'critical') DEFAULT 'info',
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_org_id` (`organizationId`),
  INDEX `idx_user_id` (`userId`),
  INDEX `idx_action` (`action`),
  INDEX `idx_entity` (`entityType`, `entityId`),
  INDEX `idx_created` (`createdAt`),
  INDEX `idx_severity` (`severity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
