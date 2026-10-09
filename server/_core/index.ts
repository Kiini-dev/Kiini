import express from "express";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import rateLimit from "express-rate-limit";
import sanitizeHtml from "sanitize-html";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { sseHandler } from "../sse";
import { setupPaymentWebhooks } from "../lib/paymentWebhooks";
import { serveStatic, setupVite } from "./vite";
import { getSwaggerUIHtml, getReDocHtml } from "../lib/openapi/swagger";
import { generateOpenAPISpec } from "../lib/openapi/generator";
import * as path from "path";
import * as fs from "fs";
import { initializeScheduledJobs } from "../jobs/invoiceReminders";
import { initializeBillingCronJobs } from "../jobs/orgBillingCrons";
import { initializeHRAutomationJobs } from "../jobs/hrAutomationJobs";
import { initializePayrollJobs } from "../jobs/payrollJobs";
import { initializeP9Jobs } from "../jobs/p9Jobs";
import { initializeSchedulers } from "./scheduler";
import {
  initializeHRAutomationRuleSchedules,
  stopHRAutomationRuleSchedules,
} from "../routers/hrAutomation";
import { appObservability, observabilityMiddleware } from "../services/observability";
import customFieldsRouter from "../routers/customFields";
import { unsubscribeMarketingToken } from "../services/emailMarketing";
import { getSignedDocumentPdfForToken } from "../routers/eSignatures";

const sessionTimeoutCache = new Map<string, { minutes: number; checkedAt: number }>();
const SESSION_TIMEOUT_CACHE_TTL = 30_000;

async function getSessionTimeoutMinutes(organizationId?: string): Promise<number> {
  const cacheKey = organizationId || "global";
  const cached = sessionTimeoutCache.get(cacheKey);
  if (cached && Date.now() - cached.checkedAt < SESSION_TIMEOUT_CACHE_TTL) return cached.minutes;

  let minutes = 30;
  try {
    const database = await (await import("../db")).getDb();
    if (database) {
      const { settings } = await import("../../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");
      const rows = await database.select().from(settings).where(and(
        eq(settings.category, "security"),
        eq(settings.key, "session_timeout")
      )).limit(1);
      const configured = Number(rows[0]?.value);
      if (Number.isFinite(configured)) minutes = configured;
    }
  } catch (error) {
    console.warn("[AUTH] Could not load session timeout setting:", error);
  }

  minutes = Math.min(24 * 60, Math.max(1, Math.floor(minutes)));
  sessionTimeoutCache.set(cacheKey, { minutes, checkedAt: Date.now() });
  return minutes;
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

function withStartupTimeout<T>(operation: Promise<T>, label: string, timeoutMs = 10000): Promise<T | undefined> {
  return Promise.race([
    operation,
    new Promise<undefined>((resolve) => {
      setTimeout(() => {
        console.warn(`[STARTUP] ${label} timed out after ${timeoutMs}ms; continuing server startup`);
        resolve(undefined);
      }, timeoutMs);
    }),
  ]);
}

async function startServer() {
  const app = express();
  app.set("trust proxy", 1);
  const server = createServer(app);

  const nodeEnv = process.env.NODE_ENV || "production";
  const port = parseInt(process.env.PORT || "3000", 10);

  app.use(observabilityMiddleware);

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, () => {
      console.log(`[STARTUP] NODE_ENV=${nodeEnv}, PORT=${port}`);
      console.log(`Server running on http://localhost:${port}/`);
      resolve();
    });
  });

  // security & parsing middleware
  app.use(cookieParser());

  // Configure body parser with larger size limit for file uploads BEFORE CSRF
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // CORS configuration - allow all origins for development/internal use
  // In production, restrict to known origins
  app.use((req, res, next) => {
    const origin = req.get("origin");
    // Allow localhost, 127.0.0.1, and any local development domains
    const allowedOrigins = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost",
      "http://127.0.0.1",
    ];
    
    // For development, allow all origins; for production, use allowedOrigins
    if (process.env.NODE_ENV === "development" || allowedOrigins.includes(origin || "")) {
      res.setHeader("Access-Control-Allow-Origin", origin || "*");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-API-Key");
      res.setHeader("Access-Control-Max-Age", "86400");
    }
    
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Configure rate limiting - much more permissive for internal CRM usage
  // Production environments should use per-user rate limiting instead of per-IP
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5000, // Increased from 500 to 5000 per 15 min (much more reasonable for CRM)
      standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
      legacyHeaders: false, // Disable `X-RateLimit-*` headers
      skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === "/health" || req.path === "/api/health";
      },
      handler: (req, res) => {
        appObservability.recordRateLimit(
          req.method,
          req.path,
          String(res.locals.observabilityRequestId || "unknown"),
        );
        // Return proper JSON response instead of HTML
        res.status(429).json({
          error: {
            code: "TOO_MANY_REQUESTS",
            message: "Too many requests, please try again later",
            retryAfter: req.rateLimit?.resetTime ? Math.ceil((Number(req.rateLimit.resetTime) - Date.now()) / 1000) : 60,
          },
        });
      },
    })
  );

  // CSRF protection - disable completely for JSON APIs
  // The application uses JWT token authentication for APIs, not session cookies
  // CSRF tokens are only useful against cross-site form attacks, not for API requests
  // Therefore, disable CSRF middleware entirely since all tRPC requests are JSON-based
  
  console.log(`[STARTUP] CSRF protection: DISABLED (using JWT token auth for APIs)`);

  // request sanitization helper (to be used selectively)
  app.use((req, res, next) => {
    // sanitize all string query params
    for (const key in req.query) {
      if (typeof req.query[key] === "string") {
        req.query[key] = sanitizeHtml(req.query[key] as string, { allowedTags: [], allowedAttributes: {} });
      }
    }
    next();
  });
  
  // Set a proper Content-Security-Policy header to allow the app to function
  app.use((req, res, next) => {
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; " +
      "style-src 'self' 'unsafe-inline' https:; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data: https:; " +
      "connect-src 'self' https: http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:* wss://localhost:* wss://127.0.0.1:*; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self';"
    );
    next();
  });
  // OAuth callback under /api/oauth/callback

  // Session inactivity timeout is configured by administrators in security settings.
  app.use(async (req, res, next) => {
    if (req.session && req.session.user) {
      const now = Date.now();
      const last = req.session.lastActivity || now;
      const timeoutMinutes = await getSessionTimeoutMinutes(req.session.user.organizationId);
      if (now - last > timeoutMinutes * 60 * 1000) {
        // clear session/user; actual mechanism depends on auth implementation
        delete req.session.user;
        return res.status(440).send({ message: "Logged out due to inactivity" });
      }
      req.session.lastActivity = now;
    }
    next();
  });
  
  // Setup payment webhooks (Stripe & M-Pesa) - MUST be before tRPC middleware and JSON parser
  setupPaymentWebhooks(app);

  // Real-time SSE notifications endpoint (before tRPC)
  app.get("/api/sse/notifications", sseHandler);

  // Serve uploaded documents
  const uploadDir = process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  app.use("/uploads", express.static(uploadDir));

  // ============= API DOCUMENTATION =============
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/email/unsubscribe/:token", async (req, res, next) => {
    try {
      await unsubscribeMarketingToken(req.params.token);
      res.status(200).type("html").send(
        "<!doctype html><html><head><meta charset=\"utf-8\"><title>Email preferences</title></head><body><main><h1>Email preferences updated</h1><p>This address will no longer receive marketing emails.</p></main></body></html>",
      );
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/esignatures/:token/signed-document.pdf", async (req, res) => {
    try {
      const { filename, pdf } = await getSignedDocumentPdfForToken(req.params.token);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.setHeader("Cache-Control", "private, no-store");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.send(pdf);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not retrieve the signed document";
      const notReady = /not available|not fully completed/i.test(message);
      if (!notReady) console.error("[ESignatures] Signed document download failed", error);
      res.status(notReady ? 404 : 500).type("text").send(notReady ? "Signed document not found" : "Could not generate the signed PDF");
    }
  });

  // OpenAPI specification endpoint
  app.get("/api/openapi.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.json(generateOpenAPISpec());
  });

  // Versioned ERP integration API. Events are persisted and delivered by the
  // scheduled integration worker; this endpoint never calls providers inline.
  app.post("/api/v1/erp/events", async (req, res) => {
    const configuredKey = process.env.ERP_API_KEY;
    const suppliedKey = req.get("x-api-key") || req.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!configuredKey || suppliedKey !== configuredKey) return res.status(401).json({ error: "Unauthorized" });
    const { provider, eventType, organizationId, payload, idempotencyKey } = req.body || {};
    if (!provider || !eventType || !organizationId || !payload || typeof payload !== "object") return res.status(400).json({ error: "provider, eventType, organizationId and object payload are required" });
    try {
      const { getPool } = await import("../db");
      const { v4: uuid } = await import("uuid");
      const pool = getPool();
      if (!pool) return res.status(503).json({ error: "Database unavailable" });
      const eventId = `event_${uuid()}`;
      await pool.query("INSERT INTO integration_events (id,organizationId,provider,eventType,payload,idempotencyKey) VALUES (?,?,?,?,?,?)", [eventId, organizationId, provider, eventType, JSON.stringify(payload), idempotencyKey || null]);
      return res.status(202).json({ id: eventId, status: "pending" });
    } catch (error: any) {
      if (error?.code === "ER_DUP_ENTRY") return res.status(202).json({ status: "duplicate", idempotencyKey });
      return res.status(500).json({ error: "Could not enqueue ERP event" });
    }
  });

  app.get("/api/v1/erp/connectors/health", async (req, res) => {
    const configuredKey = process.env.ERP_API_KEY;
    const suppliedKey = req.get("x-api-key") || req.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!configuredKey || suppliedKey !== configuredKey) return res.status(401).json({ error: "Unauthorized" });
    try {
      const { getPool } = await import("../db");
      const pool = getPool();
      if (!pool) return res.status(503).json({ status: "unavailable" });
      const [rows] = await pool.query("SELECT status,COUNT(*) count FROM integration_events GROUP BY status");
      return res.json({ status: "ok", version: "v1", events: rows });
    } catch { return res.status(503).json({ status: "unavailable" }); }
  });

  // Swagger UI documentation
  app.get("/api/docs", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send(getSwaggerUIHtml());
  });

  // ReDoc documentation (alternative UI)
  app.get("/api/docs/redoc", (req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.send(getReDocHtml());
  });

  // ============= END API DOCUMENTATION =============

  
  // Error logging middleware for API requests
  app.use("/api", (req, res, next) => {
    // Keep stalled API calls JSON-compatible instead of allowing the hosting
    // proxy to replace them with an HTML timeout page.
    res.setTimeout(15000, () => {
      if (!res.headersSent) {
        res.status(504).json({
          error: {
            json: {
              code: -32003,
              message: "The API request timed out while contacting the database.",
              data: {
                code: "TIMEOUT",
                httpStatus: 504,
                path: req.path,
              },
            },
          },
        });
      }
    });

    const originalJson = res.json;
    res.json = function(data) {
      if (res.statusCode >= 500) {
        res.locals.observabilityErrorMessage =
          data?.error?.json?.message || data?.error?.message || data?.message || "API request failed";
      }
      if (data?.code || res.statusCode >= 400) {
        console.log(`[API ${req.method}] ${req.path} - Status: ${res.statusCode}`, data);
      }
      return originalJson.call(this, data);
    };
    next();
  });

  app.use("/api/customFields", customFieldsRouter);
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Global error handler middleware - catches all unhandled errors
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.locals.observabilityErrorMessage = err?.message || "Unhandled request error";
    console.error("[Error Handler]", err);
    
    // Don't override the status code if it's already been set
    if (!res.headersSent) {
      const statusCode = err.statusCode || err.status || 500;
      const message = err.message || "Internal Server Error";
      
      // Always return JSON for API requests
      if (req.path.startsWith("/api")) {
        res.status(statusCode).json({
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: message,
            ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
          },
        });
      } else {
        // For non-API routes, return HTML error page
        res.status(statusCode).send(`
          <!DOCTYPE html>
          <html>
            <head><title>Error ${statusCode}</title></head>
            <body>
              <h1>Error ${statusCode}</h1>
              <p>${message}</p>
            </body>
          </html>
        `);
      }
    }
  });
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Register the HTTP routes before slow database and scheduler initialization.
  // Passenger can serve the shell and API requests while these tasks warm up.
  // Default-user seeding is an explicit deployment task. Running it during
  // startup competes with the first API requests for the database pool.
  console.log("[STARTUP] Skipping default-user seed during request-serving startup");
  console.log("[EMAIL] Seeding default email templates...");
  const { execFile } = await import("node:child_process");
  await withStartupTimeout(new Promise<void>((resolve) => {
    execFile("node", ["scripts/seed-email-templates.mjs"], { cwd: process.cwd() }, (error) => {
      if (error) console.warn("[EMAIL] Default template seed skipped:", error.message);
      resolve();
    });
  }), "Email template seeding");

  console.log("[SCHEDULER] Initializing scheduled jobs...");
  const backgroundJobs = initializeSchedulers();
  initializeScheduledJobs();
  const { initializeScheduler, initializeBackupScheduler } = await import("../services/jobScheduler");
  await withStartupTimeout(initializeScheduler(), "Job scheduler initialization");
  await withStartupTimeout(initializeBackupScheduler(), "Backup schedule initialization");

  console.log("[BILLING] Initializing organization billing cron jobs...");
  initializeBillingCronJobs();
  console.log("[HR] Initializing HR automation jobs...");
  const hrAutomationJobs = initializeHRAutomationJobs();
  await withStartupTimeout(initializeHRAutomationRuleSchedules(), "HR automation rule scheduler initialization");
  console.log("[PAYROLL] Initializing monthly payroll and payslip jobs...");
  const { payrollProcessingJob, payslipDispatchJob } = initializePayrollJobs();
  console.log("[P9] Initializing annual P9 generation job...");
  const { p9GenerationJob } = initializeP9Jobs();
  const stopPayrollJobs = () => {
    Object.values(backgroundJobs).forEach((job) => job.stop());
    hrAutomationJobs.forEach((job) => job.stop());
    stopHRAutomationRuleSchedules();
    payrollProcessingJob.stop();
    payslipDispatchJob.stop();
    p9GenerationJob.stop();
  };
  process.once("SIGTERM", stopPayrollJobs);
  process.once("SIGINT", stopPayrollJobs);

}

startServer().catch(console.error);
