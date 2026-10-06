-- Migration: add workflows tables
-- Created by assistant on 2026-02-22
-- NOTE: matches Drizzle schema definitions in drizzle/schema.ts

CREATE TABLE IF NOT EXISTS `workflows` (
  `id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdBy` varchar(64),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `workflowTriggers` (
  `id` varchar(64) NOT NULL,
  `workflowId` varchar(64) NOT NULL,
  `eventType` varchar(100) NOT NULL,
  `conditions` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_workflow_triggers_workflow` (`workflowId`),
  CONSTRAINT `fk_workflow_triggers_workflow` FOREIGN KEY (`workflowId`) REFERENCES `workflows` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `workflowActions` (
  `id` varchar(64) NOT NULL,
  `workflowId` varchar(64) NOT NULL,
  `actionType` varchar(100) NOT NULL,
  `params` json,
  `"order"` int NOT NULL DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_workflow_actions_workflow` (`workflowId`),
  CONSTRAINT `fk_workflow_actions_workflow` FOREIGN KEY (`workflowId`) REFERENCES `workflows` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `workflowExecutions` (
  `id` varchar(64) NOT NULL,
  `workflowId` varchar(64) NOT NULL,
  `status` varchar(50) NOT NULL,
  `startedAt` datetime,
  `finishedAt` datetime,
  `runBy` varchar(64),
  `result` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_workflow_executions_workflow` (`workflowId`),
  CONSTRAINT `fk_workflow_executions_workflow` FOREIGN KEY (`workflowId`) REFERENCES `workflows` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
