CREATE TABLE IF NOT EXISTS `eSignatureSignedDocuments` (
  `id` varchar(64) NOT NULL,
  `organizationId` varchar(64) NULL,
  `workflowId` varchar(64) NOT NULL,
  `documentType` varchar(32) NOT NULL,
  `documentId` varchar(64) NOT NULL,
  `documentHash` varchar(64) NOT NULL,
  `pdf` longblob NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `esign_signed_document_unique_idx` (`documentType`, `documentId`, `workflowId`),
  KEY `esign_signed_document_org_idx` (`organizationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
