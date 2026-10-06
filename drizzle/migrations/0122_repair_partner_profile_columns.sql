SET @partner_column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'partner_profiles' AND column_name = 'id');
SET @partner_column_sql = IF(@partner_column_exists = 0, 'ALTER TABLE `partner_profiles` ADD COLUMN `id` varchar(64) NULL', 'SELECT 1');
PREPARE partner_column_stmt FROM @partner_column_sql;
EXECUTE partner_column_stmt;
DEALLOCATE PREPARE partner_column_stmt;

SET @partner_column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'partner_profiles' AND column_name = 'userId');
SET @partner_column_sql = IF(@partner_column_exists = 0, 'ALTER TABLE `partner_profiles` ADD COLUMN `userId` varchar(64) NULL', 'SELECT 1');
PREPARE partner_column_stmt FROM @partner_column_sql;
EXECUTE partner_column_stmt;
DEALLOCATE PREPARE partner_column_stmt;

SET @partner_column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'partner_profiles' AND column_name = 'name');
SET @partner_column_sql = IF(@partner_column_exists = 0, 'ALTER TABLE `partner_profiles` ADD COLUMN `name` varchar(255) NULL', 'SELECT 1');
PREPARE partner_column_stmt FROM @partner_column_sql;
EXECUTE partner_column_stmt;
DEALLOCATE PREPARE partner_column_stmt;

SET @partner_column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'partner_profiles' AND column_name = 'email');
SET @partner_column_sql = IF(@partner_column_exists = 0, 'ALTER TABLE `partner_profiles` ADD COLUMN `email` varchar(320) NULL', 'SELECT 1');
PREPARE partner_column_stmt FROM @partner_column_sql;
EXECUTE partner_column_stmt;
DEALLOCATE PREPARE partner_column_stmt;

SET @partner_column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'partner_profiles' AND column_name = 'company');
SET @partner_column_sql = IF(@partner_column_exists = 0, 'ALTER TABLE `partner_profiles` ADD COLUMN `company` varchar(255) NULL', 'SELECT 1');
PREPARE partner_column_stmt FROM @partner_column_sql;
EXECUTE partner_column_stmt;
DEALLOCATE PREPARE partner_column_stmt;

SET @partner_column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'partner_profiles' AND column_name = 'phone');
SET @partner_column_sql = IF(@partner_column_exists = 0, 'ALTER TABLE `partner_profiles` ADD COLUMN `phone` varchar(50) NULL', 'SELECT 1');
PREPARE partner_column_stmt FROM @partner_column_sql;
EXECUTE partner_column_stmt;
DEALLOCATE PREPARE partner_column_stmt;

SET @partner_column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'partner_profiles' AND column_name = 'website');
SET @partner_column_sql = IF(@partner_column_exists = 0, 'ALTER TABLE `partner_profiles` ADD COLUMN `website` varchar(500) NULL', 'SELECT 1');
PREPARE partner_column_stmt FROM @partner_column_sql;
EXECUTE partner_column_stmt;
DEALLOCATE PREPARE partner_column_stmt;

SET @partner_column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'partner_profiles' AND column_name = 'partnerType');
SET @partner_column_sql = IF(@partner_column_exists = 0, 'ALTER TABLE `partner_profiles` ADD COLUMN `partnerType` varchar(30) NOT NULL DEFAULT ''affiliate''', 'SELECT 1');
PREPARE partner_column_stmt FROM @partner_column_sql;
EXECUTE partner_column_stmt;
DEALLOCATE PREPARE partner_column_stmt;

SET @partner_column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'partner_profiles' AND column_name = 'status');
SET @partner_column_sql = IF(@partner_column_exists = 0, 'ALTER TABLE `partner_profiles` ADD COLUMN `status` varchar(30) NOT NULL DEFAULT ''pending''', 'SELECT 1');
PREPARE partner_column_stmt FROM @partner_column_sql;
EXECUTE partner_column_stmt;
DEALLOCATE PREPARE partner_column_stmt;

SET @partner_column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'partner_profiles' AND column_name = 'referralCode');
SET @partner_column_sql = IF(@partner_column_exists = 0, 'ALTER TABLE `partner_profiles` ADD COLUMN `referralCode` varchar(80) NULL', 'SELECT 1');
PREPARE partner_column_stmt FROM @partner_column_sql;
EXECUTE partner_column_stmt;
DEALLOCATE PREPARE partner_column_stmt;

SET @partner_column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'partner_profiles' AND column_name = 'commissionRate');
SET @partner_column_sql = IF(@partner_column_exists = 0, 'ALTER TABLE `partner_profiles` ADD COLUMN `commissionRate` decimal(5,2) DEFAULT 15', 'SELECT 1');
PREPARE partner_column_stmt FROM @partner_column_sql;
EXECUTE partner_column_stmt;
DEALLOCATE PREPARE partner_column_stmt;

SET @partner_column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'partner_profiles' AND column_name = 'notes');
SET @partner_column_sql = IF(@partner_column_exists = 0, 'ALTER TABLE `partner_profiles` ADD COLUMN `notes` text NULL', 'SELECT 1');
PREPARE partner_column_stmt FROM @partner_column_sql;
EXECUTE partner_column_stmt;
DEALLOCATE PREPARE partner_column_stmt;

SET @partner_column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'partner_profiles' AND column_name = 'createdAt');
SET @partner_column_sql = IF(@partner_column_exists = 0, 'ALTER TABLE `partner_profiles` ADD COLUMN `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP', 'SELECT 1');
PREPARE partner_column_stmt FROM @partner_column_sql;
EXECUTE partner_column_stmt;
DEALLOCATE PREPARE partner_column_stmt;

SET @partner_column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'partner_profiles' AND column_name = 'updatedAt');
SET @partner_column_sql = IF(@partner_column_exists = 0, 'ALTER TABLE `partner_profiles` ADD COLUMN `updatedAt` timestamp NULL', 'SELECT 1');
PREPARE partner_column_stmt FROM @partner_column_sql;
EXECUTE partner_column_stmt;
DEALLOCATE PREPARE partner_column_stmt;

SET @partner_legacy_user_column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'partner_profiles' AND column_name = 'user_id');
SET @partner_backfill_sql = IF(@partner_legacy_user_column_exists > 0, 'UPDATE `partner_profiles` SET `userId` = `user_id` WHERE `userId` IS NULL', 'SELECT 1');
PREPARE partner_backfill_stmt FROM @partner_backfill_sql;
EXECUTE partner_backfill_stmt;
DEALLOCATE PREPARE partner_backfill_stmt;

UPDATE `partner_profiles` SET `id` = UUID() WHERE `id` IS NULL;
