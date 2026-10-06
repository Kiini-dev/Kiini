SET @payslip_pay_month_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'payslips'
    AND COLUMN_NAME = 'payMonth'
);
SET @payslip_pay_month_sql := IF(
  @payslip_pay_month_exists = 0,
  'ALTER TABLE payslips ADD COLUMN payMonth DATETIME NULL',
  'SELECT 1'
);
PREPARE payslip_pay_month_stmt FROM @payslip_pay_month_sql;
EXECUTE payslip_pay_month_stmt;
DEALLOCATE PREPARE payslip_pay_month_stmt;