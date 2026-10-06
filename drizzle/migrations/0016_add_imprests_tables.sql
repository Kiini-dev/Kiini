-- Migration: Add missing imprests tables
-- Creates imprests and imprestSurrenders tables for imprest management

CREATE TABLE IF NOT EXISTS `imprests` (
  `id` varchar(64) NOT NULL PRIMARY KEY,
  `imprestNumber` varchar(50) NOT NULL UNIQUE,
  `userId` varchar(64) NOT NULL,
  `purpose` text,
  `amount` int NOT NULL COMMENT 'in cents',
  `status` enum('requested','approved','rejected','issued','surrendered') NOT NULL DEFAULT 'requested',
  `createdBy` varchar(64),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `user_idx` (`userId`),
  KEY `status_idx` (`status`),
  KEY `created_date_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `imprestSurrenders` (
  `id` varchar(64) NOT NULL PRIMARY KEY,
  `imprestId` varchar(64) NOT NULL,
  `amount` int NOT NULL COMMENT 'in cents',
  `notes` text,
  `surrenderedBy` varchar(64),
  `surrenderedAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  KEY `imprest_idx` (`imprestId`),
  KEY `surrender_date_idx` (`surrenderedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
