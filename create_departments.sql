CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    headId VARCHAR(64) NULL,
    budget INT NULL,
    status ENUM('active','inactive') DEFAULT 'active',
    createdBy VARCHAR(64) NULL,
    createdAt TIMESTAMP NULL,
    updatedAt TIMESTAMP NULL
);

INSERT INTO departments (id, name, description, status, createdAt, updatedAt) VALUES
('dept-001', 'Human Resources', 'Human Resources Department', 'active', NOW(), NOW()),
('dept-002', 'Finance', 'Finance and Accounting Department', 'active', NOW(), NOW()),
('dept-003', 'Information Technology', 'IT and Systems Department', 'active', NOW(), NOW()),
('dept-004', 'Operations', 'Operations and Logistics Department', 'active', NOW(), NOW()),
('dept-005', 'Sales and Marketing', 'Sales and Marketing Department', 'active', NOW(), NOW()),
('dept-006', 'Procurement', 'Procurement and Supply Chain', 'active', NOW(), NOW());
