/**
 * Cohort Analytics Router - DB-backed
 */
import { router } from '../_core/trpc';
import { createFeatureRestrictedProcedure } from '../middleware/enhancedRbac';
import { z } from 'zod';
import { getDb } from '../db';
import { cohortAnalyses, subscriptions, billingInvoices } from '../../drizzle/schema';
import { eq, desc, and, lte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const featureViewProcedure = createFeatureRestrictedProcedure('analytics:view');
const featureEditProcedure = createFeatureRestrictedProcedure('analytics:edit');

export const cohortAnalyticsRouter = router({
  getCohortAnalysis: featureViewProcedure
    .input(z.object({ cohortType: z.enum(["SIGNUP_DATE", "FIRST_PURCHASE", "REGION"]), period: z.string().default("MONTHLY") }).strict())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      const rows = await db.select().from(cohortAnalyses)
        .where(and(eq(cohortAnalyses.analysisType, 'cohort'), eq(cohortAnalyses.cohortType, input.cohortType)))
        .orderBy(desc(cohortAnalyses.createdAt))
        .limit(20);
      return {
        cohortType: input.cohortType,
        period: input.period,
        cohorts: rows.map(r => ({
          cohort: r.name || '',
          users: r.retentionData ? JSON.parse(r.retentionData).users || 0 : 0,
          retention: r.retentionData ? JSON.parse(r.retentionData).retention || [] : [],
          churnRate: r.retentionData ? JSON.parse(r.retentionData).churnRate || 0 : 0,
          avgLifetimeValue: r.retentionData ? JSON.parse(r.retentionData).avgLifetimeValue || 0 : 0,
          avgRetentionDays: r.retentionData ? JSON.parse(r.retentionData).avgRetentionDays || 0 : 0,
        })),
        overallRetention: 0,
        bestPerformingCohort: rows[0]?.name || '',
        worstPerformingCohort: '',
        segment: '',
      };
    }),

  getAttributionModel: featureViewProcedure
    .input(z.object({ model: z.enum(["FIRST_TOUCH", "LAST_TOUCH", "LINEAR", "TIME_DECAY", "POSITION_BASED"]), conversionType: z.string().optional() }).strict())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      const rows = await db.select().from(cohortAnalyses)
        .where(eq(cohortAnalyses.analysisType, 'attribution'))
        .orderBy(desc(cohortAnalyses.createdAt))
        .limit(10);
      return {
        attributionModel: input.model,
        conversionType: input.conversionType || "PURCHASE",
        totalConversions: 0,
        channels: rows.map(r => ({
          channel: r.name || '',
          credit: r.dataPayload ? JSON.parse(r.dataPayload).credit || 0 : 0,
          percentage: r.dataPayload ? JSON.parse(r.dataPayload).percentage || 0 : 0,
          trend: r.dataPayload ? JSON.parse(r.dataPayload).trend || 0 : 0,
        })),
        avgTouchpoints: 0,
        conversionLag: 0,
        cycleTime: 0,
        multiTouchConversions: 0,
      };
    }),

  analyzeFunnels: featureViewProcedure
    .input(z.object({ funnelId: z.string(), timeRange: z.string().default("30d") }).strict())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      const rows = await db.select().from(cohortAnalyses)
        .where(and(eq(cohortAnalyses.analysisType, 'funnel'), eq(cohortAnalyses.name, input.funnelId)))
        .orderBy(desc(cohortAnalyses.createdAt))
        .limit(1);
      const row = rows[0];
      const funnelData = row?.funnelData ? JSON.parse(row.funnelData) : {};
      return {
        funnelId: input.funnelId,
        funnelName: funnelData.funnelName || input.funnelId,
        timeRange: input.timeRange,
        steps: funnelData.steps || [],
        overallConversionRate: funnelData.overallConversionRate || 0,
        biggestDropoff: funnelData.biggestDropoff || { step: '', percentage: 0 },
        avgTimePerStep: funnelData.avgTimePerStep || 0,
        totalFunnelTime: funnelData.totalFunnelTime || 0,
      };
    }),

  getCustomMetricsDefinition: featureEditProcedure
    .input(z.object({ metricName: z.string(), calculation: z.string(), dimensions: z.array(z.string()).optional() }).strict())
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const id = uuidv4();
      await db.insert(cohortAnalyses).values({
        id,
        analysisType: 'custom_metric',
        name: input.metricName,
        dataPayload: JSON.stringify({ calculation: input.calculation, dimensions: input.dimensions || [] }),
        status: 'ACTIVE',
        createdBy: ctx.user?.id || 'system',
      });
      return {
        metricId: id,
        metricName: input.metricName,
        calculation: input.calculation,
        dimensions: input.dimensions || [],
        status: "ACTIVE",
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        lastUpdated: new Date(),
        dataSource: "EVENTS",
        refreshFrequency: "HOURLY",
        historicalData: true,
        comparableMetrics: [],
        visualization: "LINE_CHART",
      };
    }),

  runCohortRetention: featureViewProcedure
    .input(z.object({ startDate: z.string(), endDate: z.string() }).strict())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      const rows = await db.select().from(cohortAnalyses)
        .where(eq(cohortAnalyses.analysisType, 'retention'))
        .orderBy(desc(cohortAnalyses.createdAt))
        .limit(1);
      const row = rows[0];
      const data = row?.retentionData ? JSON.parse(row.retentionData) : {};
      return {
        period: `${input.startDate} to ${input.endDate}`,
        totalCohorts: data.totalCohorts || 0,
        cohortSize: data.cohortSize || 0,
        retentionInsights: data.retentionInsights || { d1Retention: 0, d7Retention: 0, d30Retention: 0, d90Retention: 0 },
        churnByWeek: data.churnByWeek || [],
        cumulativeChurn: data.cumulativeChurn || 0,
        retentionTrend: data.retentionTrend || 'STABLE',
        negativeImpactFactors: data.negativeImpactFactors || [],
        recommendedActions: data.recommendedActions || [],
      };
    }),

  predictChurnRisk: featureViewProcedure
    .input(z.object({ subscriptionId: z.string().optional() }).strict())
    .query(async ({ input }) => {
      const db = await getDb();
      const subscriptionConditions: any[] = [];
      if (input.subscriptionId) {
        subscriptionConditions.push(eq(subscriptions.id, input.subscriptionId));
      }

      const allSubscriptions = await db.select().from(subscriptions)
        .where(subscriptionConditions.length > 0 ? and(...subscriptionConditions) : undefined);

      const activeCount = allSubscriptions.filter((sub: any) => sub.status === 'active').length;
      const churnedCount = allSubscriptions.filter((sub: any) => ['cancelled', 'suspended', 'expired'].includes(sub.status)).length;
      const totalSubscriptions = allSubscriptions.length;
      const churnRate = totalSubscriptions ? churnedCount / totalSubscriptions : 0;

      const overdueConditions: any[] = [eq(billingInvoices.status, 'pending'), lte(billingInvoices.dueDate, new Date().toISOString())];
      if (input.subscriptionId) {
        overdueConditions.push(eq(billingInvoices.subscriptionId, input.subscriptionId));
      }

      const overdueInvoices = await db.select().from(billingInvoices)
        .where(and(...overdueConditions));

      const overdueRatio = totalSubscriptions ? Math.min(1, overdueInvoices.length / totalSubscriptions) : 0;
      const score = Math.min(100, Math.round(20 + churnRate * 45 + overdueRatio * 40 + (activeCount === 0 && totalSubscriptions > 0 ? 15 : 0)));
      const riskLevel = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';

      const latestChurn = await db.select().from(cohortAnalyses)
        .where(eq(cohortAnalyses.analysisType, 'churn'))
        .orderBy(desc(cohortAnalyses.createdAt))
        .limit(1);
      const churnPayload = latestChurn[0]?.dataPayload ? JSON.parse(latestChurn[0].dataPayload) : {};

      return {
        subscriptionId: input.subscriptionId || null,
        totalSubscriptions,
        activeCount,
        churnedCount,
        churnRate: Math.round(churnRate * 10000) / 100,
        overdueInvoiceCount: overdueInvoices.length,
        overdueRatio: Math.round(overdueRatio * 10000) / 100,
        riskScore: score,
        riskLevel,
        drivers: [
          { name: 'Churn rate', value: Math.round(churnRate * 10000) / 100 },
          { name: 'Overdue invoices', value: Math.round(overdueRatio * 10000) / 100 },
          { name: 'Active subscriptions', value: activeCount },
        ],
        prediction: churnPayload.prediction || 'Churn risk is driven by subscription cancellations and overdue payments.',
        recommendedActions: churnPayload.recommendedActions || [
          'Review overdue renewals',
          'Engage at-risk customers with early retention offers',
          'Monitor subscription downgrades closely',
        ],
      };
    }),

  getAnalyticsInteraction: featureViewProcedure
    .input(z.object({ eventType: z.string(), userId: z.string().optional() }).strict())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      const rows = await db.select().from(cohortAnalyses)
        .where(eq(cohortAnalyses.analysisType, 'interaction'))
        .orderBy(desc(cohortAnalyses.createdAt))
        .limit(10);
      return {
        eventType: input.eventType,
        totalEvents: 0,
        uniqueUsers: 0,
        avgEventsPerUser: 0,
        eventDistribution: {},
        topPages: rows.map(r => ({ page: r.name || '', events: 0, users: 0 })),
        avgSessionDuration: 0,
        bounceRate: 0,
        userFlow: '',
      };
    }),
});
