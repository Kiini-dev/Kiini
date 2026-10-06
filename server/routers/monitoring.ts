import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { adminProcedure, publicProcedure, router } from '../_core/trpc';
import { createMonitoringService } from '../services/monitoringService';
import { appObservability } from '../services/observability';

// Initialize monitoring service
const monitoringService = createMonitoringService({
  enabled: process.env.MONITORING_ENABLED !== 'false',
  apmProvider: (process.env.APM_PROVIDER as any) || 'none',
  logProvider: (process.env.LOG_PROVIDER as any) || 'console',
});

export const monitoringRouter = router({
  /**
   * Health check endpoint - returns system health status
   * Can be called publicly for load balancer health checks
   */
  healthCheck: publicProcedure
    .input(
      z
        .object({
          detailed: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      try {
        const healthCheckResult = await monitoringService.performHealthCheck();

        if (!input?.detailed) {
          // Simple health check response for load balancers
          return {
            status: healthCheckResult.status,
            timestamp: healthCheckResult.timestamp,
          };
        }

        // Detailed health check with all component statuses
        return healthCheckResult;
      } catch (error) {
        console.error('Health check failed:', error);
        return {
          status: 'unhealthy',
          timestamp: new Date(),
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Get current system metrics
   */
  getMetrics: adminProcedure
    .input(
      z
        .object({
          metric: z.string().optional(),
          timeRange: z.enum(['1h', '24h']).optional(),
        })
        .optional()
    )
    .query(({ input }) => {
      const timeRange = input?.timeRange || '1h';
      return { metrics: appObservability.getMetrics(timeRange), timeRange, success: true };
    }),

  /**
   * Get system uptime and availability
   */
  getUptime: publicProcedure.query(async () => {
    try {
      const uptime = process.uptime();
      const uptimeHours = Math.floor(uptime / 3600);
      const uptimeMinutes = Math.floor((uptime % 3600) / 60);
      const uptimeSeconds = Math.floor(uptime % 60);

      return {
        uptimeSeconds: Math.floor(uptime),
        uptimeFormatted: `${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`,
        startTime: new Date(Date.now() - uptime * 1000),
        availability: '99.9%', // TODO: Calculate from historical data
        success: true,
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch uptime: ${(error as Error).message}`,
      });
    }
  }),

  /**
   * Get performance statistics
   */
  getPerformanceStats: adminProcedure.query(async () => {
    try {
      const memoryUsage = process.memoryUsage();
      const heapUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

      return {
        memory: {
          heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          externalMB: Math.round(memoryUsage.external / 1024 / 1024),
          heapUsagePercent: Math.round(heapUsagePercent),
          status: heapUsagePercent > 90 ? 'critical' : heapUsagePercent > 75 ? 'warning' : 'healthy',
        },
        cpu: {
          usagePercent: 45, // TODO: Calculate actual CPU usage
        },
        uptime: Math.floor(process.uptime()),
        success: true,
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch performance stats: ${(error as Error).message}`,
      });
    }
  }),

  /**
   * Get service status (API, Database, Cache, External Services)
   */
  getServiceStatus: adminProcedure.query(async () => {
    try {
      const health = await monitoringService.performHealthCheck();

      return {
        services: {
          api: { status: 'operational', responseTime: 45 },
          database: {
            status: health.checks.database.status,
            responseTime: health.checks.database.responseTime,
          },
          cache: {
            status: health.checks.cache.status,
            responseTime: health.checks.cache.responseTime,
          },
          externalAPIs: {
            status: health.checks.externalAPIs.status,
            responseTime: health.checks.externalAPIs.responseTime,
          },
        },
        lastUpdated: new Date(),
        success: true,
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch service status: ${(error as Error).message}`,
      });
    }
  }),

  /**
   * Get error rate and logs
   */
  getErrorMetrics: adminProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
          severity: z.enum(['all', 'error', 'warning', 'critical']).optional(),
        })
        .optional()
    )
    .query(({ input }) => {
      const counts = appObservability.getEventCounts24h();
      const metrics = appObservability.getMetrics('24h');
      return {
        errors: appObservability.getRecentEvents(input?.limit).filter((event) =>
          event.type !== 'rate_limit' && (!input?.severity || input.severity === 'all' ||
            (input.severity === 'warning' ? event.severity === 'warning' : event.severity === 'critical'))
        ),
        totalErrors24h: counts.serverErrors,
        totalWarnings24h: counts.rateLimited,
        errorRate: metrics.errorRate,
        trend: 'unknown',
        success: true,
        metrics,
      };
    }),

  /**
   * Get alerts and notifications
   */
  getAlerts: adminProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
          severity: z.enum(['all', 'info', 'warning', 'critical']).optional(),
        })
        .optional()
    )
    .query(({ input }) => {
      const alerts = appObservability.getRecentEvents(input?.limit).filter((event) =>
        !input?.severity || input.severity === 'all' || input.severity === event.severity
      );
      return { alerts, totalActive: alerts.length, timestamp: new Date(), success: true };
    }),

  /**
   * Get application dependencies status
   */
  getDependencies: adminProcedure.query(async () => {
    try {
      return {
        dependencies: [
          {
            name: 'Node.js',
            version: process.version,
            status: 'operational',
          },
          {
            name: 'MySQL',
            version: 'configured at runtime',
            status: process.env.DATABASE_URL ? 'configured' : 'not_configured',
          },
          {
            name: 'SMTP alerts',
            version: 'configured at runtime',
            status: process.env.SMTP_HOST && process.env.SMTP_PORT ? 'configured' : 'not_configured',
          },
        ],
        lastChecked: new Date(),
        success: true,
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch dependencies: ${(error as Error).message}`,
      });
    }
  }),
});

export type MonitoringRouter = typeof monitoringRouter;

// Export monitoring service for middleware integration
export { monitoringService };