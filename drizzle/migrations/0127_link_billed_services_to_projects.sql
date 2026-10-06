ALTER TABLE `invoices`
  ADD COLUMN IF NOT EXISTS `projectId` varchar(64) NULL;

ALTER TABLE `estimates`
  ADD COLUMN IF NOT EXISTS `projectId` varchar(64) NULL;

ALTER TABLE `serviceInvoiceItems`
  ADD COLUMN IF NOT EXISTS `serviceId` varchar(64) NULL;