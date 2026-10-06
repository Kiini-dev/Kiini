CREATE TABLE IF NOT EXISTS `paymentPlanInstallments` (
    `id` varchar(64) NOT NULL,
    `paymentPlanId` varchar(64) NOT NULL,
    `installmentNumber` int NOT NULL,
    `dueDate` datetime NOT NULL,
    `amount` int NOT NULL,
    `status` enum('pending','paid','overdue','skipped') NOT NULL DEFAULT 'pending',
    `paidDate` datetime DEFAULT NULL,
    `paidAmount` int DEFAULT NULL,
    `paymentId` varchar(64) DEFAULT NULL,
    `notes` text DEFAULT NULL,
    `createdAt` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `payment_plan_idx` (`paymentPlanId`),
    KEY `due_date_idx` (`dueDate`),
    KEY `status_idx` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
