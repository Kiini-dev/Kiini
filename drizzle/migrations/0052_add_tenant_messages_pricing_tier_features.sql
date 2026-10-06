-- Migration 0052: Add pricingTierFeatures and tenantMessages tables
-- pricingTierFeatures: maps which modules are included per pricing tier
-- tenantMessages: super-admin communication channel to tenant admins

CREATE TABLE IF NOT EXISTS `pricingTierFeatures` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `tier` ENUM('trial','starter','professional','enterprise','custom') NOT NULL,
  `featureKey` VARCHAR(100) NOT NULL,
  `isEnabled` TINYINT NOT NULL DEFAULT 1,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ptf_tier` (`tier`),
  INDEX `idx_ptf_feature` (`featureKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `tenantMessages` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `senderId` VARCHAR(64) NOT NULL,
  `subject` VARCHAR(500) NOT NULL,
  `content` LONGTEXT NOT NULL,
  `priority` ENUM('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
  `targetType` ENUM('all_admins','specific_org','specific_user') NOT NULL DEFAULT 'all_admins',
  `targetOrgId` VARCHAR(64) DEFAULT NULL,
  `targetUserId` VARCHAR(64) DEFAULT NULL,
  `isRead` TINYINT NOT NULL DEFAULT 0,
  `readAt` TIMESTAMP NULL DEFAULT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_tm_sender` (`senderId`),
  INDEX `idx_tm_target_org` (`targetOrgId`),
  INDEX `idx_tm_target_user` (`targetUserId`),
  INDEX `idx_tm_created` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Seed default pricing tier features
-- Trial tier: CRM, Projects, Communications only
INSERT IGNORE INTO `pricingTierFeatures` (`id`, `tier`, `featureKey`, `isEnabled`) VALUES
  ('ptf_trial_crm', 'trial', 'crm', 1),
  ('ptf_trial_projects', 'trial', 'projects', 1),
  ('ptf_trial_communications', 'trial', 'communications', 1),
  ('ptf_trial_tickets', 'trial', 'tickets', 1),
  ('ptf_trial_hr', 'trial', 'hr', 0),
  ('ptf_trial_payroll', 'trial', 'payroll', 0),
  ('ptf_trial_leave', 'trial', 'leave', 0),
  ('ptf_trial_attendance', 'trial', 'attendance', 0),
  ('ptf_trial_invoicing', 'trial', 'invoicing', 0),
  ('ptf_trial_payments', 'trial', 'payments', 0),
  ('ptf_trial_expenses', 'trial', 'expenses', 0),
  ('ptf_trial_procurement', 'trial', 'procurement', 0),
  ('ptf_trial_accounting', 'trial', 'accounting', 0),
  ('ptf_trial_budgets', 'trial', 'budgets', 0),
  ('ptf_trial_reports', 'trial', 'reports', 0),
  ('ptf_trial_ai_hub', 'trial', 'ai_hub', 0),
  ('ptf_trial_contracts', 'trial', 'contracts', 0),
  ('ptf_trial_work_orders', 'trial', 'work_orders', 0);

-- Starter tier: CRM, Projects, Invoicing, Payments, Expenses, Communications, HR basics
INSERT IGNORE INTO `pricingTierFeatures` (`id`, `tier`, `featureKey`, `isEnabled`) VALUES
  ('ptf_starter_crm', 'starter', 'crm', 1),
  ('ptf_starter_projects', 'starter', 'projects', 1),
  ('ptf_starter_communications', 'starter', 'communications', 1),
  ('ptf_starter_tickets', 'starter', 'tickets', 1),
  ('ptf_starter_hr', 'starter', 'hr', 1),
  ('ptf_starter_leave', 'starter', 'leave', 1),
  ('ptf_starter_invoicing', 'starter', 'invoicing', 1),
  ('ptf_starter_payments', 'starter', 'payments', 1),
  ('ptf_starter_expenses', 'starter', 'expenses', 1),
  ('ptf_starter_reports', 'starter', 'reports', 1),
  ('ptf_starter_payroll', 'starter', 'payroll', 0),
  ('ptf_starter_attendance', 'starter', 'attendance', 0),
  ('ptf_starter_procurement', 'starter', 'procurement', 0),
  ('ptf_starter_accounting', 'starter', 'accounting', 0),
  ('ptf_starter_budgets', 'starter', 'budgets', 0),
  ('ptf_starter_ai_hub', 'starter', 'ai_hub', 0),
  ('ptf_starter_contracts', 'starter', 'contracts', 0),
  ('ptf_starter_work_orders', 'starter', 'work_orders', 0);

-- Professional tier: Everything except AI Hub & advanced analytics
INSERT IGNORE INTO `pricingTierFeatures` (`id`, `tier`, `featureKey`, `isEnabled`) VALUES
  ('ptf_pro_crm', 'professional', 'crm', 1),
  ('ptf_pro_projects', 'professional', 'projects', 1),
  ('ptf_pro_communications', 'professional', 'communications', 1),
  ('ptf_pro_tickets', 'professional', 'tickets', 1),
  ('ptf_pro_hr', 'professional', 'hr', 1),
  ('ptf_pro_payroll', 'professional', 'payroll', 1),
  ('ptf_pro_leave', 'professional', 'leave', 1),
  ('ptf_pro_attendance', 'professional', 'attendance', 1),
  ('ptf_pro_invoicing', 'professional', 'invoicing', 1),
  ('ptf_pro_payments', 'professional', 'payments', 1),
  ('ptf_pro_expenses', 'professional', 'expenses', 1),
  ('ptf_pro_procurement', 'professional', 'procurement', 1),
  ('ptf_pro_accounting', 'professional', 'accounting', 1),
  ('ptf_pro_budgets', 'professional', 'budgets', 1),
  ('ptf_pro_reports', 'professional', 'reports', 1),
  ('ptf_pro_contracts', 'professional', 'contracts', 1),
  ('ptf_pro_work_orders', 'professional', 'work_orders', 1),
  ('ptf_pro_ai_hub', 'professional', 'ai_hub', 0);

-- Enterprise tier: Everything enabled
INSERT IGNORE INTO `pricingTierFeatures` (`id`, `tier`, `featureKey`, `isEnabled`) VALUES
  ('ptf_ent_crm', 'enterprise', 'crm', 1),
  ('ptf_ent_projects', 'enterprise', 'projects', 1),
  ('ptf_ent_communications', 'enterprise', 'communications', 1),
  ('ptf_ent_tickets', 'enterprise', 'tickets', 1),
  ('ptf_ent_hr', 'enterprise', 'hr', 1),
  ('ptf_ent_payroll', 'enterprise', 'payroll', 1),
  ('ptf_ent_leave', 'enterprise', 'leave', 1),
  ('ptf_ent_attendance', 'enterprise', 'attendance', 1),
  ('ptf_ent_invoicing', 'enterprise', 'invoicing', 1),
  ('ptf_ent_payments', 'enterprise', 'payments', 1),
  ('ptf_ent_expenses', 'enterprise', 'expenses', 1),
  ('ptf_ent_procurement', 'enterprise', 'procurement', 1),
  ('ptf_ent_accounting', 'enterprise', 'accounting', 1),
  ('ptf_ent_budgets', 'enterprise', 'budgets', 1),
  ('ptf_ent_reports', 'enterprise', 'reports', 1),
  ('ptf_ent_ai_hub', 'enterprise', 'ai_hub', 1),
  ('ptf_ent_contracts', 'enterprise', 'contracts', 1),
  ('ptf_ent_work_orders', 'enterprise', 'work_orders', 1);
