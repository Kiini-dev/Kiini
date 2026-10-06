ALTER TABLE accounts ADD COLUMN organizationId varchar(64) AFTER id;
ALTER TABLE accounts ADD INDEX account_org_idx (organizationId);
