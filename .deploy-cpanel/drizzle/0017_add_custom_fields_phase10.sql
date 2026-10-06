-- Phase 10: Custom Fields Engine Tables
-- Supports dynamic field creation for Contact, Invoice, and other entities

CREATE TABLE IF NOT EXISTS customFields (
    id VARCHAR(64) PRIMARY KEY,
    organizationId VARCHAR(64) NOT NULL,
    entityType VARCHAR(100) NOT NULL,
    fieldName VARCHAR(255) NOT NULL,
    fieldLabel VARCHAR(255) NOT NULL,
    fieldType VARCHAR(50) NOT NULL,
    fieldDescription TEXT,
    required TINYINT DEFAULT 0 NOT NULL,
    displayOrder INT NOT NULL DEFAULT 0,
    isActive TINYINT DEFAULT 1 NOT NULL,
    options JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_organization_entity(organizationId, entityType),
    INDEX idx_is_active(isActive),
    INDEX idx_field_type(fieldType)
);

CREATE TABLE IF NOT EXISTS fieldValidations (
    id VARCHAR(64) PRIMARY KEY,
    customFieldId VARCHAR(64) NOT NULL,
    ruleType VARCHAR(50) NOT NULL,
    ruleValue TEXT,
    errorMessage VARCHAR(500),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customFieldId) REFERENCES customFields(id) ON DELETE CASCADE,
    INDEX idx_custom_field_id(customFieldId),
    INDEX idx_rule_type(ruleType)
);

CREATE TABLE IF NOT EXISTS fieldValues (
    id VARCHAR(64) PRIMARY KEY,
    customFieldId VARCHAR(64) NOT NULL,
    entityId VARCHAR(64) NOT NULL,
    entityType VARCHAR(100) NOT NULL,
    organizationId VARCHAR(64) NOT NULL,
    value LONGTEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customFieldId) REFERENCES customFields(id) ON DELETE CASCADE,
    INDEX idx_custom_field_entity(customFieldId, entityType),
    INDEX idx_entity_id(entityId),
    INDEX idx_organization_entity(organizationId, entityType)
);

-- End Phase 10 Custom Fields Engine
