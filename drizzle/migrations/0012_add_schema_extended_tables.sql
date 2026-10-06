-- Migration: Add schema-extended tables for advanced features
-- Date: 2026-03-02
-- Description: Create all missing tables from schema-extended.ts

-- Create invoicePayments table for tracking invoice payment records
CREATE TABLE IF NOT EXISTS `invoicePayments` (
  `id` varchar(64) NOT NULL PRIMARY KEY,
  `invoiceId` varchar(64) NOT NULL,
  `paymentAmount` int NOT NULL COMMENT 'in cents',
  `paymentDate` datetime NOT NULL,
  `paymentMethod` enum('cash','bank_transfer','check','mobile_money','credit_card','other') NOT NULL,
  `reference` varchar(255),
  `notes` text,
  `receiptId` varchar(64),
  `recordedBy` varchar(64),
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `invoice_idx` (`invoiceId`),
  KEY `payment_date_idx` (`paymentDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create documentNumberFormats table for tracking document numbering formats
CREATE TABLE IF NOT EXISTS `documentNumberFormats` (
  `id` varchar(64) NOT NULL PRIMARY KEY,
  `documentType` enum('invoice','estimate','expense','receipt','proposal','payment') NOT NULL UNIQUE,
  `prefix` varchar(10) NOT NULL,
  `padding` int NOT NULL DEFAULT 6,
  `separator` varchar(5) NOT NULL DEFAULT '-',
  `currentNumber` int NOT NULL DEFAULT 1,
  `formatExample` varchar(50),
  `isActive` tinyint DEFAULT 1,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `document_type_idx` (`documentType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create receiptItems table for receipt line items
CREATE TABLE IF NOT EXISTS `receiptItems` (
  `id` varchar(64) NOT NULL PRIMARY KEY,
  `receiptId` varchar(64) NOT NULL,
  `itemType` enum('product','service','custom') NOT NULL,
  `itemId` varchar(64),
  `description` text NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unitPrice` decimal(15,2) NOT NULL,
  `taxRate` decimal(5,2) NOT NULL DEFAULT 0,
  `discountPercent` decimal(5,2) NOT NULL DEFAULT 0,
  `total` decimal(15,2) NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `receipt_idx` (`receiptId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create expenseItems table for expense line items
CREATE TABLE IF NOT EXISTS `expenseItems` (
  `id` varchar(64) NOT NULL PRIMARY KEY,
  `expenseId` varchar(64) NOT NULL,
  `itemType` enum('product','service','custom') NOT NULL,
  `itemId` varchar(64),
  `description` text NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unitPrice` decimal(15,2) NOT NULL,
  `taxRate` decimal(5,2) NOT NULL DEFAULT 0,
  `discountPercent` decimal(5,2) NOT NULL DEFAULT 0,
  `total` decimal(15,2) NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `expense_idx` (`expenseId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create estimateItems table for estimate line items
CREATE TABLE IF NOT EXISTS `estimateItems` (
  `id` varchar(64) NOT NULL PRIMARY KEY,
  `estimateId` varchar(64) NOT NULL,
  `itemType` enum('product','service','custom') NOT NULL,
  `itemId` varchar(64),
  `description` text NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unitPrice` decimal(15,2) NOT NULL,
  `taxRate` decimal(5,2) NOT NULL DEFAULT 0,
  `discountPercent` decimal(5,2) NOT NULL DEFAULT 0,
  `total` decimal(15,2) NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `estimate_idx` (`estimateId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
