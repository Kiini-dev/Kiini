ALTER TABLE `expenses`
  MODIFY COLUMN `paymentMethod` ENUM('cash','bank_transfer','cheque','card','mpesa','other') NULL DEFAULT NULL;

ALTER TABLE `recurringExpenses`
  MODIFY COLUMN `paymentMethod` ENUM('cash','bank_transfer','cheque','card','mpesa','other') NULL DEFAULT NULL;

ALTER TABLE `invoicePayments`
  MODIFY COLUMN `paymentMethod` ENUM('cash','bank_transfer','check','mobile_money','credit_card','cheque','mpesa','card','other') NOT NULL;

UPDATE `invoicePayments` SET `paymentMethod` = 'cheque' WHERE `paymentMethod` = 'check';
UPDATE `invoicePayments` SET `paymentMethod` = 'mpesa' WHERE `paymentMethod` = 'mobile_money';
UPDATE `invoicePayments` SET `paymentMethod` = 'card' WHERE `paymentMethod` = 'credit_card';

ALTER TABLE `invoicePayments`
  MODIFY COLUMN `paymentMethod` ENUM('cash','bank_transfer','cheque','mpesa','card','other') NOT NULL;