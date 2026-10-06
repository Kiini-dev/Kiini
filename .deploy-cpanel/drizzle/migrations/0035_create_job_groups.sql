-- Create jobGroups table for HR management
CREATE TABLE IF NOT EXISTS jobGroups (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    minimumGrossSalary INT NOT NULL,
    maximumGrossSalary INT NOT NULL,
    description TEXT NULL,
    isActive TINYINT DEFAULT 1 NOT NULL,
    createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX job_group_name_idx (name),
    INDEX is_active_idx (isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default job groups for organizational structure
INSERT INTO jobGroups (id, name, minimumGrossSalary, maximumGrossSalary, description, isActive, createdAt, updatedAt) 
VALUES 
    ('jg-001', 'Junior Staff', 25000, 50000, 'Entry-level position', 1, NOW(), NOW()),
    ('jg-002', 'Senior Staff', 50000, 100000, 'Mid-level position with responsibilities', 1, NOW(), NOW()),
    ('jg-003', 'Supervisor', 100000, 150000, 'Team leadership role', 1, NOW(), NOW()),
    ('jg-004', 'Manager', 150000, 250000, 'Department manager', 1, NOW(), NOW()),
    ('jg-005', 'Executive', 250000, 500000, 'Executive position', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    name=VALUES(name),
    minimumGrossSalary=VALUES(minimumGrossSalary),
    maximumGrossSalary=VALUES(maximumGrossSalary),
    description=VALUES(description),
    updatedAt=NOW();
