-- Add missing employee columns required by the current application schema
SET @table_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employees'
);

SET @gender_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employees'
    AND COLUMN_NAME = 'gender'
);
SET @emergency_name_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employees'
    AND COLUMN_NAME = 'emergencyContactName'
);
SET @emergency_relationship_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employees'
    AND COLUMN_NAME = 'emergencyContactRelationship'
);
SET @emergency_phone_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employees'
    AND COLUMN_NAME = 'emergencyContactPhone'
);
SET @bank_name_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employees'
    AND COLUMN_NAME = 'bankName'
);
SET @nhif_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employees'
    AND COLUMN_NAME = 'nhifNumber'
);
SET @nssf_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employees'
    AND COLUMN_NAME = 'nssfNumber'
);

SET @sql = IF(
  @table_exists = 1 AND @gender_exists = 0,
  'ALTER TABLE `employees` ADD COLUMN `gender` ENUM(''male'',''female'',''other'') NULL AFTER `phone`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  @table_exists = 1 AND @emergency_name_exists = 0,
  'ALTER TABLE `employees` ADD COLUMN `emergencyContactName` VARCHAR(255) NULL AFTER `address`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  @table_exists = 1 AND @emergency_relationship_exists = 0,
  'ALTER TABLE `employees` ADD COLUMN `emergencyContactRelationship` VARCHAR(100) NULL AFTER `emergencyContactName`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  @table_exists = 1 AND @emergency_phone_exists = 0,
  'ALTER TABLE `employees` ADD COLUMN `emergencyContactPhone` VARCHAR(50) NULL AFTER `emergencyContactRelationship`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  @table_exists = 1 AND @bank_name_exists = 0,
  'ALTER TABLE `employees` ADD COLUMN `bankName` VARCHAR(255) NULL AFTER `emergencyContact`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  @table_exists = 1 AND @nhif_exists = 0,
  'ALTER TABLE `employees` ADD COLUMN `nhifNumber` VARCHAR(50) NULL AFTER `bankAccountNumber`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
  @table_exists = 1 AND @nssf_exists = 0,
  'ALTER TABLE `employees` ADD COLUMN `nssfNumber` VARCHAR(50) NULL AFTER `nhifNumber`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
