-- Migration: Add manager roles to users.role enum
-- Adds: sales_manager, procurement_manager, ict_manager
-- This migration aligns the database schema with the application's role definitions

ALTER TABLE `users`
MODIFY COLUMN `role` ENUM(
  'user',
  'admin',
  'staff',
  'accountant',
  'client',
  'super_admin',
  'project_manager',
  'hr',
  'sales_manager',
  'procurement_manager',
  'ict_manager'
) NOT NULL DEFAULT 'user';

-- Verification comment: New manager roles have been added to support:
-- - Sales Manager: Sales pipeline and revenue tracking
-- - Procurement Manager: Purchase orders and supplier management
-- - ICT Manager: System administration and IT operations
