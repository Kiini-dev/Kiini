CREATE TABLE `defaultSettings` (
	`id` varchar(64) NOT NULL,
	`category` varchar(100) NOT NULL,
	`key` varchar(100) NOT NULL,
	`defaultValue` text,
	`description` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `defaultSettings_id` PRIMARY KEY(`id`)
	);

CREATE TABLE `documentNumberFormats` (
	`id` varchar(64) NOT NULL,
	`documentType` varchar(50) NOT NULL,
	`prefix` varchar(50) NOT NULL DEFAULT '',
	`padding` int NOT NULL DEFAULT 6,
	`separator` varchar(10) DEFAULT '-',
	`currentNumber` int NOT NULL DEFAULT 1,
	`formatExample` varchar(100),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `documentNumberFormats_id` PRIMARY KEY(`id`)
	);

CREATE INDEX `category_key_idx` ON `defaultSettings` (`category`,`key`);
CREATE INDEX `doc_type_idx` ON `documentNumberFormats` (`documentType`);