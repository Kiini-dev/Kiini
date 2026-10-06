-- Add missing product columns for comprehensive product management
-- Run this against the MySQL database

ALTER TABLE products
  ADD COLUMN maxStockLevel INT NULL AFTER minStockLevel,
  ADD COLUMN barcode VARCHAR(100) NULL AFTER warehouseLocation,
  ADD COLUMN batchNumber VARCHAR(100) NULL AFTER barcode,
  ADD COLUMN manufacturingDate VARCHAR(50) NULL AFTER batchNumber,
  ADD COLUMN expiryDate VARCHAR(50) NULL AFTER manufacturingDate,
  ADD COLUMN warrantyMonths INT DEFAULT 0 AFTER expiryDate,
  ADD COLUMN hsCode VARCHAR(50) NULL AFTER warrantyMonths,
  ADD COLUMN weight VARCHAR(20) NULL AFTER hsCode,
  ADD COLUMN weightUnit VARCHAR(20) DEFAULT 'kg' AFTER weight,
  ADD COLUMN warehouseLocation VARCHAR(255) NULL AFTER reorderQuantity;
