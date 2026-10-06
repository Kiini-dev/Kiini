ALTER TABLE `emailTemplates`
  ADD COLUMN `isDefault` TINYINT NOT NULL DEFAULT 0 AFTER `attachments`;

ALTER TABLE `emailTemplates`
  ADD COLUMN `isSystem` TINYINT NOT NULL DEFAULT 0 AFTER `isDefault`;

CREATE INDEX `idx_email_templates_default` ON `emailTemplates` (`category`, `isDefault`, `organizationId`);