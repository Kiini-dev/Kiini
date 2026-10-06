import { router, protectedProcedure, createFeatureRestrictedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { v4 as uuidv4 } from "uuid";

export const notificationRulesRouter = router({
  /**
   * Create notification rule
   */
  createRule: createFeatureRestrictedProcedure("notifications:create")
    .input(
      z.object({
        eventType: z.string(),
        channelType: z.enum(['email', 'in_app', 'push', 'sms']),
        frequency: z.enum(['instant', 'daily', 'weekly', 'never']),
        doNotDisturbStart: z.string().optional(),
        doNotDisturbEnd: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { success: false };

      try {
        const ruleId = uuidv4();
        await db.insertNotificationRule({
          id: ruleId,
          userId: ctx.user?.id || "",
          eventType: input.eventType,
          channelType: input.channelType,
          frequency: input.frequency,
          doNotDisturbStart: input.doNotDisturbStart,
          doNotDisturbEnd: input.doNotDisturbEnd,
          enabled: 1,
        });

        return { success: true, ruleId };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Get notification rules
   */
  getRules: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { rules: [] };

    try {
      const rules = await db.getNotificationRules(ctx.user?.id || "");
      return { rules };
    } catch (error) {
      return { rules: [] };
    }
  }),

  /**
   * Update rule
   */
  updateRule: createFeatureRestrictedProcedure("notifications:edit")
    .input(
      z.object({
        ruleId: z.string(),
        enabled: z.boolean().optional(),
        frequency: z.enum(['instant', 'daily', 'weekly', 'never']).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      try {
        await db.updateNotificationRule(input.ruleId, {
          enabled: input.enabled !== undefined ? input.enabled ? 1 : 0 : undefined,
          frequency: input.frequency,
        });

        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),
});

export const recurringInvoicingRouter = router({
  /**
   * Create subscription
   */
  createSubscription: createFeatureRestrictedProcedure("billing:create")
    .input(
      z.object({
        clientId: z.string(),
        subscriptionName: z.string(),
        tier: z.enum(['basic', 'professional', 'enterprise', 'custom']),
        monthlyAmount: z.number(),
        billingCycle: z.enum(['monthly', 'quarterly', 'semi_annual', 'annual']),
        startDate: z.string(),
        features: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      try {
        const subId = uuidv4();
        const nextBilling = new Date(input.startDate);
        
        if (input.billingCycle === 'monthly') {
          nextBilling.setMonth(nextBilling.getMonth() + 1);
        } else if (input.billingCycle === 'quarterly') {
          nextBilling.setMonth(nextBilling.getMonth() + 3);
        } else if (input.billingCycle === 'semi_annual') {
          nextBilling.setMonth(nextBilling.getMonth() + 6);
        } else {
          nextBilling.setFullYear(nextBilling.getFullYear() + 1);
        }

        await db.insertSubscription({
          id: subId,
          clientId: input.clientId,
          subscriptionName: input.subscriptionName,
          tier: input.tier,
          monthlyAmount: input.monthlyAmount,
          billingCycle: input.billingCycle,
          startDate: input.startDate,
          nextBillingDate: nextBilling.toISOString(),
          status: 'active',
          autoRenew: 1,
          features: input.features,
        });

        return { success: true, subscriptionId: subId };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Get subscriptions
   */
  getSubscriptions: createFeatureRestrictedProcedure("billing:read")
    .input(z.object({ clientId: z.string().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { subscriptions: [] };

      try {
        const subs = await db.getSubscriptions(input.clientId);
        return { subscriptions: subs };
      } catch (error) {
        return { subscriptions: [] };
      }
    }),

  /**
   * Record usage metric
   */
  recordUsage: createFeatureRestrictedProcedure("billing:create")
    .input(
      z.object({
        subscriptionId: z.string(),
        metricName: z.string(),
        metricValue: z.number(),
        billingAmount: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      try {
        const metricId = uuidv4();
        await db.insertUsageMetric({
          id: metricId,
          subscriptionId: input.subscriptionId,
          metricName: input.metricName,
          metricValue: input.metricValue,
          billingAmount: input.billingAmount,
          usagePeriod: new Date().toISOString().split('T')[0],
        });

        return { success: true, metricId };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),
});

export const expenseManagementRouter = router({
  /**
   * Submit expense report
   */
  submitExpenseReport: createFeatureRestrictedProcedure("expenses:create")
    .input(z.object({ expenses: z.array(z.object({ description: z.string(), amount: z.number(), date: z.string() })) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { success: false };

      try {
        const reportId = uuidv4();
        const totalAmount = input.expenses.reduce((sum, exp) => sum + exp.amount, 0);

        await db.insertExpenseReport({
          id: reportId,
          submittedBy: ctx.user?.id || "",
          reportDate: new Date().toISOString(),
          totalAmount,
          status: 'submitted',
        });

        for (const expense of input.expenses) {
          const expId = uuidv4();
          await db.insertExpense({
            id: expId,
            expenseReportId: reportId,
            categoryId: "",
            amount: expense.amount,
            expenseDate: expense.date,
            description: expense.description,
          });
        }

        return { success: true, reportId };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Get expense reports
   */
  getReports: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { reports: [] };

    try {
      const reports = await db.getExpenseReports(ctx.user?.id || "");
      return { reports };
    } catch (error) {
      return { reports: [] };
    }
  }),

  /**
   * Approve expense report
   */
  approveReport: createFeatureRestrictedProcedure("expenses:edit")
    .input(z.object({ reportId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { success: false };

      try {
        await db.updateExpenseReport(input.reportId, {
          status: 'approved',
          approvedBy: ctx.user?.id,
          approvalDate: new Date().toISOString(),
        });

        return { success: true };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Process reimbursement
   */
  processReimbursement: createFeatureRestrictedProcedure("expenses:create")
    .input(
      z.object({
        reportId: z.string(),
        paymentMethod: z.string(),
        paymentDate: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };

      try {
        const reimbId = uuidv4();
        const report = await db.getExpenseReport(input.reportId);

        await db.insertReimbursement({
          id: reimbId,
          expenseReportId: input.reportId,
          employeeId: report?.submittedBy || "",
          totalAmount: report?.totalAmount || 0,
          paymentMethod: input.paymentMethod,
          paymentDate: input.paymentDate,
          status: 'processed',
        });

        return { success: true, reimbursementId: reimbId };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),
});

export const multiCurrencyRouter = router({
  /**
   * Get exchange rate
   */
  getExchangeRate: createFeatureRestrictedProcedure("finance:read")
    .input(z.object({ fromCurrency: z.string(), toCurrency: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { rate: 1 };

      try {
        const rate = await db.getExchangeRate(input.fromCurrency, input.toCurrency);
        return { rate: rate || 1 };
      } catch (error) {
        return { rate: 1 };
      }
    }),

  /**
   * Get tax rate for country
   */
  getTaxRate: createFeatureRestrictedProcedure("finance:read")
    .input(z.object({ country: z.string(), taxType: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { rate: 0 };

      try {
        const rate = await db.getTaxRate(input.country, input.taxType);
        return { rate: rate || 0 };
      } catch (error) {
        return { rate: 0 };
      }
    }),
});

export const forecastingRouter = router({
  /**
   * Get revenue forecast
   */
  getRevenueForecast: createFeatureRestrictedProcedure("analytics:read")
    .input(z.object({ months: z.number().default(12) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { forecast: [] };

      try {
        const forecast = await db.getRevenueForecast(input.months);
        return { forecast };
      } catch (error) {
        return { forecast: [] };
      }
    }),

  /**
   * Get churn prediction
   */
  getChurnPrediction: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { predictions: [] };

    try {
      const predictions = await db.getChurnPredictions();
      return { predictions };
    } catch (error) {
      return { predictions: [] };
    }
  }),
});

export const integrationPlatformRouter = router({
  /**
   * Create API key
   */
  createApiKey: createFeatureRestrictedProcedure("settings:edit")
    .input(z.object({ keyName: z.string(), rateLimit: z.number().default(1000) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { success: false };

      try {
        const keyId = uuidv4();
        const keyValue = `sk_${uuidv4()}`;

        await db.insertApiKey({
          id: keyId,
          userId: ctx.user?.id || "",
          keyName: input.keyName,
          keyValue,
          rateLimit: input.rateLimit,
          isActive: 1,
        });

        return { success: true, keyId, keyValue };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Create webhook
   */
  createWebhook: createFeatureRestrictedProcedure("settings:edit")
    .input(
      z.object({
        webhookUrl: z.string(),
        eventType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { success: false };

      try {
        const hookId = uuidv4();
        const secret = uuidv4();

        await db.insertWebhook({
          id: hookId,
          userId: ctx.user?.id || "",
          webhookUrl: input.webhookUrl,
          eventType: input.eventType,
          secret,
          isActive: 1,
        });

        return { success: true, hookId, secret };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }),

  /**
   * Get webhook logs
   */
  getWebhookLogs: createFeatureRestrictedProcedure("settings:read")
    .input(z.object({ webhookId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { logs: [] };

      try {
        const logs = await db.getIntegrationLogs(input.webhookId);
        return { logs };
      } catch (error) {
        return { logs: [] };
      }
    }),
});
