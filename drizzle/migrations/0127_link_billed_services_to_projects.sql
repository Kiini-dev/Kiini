ALTER TABLE `invoices`
  ADD COLUMN `projectId` varchar(64) NULL;

ALTER TABLE `estimates`
  ADD COLUMN `projectId` varchar(64) NULL;

ALTER TABLE `serviceInvoiceItems`
  ADD COLUMN `serviceId` varchar(64) NULL;