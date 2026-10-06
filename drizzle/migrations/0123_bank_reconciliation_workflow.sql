ALTER TABLE `bankAccounts`
  ADD COLUMN `organizationId` varchar(64) NULL AFTER `id`,
  ADD INDEX `bank_account_org_idx` (`organizationId`, `isActive`);

UPDATE `bankAccounts` ba
JOIN (
  SELECT accountId, MIN(organizationId) AS organizationId
  FROM (
    SELECT accountId, organizationId FROM `payments`
    WHERE accountId IS NOT NULL AND organizationId IS NOT NULL AND organizationId <> ''
    UNION ALL
    SELECT accountId, organizationId FROM `expenses`
    WHERE accountId IS NOT NULL AND organizationId IS NOT NULL AND organizationId <> ''
  ) account_owners
  GROUP BY accountId
  HAVING COUNT(DISTINCT organizationId) = 1
) owners ON owners.accountId = ba.id
SET ba.organizationId = owners.organizationId
WHERE ba.organizationId IS NULL;

ALTER TABLE `reconciliation_sessions`
  ADD COLUMN `openingBalance` bigint NOT NULL DEFAULT 0 AFTER `periodEnd`;