CREATE TABLE `notifications` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`type` enum('info','success','warning','error','reminder') NOT NULL DEFAULT 'info',
	`category` varchar(100),
	`entityType` varchar(100),
	`entityId` varchar(64),
	`actionUrl` varchar(500),
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` datetime,
	`priority` enum('low','normal','high') NOT NULL DEFAULT 'normal',
	`expiresAt` datetime,
	`metadata` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);

CREATE TABLE `projectTasks` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`status` enum('todo','in_progress','review','completed','blocked') NOT NULL DEFAULT 'todo',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`assignedTo` varchar(64),
	`dueDate` datetime,
	`completedDate` datetime,
	`estimatedHours` int,
	`actualHours` int,
	`parentTaskId` varchar(64),
	`order` int DEFAULT 0,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `projectTasks_id` PRIMARY KEY(`id`)
);

CREATE TABLE `projects` (
	`id` varchar(64) NOT NULL,
	`projectNumber` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`clientId` varchar(64) NOT NULL,
	`status` enum('planning','active','on_hold','completed','cancelled') NOT NULL DEFAULT 'planning',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`startDate` datetime,
	`endDate` datetime,
	`actualStartDate` datetime,
	`actualEndDate` datetime,
	`budget` int,
	`actualCost` int DEFAULT 0,
	`progress` int DEFAULT 0,
	`assignedTo` varchar(64),
	`projectManager` varchar(64),
	`tags` text,
	`notes` text,
	`createdBy` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);

CREATE INDEX `user_idx` ON `notifications` (`userId`);
CREATE INDEX `is_read_idx` ON `notifications` (`isRead`);
CREATE INDEX `created_at_idx` ON `notifications` (`createdAt`);
CREATE INDEX `category_idx` ON `notifications` (`category`);
CREATE INDEX `project_idx` ON `projectTasks` (`projectId`);
CREATE INDEX `status_idx` ON `projectTasks` (`status`);
CREATE INDEX `assigned_to_idx` ON `projectTasks` (`assignedTo`);
CREATE INDEX `project_number_idx` ON `projects` (`projectNumber`);
CREATE INDEX `client_idx` ON `projects` (`clientId`);
CREATE INDEX `status_idx` ON `projects` (`status`);
CREATE INDEX `assigned_to_idx` ON `projects` (`assignedTo`);