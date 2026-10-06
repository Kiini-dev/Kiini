CREATE TABLE IF NOT EXISTS `payroll` (
  `id` VARCHAR(64) NOT NULL,
  `employeeId` VARCHAR(64) NOT NULL,
  `payPeriodStart` DATETIME NOT NULL,
  `payPeriodEnd` DATETIME NOT NULL,
  `basicSalary` INT NOT NULL,
  `allowances` INT DEFAULT 0,
  `deductions` INT DEFAULT 0,
  `tax` INT DEFAULT 0,
  `netSalary` INT NOT NULL,
  `status` ENUM('draft','processed','paid') NOT NULL DEFAULT 'draft',
  `paymentDate` DATETIME NULL,
  `paymentMethod` VARCHAR(50) NULL,
  `notes` TEXT NULL,
  `createdBy` VARCHAR(64) NULL,
  `createdAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payroll_employee` (`employeeId`),
  KEY `idx_payroll_period` (`payPeriodStart`, `payPeriodEnd`),
  KEY `idx_payroll_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @service_templates_org_column_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'serviceTemplates'
    AND COLUMN_NAME = 'organizationId'
);
SET @service_templates_org_column_sql = IF(
  @service_templates_org_column_exists = 0,
  'ALTER TABLE `serviceTemplates` ADD COLUMN `organizationId` VARCHAR(64) NULL AFTER `id`',
  'SELECT 1'
);
PREPARE service_templates_org_column_stmt FROM @service_templates_org_column_sql;
EXECUTE service_templates_org_column_stmt;
DEALLOCATE PREPARE service_templates_org_column_stmt;

SET @service_templates_org_index_exists = (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'serviceTemplates'
    AND INDEX_NAME = 'idx_service_templates_org'
);
SET @service_templates_org_index_sql = IF(
  @service_templates_org_index_exists = 0,
  'CREATE INDEX `idx_service_templates_org` ON `serviceTemplates` (`organizationId`)',
  'SELECT 1'
);
PREPARE service_templates_org_index_stmt FROM @service_templates_org_index_sql;
EXECUTE service_templates_org_index_stmt;
DEALLOCATE PREPARE service_templates_org_index_stmt;
