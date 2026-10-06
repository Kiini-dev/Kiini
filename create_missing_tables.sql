-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(64) PRIMARY KEY,
    supplierNumber VARCHAR(50) NOT NULL UNIQUE,
    companyName VARCHAR(255) NOT NULL,
    registrationNumber VARCHAR(100) UNIQUE,
    taxId VARCHAR(100) UNIQUE,
    contactPerson VARCHAR(255),
    contactTitle VARCHAR(100),
    email VARCHAR(320),
    phone VARCHAR(50),
    alternatePhone VARCHAR(50),
    website VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postalCode VARCHAR(20),
    bankName VARCHAR(255),
    bankBranch VARCHAR(255),
    accountNumber VARCHAR(100),
    accountName VARCHAR(255),
    paymentTerms VARCHAR(100),
    paymentMethods VARCHAR(255),
    categories VARCHAR(500),
    qualificationStatus ENUM('pending','pre_qualified','qualified','rejected','inactive') DEFAULT 'pending' NOT NULL,
    qualificationDate DATETIME,
    certifications VARCHAR(500),
    qualityRating INT DEFAULT 0,
    deliveryRating INT DEFAULT 0,
    priceCompetitiveness INT DEFAULT 0,
    averageRating INT DEFAULT 0,
    totalOrders INT DEFAULT 0,
    totalSpent INT DEFAULT 0,
    lastOrderDate DATETIME,
    isActive TINYINT DEFAULT 1 NOT NULL,
    notes TEXT,
    createdBy VARCHAR(64),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX supplier_company_idx (companyName),
    INDEX supplier_status_idx (qualificationStatus),
    INDEX supplier_rating_idx (averageRating),
    INDEX supplier_active_idx (isActive)
);

-- Imprests Table
CREATE TABLE IF NOT EXISTS imprests (
    id VARCHAR(64) PRIMARY KEY,
    imprestNumber VARCHAR(50) NOT NULL,
    userId VARCHAR(64) NOT NULL,
    purpose TEXT,
    amount INT NOT NULL,
    status ENUM('requested','approved','rejected','settled') DEFAULT 'requested' NOT NULL,
    createdBy VARCHAR(64),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX user_idx (userId),
    INDEX status_idx (status)
);

-- Imprest Surrenders Table
CREATE TABLE IF NOT EXISTS imprestSurrenders (
    id VARCHAR(64) PRIMARY KEY,
    imprestId VARCHAR(64) NOT NULL,
    amount INT NOT NULL,
    notes TEXT,
    surrenderedBy VARCHAR(64),
    surrenderedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX imprest_idx (imprestId)
);

-- Insert sample suppliers
INSERT INTO suppliers (id, supplierNumber, companyName, email, phone, city, country, qualificationStatus, isActive, createdAt, updatedAt) VALUES
('sup-001', 'SUP-001', 'Tech Supplies Ltd', 'contact@techsupplies.com', '+254712345678', 'Nairobi', 'Kenya', 'qualified', 1, NOW(), NOW()),
('sup-002', 'SUP-002', 'Office Furniture Co', 'info@officefurn.com', '+254723456789', 'Nairobi', 'Kenya', 'qualified', 1, NOW(), NOW()),
('sup-003', 'SUP-003', 'Stationary Express', 'sales@statexp.com', '+254734567890', 'Mombasa', 'Kenya', 'pre_qualified', 1, NOW(), NOW());
