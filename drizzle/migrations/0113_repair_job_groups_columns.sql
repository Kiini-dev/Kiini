ALTER TABLE `jobGroups` ADD COLUMN `organizationId` varchar(64) NULL;
ALTER TABLE `jobGroups` ADD COLUMN `managerId` varchar(64) NULL;
ALTER TABLE `jobGroups` ADD COLUMN `defaultBasicSalary` int NULL;
ALTER TABLE `jobGroups` ADD COLUMN `defaultAnnualLeaveDays` int NOT NULL DEFAULT 21;
ALTER TABLE `jobGroups` ADD COLUMN `defaultAllowances` text NULL;
ALTER TABLE `jobGroups` ADD COLUMN `defaultDeductions` text NULL;
ALTER TABLE `jobGroups` ADD COLUMN `defaultBenefits` text NULL;
ALTER TABLE `jobGroups` ADD KEY `job_group_org_idx` (`organizationId`);
ALTER TABLE `jobGroups` ADD KEY `job_group_manager_idx` (`managerId`);