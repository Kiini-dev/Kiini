-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100),
    category VARCHAR(100),
    unitPrice INT NOT NULL,
    costPrice INT,
    stockQuantity INT DEFAULT 0,
    minStockLevel INT DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'pcs',
    taxRate INT DEFAULT 0,
    isActive TINYINT DEFAULT 1 NOT NULL,
    imageUrl VARCHAR(500),
    createdBy VARCHAR(64),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    reorderPoint INT DEFAULT 10,
    maxStockLevel INT,
    location VARCHAR(255),
    supplier VARCHAR(255),
    INDEX sku_idx (sku),
    INDEX category_idx (category)
);

-- Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
    id VARCHAR(64) PRIMARY KEY,
    departmentId VARCHAR(64) NOT NULL,
    amount INT NOT NULL,
    remaining INT NOT NULL,
    fiscalYear INT NOT NULL,
    budgetName VARCHAR(255),
    budgetDescription TEXT,
    budgetStatus ENUM('draft','active','inactive','closed') DEFAULT 'draft',
    startDate DATETIME,
    endDate DATETIME,
    approvedBy VARCHAR(64),
    approvedAt DATETIME,
    createdBy VARCHAR(64),
    totalBudgeted INT DEFAULT 0,
    totalActual INT DEFAULT 0,
    variance INT DEFAULT 0,
    variancePercent INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample products
INSERT INTO products (id, name, description, sku, category, unitPrice, costPrice, stockQuantity, minStockLevel, unit, isActive, createdAt, updatedAt) VALUES
('prod-001', 'Computer Monitor 27"', 'LED Display Monitor 1920x1200', 'SKU-MON-27', 'Electronics', 25000, 15000, 45, 5, 'pcs', 1, NOW(), NOW()),
('prod-002', 'USB-C Keyboard', 'Mechanical Keyboard with USB-C', 'SKU-KEY-USB', 'Peripherals', 5000, 2500, 120, 10, 'pcs', 1, NOW(), NOW()),
('prod-003', 'Wireless Mouse', 'Ergonomic Wireless Mouse', 'SKU-MOU-WRL', 'Peripherals', 3000, 1200, 200, 20, 'pcs', 1, NOW(), NOW()),
('prod-004', 'Office Chair - Executive', 'Ergonomic Executive Chair', 'SKU-CHR-EXE', 'Furniture', 45000, 25000, 15, 2, 'pcs', 1, NOW(), NOW()),
('prod-005', 'Desk Lamp LED', 'Adjustable LED Desk Lamp', 'SKU-LAMP-LED', 'Office Supplies', 2500, 1000, 85, 10, 'pcs', 1, NOW(), NOW());

-- Insert sample budgets
INSERT INTO budgets (id, departmentId, amount, remaining, fiscalYear, budgetName, budgetDescription, budgetStatus, startDate, endDate, createdAt, updatedAt) VALUES
('bud-001', 'dept-001', 500000, 450000, 2026, 'HR Operations Budget 2026', 'Budget for HR department operations', 'active', '2026-01-01', '2026-12-31', NOW(), NOW()),
('bud-002', 'dept-002', 1000000, 800000, 2026, 'Finance Operations Budget 2026', 'Budget for Finance department', 'active', '2026-01-01', '2026-12-31', NOW(), NOW()),
('bud-003', 'dept-003', 750000, 700000, 2026, 'IT Equipment Budget 2026', 'Budget for IT infrastructure and equipment', 'active', '2026-01-01', '2026-12-31', NOW(), NOW()),
('bud-004', 'dept-004', 600000, 550000, 2026, 'Operations Budget 2026', 'Budget for Operations department', 'active', '2026-01-01', '2026-12-31', NOW(), NOW()),
('bud-005', 'dept-005', 800000, 700000, 2026, 'Sales & Marketing Budget 2026', 'Budget for Sales and Marketing campaigns', 'active', '2026-01-01', '2026-12-31', NOW(), NOW());
