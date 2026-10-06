CREATE TABLE IF NOT EXISTS `website_leads` (
  `id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(320) NOT NULL,
  `phone` varchar(50),
  `company` varchar(255),
  `source` varchar(100) NOT NULL DEFAULT 'website',
  `landingPage` varchar(500),
  `campaign` varchar(255),
  `status` varchar(30) NOT NULL DEFAULT 'new',
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL,
  PRIMARY KEY (`id`),
  KEY `idx_website_leads_status` (`status`),
  KEY `idx_website_leads_created` (`createdAt`),
  KEY `idx_website_leads_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `website_analytics_events` (
  `id` varchar(64) NOT NULL,
  `eventName` varchar(100) NOT NULL,
  `path` varchar(500),
  `referrer` varchar(1000),
  `sessionId` varchar(128),
  `visitorId` varchar(128),
  `metadata` json,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_website_events_name` (`eventName`),
  KEY `idx_website_events_created` (`createdAt`),
  KEY `idx_website_events_path` (`path`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
