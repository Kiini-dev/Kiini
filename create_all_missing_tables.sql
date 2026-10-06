-- ===== COMMUNICATION & NOTIFICATIONS =====

-- Communication Logs
CREATE TABLE IF NOT EXISTS communicationLogs (
    id VARCHAR(64) PRIMARY KEY,
    type ENUM('email','sms','push','in_app') DEFAULT 'email' NOT NULL,
    recipient VARCHAR(320) NOT NULL,
    subject VARCHAR(500),
    body TEXT,
    status ENUM('pending','sent','failed','scheduled') DEFAULT 'pending' NOT NULL,
    error TEXT,
    referenceType VARCHAR(50),
    referenceId VARCHAR(64),
    sentAt DATETIME,
    createdBy VARCHAR(64),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX type_status_idx (type, status),
    INDEX reference_idx (referenceType, referenceId)
);

-- Notifications (User-specific)
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    userId VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info','success','warning','error','reminder') DEFAULT 'info' NOT NULL,
    category VARCHAR(100),
    entityType VARCHAR(100),
    entityId VARCHAR(64),
    actionUrl VARCHAR(500),
    isRead TINYINT DEFAULT 0 NOT NULL,
    readAt DATETIME,
    priority ENUM('low','normal','high') DEFAULT 'normal' NOT NULL,
    expiresAt DATETIME,
    metadata TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX user_read_idx (userId, isRead),
    INDEX created_idx (createdAt),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- ===== TICKETS & SUPPORT =====

-- Tickets/Support Tickets
CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(64) PRIMARY KEY,
    clientId VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    priority ENUM('low','medium','high') DEFAULT 'medium' NOT NULL,
    status ENUM('new','open','in_progress','awaiting_client','completed','closed') DEFAULT 'new' NOT NULL,
    requestedDueDate DATETIME,
    assignedTo VARCHAR(64),
    createdBy VARCHAR(64) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX ticket_client_idx (clientId),
    INDEX ticket_status_idx (status),
    INDEX ticket_priority_idx (priority),
    FOREIGN KEY (clientId) REFERENCES clients(id) ON DELETE CASCADE
);

-- Ticket Comments
CREATE TABLE IF NOT EXISTS ticket_comments (
    id VARCHAR(64) PRIMARY KEY,
    ticketId VARCHAR(64) NOT NULL,
    authorId VARCHAR(64) NOT NULL,
    body TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX ticket_comment_idx (ticketId),
    FOREIGN KEY (ticketId) REFERENCES tickets(id) ON DELETE CASCADE
);

-- ===== INVENTORY MANAGEMENT =====

-- Inventory Transactions
CREATE TABLE IF NOT EXISTS inventoryTransactions (
    id VARCHAR(64) PRIMARY KEY,
    productId VARCHAR(64) NOT NULL,
    type ENUM('purchase','sale','adjust','return','damage') NOT NULL,
    quantity INT NOT NULL,
    referenceId VARCHAR(64),
    notes TEXT,
    createdBy VARCHAR(64),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX product_type_idx (productId, type),
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- Stock Alerts
CREATE TABLE IF NOT EXISTS stockAlerts (
    id VARCHAR(64) PRIMARY KEY,
    productId VARCHAR(64) NOT NULL,
    alertType ENUM('low_stock','out_of_stock','overstock') NOT NULL,
    alertLevel INT,
    isResolved TINYINT DEFAULT 0,
    resolvedAt DATETIME,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX product_alert_idx (productId),
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- ===== GUEST CLIENTS =====

-- Guest Clients
CREATE TABLE IF NOT EXISTS guestClients (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(320),
    phone VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ===== REMINDERS =====

-- Reminders
CREATE TABLE IF NOT EXISTS reminders (
    id VARCHAR(64) PRIMARY KEY,
    userId VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reminderDate DATETIME NOT NULL,
    status ENUM('active','completed','cancelled') DEFAULT 'active' NOT NULL,
    priority ENUM('low','medium','high') DEFAULT 'medium' NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX user_status_idx (userId, status),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Scheduled Reminders
CREATE TABLE IF NOT EXISTS scheduledReminders (
    id VARCHAR(64) PRIMARY KEY,
    reminderId VARCHAR(64) NOT NULL,
    scheduledTime DATETIME NOT NULL,
    sentAt DATETIME,
    status ENUM('pending','sent','failed') DEFAULT 'pending' NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX scheduled_status_idx (status, scheduledTime),
    FOREIGN KEY (reminderId) REFERENCES reminders(id) ON DELETE CASCADE
);

-- ===== SYSTEM & SETTINGS =====

-- System Settings
CREATE TABLE IF NOT EXISTS systemSettings (
    id VARCHAR(64) PRIMARY KEY,
    `key` VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    isPublic TINYINT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Permissions
CREATE TABLE IF NOT EXISTS userPermissions (
    id VARCHAR(64) PRIMARY KEY,
    userId VARCHAR(64) NOT NULL,
    permission VARCHAR(255) NOT NULL,
    grantedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    grantedBy VARCHAR(64),
    INDEX user_perm_idx (userId, permission),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- ===== PAYROLL & HR =====

-- Salary Structures
CREATE TABLE IF NOT EXISTS salaryStructures (
    id VARCHAR(64) PRIMARY KEY,
    jobGroupId VARCHAR(64) NOT NULL,
    basicSalary INT NOT NULL,
    description TEXT,
    isActive TINYINT DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (jobGroupId) REFERENCES jobGroups(id) ON DELETE CASCADE
);

-- Salary Allowances
CREATE TABLE IF NOT EXISTS salaryAllowances (
    id VARCHAR(64) PRIMARY KEY,
    salaryStructureId VARCHAR(64) NOT NULL,
    allowanceName VARCHAR(100) NOT NULL,
    allowanceType ENUM('fixed','percentage') DEFAULT 'fixed',
    amount INT NOT NULL,
    isActive TINYINT DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (salaryStructureId) REFERENCES salaryStructures(id) ON DELETE CASCADE
);

-- Salary Deductions
CREATE TABLE IF NOT EXISTS salaryDeductions (
    id VARCHAR(64) PRIMARY KEY,
    salaryStructureId VARCHAR(64) NOT NULL,
    deductionName VARCHAR(100) NOT NULL,
    deductionType ENUM('fixed','percentage') DEFAULT 'fixed',
    amount INT NOT NULL,
    isActive TINYINT DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (salaryStructureId) REFERENCES salaryStructures(id) ON DELETE CASCADE
);

-- Employee Benefits
CREATE TABLE IF NOT EXISTS employeeBenefits (
    id VARCHAR(64) PRIMARY KEY,
    employeeId VARCHAR(64) NOT NULL,
    benefitName VARCHAR(100) NOT NULL,
    benefitType ENUM('health','life_insurance','pension','other') DEFAULT 'other',
    status ENUM('active','inactive','pending') DEFAULT 'active',
    startDate DATETIME,
    endDate DATETIME,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- Payroll Details
CREATE TABLE IF NOT EXISTS payrollDetails (
    id VARCHAR(64) PRIMARY KEY,
    employeeId VARCHAR(64) NOT NULL,
    payrollMonth INT NOT NULL,
    payrollYear INT NOT NULL,
    basicSalary INT,
    totalAllowances INT,
    totalDeductions INT,
    netSalary INT,
    status ENUM('draft','approved','paid','pending') DEFAULT 'draft',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX payroll_emp_idx (employeeId, payrollYear, payrollMonth),
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- Payroll Approvals
CREATE TABLE IF NOT EXISTS payrollApprovals (
    id VARCHAR(64) PRIMARY KEY,
    payrollDetailId VARCHAR(64) NOT NULL,
    approvedBy VARCHAR(64) NOT NULL,
    approvalStatus ENUM('pending','approved','rejected') DEFAULT 'pending',
    approvalDate DATETIME,
    remarks TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payrollDetailId) REFERENCES payrollDetails(id) ON DELETE CASCADE
);

-- Employee Tax Info
CREATE TABLE IF NOT EXISTS employeeTaxInfo (
    id VARCHAR(64) PRIMARY KEY,
    employeeId VARCHAR(64) NOT NULL,
    taxYear INT NOT NULL,
    taxableIncome INT,
    taxPaid INT,
    taxFilingStatus ENUM('filed','pending','under_review') DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_emp_year (employeeId, taxYear),
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- Salary Increments
CREATE TABLE IF NOT EXISTS salaryIncrements (
    id VARCHAR(64) PRIMARY KEY,
    employeeId VARCHAR(64) NOT NULL,
    currentSalary INT NOT NULL,
    newSalary INT NOT NULL,
    incrementPercentage DECIMAL(5,2),
    effectiveDate DATETIME NOT NULL,
    approvalStatus ENUM('pending','approved','rejected') DEFAULT 'pending',
    approvedBy VARCHAR(64),
    approvalDate DATETIME,
    reason TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);

-- ===== PROCUREMENT =====

-- Local Purchase Orders (LPOs)
CREATE TABLE IF NOT EXISTS lpos (
    id VARCHAR(64) PRIMARY KEY,
    lpoNumber VARCHAR(50) UNIQUE NOT NULL,
    supplierId VARCHAR(64) NOT NULL,
    lpoDate DATETIME NOT NULL,
    deliveryDate DATETIME,
    totalAmount INT NOT NULL,
    status ENUM('draft','issued','confirmed','delivered','cancelled') DEFAULT 'draft',
    paymentStatus ENUM('unpaid','partial','paid') DEFAULT 'unpaid',
    createdBy VARCHAR(64),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX lpo_supplier_idx (supplierId),
    INDEX lpo_status_idx (status),
    FOREIGN KEY (supplierId) REFERENCES suppliers(id) ON DELETE RESTRICT
);

-- Supplier Ratings
CREATE TABLE IF NOT EXISTS supplierRatings (
    id VARCHAR(64) PRIMARY KEY,
    supplierId VARCHAR(64) NOT NULL,
    orderId VARCHAR(64),
    qualityScore INT NOT NULL,
    deliveryScore INT NOT NULL,
    priceScore INT NOT NULL,
    serviceScore INT NOT NULL,
    comments TEXT,
    ratedBy VARCHAR(64) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX supplier_rating_idx (supplierId),
    FOREIGN KEY (supplierId) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- ===== PROJECT MANAGEMENT =====

-- Project Team Members
CREATE TABLE IF NOT EXISTS projectTeamMembers (
    id VARCHAR(64) PRIMARY KEY,
    projectId VARCHAR(64) NOT NULL,
    employeeId VARCHAR(64) NOT NULL,
    role VARCHAR(100),
    hoursAllocated INT,
    startDate DATETIME,
    endDate DATETIME,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX project_team_idx (projectId),
    FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (employeeId) REFERENCES employees(id) ON DELETE CASCADE
);
