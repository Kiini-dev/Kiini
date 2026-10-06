ALTER TABLE `leaveRequests`
  MODIFY COLUMN `status` ENUM('pending','approved','rejected','returned','cancelled') NOT NULL DEFAULT 'pending';

ALTER TABLE `leaveApprovals`
  MODIFY COLUMN `approvalStatus` ENUM('pending','approved','rejected','returned') NOT NULL;
