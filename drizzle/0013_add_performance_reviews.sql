-- Create performance_reviews table for Phase 21 Performance Management
CREATE TABLE IF NOT EXISTS `performance_reviews` (
  `id` varchar(64) NOT NULL,
  `employeeId` varchar(64) NOT NULL,
  `reviewerId` varchar(64) NOT NULL,
  `reviewDate` datetime NOT NULL,
  `fiscalYear` int NOT NULL,
  `quarter` int,
  `overallRating` decimal(3,2),
  `performanceScore` int,
  `strengths` text,
  `areasForImprovement` text,
  `goals` text,
  `comments` text,
  `status` enum('pending', 'in_progress', 'completed', 'archived') DEFAULT 'pending',
  `nextReviewDate` datetime,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_employee_id` (`employeeId`),
  KEY `idx_reviewer_id` (`reviewerId`),
  KEY `idx_fiscal_year` (`fiscalYear`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_perf_reviews_emp` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_perf_reviews_reviewer` FOREIGN KEY (`reviewerId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create performance_metrics table for tracking individual performance metrics
CREATE TABLE IF NOT EXISTS `performance_metrics` (
  `id` varchar(64) NOT NULL,
  `performanceReviewId` varchar(64) NOT NULL,
  `metricName` varchar(255) NOT NULL,
  `targetValue` varchar(255),
  `actualValue` varchar(255),
  `weight` decimal(5,2),
  `score` decimal(3,2),
  
  PRIMARY KEY (`id`),
  KEY `idx_review_id` (`performanceReviewId`),
  CONSTRAINT `fk_metrics_review` FOREIGN KEY (`performanceReviewId`) REFERENCES `performance_reviews` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
