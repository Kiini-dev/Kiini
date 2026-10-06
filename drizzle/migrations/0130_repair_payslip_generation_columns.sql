SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payslips' AND column_name = 'payrollDetailId') = 0,
  'ALTER TABLE payslips ADD COLUMN payrollDetailId VARCHAR(64) NULL',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payslips' AND column_name = 'payrollDetailId') = 1,
  'ALTER TABLE payslips MODIFY COLUMN payrollDetailId VARCHAR(64) NULL',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payslips' AND column_name = 'payslipNumber') = 0,
  'ALTER TABLE payslips ADD COLUMN payslipNumber VARCHAR(50) NULL',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payslips' AND column_name = 'payMonth') = 0,
  'ALTER TABLE payslips ADD COLUMN payMonth DATETIME NULL',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payslips' AND column_name = 'payDate') = 0,
  'ALTER TABLE payslips ADD COLUMN payDate DATETIME NULL',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payslips' AND column_name = 'bonuses') = 0,
  'ALTER TABLE payslips ADD COLUMN bonuses INT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payslips' AND column_name = 'nssfDeduction') = 0,
  'ALTER TABLE payslips ADD COLUMN nssfDeduction INT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payslips' AND column_name = 'nhifDeduction') = 0,
  'ALTER TABLE payslips ADD COLUMN nhifDeduction INT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payslips' AND column_name = 'payeDeduction') = 0,
  'ALTER TABLE payslips ADD COLUMN payeDeduction INT NULL DEFAULT 0',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payslips' AND column_name = 'bankAccountNumber') = 0,
  'ALTER TABLE payslips ADD COLUMN bankAccountNumber VARCHAR(100) NULL',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;

SET @ddl = IF(
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'payslips' AND column_name = 'bankName') = 0,
  'ALTER TABLE payslips ADD COLUMN bankName VARCHAR(255) NULL',
  'SELECT 1'
);
PREPARE migration_stmt FROM @ddl;
EXECUTE migration_stmt;
DEALLOCATE PREPARE migration_stmt;
