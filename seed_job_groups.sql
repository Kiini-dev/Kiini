-- Seed default job groups if they don't exist
INSERT INTO jobGroups (id, name, minimumGrossSalary, maximumGrossSalary, description, isActive, createdAt, updatedAt)
SELECT 'jg-001', 'Junior Staff', 25000, 50000, 'Entry-level position', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM jobGroups WHERE id = 'jg-001')
UNION ALL
SELECT 'jg-002', 'Senior Staff', 50000, 100000, 'Mid-level position with responsibilities', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM jobGroups WHERE id = 'jg-002')
UNION ALL
SELECT 'jg-003', 'Supervisor', 100000, 150000, 'Team leadership role', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM jobGroups WHERE id = 'jg-003')
UNION ALL
SELECT 'jg-004', 'Manager', 150000, 250000, 'Department manager', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM jobGroups WHERE id = 'jg-004')
UNION ALL
SELECT 'jg-005', 'Executive', 250000, 500000, 'Executive position', 1, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM jobGroups WHERE id = 'jg-005');
