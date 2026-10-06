SET @department_default_role_count := (
	SELECT COUNT(*)
	FROM information_schema.columns
	WHERE table_schema = DATABASE()
		AND table_name = 'departments'
		AND column_name = 'defaultRole'
);
SET @department_default_role_sql := IF(
	@department_default_role_count = 0,
	'ALTER TABLE `departments` ADD COLUMN `defaultRole` varchar(100) NULL AFTER `status`',
	'SELECT 1'
);
PREPARE department_default_role_stmt FROM @department_default_role_sql;
EXECUTE department_default_role_stmt;
DEALLOCATE PREPARE department_default_role_stmt;

INSERT IGNORE INTO `departments` (`id`, `organizationId`, `name`, `description`, `status`, `defaultRole`, `createdBy`, `createdAt`, `updatedAt`) VALUES
('system-dept-engineering', NULL, 'Engineering', 'Software development, architecture, and technical delivery', 'active', 'staff', 'system', NOW(), NOW()),
('system-dept-sales', NULL, 'Sales', 'Sales, business development, and customer relationships', 'active', 'sales_manager', 'system', NOW(), NOW()),
('system-dept-finance', NULL, 'Finance', 'Accounting, financial control, and reporting', 'active', 'accountant', 'system', NOW(), NOW()),
('system-dept-human-resources', NULL, 'Human Resources', 'People operations, employee relations, and compliance', 'active', 'hr', 'system', NOW(), NOW()),
('system-dept-operations', NULL, 'Operations', 'Operations, service delivery, and internal support', 'active', 'staff', 'system', NOW(), NOW()),
('system-dept-procurement', NULL, 'Procurement', 'Sourcing, purchasing, and supplier management', 'active', 'procurement_manager', 'system', NOW(), NOW()),
('system-dept-information-technology', NULL, 'Information Technology', 'Infrastructure, systems, security, and technology support', 'active', 'ict_manager', 'system', NOW(), NOW()),
('system-dept-projects', NULL, 'Projects', 'Project delivery, planning, and coordination', 'active', 'project_manager', 'system', NOW(), NOW()),
('system-dept-administration', NULL, 'Administration', 'Office administration and organizational services', 'active', 'admin', 'system', NOW(), NOW());