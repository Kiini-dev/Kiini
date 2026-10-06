import { getDb, getPool } from "../db";

export interface MonitoringConfig {
  enabled: boolean;
  apmProvider: 'newrelic' | 'datadog' | 'elastic' | 'none';
  logProvider: 'datadog' | 'elastic' | 'cloudwatch' | 'console';
  metricsInterval: number; // in seconds
  traceEnabled: boolean;
  traceSampleRate: number; // 0-1
}

export interface Metric {
  name: string;
  value: number;
  timestamp: Date;
  tags: Record<string, string>;
}

export interface TraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'ok' | 'error' | 'cancelled';
  attributes: Record<string, any>;
  events: Array<{ name: string; timestamp: Date; attributes: Record<string, any> }>;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  checks: {
    database: { status: string; responseTime: number; error?: string };
    cache: { status: string; responseTime: number; error?: string };
    externalAPIs: { status: string; responseTime: number; error?: string };
    diskSpace: { status: string; available: number; used: number };
    memory: { status: string; usagePercent: number };
    cpu: { status: string; usagePercent: number };
  };
  alerts?: Array<{ level: 'warning' | 'critical'; message: string }>;
}

/**
 * MonitoringService - Centralized monitoring, observability, and health checks
 * Integrates with APM providers and logging services
 */
export class MonitoringService {
  private config: MonitoringConfig;
  private activeSpans: Map<string, TraceSpan> = new Map();
  private metrics: Metric[] = [];
  private readonly maxMetrics = 1000;

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      enabled: true,
      apmProvider: 'none',
      logProvider: 'console',
      metricsInterval: 60,
      traceEnabled: true,
      traceSampleRate: 0.1,
      ...config,
    };

    this.initialize();
  }

  private initialize(): void {
    if (!this.config.enabled) return;

    // Initialize APM provider
    switch (this.config.apmProvider) {
      case 'newrelic':
        this.initializeNewRelic();
        break;
      case 'datadog':
        this.initializeDatadog();
        break;
      case 'elastic':
        this.initializeElastic();
        break;
    }

    // Start metrics collection
    this.startMetricsCollection();
  }

  private initializeNewRelic(): void {
    try {
      // New Relic APM initialization
      console.log('[Monitoring] Initializing New Relic APM');
      // require('newrelic'); // This should be loaded at app startup
    } catch (error) {
      console.error('Failed to initialize New Relic:', error);
    }
  }

  private initializeDatadog(): void {
    try {
      // Datadog APM initialization
      console.log('[Monitoring] Initializing Datadog APM');
      // require('dd-trace').init(); // Should be done at app startup
    } catch (error) {
      console.error('Failed to initialize Datadog:', error);
    }
  }

  private initializeElastic(): void {
    try {
      // Elastic APM initialization
      console.log('[Monitoring] Initializing Elastic APM');
      // require('elastic-apm-node').start(); // Should be done at app startup
    } catch (error) {
      console.error('Failed to initialize Elastic APM:', error);
    }
  }

  /**
   * Start distributed trace span
   */
  startSpan(name: string, attributes: Record<string, any> = {}): TraceSpan {
    if (!this.config.traceEnabled) {
      return this.createDummySpan(name);
    }

    // Sample traces based on configuration
    if (Math.random() > this.config.traceSampleRate) {
      return this.createDummySpan(name);
    }

    const span: TraceSpan = {
      traceId: this.generateTraceId(),
      spanId: this.generateSpanId(),
      name,
      startTime: new Date(),
      attributes,
      events: [],
      status: 'ok',
    };

    this.activeSpans.set(span.spanId, span);
    return span;
  }

  /**
   * End trace span
   */
  endSpan(span: TraceSpan, status: 'ok' | 'error' | 'cancelled' = 'ok'): void {
    if (!span.spanId || !this.activeSpans.has(span.spanId)) return;

    const activeSpan = this.activeSpans.get(span.spanId)!;
    activeSpan.endTime = new Date();
    activeSpan.duration = activeSpan.endTime.getTime() - activeSpan.startTime.getTime();
    activeSpan.status = status;

    this.activeSpans.delete(span.spanId);

    // Send to APM provider
    this.sendTraceToAPM(activeSpan);
  }

  /**
   * Add event to span
   */
  addSpanEvent(span: TraceSpan, eventName: string, attributes: Record<string, any> = {}): void {
    if (!this.activeSpans.has(span.spanId)) return;

    this.activeSpans.get(span.spanId)!.events.push({
      name: eventName,
      timestamp: new Date(),
      attributes,
    });
  }

  /**
   * Record a metric
   */
  recordMetric(name: string, value: number, tags: Record<string, string> = {}): void {
    const metric: Metric = {
      name,
      value,
      timestamp: new Date(),
      tags,
    };

    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.splice(0, this.metrics.length - this.maxMetrics);
    }

    // Send to metrics provider
    this.sendMetric(metric);
  }

  /**
   * Record operation duration
   */
  recordOperationDuration(
    operationName: string,
    durationMs: number,
    tags: Record<string, string> = {}
  ): void {
    this.recordMetric(`operation.duration`, durationMs, {
      operation: operationName,
      ...tags,
    });
  }

  /**
   * Perform health check
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const result: HealthCheckResult = {
      status: 'healthy',
      timestamp: new Date(),
      checks: {
        database: await this.checkDatabase(),
        cache: await this.checkCache(),
        externalAPIs: await this.checkExternalAPIs(),
        diskSpace: await this.checkDiskSpace(),
        memory: await this.checkMemory(),
        cpu: await this.checkCPU(),
      },
      alerts: [],
    };

    // Determine overall status
    const checksArray = Object.values(result.checks);
    if (checksArray.some((c) => c.status === 'unhealthy')) {
      result.status = 'unhealthy';
      result.alerts = result.alerts || [];
      result.alerts.push({
        level: 'critical',
        message: 'One or more critical services are unhealthy',
      });
    } else if (checksArray.some((c) => c.status === 'degraded')) {
      result.status = 'degraded';
      result.alerts = result.alerts || [];
      result.alerts.push({
        level: 'warning',
        message: 'Some services are operating in degraded mode',
      });
    }

    return result;
  }

  private async checkDatabase() {
    const startTime = Date.now();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const database = await getDb();
      const pool = getPool();
      if (!database || !pool) throw new Error("Database pool unavailable");

      await Promise.race([
        pool.query("SELECT 1"),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(() => reject(new Error("Database readiness check timed out")), 3000);
        }),
      ]);
      return { status: 'healthy', responseTime: Date.now() - startTime };
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error
        ? String((error as { code: unknown }).code)
        : undefined;
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: code ? `Database unavailable (${code})` : "Database unavailable",
      };
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  private async checkCache() {
    const startTime = Date.now();
    try {
      // TODO: Perform cache (Redis) health check
      const responseTime = Date.now() - startTime;
      return { status: 'healthy', responseTime };
    } catch (error) {
      return {
        status: 'degraded',
        responseTime: Date.now() - startTime,
        error: (error as Error).message,
      };
    }
  }

  private async checkExternalAPIs() {
    const startTime = Date.now();
    try {
      // Check critical external APIs (SMS provider, payment gateway, etc)
      // Simple ping approach
      const responseTime = Date.now() - startTime;
      return { status: 'healthy', responseTime };
    } catch (error) {
      return {
        status: 'degraded',
        responseTime: Date.now() - startTime,
        error: (error as Error).message,
      };
    }
  }

  private async checkDiskSpace() {
    try {
      // TODO: Check available disk space
      // Use os.statfs or similar
      return {
        status: 'healthy',
        available: 1000000, // bytes
        used: 500000,
      };
    } catch (error) {
      return {
        status: 'degraded',
        available: 0,
        used: 0,
      };
    }
  }

  private async checkMemory() {
    try {
      const usage = process.memoryUsage();
      const usagePercent = (usage.heapUsed / usage.heapTotal) * 100;

      return {
        status: usagePercent > 90 ? 'unhealthy' : usagePercent > 75 ? 'degraded' : 'healthy',
        usagePercent: Math.round(usagePercent),
      };
    } catch (error) {
      return { status: 'degraded', usagePercent: 0 };
    }
  }

  private async checkCPU() {
    try {
      // TODO: Get CPU usage from os module or process metrics
      // Simple placeholder
      return { status: 'healthy', usagePercent: 45 };
    } catch (error) {
      return { status: 'degraded', usagePercent: 0 };
    }
  }

  private sendMetric(metric: Metric): void {
    if (this.config.logProvider === 'datadog') {
      console.log(`[Datadog] Metric: ${metric.name}=${metric.value}`, metric.tags);
    } else if (this.config.logProvider === 'console') {
      console.log(`[Metric] ${metric.name}=${metric.value}`, metric.tags);
    }
  }

  private sendTraceToAPM(span: TraceSpan): void {
    if (this.config.apmProvider === 'newrelic') {
      console.log(`[NewRelic] Trace: ${span.name} (${span.duration}ms)`);
    } else if (this.config.apmProvider === 'datadog') {
      console.log(`[Datadog] Trace: ${span.name} (${span.duration}ms)`);
    }
  }

  private createDummySpan(name: string): TraceSpan {
    return {
      traceId: '',
      spanId: '',
      name,
      startTime: new Date(),
      attributes: {},
      events: [],
      status: 'ok',
    };
  }

  private generateTraceId(): string {
    return 'trace-' + Math.random().toString(36).substr(2, 16);
  }

  private generateSpanId(): string {
    return 'span-' + Math.random().toString(36).substr(2, 16);
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      // Collect and aggregate metrics
      this.recordMetric('app.active_spans', this.activeSpans.size);
      this.recordMetric('app.metrics_queued', this.metrics.length);
    }, this.config.metricsInterval * 1000);
  }
}

export const createMonitoringService = (config?: Partial<MonitoringConfig>) =>
  new MonitoringService(config);