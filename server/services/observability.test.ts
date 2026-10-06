import { describe, expect, it, vi } from "vitest";
import { AppObservability, getObservabilityAlertEmail } from "./observability";

describe("AppObservability", () => {
  it("sends system alerts to the configured log mailbox by default", () => {
    vi.stubEnv("OBSERVABILITY_ALERT_EMAIL", "");
    expect(getObservabilityAlertEmail()).toBe("logs@kiini.africa");
    vi.unstubAllEnvs();
  });

  it("records request usage, response rates, and normalized routes", () => {
    const monitor = new AppObservability(vi.fn().mockResolvedValue(undefined), () => 1_800_000);
    monitor.requestStarted();
    monitor.recordRequest({
      requestId: "req-1",
      method: "GET",
      path: "/api/users/12345678-1234-1234-1234-123456789abc?secret=value",
      statusCode: 200,
      durationMs: 32,
    });
    monitor.recordRequest({
      requestId: "req-2",
      method: "GET",
      path: "/api/users/98765432-1234-1234-1234-123456789abc",
      statusCode: 503,
      durationMs: 68,
      errorMessage: "Failed query: SELECT * FROM users WHERE id='private'",
    });

    const metrics = monitor.getMetrics("1h");
    expect(metrics.requests).toBe(2);
    expect(metrics.serverErrors).toBe(1);
    expect(metrics.statusCounts).toEqual({ "2xx": 1, "5xx": 1 });
    expect(metrics.topRoutes[0].route).toBe("GET /api/users/:id");
    expect(monitor.getRecentEvents()[0].message).not.toContain("private");
  });

  it("sends an immediate, deduplicated critical alert for server failures", () => {
    const sendAlert = vi.fn().mockResolvedValue(undefined);
    const monitor = new AppObservability(sendAlert, () => 7_200_000);
    const failure = {
      requestId: "req-1",
      method: "POST",
      path: "/api/trpc/invoices.create",
      statusCode: 500,
      durationMs: 20,
      errorMessage: "Database password=should-not-leak",
    };

    monitor.recordRequest(failure);
    monitor.recordRequest({ ...failure, requestId: "req-2" });

    expect(sendAlert).toHaveBeenCalledTimes(1);
    expect(sendAlert.mock.calls[0][0].severity).toBe("critical");
    expect(sendAlert.mock.calls[0][0].message).not.toContain("should-not-leak");
  });

  it("alerts on rate limiting and tracks 429 usage", () => {
    const sendAlert = vi.fn().mockResolvedValue(undefined);
    const monitor = new AppObservability(sendAlert, () => 10_800_000);

    monitor.recordRateLimit("POST", "/api/trpc/auth.login", "req-429");
    monitor.recordRequest({
      requestId: "req-429",
      method: "POST",
      path: "/api/trpc/auth.login",
      statusCode: 429,
      durationMs: 4,
    });

    expect(sendAlert).toHaveBeenCalledTimes(1);
    expect(sendAlert.mock.calls[0][0].severity).toBe("warning");
    expect(monitor.getMetrics().rateLimited).toBe(1);
  });

  it("redacts email addresses and identifiers from recorded paths", () => {
    const monitor = new AppObservability(vi.fn().mockResolvedValue(undefined), () => 14_400_000);
    monitor.recordRequest({
      requestId: "req-1",
      method: "GET",
      path: "/api/users/alice%40example.com/12345678-1234-1234-1234-123456789abc",
      statusCode: 404,
      durationMs: 3,
    });

    expect(monitor.getMetrics().topRoutes[0].route).toBe("GET /api/users/:id/:id");
    expect(JSON.stringify(monitor.getMetrics())).not.toContain("alice");
  });
});