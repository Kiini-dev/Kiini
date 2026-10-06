CREATE TABLE IF NOT EXISTS jobGroups (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    minimumGrossSalary INT NOT NULL,
    maximumGrossSalary INT NOT NULL,
    description TEXT NULL,
    isActive TINYINT DEFAULT 1 NOT NULL,
    createdAt TIMESTAMP NULL,
    updatedAt TIMESTAMP NULL,
    INDEX job_group_name_idx (name),
    INDEX is_active_idx (isActive)
);

INSERT INTO jobGroups (id, name, minimumGrossSalary, maximumGrossSalary, description, isActive, createdAt, updatedAt) VALUES
('jg-001', 'Junior Staff', 25000, 50000, 'Entry-level position', 1, NOW(), NOW()),
('jg-002', 'Senior Staff', 50000, 100000, 'Mid-level position with responsibilities', 1, NOW(), NOW()),
('jg-003', 'Supervisor', 100000, 150000, 'Team leadership role', 1, NOW(), NOW()),
('jg-004', 'Manager', 150000, 250000, 'Department manager', 1, NOW(), NOW()),
('jg-005', 'Executive', 250000, 500000, 'Executive position', 1, NOW(), NOW());
