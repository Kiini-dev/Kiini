-- Create reminders table if missing
CREATE TABLE IF NOT EXISTS `reminders` (
  `id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('invoice_due','estimate_expiry','project_milestone','payment_overdue','custom') NOT NULL,
  `frequency` enum('once','daily','weekly','monthly','custom') NOT NULL,
  `customDays` int DEFAULT NULL,
  `timing` enum('before','on','after') NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `emailEnabled` tinyint(1) NOT NULL DEFAULT 1,
  `smsEnabled` tinyint(1) NOT NULL DEFAULT 0,
  `emailTemplate` text,
  `smsTemplate` text,
  `createdBy` varchar(64) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;