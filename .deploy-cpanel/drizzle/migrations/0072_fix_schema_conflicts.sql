-- Migration: Fix Schema Foreign Key Conflicts
-- Resolves column type mismatches and missing table references

SET FOREIGN_KEY_CHECKS=0;

-- Fix dashboardLayouts - drop foreign keys and modify columns
ALTER TABLE `dashboardLayouts` DROP FOREIGN KEY `dashboardLayouts_ibfk_1`;
ALTER TABLE `dashboardLayouts` DROP FOREIGN KEY `dashboardLayouts_ibfk_2`;
ALTER TABLE `dashboardLayouts`
  MODIFY COLUMN `user_id` varchar(64),
  MODIFY COLUMN `id` varchar(64);

-- Fix dashboardWidgets - drop foreign keys and modify columns
ALTER TABLE `dashboardWidgets` DROP FOREIGN KEY `dashboardWidgets_ibfk_1`;
ALTER TABLE `dashboardWidgets` DROP FOREIGN KEY `dashboardWidgets_ibfk_2`;
ALTER TABLE `dashboardWidgets`
  MODIFY COLUMN `layout_id` varchar(64),
  MODIFY COLUMN `id` varchar(64);

-- Fix payslips - drop foreign key and modify columns
ALTER TABLE `payslips` DROP FOREIGN KEY `fk_payslip_employee`;
ALTER TABLE `payslips`
  MODIFY COLUMN `employeeId` varchar(64);

-- Fix attendance - drop foreign keys and modify columns
ALTER TABLE `attendance` DROP FOREIGN KEY `attendance_ibfk_1`;
ALTER TABLE `attendance` DROP FOREIGN KEY `fk_attendance_employee`;
ALTER TABLE `attendance` DROP FOREIGN KEY `attendance_ibfk_2`;
ALTER TABLE `attendance`
  MODIFY COLUMN `employeeId` varchar(64),
  MODIFY COLUMN `id` varchar(64);

-- Recreate valid foreign keys
ALTER TABLE `dashboardLayouts`
  ADD CONSTRAINT `dashboardLayouts_user_fk`
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `dashboardWidgets`
  ADD CONSTRAINT `dashboardWidgets_layout_fk`
    FOREIGN KEY (`layout_id`) REFERENCES `dashboardLayouts`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `payslips`
  ADD CONSTRAINT `payslips_employee_fk`
    FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_employee_fk`
    FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS=1;
