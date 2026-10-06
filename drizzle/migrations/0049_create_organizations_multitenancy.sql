-- ============================================================================
-- Multi-Tenancy: Organizations & Feature Flags
-- Adds organizationId column to users table for multi-tenant support
-- ============================================================================

-- 1. Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id            VARCHAR(64)   NOT NULL PRIMARY KEY,
  name          VARCHAR(255)  NOT NULL,
  slug          VARCHAR(100)  NOT NULL,
  plan          VARCHAR(50)   NOT NULL DEFAULT 'trial',
  isActive      TINYINT(1)    NOT NULL DEFAULT 1,
  maxUsers      INT                    DEFAULT 10,
  settings      JSON,
  logoUrl       LONGTEXT,
  domain        VARCHAR(255),
  contactEmail  VARCHAR(320),
  contactPhone  VARCHAR(50),
  address       TEXT,
  country       VARCHAR(100),
  createdAt     TIMESTAMP              DEFAULT CURRENT_TIMESTAMP,
  updatedAt     TIMESTAMP              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_org_slug (slug),
  KEY idx_org_active (isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Per-organization feature flags
CREATE TABLE IF NOT EXISTS organizationFeatures (
  id             VARCHAR(64)   NOT NULL PRIMARY KEY,
  organizationId VARCHAR(64)   NOT NULL,
  featureKey     VARCHAR(100)  NOT NULL,
  isEnabled      TINYINT(1)    NOT NULL DEFAULT 1,
  config         JSON,
  updatedAt      TIMESTAMP              DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_org_feature (organizationId, featureKey),
  KEY idx_orgfeat_org (organizationId),
  KEY idx_orgfeat_key (featureKey)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Add organizationId column to users (nullable for existing users)
-- MySQL doesn't support ADD COLUMN IF NOT EXISTS; duplicate-column error is non-fatal.
ALTER TABLE users
  ADD COLUMN organizationId VARCHAR(64) NULL AFTER photoUrl;
