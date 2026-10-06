-- Add ict_manager, procurement_manager, sales_manager to users.role enum
ALTER TABLE `users` MODIFY COLUMN `role` ENUM(
  'user','admin','staff','accountant','client','super_admin',
  'project_manager','hr','ict_manager','procurement_manager','sales_manager'
) NOT NULL DEFAULT 'user';
