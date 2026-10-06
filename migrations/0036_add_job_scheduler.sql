-- Migration: Add Job Scheduler & Monitoring Tables
-- Date: 2026-03-10
-- Purpose: Schedule background jobs and monitor their execution 24/7

CREATE TABLE IF NOT EXISTS scheduledJobs (
  id VARCHAR(64) PRIMARY KEY,
  jobName VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255),
  jobType ENUM('recurring_invoice', 'payment_reminder', 'overdue_notification', 
               'email_queue', 'sms_queue', 'cleanup', 'reconciliation', 'subscription_renewal', 'custom') NOT NULL,
  cronExpression VARCHAR(50) NOT NULL,
  handler VARCHAR(255) NOT NULL,
  isActive BOOLEAN DEFAULT 1,
  isManualOnly BOOLEAN DEFAULT 0,
  lastRunAt TIMESTAMP NULL,
  lastRunStatus ENUM('success', 'failed', 'partial', 'skipped') NULL,
  lastRunDuration INT NULL,
  lastFailureReason TEXT,
  nextScheduledRun TIMESTAMP NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdBy VARCHAR(64),
  INDEX idx_active (isActive),
  INDEX idx_next_run (nextScheduledRun),
  INDEX idx_job_type (jobType)
);

CREATE TABLE IF NOT EXISTS jobExecutionLogs (
  id VARCHAR(64) PRIMARY KEY,
  jobId VARCHAR(64) NOT NULL,
  startTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  endTime TIMESTAMP NULL,
  duration INT,
  status ENUM('running', 'success', 'failed', 'partial', 'cancelled', 'timeout') DEFAULT 'running',
  itemsProcessed INT DEFAULT 0,
  itemsFailed INT DEFAULT 0,
  itemsSkipped INT DEFAULT 0,
  errorMessage TEXT,
  stdout LONGTEXT,
  stderr LONGTEXT,
  metadata JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_job (jobId),
  INDEX idx_status (status),
  INDEX idx_start_time (startTime),
  FOREIGN KEY idx_job (jobId) REFERENCES scheduledJobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS jobAlertRules (
  id VARCHAR(64) PRIMARY KEY,
  jobId VARCHAR(64) NOT NULL,
  alertType ENUM('failure', 'timeout', 'incomplete', 'no_execution', 'slow_execution') NOT NULL,
  threshold INT,
  action ENUM('email', 'sms', 'both', 'webhook') NOT NULL,
  recipients JSON,
  webhookUrl VARCHAR(500),
  isActive BOOLEAN DEFAULT 1,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_job (jobId),
  INDEX idx_active (isActive),
  FOREIGN KEY idx_job (jobId) REFERENCES scheduledJobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS jobHeartbeat (
  id VARCHAR(64) PRIMARY KEY,
  jobId VARCHAR(64) UNIQUE NOT NULL,
  lastHeartbeatAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expectedHeartbeatInterval INT COMMENT 'in seconds',
  isHealthy BOOLEAN DEFAULT 1,
  consecutiveFailures INT DEFAULT 0,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_healthy (isHealthy),
  FOREIGN KEY idx_job (jobId) REFERENCES scheduledJobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS jobAlertHistory (
  id VARCHAR(64) PRIMARY KEY,
  alertRuleId VARCHAR(64) NOT NULL,
  jobId VARCHAR(64) NOT NULL,
  alert_sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  alert_type VARCHAR(100),
  message TEXT,
  recipients JSON,
  acknowledgedAt TIMESTAMP NULL,
  acknowledgedBy VARCHAR(64),
  INDEX idx_rule (alertRuleId),
  INDEX idx_job (jobId),
  INDEX idx_sent (alert_sent_at),
  FOREIGN KEY idx_rule (alertRuleId) REFERENCES jobAlertRules(id) ON DELETE CASCADE,
  FOREIGN KEY idx_job (jobId) REFERENCES scheduledJobs(id) ON DELETE CASCADE
);
