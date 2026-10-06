ALTER TABLE payments ADD COLUMN accountId VARCHAR(64) AFTER clientId;
ALTER TABLE payments ADD COLUMN chartOfAccountType ENUM('debit','credit') DEFAULT 'debit';
ALTER TABLE payments ADD INDEX account_idx(accountId);

CREATE TABLE IF NOT EXISTS budgetItems (
    id VARCHAR(64) PRIMARY KEY,
    budgetId VARCHAR(64) NOT NULL,
    accountId VARCHAR(64) NOT NULL,
    accountCode VARCHAR(50) NOT NULL,
    accountName VARCHAR(255) NOT NULL,
    budgetAmount INT NOT NULL DEFAULT 0,
    actualAmount INT NOT NULL DEFAULT 0,
    variance INT NOT NULL DEFAULT 0,
    variancePercent DECIMAL(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (budgetId) REFERENCES budgets(id) ON DELETE CASCADE,
    FOREIGN KEY (accountId) REFERENCES accounts(id),
    INDEX budget_idx(budgetId),
    INDEX account_idx(accountId)
);

ALTER TABLE budgets ADD COLUMN budgetName VARCHAR(255) AFTER fiscalYear;
ALTER TABLE budgets ADD COLUMN budgetDescription TEXT;
ALTER TABLE budgets ADD COLUMN budgetStatus ENUM('draft','active','inactive','closed') DEFAULT 'draft';
ALTER TABLE budgets ADD COLUMN startDate DATETIME;
ALTER TABLE budgets ADD COLUMN endDate DATETIME;
ALTER TABLE budgets ADD COLUMN approvedBy VARCHAR(64);
ALTER TABLE budgets ADD COLUMN approvedAt DATETIME;
ALTER TABLE budgets ADD COLUMN totalBudgeted INT DEFAULT 0;
ALTER TABLE budgets ADD COLUMN totalActual INT DEFAULT 0;
ALTER TABLE budgets ADD COLUMN variance INT DEFAULT 0;
ALTER TABLE budgets ADD COLUMN variancePercent DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE budgets ADD COLUMN createdBy VARCHAR(64);
ALTER TABLE budgets MODIFY updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
