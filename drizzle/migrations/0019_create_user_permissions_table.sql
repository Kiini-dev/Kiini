-- Create userPermissions table
CREATE TABLE IF NOT EXISTS `userPermissions` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`resource` varchar(100) NOT NULL,
	`action` varchar(50) NOT NULL,
	`granted` tinyint NOT NULL DEFAULT 1,
	`grantedBy` varchar(64) NULL,
	`createdAt` timestamp NULL,
	PRIMARY KEY (`id`),
	KEY `userId_idx` (`userId`),
	KEY `resource_idx` (`resource`),
	KEY `granted_idx` (`granted`)
);
