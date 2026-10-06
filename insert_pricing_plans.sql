-- Migration: Insert Pricing Plans based on Multitenancy Tiers
-- Creates pricing plans that correspond to the existing pricing tier features

INSERT IGNORE INTO pricingPlans
  (id, planName, planSlug, description, tier, monthlyPrice, annualPrice, monthlyAnnualDiscount,
   maxUsers, maxProjects, maxStorageGB, features, supportLevel, isActive, displayOrder, createdAt, updatedAt)
VALUES
  ('plan_trial', 'Trial Plan', 'trial', 'Free trial with basic CRM and project management features',
   'free', '0.00', '0.00', '0.00', 5, 3, 1,
   '["crm", "projects", "communications", "tickets"]', 'email', 1, 1, NOW(), NOW()),

  ('plan_starter', 'Starter Plan', 'starter', 'Perfect for small businesses starting their digital transformation',
   'starter', '2500.00', '25000.00', '16.67', 10, 10, 5,
   '["crm", "projects", "communications", "tickets", "hr", "leave", "invoicing", "payments", "expenses", "reports"]',
   'email', 1, 2, NOW(), NOW()),

  ('plan_gold', 'Gold Plan', 'gold', 'Enhanced features for mid-sized businesses',
   'gold', '5000.00', '50000.00', '16.67', 25, 25, 10,
   '["crm", "projects", "communications", "tickets", "hr", "payroll", "leave", "attendance", "invoicing", "payments", "expenses", "procurement", "accounting", "budgets", "reports"]',
   'priority', 1, 3, NOW(), NOW()),

  ('plan_professional', 'Professional Plan', 'professional', 'Comprehensive business management solution for growing companies',
   'professional', '7500.00', '75000.00', '16.67', 50, 50, 25,
   '["crm", "projects", "communications", "tickets", "hr", "payroll", "leave", "attendance", "invoicing", "payments", "expenses", "procurement", "accounting", "budgets", "reports", "contracts", "work_orders"]',
   'priority', 1, 4, NOW(), NOW()),

  ('plan_enterprise', 'Enterprise Plan', 'enterprise', 'Full-featured enterprise solution with advanced analytics and AI',
   'enterprise', '15000.00', '150000.00', '16.67', -1, -1, -1,
   '["crm", "projects", "communications", "tickets", "hr", "payroll", "leave", "attendance", "invoicing", "payments", "expenses", "procurement", "accounting", "budgets", "reports", "ai_hub", "contracts", "work_orders"]',
   '24/7_phone', 1, 5, NOW(), NOW());