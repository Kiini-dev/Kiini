ALTER TABLE `emailCampaigns`
  ADD COLUMN `organizationId` varchar(64) NULL AFTER `id`;

CREATE INDEX `idx_email_campaigns_organization` ON `emailCampaigns` (`organizationId`, `createdAt`);

CREATE TABLE IF NOT EXISTS `emailMarketingSubscribers` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NOT NULL,
  `email` varchar(320) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `optedIn` tinyint(1) NOT NULL DEFAULT 1,
  `consentAt` timestamp NOT NULL,
  `consentSource` varchar(255) NOT NULL,
  `unsubscribeToken` varchar(64) NOT NULL,
  `unsubscribedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email_marketing_subscriber_org_email` (`organizationId`, `email`),
  UNIQUE KEY `uq_email_marketing_subscriber_token` (`unsubscribeToken`),
  KEY `idx_email_marketing_subscriber_optin` (`organizationId`, `optedIn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `emailUnsubscribes` (
  `id` varchar(64) NOT NULL,
  `email` varchar(320) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `unsubscribedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_email_unsubscribes_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
