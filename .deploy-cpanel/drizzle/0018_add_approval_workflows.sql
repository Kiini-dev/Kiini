-- Create approval_workflows table
CREATE TABLE `approval_workflows` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` varchar(50) NOT NULL,
	`applicable_entity` varchar(100) NOT NULL,
	`min_amount` int DEFAULT 0,
	`max_amount` int,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	INDEX `idx_org_id` (`organization_id`),
	INDEX `idx_applicable_entity` (`applicable_entity`),
	UNIQUE INDEX `unique_org_entity_workflow` (`organization_id`, `applicable_entity`)
);

-- Create approval_levels table
CREATE TABLE `approval_levels` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`workflow_id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`level_number` int NOT NULL,
	`level_name` varchar(100),
	`approval_type` varchar(50) NOT NULL,
	`approver_roles` json NOT NULL,
	`approver_user_ids` json,
	`escalation_days` int,
	`conditions` json,
	`requires_comment` boolean DEFAULT false,
	`allow_approve_partially` boolean DEFAULT false,
	`notification_template` varchar(100),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	INDEX `idx_workflow_id` (`workflow_id`),
	INDEX `idx_org_id` (`organization_id`)
);

-- Create approval_requests table
CREATE TABLE `approval_requests` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`workflow_id` varchar(36) NOT NULL,
	`entity_type` varchar(100) NOT NULL,
	`entity_id` varchar(36) NOT NULL,
	`status` varchar(50) NOT NULL,
	`current_level` int NOT NULL DEFAULT 1,
	`total_levels` int NOT NULL,
	`progress_percentage` int DEFAULT 0,
	`completed_levels` int DEFAULT 0,
	`requested_by` varchar(36) NOT NULL,
	`requested_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`reason` text,
	`amount` int,
	`due_date` timestamp,
	`completed_at` timestamp,
	`metadata` json,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	INDEX `idx_org_id` (`organization_id`),
	INDEX `idx_entity` (`entity_type`, `entity_id`),
	INDEX `idx_status` (`status`),
	INDEX `idx_current_level` (`current_level`)
);

-- Create approval_actions table
CREATE TABLE `approval_actions` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`approval_request_id` varchar(36) NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`level_number` int NOT NULL,
	`approver_id` varchar(36) NOT NULL,
	`approver_role` varchar(100),
	`action` varchar(50) NOT NULL,
	`status` varchar(50) NOT NULL,
	`comment` text,
	`decision_amount` int,
	`due_date` timestamp,
	`action_date` timestamp,
	`escalated_to` varchar(36),
	`escalation_reason` varchar(255),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	INDEX `idx_approval_request_id` (`approval_request_id`),
	INDEX `idx_approver_id` (`approver_id`),
	INDEX `idx_status` (`status`),
	INDEX `idx_level` (`level_number`)
);

-- Create approval_notifications table
CREATE TABLE `approval_notifications` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`approval_request_id` varchar(36),
	`approval_action_id` varchar(36),
	`recipient_id` varchar(36) NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`is_read` boolean DEFAULT false,
	`read_at` timestamp,
	`delivery_channels` json,
	`delivery_status` json,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`sent_at` timestamp,
	INDEX `idx_recipient_id` (`recipient_id`),
	INDEX `idx_approval_request_id` (`approval_request_id`),
	INDEX `idx_type` (`type`),
	INDEX `idx_is_read` (`is_read`)
);

-- Create approval_audit_log table
CREATE TABLE `approval_audit_log` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`approval_request_id` varchar(36) NOT NULL,
	`action` varchar(100) NOT NULL,
	`performed_by` varchar(36),
	`details` json,
	`ip_address` varchar(45),
	`user_agent` varchar(500),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	INDEX `idx_org_id` (`organization_id`),
	INDEX `idx_approval_request_id` (`approval_request_id`),
	INDEX `idx_created_at` (`created_at`)
);

-- Create approval_metrics table
CREATE TABLE `approval_metrics` (
	`id` varchar(36) PRIMARY KEY NOT NULL,
	`organization_id` varchar(36) NOT NULL,
	`workflow_id` varchar(36),
	`avg_approval_time` int,
	`median_approval_time` int,
	`total_requests` int DEFAULT 0,
	`approved_requests` int DEFAULT 0,
	`rejected_requests` int DEFAULT 0,
	`partially_approved_requests` int DEFAULT 0,
	`pending_requests` int DEFAULT 0,
	`approval_rate` int,
	`rejection_rate` int,
	`escalation_rate` int,
	`period` varchar(20),
	`period_date` timestamp NOT NULL,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	INDEX `idx_org_id` (`organization_id`),
	INDEX `idx_workflow_id` (`workflow_id`),
	INDEX `idx_period` (`period`, `period_date`)
);
