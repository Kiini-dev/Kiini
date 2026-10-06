ALTER TABLE `jobGroups` ADD COLUMN `organizationId` varchar(64) NULL;
ALTER TABLE `jobGroups` ADD COLUMN `managerId` varchar(64) NULL;
ALTER TABLE `jobGroups` ADD KEY `job_group_org_idx` (`organizationId`);
ALTER TABLE `jobGroups` ADD KEY `job_group_manager_idx` (`managerId`);