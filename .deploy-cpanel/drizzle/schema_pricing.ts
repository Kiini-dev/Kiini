
// ============================================================================
// PHASE 20: PRICING & BILLING SYSTEM
// ============================================================================

export const pricingPlans = mysqlTable("pricingPlans", {
  id: varchar({ length: 64 }).primaryKey(),
  planName: varchar({ length: 255 }).notNull(),
  planSlug: varchar({ length: 100 }).notNull().unique(),
  description: longtext(),
  tier: mysqlEnum(['free', 'starter', 'professional', 'enterprise', 'custom']).notNull(),
  monthlyPrice: decimal({ precision: 10, scale: 2 }).default('0'),
  annualPrice: decimal({ precision: 10, scale: 2 }).default('0'),
  monthlyAnnualDiscount: decimal({ precision: 5, scale: 2 }).default('0'),
  maxUsers: int().default(-1),
  maxProjects: int().default(-1),
  maxStorageGB: int().default(-1),
  features: json(),
  supportLevel: mysqlEnum(['email', 'priority', '24/7_phone', 'dedicated_manager']).default('email'),
  isActive: tinyint().default(1).notNull(),
  displayOrder: int().default(0),
  createdAt: timestamp({ mode: 'string' }).defaultNow(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_tier").on(table.tier),
  index("idx_slug").on(table.planSlug),
  index("idx_active").on(table.isActive),
]);

export type PricingPlan = typeof pricingPlans.$inferSelect;
export type InsertPricingPlan = typeof pricingPlans.$inferInsert;

export const subscriptions = mysqlTable("subscriptions", {
  id: varchar({ length: 64 }).primaryKey(),
  clientId: varchar({ length: 64 }).notNull(),
  planId: varchar({ length: 64 }).notNull(),
  status: mysqlEnum(['trial', 'active', 'suspended', 'cancelled', 'expired']).default('trial').notNull(),
  billingCycle: mysqlEnum(['monthly', 'annual']).default('monthly').notNull(),
  startDate: timestamp({ mode: 'string' }).notNull(),
  renewalDate: timestamp({ mode: 'string' }).notNull(),
  expiryDate: timestamp({ mode: 'string' }),
  gracePeriodEnd: timestamp({ mode: 'string' }),
  isLocked: tinyint().default(0),
  autoRenew: tinyint().default(1),
  currentPrice: decimal({ precision: 10, scale: 2 }).default('0'),
  usersCount: int().default(0),
  projectsCount: int().default(0),
  storageUsedGB: int().default(0),
  createdAt: timestamp({ mode: 'string' }).defaultNow(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_client_id").on(table.clientId),
  index("idx_status").on(table.status),
  index("idx_renewal_date").on(table.renewalDate),
  index("idx_expiry_date").on(table.expiryDate),
]);

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export const billingInvoices = mysqlTable("billingInvoices", {
  id: varchar({ length: 64 }).primaryKey(),
  subscriptionId: varchar({ length: 64 }).notNull(),
  invoiceNumber: varchar({ length: 50 }).notNull().unique(),
  amount: decimal({ precision: 10, scale: 2 }).notNull(),
  tax: decimal({ precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal({ precision: 10, scale: 2 }).notNull(),
  currency: varchar({ length: 3 }).default('USD'),
  status: mysqlEnum(['pending', 'sent', 'viewed', 'paid', 'failed', 'cancelled', 'refunded']).default('pending').notNull(),
  billingPeriodStart: timestamp({ mode: 'string' }).notNull(),
  billingPeriodEnd: timestamp({ mode: 'string' }).notNull(),
  dueDate: timestamp({ mode: 'string' }).notNull(),
  sentAt: timestamp({ mode: 'string' }),
  paidAt: timestamp({ mode: 'string' }),
  paymentMethod: varchar({ length: 50 }),
  paymentReference: varchar({ length: 255 }),
  notes: text(),
  createdAt: timestamp({ mode: 'string' }).defaultNow(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_subscription_id").on(table.subscriptionId),
  index("idx_status").on(table.status),
  index("idx_due_date").on(table.dueDate),
  index("idx_paid_at").on(table.paidAt),
]);

export type BillingInvoice = typeof billingInvoices.$inferSelect;
export type InsertBillingInvoice = typeof billingInvoices.$inferInsert;

export const payments = mysqlTable("payments", {
  id: varchar({ length: 64 }).primaryKey(),
  invoiceId: varchar({ length: 64 }),
  amount: decimal({ precision: 10, scale: 2 }).notNull(),
  currency: varchar({ length: 3 }).default('USD'),
  paymentMethod: mysqlEnum(['credit_card', 'debit_card', 'bank_transfer', 'paypal', 'stripe', 'mpesa', 'other']).notNull(),
  provider: varchar({ length: 50 }),
  transactionId: varchar({ length: 255 }).unique(),
  status: mysqlEnum(['pending', 'processing', 'completed', 'failed', 'refunded']).default('pending').notNull(),
  paymentDate: timestamp({ mode: 'string' }),
  refundedAmount: decimal({ precision: 10, scale: 2 }).default('0'),
  refundDate: timestamp({ mode: 'string' }),
  refundReason: text(),
  metadata: json(),
  createdAt: timestamp({ mode: 'string' }).defaultNow(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_invoice_id").on(table.invoiceId),
  index("idx_status").on(table.status),
  index("idx_transaction_id").on(table.transactionId),
  index("idx_payment_date").on(table.paymentDate),
]);

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

export const paymentMethods = mysqlTable("paymentMethods", {
  id: varchar({ length: 64 }).primaryKey(),
  clientId: varchar({ length: 64 }).notNull(),
  type: mysqlEnum(['credit_card', 'debit_card', 'bank_account', 'paypal', 'mpesa']).notNull(),
  provider: varchar({ length: 50 }),
  lastFourDigits: varchar({ length: 4 }),
  expiryMonth: int(),
  expiryYear: int(),
  holderName: varchar({ length: 255 }),
  bankName: varchar({ length: 255 }),
  accountNumber: varchar({ length: 50 }),
  isDefault: tinyint().default(0),
  isActive: tinyint().default(1),
  providerMethodId: varchar({ length: 255 }),
  createdAt: timestamp({ mode: 'string' }).defaultNow(),
  updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow(),
}, (table) => [
  index("idx_client_id").on(table.clientId),
  index("idx_is_default").on(table.isDefault),
  index("idx_type").on(table.type),
]);

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethods.$inferInsert;

export const billingUsageMetrics = mysqlTable("billingUsageMetrics", {
  id: varchar({ length: 64 }).primaryKey(),
  subscriptionId: varchar({ length: 64 }).notNull(),
  metricDate: datetime({ mode: 'string' }).notNull(),
  usersCount: int().default(0),
  projectsCount: int().default(0),
  tasksCount: int().default(0),
  documentsCount: int().default(0),
  storageUsedMB: int().default(0),
  apiCallsCount: int().default(0),
  emailsSent: int().default(0),
  recordedAt: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
  index("idx_subscription_id").on(table.subscriptionId),
  index("idx_metric_date").on(table.metricDate),
]);

export type BillingUsageMetric = typeof billingUsageMetrics.$inferSelect;
export type InsertBillingUsageMetric = typeof billingUsageMetrics.$inferInsert;

export const billingNotifications = mysqlTable("billingNotifications", {
  id: varchar({ length: 64 }).primaryKey(),
  subscriptionId: varchar({ length: 64 }).notNull(),
  notificationType: mysqlEnum([
    'payment_due_7days',
    'payment_due_today',
    'payment_overdue_1day',
    'payment_overdue_3days',
    'subscription_expiring_7days',
    'subscription_expiring_today',
    'subscription_expired',
    'system_locked',
    'payment_failed',
    'usage_limit_warning',
    'renewal_successful',
  ]).notNull(),
  message: text(),
  sentTo: varchar({ length: 320 }),
  channel: mysqlEnum(['email', 'in_app', 'sms']).default('email'),
  isSent: tinyint().default(0),
  sentAt: timestamp({ mode: 'string' }),
  isRead: tinyint().default(0),
  readAt: timestamp({ mode: 'string' }),
  createdAt: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
  index("idx_subscription_id").on(table.subscriptionId),
  index("idx_notification_type").on(table.notificationType),
  index("idx_is_sent").on(table.isSent),
]);

export type BillingNotification = typeof billingNotifications.$inferSelect;
export type InsertBillingNotification = typeof billingNotifications.$inferInsert;
