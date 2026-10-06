-- Match the organization join key to organizations.id.
ALTER TABLE `activeSessions`
  MODIFY COLUMN `organizationId` varchar(64)
  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL;