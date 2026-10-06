-- ============================================================================
-- SERVICE TEMPLATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS `serviceTemplates` (
  `id` varchar(64) PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(100),
  `hourlyRate` int DEFAULT 0,
  `fixedPrice` int DEFAULT 0,
  `unit` varchar(50) DEFAULT 'hour',
  `taxRate` int DEFAULT 0,
  `estimatedDuration` int,
  `deliverables` text,
  `terms` text,
  `isActive` tinyint DEFAULT 1,
  `createdBy` varchar(64),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `template_category_idx` (`category`),
  INDEX `template_created_idx` (`createdAt`)
);

-- ============================================================================
-- SERVICE USAGE TRACKING TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS `serviceUsageTracking` (
  `id` varchar(64) PRIMARY KEY,
  `serviceTemplateId` varchar(64) NOT NULL,
  `invoiceId` varchar(64),
  `estimateId` varchar(64),
  `projectId` varchar(64),
  `clientId` varchar(64),
  `quantity` int,
  `duration` int,
  `usageDate` timestamp DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('pending', 'delivered', 'invoiced', 'paid', 'cancelled') DEFAULT 'pending',
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_service_template_id` (`serviceTemplateId`),
  INDEX `idx_invoice_id` (`invoiceId`),
  INDEX `idx_estimate_id` (`estimateId`),
  INDEX `idx_project_id` (`projectId`),
  INDEX `idx_client_id` (`clientId`),
  INDEX `idx_usage_date` (`usageDate`),
  INDEX `idx_status` (`status`)
);
