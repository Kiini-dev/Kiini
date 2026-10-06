/**
 * Security middleware and utilities
 * Provides rate limiting, CSRF protection, input sanitization
 */

import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./context";

// Rate limiting stores (in-memory, should use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const csrfTokens = new Set<string>();

/**
 * Rate limiting middleware
 * Limits requests per user/IP
 */
export function createRateLimitMiddleware(
  windowMs: number = 60000, // 1 minute
  maxRequests: number = 100
) {
  return async (opts: any) => {
    const { ctx, next } = opts;
    const key = `rate_limit:${ctx.user?.id || ctx.ip || 'anonymous'}`;
    const now = Date.now();

    let record = rateLimitStore.get(key);

    if (!record || record.resetTime < now) {
      record = { count: 0, resetTime: now + windowMs };
      rateLimitStore.set(key, record);
    }

    record.count++;

    if (record.count > maxRequests) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Rate limited. Max ${maxRequests} requests per ${windowMs / 1000}s`,
      });
    }

    return next({ ctx });
  };
}

/**
 * Input sanitization for string values
 * Removes potentially malicious content
 */
export function sanitizeInput(input: unknown): unknown {
  if (typeof input === "string") {
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, "")
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .trim();
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeInput(item));
  }

  if (input !== null && typeof input === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
}

/**
 * Validate and sanitize input data
 */
export function validateAndSanitize<T extends Record<string, any>>(
  data: T,
  schema?: Record<string, (val: any) => boolean>
): T {
  const sanitized = sanitizeInput(data) as T;

  if (schema) {
    for (const [field, validator] of Object.entries(schema)) {
      if (field in sanitized && !validator(sanitized[field])) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Validation failed for field: ${field}`,
        });
      }
    }
  }

  return sanitized;
}

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  csrfTokens.add(token);
  return token;
}

/**
 * Verify a CSRF token
 */
export function verifyCSRFToken(token: string): boolean {
  const isValid = csrfTokens.has(token);
  if (isValid) {
    csrfTokens.delete(token);
  }
  return isValid;
}

/**
 * Password validation rules
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push("Password must be at least 12 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Account lockout logic
 * Tracks failed login attempts
 */
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

export function recordFailedLogin(identifier: string): void {
  const key = `login_attempt:${identifier}`;
  let record = loginAttempts.get(key);

  if (!record) {
    record = { count: 0, lockedUntil: 0 };
    loginAttempts.set(key, record);
  }

  record.count++;

  // Lock account after 5 failed attempts for 15 minutes
  if (record.count >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000;
  }
}

export function isAccountLocked(identifier: string): boolean {
  const key = `login_attempt:${identifier}`;
  const record = loginAttempts.get(key);

  if (!record) return false;

  if (record.lockedUntil < Date.now()) {
    loginAttempts.delete(key);
    return false;
  }

  return record.lockedUntil > Date.now();
}

export function resetLoginAttempts(identifier: string): void {
  const key = `login_attempt:${identifier}`;
  loginAttempts.delete(key);
}

/**
 * IP whitelist validation
 */
const ipWhitelist = new Set<string>(process.env.IP_WHITELIST?.split(",") || []);

export function isIPWhitelisted(ip: string): boolean {
  if (ipWhitelist.size === 0) return true; // No whitelist = allow all
  return ipWhitelist.has(ip);
}

/**
 * Audit logging
 */
export interface AuditLog {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, any>;
  ip: string;
  timestamp: Date;
  status: "success" | "failure";
  details?: string;
}

const auditLogs: AuditLog[] = [];

export function logAudit(log: AuditLog): void {
  auditLogs.push(log);
  
  // In production, write to database
  console.log("[AUDIT]", JSON.stringify(log));
}

export function getAuditLogs(filters?: {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
}): AuditLog[] {
  return auditLogs.filter((log) => {
    if (filters?.userId && log.userId !== filters.userId) return false;
    if (filters?.action && log.action !== filters.action) return false;
    if (filters?.resource && log.resource !== filters.resource) return false;
    if (filters?.startDate && log.timestamp < filters.startDate) return false;
    if (filters?.endDate && log.timestamp > filters.endDate) return false;
    return true;
  });
}
