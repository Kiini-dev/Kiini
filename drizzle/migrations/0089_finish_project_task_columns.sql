ALTER TABLE `projectTasks` ADD COLUMN `tags` text NULL;
ALTER TABLE `projectTasks` ADD COLUMN `targetDate` datetime NULL;
ALTER TABLE `projectTasks` ADD COLUMN `billable` tinyint NOT NULL DEFAULT 1;
ALTER TABLE `projectTasks` ADD COLUMN `visibleToClient` tinyint NOT NULL DEFAULT 1;