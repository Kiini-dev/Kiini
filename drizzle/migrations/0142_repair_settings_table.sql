CREATE TABLE IF NOT EXISTS `settings` (
  `id` varchar(64) NOT NULL,
  `key` varchar(100) NOT NULL,
  `value` longtext NULL,
  `category` varchar(100) NULL,
  `description` text NULL,
  `updatedBy` varchar(64) NULL,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `key_idx` (`key`),
  KEY `category_idx` (`category`)
);
