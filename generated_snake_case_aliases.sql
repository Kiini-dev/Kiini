-- Permanent SQL patch for generated snake_case aliases
-- Use explicit types for generated columns to match MySQL 8.4 syntax.
-- Apply this patch once after verifying the DB schema is based on createdAt/userId columns.

ALTER TABLE `_archived_customFields` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx__archived_customFields_created_at` ON `_archived_customFields` (`created_at`);

ALTER TABLE `_archived_pricingTierDescriptions` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx__archived_pricingTierDescriptions_created_at` ON `_archived_pricingTierDescriptions` (`created_at`);

ALTER TABLE `accounts` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_accounts_created_at` ON `accounts` (`created_at`);

ALTER TABLE `activityLog` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_activityLog_created_at` ON `activityLog` (`created_at`);

ALTER TABLE `activityLog` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_activityLog_user_id` ON `activityLog` (`user_id`);

ALTER TABLE `aiChatMessages` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_aiChatMessages_created_at` ON `aiChatMessages` (`created_at`);

ALTER TABLE `aiChatMessages` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_aiChatMessages_user_id` ON `aiChatMessages` (`user_id`);

ALTER TABLE `aiChatSessions` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_aiChatSessions_created_at` ON `aiChatSessions` (`created_at`);

ALTER TABLE `aiChatSessions` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_aiChatSessions_user_id` ON `aiChatSessions` (`user_id`);

ALTER TABLE `aiDocuments` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_aiDocuments_created_at` ON `aiDocuments` (`created_at`);

ALTER TABLE `aiDocuments` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_aiDocuments_user_id` ON `aiDocuments` (`user_id`);

ALTER TABLE `apiKeys` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_apiKeys_created_at` ON `apiKeys` (`created_at`);

ALTER TABLE `apiKeys` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_apiKeys_user_id` ON `apiKeys` (`user_id`);

ALTER TABLE `attendance` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_attendance_created_at` ON `attendance` (`created_at`);

ALTER TABLE `auditLogs` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_auditLogs_created_at` ON `auditLogs` (`created_at`);

ALTER TABLE `auditLogs` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_auditLogs_user_id` ON `auditLogs` (`user_id`);

ALTER TABLE `automatedReceipts` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_automatedReceipts_created_at` ON `automatedReceipts` (`created_at`);

ALTER TABLE `bankAccounts` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_bankAccounts_created_at` ON `bankAccounts` (`created_at`);

ALTER TABLE `bankTransactions` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_bankTransactions_created_at` ON `bankTransactions` (`created_at`);

ALTER TABLE `billingInvoices` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_billingInvoices_created_at` ON `billingInvoices` (`created_at`);

ALTER TABLE `billingNotifications` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_billingNotifications_created_at` ON `billingNotifications` (`created_at`);

ALTER TABLE `budgetAllocations` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_budgetAllocations_created_at` ON `budgetAllocations` (`created_at`);

ALTER TABLE `budgets` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_budgets_created_at` ON `budgets` (`created_at`);

ALTER TABLE `canned_responses` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_canned_responses_created_at` ON `canned_responses` (`created_at`);

ALTER TABLE `clientSubscriptions` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_clientSubscriptions_created_at` ON `clientSubscriptions` (`created_at`);

ALTER TABLE `clients` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_clients_created_at` ON `clients` (`created_at`);

ALTER TABLE `communicationLogs` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_communicationLogs_created_at` ON `communicationLogs` (`created_at`);

ALTER TABLE `conversationMembers` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_conversationMembers_user_id` ON `conversationMembers` (`user_id`);

ALTER TABLE `conversations` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_conversations_created_at` ON `conversations` (`created_at`);

ALTER TABLE `currencies` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_currencies_created_at` ON `currencies` (`created_at`);

ALTER TABLE `defaultSettings` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_defaultSettings_created_at` ON `defaultSettings` (`created_at`);

ALTER TABLE `departments` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_departments_created_at` ON `departments` (`created_at`);

ALTER TABLE `documentAccess` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_documentAccess_user_id` ON `documentAccess` (`user_id`);

ALTER TABLE `documentNumberFormats` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_documentNumberFormats_created_at` ON `documentNumberFormats` (`created_at`);

ALTER TABLE `documentTemplates` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_documentTemplates_created_at` ON `documentTemplates` (`created_at`);

ALTER TABLE `documentVersions` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_documentVersions_created_at` ON `documentVersions` (`created_at`);

ALTER TABLE `emailCampaigns` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_emailCampaigns_created_at` ON `emailCampaigns` (`created_at`);

ALTER TABLE `emailGenerationHistory` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_emailGenerationHistory_created_at` ON `emailGenerationHistory` (`created_at`);

ALTER TABLE `emailGenerationHistory` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_emailGenerationHistory_user_id` ON `emailGenerationHistory` (`user_id`);

ALTER TABLE `emailLogs` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_emailLogs_created_at` ON `emailLogs` (`created_at`);

ALTER TABLE `emailLogs` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_emailLogs_user_id` ON `emailLogs` (`user_id`);

ALTER TABLE `emailQueue` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_emailQueue_created_at` ON `emailQueue` (`created_at`);

ALTER TABLE `emailQueue` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_emailQueue_user_id` ON `emailQueue` (`user_id`);

ALTER TABLE `employeeBenefits` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_employeeBenefits_created_at` ON `employeeBenefits` (`created_at`);

ALTER TABLE `employeeTaxInfo` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_employeeTaxInfo_created_at` ON `employeeTaxInfo` (`created_at`);

ALTER TABLE `employees` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_employees_created_at` ON `employees` (`created_at`);

ALTER TABLE `employees` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_employees_user_id` ON `employees` (`user_id`);

ALTER TABLE `estimateItems` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_estimateItems_created_at` ON `estimateItems` (`created_at`);

ALTER TABLE `estimates` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_estimates_created_at` ON `estimates` (`created_at`);

ALTER TABLE `exchangeRates` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_exchangeRates_created_at` ON `exchangeRates` (`created_at`);

ALTER TABLE `expenseCategories` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_expenseCategories_created_at` ON `expenseCategories` (`created_at`);

ALTER TABLE `expenseReports` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_expenseReports_created_at` ON `expenseReports` (`created_at`);

ALTER TABLE `expenses` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_expenses_created_at` ON `expenses` (`created_at`);

ALTER TABLE `financialAnalytics` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_financialAnalytics_created_at` ON `financialAnalytics` (`created_at`);

ALTER TABLE `forecastModels` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_forecastModels_created_at` ON `forecastModels` (`created_at`);

ALTER TABLE `forecastResults` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_forecastResults_created_at` ON `forecastResults` (`created_at`);

ALTER TABLE `guestClients` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_guestClients_created_at` ON `guestClients` (`created_at`);

ALTER TABLE `imprestSurrenders` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_imprestSurrenders_created_at` ON `imprestSurrenders` (`created_at`);

ALTER TABLE `imprests` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_imprests_created_at` ON `imprests` (`created_at`);

ALTER TABLE `imprests` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_imprests_user_id` ON `imprests` (`user_id`);

ALTER TABLE `integrationLogs` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_integrationLogs_created_at` ON `integrationLogs` (`created_at`);

ALTER TABLE `inventoryTransactions` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_inventoryTransactions_created_at` ON `inventoryTransactions` (`created_at`);

ALTER TABLE `invoiceItems` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_invoiceItems_created_at` ON `invoiceItems` (`created_at`);

ALTER TABLE `invoicePayments` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_invoicePayments_created_at` ON `invoicePayments` (`created_at`);

ALTER TABLE `invoiceReminders` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_invoiceReminders_created_at` ON `invoiceReminders` (`created_at`);

ALTER TABLE `invoices` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_invoices_created_at` ON `invoices` (`created_at`);

ALTER TABLE `jobGroups` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_jobGroups_created_at` ON `jobGroups` (`created_at`);

ALTER TABLE `journalEntries` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_journalEntries_created_at` ON `journalEntries` (`created_at`);

ALTER TABLE `journalEntryLines` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_journalEntryLines_created_at` ON `journalEntryLines` (`created_at`);

ALTER TABLE `leaveRequests` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_leaveRequests_created_at` ON `leaveRequests` (`created_at`);

ALTER TABLE `lineItems` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_lineItems_created_at` ON `lineItems` (`created_at`);

ALTER TABLE `lpos` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_lpos_created_at` ON `lpos` (`created_at`);

ALTER TABLE `messageReadReceipts` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_messageReadReceipts_user_id` ON `messageReadReceipts` (`user_id`);

ALTER TABLE `messages` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_messages_created_at` ON `messages` (`created_at`);

ALTER TABLE `notificationBroadcasts` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_notificationBroadcasts_created_at` ON `notificationBroadcasts` (`created_at`);

ALTER TABLE `notificationPreferences` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_notificationPreferences_created_at` ON `notificationPreferences` (`created_at`);

ALTER TABLE `notificationPreferences` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_notificationPreferences_user_id` ON `notificationPreferences` (`user_id`);

ALTER TABLE `notificationRules` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_notificationRules_created_at` ON `notificationRules` (`created_at`);

ALTER TABLE `notificationRules` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_notificationRules_user_id` ON `notificationRules` (`user_id`);

ALTER TABLE `notificationSettings` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_notificationSettings_created_at` ON `notificationSettings` (`created_at`);

ALTER TABLE `notificationSettings` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_notificationSettings_user_id` ON `notificationSettings` (`user_id`);

ALTER TABLE `notificationTemplates` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_notificationTemplates_created_at` ON `notificationTemplates` (`created_at`);

ALTER TABLE `notifications` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_notifications_created_at` ON `notifications` (`created_at`);

ALTER TABLE `notifications` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_notifications_user_id` ON `notifications` (`user_id`);

ALTER TABLE `opportunities` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_opportunities_created_at` ON `opportunities` (`created_at`);

ALTER TABLE `organizations` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_organizations_created_at` ON `organizations` (`created_at`);

ALTER TABLE `paymentMethods` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_paymentMethods_created_at` ON `paymentMethods` (`created_at`);

ALTER TABLE `paymentPlanInstallments` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_paymentPlanInstallments_created_at` ON `paymentPlanInstallments` (`created_at`);

ALTER TABLE `paymentPlans` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_paymentPlans_created_at` ON `paymentPlans` (`created_at`);

ALTER TABLE `payments` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_payments_created_at` ON `payments` (`created_at`);

ALTER TABLE `payrollApprovals` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_payrollApprovals_created_at` ON `payrollApprovals` (`created_at`);

ALTER TABLE `payrollDetails` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_payrollDetails_created_at` ON `payrollDetails` (`created_at`);

ALTER TABLE `performanceReviews` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_performanceReviews_created_at` ON `performanceReviews` (`created_at`);

ALTER TABLE `pricingPlans` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_pricingPlans_created_at` ON `pricingPlans` (`created_at`);

ALTER TABLE `pricingTierFeatures` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_pricingTierFeatures_created_at` ON `pricingTierFeatures` (`created_at`);

ALTER TABLE `products` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_products_created_at` ON `products` (`created_at`);

ALTER TABLE `projectComments` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_projectComments_created_at` ON `projectComments` (`created_at`);

ALTER TABLE `projectComments` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_projectComments_user_id` ON `projectComments` (`user_id`);

ALTER TABLE `projectMilestones` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_projectMilestones_created_at` ON `projectMilestones` (`created_at`);

ALTER TABLE `projectTasks` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_projectTasks_created_at` ON `projectTasks` (`created_at`);

ALTER TABLE `projects` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_projects_created_at` ON `projects` (`created_at`);

ALTER TABLE `proposals` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_proposals_created_at` ON `proposals` (`created_at`);

ALTER TABLE `purchase_orders` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_purchase_orders_created_at` ON `purchase_orders` (`created_at`);

ALTER TABLE `receipts` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_receipts_created_at` ON `receipts` (`created_at`);

ALTER TABLE `recurringInvoiceTemplates` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_recurringInvoiceTemplates_created_at` ON `recurringInvoiceTemplates` (`created_at`);

ALTER TABLE `recurringInvoices` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_recurringInvoices_created_at` ON `recurringInvoices` (`created_at`);

ALTER TABLE `reimbursements` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_reimbursements_created_at` ON `reimbursements` (`created_at`);

ALTER TABLE `reminders` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_reminders_created_at` ON `reminders` (`created_at`);

ALTER TABLE `salaryAllowances` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_salaryAllowances_created_at` ON `salaryAllowances` (`created_at`);

ALTER TABLE `salaryDeductions` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_salaryDeductions_created_at` ON `salaryDeductions` (`created_at`);

ALTER TABLE `salaryIncrements` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_salaryIncrements_created_at` ON `salaryIncrements` (`created_at`);

ALTER TABLE `salaryStructures` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_salaryStructures_created_at` ON `salaryStructures` (`created_at`);

ALTER TABLE `savedFilters` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_savedFilters_created_at` ON `savedFilters` (`created_at`);

ALTER TABLE `savedFilters` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_savedFilters_user_id` ON `savedFilters` (`user_id`);

ALTER TABLE `scheduledReminders` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_scheduledReminders_created_at` ON `scheduledReminders` (`created_at`);

ALTER TABLE `schedules` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_schedules_created_at` ON `schedules` (`created_at`);

ALTER TABLE `serviceInvoiceItems` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_serviceInvoiceItems_created_at` ON `serviceInvoiceItems` (`created_at`);

ALTER TABLE `serviceInvoices` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_serviceInvoices_created_at` ON `serviceInvoices` (`created_at`);

ALTER TABLE `serviceTemplates` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_serviceTemplates_created_at` ON `serviceTemplates` (`created_at`);

ALTER TABLE `serviceUsageTracking` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_serviceUsageTracking_created_at` ON `serviceUsageTracking` (`created_at`);

ALTER TABLE `services` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_services_created_at` ON `services` (`created_at`);

ALTER TABLE `skillsMatrix` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_skillsMatrix_created_at` ON `skillsMatrix` (`created_at`);

ALTER TABLE `smsQueue` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_smsQueue_created_at` ON `smsQueue` (`created_at`);

ALTER TABLE `staffChatMessages` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_staffChatMessages_created_at` ON `staffChatMessages` (`created_at`);

ALTER TABLE `staffChatMessages` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_staffChatMessages_user_id` ON `staffChatMessages` (`user_id`);

ALTER TABLE `staffTasks` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_staffTasks_created_at` ON `staffTasks` (`created_at`);

ALTER TABLE `stockAlerts` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_stockAlerts_created_at` ON `stockAlerts` (`created_at`);

ALTER TABLE `subscriptions` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_subscriptions_created_at` ON `subscriptions` (`created_at`);

ALTER TABLE `supplierAudits` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_supplierAudits_created_at` ON `supplierAudits` (`created_at`);

ALTER TABLE `supplierRatings` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_supplierRatings_created_at` ON `supplierRatings` (`created_at`);

ALTER TABLE `suppliers` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_suppliers_created_at` ON `suppliers` (`created_at`);

ALTER TABLE `taxRates` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_taxRates_created_at` ON `taxRates` (`created_at`);

ALTER TABLE `templates` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_templates_created_at` ON `templates` (`created_at`);

ALTER TABLE `tenantCommunicationReads` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_tenantCommunicationReads_user_id` ON `tenantCommunicationReads` (`user_id`);

ALTER TABLE `tenantCommunications` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_tenantCommunications_created_at` ON `tenantCommunications` (`created_at`);

ALTER TABLE `tenantMessages` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_tenantMessages_created_at` ON `tenantMessages` (`created_at`);

ALTER TABLE `ticketResponses` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_ticketResponses_created_at` ON `ticketResponses` (`created_at`);

ALTER TABLE `tickets` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_tickets_created_at` ON `tickets` (`created_at`);

ALTER TABLE `timeEntries` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_timeEntries_created_at` ON `timeEntries` (`created_at`);

ALTER TABLE `timeEntries` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_timeEntries_user_id` ON `timeEntries` (`user_id`);

ALTER TABLE `userDeletions` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_userDeletions_user_id` ON `userDeletions` (`user_id`);

ALTER TABLE `userFavorites` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_userFavorites_created_at` ON `userFavorites` (`created_at`);

ALTER TABLE `userFavorites` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_userFavorites_user_id` ON `userFavorites` (`user_id`);

ALTER TABLE `userPermissions` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_userPermissions_created_at` ON `userPermissions` (`created_at`);

ALTER TABLE `userPermissions` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_userPermissions_user_id` ON `userPermissions` (`user_id`);

ALTER TABLE `userProjectAssignments` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_userProjectAssignments_created_at` ON `userProjectAssignments` (`created_at`);

ALTER TABLE `userProjectAssignments` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_userProjectAssignments_user_id` ON `userProjectAssignments` (`user_id`);

ALTER TABLE `userRoles` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_userRoles_created_at` ON `userRoles` (`created_at`);

ALTER TABLE `userRoles` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_userRoles_user_id` ON `userRoles` (`user_id`);

ALTER TABLE `users` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_users_created_at` ON `users` (`created_at`);

ALTER TABLE `vacationRequests` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_vacationRequests_created_at` ON `vacationRequests` (`created_at`);

ALTER TABLE `webhooks` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_webhooks_created_at` ON `webhooks` (`created_at`);

ALTER TABLE `webhooks` ADD COLUMN `user_id` varchar(64) GENERATED ALWAYS AS (`userId`) STORED;
CREATE INDEX `idx_webhooks_user_id` ON `webhooks` (`user_id`);

ALTER TABLE `workOrderMaterials` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_workOrderMaterials_created_at` ON `workOrderMaterials` (`created_at`);

ALTER TABLE `workOrders` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_workOrders_created_at` ON `workOrders` (`created_at`);

ALTER TABLE `workflowActions` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_workflowActions_created_at` ON `workflowActions` (`created_at`);

ALTER TABLE `workflowExecutions` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_workflowExecutions_created_at` ON `workflowExecutions` (`created_at`);

ALTER TABLE `workflowTriggers` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_workflowTriggers_created_at` ON `workflowTriggers` (`created_at`);

ALTER TABLE `workflows` ADD COLUMN `created_at` timestamp GENERATED ALWAYS AS (`createdAt`) STORED;
CREATE INDEX `idx_workflows_created_at` ON `workflows` (`created_at`);

