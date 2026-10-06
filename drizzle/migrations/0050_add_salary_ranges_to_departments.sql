-- Add salary range columns to departments table
ALTER TABLE `departments` ADD COLUMN `salaryRangeMin` int NULL AFTER `budget`;
ALTER TABLE `departments` ADD COLUMN `salaryRangeMax` int NULL AFTER `salaryRangeMin`;

-- Add comments for documentation
ALTER TABLE `departments` MODIFY `salaryRangeMin` int NULL COMMENT 'Minimum salary range for the department in Ksh';
ALTER TABLE `departments` MODIFY `salaryRangeMax` int NULL COMMENT 'Maximum salary range for the department in Ksh';
