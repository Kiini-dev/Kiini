-- Repair tables used by active HR, knowledge-base, and budgeting routers.
-- The startup migration runner executes this file idempotently.

CREATE TABLE IF NOT EXISTS `publicHolidays` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64),
  `name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `year` int NOT NULL,
  `isRecurring` tinyint NOT NULL DEFAULT 0,
  `type` enum('public','company','optional') NOT NULL DEFAULT 'company',
  `description` text,
  `createdBy` varchar(64),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_public_holidays_org_year` (`organizationId`, `year`),
  KEY `idx_public_holidays_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `onboardingTemplates` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64),
  `name` varchar(255) NOT NULL,
  `description` text,
  `type` enum('onboarding','offboarding') NOT NULL,
  `createdBy` varchar(64),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_onboarding_templates_org` (`organizationId`),
  KEY `idx_onboarding_templates_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `onboardingTasks` ADD COLUMN `templateId` varchar(64) NULL;
ALTER TABLE `onboardingTasks` ADD COLUMN `title` varchar(255) NULL;
ALTER TABLE `onboardingTasks` ADD COLUMN `isRequired` tinyint NOT NULL DEFAULT 1;
ALTER TABLE `onboardingTasks` ADD COLUMN `sortOrder` int NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS `trainingPrograms` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64),
  `name` varchar(200) NOT NULL,
  `description` text,
  `category` varchar(100),
  `trainer` varchar(200),
  `startDate` date,
  `endDate` date,
  `maxParticipants` int,
  `cost` int DEFAULT 0,
  `location` varchar(200),
  `isOnline` tinyint NOT NULL DEFAULT 0,
  `isMandatory` tinyint NOT NULL DEFAULT 0,
  `status` enum('active','completed','cancelled','draft') NOT NULL DEFAULT 'active',
  `createdBy` varchar(64),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_training_programs_org` (`organizationId`),
  KEY `idx_training_programs_status` (`status`),
  KEY `idx_training_programs_start` (`startDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `trainingEnrollments` ADD COLUMN `programId` varchar(64) NULL;
ALTER TABLE `trainingEnrollments` ADD COLUMN `enrolledAt` datetime NULL;
ALTER TABLE `trainingEnrollments` ADD COLUMN `certificate` varchar(500) NULL;
ALTER TABLE `trainingEnrollments` ADD COLUMN `completedAt` datetime NULL;

CREATE TABLE IF NOT EXISTS `departmentBudgets` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64),
  `departmentId` varchar(64) NOT NULL,
  `year` int NOT NULL,
  `budgetedAmount` int NOT NULL DEFAULT 0,
  `spent` int NOT NULL DEFAULT 0,
  `remaining` int NOT NULL DEFAULT 0,
  `budgetStatus` enum('under','at','over') NOT NULL DEFAULT 'under',
  `category` varchar(100),
  `notes` text,
  `createdBy` varchar(64),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_department_budgets_org_year` (`organizationId`, `year`),
  KEY `idx_department_budgets_department` (`departmentId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `kb_categories` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64),
  `name` varchar(200) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `description` text,
  `icon` varchar(50) DEFAULT 'BookOpen',
  `color` varchar(30) DEFAULT 'bg-blue-500',
  `sortOrder` int DEFAULT 0,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_kbc_org` (`organizationId`),
  KEY `idx_kbc_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `kb_articles` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64),
  `categoryId` varchar(64) NOT NULL,
  `title` varchar(500) NOT NULL,
  `content` text,
  `excerpt` text,
  `status` varchar(20) DEFAULT 'published',
  `featured` tinyint DEFAULT 0,
  `readTime` int DEFAULT 3,
  `views` int DEFAULT 0,
  `tags` text,
  `createdBy` varchar(64),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_kba_org` (`organizationId`),
  KEY `idx_kba_cat` (`categoryId`),
  KEY `idx_kba_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
