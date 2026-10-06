import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { optionalEmail } from "../utils/validation";
import { SignJWT, jwtVerify } from "jose";
import * as bcrypt from "bcryptjs";
import { generateSecret, verify } from "otplib";
import QRCode from "qrcode";
import { createHash, randomInt } from "crypto";
import type { Request } from "express";
import { v4 } from "uuid";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { createFeatureRestrictedProcedure } from "../middleware/enhancedRbac";
import { getSessionCookieOptions } from "../_core/cookies";
import { sendSystemEmail } from "../services/systemEmailService";
import { dispatchSystemAlert } from "../services/systemReportingService";
import * as db from "../db";
import { getUserByEmail, getUserById, getUserOrganizationId, updateUser as updateUserFromDbUsers } from "../db-users";
import { customRoles, employees, userPermissions } from "../../drizzle/schema";
import { and, eq } from "drizzle-orm";
import { getPool, getRawPool } from "../db";
import { DEFAULT_TIER_PRICING, getConfiguredTrialDays, parseTierPricingOverrides, resolveTierPricingEntry } from "../services/tierPricing";

// Feature-based procedures
const userEditProcedure = createFeatureRestrictedProcedure("users:edit");

function getJwtSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key");
}

function isMissingTableError(error: unknown, tableName: string): boolean {
  if (!error || typeof error !== "object") return false;
  const dbError = error as { code?: string; message?: string };
  return dbError.code === "ER_NO_SUCH_TABLE"
    && String(dbError.message || "").toLowerCase().includes(tableName.toLowerCase());
}

/**
 * Generate JWT token for local authentication
 */
async function generateJWT(userId: string, expiresIn: number = ONE_YEAR_MS) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn / 1000)
    .sign(getJwtSecret());
  return token;
}

/**
 * Verify JWT token
 */
async function verifyJWT(token: string) {
  try {
    const verified = await jwtVerify(token, getJwtSecret());
    return verified.payload as { userId: string };
  } catch (error) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid or expired token" });
  }
}

/**
 * Hash password
 */
async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify password
 */
async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

const registerInput = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company name is required"),
  urlMode: z.enum(["path", "subdomain"]).default("subdomain"),
  slug: z.string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only")
    .optional(),
}).superRefine((input, context) => {
  const slug = (input.slug || input.company).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (["admin", "app", "www"].includes(slug)) {
    context.addIssue({ code: "custom", path: ["slug"], message: "This subdomain is reserved by Kiini." });
  }
});

const loginInput = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// simple in-memory store for lockout info (non-persistent)
interface LockInfo {
  attempts: number;
  lockouts: number;
  lockedUntil?: number;
}
const lockStore: Map<string, LockInfo> = new Map();

// tests may clear or inspect the store
export function _resetLockStore() {
  lockStore.clear();
}

export const _lockStore = lockStore;
const MAX_ATTEMPTS = 5;
const REPEAT_LOCK_ATTEMPTS = 3;
const LOCK_DURATION_MS = 60 * 1000;

async function ensureEmailVerificationTable() {
  const pool = getPool();
  if (!pool) throw new Error("Database connection failed");
  const [columns] = await pool.query(
    "SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'emailVerificationRequired'",
  );
  if (Number((columns as any[])[0]?.count || 0) === 0) {
    await pool.query("ALTER TABLE users ADD COLUMN emailVerificationRequired TINYINT(1) NOT NULL DEFAULT 0");
  }

  for (const { columnName, definition } of [
    { columnName: "twoFactorEnabled", definition: "TINYINT(1) NOT NULL DEFAULT 0" },
    { columnName: "twoFactorSecret", definition: "varchar(255) NULL" },
  ]) {
    const [existingColumns] = await pool.query(
      "SELECT COUNT(*) AS count FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = ?",
      [columnName],
    );
    if (Number((existingColumns as any[])[0]?.count || 0) === 0) {
      await pool.query(`ALTER TABLE users ADD COLUMN ${columnName} ${definition}`);
    }
  }

  await pool.query(
    "UPDATE users SET emailVerificationRequired = 1 WHERE loginMethod = 'local' AND email <> 'info@kiini.africa' AND emailVerified IS NULL AND emailVerificationRequired = 0",
  );
  await pool.query(`CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id varchar(64) NOT NULL PRIMARY KEY,
    userId varchar(64) NOT NULL,
    newEmail varchar(320) NOT NULL,
    token varchar(255) NOT NULL,
    expiresAt timestamp NULL,
    verifiedAt timestamp NULL,
    createdAt timestamp DEFAULT CURRENT_TIMESTAMP,
    KEY idx_email_verify_user (userId),
    KEY idx_email_verify_token (token)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  await pool.query(`CREATE TABLE IF NOT EXISTS password_reset_otps (
    id varchar(64) NOT NULL PRIMARY KEY,
    userId varchar(64) NOT NULL,
    email varchar(320) NOT NULL,
    otpHash varchar(255) NOT NULL,
    expiresAt timestamp NULL,
    verifiedAt timestamp NULL,
    createdAt timestamp DEFAULT CURRENT_TIMESTAMP,
    KEY idx_password_reset_otp_user (userId),
    KEY idx_password_reset_otp_email (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  return pool;
}

export function buildSafeAddColumnSql(tableName: string, columnName: string, definition: string) {
  return `SELECT CASE
    WHEN (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${tableName}' AND COLUMN_NAME = '${columnName}') = 0
      THEN 1
    ELSE 0
  END AS should_add_column`;
}

function hashEmailOtp(otp: string) {
  return createHash("sha256").update(otp).digest("hex");
}

function buildTotpUri(email: string, secret: string) {
  const issuer = "Kiini: One Hub. Total Control";
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

async function generateTotpSetup(userEmail: string) {
  const secret = generateSecret({ length: 32 } as any);
  const otpauthUri = buildTotpUri(userEmail, secret);
  const qrCode = await QRCode.toDataURL(otpauthUri);
  return { secret, otpauthUri, qrCode };
}

export function shouldBlockLoginForUnverifiedUser(user: { loginMethod?: string | null; emailVerificationRequired?: number | boolean | null; emailVerified?: Date | string | null } | null | undefined): boolean {
  if (!user || user.loginMethod !== "local") return false;
  if (user.emailVerificationRequired === 0 || user.emailVerificationRequired === false) return false;
  return false;
}

export function shouldShowEmailVerificationReminder(user: { loginMethod?: string | null; emailVerificationRequired?: number | boolean | null; emailVerified?: Date | string | null } | null | undefined): boolean {
  if (!user || user.loginMethod !== "local") return false;
  if (user.emailVerificationRequired === 0 || user.emailVerificationRequired === false) return false;
  return !user.emailVerified;
}

export function resolveClientRegistrationSetting(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;
  return true;
}

export async function issueEmailVerification(userId: string, email: string, name: string) {
  const pool = await ensureEmailVerificationTable();
  const otp = String(randomInt(100000, 1000000));
  const verificationToken = await generateJWT(userId, 10 * 60 * 1000);
  const baseUrl = process.env.APP_URL || process.env.PUBLIC_APP_URL || "https://kiini.africa";
  const verificationLink = `${baseUrl.replace(/\/$/, "")}/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(verificationToken)}`;

  await pool.query("DELETE FROM email_verification_tokens WHERE userId = ? AND verifiedAt IS NULL", [userId]);
  await pool.query(
    "INSERT INTO email_verification_tokens (id, userId, newEmail, token, expiresAt) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))",
    [v4(), userId, email, hashEmailOtp(otp)]
  );
  const result = await sendSystemEmail(
    "user/account_verification",
    {
      recipientEmail: email,
      recipientName: name || email,
      recipient_first_name: name || email,
      recipient_email: email,
      app_name: "Kiini",
      verification_url: verificationLink,
      expiry_duration: "10 minutes",
    },
    {
      subject: "Verify your email for Kiini",
      html: `<p>Hello ${name || email}, verify your email: <a href="${verificationLink}">Verify email</a></p>`,
      text: `Verify your email using this link: ${verificationLink}`,
    },
  );
  if (!result.success) throw new Error(result.error || "Verification email delivery failed");
}

async function issuePasswordResetOtp(userId: string, email: string, name: string) {
  const pool = await ensureEmailVerificationTable();
  const otp = String(randomInt(100000, 1000000));
  await pool.query("DELETE FROM password_reset_otps WHERE userId = ? AND verifiedAt IS NULL", [userId]);
  await pool.query(
    "INSERT INTO password_reset_otps (id, userId, email, otpHash, expiresAt) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))",
    [v4(), userId, email, hashEmailOtp(otp)],
  );
  const result = await sendSystemEmail(
    "user/password_reset",
    {
      recipientEmail: email,
      recipientName: name || email,
      recipient_first_name: name || email,
      recipient_email: email,
      app_name: "Kiini",
      otp_code: otp,
      expiry_minutes: "10",
    },
    {
      subject: `Confirm your password reset - Kiini`,
      html: `<p>Confirm your password reset using code <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
      text: `Confirm your password reset. Your one-time code is ${otp}. It expires in 10 minutes.`,
    },
  );
  if (!result.success) throw new Error(result.error || "Password reset OTP delivery failed");
}

async function recordFailedLogin(user: any, email: string, ipAddress?: string): Promise<{ locked: boolean; resetRequired: boolean }> {
  const priorLockouts = Number(user?.lockoutCount || 0);
  const threshold = priorLockouts > 0 ? REPEAT_LOCK_ATTEMPTS : MAX_ATTEMPTS;
  const attempts = Number(user?.failedLoginAttempts || 0) + 1;
  const lockInfo = lockStore.get(email) || { attempts: 0, lockouts: priorLockouts };
  lockInfo.attempts = attempts;

  if (attempts < threshold) {
    lockStore.set(email, lockInfo);
    await updateUserFromDbUsers(user.id, { failedLoginAttempts: attempts, lockedUntil: null });
    return { locked: false, resetRequired: false };
  }

  const lockouts = priorLockouts + 1;
  const resetRequired = lockouts >= 2;
  lockInfo.attempts = 0;
  lockInfo.lockouts = lockouts;
  lockInfo.lockedUntil = Date.now() + LOCK_DURATION_MS;
  lockStore.set(email, lockInfo);
  await updateUserFromDbUsers(user.id, {
    failedLoginAttempts: 0,
    lockedUntil: new Date(lockInfo.lockedUntil),
    lockoutCount: lockouts,
  } as any);

  const baseUrl = (process.env.APP_URL || process.env.PUBLIC_APP_URL || "https://kiini.africa").replace(/\/$/, "");
  const lockedAt = new Date().toLocaleString();
  const unlockAt = new Date(lockInfo.lockedUntil).toLocaleString();
  void sendSystemEmail("user/account_locked", {
    recipientEmail: email,
    recipientName: user.name || email,
    recipient_first_name: user.name?.trim().split(/\s+/)[0] || email,
    recipient_email: email,
    organizationId: user.organizationId,
    app_name: "Kiini",
    attempt_count: attempts,
    ip_address: ipAddress || "Not available",
    locked_at: lockedAt,
    unlock_at: unlockAt,
    unlock_url: `${baseUrl}/login`,
  }, {
    subject: "Your Kiini account was temporarily locked",
    html: `<p>Your account was locked after ${attempts} unsuccessful sign-in attempts.</p>`,
    text: `Your account was locked after ${attempts} unsuccessful sign-in attempts.`,
  }).catch((error) => console.error("[Auth] Failed to send account lock notice:", error));
  void dispatchSystemAlert({
    title: "Account lockout",
    message: `Account ${email} was temporarily locked after ${attempts} unsuccessful sign-in attempts.`,
    organizationId: user.organizationId,
    category: "security_alert",
    priority: "high",
    affectedUserEmail: email,
    ipAddress,
    attemptCount: attempts,
    actionTaken: "Account temporarily locked",
  }).catch((error) => console.error("[Auth] Failed to send security alert:", error));

  if (resetRequired) {
    try {
      await issuePasswordResetOtp(user.id, email, user.name || email);
    } catch (error) {
      console.error("[Auth] Failed to send lockout password reset OTP:", error);
    }
  }

  return { locked: true, resetRequired };
}

// simple rate limit map keyed by `${ip}:${action}`
interface RateInfo { count: number; windowStart: number; }
const rateMap: Map<string, RateInfo> = new Map();

function checkRateLimit(ip: string, action: string, max: number, windowMs: number): boolean {
  const key = `${ip}:${action}`;
  const now = Date.now();
  const info = rateMap.get(key);
  if (!info || now - info.windowStart > windowMs) {
    rateMap.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (info.count >= max) {
    return false;
  }
  info.count += 1;
  return true;
}

const updateProfileInput = z.object({
  name: z.string().optional(),
  email: optionalEmail(),
});

const changePasswordInput = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const requestPasswordResetInput = z.object({
  email: z.string().email(),
});

const resetPasswordInput = z.object({
  token: z.string(),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const authRouter = router({
  /**
   * Get current user
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    console.log('[Auth.me] Called. User:', ctx.user?.email || 'NO USER');
    const effectivePermissions = new Set<string>();
    try {
      const parsePermissions = (value: unknown): string[] => {
        if (!value) return [];
        try {
          const parsed: unknown = JSON.parse(String(value));
          return Array.isArray(parsed)
            ? parsed.filter((permission): permission is string => typeof permission === "string")
            : [];
        } catch (error) {
          console.warn("[Auth.me] Ignoring malformed stored permission list:", error);
          return [];
        }
      };

      parsePermissions((ctx.user as any).permissions).forEach((permission) => effectivePermissions.add(permission));

      const permissionDb = await db.getDb();
      if (!permissionDb) {
        throw new Error("Database unavailable while resolving user permissions");
      }

      try {
        const explicitPermissions = await permissionDb
          .select({
            resource: userPermissions.resource,
            action: userPermissions.action,
            granted: userPermissions.granted,
          })
          .from(userPermissions)
          .where(eq(userPermissions.userId, ctx.user.id));
        explicitPermissions.filter((permission) => Boolean(permission.granted)).forEach(({ resource, action }) => {
          const normalizedResource = String(resource || "").trim();
          const normalizedAction = String(action || "").trim();
          if (!normalizedResource) return;
          effectivePermissions.add(normalizedResource);
          if (normalizedAction && normalizedAction !== "access") {
            effectivePermissions.add(`${normalizedResource}:${normalizedAction}`);
            effectivePermissions.add(`${normalizedResource}_${normalizedAction}`);
          }
        });
      } catch (error) {
        if (!isMissingTableError(error, "userPermissions")) throw error;
        console.error("[Auth.me] userPermissions table is missing; returning role and stored permissions until migrations are applied:", error);
      }

      const customRoleId = (ctx.user as any).customRoleId;
      if (customRoleId) {
        try {
          const normalizedCustomRoleId = String(customRoleId).replace(/^custom_/, "");
          const [customRole] = await permissionDb
            .select({
              permissions: customRoles.permissions,
              baseRole: customRoles.baseRole,
            })
            .from(customRoles)
            .where(and(eq(customRoles.id, normalizedCustomRoleId), eq(customRoles.isActive, 1)))
            .limit(1);

          if (customRole?.permissions) {
            parsePermissions(customRole.permissions).forEach((permission) => effectivePermissions.add(permission));
          }
          (ctx.user as any).effectiveRole = customRole?.baseRole || (ctx.user as any).effectiveRole;
        } catch (error) {
          if (!isMissingTableError(error, "customRoles")) throw error;
          console.error("[Auth.me] customRoles table is missing; using the authenticated user's base role until migrations are applied:", error);
        }
      }
    } catch (error) {
      console.error("[Auth.me] Failed to resolve effective permissions:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unable to load your permissions. Please try again.",
        cause: error,
      });
    }

    const resolvedOrganizationId = (ctx.user as any).organizationId || await getUserOrganizationId((ctx.user as any).id, (ctx.user as any).email);
    let organization: any = null;
    if (resolvedOrganizationId) {
      try {
        organization = await db.getOrganization(resolvedOrganizationId);
      } catch (error) {
        console.warn('[Auth.me] Failed to load organization details:', error);
      }
    }

    const result = {
      ...ctx.user, 
      organizationId: resolvedOrganizationId || null,
      organizationSlug: (ctx.user as any).organizationSlug || organization?.slug || null,
      organizationUrlMode: (ctx.user as any).organizationUrlMode || organization?.urlMode || "subdomain",
      organizationName: (ctx.user as any).organizationName || organization?.name || null,
      customRoleId: (ctx.user as any).customRoleId || null,
      employeeId: (ctx.user as any).employeeId || null,
      effectiveRole: (ctx.user as any).effectiveRole || ctx.user.role,
      effectivePermissions: [...effectivePermissions],
    };
    console.log('[Auth.me] Returning user data for:', result.email, 'customRoleId:', result.customRoleId);
    return result;
  }),

  /**
   * Register new user
   */
  register: publicProcedure
    .input(registerInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const clientSettings = await db.getSettingsByCategory("clients_general");
        const clientSettingsMap: Record<string, string> = {};
        for (const row of clientSettings) {
          if (row.key) clientSettingsMap[row.key] = String(row.value ?? "");
        }
        if (!resolveClientRegistrationSetting(clientSettingsMap.allowRegistration)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "New client registrations are currently disabled.",
          });
        }

        // Check if user already exists
        const normalizedEmail = input.email.trim().toLowerCase();
        const existingUser = await getUserByEmail(normalizedEmail);
        if (existingUser) {
          const isUnverifiedLocalUser =
            (existingUser as any).loginMethod === "local" &&
            !(existingUser as any).emailVerified &&
            normalizedEmail !== "info@kiini.africa";

          if (isUnverifiedLocalUser) {
            const passwordHash = await hashPassword(input.password);
            await db.upsertUser({
              id: existingUser.id,
              email: normalizedEmail,
              name: input.name,
              loginMethod: "local",
              passwordHash,
              emailVerificationRequired: 1,
              failedLoginAttempts: 0,
              lockedUntil: null,
              lockoutCount: 0,
            } as any);
            await issueEmailVerification(existingUser.id, normalizedEmail, input.name);
            return {
              success: true,
              message: "This account is awaiting verification. A new verification code has been sent.",
              requiresEmailVerification: true,
              user: { id: existingUser.id, email: normalizedEmail, name: input.name, role: existingUser.role },
            };
          }

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email already registered",
          });
        }

        // Hash password
        const passwordHash = await hashPassword(input.password);

        // Ensure older installations have the verification flag before inserting the user.
        await ensureEmailVerificationTable();

        // Create user
        const userId = `user_${v4()}`;
        await db.upsertUser({
          id: userId,
          email: normalizedEmail,
          name: input.name,
          loginMethod: "local",
          emailVerificationRequired: 1,
          lastSignedIn: new Date().toISOString().replace('T', ' ').substring(0, 19),
        } as any);

        // Store password hash
        await db.setUserPassword(userId, passwordHash);

        // Handle organization creation/joining
        let userRole = "user";
        if (input.company && input.company.trim()) {
          const companyName = input.company.trim();
          const urlMode = input.urlMode ?? "subdomain";
          const slug = (input.slug || companyName)
            .toString()
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
          
          // Check if organization exists by slug
          let org = await db.getOrganizationBySlug(slug);
          
          if (org) {
            // Join existing organization as regular user
            await db.assignUserToOrganization(userId, org.id);
          } else {
            // Create new organization with trial plan, user becomes admin
            const orgId = `org_${Date.now()}`;
            const billingCycle = 'monthly'; // Default to monthly for signups
            let trialPricing: Record<string, Record<string, unknown>> = {};
            try {
              const pricingSetting = await db.getSetting('plan_prices');
              trialPricing = parseTierPricingOverrides(pricingSetting?.value);
            } catch { /* Keep the default trial cap if pricing settings are unavailable. */ }
            const trialMaxUsers = Number(resolveTierPricingEntry('trial', trialPricing).maxUsers ?? DEFAULT_TIER_PRICING.trial.maxUsers);
            
            await db.createOrganization({
              id: orgId,
              name: companyName,
              slug,
              urlMode,
              plan: 'trial',
              isActive: 1,
              maxUsers: trialMaxUsers,
              settings: { billingCycle },
            });
            await db.upsertUser({ id: userId, role: "super_admin" } as any);
            await db.assignUserToOrganization(userId, orgId);
            userRole = "super_admin";
            
            // Set default trial features
            const trialFeatures = ['crm', 'invoicing', 'reports'];
            for (const feature of trialFeatures) {
              await db.setOrganizationFeature(orgId, feature, true);
            }
            
            // Auto-create subscription for the organization
            try {
              const subscriptionId = `sub_${v4().replace(/-/g, '').slice(0, 20)}`;
              const now = new Date();
              const renewalDate = new Date();
              const trialDays = getConfiguredTrialDays(trialPricing);
              renewalDate.setDate(renewalDate.getDate() + trialDays);
              
              // Get trial plan to retrieve pricing
              const trialPlan = await db.getPricingPlan('trial');
              const price = (trialPlan as any)?.monthlyPrice || 0;
              
              await db.createSubscription({
                id: subscriptionId,
                organizationId: orgId,
                planId: 'trial',
                status: 'trial',
                billingCycle: 'monthly',
                startDate: now.toISOString().replace('T', ' ').substring(0, 19),
                renewalDate: renewalDate.toISOString().replace('T', ' ').substring(0, 19),
                currentPrice: price,
                autoRenew: 1,
              });
            } catch (error) {
              console.error('[Auth] Failed to create subscription during signup:', error);
              // Don't fail signup if subscription creation fails - log and continue
            }
          }
        }

        // Generate JWT token
        await issueEmailVerification(userId, normalizedEmail, input.name);

        return {
          success: true,
          message: "Registration successful. Verify your email to continue.",
          requiresEmailVerification: true,
          user: {
            id: userId,
            email: normalizedEmail,
            name: input.name,
            role: userRole,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error('[Auth.register] Registration failed:', error);
        if (error instanceof Error && /email delivery|SMTP|send email/i.test(error.message)) {
          throw new TRPCError({
            code: "SERVICE_UNAVAILABLE",
            message: "Your account was created, but the verification email could not be sent. Please use resend verification after email delivery is configured.",
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Registration failed",
        });
      }
    }),

  verifyEmail: publicProcedure
    .input(z.object({
      email: z.preprocess((value) => typeof value === "string" ? value.trim() : value, z.string().optional()),
      otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code").optional(),
      token: z.string().trim().min(1).optional(),
    }).superRefine((data, ctx) => {
      const hasToken = Boolean(data.token && data.token.trim().length > 0);
      const hasOtp = Boolean(data.otp && /^\d{6}$/.test(data.otp));
      const hasValidEmail = Boolean(data.email && z.string().email().safeParse(data.email).success);

      if (hasToken) return;
      if (!hasOtp) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "A valid email and verification code or link token is required",
        });
        return;
      }

      if (!hasValidEmail) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "A valid email and verification code or link token is required",
        });
      }
    }))
    .mutation(async ({ ctx, input }) => {
      let userId: string | null = null;
      let pool: Awaited<ReturnType<typeof ensureEmailVerificationTable>> | null = null;

      if (input.token) {
        try {
          const payload = await verifyJWT(input.token);
          userId = payload.userId;
        } catch {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired verification link" });
        }
      } else if (input.otp) {
        pool = await ensureEmailVerificationTable();
        const sessionUserId = (ctx as any)?.user?.id ?? null;
        const normalizedEmail = input.email?.trim().toLowerCase() ?? null;

        let verification: any = null;

        if (normalizedEmail) {
          const [rows] = await pool.query(
            "SELECT id, userId FROM email_verification_tokens WHERE newEmail = ? AND token = ? AND verifiedAt IS NULL AND expiresAt > NOW() ORDER BY createdAt DESC LIMIT 1",
            [normalizedEmail, hashEmailOtp(input.otp)]
          );
          verification = (rows as any[])[0];
        }

        if (!verification && sessionUserId) {
          const [rows] = await pool.query(
            "SELECT id, userId, newEmail FROM email_verification_tokens WHERE userId = ? AND token = ? AND verifiedAt IS NULL AND expiresAt > NOW() ORDER BY createdAt DESC LIMIT 1",
            [sessionUserId, hashEmailOtp(input.otp)]
          );
          verification = (rows as any[])[0];
        }

        if (!verification) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired verification code" });
        userId = verification.userId;
        await pool.query("UPDATE email_verification_tokens SET verifiedAt = NOW() WHERE id = ?", [verification.id]);
      }

      if (!userId) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired verification request" });

      pool ??= await ensureEmailVerificationTable();
      await pool.query("UPDATE users SET emailVerified = NOW(), emailVerificationRequired = 0 WHERE id = ?", [userId]);
      const token = await generateJWT(userId);
      ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: ONE_YEAR_MS });
      const verifiedUser = await getUserById(userId);
      if (verifiedUser) {
        const verifiedEmail = verifiedUser.email || input.email || "";
        const loginUrl = `${ctx.req.protocol}://${ctx.req.get('host')}/login`;
        void sendSystemEmail(
          "user/welcome",
          {
            recipientEmail: verifiedEmail,
            recipientName: verifiedUser.name || verifiedEmail,
            recipient_first_name: verifiedUser.name || verifiedEmail,
            recipient_email: verifiedEmail,
            app_name: "Kiini",
            login_url: loginUrl,
          },
          {
            subject: "Welcome to Kiini",
            html: `<p>Welcome to Kiini. <a href="${loginUrl}">Sign in</a> to continue.</p>`,
            text: `Welcome to Kiini. Sign in here: ${loginUrl}`,
          },
        ).catch((error) => console.error("[Auth] Welcome email delivery failed:", error));
      }
      return { success: true, token, user: verifiedUser, message: "Email verified successfully" };
    }),

  resendEmailVerification: publicProcedure
    .input(z.object({
      email: z.preprocess((value) => typeof value === "string" ? value.trim().replace(/\s+/g, "+") : value, z.string().email().optional()),
    }))
    .mutation(async ({ ctx, input }) => {
      const normalizedEmail = input.email?.trim().toLowerCase();
      let user = normalizedEmail ? await getUserByEmail(normalizedEmail) : null;

      if (!user && (ctx as any)?.user?.id) {
        user = await getUserById((ctx as any).user.id);
      }

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "A valid email address is required to resend the verification email.",
        });
      }

      if ((user as any).loginMethod === "local" && (user as any).emailVerificationRequired !== 0 && !(user as any).emailVerified) {
        try {
          await issueEmailVerification(user.id, (user.email || normalizedEmail || "").trim().toLowerCase(), user.name || user.email || "user");
        } catch (error: any) {
          console.error("[Auth] Verification email delivery failed:", error?.message || error);
          return {
            success: false,
            message: "The verification email could not be sent. Please ask an administrator to check the SMTP settings.",
          };
        }
      }
      return { success: true, message: "If the account requires verification, a new code has been sent." };
    }),

  /**
   * Login with email and password
   */
  login: publicProcedure
    .input(loginInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const normalizedEmail = input.email.trim().toLowerCase();
        console.log('[Auth.login] Attempting login for:', normalizedEmail);
        
        // rate limit per IP (basic endpoint-specific limit)
        const ip = ctx.req.ip || 'unknown';
        if (!checkRateLimit(ip, 'login', 20, 60 * 60 * 1000)) {
          console.log('[Auth.login] Rate limit exceeded for IP:', ip);
          throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Too many login attempts, try again later' });
        }

        // Find user by email
        const user = await getUserByEmail(normalizedEmail);
        console.log('[Auth.login] User lookup result:', { email: normalizedEmail, found: !!user, userId: user?.id });

        // persistent lockout check if user exists
        if (user) {
          const dbLockedUntil = user.lockedUntil ? new Date(user.lockedUntil).getTime() : 0;
          if (dbLockedUntil && Date.now() < dbLockedUntil) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: Number(user.lockoutCount || 0) >= 2
                ? "Account locked. A password reset OTP has been sent to your email."
                : "Account temporarily locked for 1 minute due to failed login attempts.",
            });
          }
        }

        // Get or create lockInfo for this email (used throughout password checks)
        let lockInfo = lockStore.get(normalizedEmail) || { attempts: Number((user as any)?.failedLoginAttempts || 0), lockouts: Number((user as any)?.lockoutCount || 0) };

        if (!user) {
          // increment failed attempts for unknown email as well (optional)
          lockInfo.attempts += 1;
          lockStore.set(normalizedEmail, lockInfo);

          void db.logActivity({
            userId: 'unknown',
            action: 'login_failed',
            entityType: 'auth',
            entityId: normalizedEmail,
            description: `Failed login attempt for non-existent user ${normalizedEmail}`,
          }).catch((error) => console.warn('[Auth.login] Failed to record login failure:', error));

          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        if (user.isActive === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "This account is inactive. Contact your administrator.",
          });
        }

        // Verify password
        const passwordHash = user.passwordHash;
        console.log('[Auth.login] Password hash lookup:', { userId: user.id, hashExists: !!passwordHash, hashLength: passwordHash?.length });
        if (!passwordHash) {
          const failure = await recordFailedLogin(user, normalizedEmail, ctx.req.ip);

          await db.logActivity({
            userId: user.id,
            action: 'login_failed',
            entityType: 'auth',
            entityId: user.id,
            description: `Failed login attempt (no password) for user ${user.email}`,
          });

          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        const isPasswordValid = await verifyPassword(input.password, passwordHash);
        console.log('[Auth.login] Password verification:', { email: normalizedEmail, isValid: isPasswordValid });
        if (!isPasswordValid) {
          const failure = await recordFailedLogin(user, normalizedEmail, ctx.req.ip);

          void db.logActivity({
            userId: user.id,
            action: 'login_failed',
            entityType: 'auth',
            entityId: user.id,
            description: `Invalid password attempt for user ${user.email}`,
          }).catch((error) => console.warn('[Auth.login] Failed to record login failure:', error));

          throw new TRPCError({
            code: failure.locked ? "FORBIDDEN" : "UNAUTHORIZED",
            message: failure.resetRequired
              ? "Account locked. A password reset OTP has been sent to your email."
              : failure.locked
                ? "Account temporarily locked for 1 minute due to failed login attempts."
                : "Invalid email or password",
          });
        }

        const reminderUser = user as any;
        const hasPendingVerification = shouldShowEmailVerificationReminder(reminderUser);
        if (hasPendingVerification) {
          console.log("[Auth.login] Local user signed in with pending email verification.", { userId: user.id, email: user.email });
          try {
            await issueEmailVerification(user.id, normalizedEmail, user.name || normalizedEmail);
          } catch (error) {
            console.warn('[Auth.login] Email verification reminder failed; continuing login:', error);
          }
        }

        // Check subscription status - CRITICAL: Lock if overdue
        try {
          const pool = getPool() || await getRawPool();
          let userClient: any = null;
          let subscription: any = null;
          if (pool) {
            const [clientRows] = await pool.execute(
              "SELECT * FROM clients WHERE createdBy = ? LIMIT 1",
              [user.id],
            );
            userClient = (clientRows as any[])[0] || null;
            if (userClient) {
              const [subscriptionRows] = await pool.execute(
                "SELECT * FROM subscriptions WHERE clientId = ? ORDER BY createdAt DESC LIMIT 1",
                [userClient.id],
              );
              subscription = (subscriptionRows as any[])[0] || null;
            }
          } else {
            userClient = await db.getClientByCreatedBy(user.id);
            if (userClient) subscription = await db.getClientSubscription(userClient.id);
          }
          if (userClient) {
            if (subscription && (subscription as any).isLocked) {
              await db.logActivity({
                userId: user.id,
                action: 'login_blocked',
                entityType: 'auth',
                entityId: user.id,
                description: `Login blocked - subscription locked for client ${userClient.id}`,
              });

              throw new TRPCError({
                code: "FORBIDDEN",
                message: "Your subscription has been locked due to overdue payment. Please update your payment to continue.",
                cause: "subscription_locked",
              });
            }
          }
        } catch (subError: any) {
          if (subError.code === 'FORBIDDEN') throw subError;
          console.warn('[Auth] Subscription check warning:', subError);
          // Don't block login on subscription check failure, just log it
        }

        if ((user as any).twoFactorEnabled) {
          return {
            success: true,
            requires2FA: true,
            message: "Two-factor authentication required",
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              customRoleId: (user as any).customRoleId || null,
              organizationId: user.organizationId || null,
            },
          };
        }

        // Check if password change is required (first login)
        if ((user as any).requiresPasswordChange) {
          // Generate JWT token but flag for password change
          const token = await generateJWT(user.id);

          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, token, {
            ...cookieOptions,
            maxAge: ONE_YEAR_MS,
          });

          return {
            success: true,
            requiresPasswordChange: true,
            message: "Password change required on first login",
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              customRoleId: (user as any).customRoleId || null,
            },
            token,
          };
        }

        // reset on success
        lockStore.delete(normalizedEmail);
        // clear persistent lockout
        try {
          const pool = getPool() || await getRawPool();
          if (pool) {
            await pool.execute(
              "UPDATE users SET failedLoginAttempts = 0, lockedUntil = NULL, lockoutCount = 0 WHERE id = ?",
              [user.id],
            );
          } else {
            await updateUserFromDbUsers(user.id, { failedLoginAttempts: 0, lockedUntil: null, lockoutCount: 0 } as any);
          }
        } catch (error) {
          console.warn('[Auth.login] Failed to reset persistent login lockout; continuing login:', error);
        }

        void db.logActivity({
          userId: user.id,
          action: 'login_success',
          entityType: 'auth',
          entityId: user.id,
          description: `User ${user.email} logged in successfully`,
        }).catch((error) => console.warn('[Auth.login] Failed to record successful login:', error));

        // Update last signed in
        try {
          void db.upsertUser({
            id: user.id,
            lastSignedIn: new Date().toISOString().replace('T', ' ').substring(0, 19),
          }).catch((error) => console.warn('[Auth.login] Failed to update lastSignedIn:', error));
        } catch (error) {
          console.warn('[Auth.login] Failed to update lastSignedIn; continuing login:', error);
        }

        // Generate JWT token
        const token = await generateJWT(user.id);

        // Set cookie with proper options for Docker/production
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        // Resolve legacy memberships when users.organizationId is empty.
        const resolvedOrganizationId = user.organizationId || await getUserOrganizationId(user.id, user.email);

        // Fetch organization info if user belongs to an org
        let org = null;
        if (resolvedOrganizationId) {
          try {
            org = await db.getOrganization(resolvedOrganizationId);
          } catch (error) {
            console.warn('[Auth.login] Failed to load organization details; continuing login:', error);
          }
        }

        return {
          success: true,
          message: "Login successful",
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            clientId: (user as any).clientId || null,
            customRoleId: (user as any).customRoleId || null,
            organizationId: resolvedOrganizationId || null,
            organizationSlug: org?.slug || null,
            organizationUrlMode: org?.urlMode || "subdomain",
            organizationName: org?.name || null,
            emailVerificationRequired: (user as any).emailVerificationRequired ?? 0,
            emailVerified: (user as any).emailVerified ?? null,
            requiresPasswordChange: Boolean((user as any).requiresPasswordChange),
          },
          // Return token for localStorage fallback
          token,
        };
      } catch (error) {
  console.error("[Login Error]", error);
  if (error instanceof TRPCError) throw error;
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Login failed",
  });
}
    }),

  /**
   * Logout
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }),

  /**
   * Update user profile
   */
  updateProfile: userEditProcedure
    .input(updateProfileInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id;
        const updateData: any = {};

        if (input.name) updateData.name = input.name;
        if (input.email) updateData.email = input.email;

        if (Object.keys(updateData).length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No fields to update",
          });
        }

        await db.updateUser(userId, updateData);
        return {
          success: true,
          message: "Profile updated successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }
    }),

  /**
   * Change password
   */
  changePassword: userEditProcedure
    .input(changePasswordInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id;

        // Verify current password
        const passwordHash = await db.getUserPassword(userId);
        if (!passwordHash) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Current password is incorrect",
          });
        }

        const isPasswordValid = await verifyPassword(
          input.currentPassword,
          passwordHash
        );
        if (!isPasswordValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Current password is incorrect",
          });
        }

        // Hash new password
        const newPasswordHash = await hashPassword(input.newPassword);
        await db.setUserPassword(userId, newPasswordHash);

        return {
          success: true,
          message: "Password changed successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to change password",
        });
      }
    }),

  /**
   * Update notification preferences
   */
  updateNotificationPreferences: userEditProcedure
    .input(
      z.object({
        emailNotifications: z.boolean().optional(),
        smsNotifications: z.boolean().optional(),
        payrollAlerts: z.boolean().optional(),
        invoiceAlerts: z.boolean().optional(),
        paymentReminders: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id;
        
        // Store preferences in a settings table or user table
        // For now, we'll just return success (can be extended)
        await db.updateUser(userId, {
          preferences: JSON.stringify(input),
        } as any);

        return {
          success: true,
          message: "Notification preferences updated successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update notification preferences",
        });
      }
    }),

  /**
   * Request password reset
   */
  requestPasswordReset: publicProcedure
    .input(requestPasswordResetInput)
    .mutation(async ({ ctx, input }) => {
      // per-IP rate limit for reset requests
      const ip = ctx.req.ip || 'unknown';
      if (!checkRateLimit(ip, 'password_reset_request', 5, 60 * 60 * 1000)) {
        throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Too many password reset requests, try again later' });
      }

      try {
        const user = await getUserByEmail(input.email.trim().toLowerCase());
        if (!user) {
          // Don't reveal if email exists for security
          return {
            success: true,
            message: "If email exists, a password reset code will be sent",
          };
        }

        await db.logActivity({
          userId: user.id,
          action: 'password_reset_requested',
          entityType: 'auth',
          entityId: user.id,
          description: `Password reset requested for ${user.email}`,
        });

        try {
          await issuePasswordResetOtp(user.id, user.email, user.name || user.email);
        } catch (emailError) {
          console.error('[Auth] Failed to send password reset OTP:', emailError);
        }

        return {
          success: true,
          message: "If email exists, a password reset code will be sent",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process password reset request",
        });
      }
    }),

  verifyPasswordResetOtp: publicProcedure
    .input(z.object({ email: z.string().email(), otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code") }))
    .mutation(async ({ input }) => {
      const pool = await ensureEmailVerificationTable();
      const normalizedEmail = input.email.trim().toLowerCase();
      const [rows] = await pool.query(
        "SELECT id, userId FROM password_reset_otps WHERE email = ? AND otpHash = ? AND verifiedAt IS NULL AND expiresAt > NOW() ORDER BY createdAt DESC LIMIT 1",
        [normalizedEmail, hashEmailOtp(input.otp)],
      );
      const otp = (rows as any[])[0];
      if (!otp) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired password reset code" });

      await pool.query("UPDATE password_reset_otps SET verifiedAt = NOW() WHERE id = ?", [otp.id]);
      const token = await generateJWT(otp.userId, 60 * 60 * 1000);
      await db.setPasswordResetToken(otp.userId, token);
      return { success: true, token, message: "Email confirmed. You may now set a new password." };
    }),

  /**
   * Reset password with token
   */
  resetPassword: publicProcedure
    .input(resetPasswordInput)
    .mutation(async ({ ctx, input }) => {
      // rate limit to prevent brute-force resetting
      const ip = ctx.req.ip || 'unknown';
      if (!checkRateLimit(ip, 'password_reset', 10, 60 * 60 * 1000)) {
        throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Too many attempts, try again later' });
      }
      try {
        // Prefer the persisted reset token so links remain valid across app restarts
        // and JWT secret rotation. Fall back to JWT for older reset links.
        const resetPool = getPool();
        let userId: string | null = null;
        if (resetPool) {
          const [tokenRows] = await resetPool.query(
            "SELECT id FROM users WHERE passwordResetToken = ? AND passwordResetExpiresAt IS NOT NULL AND passwordResetExpiresAt > NOW() LIMIT 1",
            [input.token],
          );
          userId = (tokenRows as Array<{ id: string }>)[0]?.id || null;
        }
        if (!userId) {
          const payload = await verifyJWT(input.token);
          userId = payload.userId;
        }

        // Verify token is valid reset token
        const storedToken = await db.getPasswordResetToken(userId);
        if (storedToken !== input.token) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid or expired reset token",
          });
        }

        // Hash new password
        const passwordHash = await hashPassword(input.newPassword);
        await db.setUserPassword(userId, passwordHash);

        // Clear reset token
        await db.clearPasswordResetToken(userId);
        await updateUserFromDbUsers(userId, { failedLoginAttempts: 0, lockedUntil: null, lockoutCount: 0 } as any);

        const resetUser = await getUserById(userId);
        if (resetUser?.email) {
          const baseUrl = (process.env.APP_URL || process.env.PUBLIC_APP_URL || "https://kiini.africa").replace(/\/$/, "");
          void sendSystemEmail("user/password_changed", {
            recipientEmail: resetUser.email,
            recipientName: resetUser.name || resetUser.email,
            recipient_first_name: resetUser.name?.trim().split(/\s+/)[0] || resetUser.email,
            recipient_email: resetUser.email,
            organizationId: resetUser.organizationId,
            app_name: "Kiini",
            changed_at: new Date().toLocaleString(),
            ip_address: ctx.req.ip || "Not available",
            location: "Not available",
            device_info: ctx.req.get("user-agent") || "Not available",
            reset_link: `${baseUrl}/login`,
          }, {
            subject: "Your Kiini password was changed",
            html: "<p>Your password was reset successfully.</p>",
            text: "Your password was reset successfully.",
          }).catch((error) => console.error("[Auth] Password reset confirmation email failed:", error));
        }

        await db.logActivity({
          userId,
          action: 'password_reset',
          entityType: 'auth',
          entityId: userId,
          description: `Password reset completed for user ${userId}`,
        });

        return {
          success: true,
          message: "Password reset successfully",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid or expired reset token",
        });
      }
    }),

  confirm2FA: userEditProcedure
    .input(z.object({ code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code") }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id;
        const user = await getUserByEmail(ctx.user.email);
        if (!user || !(user as any).twoFactorSecret) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "2FA setup is not active for this account." });
        }

        const verification = await (verify as any)({
          secret: (user as any).twoFactorSecret,
          token: input.code,
          window: 1,
        });
        const isValid = verification?.valid === true;

        if (!isValid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid authentication code" });
        }

        await db.updateUser(userId, {
          twoFactorEnabled: true,
          twoFactorSecret: (user as any).twoFactorSecret,
        } as any);

        await db.logActivity({
          userId,
          action: '2fa_enabled',
          entityType: 'auth',
          entityId: userId,
          description: `2FA enabled for user ${ctx.user.email}`,
        });

        return {
          success: true,
          message: "Two-factor authentication enabled for your account.",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to confirm 2FA",
        });
      }
    }),

  /**
   * Enable two-factor authentication
   */
  enable2FA: userEditProcedure.mutation(async ({ ctx }) => {
    try {
      const userId = ctx.user.id;
      const { secret, otpauthUri, qrCode } = await generateTotpSetup(ctx.user.email);
      await db.updateUser(userId, {
        twoFactorEnabled: false,
        twoFactorSecret: secret,
      } as any);

      await db.logActivity({
        userId,
        action: '2fa_setup_initiated',
        entityType: 'auth',
        entityId: userId,
        description: `2FA setup initiated for user ${ctx.user.email}`,
      });

      return {
        success: true,
        secret,
        otpauthUri,
        qrCode,
        message: "2FA setup initiated. Scan QR code with an authenticator app.",
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to enable 2FA",
      });
    }
  }),

  verifyLogin2FA: publicProcedure
    .input(z.object({ email: z.string().email(), code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code") }))
    .mutation(async ({ ctx, input }) => {
      const normalizedEmail = input.email.trim().toLowerCase();
      const user = await getUserByEmail(normalizedEmail);
      if (!user || !(user as any).twoFactorEnabled || !(user as any).twoFactorSecret) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Two-factor authentication is not enabled for this account." });
      }

      const verification = await (verify as any)({
        secret: (user as any).twoFactorSecret,
        token: input.code,
        window: 1,
      });
      const isValid = verification?.valid === true;

      if (!isValid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid authentication code" });
      }

      await updateUserFromDbUsers(user.id, { failedLoginAttempts: 0, lockedUntil: null, lockoutCount: 0 } as any);
      lockStore.delete(normalizedEmail);

      const token = await generateJWT(user.id);
      ctx.res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(ctx.req), maxAge: ONE_YEAR_MS });

      const organizationId = user.organizationId || await getUserOrganizationId(user.id, user.email);
      let organization: any = null;
      if (organizationId) {
        try {
          organization = await db.getOrganization(organizationId);
        } catch (error) {
          console.warn('[Auth.verifyLogin2FA] Failed to load organization details:', error);
        }
      }

      return {
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          clientId: (user as any).clientId || null,
          customRoleId: (user as any).customRoleId || null,
          organizationId: organizationId || null,
          organizationSlug: organization?.slug || null,
          organizationUrlMode: organization?.urlMode || "subdomain",
          organizationName: organization?.name || null,
        },
      };
    }),

  /**
   * Disable two-factor authentication
   */
  disable2FA: userEditProcedure
    .input(z.object({ password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id;

        // Verify password
        const passwordHash = await db.getUserPassword(userId);
        if (!passwordHash) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Failed to verify password",
          });
        }

        const isPasswordValid = await verifyPassword(input.password, passwordHash);
        if (!isPasswordValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid password",
          });
        }

        await db.updateUser(userId, {
          twoFactorEnabled: false,
          twoFactorSecret: null,
        } as any);

        await db.logActivity({
          userId,
          action: '2fa_disabled',
          entityType: 'auth',
          entityId: userId,
          description: `2FA disabled for user ${ctx.user.email}`,
        });

        return {
          success: true,
          message: "Two-factor authentication disabled",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to disable 2FA",
        });
      }
    }),

  /**
   * Get active sessions
   */
  getSessions: createFeatureRestrictedProcedure("auth:sessions").query(async ({ ctx }) => {
    try {
      const userId = ctx.user.id;

      // Return current session info
      // In a real implementation, track sessions in DB
      return [
        {
          id: "current",
          device: "Chrome on Windows",
          location: "Unknown",
          lastActive: new Date().toISOString(),
          createdAt: ctx.user.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 19),
          current: true,
        },
      ];
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch sessions",
      });
    }
  }),

  /**
   * Logout from all sessions
   */
  logoutAllSessions: createFeatureRestrictedProcedure("auth:sessions").mutation(async ({ ctx }) => {
    try {
      const userId = ctx.user.id;

      await db.logActivity({
        userId,
        action: 'logout_all_sessions',
        entityType: 'auth',
        entityId: userId,
        description: `User logged out from all sessions`,
      });

      return { success: true, message: "Logged out from all sessions" };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to logout from all sessions",
      });
    }
  }),

  /**
   * Export user data
   */
  exportUserData: createFeatureRestrictedProcedure("auth:export_user_data").query(async ({ ctx }) => {
    try {
      const userId = ctx.user.id;
      const user = await db.getUser(userId);

      const userData = {
        profile: {
          id: user?.id,
          email: user?.email,
          name: user?.name,
          role: user?.role,
          createdAt: user?.createdAt,
        },
        exportedAt: new Date().toISOString(),
      };

      await db.logActivity({
        userId,
        action: 'data_export_requested',
        entityType: 'auth',
        entityId: userId,
        description: `User requested data export`,
      });

      return userData;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to export user data",
      });
    }
  }),

  /**
   * Request account deletion
   */
  requestAccountDeletion: userEditProcedure
    .input(z.object({ password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.user.id;

        // Verify password
        const passwordHash = await db.getUserPassword(userId);
        if (!passwordHash) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Failed to verify password",
          });
        }

        const isPasswordValid = await verifyPassword(input.password, passwordHash);
        if (!isPasswordValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid password",
          });
        }

        await db.logActivity({
          userId,
          action: 'account_deletion_requested',
          entityType: 'auth',
          entityId: userId,
          description: `User requested account deletion. Will be deleted in 30 days.`,
        });

        return {
          success: true,
          message: "Account deletion requested. Your account will be deleted in 30 days.",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to request account deletion",
        });
      }
    }),

  getCsrfToken: publicProcedure.query(({ ctx }) => {
      return { csrfToken: null };
    }),
});
