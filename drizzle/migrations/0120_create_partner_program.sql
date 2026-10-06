CREATE TABLE IF NOT EXISTS `partner_profiles` (
  `id` varchar(64) NOT NULL,
  `userId` varchar(64),
  `name` varchar(255) NOT NULL,
  `email` varchar(320) NOT NULL,
  `company` varchar(255),
  `phone` varchar(50),
  `website` varchar(500),
  `partnerType` varchar(30) NOT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'pending',
  `referralCode` varchar(80) NOT NULL,
  `commissionRate` decimal(5,2) DEFAULT 15,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL,
  PRIMARY KEY (`id`), KEY `idx_partner_profiles_email` (`email`),
  KEY `idx_partner_profiles_status` (`status`), KEY `idx_partner_profiles_code` (`referralCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `partner_referrals` (
  `id` varchar(64) NOT NULL,
  `partnerId` varchar(64) NOT NULL,
  `referredName` varchar(255),
  `referredEmail` varchar(320) NOT NULL,
  `organizationId` varchar(64),
  `source` varchar(100) DEFAULT 'partner',
  `status` varchar(30) NOT NULL DEFAULT 'submitted',
  `convertedAt` timestamp NULL,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL,
  PRIMARY KEY (`id`), KEY `idx_partner_referrals_partner` (`partnerId`),
  KEY `idx_partner_referrals_email` (`referredEmail`), KEY `idx_partner_referrals_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `partner_commissions` (
  `id` varchar(64) NOT NULL,
  `partnerId` varchar(64) NOT NULL,
  `referralId` varchar(64),
  `dealId` varchar(64),
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'KES',
  `status` varchar(30) NOT NULL DEFAULT 'pending',
  `earnedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payableAt` timestamp NULL,
  `paidAt` timestamp NULL,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`), KEY `idx_partner_commissions_partner` (`partnerId`),
  KEY `idx_partner_commissions_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `partner_payouts` (
  `id` varchar(64) NOT NULL,
  `partnerId` varchar(64) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'KES',
  `method` varchar(50) NOT NULL,
  `reference` varchar(255),
  `status` varchar(30) NOT NULL DEFAULT 'requested',
  `requestedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processedAt` timestamp NULL,
  `notes` text,
  PRIMARY KEY (`id`), KEY `idx_partner_payouts_partner` (`partnerId`),
  KEY `idx_partner_payouts_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;