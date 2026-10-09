ALTER TABLE `proposals`
  ADD COLUMN `organizationId` varchar(64) NULL,
  ADD COLUMN `description` longtext NULL,
  ADD COLUMN `deliverables` longtext NULL,
  ADD COLUMN `timeline` text NULL,
  ADD COLUMN `assumptions` text NULL,
  ADD COLUMN `exclusions` text NULL,
  ADD COLUMN `terms` longtext NULL,
  ADD COLUMN `currency` varchar(3) NULL DEFAULT 'KES',
  ADD COLUMN `lineItems` json NULL,
  ADD COLUMN `signingStatus` varchar(32) NOT NULL DEFAULT 'not_sent',
  ADD COLUMN `signingWorkflowId` varchar(64) NULL,
  ADD COLUMN `signedDocumentHtml` longtext NULL,
  ADD COLUMN `signedDocumentHash` varchar(64) NULL,
  ADD COLUMN `signedAt` timestamp NULL;

UPDATE `proposals` p
JOIN `clients` c ON c.`id` = p.`clientId`
SET p.`organizationId` = c.`organizationId`
WHERE p.`organizationId` IS NULL AND c.`organizationId` IS NOT NULL;

ALTER TABLE `contracts`
  ADD COLUMN `counterpartyContactName` varchar(255) NULL,
  ADD COLUMN `counterpartyEmail` varchar(320) NULL,
  ADD COLUMN `counterpartyAddress` text NULL,
  ADD COLUMN `counterpartyRegistrationNumber` varchar(100) NULL,
  ADD COLUMN `governingLaw` varchar(100) NULL DEFAULT 'Kenya',
  ADD COLUMN `currency` varchar(3) NULL DEFAULT 'KES',
  ADD COLUMN `paymentTerms` text NULL,
  ADD COLUMN `terminationTerms` text NULL,
  ADD COLUMN `confidentialityTerms` text NULL,
  ADD COLUMN `disputeResolution` text NULL,
  ADD COLUMN `signingStatus` varchar(32) NOT NULL DEFAULT 'not_sent',
  ADD COLUMN `signingWorkflowId` varchar(64) NULL,
  ADD COLUMN `signedDocumentHtml` longtext NULL,
  ADD COLUMN `signedDocumentHash` varchar(64) NULL,
  ADD COLUMN `signedAt` timestamp NULL;

ALTER TABLE `eSignatureRequests`
  ADD COLUMN `workflowId` varchar(64) NULL,
  ADD COLUMN `documentType` varchar(32) NULL,
  ADD COLUMN `documentId` varchar(64) NULL,
  ADD COLUMN `documentHash` varchar(64) NULL,
  ADD COLUMN `sequence` int NOT NULL DEFAULT 1,
  ADD COLUMN `signerUserId` varchar(64) NULL,
  ADD COLUMN `typedSignature` varchar(255) NULL,
  ADD COLUMN `verificationCodeHash` varchar(64) NULL,
  ADD COLUMN `verificationCodeExpiresAt` timestamp NULL,
  ADD COLUMN `verificationCodeSentAt` timestamp NULL,
  ADD COLUMN `verificationCodeAttempts` int NOT NULL DEFAULT 0,
  ADD COLUMN `emailVerifiedAt` timestamp NULL,
  ADD COLUMN `consentAcceptedAt` timestamp NULL,
  ADD COLUMN `signerIp` varchar(45) NULL,
  ADD COLUMN `signerUserAgent` varchar(512) NULL;

CREATE TABLE IF NOT EXISTS `eSignatureAuditEvents` (
  `id` varchar(64) NOT NULL,
  `requestId` varchar(64) NOT NULL,
  `workflowId` varchar(64) NULL,
  `eventType` varchar(40) NOT NULL,
  `actorName` varchar(255) NULL,
  `actorEmail` varchar(320) NULL,
  `ipAddress` varchar(45) NULL,
  `userAgent` varchar(512) NULL,
  `metadata` json NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `esign_audit_request_idx` (`requestId`, `createdAt`),
  KEY `esign_audit_workflow_idx` (`workflowId`, `createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
