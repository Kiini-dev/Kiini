ALTER TABLE `projectTasks`
  ADD COLUMN `clientId` varchar(64) NULL,
  ADD COLUMN `tags` text NULL,
  ADD COLUMN `targetDate` datetime NULL,
  ADD COLUMN `billable` tinyint NOT NULL DEFAULT 1,
  ADD COLUMN `visibleToClient` tinyint NOT NULL DEFAULT 1;