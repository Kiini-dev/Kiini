-- Create login_attempts table for account lockout tracking
CREATE TABLE IF NOT EXISTS `login_attempts` (
  `id` varchar(64) NOT NULL,
  `userId` varchar(64) NOT NULL,
  `email` varchar(320) NOT NULL,
  `ipAddress` varchar(45) NOT NULL,
  `userAgent` varchar(500),
  `success` tinyint(1) DEFAULT 0,
  `attemptedAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `lockoutExpiresAt` timestamp NULL,
  
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`userId`),
  KEY `idx_email` (`email`),
  KEY `idx_ip_address` (`ipAddress`),
  KEY `idx_attempted_at` (`attemptedAt`),
  CONSTRAINT `fk_login_attempts_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create security audit table for tracking security events
CREATE TABLE IF NOT EXISTS `security_audit_log` (
  `id` varchar(64) NOT NULL,
  `userId` varchar(64),
  `eventType` varchar(100) NOT NULL,
  `severity` enum('info', 'warning', 'critical') DEFAULT 'info',
  `ipAddress` varchar(45),
  `userAgent` varchar(500),
  `description` text,
  `relatedEntityType` varchar(50),
  `relatedEntityId` varchar(64),
  `status` enum('success', 'failed', 'warning') DEFAULT 'success',
  `metadata` json,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`userId`),
  KEY `idx_event_type` (`eventType`),
  KEY `idx_severity` (`severity`),
  KEY `idx_created_at` (`createdAt`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create email verification table
CREATE TABLE IF NOT EXISTS `email_verification_tokens` (
  `id` varchar(64) NOT NULL,
  `userId` varchar(64) NOT NULL,
  `newEmail` varchar(320) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expiresAt` timestamp,
  `verifiedAt` timestamp NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`userId`),
  KEY `idx_token` (`token`),
  KEY `idx_expires_at` (`expiresAt`),
  CONSTRAINT `fk_email_verify_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create IP whitelist table for enhanced security
CREATE TABLE IF NOT EXISTS `ip_whitelist` (
  `id` varchar(64) NOT NULL,
  `userId` varchar(64) NOT NULL,
  `ipAddress` varchar(45) NOT NULL,
  `description` varchar(255),
  `isActive` tinyint(1) DEFAULT 1,
  `lastUsedAt` timestamp NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`userId`),
  KEY `idx_ip_address` (`ipAddress`),
  KEY `idx_active` (`isActive`),
  CONSTRAINT `fk_ip_whitelist_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
