-- Extend projectTasks table with admin remarks and approval system
ALTER TABLE projectTasks ADD COLUMN `approvalStatus` ENUM('pending', 'approved', 'rejected', 'revision_requested') DEFAULT 'pending' AFTER `actualHours`;
ALTER TABLE projectTasks ADD COLUMN `adminRemarks` LONGTEXT NULL AFTER `approvalStatus`;
ALTER TABLE projectTasks ADD COLUMN `approvedBy` VARCHAR(64) NULL AFTER `adminRemarks`;
ALTER TABLE projectTasks ADD COLUMN `approvedAt` TIMESTAMP NULL AFTER `approvedBy`;
ALTER TABLE projectTasks ADD COLUMN `rejectionReason` LONGTEXT NULL AFTER `approvedAt`;

-- Create index for approval queries
CREATE INDEX approval_status_idx ON projectTasks(`approvalStatus`);
CREATE INDEX approved_by_idx ON projectTasks(`approvedBy`);
