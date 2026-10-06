-- Create scheduledReminders table if missing
CREATE TABLE IF NOT EXISTS `scheduledReminders` (
  `id` varchar(64) NOT NULL,
  `reminderId` varchar(64) NOT NULL,
  `referenceType` varchar(50) NOT NULL,
  `referenceId` varchar(64) NOT NULL,
  `recipientId` varchar(64) NOT NULL,
  `recipientType` enum('user','client') NOT NULL,
  `scheduledFor` datetime NOT NULL,
  `status` enum('pending','sent','failed','cancelled') NOT NULL DEFAULT 'pending',
  `sentAt` datetime DEFAULT NULL,
  `error` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;