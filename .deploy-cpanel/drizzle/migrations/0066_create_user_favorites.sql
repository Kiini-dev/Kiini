-- Create userFavorites table if missing
CREATE TABLE IF NOT EXISTS `userFavorites` (
  `id` varchar(64) NOT NULL,
  `userId` varchar(64) NOT NULL,
  `entityType` varchar(50) NOT NULL,
  `entityId` varchar(64) NOT NULL,
  `entityName` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fav_user_idx` (`userId`),
  KEY `fav_entity_idx` (`entityType`,`entityId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;