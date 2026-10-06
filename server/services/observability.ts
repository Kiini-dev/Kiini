import { randomUUID } from "node:crypto";
import nodemailer from "nodemailer";
import type { NextFunction, Request, Response } from "express";

const MINUTE_MS = 60_000;
const RETENTION_MS = 24 * 60 * 60_000;
const MAX_EVENTS = 300;
const MAX_ROUTES = 100;
const ALERT_COOLDOWN_MS = 5 * 60_000;

export type ObservabilityEvent = {
  id: string;
  timestamp: string;
  type: "server_error" | "rate_limit" | "uncaught_exception";
  severity: "warning" | "critical";
  message: string;
  method?: string;
  path?: string;
  statusCode?: number;
  requestId?: string;
  durationMs?: number;
};

type RouteBucket = { requests: number; serverErrors: number; totalDurationMs: number };
type MinuteBucket = {
  timestamp: number;
  requests: number;
  clientErrors: number;
  serverErrors: number;
  rateLimited: number;
  totalDurationMs: number;
  statuses: Record<string, number>;
  routes: Map<string, RouteBucket>;
};

type RequestObservation = {
  requestId: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  errorMessage?: string;
};

function normalizePath(path: string): string {
  const safePath = path.split("?")[0].split("/").map((segment) => {
    if (!segment || segment.startsWith(":") || segment === "*") return segment;
    if (/@|%40/i.test(segment) || /^\d+$/.test(segment) || /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(segment)) return ":id";
    return segment.slice(0, 80);
  }).join("/");
  return safePath.slice(0, 160) || "/";
}

function safeMessage(message: unknown): string {
  let value = message instanceof Error ? message.message : String(message ?? "Unknown error");
  value = value.split(/(?:Failed query:|SQL:)/i)[0];
  value = value
    .replace(/\bBearer\s+\S+/gi, "Bearer [REDACTED]")
    .replace(/(password|token|secret|api[_-]?key|authorization|cookie)\s*[:=]\s*([^\s,;]+)/gi, "$1=[REDACTED]")
    .replace(/\b[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}\b/gi, "[ID]")
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[EMAIL]")
    .replace(/\s+/g, " ")
    .trim();
  return (value || "Database or server operation failed").slice(0, 500);
}

export function getObservabilityAlertEmail(): string {
  return process.env.OBSERVABILITY_ALERT_EMAIL?.trim() || "logs@kiini.africa";
}

async function sendAdminAlert(event: ObservabilityEvent): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
  const fromAddress = process.env.SMTP_FROM_EMAIL || user;
  if (!host || !port || !fromAddress) {
    if (!warnedMissingSmtp) {
      warnedMissingSmtp = true;
      console.error("[OBSERVABILITY] Email alerts disabled: SMTP_HOST, SMTP_PORT, and SMTP_FROM_EMAIL/SMTP_USER are required");
    }
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    auth: user && password ? { user, pass: password } : undefined,
  });
  const recipient = getObservabilityAlertEmail();
  const subject = `[Kiini ${event.severity}] ${event.statusCode ?? event.type} ${event.method ?? ""} ${event.path ?? ""}`.trim();
  const lines = [
    `Type: ${event.type}`,
    `Severity: ${event.severity}`,
    `Time: ${event.timestamp}`,
    event.method ? `Request: ${event.method} ${event.path}` : undefined,
    event.statusCode ? `HTTP status: ${event.statusCode}` : undefined,
    event.durationMs !== undefined ? `Duration: ${event.durationMs}ms` : undefined,
    event.requestId ? `Request ID: ${event.requestId}` : undefined,
    `Summary: ${event.message}`,
    "",
    "This alert contains no request body, cookies, or authorization headers.",
  ].filter(Boolean);

  await transporter.sendMail({
    from: `Kiini Monitoring <${fromAddress}>`,
    to: recipient,
    subject,
    text: lines.join("\n"),
  });
}

let warnedMissingSmtp = false;

export class AppObservability {
  private buckets = new Map<number, MinuteBucket>();
  private events: ObservabilityEvent[] = [];
  private lastAlerts = new Map<string, number>();
  private activeRequests = 0;

  constructor(
    private readonly alertSender: (event: ObservabilityEvent) => Promise<void> = sendAdminAlert,
    private readonly now: () => number = Date.now,
  ) {}

  private currentBucket(): MinuteBucket {
    const now = this.now();
    const timestamp = now - (now % MINUTE_MS);
    let bucket = this.buckets.get(timestamp);
    if (!bucket) {
      bucket = {
        timestamp,
        requests: 0,
        clientErrors: 0,
        serverErrors: 0,
        rateLimited: 0,
        totalDurationMs: 0,
        statuses: {},
        routes: new Map(),
      };
      this.buckets.set(timestamp, bucket);
    }
    for (const key of this.buckets.keys()) {
      if (key < now - RETENTION_MS) this.buckets.delete(key);
    }
    return bucket;
  }

  private addEvent(event: Omit<ObservabilityEvent, "id" | "timestamp">, fingerprint: string): Promise<void> {
    const now = this.now();
    const complete: ObservabilityEvent = {
      ...event,
      id: randomUUID(),
      timestamp: new Date(now).toISOString(),
    };
    this.events.unshift(complete);
    if (this.events.length > MAX_EVENTS) this.events.length = MAX_EVENTS;

    console.error(JSON.stringify({ source: "kiini-observability", ...complete }));
    const lastSent = this.lastAlerts.get(fingerprint) ?? 0;
    if (now - lastSent < ALERT_COOLDOWN_MS) return Promise.resolve();
    this.lastAlerts.set(fingerprint, now);
    for (const [key, sentAt] of this.lastAlerts) {
      if (now - sentAt > RETENTION_MS) this.lastAlerts.delete(key);
    }
    return this.alertSender(complete).catch((error) => {
      console.error("[OBSERVABILITY] Could not deliver admin alert:", safeMessage(error));
    });
  }

  recordRequest(observation: RequestObservation): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    const bucket = this.currentBucket();
    const path = normalizePath(observation.path);
    const method = observation.method.toUpperCase().slice(0, 12);
    const statusClass = `${Math.floor(observation.statusCode / 100)}xx`;
    bucket.requests++;
    bucket.totalDurationMs += Math.max(0, observation.durationMs);
    bucket.statuses[statusClass] = (bucket.statuses[statusClass] ?? 0) + 1;
    if (observation.statusCode >= 400 && observation.statusCode < 500) bucket.clientErrors++;
    if (observation.statusCode >= 500) bucket.serverErrors++;
    if (observation.statusCode === 429) bucket.rateLimited++;

    const routeKey = `${method} ${path}`;
    let route = bucket.routes.get(routeKey);
    if (!route && bucket.routes.size >= MAX_ROUTES) {
      const oldestRoute = bucket.routes.keys().next().value;
      if (oldestRoute) bucket.routes.delete(oldestRoute);
    }
    route = bucket.routes.get(routeKey) ?? { requests: 0, serverErrors: 0, totalDurationMs: 0 };
    route.requests++;
    route.totalDurationMs += Math.max(0, observation.durationMs);
    if (observation.statusCode >= 500) route.serverErrors++;
    bucket.routes.set(routeKey, route);

    if (observation.statusCode >= 500) {
      const message = safeMessage(observation.errorMessage || `HTTP ${observation.statusCode} response`);
      void this.addEvent({
        type: "server_error",
        severity: "critical",
        message,
        method,
        path,
        statusCode: observation.statusCode,
        requestId: observation.requestId,
        durationMs: observation.durationMs,
      }, `server_error:${method}:${path}:${observation.statusCode}:${message}`);
    }
  }

  requestStarted(): string {
    this.activeRequests++;
    return randomUUID();
  }

  recordRateLimit(method: string, path: string, requestId: string): void {
    const safePath = normalizePath(path);
    void this.addEvent({
      type: "rate_limit",
      severity: "warning",
      message: "The API request limit was exceeded",
      method: method.toUpperCase().slice(0, 12),
      path: safePath,
      statusCode: 429,
      requestId,
    }, `rate_limit:${method}:${safePath}`);
  }

  recordUncaughtException(error: unknown): Promise<void> {
    const message = safeMessage(error);
    return this.addEvent({
      type: "uncaught_exception",
      severity: "critical",
      message,
    }, `uncaught_exception:${message}`);
  }

  getMetrics(period: "1h" | "24h" = "1h") {
    const now = this.now();
    const windowMs = period === "24h" ? RETENTION_MS : 60 * MINUTE_MS;
    const rows = [...this.buckets.values()].filter((bucket) => bucket.timestamp >= now - windowMs);
    const totals = rows.reduce((sum, bucket) => ({
      requests: sum.requests + bucket.requests,
      clientErrors: sum.clientErrors + bucket.clientErrors,
      serverErrors: sum.serverErrors + bucket.serverErrors,
      rateLimited: sum.rateLimited + bucket.rateLimited,
      durationMs: sum.durationMs + bucket.totalDurationMs,
    }), { requests: 0, clientErrors: 0, serverErrors: 0, rateLimited: 0, durationMs: 0 });
    const routeTotals = new Map<string, RouteBucket>();
    for (const bucket of rows) {
      for (const [path, route] of bucket.routes) {
        const total = routeTotals.get(path) ?? { requests: 0, serverErrors: 0, totalDurationMs: 0 };
        total.requests += route.requests;
        total.serverErrors += route.serverErrors;
        total.totalDurationMs += route.totalDurationMs;
        routeTotals.set(path, total);
      }
    }
    const minutes = Math.max(1, Math.ceil(windowMs / MINUTE_MS));
    const statusCounts: Record<string, number> = {};
    for (const bucket of rows) {
      for (const [status, count] of Object.entries(bucket.statuses)) {
        statusCounts[status] = (statusCounts[status] ?? 0) + count;
      }
    }

    return {
      period,
      requests: totals.requests,
      requestsPerMinute: Math.round(totals.requests / minutes * 100) / 100,
      averageResponseTime: totals.requests ? Math.round(totals.durationMs / totals.requests) : 0,
      errorRate: totals.requests ? Math.round(totals.serverErrors / totals.requests * 100 * 100) / 100 : 0,
      clientErrors: totals.clientErrors,
      serverErrors: totals.serverErrors,
      rateLimited: totals.rateLimited,
      statusCounts,
      activeConnections: this.activeRequests,
      topRoutes: [...routeTotals.entries()]
        .map(([route, values]) => ({
          route,
          requests: values.requests,
          serverErrors: values.serverErrors,
          averageResponseTime: values.requests ? Math.round(values.totalDurationMs / values.requests) : 0,
        }))
        .sort((a, b) => b.requests - a.requests)
        .slice(0, 10),
      timestamp: new Date(now).toISOString(),
    };
  }

  getRecentEvents(limit = 20): ObservabilityEvent[] {
    return this.events.slice(0, Math.max(1, Math.min(100, limit)));
  }

  getEventCounts24h() {
    const cutoff = this.now() - RETENTION_MS;
    const buckets = [...this.buckets.values()].filter((bucket) => bucket.timestamp >= cutoff);
    return {
      serverErrors: buckets.reduce((sum, bucket) => sum + bucket.serverErrors, 0),
      clientErrors: buckets.reduce((sum, bucket) => sum + bucket.clientErrors, 0),
      rateLimited: buckets.reduce((sum, bucket) => sum + bucket.rateLimited, 0),
    };
  }
}

export const appObservability = new AppObservability();

export function observabilityMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.path.startsWith("/api/")) {
    next();
    return;
  }
  const requestId = appObservability.requestStarted();
  const startedAt = Date.now();
  res.locals.observabilityRequestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  res.once("finish", () => {
    appObservability.recordRequest({
      requestId,
      method: req.method,
      path: req.route?.path ? `${req.baseUrl}${req.route.path}` : req.path,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
      errorMessage: res.locals.observabilityErrorMessage,
    });
  });
  next();
}

process.on("uncaughtException", (error) => {
  process.exitCode = 1;
  const forceExit = setTimeout(() => process.exit(1), 12_000);
  void appObservability.recordUncaughtException(error).finally(() => {
    clearTimeout(forceExit);
    process.exit(1);
  });
});