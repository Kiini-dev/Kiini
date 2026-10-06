-- Migration 0051: Add missing product columns that exist in schema but not in DB
-- These columns were added to schema.ts but never migrated

ALTER TABLE products ADD COLUMN maxStockLevel INT NULL AFTER lastRestockDate;
ALTER TABLE products ADD COLUMN barcode VARCHAR(100) NULL AFTER maxStockLevel;
ALTER TABLE products ADD COLUMN batchNumber VARCHAR(100) NULL AFTER barcode;
ALTER TABLE products ADD COLUMN manufacturingDate VARCHAR(50) NULL AFTER batchNumber;
ALTER TABLE products ADD COLUMN expiryDate VARCHAR(50) NULL AFTER manufacturingDate;
ALTER TABLE products ADD COLUMN warrantyMonths INT NULL DEFAULT 0 AFTER expiryDate;
ALTER TABLE products ADD COLUMN hsCode VARCHAR(50) NULL AFTER warrantyMonths;
ALTER TABLE products ADD COLUMN weight VARCHAR(20) NULL AFTER hsCode;
ALTER TABLE products ADD COLUMN weightUnit VARCHAR(20) NULL DEFAULT 'kg' AFTER weight;
ALTER TABLE products ADD COLUMN warehouseLocation VARCHAR(255) NULL AFTER weightUnit;
