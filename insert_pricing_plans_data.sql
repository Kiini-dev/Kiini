-- Insert Pricing Plans for Kiini
-- These are the standardized tiers for subscription management

-- Trial Plan
INSERT INTO `pricingPlans` 
(`id`, `planName`, `planSlug`, `tier`, `monthlyPrice`, `annualPrice`, `monthlyAnnualDiscount`, `maxUsers`, `maxProjects`, `maxStorageGB`, `features`, `supportLevel`, `isActive`, `displayOrder`, `createdAt`, `updatedAt`)
VALUES
('plan_trial_001', 'Trial', 'trial', 'free', 0.00, 0.00, 0.00, 3, 1, 1, '{"crm": true, "projects": true, "hr": false, "payroll": false, "invoicing": true, "inventory": false, "procurement": false, "ict": false, "tickets": false, "knowledgebase": false}', 'email', 1, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  planName = VALUES(planName),
  tier = VALUES(tier),
  monthlyPrice = VALUES(monthlyPrice),
  annualPrice = VALUES(annualPrice),
  monthlyAnnualDiscount = VALUES(monthlyAnnualDiscount),
  maxUsers = VALUES(maxUsers),
  maxProjects = VALUES(maxProjects),
  maxStorageGB = VALUES(maxStorageGB),
  features = VALUES(features),
  supportLevel = VALUES(supportLevel),
  isActive = VALUES(isActive),
  displayOrder = VALUES(displayOrder),
  updatedAt = NOW();

-- Starter Plan
INSERT INTO `pricingPlans` 
(`id`, `planName`, `planSlug`, `tier`, `monthlyPrice`, `annualPrice`, `monthlyAnnualDiscount`, `maxUsers`, `maxProjects`, `maxStorageGB`, `features`, `supportLevel`, `isActive`, `displayOrder`, `createdAt`, `updatedAt`)
VALUES
('plan_starter_001', 'Starter', 'starter', 'starter', 4999.00, 49990.00, 16.67, 5, 3, 10, '{"crm": true, "projects": true, "hr": true, "payroll": false, "invoicing": true, "inventory": true, "procurement": false, "ict": false, "tickets": true, "knowledgebase": true}', 'email', 1, 2, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  planName = VALUES(planName),
  tier = VALUES(tier),
  monthlyPrice = VALUES(monthlyPrice),
  annualPrice = VALUES(annualPrice),
  monthlyAnnualDiscount = VALUES(monthlyAnnualDiscount),
  maxUsers = VALUES(maxUsers),
  maxProjects = VALUES(maxProjects),
  maxStorageGB = VALUES(maxStorageGB),
  features = VALUES(features),
  supportLevel = VALUES(supportLevel),
  isActive = VALUES(isActive),
  displayOrder = VALUES(displayOrder),
  updatedAt = NOW();

-- Gold Plan
INSERT INTO `pricingPlans` 
(`id`, `planName`, `planSlug`, `tier`, `monthlyPrice`, `annualPrice`, `monthlyAnnualDiscount`, `maxUsers`, `maxProjects`, `maxStorageGB`, `features`, `supportLevel`, `isActive`, `displayOrder`, `createdAt`, `updatedAt`)
VALUES
('plan_gold_001', 'Gold', 'gold', 'gold', 7499.00, 74990.00, 16.67, 10, 5, 20, '{"crm": true, "projects": true, "hr": true, "payroll": true, "invoicing": true, "inventory": true, "procurement": true, "ict": false, "tickets": true, "knowledgebase": true}', 'priority', 1, 3, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  planName = VALUES(planName),
  tier = VALUES(tier),
  monthlyPrice = VALUES(monthlyPrice),
  annualPrice = VALUES(annualPrice),
  monthlyAnnualDiscount = VALUES(monthlyAnnualDiscount),
  maxUsers = VALUES(maxUsers),
  maxProjects = VALUES(maxProjects),
  maxStorageGB = VALUES(maxStorageGB),
  features = VALUES(features),
  supportLevel = VALUES(supportLevel),
  isActive = VALUES(isActive),
  displayOrder = VALUES(displayOrder),
  updatedAt = NOW();

-- Professional Plan
INSERT INTO `pricingPlans` 
(`id`, `planName`, `planSlug`, `tier`, `monthlyPrice`, `annualPrice`, `monthlyAnnualDiscount`, `maxUsers`, `maxProjects`, `maxStorageGB`, `features`, `supportLevel`, `isActive`, `displayOrder`, `createdAt`, `updatedAt`)
VALUES
('plan_professional_001', 'Professional', 'professional', 'professional', 9999.00, 99990.00, 16.67, 20, 10, 50, '{"crm": true, "projects": true, "hr": true, "payroll": true, "invoicing": true, "inventory": true, "procurement": true, "ict": false, "tickets": true, "knowledgebase": true}', 'priority', 1, 4, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  planName = VALUES(planName),
  tier = VALUES(tier),
  monthlyPrice = VALUES(monthlyPrice),
  annualPrice = VALUES(annualPrice),
  monthlyAnnualDiscount = VALUES(monthlyAnnualDiscount),
  maxUsers = VALUES(maxUsers),
  maxProjects = VALUES(maxProjects),
  maxStorageGB = VALUES(maxStorageGB),
  features = VALUES(features),
  supportLevel = VALUES(supportLevel),
  isActive = VALUES(isActive),
  displayOrder = VALUES(displayOrder),
  updatedAt = NOW();

-- Enterprise Plan
INSERT INTO `pricingPlans` 
(`id`, `planName`, `planSlug`, `tier`, `monthlyPrice`, `annualPrice`, `monthlyAnnualDiscount`, `maxUsers`, `maxProjects`, `maxStorageGB`, `features`, `supportLevel`, `isActive`, `displayOrder`, `createdAt`, `updatedAt`)
VALUES
('plan_enterprise_001', 'Enterprise', 'enterprise', 'enterprise', 24999.00, 249990.00, 16.67, 999, 999, 999, '{"crm": true, "projects": true, "hr": true, "payroll": true, "invoicing": true, "inventory": true, "procurement": true, "ict": true, "tickets": true, "knowledgebase": true}', 'dedicated_manager', 1, 5, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  planName = VALUES(planName),
  tier = VALUES(tier),
  monthlyPrice = VALUES(monthlyPrice),
  annualPrice = VALUES(annualPrice),
  monthlyAnnualDiscount = VALUES(monthlyAnnualDiscount),
  maxUsers = VALUES(maxUsers),
  maxProjects = VALUES(maxProjects),
  maxStorageGB = VALUES(maxStorageGB),
  features = VALUES(features),
  supportLevel = VALUES(supportLevel),
  isActive = VALUES(isActive),
  displayOrder = VALUES(displayOrder),
  updatedAt = NOW();
