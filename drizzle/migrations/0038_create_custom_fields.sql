-- Migration: Create customFields, fieldValidations, and fieldValues tables
-- Phase 10: Custom Fields feature

CREATE TABLE IF NOT EXISTS `customFields` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `entityType` varchar(100) NOT NULL,
  `fieldName` varchar(255) NOT NULL,
  `fieldLabel` varchar(255) NOT NULL,
  `fieldType` varchar(50) NOT NULL,
  `fieldDescription` text,
  `required` tinyint NOT NULL DEFAULT 0,
  `displayOrder` int NOT NULL DEFAULT 0,
  `isActive` tinyint NOT NULL DEFAULT 1,
  `options` json,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_organization_entity` (`organizationId`, `entityType`),
  INDEX `idx_is_active` (`isActive`),
  INDEX `idx_field_type` (`fieldType`)
);

CREATE TABLE IF NOT EXISTS `fieldValidations` (
  `id` varchar(64) NOT NULL,
  `customFieldId` varchar(64) NOT NULL,
  `ruleType` varchar(50) NOT NULL,
  `ruleValue` text,
  `errorMessage` varchar(500),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_custom_field_id` (`customFieldId`),
  INDEX `idx_rule_type` (`ruleType`)
);

CREATE TABLE IF NOT EXISTS `fieldValues` (
  `id` varchar(64) NOT NULL,
  `customFieldId` varchar(64) NOT NULL,
  `entityId` varchar(64) NOT NULL,
  `entityType` varchar(100) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `value` longtext,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_custom_field_entity` (`customFieldId`, `entityId`),
  INDEX `idx_entity_id` (`entityId`),
  INDEX `idx_organization_entity` (`organizationId`, `entityType`)
);
