CREATE TABLE `permissions` (
	`id` varchar(64) NOT NULL,
	`permissionName` varchar(100) NOT NULL,
	`description` text,
	`category` varchar(100),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `permissions_id` PRIMARY KEY(`id`)
	);

CREATE TABLE `projectComments` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`comment` text NOT NULL,
	`commentType` enum('remark','update','issue','question','approval') NOT NULL DEFAULT 'remark',
	`attachmentUrl` varchar(500),
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `projectComments_id` PRIMARY KEY(`id`)
	);

CREATE TABLE `rolePermissions` (
	`id` varchar(64) NOT NULL,
	`roleId` varchar(64) NOT NULL,
	`permissionId` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `rolePermissions_id` PRIMARY KEY(`id`)
	);

CREATE TABLE `staffTasks` (
	`id` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`department` varchar(100) NOT NULL,
	`assignedTo` varchar(64),
	`createdBy` varchar(64) NOT NULL,
	`status` enum('todo','in_progress','completed','blocked') NOT NULL DEFAULT 'todo',
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`dueDate` datetime,
	`completedDate` datetime,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `staffTasks_id` PRIMARY KEY(`id`)
	);

CREATE TABLE `userProjectAssignments` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`role` enum('project_manager','team_lead','developer','designer','qa','other') NOT NULL DEFAULT 'developer',
	`assignedDate` datetime,
	`removedDate` datetime,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `userProjectAssignments_id` PRIMARY KEY(`id`)
	);

CREATE TABLE `userRoles` (
	`id` varchar(64) NOT NULL,
	`roleName` varchar(100) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `userRoles_id` PRIMARY KEY(`id`)
	);

CREATE INDEX `permission_name_idx` ON `permissions` (`permissionName`);
CREATE INDEX `category_idx` ON `permissions` (`category`);
CREATE INDEX `project_idx` ON `projectComments` (`projectId`);
CREATE INDEX `user_idx` ON `projectComments` (`userId`);
CREATE INDEX `created_at_idx` ON `projectComments` (`createdAt`);
CREATE INDEX `role_idx` ON `rolePermissions` (`roleId`);
CREATE INDEX `permission_idx` ON `rolePermissions` (`permissionId`);
CREATE INDEX `department_idx` ON `staffTasks` (`department`);
CREATE INDEX `assigned_to_idx` ON `staffTasks` (`assignedTo`);
CREATE INDEX `status_idx` ON `staffTasks` (`status`);
CREATE INDEX `user_idx` ON `userProjectAssignments` (`userId`);
CREATE INDEX `project_idx` ON `userProjectAssignments` (`projectId`);
CREATE INDEX `role_name_idx` ON `userRoles` (`roleName`);